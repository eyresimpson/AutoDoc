"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorationClassConfigMap = exports.decorationStyles = void 0;
const vscode = require("vscode");
const colors = {
    [0 /* EditorCodeSpanBackground */]: new vscode.ThemeColor("markdown.extension.editor.codeSpan.background"),
    [1 /* EditorCodeSpanBorder */]: new vscode.ThemeColor("markdown.extension.editor.codeSpan.border"),
    [2 /* EditorFormattingMarkForeground */]: new vscode.ThemeColor("markdown.extension.editor.formattingMark.foreground"),
    [3 /* EditorTrailingSpaceBackground */]: new vscode.ThemeColor("markdown.extension.editor.trailingSpace.background"),
};
const fontIcons = {
    [0 /* DownwardsArrow */]: {
        contentText: "↓",
        color: colors[2 /* EditorFormattingMarkForeground */],
    },
    [1 /* DownwardsArrowWithCornerLeftwards */]: {
        contentText: "↵",
        color: colors[2 /* EditorFormattingMarkForeground */],
    },
    [2 /* Link */]: {
        contentText: "\u{1F517}\u{FE0E}",
        color: colors[2 /* EditorFormattingMarkForeground */],
    },
    [3 /* Pilcrow */]: {
        contentText: "¶",
        color: colors[2 /* EditorFormattingMarkForeground */],
    },
};
/**
 * Rendering styles for each decoration class.
 */
exports.decorationStyles = {
    [0 /* CodeSpan */]: {
        backgroundColor: colors[0 /* EditorCodeSpanBackground */],
        border: "1px solid",
        borderColor: colors[1 /* EditorCodeSpanBorder */],
        borderRadius: "3px",
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    },
    [1 /* HardLineBreak */]: {
        after: fontIcons[1 /* DownwardsArrowWithCornerLeftwards */],
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    },
    [2 /* Link */]: {
        before: fontIcons[2 /* Link */],
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    },
    [3 /* Paragraph */]: {
        after: fontIcons[3 /* Pilcrow */],
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    },
    [4 /* Strikethrough */]: {
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        textDecoration: "line-through",
    },
    [5 /* TrailingSpace */]: {
        backgroundColor: colors[3 /* EditorTrailingSpaceBackground */],
    },
};
/**
 * DecorationClass -> Configuration key
 */
exports.decorationClassConfigMap = {
    [0 /* CodeSpan */]: "theming.decoration.renderCodeSpan",
    [1 /* HardLineBreak */]: "theming.decoration.renderHardLineBreak",
    [2 /* Link */]: "theming.decoration.renderLink",
    [3 /* Paragraph */]: "theming.decoration.renderParagraph",
    [4 /* Strikethrough */]: "theming.decoration.renderStrikethrough",
    [5 /* TrailingSpace */]: "theming.decoration.renderTrailingSpace",
};
//# sourceMappingURL=constant.js.map