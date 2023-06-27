'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
const entities_1 = require("entities");
const nls_1 = require("./nls");
const markdownEngine_1 = require("./markdownEngine");
const generic_1 = require("./util/generic");
let thisContext;
function activate(context) {
    thisContext = context;
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.printToHtml', () => { print('html'); }), vscode_1.commands.registerCommand('markdown.extension.printToHtmlBatch', () => { batchPrint(); }), vscode_1.workspace.onDidSaveTextDocument(onDidSave));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function onDidSave(doc) {
    if (doc.languageId === 'markdown'
        && vscode_1.workspace.getConfiguration('markdown.extension.print', doc.uri).get('onFileSave')) {
        print('html');
    }
}
async function print(type, uri, outFolder) {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor || !(0, generic_1.isMdDocument)(editor?.document)) {
        vscode_1.window.showErrorMessage((0, nls_1.localize)("ui.general.messageNoValidMarkdownFile"));
        return;
    }
    const doc = uri ? await vscode_1.workspace.openTextDocument(uri) : editor.document;
    if (doc.isDirty || doc.isUntitled) {
        doc.save();
    }
    const statusBarMessage = vscode_1.window.setStatusBarMessage("$(sync~spin) " + (0, nls_1.localize)("ui.exporting.messageExportingInProgress", path.basename(doc.fileName), type.toUpperCase()));
    if (outFolder && !fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }
    /**
     * Modified from <https://github.com/Microsoft/vscode/tree/master/extensions/markdown>
     * src/previewContentProvider MDDocumentContentProvider provideTextDocumentContent
     */
    let outPath = outFolder ? path.join(outFolder, path.basename(doc.fileName)) : doc.fileName;
    outPath = outPath.replace(/\.\w+?$/, `.${type}`);
    outPath = outPath.replace(/^([cdefghij]):\\/, function (_, p1) {
        return `${p1.toUpperCase()}:\\`; // Capitalize drive letter
    });
    if (!outPath.endsWith(`.${type}`)) {
        outPath += `.${type}`;
    }
    //// Determine document title.
    // 1. If the document begins with a comment like `<!-- title: Document Title -->`, use it. Empty title is not allow here. (GitHub #506)
    // 2. Else, find the first ATX heading, and use it.
    const firstLineText = doc.lineAt(0).text;
    // The lazy quantifier and `trim()` can avoid mistakenly capturing cases like:
    // <!-- title:-->-->
    // <!-- title: --> -->
    let m = /^<!-- title:(.*?)-->/.exec(firstLineText);
    let title = m === null ? undefined : m[1].trim();
    // Empty string is also falsy.
    if (!title) {
        // Editors treat `\r\n`, `\n`, and `\r` as EOL.
        // Since we don't care about line numbers, a simple alternation is enough and slightly faster.
        title = doc.getText().split(/\n|\r/g).find(lineText => lineText.startsWith('#') && /^#{1,6} /.test(lineText));
        if (title) {
            title = title.replace(/<!--(.*?)-->/g, '');
            title = title.trim().replace(/^#+/, '').replace(/#+$/, '').trim();
        }
    }
    //// Render body HTML.
    let body = await markdownEngine_1.mdEngine.render(doc.getText(), vscode_1.workspace.getConfiguration('markdown.preview', doc.uri));
    //// Image paths
    const config = vscode_1.workspace.getConfiguration('markdown.extension', doc.uri);
    const configToBase64 = config.get('print.imgToBase64');
    const configAbsPath = config.get('print.absoluteImgPath');
    const imgTagRegex = /(<img[^>]+src=")([^"]+)("[^>]*>)/g; // Match '<img...src="..."...>'
    if (configToBase64) {
        body = body.replace(imgTagRegex, function (_, p1, p2, p3) {
            if (p2.startsWith('http') || p2.startsWith('data:')) {
                return _;
            }
            const imgSrc = relToAbsPath(doc.uri, p2);
            try {
                let imgExt = path.extname(imgSrc).slice(1);
                if (imgExt === "jpg") {
                    imgExt = "jpeg";
                }
                else if (imgExt === "svg") {
                    imgExt += "+xml";
                }
                const file = fs.readFileSync(imgSrc.replace(/%20/g, '\ ')).toString('base64');
                return `${p1}data:image/${imgExt};base64,${file}${p3}`;
            }
            catch (e) {
                vscode_1.window.showWarningMessage((0, nls_1.localize)("ui.general.messageUnableToReadFile", imgSrc) + ` ${(0, nls_1.localize)("ui.exporting.messageRevertingToImagePaths")} (${doc.fileName})`);
            }
            if (configAbsPath) {
                return `${p1}file:///${imgSrc}${p3}`;
            }
            else {
                return _;
            }
        });
    }
    else if (configAbsPath) {
        body = body.replace(imgTagRegex, function (_, p1, p2, p3) {
            if (p2.startsWith('http') || p2.startsWith('data:')) {
                return _;
            }
            const imgSrc = relToAbsPath(doc.uri, p2);
            // Absolute paths need `file:///` but relative paths don't
            return `${p1}file:///${imgSrc}${p3}`;
        });
    }
    //// Convert `.md` links to `.html` by default (#667)
    const hrefRegex = /(<a[^>]+href=")([^"]+)("[^>]*>)/g; // Match '<a...href="..."...>'
    body = body.replace(hrefRegex, function (_, g1, g2, g3) {
        if (g2.endsWith('.md')) {
            return `${g1}${g2.replace(/\.md$/, '.html')}${g3}`;
        }
        else {
            return _;
        }
    });
    const hasMath = hasMathEnv(doc.getText());
    const extensionStyles = await getPreviewExtensionStyles();
    const extensionScripts = await getPreviewExtensionScripts();
    const includeVscodeStyles = config.get('print.includeVscodeStylesheets');
    const themeKind = config.get('print.theme');
    const themeClass = themeKind === 'light' ? 'vscode-light' : themeKind === 'dark' ? 'vscode-dark' : '';
    const html = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${title ? (0, entities_1.encodeHTML)(title) : ''}</title>
        ${extensionStyles}
        ${getStyles(doc.uri, hasMath, includeVscodeStyles)}
    </head>
    <body class="vscode-body ${themeClass}">
        ${body}
        ${hasMath ? '<script async src="https://cdn.jsdelivr.net/npm/katex-copytex@latest/dist/katex-copytex.min.js"></script>' : ''}
        ${extensionScripts}
    </body>
    </html>`;
    switch (type) {
        case 'html':
            fs.writeFile(outPath, html, 'utf-8', function (err) {
                if (err) {
                    console.log(err);
                }
            });
            break;
        case 'pdf':
            break;
    }
    // Hold the message for extra 500ms, in case the operation finished very fast.
    setTimeout(() => statusBarMessage.dispose(), 500);
}
function batchPrint() {
    const doc = vscode_1.window.activeTextEditor?.document;
    // @ts-ignore Needs refactoring.
    const root = vscode_1.workspace.getWorkspaceFolder(doc.uri).uri;
    vscode_1.window.showOpenDialog({ defaultUri: root, openLabel: 'Select source folder', canSelectFiles: false, canSelectFolders: true }).then(uris => {
        if (uris && uris.length > 0) {
            const selectedPath = uris[0].fsPath;
            const relPath = path.relative(root.fsPath, selectedPath);
            if (relPath.startsWith('..')) {
                vscode_1.window.showErrorMessage('Cannot use a path outside the current folder');
                return;
            }
            vscode_1.workspace.findFiles((relPath.length > 0 ? relPath + '/' : '') + '**/*.{md}', '{**/node_modules,**/bower_components,**/*.code-search}').then(uris => {
                vscode_1.window.showInputBox({
                    value: selectedPath + path.sep + 'out',
                    valueSelection: [selectedPath.length + 1, selectedPath.length + 4],
                    prompt: 'Please specify an output folder'
                }).then(outFolder => {
                    uris.forEach(uri => {
                        print('html', uri, path.join(outFolder, path.relative(selectedPath, path.dirname(uri.fsPath))));
                    });
                });
            });
        }
    });
}
function hasMathEnv(text) {
    // I'm lazy
    return text.includes('$');
}
function getMediaPath(mediaFile) {
    return thisContext.asAbsolutePath(path.join('media', mediaFile));
}
function wrapWithStyleTag(src) {
    if (src.startsWith('http')) {
        return `<link rel="stylesheet" href="${src}">`;
    }
    else {
        return `<style>\n${readCss(src)}\n</style>`;
    }
}
function readCss(fileName) {
    try {
        return fs.readFileSync(fileName).toString();
    }
    catch (error) {
        // https://nodejs.org/docs/latest-v12.x/api/errors.html#errors_class_systemerror
        vscode_1.window.showWarningMessage((0, nls_1.localize)("ui.exporting.messageCustomCssNotFound", error.path));
        return '';
    }
}
function getStyles(uri, hasMathEnv, includeVscodeStyles) {
    const katexCss = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">';
    const markdownCss = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Microsoft/vscode/extensions/markdown-language-features/media/markdown.css">';
    const highlightCss = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Microsoft/vscode/extensions/markdown-language-features/media/highlight.css">';
    const copyTeXCss = '<link href="https://cdn.jsdelivr.net/npm/katex-copytex@latest/dist/katex-copytex.min.css" rel="stylesheet" type="text/css">';
    const baseCssPaths = ['checkbox.css'].map(s => getMediaPath(s));
    const customCssPaths = getCustomStyleSheets(uri);
    return `${hasMathEnv ? katexCss + '\n' + copyTeXCss : ''}
        ${includeVscodeStyles
        ? markdownCss + '\n' + highlightCss + '\n' + getPreviewSettingStyles()
        : ''}
        ${baseCssPaths.map(cssSrc => wrapWithStyleTag(cssSrc)).join('\n')}
        ${customCssPaths.map(cssSrc => wrapWithStyleTag(cssSrc)).join('\n')}`;
}
function getCustomStyleSheets(resource) {
    const styles = vscode_1.workspace.getConfiguration('markdown', resource)['styles'];
    if (styles && Array.isArray(styles) && styles.length > 0) {
        const root = vscode_1.workspace.getWorkspaceFolder(resource);
        return styles.map(s => {
            if (!s || s.startsWith('http') || path.isAbsolute(s)) {
                return s;
            }
            if (root) {
                return path.join(root.uri.fsPath, s);
            }
            else {
                // Otherwise look relative to the markdown file
                return path.join(path.dirname(resource.fsPath), s);
            }
        });
    }
    return [];
}
function relToAbsPath(resource, href) {
    if (!href || href.startsWith('http') || path.isAbsolute(href)) {
        return href;
    }
    // Otherwise look relative to the markdown file
    return path.join(path.dirname(resource.fsPath), href);
}
function getPreviewSettingStyles() {
    const previewSettings = vscode_1.workspace.getConfiguration('markdown')['preview'];
    if (!previewSettings) {
        return '';
    }
    const { fontFamily, fontSize, lineHeight } = previewSettings;
    return `<style>
            body {
                ${fontFamily ? `font-family: ${fontFamily};` : ''}
                ${+fontSize > 0 ? `font-size: ${fontSize}px;` : ''}
                ${+lineHeight > 0 ? `line-height: ${lineHeight};` : ''}
            }
        </style>`;
}
async function getPreviewExtensionStyles() {
    var result = "<style>\n";
    for (const contribute of markdownEngine_1.mdEngine.contributionsProvider.contributions) {
        if (!contribute.previewStyles || !contribute.previewStyles.length) {
            continue;
        }
        result += `/* From extension ${contribute.extensionId} */\n`;
        for (const styleFile of contribute.previewStyles) {
            try {
                result += await fs.promises.readFile(styleFile.fsPath, { encoding: "utf8" });
            }
            catch (error) {
                result += "/* Error */";
            }
            result += "\n";
        }
    }
    result += "</style>";
    return result;
}
async function getPreviewExtensionScripts() {
    var result = "";
    for (const contribute of markdownEngine_1.mdEngine.contributionsProvider.contributions) {
        if (!contribute.previewScripts || !contribute.previewScripts.length) {
            continue;
        }
        for (const scriptFile of contribute.previewScripts) {
            result += `<script async type="text/javascript">\n/* From extension ${contribute.extensionId} */\n`;
            try {
                result += await fs.promises.readFile(scriptFile.fsPath, { encoding: "utf8" });
            }
            catch (error) {
                result += "/* Error */";
            }
            result += `\n</script>\n`;
        }
    }
    return result;
}
//# sourceMappingURL=print.js.map