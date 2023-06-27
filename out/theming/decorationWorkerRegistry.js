"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const markdownEngine_1 = require("../markdownEngine");
// ## Organization
//
// Sort in alphabetical order.
// Place a blank line between two entries.
// Place a trailing comma at the end of each entry.
//
// ## Template
//
// It's recommended to use this so-called "cancellable promise".
// If you have to write async function for some reason,
// remember to add cancellation checks based on your experience.
//
// ````typescript
// [DecorationClass.TrailingSpace]: (document, token) => {
//     return new Promise<IDecorationRecord>((resolve, reject): void => {
//         token.onCancellationRequested(reject);
//         if (token.isCancellationRequested) {
//             reject();
//         }
//
//         const ranges: vscode.Range[] = [];
//
//         resolve({ target: DecorationClass.TrailingSpace, ranges });
//     });
// },
// ````
/**
 * The registry of decoration analysis workers.
 */
const decorationWorkerRegistry = {
    [0 /* CodeSpan */]: async (document, token) => {
        if (token.isCancellationRequested) {
            throw undefined;
        }
        const text = document.getText();
        // Tokens in, for example, table doesn't have `map`.
        // Tables themselves are strange enough. So, skipping them is acceptable.
        const tokens = (await markdownEngine_1.mdEngine.getDocumentToken(document)).tokens
            .filter(t => t.type === "inline" && t.map);
        if (token.isCancellationRequested) {
            throw undefined;
        }
        const ranges = [];
        for (const { content, children, map } of tokens) {
            let initOffset = document.offsetAt(new vscode.Position(map[0], 0));
            initOffset = Math.max(text.indexOf(content, initOffset), initOffset);
            let beginOffset = initOffset;
            let endOffset = initOffset;
            for (const t of children) {
                // see #1135
                if (t.type === "html_inline") {
                    continue;
                }
                if (t.type !== "code_inline") {
                    beginOffset += t.content.length; // Not accurate, but enough.
                    continue;
                }
                // The `content` is "normalized", not raw.
                // Thus, in some cases, we need to perform a fuzzy search, and the result cannot be precise.
                let codeSpanText = t.markup + t.content + t.markup;
                let cursor = text.indexOf(codeSpanText, beginOffset);
                if (cursor === -1) { // There may be one space on both sides.
                    codeSpanText = t.markup + " " + t.content + " " + t.markup;
                    cursor = text.indexOf(codeSpanText, beginOffset);
                }
                if (cursor !== -1) { // Good.
                    beginOffset = cursor;
                    endOffset = beginOffset + codeSpanText.length;
                }
                else {
                    beginOffset = text.indexOf(t.markup, beginOffset);
                    // See if the first piece of `content` can help us.
                    const searchPos = beginOffset + t.markup.length;
                    const searchText = t.content.slice(0, t.content.indexOf(" "));
                    cursor = text.indexOf(searchText, searchPos);
                    endOffset = cursor !== -1
                        ? text.indexOf(t.markup, cursor + searchText.length) + t.markup.length
                        : text.indexOf(t.markup, searchPos) + t.markup.length;
                }
                ranges.push(new vscode.Range(document.positionAt(beginOffset), document.positionAt(endOffset)));
                beginOffset = endOffset;
            }
            if (token.isCancellationRequested) {
                throw undefined;
            }
        }
        return { target: 0 /* CodeSpan */, ranges };
    },
    [1 /* HardLineBreak */]: (document, token) => {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(reject);
            if (token.isCancellationRequested) {
                reject();
            }
            // Use commonMarkEngine for reliability, at the expense of accuracy.
            const tokens = markdownEngine_1.commonMarkEngine.getDocumentToken(document).tokens.filter(t => t.type === "inline");
            const ranges = [];
            for (const { children, map } of tokens) {
                let lineIndex = map[0];
                for (const t of children) {
                    switch (t.type) {
                        case "softbreak":
                            lineIndex++;
                            break;
                        case "hardbreak":
                            const pos = document.lineAt(lineIndex).range.end;
                            ranges.push(new vscode.Range(pos, pos));
                            lineIndex++;
                            break;
                    }
                }
            }
            resolve({ target: 1 /* HardLineBreak */, ranges });
        });
    },
    [2 /* Link */]: (document, token) => {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(reject);
            if (token.isCancellationRequested) {
                reject();
            }
            // A few kinds of inline links.
            const ranges = Array.from(document.getText().matchAll(/(?<!!)\[(?:[^\[\]\r\n]*?)\]\(.*?\)/g), m => {
                const pos = document.positionAt(m.index);
                return new vscode.Range(pos, pos);
            });
            resolve({ target: 2 /* Link */, ranges });
        });
    },
    [3 /* Paragraph */]: async (document, token) => {
        if (token.isCancellationRequested) {
            throw undefined;
        }
        const { tokens } = (await markdownEngine_1.mdEngine.getDocumentToken(document));
        if (token.isCancellationRequested) {
            throw undefined;
        }
        const ranges = [];
        for (const t of tokens) {
            if (t.type === "paragraph_open") {
                const pos = document.lineAt(t.map[1] - 1).range.end;
                ranges.push(new vscode.Range(pos, pos));
            }
        }
        return { target: 3 /* Paragraph */, ranges };
    },
    [4 /* Strikethrough */]: async (document, token) => {
        if (token.isCancellationRequested) {
            throw undefined;
        }
        const searchRanges = (await markdownEngine_1.mdEngine.getDocumentToken(document)).tokens
            .filter(t => t.type === "inline" && t.map).map(t => t.map); // Tokens in, for example, table doesn't have `map`.
        if (token.isCancellationRequested) {
            throw undefined;
        }
        const ranges = [];
        for (const [begin, end] of searchRanges) {
            const beginOffset = document.offsetAt(new vscode.Position(begin, 0));
            const text = document.getText(new vscode.Range(begin, 0, end, 0));
            // GitHub's definition is pretty strict. I've tried my best to simulate it.
            ranges.push(...Array.from(text.matchAll(/(?<![~\\])~~[^~\p{Zs}\t\r\n\f].*?(?<![~\p{Zs}\t\r\n\f])~~(?!~)/gu), m => {
                return new vscode.Range(document.positionAt(beginOffset + m.index), document.positionAt(beginOffset + m.index + m[0].length));
            }));
            if (token.isCancellationRequested) {
                throw undefined;
            }
        }
        return { target: 4 /* Strikethrough */, ranges };
    },
    [5 /* TrailingSpace */]: (document, token) => {
        return new Promise((resolve, reject) => {
            token.onCancellationRequested(reject);
            if (token.isCancellationRequested) {
                reject();
            }
            const text = document.getText();
            const ranges = Array.from(text.matchAll(/ +(?=[\r\n])/g), m => {
                return new vscode.Range(document.positionAt(m.index), document.positionAt(m.index + m[0].length));
            });
            // Process the end of file case specially.
            const eof = text.match(/ +$/);
            if (eof) {
                ranges.push(new vscode.Range(document.positionAt(eof.index), document.positionAt(eof.index + eof[0].length)));
            }
            resolve({ target: 5 /* TrailingSpace */, ranges });
        });
    },
};
exports.default = decorationWorkerRegistry;
//# sourceMappingURL=decorationWorkerRegistry.js.map