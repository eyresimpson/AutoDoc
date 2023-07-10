"use strict";

import {
  commands,
  ExtensionContext,
  window,
} from "vscode";
import * as fs from "fs";
import * as path from "path";
import common from "./tools/commonTools";
import pathTools from "./tools/pathTools";
import fileTools from "./tools/fileTools";
import systemTools from "./tools/systemTools";

// activate 注册
export function activate(context: ExtensionContext) {
  // 注册命令
  context.subscriptions.push(
    // 插入图片事件
    commands.registerCommand("noah.vp.insertImg", () => insertImg()),
    // 从剪贴板插入图片事件
    commands.registerCommand("noah.vp.insertImgByClipboardy", () =>
      insertImgByClipboardy()
    ),
    // 启动项目
    commands.registerCommand("noah.vp.workstart", () => workstart()),
    // 打开文档（注意，必须只能一定要在项目中点击打开，或者给他传参也可以
    commands.registerCommand("noah.vp.openDoc", (config: any) =>
      fileTools.openDoc(config)
    ),
    // 新建节点（注意，必须只能一定要在项目中点击打开，或者给他传参也可以
    commands.registerCommand("noah.vp.addDir", (config: any) =>
      createNode(config)
    ),
    // 这东西就是空的，如果需要点击菜单、节点时做点啥请重新建 command，不要用这个
    commands.registerCommand("noah.vp.previewFile", () => { })
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
      canSelectMany: false,
      filters: {
        "图片文件": ["PNG", "JPG", "JPEG"]
      }
    })
    .then((urls: any) => {
      if (urls == undefined) return;
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
      suffix = path.parse(urls[0].fsPath).ext;
      // 拼接目标路径
      // 插入的文档必须位于 docs/section 中
      imgPath = path.join(
        pathTools.getImgFolderPath(),
        pathTools.getCurrentDocumentRelativePath()!
      );
      pathTools.ensureDirectoryExists(imgPath);
      // 将图片保存到指定位置
      fs.copyFile(
        urls[0].fsPath,
        path.join(imgPath, imgFileName + suffix),
        (err) => {
          if (err) {
            console.error("【ERROR】权限或目录异常，无法复制文件", err);
            return;
          }
          // TODO: 对图片进行压缩（如果需要）
          const finalPath = path.join("/imgs/", pathTools.getCurrentDocumentRelativePath()!, imgFileName + suffix)
          // 组合图片的 Url
          common.insertTextAtCursorPosition(
            "<img :src=\"$withBase('" + finalPath.replace(/\\/g, '/') + "')\" />"
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


// 新建节点
function createNode(config: any) {
  let configPath;
  if (config.type) {
    if (config.type === "【菜单】" || config.type === "【框架】") {
      return;
    }
    configPath = findPathInTree(config);
  } else {
    configPath = config;
  }

  // 修改配置文件
}
// 删除节点

// 新建文档

// 删除文档



// 提供需要提供一个 TreeItem 对象，返回其对应的目录路径
function findPathInTree(tree: any) {
  // 目录
  let dirPath: string;
  // let index:number;
  if (tree.type === "【文档】") {
    return tree.command.arguments[0];
  } else if (tree.type === "【节点】" || tree.children.length > 0) {
    dirPath = removeLastSegment(findPathInTree(tree.children[0]));
  } else {
    return "";
  }
  return dirPath;
}

// 移除最后的一段地址
function removeLastSegment(str: string): string {
  let flag = "/";
  // Windows 兼容
  if (systemTools.getSystemFlag() == 0) {
    flag = "\\"
  }
  const segments = str.split(flag);
  segments.pop(); // 移除最后一个元素
  return segments.join(flag) + flag;
}

// 插入剪贴板图片的实现
function insertImgByClipboardy() {
  // 尝试执行复制操作，此操作会让vscode将图片复制到当前目录下
  commands.executeCommand("editor.action.clipboardPasteAction");
  setTimeout(() => {
    const activeTextEditor = window.activeTextEditor;
    // 图片文件命名规则：当前文档名称 + 日期时间，如 formDesign_230627090748.png
    let imgFileName = "";
    // 图片文件保存路径
    let imgPath = "";
    // 图片后缀名
    let suffix = ".png";
    if (!activeTextEditor) {
      console.log("【ERROR】无法获取当前打开的文档！");
      return;
    }
    let document = activeTextEditor.document;
    // let imgRawPath = "";
    // if (systemTools.getSystemFlag()==0) {
    //   imgRawPath = document.uri._fsPath
    // }else{
    //   imgRawPath = document.uri.fsPath
    // }



    if (!fs.existsSync(removeLastSegment(document.uri.fsPath) + "image.png")) {
      console.log("Img Path:1 ", document.uri);
      console.log("Img Path:2 ", document.uri.fsPath);
      console.log("Img Path:3 ", document.uri.path);
      console.log("Img Path:4 ", removeLastSegment(document.uri.fsPath))
      window.showErrorMessage('【ERROR】剪贴板中的内容不是图片，请检查并重新截取!');
      commands.executeCommand("undo");
      return
    }
    // 获取当前文档路径
    let fileName = "";
    let fileNameWithExtension;
    if (document) {
      fileNameWithExtension = path.basename(document.fileName); // 获取带有后缀名的文件名
      fileName = path.parse(fileNameWithExtension).name; // 排除后缀名
    } else {
      console.log("【ERROR】无法获取当前打开的文档！");
      return;
    }
    // 根据当前日期时间拼接文件名
    imgFileName = fileName + "_" + common.getCurrentDateTime();
    // 获取文件后缀名
    // 拼接目标路径
    // 插入的文档必须位于 docs/section 中
    imgPath = path.join(
      pathTools.getImgFolderPath(),
      pathTools.getCurrentDocumentRelativePath()!
    );
    pathTools.ensureDirectoryExists(imgPath);
    // 将图片保存到指定位置
    fs.copyFile(
      removeLastSegment(document.uri.fsPath) + "image.png",
      path.join(imgPath, imgFileName + suffix),
      (err) => {
        if (err) {
          console.error("【ERROR】权限或目录异常，无法复制文件", err);
          return;
        }
      }
    );
    commands.executeCommand("undo").then(() => {
      const finalPath = path.join("/imgs/", pathTools.getCurrentDocumentRelativePath()!, imgFileName + suffix)
      common.insertTextAtCursorPosition(
        "<img :src=\"$withBase('" + finalPath.replace(/\\/g, '/') + "')\" />"
      );
    });
  }, 1000);
}
