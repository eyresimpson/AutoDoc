"use strict";
//// <https://github.com/microsoft/vscode/blob/master/extensions/markdown-language-features/src/markdownEngine.ts>
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonMarkEngine = exports.mdEngine = void 0;
const vscode = require("vscode");
const MarkdownIt = require("markdown-it");
const Token = require("markdown-it/lib/token");
const slugify_1 = require("./util/slugify");
const markdownExtensions_1 = require("./markdownExtensions");
const markdown_it_plugin_provider_1 = require("./markdown-it-plugin-provider");
const generic_1 = require("./util/generic");
/**
 * A strict CommonMark only engine powered by `markdown-it`.
 */
class CommonMarkEngine {
    constructor() {
        this._documentTokenCache = new Map();
        this._engine = new MarkdownIt('commonmark');
        this._disposables = [
            vscode.workspace.onDidCloseTextDocument(document => {
                if ((0, generic_1.isMdDocument)(document)) {
                    this._documentTokenCache.delete(document);
                }
            }),
        ];
    }
    get engine() {
        return this._engine;
    }
    dispose() {
        // Unsubscribe event listeners.
        for (const disposable of this._disposables) {
            disposable.dispose();
        }
        this._disposables.length = 0;
    }
    getDocumentToken(document) {
        // It's safe to be sync.
        // In the worst case, concurrent calls lead to run `parse()` multiple times.
        // Only performance regression. No data corruption.
        const cache = this._documentTokenCache.get(document);
        if (cache && cache.version === document.version) {
            return cache;
        }
        else {
            const env = Object.create(null);
            const result = {
                document,
                env,
                // Read the version before parsing, in case the document changes,
                // so that we won't declare an old result as a new one.
                version: document.version,
                tokens: this._engine.parse(document.getText(), env),
            };
            this._documentTokenCache.set(document, result);
            return result;
        }
    }
    async getEngine() {
        return this._engine;
    }
}
class MarkdownEngine {
    constructor() {
        this._documentTokenCache = new Map();
        /**
         * This is used by `addNamedHeaders()`, and reset on each call to `render()`.
         */
        this._slugCount = new Map();
        this.contributionsProvider = (0, markdownExtensions_1.getMarkdownContributionProvider)();
        this._disposables = [
            vscode.workspace.onDidCloseTextDocument(document => {
                if ((0, generic_1.isMdDocument)(document)) {
                    this._documentTokenCache.delete(document);
                }
            }),
            this.contributionsProvider.onDidChangeContributions(() => {
                this.newEngine().then((engine) => {
                    this._engine = engine;
                });
            }),
        ];
        // Initialize an engine.
        this.newEngine().then((engine) => {
            this._engine = engine;
        });
    }
    dispose() {
        // Unsubscribe event listeners.
        for (const disposable of this._disposables) {
            disposable.dispose();
        }
        this._disposables.length = 0;
    }
    async getDocumentToken(document) {
        const cache = this._documentTokenCache.get(document);
        if (cache && cache.version === document.version) {
            return cache;
        }
        else {
            const env = Object.create(null);
            const engine = await this.getEngine();
            const result = {
                document,
                env,
                version: document.version,
                tokens: engine.parse(document.getText(), env),
            };
            this._documentTokenCache.set(document, result);
            return result;
        }
    }
    async getEngine() {
        if (!this._engine) {
            this._engine = await this.newEngine();
        }
        return this._engine;
    }
    async newEngine() {
        let md;
        const hljs = require("highlight.js");
        md = new MarkdownIt({
            html: true,
            highlight: (str, lang) => {
                if (lang && (lang = normalizeHighlightLang(lang)) && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
                    }
                    catch { }
                }
                return ""; // Signal to markdown-it itself to handle it.
            }
        });
        // contributions provided by this extension must be processed specially,
        // since this extension may not finish activation when creating an engine.
        (0, markdown_it_plugin_provider_1.extendMarkdownIt)(md);
        if (!vscode.workspace.getConfiguration('markdown.extension.print').get('validateUrls', true)) {
            md.validateLink = () => true;
        }
        this.addNamedHeaders(md);
        for (const contribute of this.contributionsProvider.contributions) {
            if (!contribute.extendMarkdownIt) {
                continue;
            }
            // Skip the third-party Markdown extension, if it is broken or crashes.
            try {
                md = await contribute.extendMarkdownIt(md);
            }
            catch (err) {
                // Use the multiple object overload, so that the console can output the error object in its own way, which usually keeps more details than `toString`.
                console.warn(`[yzhang.markdown-all-in-one]:\nSkipped Markdown extension: ${contribute.extensionId}\nReason:`, err);
            }
        }
        return md;
    }
    async render(text, config) {
        const md = await this.getEngine();
        md.set({
            breaks: config.get('breaks', false),
            linkify: config.get('linkify', true)
        });
        this._slugCount.clear();
        return md.render(text);
    }
    /**
     * Tweak the render rule for headings, to set anchor ID.
     */
    addNamedHeaders(md) {
        const originalHeadingOpen = md.renderer.rules.heading_open;
        // Arrow function ensures that `this` is inherited from `addNamedHeaders`,
        // so that we won't need `bind`, and save memory a little.
        md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
            const raw = tokens[idx + 1].content;
            let slug = (0, slugify_1.slugify)(raw, { env });
            let lastCount = this._slugCount.get(slug);
            if (lastCount !== undefined) {
                lastCount++;
                this._slugCount.set(slug, lastCount);
                slug += '-' + lastCount;
            }
            else {
                this._slugCount.set(slug, 0);
            }
            tokens[idx].attrs = [...(tokens[idx].attrs || []), ["id", slug]];
            if (originalHeadingOpen) {
                return originalHeadingOpen(tokens, idx, options, env, self);
            }
            else {
                return self.renderToken(tokens, idx, options);
            }
        };
    }
}
/**
 * Tries to convert the identifier to a language name supported by Highlight.js.
 *
 * @see {@link https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md}
 */
function normalizeHighlightLang(lang) {
    switch (lang && lang.toLowerCase()) {
        case 'tsx':
        case 'typescriptreact':
            return 'jsx';
        case 'json5':
        case 'jsonc':
            return 'json';
        case 'c#':
        case 'csharp':
            return 'cs';
        default:
            return lang;
    }
}
/**
 * This engine dynamically refreshes in the same way as VS Code's built-in Markdown preview.
 */
exports.mdEngine = new MarkdownEngine();
/**
 * A strict CommonMark only engine instance.
 */
exports.commonMarkEngine = new CommonMarkEngine();
//# sourceMappingURL=markdownEngine.js.map