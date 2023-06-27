"use strict";

import {
  commands,
  ExtensionContext,
  ShellExecution,
  StatusBarAlignment,
  Task,
  tasks,
  TaskScope,
  ViewColumn,
  window,
  workspace,
} from "vscode";
import * as fs from "fs";
import * as path from "path";

// activate 注册
export function activate(context: ExtensionContext) {
  // 注册命令
  context.subscriptions.push(
    commands.registerCommand("markdown.extension.vp.insertImg", () =>
      insertImg()
    ),
    commands.registerCommand("markdown.extension.vp.workstart", () =>
      workstart()
    )
  );
}

// 插入图片的实现
function insertImg() {
  // 打开对话框，要求用户选择图片
  window
    .showOpenDialog({
      title: "选择要插入的图片文件",
      openLabel: "插入此图片",
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: true,
    })
    .then((urls: any) => {
      if (urls == undefined) return;
      const workspaceFolders = workspace.workspaceFolders;
      const activeTextEditor = window.activeTextEditor;
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
      } else {
        console.log("【ERROR】无法获取当前打开的文档！");
        return;
      }
      // 根据当前日期时间拼接文件名
      imgFileName = fileName + "_" + getCurrentDateTime();
      // 获取文件后缀名
      suffix = path.parse(urls[0].path).ext;
      // 拼接目标路径
      // 插入的文档必须位于 docs/section 中
      imgPath = path.join(
        workspaceFolders![0].uri.fsPath,
        "docs/.vuepress/public/imgs/",
        getCurrentDocumentRelativePath()!
      );
      ensureDirectoryExists(imgPath);
      // 将图片保存到指定位置
      fs.copyFile(
        urls[0].path,
        path.join(imgPath, imgFileName + suffix),
        (err) => {
          if (err) {
            console.error("【ERROR】权限或目录异常，无法复制文件", err);
            return;
          }
          // TODO: 对图片进行压缩（如果需要）
          // 组合图片的 Url
          insertTextAtCursorPosition(
            "<img :src=\"$withBase('/imgs/" +
              getCurrentDocumentRelativePath() +
              "/" +
              imgFileName +
              suffix +
              "')\" />"
          );
        }
      );
    });
}

// 启动项目的实现
function workstart() {
  // TODO：可能不兼容其他的命令，后续加一下校验
  // executeNpmScript("start");
  // executeScript("vuepress dev docs");
  createStatusBarItem()
}

// ------ 其他函数（后续迁移到utils） ------ 

// 获取日期时间，返回格式为 230627105501
function getCurrentDateTime(): string {
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
function ensureDirectoryExists(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log("【INFO】在 ", directoryPath, " 创建目录");
  }
}

// 获取相对路径（限定为用户自定义路径，不含文件名）
function getCurrentDocumentRelativePath(): string | undefined {
  const activeTextEditor = window.activeTextEditor;
  if (activeTextEditor) {
    const document = activeTextEditor.document;
    if (document) {
      const workspaceFolderPath = workspace.rootPath;
      if (workspaceFolderPath) {
        return path.parse(
          path.relative(
            path.join(workspaceFolderPath, "/docs/section/"),
            document.fileName
          )
        ).dir;
      }
    }
  }
  return;
}

// 在光标处插入文本
function insertTextAtCursorPosition(text: string): Thenable<boolean> {
  const activeTextEditor = window.activeTextEditor;
  if (activeTextEditor) {
    const currentPosition = activeTextEditor.selection.active;
    const edit = activeTextEditor.edit((editor: any) => {
      editor.insert(currentPosition, text);
    });
    return edit.then((success: any) => {
      return success;
    });
  }
  return Promise.resolve(false);
}

// 执行npm命令
function executeNpmScript(scriptName: string): void {
  const task = new Task(
    { type: "npm", script: scriptName },
    TaskScope.Workspace,
    scriptName,
    "npm",
    new ShellExecution(`npm run ${scriptName}`)
  );

  tasks.executeTask(task);
}

// 执行普通命令
function executeScript(script: string): void {
  const task = new Task(
    { type: "vuepress", script: script },
    TaskScope.Workspace,
    "vuepress",
    "vuepress",
    new ShellExecution(script)
  );

  tasks.executeTask(task);
}

function createStatusBarItem() {
  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
  statusBarItem.text = "$(file-code) My Panel";
  // statusBarItem.command = 'extension.myPanelCommand'; // 替换为你的命令 ID

  statusBarItem.show();
}