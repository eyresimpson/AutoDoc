"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const configuration_1 = require("../util/configuration");
const generic_1 = require("../util/generic");
suite("No list editing.", () => {
    suiteSetup(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    suiteTeardown(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    test("Backspace key: '-  |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '-  item1'
        ], new vscode_1.Selection(0, 3, 0, 3), [
            '- item1'
        ], new vscode_1.Selection(0, 2, 0, 2));
    });
    test("Backspace key: '  -  |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '  -  item1'
        ], new vscode_1.Selection(0, 5, 0, 5), [
            '  - item1'
        ], new vscode_1.Selection(0, 4, 0, 4));
    });
    test("Backspace key: '- [ ]  |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '- [ ]  item1'
        ], new vscode_1.Selection(0, 7, 0, 7), [
            '- [ ] item1'
        ], new vscode_1.Selection(0, 6, 0, 6));
    });
    test("Shift tab key: '    text'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onShiftTabKey', [
            '    text'
        ], new vscode_1.Selection(0, 5, 0, 5), [
            'text'
        ], new vscode_1.Selection(0, 1, 0, 1));
    });
});
//# sourceMappingURL=listEditing.fallback.test.js.map