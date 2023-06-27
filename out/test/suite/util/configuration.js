"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfiguration = exports.resetConfiguration = void 0;
const vscode = require("vscode");
const Default_Config = [
    ["markdown.extension.toc.levels", "1..6"],
    ["markdown.extension.toc.unorderedList.marker", "-"],
    ["markdown.extension.toc.orderedList", false],
    ["markdown.extension.toc.plaintext", false],
    ["markdown.extension.toc.updateOnSave", true],
    ["markdown.extension.toc.slugifyMode", "github"],
    ["markdown.extension.toc.omittedFromToc", Object.create(null)],
    ["markdown.extension.preview.autoShowPreviewToSide", false],
    ["markdown.extension.orderedList.marker", "ordered"],
    ["markdown.extension.italic.indicator", "*"],
    ["markdown.extension.bold.indicator", "**"],
    ["markdown.extension.tableFormatter.normalizeIndentation", false],
    ["markdown.extension.tableFormatter.delimiterRowNoPadding", false],
    ["editor.insertSpaces", true],
    ["editor.tabSize", 4],
];
function resetConfiguration(configurationTarget = true) {
    return updateConfiguration({ config: Default_Config, configurationTarget });
}
exports.resetConfiguration = resetConfiguration;
/**
 * A wrapper for `vscode.WorkspaceConfiguration.update()`.
 *
 * @param configurationTarget Defaults to `true` (Global).
 * @param overrideInLanguage Defaults to `undefined`.
 */
async function updateConfiguration({ config, configurationTarget = true, overrideInLanguage, }) {
    const configObj = vscode.workspace.getConfiguration();
    for (const [id, value] of config) {
        await configObj.update(id, value, configurationTarget, overrideInLanguage);
    }
}
exports.updateConfiguration = updateConfiguration;
//# sourceMappingURL=configuration.js.map