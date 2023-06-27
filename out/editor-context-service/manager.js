'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextServiceManager = exports.ContextServiceManager = void 0;
const vscode_1 = require("vscode");
const context_service_in_list_1 = require("./context-service-in-list");
const context_service_in_fenced_code_block_1 = require("./context-service-in-fenced-code-block");
const context_service_in_math_env_1 = require("./context-service-in-math-env");
class ContextServiceManager {
    constructor() {
        this.contextServices = [];
        // push context services
        this.contextServices.push(new context_service_in_list_1.ContextServiceEditorInList());
        this.contextServices.push(new context_service_in_fenced_code_block_1.ContextServiceEditorInFencedCodeBlock());
        this.contextServices.push(new context_service_in_math_env_1.ContextServiceEditorInMathEn());
    }
    activate(context) {
        for (const service of this.contextServices) {
            service.onActivate(context);
        }
        // subscribe update handler for context
        context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(() => this.onDidChangeActiveTextEditor()), vscode_1.window.onDidChangeTextEditorSelection(() => this.onDidChangeTextEditorSelection()));
        // initialize context state
        this.onDidChangeActiveTextEditor();
    }
    dispose() {
        while (this.contextServices.length > 0) {
            const service = this.contextServices.pop();
            service.dispose();
        }
    }
    onDidChangeActiveTextEditor() {
        const editor = vscode_1.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }
        const cursorPos = editor.selection.start;
        const document = editor.document;
        for (const service of this.contextServices) {
            service.onDidChangeActiveTextEditor(document, cursorPos);
        }
    }
    onDidChangeTextEditorSelection() {
        const editor = vscode_1.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }
        const cursorPos = editor.selection.start;
        const document = editor.document;
        for (const service of this.contextServices) {
            service.onDidChangeTextEditorSelection(document, cursorPos);
        }
    }
}
exports.ContextServiceManager = ContextServiceManager;
exports.contextServiceManager = new ContextServiceManager();
//# sourceMappingURL=manager.js.map