import { Uri, commands } from "vscode";
import pathTools from "./pathTools";

const fs = require("fs");
const path = require("path");
// 这是 Vuepress 的配置工具类
export class VuepressConfig {
  constructor() {
    this.analysis();
  }
  // 配置文件路径（必须）
  filePath: string = pathTools.getConfigPath();

  // 主配置文件
  defineUserConfig?: DefineUserConfig;
  // 对目标配置文件进行解析
  analysis() {
    // 读取 JS 文件内容
    const filePath = path.join(__dirname, "/Users/eyresimpson/Code/zerocloud-doc/source-codes/zerocloud-doc/docs/.vuepress/config.js");
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // 从文件内容中提取参数
    const regex = /defineUserConfig\(([\s\S]*?)\);/; // 匹配 defineUserConfig 方法的参数部分
    const match = fileContent.match(regex);
    if (match && match.length > 1) {
      const configStr = match[1];
      const config = eval(`(${configStr})`); // 将参数字符串解析为 JavaScript 对象

      // 将 defaultTheme 方法的参数转换为 JSON，并赋值给 theme
      if (typeof config.theme === "function") {
        const defaultThemeParams = config.theme();
        config.theme = JSON.stringify(defaultThemeParams, null, 2);
      }

      // 检查 JSON 是否符合规范
      try {
        JSON.parse(JSON.stringify(config));
        console.log(JSON.stringify(config, null, 2));
      } catch (error) {
        console.error("Invalid JSON:");
      }
    } else {
      console.log("Unable to extract config from file");
    }
  }
  // 将配置应用到当前配置文件
  apply() {}
}


export default {

}