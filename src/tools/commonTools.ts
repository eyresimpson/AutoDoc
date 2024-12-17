import * as fs from "fs";
import {
  StatusBarAlignment,
  window,
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
      const defaultThemeConfig = JSON.parse(`(${defaultThemeConfigString})`);
      return defaultThemeConfig;
    } catch (error) {
      console.error("Failed to parse defaultTheme config:", error);
    }
  }

  return null;
}

// 分割 MD 文件名
function extractContent(input: string): string {
  const parts = input.split("/");
  const lastPart = parts[parts.length - 1];
  return lastPart.endsWith(".md") ? lastPart.slice(0, -3) : lastPart;
}

// 获取日期时间，返回格式为 230627105501
function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}${month}${year}${hours}${minutes}${seconds}`;
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


function createStatusBarItem() {
  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
  statusBarItem.text = "$(file-code) My Panel";
  statusBarItem.command = 'extension.myPanelCommand'; // 确保命令已注册
  statusBarItem.show();
}



export default {
  extractDefaultThemeConfigFromFile,
  extractContent,
  createStatusBarItem,
  insertTextAtCursorPosition,
  getCurrentDateTime,
};
