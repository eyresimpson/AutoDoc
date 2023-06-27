'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTocEntry = exports.getAllRootHeading = exports.activate = void 0;
const path = require("path");
const stringSimilarity = require("string-similarity");
const vscode_1 = require("vscode");
const markdownEngine_1 = require("./markdownEngine");
const generic_1 = require("./util/generic");
const slugify_1 = require("./util/slugify");
/**
 * Workspace config
 */
const docConfig = { tab: '  ', eol: '\r\n' };
const tocConfig = { startDepth: 1, endDepth: 6, listMarker: '-', orderedList: false, updateOnSave: false, plaintext: false, tabSize: 2 };
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.toc.create', createToc), vscode_1.commands.registerCommand('markdown.extension.toc.update', updateToc), vscode_1.commands.registerCommand('markdown.extension.toc.addSecNumbers', addSectionNumbers), vscode_1.commands.registerCommand('markdown.extension.toc.removeSecNumbers', removeSectionNumbers), vscode_1.workspace.onWillSaveTextDocument(onWillSave), vscode_1.languages.registerCodeLensProvider(generic_1.Document_Selector_Markdown, new TocCodeLensProvider()));
}
exports.activate = activate;
//#region TOC operation entrance
async function createToc() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor || !(0, generic_1.isMdDocument)(editor.document)) {
        return;
    }
    loadTocConfig(editor);
    let toc = await generateTocText(editor.document);
    await editor.edit(function (editBuilder) {
        editBuilder.delete(editor.selection);
        editBuilder.insert(editor.selection.active, toc);
    });
}
async function updateToc() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor || !(0, generic_1.isMdDocument)(editor.document)) {
        return;
    }
    loadTocConfig(editor);
    const doc = editor.document;
    const tocRangesAndText = await detectTocRanges(doc);
    const tocRanges = tocRangesAndText[0];
    const newToc = tocRangesAndText[1];
    await editor.edit(editBuilder => {
        for (const tocRange of tocRanges) {
            if (tocRange !== null) {
                const oldToc = doc.getText(tocRange).replace(/\r?\n|\r/g, docConfig.eol);
                if (oldToc !== newToc) {
                    const unchangedLength = commonPrefixLength(oldToc, newToc);
                    const newStart = doc.positionAt(doc.offsetAt(tocRange.start) + unchangedLength);
                    const replaceRange = tocRange.with(newStart);
                    if (replaceRange.isEmpty) {
                        editBuilder.insert(replaceRange.start, newToc.substring(unchangedLength));
                    }
                    else {
                        editBuilder.replace(replaceRange, newToc.substring(unchangedLength));
                    }
                }
            }
        }
    });
}
function addSectionNumbers() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor || !(0, generic_1.isMdDocument)(editor.document)) {
        return;
    }
    loadTocConfig(editor);
    const doc = editor.document;
    const toc = getAllRootHeading(doc, true, true)
        .filter(i => i.canInToc && i.level >= tocConfig.startDepth && i.level <= tocConfig.endDepth);
    if (toc.length === 0) {
        return;
    }
    const startDepth = Math.max(tocConfig.startDepth, Math.min(...toc.map(h => h.level)));
    let secNumbers = [0, 0, 0, 0, 0, 0];
    let edit = new vscode_1.WorkspaceEdit();
    toc.forEach(entry => {
        const level = entry.level;
        const lineNum = entry.lineIndex;
        secNumbers[level - 1] += 1;
        secNumbers.fill(0, level);
        const secNumStr = [...Array(level - startDepth + 1).keys()].map(num => `${secNumbers[num + startDepth - 1]}.`).join('');
        const lineText = doc.lineAt(lineNum).text;
        const newText = lineText.includes('#')
            ? lineText.replace(/^(\s{0,3}#+ +)((?:\d{1,9}\.)* )?(.*)/, (_, g1, _g2, g3) => `${g1}${secNumStr} ${g3}`)
            : lineText.replace(/^(\s{0,3})((?:\d{1,9}\.)* )?(.*)/, (_, g1, _g2, g3) => `${g1}${secNumStr} ${g3}`);
        edit.replace(doc.uri, doc.lineAt(lineNum).range, newText);
    });
    return vscode_1.workspace.applyEdit(edit);
}
function removeSectionNumbers() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor || !(0, generic_1.isMdDocument)(editor.document)) {
        return;
    }
    const doc = editor.document;
    const toc = getAllRootHeading(doc, false, false);
    let edit = new vscode_1.WorkspaceEdit();
    toc.forEach(entry => {
        const lineNum = entry.lineIndex;
        const lineText = doc.lineAt(lineNum).text;
        const newText = lineText.includes('#')
            ? lineText.replace(/^(\s{0,3}#+ +)((?:\d{1,9}\.)* )?(.*)/, (_, g1, _g2, g3) => `${g1}${g3}`)
            : lineText.replace(/^(\s{0,3})((?:\d{1,9}\.)* )?(.*)/, (_, g1, _g2, g3) => `${g1}${g3}`);
        edit.replace(doc.uri, doc.lineAt(lineNum).range, newText);
    });
    return vscode_1.workspace.applyEdit(edit);
}
function onWillSave(e) {
    if (!tocConfig.updateOnSave) {
        return;
    }
    if (e.document.languageId === 'markdown') {
        e.waitUntil(updateToc());
    }
}
//#endregion TOC operation entrance
/**
 * Returns a list of user defined excluded headings for the given document.
 * They are defined in the `toc.omittedFromToc` setting.
 * @param doc The document.
 */
function getProjectExcludedHeadings(doc) {
    const configObj = vscode_1.workspace.getConfiguration('markdown.extension.toc').get('omittedFromToc');
    if (typeof configObj !== 'object' || configObj === null) {
        vscode_1.window.showErrorMessage(`\`omittedFromToc\` must be an object (e.g. \`{"README.md": ["# Introduction"]}\`)`);
        return [];
    }
    const docUriString = doc.uri.toString();
    const docWorkspace = vscode_1.workspace.getWorkspaceFolder(doc.uri);
    const workspaceUri = docWorkspace ? docWorkspace.uri : undefined;
    // A few possible duplicate entries are bearable, thus, an array is enough.
    const omittedHeadings = [];
    for (const filePath of Object.keys(configObj)) {
        let entryUri;
        // Convert file system path to VS Code Uri.
        if (path.isAbsolute(filePath)) {
            entryUri = vscode_1.Uri.file(filePath);
        }
        else if (workspaceUri !== undefined) {
            entryUri = vscode_1.Uri.joinPath(workspaceUri, filePath);
        }
        else {
            continue; // Discard this entry.
        }
        // If the entry matches the document, read it.
        if (entryUri.toString() === docUriString) {
            if (Array.isArray(configObj[filePath])) {
                omittedHeadings.push(...configObj[filePath]);
            }
            else {
                vscode_1.window.showErrorMessage('Each property value of `omittedFromToc` setting must be a string array.');
            }
        }
    }
    return omittedHeadings.map(heading => {
        const matches = heading.match(/^ {0,3}(#{1,6})[ \t]+(.*)$/);
        if (matches === null) {
            vscode_1.window.showErrorMessage(`Invalid entry "${heading}" in \`omittedFromToc\``);
            return { level: -1, text: '' };
        }
        const [, sharps, name] = matches;
        return {
            level: sharps.length,
            text: name
        };
    });
}
/**
 * Generates the Markdown text representation of the TOC.
 */
// TODO: Redesign data structure to solve another bunch of bugs.
async function generateTocText(doc) {
    const orderedListMarkerIsOne = vscode_1.workspace.getConfiguration('markdown.extension.orderedList').get('marker') === 'one';
    const toc = [];
    const tocEntries = getAllTocEntry(doc, { respectMagicCommentOmit: true, respectProjectLevelOmit: true })
        .filter(i => i.canInToc && i.level >= tocConfig.startDepth && i.level <= tocConfig.endDepth); // Filter out excluded headings.
    if (tocEntries.length === 0) {
        return '';
    }
    // The actual level range of a document can be smaller than settings. So we need to calculate the real start level.
    const startDepth = Math.max(tocConfig.startDepth, Math.min(...tocEntries.map(h => h.level)));
    // Order counter for each heading level (from startDepth to endDepth), used only for ordered list
    const orderCounter = new Array(tocConfig.endDepth - startDepth + 1).fill(0);
    tocEntries.forEach(entry => {
        const relativeLevel = entry.level - startDepth;
        const currHeadingOrder = ++orderCounter[relativeLevel];
        let indentationFix = '';
        if (tocConfig.orderedList) {
            const shift = orderCounter.slice(0, relativeLevel).map(c => String(c).length - 1).reduce((a, b) => a + b, 0);
            indentationFix = ' '.repeat(shift);
        }
        const row = [
            docConfig.tab.repeat(relativeLevel) + indentationFix,
            (tocConfig.orderedList ? (orderedListMarkerIsOne ? '1' : currHeadingOrder) + '.' : tocConfig.listMarker) + ' ',
            tocConfig.plaintext ? entry.visibleText : `[${entry.visibleText}](#${entry.slug})`
        ];
        toc.push(row.join(''));
        // Reset order counter for its sub-headings
        if (tocConfig.orderedList) {
            orderCounter.fill(0, relativeLevel + 1);
        }
    });
    while (/^[ \t]/.test(toc[0])) {
        toc.shift();
    }
    toc.push(''); // Ensure the TOC text always ends with an EOL.
    return toc.join(docConfig.eol);
}
/**
 * Returns an array of TOC ranges.
 * If no TOC is found, returns an empty array.
 * @param doc a TextDocument
 */
async function detectTocRanges(doc) {
    const docTokens = (await markdownEngine_1.mdEngine.getDocumentToken(doc)).tokens;
    /**
     * `[beginLineIndex, endLineIndex, openingTokenIndex]`
     */
    const candidateLists = docTokens.reduce((result, token, index) => {
        if (token.level === 0
            && (token.type === 'bullet_list_open'
                || (token.type === 'ordered_list_open' && token.attrGet('start') === null))) {
            result.push([...token.map, index]);
        }
        return result;
    }, []);
    const tocRanges = [];
    const newTocText = await generateTocText(doc);
    for (const item of candidateLists) {
        const beginLineIndex = item[0];
        let endLineIndex = item[1];
        const opTokenIndex = item[2];
        //// #525 <!-- no toc --> comment
        if (beginLineIndex > 0
            && doc.lineAt(beginLineIndex - 1).text === '<!-- no toc -->') {
            continue;
        }
        // Check the first list item to see if it could be a TOC.
        //
        // ## Token stream
        //
        // +3 alway exists, even if it's an empty list.
        // In a target, +3 is `inline`:
        //
        // opTokenIndex: *_list_open
        // +1: list_item_open
        // +2: paragraph_open
        // +3: inline
        // +4: paragraph_close
        // ...
        // ...: list_item_close
        //
        // ## `inline.children`
        //
        // Ordinary TOC: `link_open`, ..., `link_close`.
        // Plain text TOC: No `link_*` tokens.
        const firstItemContent = docTokens[opTokenIndex + 3];
        if (firstItemContent.type !== 'inline') {
            continue;
        }
        const tokens = firstItemContent.children;
        if (vscode_1.workspace.getConfiguration('markdown.extension.toc').get('plaintext')) {
            if (tokens.some(t => t.type.startsWith('link_'))) {
                continue;
            }
        }
        else {
            if (!(tokens[0].type === 'link_open'
                && tokens[0].attrGet('href').startsWith('#') // Destination begins with `#`. (#304)
                && tokens.findIndex(t => t.type === 'link_close') === (tokens.length - 1) // Only one link. (#549, #683)
            )) {
                continue;
            }
        }
        // The original range may have trailing white lines.
        while (doc.lineAt(endLineIndex - 1).isEmptyOrWhitespace) {
            endLineIndex--;
        }
        const finalRange = new vscode_1.Range(new vscode_1.Position(beginLineIndex, 0), new vscode_1.Position(endLineIndex, 0));
        const listText = doc.getText(finalRange);
        if (radioOfCommonPrefix(newTocText, listText) + stringSimilarity.compareTwoStrings(newTocText, listText) > 0.5) {
            tocRanges.push(finalRange);
        }
    }
    return [tocRanges, newTocText];
}
function commonPrefixLength(s1, s2) {
    let minLength = Math.min(s1.length, s2.length);
    for (let i = 0; i < minLength; i++) {
        if (s1[i] !== s2[i]) {
            return i;
        }
    }
    return minLength;
}
function radioOfCommonPrefix(s1, s2) {
    let minLength = Math.min(s1.length, s2.length);
    let maxLength = Math.max(s1.length, s2.length);
    let prefixLength = commonPrefixLength(s1, s2);
    if (prefixLength < minLength) {
        return prefixLength / minLength;
    }
    else {
        return minLength / maxLength;
    }
}
/**
 * Updates `tocConfig` and `docConfig`.
 * @param editor The editor, from which we detect `docConfig`.
 */
function loadTocConfig(editor) {
    const tocSectionCfg = vscode_1.workspace.getConfiguration('markdown.extension.toc');
    const tocLevels = tocSectionCfg.get('levels');
    let matches;
    if (matches = tocLevels.match(/^([1-6])\.\.([1-6])$/)) {
        tocConfig.startDepth = Number(matches[1]);
        tocConfig.endDepth = Number(matches[2]);
    }
    tocConfig.orderedList = tocSectionCfg.get('orderedList');
    tocConfig.listMarker = tocSectionCfg.get('unorderedList.marker');
    tocConfig.plaintext = tocSectionCfg.get('plaintext');
    tocConfig.updateOnSave = tocSectionCfg.get('updateOnSave');
    // Load workspace config
    docConfig.eol = editor.document.eol === vscode_1.EndOfLine.CRLF ? '\r\n' : '\n';
    let tabSize = Number(editor.options.tabSize);
    // Seems not robust.
    if (vscode_1.workspace.getConfiguration('markdown.extension.list', editor.document.uri).get('indentationSize') === 'adaptive') {
        tabSize = tocConfig.orderedList ? 3 : 2;
    }
    const insertSpaces = editor.options.insertSpaces;
    if (insertSpaces) {
        docConfig.tab = ' '.repeat(tabSize);
    }
    else {
        docConfig.tab = '\t';
    }
}
/**
 * Extracts those that can be rendered to visible text from a string of CommonMark **inline** structures,
 * to create a single line string which can be safely used as **link text**.
 *
 * The result cannot be directly used as the content of a paragraph,
 * since this function does not escape all sequences that look like block structures.
 *
 * We roughly take GitLab's `[[_TOC_]]` as reference.
 *
 * @param raw - The Markdown string.
 * @param env - The markdown-it environment sandbox (**mutable**).
 * @returns A single line string, which only contains plain textual content,
 * backslash escape, code span, and emphasis.
 */
function createLinkText(raw, env) {
    const inlineTokens = markdownEngine_1.commonMarkEngine.engine.parseInline(raw, env)[0].children;
    return inlineTokens.reduce((result, token) => {
        switch (token.type) {
            case "text":
                return result + token.content.replace(/[&*<>\[\\\]_`]/g, "\\$&"); // Escape.
            case "code_inline":
                return result + token.markup + token.content + token.markup; // Emit as is.
            case "strong_open":
            case "strong_close":
            case "em_open":
            case "em_close":
                return result + token.markup; // Preserve emphasis indicators.
            case "link_open":
            case "link_close":
            case "image":
            case "html_inline":
                return result; // Discard them.
            case "softbreak":
            case "hardbreak":
                return result + " "; // Replace line breaks with spaces.
            default:
                return result + token.content;
        }
    }, "");
}
//#region Public utility
/**
 * Gets all headings in the root of the text document.
 *
 * The optional parameters default to `false`.
 * @returns In ascending order of `lineIndex`.
 */
function getAllRootHeading(doc, respectMagicCommentOmit = false, respectProjectLevelOmit = false) {
    /**
     * Replaces line content with empty.
     * @param foundStr The multiline string.
     */
    const replacer = (foundStr) => foundStr.replace(/[^\r\n]/g, '');
    /*
     * Text normalization
     * ==================
     * including:
     *
     * 1. (easy) YAML front matter, tab to spaces, HTML comment, Markdown fenced code blocks
     * 2. (complex) Setext headings to ATX headings
     * 3. Remove trailing space or tab characters.
     *
     * Note:
     * When recognizing or trimming whitespace characters, comply with the CommonMark Spec.
     * Do not use anything that defines whitespace as per ECMAScript, like `trim()`. <https://tc39.es/ecma262/#sec-trimstring>
     */
    // (easy)
    const lines = doc.getText()
        .replace(/^---.+?(?:\r?\n)---(?=[ \t]*\r?\n)/s, replacer) //// Remove YAML front matter
        .replace(/^\t+/gm, (match) => '    '.repeat(match.length)) // <https://spec.commonmark.org/0.29/#tabs>
        .replace(/^( {0,3})<!--([^]*?)-->.*$/gm, (match, leading, content) => {
        // Remove HTML block comment, together with all the text in the lines it occupies. <https://spec.commonmark.org/0.29/#html-blocks>
        // Exclude our magic comment.
        if (leading.length === 0 && /omit (in|from) toc/.test(content)) {
            return match;
        }
        else {
            return replacer(match);
        }
    })
        .replace(generic_1.Regexp_Fenced_Code_Block, replacer) //// Remove fenced code blocks (and #603, #675)
        .split(/\r?\n/g);
    // Do transformations as many as possible in one loop, to save time.
    lines.forEach((lineText, i, arr) => {
        // (complex) Setext headings to ATX headings.
        // Still cannot perfectly handle some weird cases, for example:
        // * Multiline heading.
        // * A setext heading next to a list.
        if (i < arr.length - 1 // The current line is not the last.
            && /^ {0,3}(?:=+|-+)[ \t]*$/.test(arr[i + 1]) // The next line is a setext heading underline.
            && /^ {0,3}[^ \t\f\v]/.test(lineText) // The indentation of the line is 0~3.
            && !/^ {0,3}#{1,6}(?: |\t|$)/.test(lineText) // The line is not an ATX heading.
            && !/^ {0,3}(?:[*+-]|\d{1,9}(?:\.|\)))(?: |\t|$)/.test(lineText) // The line is not a list item.
            && !/^ {0,3}>/.test(lineText) // The line is not a block quote.
            // #629: Consecutive thematic breaks false positive. <https://github.com/commonmark/commonmark.js/blob/75474b071da06535c23adc17ac4132213ab31934/lib/blocks.js#L36>
            && !/^ {0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})[ \t]*$/.test(lineText)) {
            arr[i] = (arr[i + 1].includes('=') ? '# ' : '## ') + lineText;
            arr[i + 1] = '';
        }
        // Remove trailing space or tab characters.
        // Since they have no effect on subsequent operations, and removing them can simplify those operations.
        // <https://github.com/commonmark/commonmark.js/blob/75474b071da06535c23adc17ac4132213ab31934/lib/blocks.js#L503-L507>
        arr[i] = arr[i].replace(/[ \t]+$/, '');
    });
    /*
     * Mark omitted headings
     * =====================
     *
     * - headings with magic comment `<!-- omit from toc -->` (on their own)
     * - headings from `getProjectExcludedHeadings()` (and their subheadings)
     *
     * Note:
     * * We have trimmed trailing space or tab characters for every line above.
     * * We have performed leading tab-space conversion above.
     */
    const projectLevelOmittedHeadings = respectProjectLevelOmit ? getProjectExcludedHeadings(doc) : [];
    /**
     * Keep track of the omitted heading's depth to also omit its subheadings.
     * This is only for project level omitting.
     */
    let ignoredDepthBound = undefined;
    const toc = [];
    for (let i = 0; i < lines.length; i++) {
        const crtLineText = lines[i];
        // Skip non-ATX heading lines.
        if (
        // <https://spec.commonmark.org/0.29/#atx-headings>
        !/^ {0,3}#{1,6}(?: |\t|$)/.test(crtLineText)) {
            continue;
        }
        // Extract heading info.
        const matches = /^ {0,3}(#{1,6})(.*)$/.exec(crtLineText);
        const entry = {
            level: matches[1].length,
            rawContent: matches[2].replace(/^[ \t]+/, '').replace(/[ \t]+#+[ \t]*$/, ''),
            lineIndex: i,
            canInToc: true,
        };
        // Omit because of magic comment
        if (respectMagicCommentOmit
            && entry.canInToc
            && (
            // The magic comment is above the heading.
            (i > 0
                && /^<!-- omit (in|from) toc -->$/.test(lines[i - 1]))
                // The magic comment is at the end of the heading.
                || /<!-- omit (in|from) toc -->$/.test(crtLineText))) {
            entry.canInToc = false;
        }
        // Omit because of `projectLevelOmittedHeadings`.
        if (respectProjectLevelOmit && entry.canInToc) {
            // Whether omitted as a subheading
            if (ignoredDepthBound !== undefined
                && entry.level > ignoredDepthBound) {
                entry.canInToc = false;
            }
            // Whether omitted because it is in `projectLevelOmittedHeadings`.
            if (entry.canInToc) {
                if (projectLevelOmittedHeadings.some(({ level, text }) => level === entry.level && text === entry.rawContent)) {
                    entry.canInToc = false;
                    ignoredDepthBound = entry.level;
                }
                else {
                    // Otherwise reset ignore bound.
                    ignoredDepthBound = undefined;
                }
            }
        }
        toc.push(entry);
    }
    return toc;
}
exports.getAllRootHeading = getAllRootHeading;
/**
 * Gets all headings in the root of the text document, with additional TOC specific properties.
 * @returns In ascending order of `lineIndex`.
 */
function getAllTocEntry(doc, { respectMagicCommentOmit = false, respectProjectLevelOmit = false, slugifyMode = vscode_1.workspace.getConfiguration('markdown.extension.toc').get('slugifyMode'), }) {
    const rootHeadings = getAllRootHeading(doc, respectMagicCommentOmit, respectProjectLevelOmit);
    const { env } = markdownEngine_1.commonMarkEngine.getDocumentToken(doc);
    const anchorOccurrences = new Map();
    function getSlug(rawContent) {
        let slug = (0, slugify_1.slugify)(rawContent, { env, mode: slugifyMode });
        let count = anchorOccurrences.get(slug);
        if (count === undefined) {
            anchorOccurrences.set(slug, 0);
        }
        else {
            count++;
            anchorOccurrences.set(slug, count);
            slug += '-' + count.toString();
        }
        return slug;
    }
    const toc = rootHeadings.map((heading) => ({
        level: heading.level,
        rawContent: heading.rawContent,
        lineIndex: heading.lineIndex,
        canInToc: heading.canInToc,
        visibleText: createLinkText(heading.rawContent, env),
        slug: getSlug(heading.rawContent),
    }));
    return toc;
}
exports.getAllTocEntry = getAllTocEntry;
//#endregion Public utility
class TocCodeLensProvider {
    provideCodeLenses(document, _) {
        // VS Code asks for code lens as soon as a text editor is visible (atop the group that holds it), no matter whether it has focus.
        // Duplicate editor views refer to the same TextEditor, and the same TextDocument.
        const editor = vscode_1.window.visibleTextEditors.find(e => e.document === document);
        loadTocConfig(editor);
        const lenses = [];
        return detectTocRanges(document).then(tocRangesAndText => {
            const tocRanges = tocRangesAndText[0];
            const newToc = tocRangesAndText[1];
            for (let tocRange of tocRanges) {
                let status = document.getText(tocRange).replace(/\r?\n|\r/g, docConfig.eol) === newToc ? 'up to date' : 'out of date';
                lenses.push(new vscode_1.CodeLens(tocRange, {
                    arguments: [],
                    title: `Table of Contents (${status})`,
                    command: ''
                }));
            }
            return lenses;
        });
    }
}
//# sourceMappingURL=toc.js.map