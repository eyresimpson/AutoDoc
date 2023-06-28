/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/provider/DocTreeProvider.ts":
/*!*****************************************!*\
  !*** ./src/provider/DocTreeProvider.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocTreeProvider = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const common_1 = __webpack_require__(/*! ../tools/common */ "./src/tools/common.ts");
class DocTreeProvider {
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            // 如果不是顶级节点
            return Promise.resolve(element.children);
        }
        else {
            // 顶级节点需要从配置中赋值
            return Promise.resolve(this.getStructInConfig(common_1.default.getConfigPath()));
        }
    }
    // 尝试从配置文件中获取结构
    getStructInConfig(path) {
        // 读取js
        let config = common_1.default.extractDefaultThemeConfigFromFile(path);
        let arr = [];
        arr.push(new DocItem("主菜单", "结构", vscode.TreeItemCollapsibleState.Collapsed, this.analysisMenu(config.navbar), vscode_1.ThemeIcon.Folder, {
            command: 'markdown.extension.vp.openDoc',
            title: 'Open Document',
            arguments: ["filePath"],
        }));
        arr.push(new DocItem("文档章节", "结构", vscode.TreeItemCollapsibleState.Collapsed, this.analysisStruct(config.sidebar), vscode_1.ThemeIcon.Folder, {
            command: 'markdown.extension.vp.openDoc',
            title: '打开文件夹',
            arguments: ["filePath"],
        }));
        return arr;
    }
    // 分析菜单结构
    analysisMenu(arr) {
        let docItemArr = [];
        for (let index in arr) {
            docItemArr.push(new DocItem(arr[index].text, "菜单", vscode.TreeItemCollapsibleState.None, [], vscode_1.ThemeIcon.Folder, {
                command: 'markdown.extension.vp.openDoc',
                title: '打开文件夹',
                arguments: ["filePath"],
            }));
        }
        return docItemArr;
    }
    // 分析数据结构树
    analysisStruct(arr) {
        let docItemArr = [];
        for (let index in arr) {
            if (arr[index].children) {
                // 有子数组
                docItemArr.push(new DocItem(arr[index].text, "节点", vscode.TreeItemCollapsibleState.Collapsed, this.analysisStruct(arr[index].children), vscode_1.ThemeIcon.Folder, {
                    command: 'markdown.extension.vp.openDoc',
                    title: '打开文件夹',
                    arguments: ["filePath"],
                }));
            }
            else {
                if (typeof arr[index] != "string")
                    continue;
                // 没有子数组，整理文档存入
                // TODO:后续应该改成具体标题的
                docItemArr.push(new DocItem(common_1.default.extractContent(arr[index]), "文档", vscode.TreeItemCollapsibleState.None, [], vscode_1.ThemeIcon.File, {
                    command: 'markdown.extension.vp.openDoc',
                    title: '打开文档',
                    arguments: ["filePath"],
                }));
            }
        }
        return docItemArr;
    }
}
exports.DocTreeProvider = DocTreeProvider;
class DocItem extends vscode.TreeItem {
    constructor(label, type, collapsibleState, children, iconPath = vscode_1.ThemeIcon.File, command) {
        super(label, collapsibleState);
        this.label = label;
        this.type = type;
        this.collapsibleState = collapsibleState;
        this.children = children;
        this.iconPath = iconPath;
        this.command = command;
        this.tooltip = `${this.label}-${this.type}`;
        this.description = this.type;
    }
}


/***/ }),

/***/ "./src/tools/common.ts":
/*!*****************************!*\
  !*** ./src/tools/common.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
// 从js中解析树结构
function extractDefaultThemeConfigFromFile(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    // 使用正则表达式提取出 defaultTheme 方法的参数
    const defaultThemeMatch = fileContent.match(/defaultTheme\(([\s\S]*?)\)/);
    if (defaultThemeMatch && defaultThemeMatch.length > 1) {
        const defaultThemeConfigString = defaultThemeMatch[1];
        // 解析 JSON 字符串为 JavaScript 对象
        try {
            const defaultThemeConfig = eval(`(${defaultThemeConfigString})`);
            return defaultThemeConfig;
        }
        catch (error) {
            console.error("Failed to parse defaultTheme config:", error);
        }
    }
    return null;
}
// 分割 MD 文件名
function extractContent(input) {
    const parts = input.split("/"); // 将字符串按照斜杠进行分割
    let lastPart = "";
    if (input.endsWith("/")) {
        lastPart = parts[parts.length - 2]; // 获取倒数第二个分割后的部分
    }
    else {
        if (input.endsWith(".md")) {
            lastPart = parts[parts.length - 1].split(".md")[0];
        }
        else {
            lastPart = parts[parts.length - 1]; // 获取倒数第二个分割后的部分
        }
    }
    return lastPart;
}
// 获取日期时间，返回格式为 230627105501
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // 提取年份的后两位
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 获取月份，并确保是两位数
    const day = now.getDate().toString().padStart(2, "0"); // 获取日期，并确保是两位数
    const hours = now.getHours().toString().padStart(2, "0"); // 获取小时，并确保是两位数
    const minutes = now.getMinutes().toString().padStart(2, "0"); // 获取分钟，并确保是两位数
    const seconds = now.getSeconds().toString().padStart(2, "0"); // 获取秒数，并确保是两位数
    return `${day}${month}${year}${hours}${minutes}${seconds}`;
}
// 检查创建目录（检查目录是否存在，不存在创建）
function ensureDirectoryExists(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log("【INFO】在 ", directoryPath, " 创建目录");
    }
}
// 获取相对路径（限定为用户自定义路径，不含文件名）
function getCurrentDocumentRelativePath() {
    const activeTextEditor = vscode_1.window.activeTextEditor;
    if (activeTextEditor) {
        const document = activeTextEditor.document;
        if (document) {
            const workspaceFolderPath = vscode_1.workspace.rootPath;
            if (workspaceFolderPath) {
                return path.parse(path.relative(path.join(workspaceFolderPath, "/docs/section/"), document.fileName)).dir;
            }
        }
    }
    return;
}
// 在光标处插入文本
function insertTextAtCursorPosition(text) {
    const activeTextEditor = vscode_1.window.activeTextEditor;
    if (activeTextEditor) {
        const currentPosition = activeTextEditor.selection.active;
        const edit = activeTextEditor.edit((editor) => {
            editor.insert(currentPosition, text);
        });
        return edit.then((success) => {
            return success;
        });
    }
    return Promise.resolve(false);
}
// 执行npm命令
function executeNpmScript(scriptName) {
    const task = new vscode_1.Task({ type: "npm", script: scriptName }, vscode_1.TaskScope.Workspace, scriptName, "npm", new vscode_1.ShellExecution(`npm run ${scriptName}`));
    vscode_1.tasks.executeTask(task);
}
// 执行普通命令
function executeScript(script) {
    const task = new vscode_1.Task({ type: "vuepress", script: script }, vscode_1.TaskScope.Workspace, "vuepress", "vuepress", new vscode_1.ShellExecution(script));
    vscode_1.tasks.executeTask(task);
}
function createStatusBarItem() {
    const statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
    statusBarItem.text = "$(file-code) My Panel";
    // statusBarItem.command = 'extension.myPanelCommand'; // 替换为你的命令 ID
    statusBarItem.show();
}
function getConfigPath() {
    const workspaceFolders = vscode_1.workspace.workspaceFolders;
    return path.join(workspaceFolders[0].uri.fsPath, "docs/.vuepress/config.js");
}
function getImgFolderPath() {
    const workspaceFolders = vscode_1.workspace.workspaceFolders;
    return path.join(workspaceFolders[0].uri.fsPath, "docs/.vuepress/public/imgs/");
}
exports["default"] = {
    extractDefaultThemeConfigFromFile,
    extractContent,
    createStatusBarItem,
    executeScript,
    executeNpmScript,
    insertTextAtCursorPosition,
    getCurrentDocumentRelativePath,
    ensureDirectoryExists,
    getCurrentDateTime,
    getConfigPath,
    getImgFolderPath,
};


/***/ }),

/***/ "./src/vuepress.ts":
/*!*************************!*\
  !*** ./src/vuepress.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const common_1 = __webpack_require__(/*! ./tools/common */ "./src/tools/common.ts");
// activate 注册
function activate(context) {
    // 注册命令
    context.subscriptions.push(vscode_1.commands.registerCommand("markdown.extension.vp.insertImg", () => insertImg()), vscode_1.commands.registerCommand("markdown.extension.vp.workstart", () => workstart()), vscode_1.commands.registerCommand("markdown.extension.vp.openDoc", (config) => openDoc(config)));
}
exports.activate = activate;
// 插入图片的实现
function insertImg() {
    // 打开对话框，要求用户选择图片
    vscode_1.window
        .showOpenDialog({
        title: "选择要插入的图片文件",
        openLabel: "插入此图片",
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: true,
    })
        .then((urls) => {
        if (urls == undefined)
            return;
        const workspaceFolders = vscode_1.workspace.workspaceFolders;
        const activeTextEditor = vscode_1.window.activeTextEditor;
        // 图片文件命名规则：当前文档名称 + 日期时间，如 formDesign_230627090748.png
        let imgFileName = "";
        // 图片文件保存路径
        let imgPath = "";
        // 图片后缀名
        let suffix = "";
        if (!activeTextEditor) {
            console.log("【ERROR】无法获取当前打开的文档！");
            return;
        }
        let document = activeTextEditor.document;
        // 获取当前文档路径
        let fileName = "";
        if (document) {
            const fileNameWithExtension = path.basename(document.fileName); // 获取带有后缀名的文件名
            fileName = path.parse(fileNameWithExtension).name; // 排除后缀名
        }
        else {
            console.log("【ERROR】无法获取当前打开的文档！");
            return;
        }
        // 根据当前日期时间拼接文件名
        imgFileName = fileName + "_" + common_1.default.getCurrentDateTime();
        // 获取文件后缀名
        suffix = path.parse(urls[0].path).ext;
        // 拼接目标路径
        // 插入的文档必须位于 docs/section 中
        imgPath = path.join(common_1.default.getImgFolderPath(), common_1.default.getCurrentDocumentRelativePath());
        common_1.default.ensureDirectoryExists(imgPath);
        // 将图片保存到指定位置
        fs.copyFile(urls[0].path, path.join(imgPath, imgFileName + suffix), (err) => {
            if (err) {
                console.error("【ERROR】权限或目录异常，无法复制文件", err);
                return;
            }
            // TODO: 对图片进行压缩（如果需要）
            // 组合图片的 Url
            common_1.default.insertTextAtCursorPosition("<img :src=\"$withBase('/imgs/" +
                common_1.default.getCurrentDocumentRelativePath() +
                "/" +
                imgFileName +
                suffix +
                "')\" />");
        });
    });
}
// 启动项目的实现
function workstart() {
    // TODO：可能不兼容其他的命令，后续加一下校验
    common_1.default.executeNpmScript("start");
    // common.createStatusBarItem();
}
// 打开文件（配置结构树）
function openDoc(config) {
    console.log("---", config);
}


/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
const vuepress = __webpack_require__(/*! ./vuepress */ "./src/vuepress.ts");
const DocTreeProvider_1 = __webpack_require__(/*! ./provider/DocTreeProvider */ "./src/provider/DocTreeProvider.ts");
function activate(context) {
    vscode_1.window.createTreeView("vuepressTree", {
        treeDataProvider: new DocTreeProvider_1.DocTreeProvider(),
    });
    activateMdExt(context);
    return;
}
exports.activate = activate;
function activateMdExt(context) {
    // Vuepress
    vuepress.activate(context);
    vscode_1.languages.setLanguageConfiguration("markdown", {
        wordPattern: /([*_]{1,2}|~~|`+)?[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+(_+[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+)*\1/gu,
    });
}
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=main.js.map