"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const configuration_1 = require("../util/configuration");
const generic_1 = require("../util/generic");
suite("Block quote editing.", () => {
    suiteSetup(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    suiteTeardown(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    test("Enter key. Continue a block quote", () => {
        return (0, generic_1.testCommand)('markdown.extension.onEnterKey', [
            '> item1'
        ], new vscode_1.Selection(0, 7, 0, 7), [
            '> item1',
            '> '
        ], new vscode_1.Selection(1, 2, 1, 2));
    });
    test("Enter key. Still continue a block quote", () => {
        return (0, generic_1.testCommand)('markdown.extension.onEnterKey', [
            '> item1',
            '> '
        ], new vscode_1.Selection(1, 2, 1, 2), [
            '> item1',
            '>',
            '> '
        ], new vscode_1.Selection(2, 2, 2, 2));
    });
    test("Enter key. Finish a block quote", () => {
        return (0, generic_1.testCommand)('markdown.extension.onEnterKey', [
            '> item1',
            '> ',
            '> '
        ], new vscode_1.Selection(2, 2, 2, 2), [
            '> item1',
            '',
            ''
        ], new vscode_1.Selection(2, 0, 2, 0));
    });
    test("Enter key. Finish a block quote (corner case)", () => {
        return (0, generic_1.testCommand)('markdown.extension.onEnterKey', [
            '> '
        ], new vscode_1.Selection(0, 2, 0, 2), [
            ''
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
});
//# sourceMappingURL=blockquoteEditing.test.js.map