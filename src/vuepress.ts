"use strict";

import { commands, ExtensionContext, window, workspace } from "vscode";
import * as fs from "fs";
import * as path from "path";
import common from "./tools/common";

// activate 注册
export function activate(context: ExtensionContext) {
  // 注册命令
  context.subscriptions.push(
    commands.registerCommand("markdown.extension.vp.insertImg", () =>
      insertImg()
    ),
    commands.registerCommand("markdown.extension.vp.workstart", () =>
      workstart()
    ),
    commands.registerCommand("markdown.extension.vp.openDoc", (config: any) => openDoc(config))
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
      imgFileName = fileName + "_" + common.getCurrentDateTime();
      // 获取文件后缀名
      suffix = path.parse(urls[0].path).ext;
      // 拼接目标路径
      // 插入的文档必须位于 docs/section 中
      imgPath = path.join(
        common.getImgFolderPath(),
        common.getCurrentDocumentRelativePath()!
      );
      common.ensureDirectoryExists(imgPath);
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
          common.insertTextAtCursorPosition(
            "<img :src=\"$withBase('/imgs/" +
              common.getCurrentDocumentRelativePath() +
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
  common.executeNpmScript("start");
  // common.createStatusBarItem();
}

// 打开文件（配置结构树）
function openDoc(config: any) {
  console.log("---",config);
  
}
