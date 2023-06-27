"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const configuration_1 = require("../util/configuration");
const generic_1 = require("../util/generic");
suite("Formatting.", () => {
    suiteSetup(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    suiteTeardown(async () => {
        await (0, configuration_1.resetConfiguration)();
    });
    test("Toggle bold. `text |` -> `text **|**`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['text '], new vscode_1.Selection(0, 5, 0, 5), ['text ****'], new vscode_1.Selection(0, 7, 0, 7));
    });
    test("Toggle bold. `text **|**` -> `text |`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['text ****'], new vscode_1.Selection(0, 7, 0, 7), ['text '], new vscode_1.Selection(0, 5, 0, 5));
    });
    test("Toggle bold. `text**|**` -> `text|`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['text****'], new vscode_1.Selection(0, 6, 0, 6), ['text'], new vscode_1.Selection(0, 4, 0, 4));
    });
    test("Toggle bold. `**text|**` -> `**text**|`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['**text**'], new vscode_1.Selection(0, 6, 0, 6), ['**text**'], new vscode_1.Selection(0, 8, 0, 8));
    });
    test("Toggle bold. `text|` -> `**text**|`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['text'], new vscode_1.Selection(0, 4, 0, 4), ['**text**'], new vscode_1.Selection(0, 8, 0, 8));
    });
    test("Toggle bold. `te|xt` -> `**te|xt**`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['text'], new vscode_1.Selection(0, 2, 0, 2), ['**text**'], new vscode_1.Selection(0, 4, 0, 4));
    });
    test("Toggle bold. `**text**|` -> `text|`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['**text**'], new vscode_1.Selection(0, 8, 0, 8), ['text'], new vscode_1.Selection(0, 4, 0, 4));
    });
    test("Toggle bold. `**te|xt**` -> `te|xt`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['**text**'], new vscode_1.Selection(0, 4, 0, 4), ['text'], new vscode_1.Selection(0, 2, 0, 2));
    });
    test("Toggle bold. With selection. Toggle on", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['text'], new vscode_1.Selection(0, 0, 0, 4), ['**text**'], new vscode_1.Selection(0, 0, 0, 8));
    });
    test("Toggle bold. With selection. Toggle off", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['**text**'], new vscode_1.Selection(0, 0, 0, 8), ['text'], new vscode_1.Selection(0, 0, 0, 4));
    });
    test("Toggle bold. Use `__`", async () => {
        await (0, configuration_1.updateConfiguration)({ config: [["markdown.extension.bold.indicator", "__"]] });
        await (0, generic_1.testCommand)('markdown.extension.editing.toggleBold', ['text'], new vscode_1.Selection(0, 0, 0, 4), ['__text__'], new vscode_1.Selection(0, 0, 0, 8));
        await (0, configuration_1.resetConfiguration)();
    });
    test("Toggle italic. Use `*`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleItalic', ['text'], new vscode_1.Selection(0, 0, 0, 4), ['*text*'], new vscode_1.Selection(0, 0, 0, 6));
    });
    test("Toggle italic. Use `_`", async () => {
        await (0, configuration_1.updateConfiguration)({ config: [["markdown.extension.italic.indicator", "_"]] });
        await (0, generic_1.testCommand)('markdown.extension.editing.toggleItalic', ['text'], new vscode_1.Selection(0, 0, 0, 4), ['_text_'], new vscode_1.Selection(0, 0, 0, 6));
        await (0, configuration_1.resetConfiguration)();
    });
    test("Toggle strikethrough. `text|` -> `~~text~~|`", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleStrikethrough', ['text'], new vscode_1.Selection(0, 4, 0, 4), ['~~text~~'], new vscode_1.Selection(0, 8, 0, 8));
    });
    test("Toggle strikethrough. List item", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleStrikethrough', ['- text text'], new vscode_1.Selection(0, 11, 0, 11), ['- ~~text text~~'], new vscode_1.Selection(0, 15, 0, 15));
    });
    test("Toggle strikethrough. Task list item", () => {
        return (0, generic_1.testCommand)('markdown.extension.editing.toggleStrikethrough', ['- [ ] text text'], new vscode_1.Selection(0, 15, 0, 15), ['- [ ] ~~text text~~'], new vscode_1.Selection(0, 19, 0, 19));
    });
    // disclaimer: I am not sure about this code. Looks like it works fine, but I am not fully understand how it works underneath.
    test("Paste link on selected text. `|text|` -> `[text|](link)`", async () => {
        const link = 'http://just.a.link';
        await vscode_1.env.clipboard.writeText(link);
        return (0, generic_1.testCommand)('markdown.extension.editing.paste', ['text'], new vscode_1.Selection(0, 0, 0, 4), ['[text](' + link + ')'], new vscode_1.Selection(0, 5, 0, 5));
    });
});
//# sourceMappingURL=formatting.test.js.map