"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configManager = void 0;
const vscode = require("vscode");
const fallback_1 = require("./fallback");
/**
 * This is currently just a proxy that helps mapping our configuration keys.
 */
class ConfigurationManager {
    constructor(fallback, deprecatedKeys) {
        this._fallback = Object.isFrozen(fallback) ? fallback : Object.freeze({ ...fallback });
        this.showWarning(deprecatedKeys);
    }
    dispose() { }
    /**
     * Shows an error message for each deprecated key, to help user migrate.
     * This is async to avoid blocking instance creation.
     */
    async showWarning(deprecatedKeys) {
        for (const key of deprecatedKeys) {
            const value = vscode.workspace.getConfiguration("markdown.extension").get(key);
            if (value !== undefined && value !== null) {
                // We are not able to localize this string for now.
                // Our NLS module needs to be configured before using, which is done in the extension entry point.
                // This module may be directly or indirectly imported by the entry point.
                // Thus, this module may be loaded before the NLS module is available.
                vscode.window.showErrorMessage(`The setting 'markdown.extension.${key}' has been deprecated.`);
            }
        }
    }
    get(key, scope) {
        const fallback = this._fallback[key];
        if (fallback) {
            return fallback(scope);
        }
        else {
            return vscode.workspace.getConfiguration("markdown.extension", scope).get(key);
        }
    }
    getByAbsolute(section, scope) {
        if (section.startsWith("markdown.extension.")) {
            return this.get(section.slice(19), scope);
        }
        else {
            return vscode.workspace.getConfiguration(undefined, scope).get(section);
        }
    }
}
exports.configManager = new ConfigurationManager(fallback_1.Fallback_Map, fallback_1.Deprecated_Keys);
//# sourceMappingURL=manager.js.map