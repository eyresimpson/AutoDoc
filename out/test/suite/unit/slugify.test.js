"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const slugify_1 = require("../../../util/slugify");
/**
 * `mode -> [rawContent, slug]`
 */
const cases = {
    ["azureDevops" /* AzureDevOps */]: [
        ["A !\"#$%&'()*+,-./:;<=>?@[\\\\]^_`{|}~", "%61%2D%21%22%23%24%25%26%27%28%29%2A%2B%2C%2D%2E%2F%3A%3B%3C%3D%3E%3F%40%5B%5C%5C%5D%5E%5F%60%7B%7C%7D%7E"],
        ["W\u{0020}\u{00A0}\u{2003}\u{202F}\u{205F}\u{3000}\u{1680}S", "%77%2D%2D%2D%2D%2D%2D%2D%73"],
        ["1\u{0020}\u{007F}\u{0080}\u{07FF}\u{0800}\u{FFFF}\u{10000}\u{10FFFF}2", "%31%2D%7F%C2%80%DF%BF%E0%A0%80%EF%BF%BF%F0%90%80%80%F4%8F%BF%BF%32"], // Test UTF-8 encoding.
    ],
    ["bitbucket-cloud" /* BitbucketCloud */]: [],
    ["github" /* GitHub */]: [
        ["foo _italic_ bar", "foo-italic-bar"],
        ["foo_foo_bar", "foo_foo_bar"],
        ["`a.b` c", "ab-c"],
        ["Via [remark-cli][]", "via-remark-cli"],
        ["1. not a list", "1-not-a-list"],
        ["1) not a list", "1-not-a-list"],
        ["foo & < >  \"foo\"", "foo---foo"],
        ["$\\LaTeX equations$", "latex-equations"],
        ["Секция 1.1", "секция-11"],
        ["Section 中文", "section-中文"], // CJK.
    ],
    ["gitlab" /* GitLab */]: [
        ["foo _italic_ bar", "foo-italic-bar"],
        ["foo_foo_bar", "foo_foo_bar"],
        ["`a.b` c", "ab-c"],
        ["Via [remark-cli][]", "via-remark-cli"],
        ["1. not a list", "1-not-a-list"],
        ["1) not a list", "1-not-a-list"],
        ["A  +  B", "a-b"],
        ["foo & < >  \"foo\"", "foo-foo"],
        ["1", "anchor-1"],
        ["Секция 1.1", "секция-11"], // Cyrillic. (#469)
    ],
    ["gitea" /* Gitea */]: [
        ["foo _italic_ bar", "foo-italic-bar"],
        ["foo_foo_bar", "foo-foo-bar"],
        ["`a.b` c", "a-b-c"],
        ["Via [remark-cli][]", "via-remark-cli"],
        ["1. not a list", "1-not-a-list"],
        ["1) not a list", "1-not-a-list"],
        ["foo & < >  \"foo\"", "foo-foo"],
        ["$\\LaTeX equations$", "latex-equations"],
        [":checkered_flag: with emoji shortname", "checkered-flag-with-emoji-shortname"],
        ["Секция 1.1", "секция-1-1"], // Cyrillic.
    ],
    ["vscode" /* VisualStudioCode */]: [
        ["foo _italic_ bar", "foo-italic-bar"],
        ["`a.b` c", "ab-c"],
        ["Via [remark-cli][]", "via-remark-cli"],
        ["1. not a list", "1-not-a-list"],
    ],
};
const modeName = {
    ["azureDevops" /* AzureDevOps */]: "Azure DevOps",
    ["bitbucket-cloud" /* BitbucketCloud */]: "Bitbucket Cloud",
    ["github" /* GitHub */]: "GitHub",
    ["gitlab" /* GitLab */]: "GitLab",
    ["gitea" /* Gitea */]: "Gitea",
    ["vscode" /* VisualStudioCode */]: "VS Code",
};
suite("Slugify function.", () => {
    for (const [group, testCase] of Object.entries(cases)) {
        for (const [rawContent, slug] of testCase) {
            globalThis.test(`(${modeName[group]}) ${rawContent} → ${slug}`, () => {
                assert.strictEqual((0, slugify_1.slugify)(rawContent, { mode: group }), slug);
            });
        }
    }
});
//# sourceMappingURL=slugify.test.js.map