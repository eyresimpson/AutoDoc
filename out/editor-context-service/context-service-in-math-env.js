'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextServiceEditorInMathEn = void 0;
const i_context_service_1 = require("./i-context-service");
const contextCheck_1 = require("../util/contextCheck");
class ContextServiceEditorInMathEn extends i_context_service_1.AbsContextService {
    constructor() {
        super(...arguments);
        this.contextName = "markdown.extension.editor.cursor.inMathEnv";
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
        if ((0, contextCheck_1.mathEnvCheck)(document, cursorPos)) {
            this.setState(true);
        }
        else {
            this.setState(false);
        }
        return;
    }
}
exports.ContextServiceEditorInMathEn = ContextServiceEditorInMathEn;
//# sourceMappingURL=context-service-in-math-env.js.map