'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextServiceEditorInFencedCodeBlock = void 0;
const i_context_service_1 = require("./i-context-service");
const contextCheck_1 = require("../util/contextCheck");
class ContextServiceEditorInFencedCodeBlock extends i_context_service_1.AbsContextService {
    constructor() {
        super(...arguments);
        this.contextName = "markdown.extension.editor.cursor.inFencedCodeBlock";
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
        if ((0, contextCheck_1.isInFencedCodeBlock)(document, cursorPos.line)) {
            this.setState(true);
        }
        else {
            this.setState(false);
        }
        return;
    }
}
exports.ContextServiceEditorInFencedCodeBlock = ContextServiceEditorInFencedCodeBlock;
//# sourceMappingURL=context-service-in-fenced-code-block.js.map