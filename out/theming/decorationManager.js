"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorationManager = void 0;
const vscode = require("vscode");
const manager_1 = require("../configuration/manager");
const generic_1 = require("../util/generic");
const constant_1 = require("./constant");
const decorationWorkerRegistry_1 = require("./decorationWorkerRegistry");
class DecorationAnalysisTask {
    constructor(document, workers, targets) {
        this._result = undefined;
        this.document = document;
        const token = (this._cts = new vscode.CancellationTokenSource()).token;
        // The weird nesting is to defer the task creation to reduce runtime cost.
        // The outermost is a so-called "cancellable promise".
        // If you create a task and cancel it immediately, this design guarantees that most workers are not called.
        // Otherwise, you will observe thousands of discarded microtasks quickly.
        this.executor = new Promise((resolve, reject) => {
            token.onCancellationRequested(reject);
            if (token.isCancellationRequested) {
                reject();
            }
            resolve(Promise.all(targets.map(target => workers[target](document, token))));
        })
            .then(result => this._result = result) // Copy the result and pass it down.
            .catch(reason => {
            // We'll adopt `vscode.CancellationError` when it matures.
            // For now, falsy indicates cancellation, and we won't throw an exception for that.
            if (reason) {
                throw reason;
            }
        });
    }
    get result() {
        return this._result;
    }
    get state() {
        if (this._cts.token.isCancellationRequested) {
            return 2 /* Cancelled */;
        }
        else if (this._result) {
            return 1 /* Fulfilled */;
        }
        else {
            return 0 /* Pending */;
        }
    }
    cancel() {
        this._cts.cancel();
        this._cts.dispose();
    }
}
/**
 * Represents a text editor decoration manager.
 *
 * For reliability reasons, do not leak any mutable content out of the manager.
 *
 * VS Code does not define a corresponding `*Provider` interface, so we implement it ourselves.
 * The following scenarios are considered:
 *
 * * Activation.
 * * Opening a document with/without corresponding editors.
 * * Changing a document.
 * * Closing a document.
 * * Closing a Markdown editor, and immediately switching to an arbitrary editor.
 * * Switching between arbitrary editors, including Markdown to Markdown.
 * * Changing configuration after a decoration analysis task started.
 * * Deactivation.
 */
class DecorationManager {
    constructor(workers) {
        /**
         * Decoration type instances **currently in use**.
         */
        this._decorationHandles = new Map();
        /**
         * Decoration analysis tasks **currently in use**.
         * This serves as both a task pool, and a result cache.
         */
        this._tasks = new Map();
        this._decorationWorkers = Object.assign(Object.create(null), workers);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_Accessors#property_names
        this._supportedClasses = Object.keys(workers).map(Number);
        // Here are many different kinds of calls. Bind `this` context carefully.
        // Load all.
        vscode.workspace.textDocuments.forEach(this.updateCache, this);
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.applyDecoration(activeEditor);
        }
        // Register event listeners.
        this._disposables = [
            vscode.workspace.onDidOpenTextDocument(this.updateCache, this),
            vscode.workspace.onDidChangeTextDocument(event => {
                this.updateCache(event.document);
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor && activeEditor.document === event.document) {
                    this.applyDecoration(activeEditor);
                }
            }),
            vscode.workspace.onDidCloseTextDocument(this.collectGarbage, this),
            vscode.window.onDidChangeActiveTextEditor(editor => { if (editor) {
                this.applyDecoration(editor);
            } }),
        ];
    }
    dispose() {
        // Unsubscribe event listeners.
        for (const disposable of this._disposables) {
            disposable.dispose();
        }
        this._disposables.length = 0;
        // Stop rendering.
        if (this._displayDebounceHandle) {
            this._displayDebounceHandle.cancel();
            this._displayDebounceHandle.dispose();
        }
        this._displayDebounceHandle = undefined;
        // Terminate tasks.
        for (const task of this._tasks.values()) {
            task.cancel();
        }
        this._tasks.clear();
        // Remove decorations.
        for (const handle of this._decorationHandles.values()) {
            handle.dispose();
        }
        this._decorationHandles.clear();
    }
    /**
     * Applies a set of decorations to the text editor asynchronously.
     *
     * This method is expected to be started frequently on volatile state.
     * It begins with a short sync part, to make immediate response to event possible.
     * Then, it internally creates an async job, to keep data access correct.
     * It stops silently, if any condition is not met.
     *
     * For performance reasons, it only works on the **active** editor (not visible editors),
     * although VS Code renders decorations as long as the editor is visible.
     * Besides, we have a threshold to stop analyzing large documents.
     * When it is reached, related task will be unavailable, thus by design, this method will quit.
     */
    applyDecoration(editor) {
        if (!(0, generic_1.isMdDocument)(editor.document)) {
            return;
        }
        const document = editor.document;
        // The task can be in any state (typically pending, fulfilled, obsolete) during this call.
        // The editor can be suspended or even disposed at any time.
        // Thus, we have to check at each stage.
        const task = this._tasks.get(document);
        if (!task || task.state === 2 /* Cancelled */) {
            return;
        }
        // Discard the previous operation, in case the user is switching between editors fast.
        // Although I don't think a debounce can make much value.
        if (this._displayDebounceHandle) {
            this._displayDebounceHandle.cancel();
            this._displayDebounceHandle.dispose();
        }
        const debounceToken = (this._displayDebounceHandle = new vscode.CancellationTokenSource()).token;
        // Queue the display refresh job.
        (async () => {
            if (task.state === 0 /* Pending */) {
                await task.executor;
            }
            if (task.state !== 1 /* Fulfilled */ || debounceToken.isCancellationRequested) {
                return;
            }
            const results = task.result;
            for (const { ranges, target } of results) {
                let handle = this._decorationHandles.get(target);
                // Recheck applicability, since the user may happen to change settings.
                if (manager_1.configManager.get(constant_1.decorationClassConfigMap[target])) {
                    // Create a new decoration type instance if needed.
                    if (!handle) {
                        handle = vscode.window.createTextEditorDecorationType(constant_1.decorationStyles[target]);
                        this._decorationHandles.set(target, handle);
                    }
                }
                else {
                    // Remove decorations if the type is disabled.
                    if (handle) {
                        handle.dispose();
                        this._decorationHandles.delete(target);
                    }
                    continue;
                }
                if (debounceToken.isCancellationRequested
                    || task.state !== 1 /* Fulfilled */ // Confirm the cache is still up-to-date.
                    || vscode.window.activeTextEditor !== editor // Confirm the editor is still active.
                ) {
                    return;
                }
                // Create a shallow copy for VS Code to use. This operation shouldn't cost much.
                editor.setDecorations(handle, Array.from(ranges));
            }
        })();
    }
    /**
     * Terminates tasks that are linked to the document, and frees corresponding resources.
     */
    collectGarbage(document) {
        const task = this._tasks.get(document);
        if (task) {
            task.cancel();
            this._tasks.delete(document);
        }
    }
    /**
     * Initiates and **queues** a decoration cache update task that is linked to the document.
     */
    updateCache(document) {
        if (!(0, generic_1.isMdDocument)(document)) {
            return;
        }
        // Discard previous tasks. Effectively mark existing cache as obsolete.
        this.collectGarbage(document);
        // Stop if the document exceeds max length.
        // The factor is for compatibility. There should be new logic someday.
        if (document.getText().length * 1.5 > manager_1.configManager.get("syntax.decorationFileSizeLimit")) {
            return;
        }
        // Create the new task.
        this._tasks.set(document, new DecorationAnalysisTask(document, this._decorationWorkers, 
        // No worry. `applyDecoration()` should recheck applicability.
        this._supportedClasses.filter(target => manager_1.configManager.get(constant_1.decorationClassConfigMap[target]))));
    }
}
exports.decorationManager = new DecorationManager(decorationWorkerRegistry_1.default);
//# sourceMappingURL=decorationManager.js.map