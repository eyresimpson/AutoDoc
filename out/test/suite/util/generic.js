"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCommand = exports.sleep = exports.openDocument = exports.Test_Md_File_Path = exports.Test_Workspace_Path = void 0;
const assert_1 = require("assert");
const path = require("path");
const vscode = require("vscode");
//#region Constant
exports.Test_Workspace_Path = vscode.Uri.file(path.resolve(__dirname, "..", "..", "..", "..", "test"));
exports.Test_Md_File_Path = vscode.Uri.joinPath(exports.Test_Workspace_Path, "test.md");
//#endregion Constant
//#region Utility
/**
 * Opens a document with the corresponding editor.
 * @param file A Uri or file system path which identifies the resource.
 */
const openDocument = async (file) => {
    const document = await vscode.workspace.openTextDocument(file);
    const editor = await vscode.window.showTextDocument(document);
    return [document, editor];
};
exports.openDocument = openDocument;
/**
 * Pauses for a while.
 * @param ms - Time to pause in millisecond.
 * @example
 * await sleep(1000);
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
/**
 * Tests a command.
 */
async function testCommand(command, initLines, initSelection, expectedLines, expectedSelection) {
    // Open the file.
    const [document, editor] = await (0, exports.openDocument)(exports.Test_Md_File_Path);
    // Place the initial content.
    await editor.edit(editBuilder => {
        const fullRange = new vscode.Range(new vscode.Position(0, 0), document.positionAt(document.getText().length));
        editBuilder.delete(fullRange);
        editBuilder.insert(new vscode.Position(0, 0), initLines.join("\n"));
    });
    editor.selection = initSelection;
    await sleep(50);
    // Run the command.
    await vscode.commands.executeCommand(command);
    // Assert.
    const actual = document.getText()
        .replace(/\r\n/g, "\n"); // Normalize line endings.
    assert_1.strict.deepStrictEqual(actual, expectedLines.join("\n"));
    assert_1.strict.deepStrictEqual(editor.selection, expectedSelection);
}
exports.testCommand = testCommand;
//#endregion Utility
//# sourceMappingURL=generic.js.map