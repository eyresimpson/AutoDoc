'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbsContextService = void 0;
const vscode_1 = require("vscode");
class AbsContextService {
    /**
     * set state of context
     */
    setState(state) {
        vscode_1.commands.executeCommand('setContext', this.contextName, state);
    }
}
exports.AbsContextService = AbsContextService;
//# sourceMappingURL=i-context-service.js.map