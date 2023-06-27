// This module is deprecated.
// No update will land here.
// It is superseded by `src/theming`, etc.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const contextCheck_1 = require("./util/contextCheck");
const decorationStyles = {
    [0 /* baseColor */]: {
        "dark": { "color": "#EEFFFF" },
        "light": { "color": "000000" },
    },
    [1 /* gray */]: {
        "rangeBehavior": 1,
        "dark": { "color": "#636363" },
        "light": { "color": "#CCC" },
    },
    [2 /* lightBlue */]: {
        "color": "#4080D0",
    },
    [3 /* orange */]: {
        "color": "#D2B640",
    },
};
const regexDecorTypeMappingPlainTheme = [
    // [alt](link)
    [
        /(^|[^!])(\[)([^\]\r\n]*?(?!\].*?\[)[^\[\r\n]*?)(\]\(.+?\))/,
        [undefined, 1 /* gray */, 2 /* lightBlue */, 1 /* gray */]
    ],
    // ![alt](link)
    [
        /(\!\[)([^\]\r\n]*?(?!\].*?\[)[^\[\r\n]*?)(\]\(.+?\))/,
        [1 /* gray */, 3 /* orange */, 1 /* gray */]
    ],
    // `code`
    [
        /(?<!`)(`+?)([^`].*?)(?<!`)(\1)(?!`)/,
        [1 /* gray */, 0 /* baseColor */, 1 /* gray */]
    ],
    // *italic*
    [
        /(\*)([^\*\`\!\@\#\%\^\&\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s].*?[^\*\`\!\@\#\%\^\&\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s])(\*)/,
        [1 /* gray */, 0 /* baseColor */, 1 /* gray */]
    ],
    // _italic_
    [
        /(_)([^\*\`\!\@\#\%\^\&\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s].*?[^\*\`\!\@\#\%\^\&\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s])(_)/,
        [1 /* gray */, 0 /* baseColor */, 1 /* gray */]
    ],
    // **bold**
    [
        /(\*\*)([^\*\`\!\@\#\%\^\&\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s].*?[^\*\`\!\@\#\%\^\&\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s])(\*\*)/,
        [1 /* gray */, 0 /* baseColor */, 1 /* gray */]
    ],
];
//#endregion Constant
/**
 * Decoration type instances **currently in use**.
 */
const decorationHandles = new Map();
const decors = new Map();
function activate(context) {
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration("markdown.extension.syntax.plainTheme")) {
            triggerUpdateDecorations(vscode.window.activeTextEditor);
        }
    }), vscode.window.onDidChangeActiveTextEditor(triggerUpdateDecorations), vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            triggerUpdateDecorations(editor);
        }
    }));
    triggerUpdateDecorations(vscode.window.activeTextEditor);
}
exports.activate = activate;
var timeout;
// Debounce.
function triggerUpdateDecorations(editor) {
    if (!editor || editor.document.languageId !== "markdown") {
        return;
    }
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => updateDecorations(editor), 200);
}
/**
 * Clears decorations in the text editor.
 */
function clearDecorations(editor) {
    for (const handle of decorationHandles.values()) {
        editor.setDecorations(handle, []);
    }
}
function updateDecorations(editor) {
    // Remove everything if it's disabled.
    if (!vscode.workspace.getConfiguration().get("markdown.extension.syntax.plainTheme", false)) {
        for (const handle of decorationHandles.values()) {
            handle.dispose();
        }
        decorationHandles.clear();
        return;
    }
    const doc = editor.document;
    if (doc.getText().length * 1.5 > vscode.workspace.getConfiguration().get("markdown.extension.syntax.decorationFileSizeLimit")) {
        clearDecorations(editor); // In case the editor is still visible.
        return;
    }
    // Reset decoration collection.
    decors.clear();
    for (const typeName of Object.keys(decorationStyles)) {
        decors.set(+typeName, []);
    }
    // Analyze.
    doc.getText().split(/\r?\n/g).forEach((lineText, lineNum) => {
        if ((0, contextCheck_1.isInFencedCodeBlock)(doc, lineNum)) {
            return;
        }
        // Issue #412
        // Trick. Match `[alt](link)` and `![alt](link)` first and remember those greyed out ranges
        const noDecorRanges = [];
        for (const [re, types] of regexDecorTypeMappingPlainTheme) {
            const regex = new RegExp(re, "g");
            for (const match of lineText.matchAll(regex)) {
                let startIndex = match.index;
                if (noDecorRanges.some(r => (startIndex > r[0] && startIndex < r[1])
                    || (startIndex + match[0].length > r[0] && startIndex + match[0].length < r[1]))) {
                    continue;
                }
                for (let i = 0; i < types.length; i++) {
                    //// Skip if in math environment (See `completion.ts`)
                    if ((0, contextCheck_1.mathEnvCheck)(doc, new vscode.Position(lineNum, startIndex)) !== "") {
                        break;
                    }
                    const typeName = types[i];
                    const caughtGroup = match[i + 1];
                    if (typeName === 1 /* gray */ && caughtGroup.length > 2) {
                        noDecorRanges.push([startIndex, startIndex + caughtGroup.length]);
                    }
                    const range = new vscode.Range(lineNum, startIndex, lineNum, startIndex + caughtGroup.length);
                    startIndex += caughtGroup.length;
                    //// Needed for `[alt](link)` rule. And must appear after `startIndex += caughtGroup.length;`
                    if (!typeName) {
                        continue;
                    }
                    // We've created these arrays at the beginning of the function.
                    decors.get(typeName).push(range);
                }
            }
        }
    });
    // Apply decorations.
    for (const [typeName, ranges] of decors) {
        let handle = decorationHandles.get(typeName);
        // Create a new decoration type instance if needed.
        if (!handle) {
            handle = vscode.window.createTextEditorDecorationType(decorationStyles[typeName]);
            decorationHandles.set(typeName, handle);
        }
        editor.setDecorations(handle, ranges);
    }
}
//# sourceMappingURL=syntaxDecorations.js.map