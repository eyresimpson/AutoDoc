"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendMarkdownIt = void 0;
const manager_1 = require("./configuration/manager");
const katexOptions = { throwOnError: false };
/**
 * https://code.visualstudio.com/api/extension-guides/markdown-extension#adding-support-for-new-syntax-with-markdownit-plugins
 */
function extendMarkdownIt(md) {
    md.use(require("markdown-it-task-lists"), { enabled: true });
    if (manager_1.configManager.get("math.enabled")) {
        // We need side effects. (#521)
        require("katex/contrib/mhchem");
        // Deep copy, as KaTeX needs a normal mutable object. <https://katex.org/docs/options.html>
        const macros = JSON.parse(JSON.stringify(manager_1.configManager.get("katex.macros")));
        if (Object.keys(macros).length === 0) {
            delete katexOptions["macros"];
        }
        else {
            katexOptions["macros"] = macros;
        }
        md.use(require("@neilsustc/markdown-it-katex"), katexOptions);
    }
    return md;
}
exports.extendMarkdownIt = extendMarkdownIt;
//# sourceMappingURL=markdown-it-plugin-provider.js.map