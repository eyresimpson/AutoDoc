"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const configuration_1 = require("../util/configuration");
const generic_1 = require("../util/generic");
suite("Ordered list renumbering.", () => {
    suiteSetup(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    suiteTeardown(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    test("Enter key. Fix ordered marker", () => {
        return (0, generic_1.testCommand)('markdown.extension.onEnterKey', [
            '1. one',
            '2. two'
        ], new vscode_1.Selection(0, 6, 0, 6), [
            '1. one',
            '2. ',
            '3. two'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Backspace key. Fix ordered marker. 1", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '    1. item1'
        ], new vscode_1.Selection(0, 7, 0, 7), [
            '1. item1'
        ], new vscode_1.Selection(0, 3, 0, 3));
    });
    test("Backspace key. Fix ordered marker. 2", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '1. item1',
            '   5. item2'
        ], new vscode_1.Selection(1, 6, 1, 6), [
            '1. item1',
            '2. item2'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Backspace key. Fix ordered marker. 3", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '1. item1',
            '   1. item1-1',
            '   2. item1-2',
            '   3. item1-3',
            '   4. item1-4'
        ], new vscode_1.Selection(3, 6, 3, 6), [
            '1. item1',
            '   1. item1-1',
            '   2. item1-2',
            '2. item1-3',
            '   1. item1-4'
        ], new vscode_1.Selection(3, 3, 3, 3));
    });
    test("Backspace key. Fix ordered marker. 4: Multi-line list item", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '1. item1',
            '   1. item1-1',
            '      item1-2',
            '   2. item1-3',
            '   3. item1-4'
        ], new vscode_1.Selection(3, 6, 3, 6), [
            '1. item1',
            '   1. item1-1',
            '      item1-2',
            '2. item1-3',
            '   1. item1-4'
        ], new vscode_1.Selection(3, 3, 3, 3));
    });
    test("Backspace key. Fix ordered marker. 5: Selection range", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '1. item1',
            '2. item2',
            '   1. item1-1',
            '   2. item1-2',
            '   3. item1-3',
            '3. item3'
        ], new vscode_1.Selection(1, 0, 3, 0), [
            '1. item1',
            '   1. item1-2',
            '   2. item1-3',
            '2. item3'
        ], new vscode_1.Selection(1, 0, 1, 0));
    });
    test("Backspace key. GitHub#411", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '1. one',
            '2. ',
            '',
            '# Heading',
            '',
            '3. three'
        ], new vscode_1.Selection(1, 3, 1, 3), [
            '1. one',
            '   ',
            '',
            '# Heading',
            '',
            '3. three'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Backspace key. GitHub#1155 (tab indented list)", () => {
        return (0, generic_1.testCommand)('markdown.extension.onBackspaceKey', [
            '1. Item to be deleted',
            '2. First level 1',
            '	1. Second level 1',
            '	2. Second level 2',
            '3. First level 2',
            '	1. Second level 1',
            '	2. Second level 2'
        ], new vscode_1.Selection(0, 0, 1, 0), [
            '1. First level 1',
            '	1. Second level 1',
            '	2. Second level 2',
            '2. First level 2',
            '	1. Second level 1',
            '	2. Second level 2'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Tab key. Fix ordered marker. 1", () => {
        return (0, generic_1.testCommand)('markdown.extension.onTabKey', [
            '2. item1'
        ], new vscode_1.Selection(0, 3, 0, 3), [
            '    1. item1'
        ], new vscode_1.Selection(0, 7, 0, 7));
    });
    test("Tab key. Fix ordered marker. 2", () => {
        return (0, generic_1.testCommand)('markdown.extension.onTabKey', [
            '2. [ ] item1'
        ], new vscode_1.Selection(0, 7, 0, 7), [
            '    1. [ ] item1'
        ], new vscode_1.Selection(0, 11, 0, 11));
    });
    test("Tab key. Fix ordered marker. 3", () => {
        return (0, generic_1.testCommand)('markdown.extension.onTabKey', [
            '1. test',
            '   1. test',
            '   2. test',
            '2. test',
            '   1. test'
        ], new vscode_1.Selection(3, 3, 3, 3), [
            '1. test',
            '   1. test',
            '   2. test',
            '   3. test',
            '   4. test'
        ], new vscode_1.Selection(3, 6, 3, 6));
    });
    test("Tab key. Fix ordered marker. 4: Multi-line list item", () => {
        return (0, generic_1.testCommand)('markdown.extension.onTabKey', [
            '1. test',
            '   1. test',
            '      test',
            '2. test',
            '   1. test'
        ], new vscode_1.Selection(3, 3, 3, 3), [
            '1. test',
            '   1. test',
            '      test',
            '   2. test',
            '   3. test'
        ], new vscode_1.Selection(3, 6, 3, 6));
    });
    test("Tab key. Fix ordered marker. 5: Selection range", () => {
        return (0, generic_1.testCommand)('markdown.extension.onTabKey', [
            '1. test',
            '2. test',
            '   1. test',
            '   2. test',
            '3. test'
        ], new vscode_1.Selection(1, 0, 3, 0), [
            '1. test',
            '   1. test',
            '      1. test',
            '   2. test',
            '2. test'
        ], 
        // Should have been (1, 0, 3, 0) if we want to accurately mimic `editor.action.indentLines`
        new vscode_1.Selection(1, 3, 3, 0));
    });
    test("Move Line Up. 1: '2. |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onMoveLineUp', [
            '1. item1',
            '2. item2'
        ], new vscode_1.Selection(1, 3, 1, 3), [
            '1. item2',
            '2. item1'
        ], new vscode_1.Selection(0, 3, 0, 3));
    });
    test("Move Line Up. 2: '2.  |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onMoveLineUp', [
            '1.  item1',
            '2.  item2'
        ], new vscode_1.Selection(1, 3, 1, 3), [
            '1.  item2',
            '2.  item1'
        ], new vscode_1.Selection(0, 3, 0, 3));
    });
    test("Move Line Up. 3: '2. [ ] |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onMoveLineUp', [
            '1. [ ] item1',
            '2. [ ] item2'
        ], new vscode_1.Selection(1, 0, 1, 0), [
            '1. [ ] item2',
            '2. [ ] item1'
        ], new vscode_1.Selection(0, 0, 0, 0));
    });
    test("Move Line Down. 1: '1. |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onMoveLineDown', [
            '1. item1',
            '2. item2'
        ], new vscode_1.Selection(0, 3, 0, 3), [
            '1. item2',
            '2. item1'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Move Line Down. 2: '1.  |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onMoveLineDown', [
            '1.  item1',
            '2.  item2'
        ], new vscode_1.Selection(0, 3, 0, 3), [
            '1.  item2',
            '2.  item1'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Move Line Down. 3: '1. [ ] |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onMoveLineDown', [
            '1. [ ] item1',
            '2. [ ] item2'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '1. [ ] item2',
            '2. [ ] item1'
        ], new vscode_1.Selection(1, 0, 1, 0));
    });
    test("Copy Line Up. 1: '2. |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onCopyLineUp', [
            '1. item1',
            '2. item2'
        ], new vscode_1.Selection(1, 3, 1, 3), [
            '1. item1',
            '2. item2',
            '3. item2'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Copy Line Up. 2: '2.  |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onCopyLineUp', [
            '1.  item1',
            '2.  item2'
        ], new vscode_1.Selection(1, 3, 1, 3), [
            '1.  item1',
            '2.  item2',
            '3.  item2'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Copy Line Up. 3: '2. [ ] |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onCopyLineUp', [
            '1. [ ] item1',
            '2. [x] item2'
        ], new vscode_1.Selection(1, 0, 1, 0), [
            '1. [ ] item1',
            '2. [x] item2',
            '3. [x] item2'
        ], new vscode_1.Selection(1, 0, 1, 0));
    });
    test("Copy Line Down. 1: '1. |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onCopyLineDown', [
            '1. item1',
            '2. item2'
        ], new vscode_1.Selection(0, 3, 0, 3), [
            '1. item1',
            '2. item1',
            '3. item2'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Copy Line Down. 2: '1.  |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onCopyLineDown', [
            '1.  item1',
            '2.  item2'
        ], new vscode_1.Selection(0, 3, 0, 3), [
            '1.  item1',
            '2.  item1',
            '3.  item2'
        ], new vscode_1.Selection(1, 3, 1, 3));
    });
    test("Copy Line Down. 3: '1. [ ] |'", () => {
        return (0, generic_1.testCommand)('markdown.extension.onCopyLineDown', [
            '1. [x] item1',
            '2. [ ] item2'
        ], new vscode_1.Selection(0, 0, 0, 0), [
            '1. [x] item1',
            '2. [x] item1',
            '3. [ ] item2'
        ], new vscode_1.Selection(1, 0, 1, 0));
    });
    test("Indent Lines. 1: No selection range", () => {
        return (0, generic_1.testCommand)('markdown.extension.onIndentLines', [
            '1. test',
            '2. test',
            '   1. test',
            '3. test'
        ], new vscode_1.Selection(1, 5, 1, 5), [
            '1. test',
            '   1. test',
            '   2. test',
            '2. test'
        ], new vscode_1.Selection(1, 8, 1, 8));
    });
    test("Indent Lines. 2: Selection range", () => {
        return (0, generic_1.testCommand)('markdown.extension.onIndentLines', [
            '1. test',
            '2. test',
            '3. test',
            '   1. test',
            '4. test'
        ], new vscode_1.Selection(1, 0, 3, 0), [
            '1. test',
            '   1. test',
            '   2. test',
            '   3. test',
            '2. test'
        ], 
        // Should have been (1, 0, 3, 0) if we want to accurately mimic `editor.action.indentLines`
        new vscode_1.Selection(1, 3, 3, 0));
    });
    test("Outdent Lines. 1: No selection range", () => {
        return (0, generic_1.testCommand)('markdown.extension.onOutdentLines', [
            '1. test',
            '   1. test',
            '   2. test',
            '2. test'
        ], new vscode_1.Selection(1, 0, 1, 0), [
            '1. test',
            '2. test',
            '   1. test',
            '3. test'
        ], new vscode_1.Selection(1, 0, 1, 0));
    });
    test("Outdent Lines. 2: Selection range", () => {
        return (0, generic_1.testCommand)('markdown.extension.onOutdentLines', [
            '1. test',
            '   1. test',
            '   2. test',
            '   3. test',
            '2. test'
        ], new vscode_1.Selection(1, 0, 3, 0), [
            '1. test',
            '2. test',
            '3. test',
            '   1. test',
            '4. test'
        ], new vscode_1.Selection(1, 0, 3, 0));
    });
});
//# sourceMappingURL=listRenumbering.test.js.map