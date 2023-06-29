import path = require("path");
import { window, workspace } from "vscode";
import * as fs from "fs";

// 获取配置文件位置
function getConfigPath() {
    const workspaceFolders = workspace.workspaceFolders;
    return path.join(workspaceFolders![0].uri.fsPath, "docs/.vuepress/config.js");
  }
  

  // 获取图片文件夹
  function getImgFolderPath() {
    const workspaceFolders = workspace.workspaceFolders;
    return path.join(
      workspaceFolders![0].uri.fsPath,
      "docs/.vuepress/public/imgs/"
    );
  }
  
  // 获取Doc目录
  function getDocFolderPath() {
    const workspaceFolders = workspace.workspaceFolders;
    return path.join(workspaceFolders![0].uri.fsPath, "docs");
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

  export default {
    getConfigPath,
    getImgFolderPath,
    getDocFolderPath,
    getCurrentDocumentRelativePath,
    ensureDirectoryExists,
  }