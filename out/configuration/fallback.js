"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fallback_Map = exports.Deprecated_Keys = void 0;
const vscode = require("vscode");
/**
 * Configuration keys that are no longer supported,
 * and will be removed in the next major version.
 */
exports.Deprecated_Keys = Object.freeze([
    "syntax.decorations", //
]);
exports.Fallback_Map = Object.freeze({
    "theming.decoration.renderCodeSpan": (scope) => {
        const config = vscode.workspace.getConfiguration("markdown.extension", scope);
        const old = config.get("syntax.decorations");
        if (old === null || old === undefined) {
            return config.get("theming.decoration.renderCodeSpan");
        }
        else {
            return old;
        }
    },
    "theming.decoration.renderStrikethrough": (scope) => {
        const config = vscode.workspace.getConfiguration("markdown.extension", scope);
        const old = config.get("syntax.decorations");
        if (old === null || old === undefined) {
            return config.get("theming.decoration.renderStrikethrough");
        }
        else {
            return old;
        }
    },
});
//# sourceMappingURL=fallback.js.map