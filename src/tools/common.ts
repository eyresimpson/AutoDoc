import * as fs from "fs";
import * as path from "path";
import {
  ShellExecution,
  StatusBarAlignment,
  Task,
  tasks,
  TaskScope,
  window,
  workspace,
} from "vscode";

// 从js中解析树结构
function extractDefaultThemeConfigFromFile(filePath: string): any {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // 使用正则表达式提取出 defaultTheme 方法的参数
  const defaultThemeMatch = fileContent.match(/defaultTheme\(([\s\S]*?)\)/);
  if (defaultThemeMatch && defaultThemeMatch.length > 1) {
    const defaultThemeConfigString = defaultThemeMatch[1];

    // 解析 JSON 字符串为 JavaScript 对象
    try {
      const defaultThemeConfig = eval(`(${defaultThemeConfigString})`);
      return defaultThemeConfig;
    } catch (error) {
      console.error("Failed to parse defaultTheme config:", error);
    }
  }

  return null;
}

// 分割 MD 文件名
function extractContent(input: string): string {
  const parts = input.split("/"); // 将字符串按照斜杠进行分割
  let lastPart = "";
  if (input.endsWith("/")) {
    lastPart = parts[parts.length - 2]; // 获取倒数第二个分割后的部分
  } else {
    if (input.endsWith(".md")) {
      lastPart = parts[parts.length - 1].split(".md")[0];
    } else {
      lastPart = parts[parts.length - 1]; // 获取倒数第二个分割后的部分
    }
  }
  return lastPart;
}

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

function getConfigPath() {
  const workspaceFolders = workspace.workspaceFolders;
  return path.join(workspaceFolders![0].uri.fsPath, "docs/.vuepress/config.js");
}

function getImgFolderPath() {
  const workspaceFolders = workspace.workspaceFolders;
  return path.join(
    workspaceFolders![0].uri.fsPath,
    "docs/.vuepress/public/imgs/"
  );
}

export default {
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
