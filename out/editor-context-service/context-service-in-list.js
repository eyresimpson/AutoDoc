'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextServiceEditorInList = void 0;
const i_context_service_1 = require("./i-context-service");
class ContextServiceEditorInList extends i_context_service_1.AbsContextService {
    constructor() {
        super(...arguments);
        this.contextName = "markdown.extension.editor.cursor.inList";
    }
    onActivate(_context) {
        // set initial state of context
        this.setState(false);
    }
    dispose() { }
    onDidChangeActiveTextEditor(document, cursorPos) {
        this.updateContextState(document, cursorPos);
    }
    onDidChangeTextEditorSelection(document, cursorPos) {
        this.updateContextState(document, cursorPos);
    }
    updateContextState(document, cursorPos) {
        let lineText = document.lineAt(cursorPos.line).text;
        let inList = /^\s*([-+*]|[0-9]+[.)]) +(\[[ x]\] +)?/.test(lineText);
        if (inList) {
            this.setState(true);
        }
        else {
            this.setState(false);
        }
        return;
    }
}
exports.ContextServiceEditorInList = ContextServiceEditorInList;
//# sourceMappingURL=context-service-in-list.js.map