"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = void 0;
const manager_1 = require("../configuration/manager");
const markdownEngine_1 = require("../markdownEngine");
const utf8Encoder = new TextEncoder();
// Converted from Ruby regular expression `/[^\p{Word}\- ]/u`
// `\p{Word}` => Letter (Ll/Lm/Lo/Lt/Lu), Mark (Mc/Me/Mn), Number (Nd/Nl), Connector_Punctuation (Pc)
// It's weird that Ruby's `\p{Word}` actually does not include Category No.
// https://ruby-doc.org/core/Regexp.html
// https://rubular.com/r/ThqXAm370XRMz6
/**
 * The definition of punctuation from GitHub and GitLab.
 */
const Regexp_Github_Punctuation = /[^\p{L}\p{M}\p{Nd}\p{Nl}\p{Pc}\- ]/gu;
const Regexp_Gitlab_Product_Suffix = /[ \t\r\n\f\v]*\**\((?:core|starter|premium|ultimate)(?:[ \t\r\n\f\v]+only)?\)\**/g;
/**
 * Converts a string of CommonMark **inline** structures to plain text
 * by removing Markdown syntax in it.
 * This function is only for the `github` and `gitlab` slugify functions.
 * @see <https://spec.commonmark.org/0.29/#inlines>
 *
 * @param text - The Markdown string.
 * @param env - The markdown-it environment sandbox (**mutable**).
 * If you don't provide one properly, we cannot process reference links, etc.
 */
function mdInlineToPlainText(text, env) {
    // Use a clean CommonMark only engine to avoid interfering with plugins from other extensions.
    // Use `parseInline` to avoid parsing the string as blocks accidentally.
    // See #567, #585, #732, #792; #515; #179; #175, #575
    const inlineTokens = markdownEngine_1.commonMarkEngine.engine.parseInline(text, env)[0].children;
    return inlineTokens.reduce((result, token) => {
        switch (token.type) {
            case "image":
            case "html_inline":
                return result;
            default:
                return result + token.content;
        }
    }, "");
}
/**
 * Slugify methods.
 *
 * Each key is a slugify mode.
 * A values is the corresponding slugify function, whose signature must be `(rawContent: string, env: object) => string`.
 */
const Slugify_Methods = {
    // Sort in alphabetical order.
    ["azureDevops" /* AzureDevOps */]: (slug) => {
        // https://markdown-all-in-one.github.io/docs/specs/slugify/azure-devops.html
        // Encode every character. Although opposed by RFC 3986, it's the only way to solve #802.
        return Array.from(utf8Encoder.encode(slug
            .trim()
            .toLowerCase()
            .replace(/\p{Zs}/gu, "-")), (b) => "%" + b.toString(16))
            .join("")
            .toUpperCase();
    },
    ["bitbucket-cloud" /* BitbucketCloud */]: (slug, env) => {
        // https://support.atlassian.com/bitbucket-cloud/docs/readme-content/
        // https://bitbucket.org/tutorials/markdowndemo/
        slug = "markdown-header-"
            + Slugify_Methods.github(slug, env).replace(/-+/g, "-");
        return slug;
    },
    ["gitea" /* Gitea */]: (slug) => {
        // Gitea uses the blackfriday parser
        // https://godoc.org/github.com/russross/blackfriday#hdr-Sanitized_Anchor_Names
        slug = slug
            .replace(/^[^\p{L}\p{N}]+/u, "")
            .replace(/[^\p{L}\p{N}]+$/u, "")
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .toLowerCase();
        return slug;
    },
    ["github" /* GitHub */]: (slug, env) => {
        // According to an inspection in 2020-12, GitHub passes the raw content as is,
        // and does not trim leading or trailing C0, Zs characters in any step.
        // <https://github.com/jch/html-pipeline/blob/master/lib/html/pipeline/toc_filter.rb>
        slug = mdInlineToPlainText(slug, env)
            .replace(Regexp_Github_Punctuation, "")
            .toLowerCase() // According to an inspection in 2020-09, GitHub performs full Unicode case conversion now.
            .replace(/ /g, "-");
        return slug;
    },
    ["gitlab" /* GitLab */]: (slug, env) => {
        // https://gitlab.com/help/user/markdown
        // https://docs.gitlab.com/ee/api/markdown.html
        // https://docs.gitlab.com/ee/development/wikis.html
        // <https://gitlab.com/gitlab-org/gitlab/blob/master/lib/banzai/filter/table_of_contents_filter.rb#L32>
        // https://gitlab.com/gitlab-org/gitlab/blob/a8c5858ce940decf1d263b59b39df58f89910faf/lib/gitlab/utils/markdown.rb
        slug = mdInlineToPlainText(slug, env)
            .replace(/^[ \t\r\n\f\v]+/, "")
            .replace(/[ \t\r\n\f\v]+$/, "") // https://ruby-doc.org/core/String.html#method-i-strip
            .toLowerCase()
            .replace(Regexp_Gitlab_Product_Suffix, "")
            .replace(Regexp_Github_Punctuation, "")
            .replace(/ /g, "-") // Replace space with dash.
            .replace(/-+/g, "-") // Replace multiple/consecutive dashes with only one.
            // digits-only hrefs conflict with issue refs
            .replace(/^(\d+)$/, "anchor-$1");
        return slug;
    },
    ["vscode" /* VisualStudioCode */]: (rawContent, env) => {
        // https://github.com/microsoft/vscode/blob/0798d13f10b193df0297e301affe761b90a8bfa9/extensions/markdown-language-features/src/slugify.ts#L22-L29
        return encodeURI(
        // Simulate <https://github.com/microsoft/vscode/blob/0a57fd87b1d1ef0ff81750f84840ee4303b8800b/extensions/markdown-language-features/src/markdownEngine.ts#L286>.
        // Not the same, but should cover most needs.
        markdownEngine_1.commonMarkEngine.engine.parseInline(rawContent, env)[0].children
            .reduce((result, token) => result + token.content, "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-") // Replace whitespace with -
            .replace(/[\]\[\!\'\#\$\%\&\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\{\|\}\~\`。，、；：？！…—·ˉ¨‘’“”々～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝]/g, "") // Remove known punctuators
            .replace(/^\-+/, "") // Remove leading -
            .replace(/\-+$/, "") // Remove trailing -
        );
    }
};
/**
 * Slugify a string.
 * @param heading - The raw content of the heading according to the CommonMark Spec.
 * @param env - The markdown-it environment sandbox (**mutable**).
 * @param mode - The slugify mode.
 */
function slugify(heading, { env = Object.create(null), mode = manager_1.configManager.get("toc.slugifyMode"), }) {
    // Do never twist the input here!
    // Pass the raw heading content as is to slugify function.
    // Sort by popularity.
    switch (mode) {
        case "github" /* GitHub */:
            return Slugify_Methods["github" /* GitHub */](heading, env);
        case "gitlab" /* GitLab */:
            return Slugify_Methods["gitlab" /* GitLab */](heading, env);
        case "gitea" /* Gitea */:
            return Slugify_Methods["gitea" /* Gitea */](heading, env);
        case "vscode" /* VisualStudioCode */:
            return Slugify_Methods["vscode" /* VisualStudioCode */](heading, env);
        case "azureDevops" /* AzureDevOps */:
            return Slugify_Methods["azureDevops" /* AzureDevOps */](heading, env);
        case "bitbucket-cloud" /* BitbucketCloud */:
            return Slugify_Methods["bitbucket-cloud" /* BitbucketCloud */](heading, env);
        default:
            return Slugify_Methods["github" /* GitHub */](heading, env);
    }
}
exports.slugify = slugify;
//# sourceMappingURL=slugify.js.map