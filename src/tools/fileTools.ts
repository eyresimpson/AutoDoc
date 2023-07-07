import clipboardy from "clipboardy";
import path = require("path");
import { commands, Uri } from "vscode";
import pathTools from "./pathTools";
const fs = require("fs");

async function saveClipboardImage(): Promise<void> {
  try {
    const imageBuffer = clipboardy.readSync()
    const filePath = `/Users/eyresimpson/Code/OpenSource/AutoDoc/src/tools/fileTools.jpg`;
    fs.writeFileSync(filePath, imageBuffer);
    console.log(`Image saved to: ${filePath}`);
  } catch (error) {
    console.error("Failed to save image:", error);
  }
}

// 打开文件（配置结构树）
function openDoc(config: string) {
  commands.executeCommand("vscode.open", Uri.parse(mdFilePath(config)));
}

function mdFilePath(config: any) {
  let filePath = pathTools.getDocFolderPath();

  if (config.endsWith(".md") || config.endsWith(".MD")) {
    filePath = path.join(filePath, config);
  } else {
    try {
      filePath = path.join(filePath, config + "README.md");
    } catch (error) {
      filePath = path.join(filePath, config + "readme.md");
    }
  }
  return filePath;
}

export default {
  saveClipboardImage,openDoc
};
