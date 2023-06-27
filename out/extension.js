'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const manager_1 = require("./configuration/manager");
const manager_2 = require("./editor-context-service/manager");
const decorationManager_1 = require("./theming/decorationManager");
const completion = require("./completion");
const formatting = require("./formatting");
const listEditing = require("./listEditing");
const vuepress = require("./vuepress");
const markdownEngine_1 = require("./markdownEngine");
const markdown_it_plugin_provider_1 = require("./markdown-it-plugin-provider");
const nls_1 = require("./nls");
const resolveResource_1 = require("./nls/resolveResource");
const preview = require("./preview");
const print = require("./print");
const tableFormatter = require("./tableFormatter");
const toc = require("./toc");
function activate(context) {
    (0, nls_1.config)({ extensionContext: context });
    context.subscriptions.push(manager_1.configManager, manager_2.contextServiceManager, decorationManager_1.decorationManager, markdownEngine_1.commonMarkEngine, markdownEngine_1.mdEngine);
    activateMdExt(context);
    return { extendMarkdownIt: markdown_it_plugin_provider_1.extendMarkdownIt };
}
exports.activate = activate;
function activateMdExt(context) {
    // Context services
    manager_2.contextServiceManager.activate(context);
    // Override `Enter`, `Tab` and `Backspace` keys
    listEditing.activate(context);
    // Shortcuts
    formatting.activate(context);
    // Vuepress
    vuepress.activate(context);
    // Toc
    toc.activate(context);
    // Images paths and math commands completions
    completion.activate(context);
    // Print to PDF
    print.activate(context);
    // Table formatter
    tableFormatter.activate(context);
    // Auto show preview to side
    preview.activate(context);
    // Allow `*` in word pattern for quick styling (toggle bold/italic without selection)
    // original https://github.com/microsoft/vscode/blob/3e5c7e2c570a729e664253baceaf443b69e82da6/extensions/markdown-basics/language-configuration.json#L55
    vscode_1.languages.setLanguageConfiguration('markdown', {
        wordPattern: /([*_]{1,2}|~~|`+)?[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+(_+[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+)*\1/gu
    });
    showWelcome(context);
}
/**
 * Shows a welcome message on first time startup.
 */
async function showWelcome(context) {
    const welcomeDirUri = vscode_1.Uri.joinPath(context.extensionUri, "welcome");
    // The directory for an extension is recreated every time VS Code installs it.
    // Thus, we only need to read and write an empty flag file there.
    // If the file exists, then it's not the first time, and we don't need to do anything.
    const flagFileUri = vscode_1.Uri.joinPath(welcomeDirUri, "WELCOMED");
    try {
        await vscode_1.workspace.fs.stat(flagFileUri);
        return;
    }
    catch {
        vscode_1.workspace.fs.writeFile(flagFileUri, new Uint8Array()).then(() => { }, () => { });
    }
    // The existence of welcome materials depends on build options we set during pre-publish.
    // If any condition is not met, then we don't need to do anything.
    try {
        // Confirm the message is valid.
        // `locale` should be a string. But here we keep it `any` to suppress type checking.
        const locale = JSON.parse(process.env.VSCODE_NLS_CONFIG).locale;
        const welcomeMessageFileUri = vscode_1.Uri.file((0, resolveResource_1.default)(welcomeDirUri.fsPath, "", ".txt", [locale, "en"], "")[0]);
        const msgWelcome = Buffer.from(await vscode_1.workspace.fs.readFile(welcomeMessageFileUri)).toString("utf8");
        if (/^\s*$/.test(msgWelcome) || /\p{C}/u.test(msgWelcome)) {
            return;
        }
        // Confirm the file exists.
        const changelogFileUri = vscode_1.Uri.joinPath(context.extensionUri, "changes.md");
        await vscode_1.workspace.fs.stat(changelogFileUri);
        const btnDismiss = (0, nls_1.localize)("ui.welcome.buttonDismiss");
        const btnOpenLocal = (0, nls_1.localize)("ui.welcome.buttonOpenLocal");
        vscode_1.window.showInformationMessage(msgWelcome, btnOpenLocal, btnDismiss).then(selection => {
            switch (selection) {
                case btnOpenLocal:
                    vscode_1.workspace.openTextDocument(changelogFileUri).then(vscode_1.window.showTextDocument);
                    return;
            }
        });
    }
    catch { }
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map