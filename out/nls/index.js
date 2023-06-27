"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.localize = void 0;
const fs = require("fs");
const vscode = require("vscode");
const resolveResource_1 = require("./resolveResource");
//#region Utility
function readJsonFile(path) {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}
//#endregion Utility
//#region Private
// Why `Object.create(null)`:
// Once constructed, this is used as a readonly dictionary (map).
// It is performance-sensitive, and should not be affected by the outside.
// Besides, `Object.prototype` might collide with our keys.
const resolvedBundle = Object.create(null);
/**
 * Internal options.
 * Will be initialized in `config()`.
 */
const options = Object.create(null);
/**
 * Updates the in-memory NLS bundle.
 * @param locales An array of locale IDs. The default locale will be appended.
 */
function cacheBundle(locales = []) {
    if (options.locale) {
        locales.push(options.locale); // Fallback.
    }
    // * We always provide `package.nls.json`.
    // * Reverse the return value, so that we can build a bundle with nice fallback by a simple loop.
    const files = (0, resolveResource_1.default)(options.extensionPath, "package.nls", "json", locales).reverse();
    for (const path of files) {
        try {
            Object.assign(resolvedBundle, readJsonFile(path));
        }
        catch (error) {
            console.error(error); // Log, and ignore the bundle.
        }
    }
}
/**
 * @param message A composite format string.
 * @param args An array of objects to format.
 */
function format(message, ...args) {
    if (args.length === 0) {
        return message;
    }
    else {
        return message.replace(/\{(0|[1-9]\d*?)\}/g, (match, index) => {
            // `index` is zero-based.
            return args.length > +index ? String(args[+index]) : match;
        });
    }
}
//#endregion Private
//#region Public
const localize = function (key, ...args) {
    if (options.cacheResolution) {
        const msg = resolvedBundle[key];
        return msg === undefined ? "[" + key + "]" : format(msg, ...args);
    }
    else {
        // When in development mode, hot reload, and reveal the key.
        cacheBundle();
        const msg = resolvedBundle[key];
        return msg === undefined ? "[" + key + "]" : "[" + key.substring(key.lastIndexOf(".") + 1) + "] " + format(msg, ...args);
    }
};
exports.localize = localize;
/**
 * Configures the NLS module.
 *
 * You should only call it **once** in the application entry point.
 */
function config(opts) {
    if (opts.locale) {
        options.locale = opts.locale;
    }
    else {
        try {
            const vscodeOptions = JSON.parse(process.env.VSCODE_NLS_CONFIG);
            options.locale = vscodeOptions.locale;
        }
        catch (error) {
            // Log, but do nothing else, in case VS Code suddenly changes their mind, or we are not in VS Code.
            console.error(error);
        }
    }
    options.extensionPath = opts.extensionContext.extensionPath;
    options.cacheResolution = opts.extensionContext.extensionMode !== vscode.ExtensionMode.Development;
    // Load and freeze the cache when not in development mode.
    if (options.cacheResolution) {
        cacheBundle();
        Object.freeze(resolvedBundle);
    }
    return exports.localize;
}
exports.config = config;
//# sourceMappingURL=index.js.map