"use strict";
// Reference to https://github.com/microsoft/vscode/blob/master/extensions/markdown-language-features/src/markdownExtensions.ts
// Note:
// Not all extensions are implemented correctly.
// Thus, we need to check redundantly when loading their contributions, typically in `resolveMarkdownContribution()`.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarkdownContributionProvider = void 0;
const vscode = require("vscode");
const lazy_1 = require("./util/lazy");
/**
 * Extracts and wraps `extendMarkdownIt()` from the extension.
 *
 * @returns A function that will activate the extension and invoke its `extendMarkdownIt()`.
 */
function getContributedMarkdownItPlugin(extension) {
    return async (md) => {
        const exports = await extension.activate();
        if (exports && exports.extendMarkdownIt) {
            return exports.extendMarkdownIt(md);
        }
        return md;
    };
}
/**
 * Resolves absolute Uris of paths from the extension.
 *
 * @param paths The list of paths relative to the extension's root directory.
 *
 * @returns A list of resolved absolute Uris.
 * `undefined` indicates error.
 */
function resolveExtensionResourceUris(extension, paths) {
    try {
        return paths.map((path) => vscode.Uri.joinPath(extension.extensionUri, path));
    }
    catch {
        return undefined; // Discard the extension.
    }
}
/**
 * Resolves the Markdown contribution from the VS Code extension.
 *
 * This function extracts and wraps the contribution without validating the underlying resources.
 */
function resolveMarkdownContribution(extension) {
    const contributes = extension.packageJSON && extension.packageJSON.contributes;
    if (!contributes) {
        return;
    }
    const extendMarkdownIt = contributes["markdown.markdownItPlugins"]
        ? getContributedMarkdownItPlugin(extension)
        : undefined;
    const previewScripts = contributes["markdown.previewScripts"] && contributes["markdown.previewScripts"].length
        ? resolveExtensionResourceUris(extension, contributes["markdown.previewScripts"])
        : undefined;
    const previewStyles = contributes["markdown.previewStyles"] && contributes["markdown.previewStyles"].length
        ? resolveExtensionResourceUris(extension, contributes["markdown.previewStyles"])
        : undefined;
    if (!extendMarkdownIt && !previewScripts && !previewStyles) {
        return;
    }
    return {
        extensionId: extension.id,
        extensionUri: extension.extensionUri,
        extendMarkdownIt,
        previewScripts,
        previewStyles,
    };
}
/**
 * Skip these extensions!
 */
const Extension_Blacklist = new Set([
    "vscode.markdown-language-features",
    "yzhang.markdown-all-in-one", // This.
]);
/**
 * The contributions from these extensions can not be utilized directly.
 *
 * `ID -> Transformer`
 */
const Extension_Special_Treatment = new Map([
    ["vscode.markdown-math", (original) => ({ ...original, previewStyles: undefined })], // Its CSS is not portable. (#986)
]);
class MarkdownContributionProvider {
    constructor() {
        this._onDidChangeContributions = new vscode.EventEmitter();
        this._disposables = [];
        this._cachedContributions = undefined;
        this._isDisposed = false;
        this.onDidChangeContributions = this._onDidChangeContributions.event;
        this._disposables.push(this._onDidChangeContributions, vscode.extensions.onDidChange(() => {
            // `contributions` will rebuild the cache.
            this._cachedContributions = undefined;
            this._onDidChangeContributions.fire(this);
        }));
    }
    dispose() {
        if (this._isDisposed) {
            return;
        }
        for (const item of this._disposables) {
            item.dispose();
        }
        this._disposables.length = 0;
        this._isDisposed = true;
    }
    get contributions() {
        if (!this._cachedContributions) {
            this._cachedContributions = vscode.extensions.all.reduce((result, extension) => {
                if (Extension_Blacklist.has(extension.id)) {
                    return result;
                }
                const c = resolveMarkdownContribution(extension);
                if (!c) {
                    return result;
                }
                const t = Extension_Special_Treatment.get(extension.id);
                result.push(t ? t(c) : c);
                return result;
            }, []);
        }
        return this._cachedContributions;
    }
}
const defaultProvider = new lazy_1.Lazy(() => new MarkdownContributionProvider());
function getMarkdownContributionProvider() {
    return defaultProvider.value;
}
exports.getMarkdownContributionProvider = getMarkdownContributionProvider;
//# sourceMappingURL=markdownExtensions.js.map