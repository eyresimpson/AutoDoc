"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMdDocument = exports.Regexp_Fenced_Code_Block = exports.Document_Selector_Markdown = void 0;
const vscode = require("vscode");
/** Scheme `File` or `Untitled` */
exports.Document_Selector_Markdown = [
    { language: "markdown" /* Markdown */, scheme: "file" },
    { language: "markdown" /* Markdown */, scheme: "untitled" },
];
/**
 * **Do not call `exec()` method, to avoid accidentally changing its state!**
 *
 * Match most kinds of fenced code blocks:
 *
 * * Only misses <https://spec.commonmark.org/0.29/#example-116>.
 * * Due to the limitations of regular expression, the "end of the document" cases are not handled.
 */
exports.Regexp_Fenced_Code_Block = /^ {0,3}(?<fence>(?<char>[`~])\k<char>{2,})[^`\r\n]*$[^]*?^ {0,3}\k<fence>\k<char>* *$/gm;
function isMdDocument(doc) {
    if (doc) {
        const extraLangIds = vscode.workspace.getConfiguration("markdown.extension").get("extraLangIds");
        const langId = doc.languageId;
        if (extraLangIds?.includes(langId)) {
            return true;
        }
        if (langId === "markdown" /* Markdown */) {
            return true;
        }
    }
    return false;
}
exports.isMdDocument = isMdDocument;
//# sourceMappingURL=generic.js.map