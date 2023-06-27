"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const configuration_1 = require("../util/configuration");
const generic_1 = require("../util/generic");
suite("Table formatter.", () => {
    suiteSetup(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    suiteTeardown(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    test("Normal", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a | b |',
            '| --- | --- |',
            '| c | d |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a   | b   |',
            '| --- | --- |',
            '| c   | d   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Normal, without leading and trailing pipes", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '',
            'a |b',
            '---| ---',
            'c|de'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '',
            '| a   | b   |',
            '| --- | --- |',
            '| c   | de  |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Plain pipes should always be cell separators", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a | b |',
            '| --- | --- |',
            '| c `a|b` | d |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a    | b   |',
            '| ---- | --- |',
            '| c `a | b`  | d |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    // https://github.github.com/gfm/#example-200
    test(String.raw `Contains escaped pipes '\|'`, () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a | b |',
            '| --- | --- |',
            '| c `a\\|b`   | d |',
            '| c **a\\|b** | d |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a          | b   |',
            '| ---------- | --- |',
            '| c `a\\|b`   | d   |',
            '| c **a\\|b** | d   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("CJK characters", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a | b |',
            '| --- | --- |',
            '| c 中文 | d |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a      | b   |',
            '| ------ | --- |',
            '| c 中文 | d   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Not table", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            'a | b',
            '---'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            'a | b',
            '---'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Indented table, belongs to a list item", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '1. A list',
            '    | a | b |',
            '    | --- | --- |',
            '    | c | d |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '1. A list',
            '    | a   | b   |',
            '    | --- | --- |',
            '    | c   | d   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Mixed-indented table (no normalization)", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '   | a | b |',
            '  | --- | --- |',
            '    | c | d |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '   | a   | b   |',
            '   | --- | --- |',
            '   | c   | d   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    // This is definitely WRONG. It may produce an indented code block！
    // test("Mixed-indented table (normalization)", async () => {
    //     await updateConfiguration({ config: [["markdown.extension.tableFormatter.normalizeIndentation", true]] });
    //     await testCommand('editor.action.formatDocument',
    //         [
    //             '   | a | b |',
    //             '  | --- | --- |',
    //             '    | c | d |'
    //         ],
    //         new Selection(0, 0, 0, 0),
    //         [
    //             '    | a   | b   |',
    //             '    | --- | --- |',
    //             '    | c   | d   |'
    //         ],
    //         new Selection(0, 0, 0, 0)
    //     );
    //     await resetConfiguration();
    // });
    test("Mixed ugly table", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a | b | c ',
            ' --- | --- | :---:',
            ' c | d | e |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a   | b   |   c   |',
            '| --- | --- | :---: |',
            '| c   | d   |   e   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Alignment and padding within cells", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| Column L | Column C | Column R |',
            '| ---- | :----: | ----: |',
            '| c | d | e |',
            '| fg | hi | jk |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| Column L | Column C | Column R |',
            '| -------- | :------: | -------: |',
            '| c        |    d     |        e |',
            '| fg       |    hi    |       jk |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Contains escaped pipes '\\|' in last data cell", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '',
            'a|b',
            '---|---',
            'c|d\\|e'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '',
            '| a   | b    |',
            '| --- | ---- |',
            '| c   | d\\|e |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Reduced width table", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a       | b    |',
            '| ------- | ---- |',
            '| c | d   |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a   | b   |',
            '| --- | --- |',
            '| c   | d   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Empty cell with nothing between pipes (#381)", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a | b | c |',
            '| --- | --- | --- |',
            '| a || c |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a   | b   | c   |',
            '| --- | --- | --- |',
            '| a   |     | c   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("CTL: Thai", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| คุณครู | รั้วริม | ไอ้หนูน้อย |',
            '| --- | --- | --- |',
            '| Teacher | The border | kids |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| คุณครู    | รั้วริม       | ไอ้หนูน้อย |',
            '| ------- | ---------- | ------- |',
            '| Teacher | The border | kids    |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Left-aligned single column table (#431)", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| h |',
            '| --- |',
            '| a |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| h   |',
            '| --- |',
            '| a   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Centre-aligned single column table (#431)", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| h |',
            '| :---: |',
            '| a |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '|   h   |',
            '| :---: |',
            '|   a   |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Right-aligned single column table (#431)", () => {
        return (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| h |',
            '| ---: |',
            '| a |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '|    h |',
            '| ---: |',
            '|    a |'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Delimiter row without padding", async () => {
        await (0, configuration_1.updateConfiguration)({ config: [["markdown.extension.tableFormatter.delimiterRowNoPadding", true]] });
        await (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a | b | c | d |',
            '| --- | :--- | ---: | :---: |',
            '| w | x | y | z |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a | b  |  c |  d  |',
            '|---|:---|---:|:---:|',
            '| w | x  |  y |  z  |'
        ], new vscode_1.Selection(0, 0, 0, 0));
        await (0, configuration_1.resetConfiguration)();
    });
    test("Delimiter row without padding, longer data", async () => {
        await (0, configuration_1.updateConfiguration)({ config: [["markdown.extension.tableFormatter.delimiterRowNoPadding", true]] });
        await (0, generic_1.testCommand)('editor.action.formatDocument', [
            '| a | b-long | c | d-longest |',
            '| --- | :--- | ---: | :---: |',
            '| w | x | y-longer | z |'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '| a | b-long |        c | d-longest |',
            '|---|:-------|---------:|:---------:|',
            '| w | x      | y-longer |     z     |'
        ], new vscode_1.Selection(0, 0, 0, 0));
        await (0, configuration_1.resetConfiguration)();
    });
});
//# sourceMappingURL=tableFormatter.test.js.map