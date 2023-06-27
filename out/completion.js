'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const fs = require("fs");
const image_size_1 = require("image-size");
const path = require("path");
const vscode_1 = require("vscode");
const manager_1 = require("./configuration/manager");
const toc_1 = require("./toc");
const contextCheck_1 = require("./util/contextCheck");
const generic_1 = require("./util/generic");
const katexFuncs = require("./util/katex-funcs");
function activate(context) {
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(generic_1.Document_Selector_Markdown, new MdCompletionItemProvider(), '(', '\\', '/', '[', '#'));
}
exports.activate = activate;
class MdCompletionItemProvider {
    constructor() {
        this.RXlookbehind = String.raw `(?<=(^[>]? {0,3}\[[ \t\r\n\f\v]*))`; // newline, not quoted, max 3 spaces, open [
        this.RXlinklabel = String.raw `(?<linklabel>([^\]]|(\\\]))*)`; // string for linklabel, allows for /] in linklabel
        this.RXlink = String.raw `(?<link>((<[^>]*>)|([^< \t\r\n\f\v]+)))`; // link either <mylink> or mylink
        this.RXlinktitle = String.raw `(?<title>[ \t\r\n\f\v]+(("([^"]|(\\"))*")|('([^']|(\\'))*')))?$)`; // optional linktitle in "" or ''
        this.RXlookahead = String.raw `(?=(\]:[ \t\r\n\f\v]*` // close linklabel with ]:
            + this.RXlink + this.RXlinktitle + String.raw `)`; // end regex
        this.RXflags = String.raw `mg`; // multiline & global
        // This pattern matches linklabels in link references definitions:  [linklabel]: link "link title"
        this.Link_Label_Pattern = new RegExp(this.RXlookbehind + this.RXlinklabel + this.RXlookahead, this.RXflags);
        // \cmd
        let c1 = Array.from(new Set([
            ...katexFuncs.delimiters0, ...katexFuncs.delimeterSizing0,
            ...katexFuncs.greekLetters0, ...katexFuncs.otherLetters0,
            ...katexFuncs.spacing0, ...katexFuncs.verticalLayout0,
            ...katexFuncs.logicAndSetTheory0, ...katexFuncs.macros0, ...katexFuncs.bigOperators0,
            ...katexFuncs.binaryOperators0, ...katexFuncs.binomialCoefficients0,
            ...katexFuncs.fractions0, ...katexFuncs.mathOperators0,
            ...katexFuncs.relations0, ...katexFuncs.negatedRelations0,
            ...katexFuncs.arrows0, ...katexFuncs.font0, ...katexFuncs.size0,
            ...katexFuncs.style0, ...katexFuncs.symbolsAndPunctuation0,
            ...katexFuncs.debugging0
        ])).map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = cmd;
            return item;
        });
        // \cmd{$1}
        let c2 = Array.from(new Set([
            ...katexFuncs.accents1, ...katexFuncs.annotation1,
            ...katexFuncs.verticalLayout1, ...katexFuncs.overlap1, ...katexFuncs.spacing1,
            ...katexFuncs.logicAndSetTheory1, ...katexFuncs.mathOperators1, ...katexFuncs.sqrt1,
            ...katexFuncs.extensibleArrows1, ...katexFuncs.font1,
            ...katexFuncs.braketNotation1, ...katexFuncs.classAssignment1
        ])).map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = new vscode_1.SnippetString(`${cmd}\{$1\}`);
            return item;
        });
        // \cmd{$1}{$2}
        let c3 = Array.from(new Set([
            ...katexFuncs.verticalLayout2, ...katexFuncs.binomialCoefficients2,
            ...katexFuncs.fractions2, ...katexFuncs.color2
        ])).map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = new vscode_1.SnippetString(`${cmd}\{$1\}\{$2\}`);
            return item;
        });
        let envSnippet = new vscode_1.CompletionItem('\\begin', vscode_1.CompletionItemKind.Snippet);
        envSnippet.insertText = new vscode_1.SnippetString('begin{${1|' + katexFuncs.envs.join(',') + '|}}\n\t$2\n\\end{$1}');
        // Pretend to support multi-workspacefolders
        const folder = vscode_1.workspace.workspaceFolders?.[0]?.uri;
        // Import macros from configurations
        const configMacros = manager_1.configManager.get("katex.macros", folder);
        var macroItems = [];
        for (const [cmd, expansion] of Object.entries(configMacros)) {
            let item = new vscode_1.CompletionItem(cmd, vscode_1.CompletionItemKind.Function);
            // Find the number of arguments in the expansion
            let numArgs = 0;
            for (let i = 1; i < 10; i++) {
                if (!expansion.includes(`#${i}`)) {
                    numArgs = i - 1;
                    break;
                }
            }
            item.insertText = new vscode_1.SnippetString(cmd.slice(1) + [...Array(numArgs).keys()].map(i => `\{$${i + 1}\}`).join(""));
            macroItems.push(item);
        }
        this.mathCompletions = [...c1, ...c2, ...c3, envSnippet, ...macroItems];
        // Sort
        for (const item of this.mathCompletions) {
            const label = typeof item.label === "string" ? item.label : item.label.label;
            item.sortText = label.replace(/[a-zA-Z]/g, (c) => {
                if (/[a-z]/.test(c)) {
                    return `0${c}`;
                }
                else {
                    return `1${c.toLowerCase()}`;
                }
            });
        }
        const Always_Exclude = ["**/node_modules", "**/bower_components", "**/*.code-search", "**/.git"];
        const excludePatterns = new Set(Always_Exclude);
        if (manager_1.configManager.get("completion.respectVscodeSearchExclude", folder)) {
            const vscodeSearchExclude = manager_1.configManager.getByAbsolute("search.exclude", folder);
            for (const [pattern, enabled] of Object.entries(vscodeSearchExclude)) {
                if (enabled) {
                    excludePatterns.add(pattern);
                }
            }
        }
        this.EXCLUDE_GLOB = "{" + Array.from(excludePatterns).join(",") + "}";
    }
    async provideCompletionItems(document, position, token, _context) {
        const lineTextBefore = document.lineAt(position.line).text.substring(0, position.character);
        const lineTextAfter = document.lineAt(position.line).text.substring(position.character);
        let matches;
        matches = lineTextBefore.match(/\\+$/);
        // Math functions
        // ==============
        if (
        // ends with an odd number of backslashes
        (matches = lineTextBefore.match(/\\+$/)) !== null
            && matches[0].length % 2 !== 0) {
            if ((0, contextCheck_1.mathEnvCheck)(document, position) === "") {
                return [];
            }
            else {
                return this.mathCompletions;
            }
        }
        // Reference link labels
        // =====================
        // e.g. [linklabel]: link "link title"
        if (/\[[^\[\]]*$/.test(lineTextBefore)) {
            return this.completeRefLinks(document, lineTextBefore, position, token);
        }
        const enabled = vscode_1.workspace.getConfiguration('markdown.extension.completion', document.uri).get('enabled', false);
        if (!enabled) {
            return [];
        }
        // Image paths
        // ===========
        if (/!\[[^\]]*?\]\([^\)]*$/.test(lineTextBefore) || /<img [^>]*src="[^"]*$/.test(lineTextBefore)) {
            return this.completeImgPaths(document, lineTextBefore);
        }
        // Links to heading
        // ================
        if (/\[[^\[\]]*?\]\(#[^#\)]*$/.test(lineTextBefore)
            || /^>? {0,3}\[[^\[\]]+?\]\:[ \t\f\v]*#[^#]*$/.test(lineTextBefore)
        // /\[[^\]]*\]\((\S*)#[^\)]*$/.test(lineTextBefore) // `[](url#anchor|` Link with anchor.
        // || /\[[^\]]*\]\:\s?(\S*)#$/.test(lineTextBefore) // `[]: url#anchor|` Link reference definition with anchor.
        ) {
            return this.completeLinksToHeading(document, position, lineTextBefore, lineTextAfter);
        }
        // File paths
        // ==========
        // should be after `completeLinksToHeading`
        if (/\[[^\[\]]*?\](?:(?:\([^\)]*)|(?:\:[ \t\f\v]*\S*))$/.test(lineTextBefore)) {
            return this.completeFilePaths(lineTextBefore, document);
        }
        return [];
    }
    completeImgPaths(document, lineTextBefore) {
        if (vscode_1.workspace.getWorkspaceFolder(document.uri) === undefined)
            return [];
        //// 🤔 better name?
        let typedDir;
        if (/!\[[^\]]*?\]\([^\)]*$/.test(lineTextBefore)) {
            //// `![](dir_here|)`
            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('](') + 2);
        }
        else {
            //// `<img src="dir_here|">`
            typedDir = lineTextBefore.substr(lineTextBefore.lastIndexOf('="') + 2);
        }
        const basePath = getBasepath(document, typedDir);
        const isRootedPath = typedDir.startsWith('/');
        return vscode_1.workspace.findFiles('**/*.{png,jpg,jpeg,svg,gif,webp}', this.EXCLUDE_GLOB).then(uris => {
            const items = [];
            for (const imgUri of uris) {
                const label = path.relative(basePath, imgUri.fsPath).replace(/\\/g, '/');
                if (isRootedPath && label.startsWith("..")) {
                    continue;
                }
                let item = new vscode_1.CompletionItem(label.replace(/ /g, '%20'), vscode_1.CompletionItemKind.File);
                items.push(item);
                //// Add image preview
                let dimensions;
                try {
                    // @ts-ignore Deprecated.
                    dimensions = (0, image_size_1.default)(imgUri.fsPath);
                }
                catch (error) {
                    console.error(error);
                    continue;
                }
                const maxWidth = 318;
                if (dimensions.width > maxWidth) {
                    dimensions.height = Number(dimensions.height * maxWidth / dimensions.width);
                    dimensions.width = maxWidth;
                }
                item.documentation = new vscode_1.MarkdownString(`![${label}](${imgUri.fsPath.replace(/ /g, '%20')}|width=${dimensions.width},height=${dimensions.height})`);
                item.sortText = label.replace(/\./g, '{');
            }
            return items;
        });
    }
    completeRefLinks(document, lineTextBefore, position, token) {
        // TODO: may be extracted to a seperate function and used for all completions in the future.
        const docText = document.getText();
        /**
         * NormalizedLabel (upper case) -> IReferenceDefinition
         */
        const refDefinitions = new Map();
        for (const match of docText.matchAll(this.Link_Label_Pattern)) {
            // Remove leading and trailing whitespace characters.
            const label = match[0].replace(/^[ \t\r\n\f\v]+/, '').replace(/[ \t\r\n\f\v]+$/, '');
            // For case-insensitive comparison.
            const normalizedLabel = label.toUpperCase();
            // The one that comes first in the document is used.
            if (!refDefinitions.has(normalizedLabel)) {
                refDefinitions.set(normalizedLabel, {
                    label,
                    usageCount: 0,
                });
            }
        }
        if (refDefinitions.size === 0 || token.isCancellationRequested) {
            return;
        }
        // A confusing feature from #414. Not sure how to get it work.
        const docLines = docText.split(/\r?\n/);
        for (const crtLine of docLines) {
            // Match something that may be a reference link.
            const pattern = /\[([^\[\]]+?)\](?![(:\[])/g;
            for (const match of crtLine.matchAll(pattern)) {
                const label = match[1];
                const record = refDefinitions.get(label.toUpperCase());
                if (record) {
                    record.usageCount++;
                }
            }
        }
        let startIndex = lineTextBefore.lastIndexOf('[');
        const range = new vscode_1.Range(position.with({ character: startIndex + 1 }), position);
        if (token.isCancellationRequested) {
            return;
        }
        const completionItems = Array.from(refDefinitions.values(), ref => {
            const label = ref.label;
            const item = new vscode_1.CompletionItem(label, vscode_1.CompletionItemKind.Reference);
            const usages = ref.usageCount;
            item.documentation = new vscode_1.MarkdownString(label);
            item.detail = usages === 1 ? `1 usage` : `${usages} usages`;
            // Prefer unused items. <https://github.com/yzhang-gh/vscode-markdown/pull/414#discussion_r272807189>
            item.sortText = usages === 0 ? `0-${label}` : `1-${label}`;
            item.range = range;
            return item;
        });
        return completionItems;
    }
    completeLinksToHeading(document, position, lineTextBefore, lineTextAfter) {
        let startIndex = lineTextBefore.lastIndexOf('#') - 1;
        let isLinkRefDefinition = /^>? {0,3}\[[^\[\]]+?\]\:[ \t\f\v]*#[^#]*$/.test(lineTextBefore); // The same as the 2nd conditon above.
        let endPosition = position;
        let addClosingParen = false;
        if (/^([^\) ]+\s*|^\s*)\)/.test(lineTextAfter)) {
            // try to detect if user wants to replace a link (i.e. matching closing paren and )
            // Either: ... <CURSOR> something <whitespace> )
            //     or: ... <CURSOR> <whitespace> )
            //     or: ... <CURSOR> )     (endPosition assignment is a no-op for this case)
            // in every case, we want to remove all characters after the cursor and before that first closing paren
            endPosition = position.with({ character: +endPosition.character + lineTextAfter.indexOf(')') });
        }
        else {
            // If no closing paren is found, replace all trailing non-white-space chars and add a closing paren
            // distance to first non-whitespace or EOL
            const toReplace = (lineTextAfter.search(/(?<=^\S+)(\s|$)/));
            endPosition = position.with({ character: +endPosition.character + toReplace });
            if (!isLinkRefDefinition) {
                addClosingParen = true;
            }
        }
        const range = new vscode_1.Range(position.with({ character: startIndex + 1 }), endPosition);
        return new Promise((res, _) => {
            const toc = (0, toc_1.getAllTocEntry)(document, { respectMagicCommentOmit: false, respectProjectLevelOmit: false });
            const headingCompletions = toc.map(heading => {
                const item = new vscode_1.CompletionItem('#' + heading.slug, vscode_1.CompletionItemKind.Reference);
                if (addClosingParen) {
                    item.insertText = item.label + ')';
                }
                item.documentation = heading.rawContent;
                item.range = range;
                return item;
            });
            res(headingCompletions);
        });
    }
    async completeFilePaths(lineTextBefore, document) {
        const typedDir = lineTextBefore.match(/(?<=((?:\]\()|(?:\]\:))[ \t\f\v]*)\S*$/)[0];
        const basePath = getBasepath(document, typedDir);
        const isRootedPath = typedDir.startsWith('/');
        const files = await vscode_1.workspace.findFiles("**/*", this.EXCLUDE_GLOB);
        const items = [];
        for (const uri of files) {
            const label = path.relative(basePath, uri.fsPath).replace(/\\/g, "/").replace(/ /g, "%20");
            if (isRootedPath && label.startsWith("..")) {
                continue;
            }
            const item = new vscode_1.CompletionItem(label, vscode_1.CompletionItemKind.File);
            item.sortText = label.replace(/\./g, "{");
            items.push(item);
        }
        return items;
    }
}
/**
 * @param doc
 * @param dir The dir already typed in the src field, e.g. `[alt text](dir_here|)`
 */
function getBasepath(doc, dir) {
    if (dir.includes('/')) {
        dir = dir.substr(0, dir.lastIndexOf('/') + 1);
    }
    else {
        dir = '';
    }
    let root = vscode_1.workspace.getWorkspaceFolder(doc.uri).uri.fsPath;
    const rootFolder = vscode_1.workspace.getConfiguration('markdown.extension.completion', doc.uri).get('root', '');
    if (rootFolder.length > 0 && fs.existsSync(path.join(root, rootFolder))) {
        root = path.join(root, rootFolder);
    }
    const basePath = path.join(dir.startsWith('/')
        ? root
        : path.dirname(doc.uri.fsPath), dir);
    return basePath;
}
//# sourceMappingURL=completion.js.map