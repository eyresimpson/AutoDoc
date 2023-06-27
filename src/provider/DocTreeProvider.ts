import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class DocTreeProvider implements vscode.TreeDataProvider<DocItem> {
  getTreeItem(element: DocItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DocItem): Thenable<DocItem[]> {
    if (element) {
      // 如果不是顶级节点
      return Promise.resolve(element.children);
    } else {
      // 顶级节点需要从配置中赋值
      return Promise.resolve(
        this.getStructInConfig(
          "/Users/eyresimpson/Code/zerocloud-doc/source-codes/zerocloud-doc/docs/.vuepress/config.js"
        )
      );
    }
  }

  // 尝试从配置文件中获取结构
  getStructInConfig(path: string): DocItem[] {
    // 读取js
    let config = extractDefaultThemeConfigFromFile(path);
    let arr = [];
    arr.push(
      new DocItem(
        "主菜单",
        "结构",
        vscode.TreeItemCollapsibleState.Collapsed,
        this.analysisMenu(config.navbar)
      )
    );
    arr.push(
      new DocItem(
        "文档章节",
        "结构",
        vscode.TreeItemCollapsibleState.Collapsed,
        this.analysisStruct(config.sidebar)
      )
    );
    return arr;
  }

  analysisMenu(arr: Array<any>): DocItem[]{
    let docItemArr: DocItem[] = [];
    for (let index in arr) {
      docItemArr.push(
        new DocItem(
          arr[index].text,
          "菜单",
          vscode.TreeItemCollapsibleState.None,
          []
        )
      );
    }
    return docItemArr;
  }

  analysisStruct(arr: Array<any>): DocItem[] {
    let docItemArr: DocItem[] = [];
    for (let index in arr) {
      if (arr[index].children) {
        // 有子数组
        docItemArr.push(
          new DocItem(
            arr[index].text,
            "节点",
            vscode.TreeItemCollapsibleState.Collapsed,
            this.analysisStruct(arr[index].children)
          )
        );
      } else {
        if (typeof arr[index] != "string") continue;
        // 没有子数组，整理文档存入
        // TODO:后续应该改成具体标题的
        docItemArr.push(
          new DocItem(
            extractContent(arr[index]),
            "文档",
            vscode.TreeItemCollapsibleState.None,
            []
          )
        );
      }
    }
    return docItemArr;
  }
}

class DocItem extends vscode.TreeItem {
  constructor(
    public override readonly label: string,
    private type: string,
    public override readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public children: Array<DocItem>
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.type}`;
    this.description = this.type;
  }

  override iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "light",
      "dependency.svg"
    ),
    dark: path.join(
      __filename,
      "..",
      "..",
      "resources",
      "dark",
      "dependency.svg"
    ),
  };
}

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

function extractContent(input: string): string {
  const parts = input.split("/"); // 将字符串按照斜杠进行分割
  let lastPart = "";
  if (input.endsWith("/")) {
    lastPart = parts[parts.length - 2]; // 获取倒数第二个分割后的部分
  } else {
    if(input.endsWith(".md")){
      lastPart = parts[parts.length - 1].split(".md")[0];
    }else{
      lastPart = parts[parts.length - 1]; // 获取倒数第二个分割后的部分
    }
    
  }
  return lastPart;
}
