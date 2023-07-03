import { spawn } from "child_process";
import { Func } from "mocha";
import path = require("path");
import { window } from "vscode";

const os = require("os");

// 获取系统标识符
// 0：Windows、1：Macos、2：Linux
function getSystemFlag() {
  const platform = os.platform();
  if (platform === "win32") {
    return 0;
  } else if (platform === "darwin") {
    return 1;
  } else if (platform === "linux") {
    return 2;
  } else {
    return -1;
  }
}

// 系统剪贴板复制
function saveClipboardImageToFile(imagePath: string, cb: Function) {
  if (!imagePath) return;
  let platform = process.platform;
  if (platform === "win32") {
    // Windows
    const scriptPath = path.join(__dirname, "./lib/pc.ps1");
    const powershell = spawn("powershell", [
      "-noprofile",
      "-noninteractive",
      "-nologo",
      "-sta",
      "-executionpolicy",
      "unrestricted",
      "-windowstyle",
      "hidden",
      "-file",
      scriptPath,
      imagePath,
    ]);
    powershell.on("exit", function (_code, _signal) {});
    powershell.stdout.on("data", function (data) {
      cb(data.toString().trim());
    });
  } else if (platform === "darwin") {
    // Mac
    let scriptPath = path.join(__dirname, "../lib/mac.applescript");

    let ascript = spawn("osascript", [scriptPath, imagePath]);
    ascript.on("exit", function (_code, _signal) {});

    ascript.stdout.on("data", function (data) {
      cb(data.toString().trim());
    });
  } else {
    // Linux

    let scriptPath = path.join(__dirname, "./lib/linux.sh");

    let ascript = spawn("sh", [scriptPath, imagePath]);
    ascript.on("exit", function (_code, _signal) {});

    ascript.stdout.on("data", function (data) {
      let result = data.toString().trim();
      if (result == "no xclip") {
        window.showInformationMessage(
          "You need to install xclip command first."
        );
        return;
      }
      cb(result);
    });
  }
}

export default {
  getSystemFlag,
  saveClipboardImageToFile,
};
