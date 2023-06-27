"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mathEnvCheck = exports.isInFencedCodeBlock = void 0;
const markdownEngine_1 = require("../markdownEngine");
/**
 * Checks whether the line is in a fenced code block.
 * @param lineIndex The zero-based line index.
 */
function isInFencedCodeBlock(doc, lineIndex) {
    const { tokens } = markdownEngine_1.commonMarkEngine.getDocumentToken(doc);
    for (const token of tokens) {
        if (token.type === "fence"
            && token.tag === "code"
            && token.map[0] <= lineIndex
            && lineIndex < token.map[1]) {
            return true;
        }
    }
    return false;
}
exports.isInFencedCodeBlock = isInFencedCodeBlock;
function mathEnvCheck(doc, pos) {
    const docText = doc.getText();
    const crtOffset = doc.offsetAt(pos);
    const crtLine = doc.lineAt(pos.line);
    const lineTextBefore = crtLine.text.substring(0, pos.character);
    const lineTextAfter = crtLine.text.substring(pos.character);
    if (/(?:^|[^\$])\$(?:[^ \$].*)??\\\w*$/.test(lineTextBefore)
        && lineTextAfter.includes("$")) {
        // Inline math
        return "inline";
    }
    else {
        const textBefore = docText.substring(0, crtOffset);
        const textAfter = docText.substring(crtOffset);
        let matches = textBefore.match(/\$\$/g);
        if (matches !== null
            && matches.length % 2 !== 0
            && textAfter.includes("$$")) {
            // $$ ... $$
            return "display";
        }
        else {
            return "";
        }
    }
}
exports.mathEnvCheck = mathEnvCheck;
//# sourceMappingURL=contextCheck.js.map