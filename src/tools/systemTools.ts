import { spawn } from "child_process";
import { Func } from "mocha";
import path = require("path");
import { ShellExecution, Task, TaskScope, tasks, window } from "vscode";

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
export default {
  getSystemFlag,
  executeNpmScript,
};
