'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.vp.insertImg', () => insertImg("")));
}
exports.activate = activate;
function insertImg(params) {
    console.log("sdsssss111", params);
    // 打开对话框，要求用户选择图片
    // @ts-ignore Needs refactoring.
    const root = workspace.getWorkspaceFolder(doc.uri).uri;
    vscode_1.window.showOpenDialog({ defaultUri: root, openLabel: '选择要插入的图片', canSelectFiles: false, canSelectFolders: true }).then((urls) => {
        console.log(urls);
    });
    // 将图片保存到指定位置
    // 检查配置中压缩等级
    // 对图片进行压缩（如果需要）
    // 组合图片的 Url
}
//# sourceMappingURL=vuepress.js.map