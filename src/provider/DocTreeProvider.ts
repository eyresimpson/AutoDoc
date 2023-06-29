import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Command, ThemeIcon, workspace } from "vscode";
import common from "../tools/commonTools";
import pathTools from "../tools/pathTools";

export class DocTreeProvider implements vscode.TreeDataProvider<DocItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    DocItem | undefined | null | void
  > = new vscode.EventEmitter<DocItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    DocItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: DocItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DocItem): Thenable<DocItem[]> {
    if (element) {
      // 如果不是顶级节点
      return Promise.resolve(element.children);
    } else {
      // 顶级节点需要从配置中赋值
      return Promise.resolve(this.getStructInConfig(pathTools.getConfigPath()));
    }
  }

  // 尝试从配置文件中获取结构
  getStructInConfig(path: string): DocItem[] {
    // 读取js
    let config = common.extractDefaultThemeConfigFromFile(path);
    let arr = [];
    arr.push(
      new DocItem(
        "菜单目录",
        "【框架】",
        vscode.TreeItemCollapsibleState.Collapsed,
        this.analysisMenu(config.navbar),
        ThemeIcon.Folder,
        {
          title: "",
          command: "noah.vp.previewFile",
        }
      )
    );
    arr.push(
      new DocItem(
        "文档章节",
        "【框架】",
        vscode.TreeItemCollapsibleState.Collapsed,
        this.analysisStruct(config.sidebar),
        ThemeIcon.Folder,
        {
          title: "",
          command: "noah.vp.previewFile",
        }
      )
    );
    return arr;
  }

  // 分析菜单结构
  analysisMenu(arr: Array<any>): DocItem[] {
    let docItemArr: DocItem[] = [];
    for (let index in arr) {
      docItemArr.push(
        new DocItem(
          arr[index].text,
          "【菜单】",
          vscode.TreeItemCollapsibleState.None,
          [],
          ThemeIcon.Folder,
          {
            title: "",
            command: "noah.vp.previewFile",
          }
        )
      );
    }
    return docItemArr;
  }
  // 分析数据结构树
  analysisStruct(arr: Array<any>): DocItem[] {
    let docItemArr: DocItem[] = [];
    for (let index in arr) {
      if (arr[index].children) {
        // 有子数组
        docItemArr.push(
          new DocItem(
            arr[index].text,
            "【节点】",
            vscode.TreeItemCollapsibleState.Collapsed,
            this.analysisStruct(arr[index].children),
            ThemeIcon.Folder,
            {
              title: "",
              command: "noah.vp.previewFile",
            }
          )
        );
      } else {
        if (typeof arr[index] != "string") continue;
        // 没有子数组，整理文档存入
        // TODO:后续应该改成具体标题的
        let filePath = pathTools.getDocFolderPath();

        if (arr[index].endsWith(".md") || arr[index].endsWith(".MD")) {
          filePath = path.join(filePath, arr[index]);
        } else {
          try {
            filePath = path.join(filePath, arr[index] + "README.md");
          } catch (error) {
            filePath = path.join(filePath, arr[index] + "readme.md");
          }
        }
        common.getFileTitle(filePath).then((name) => {
          docItemArr.push(
            new DocItem(
              // common.extractContent(arr[index]),
              name || "",
              "【文档】",
              vscode.TreeItemCollapsibleState.None,
              [],
              ThemeIcon.File,
              {
                command: "noah.vp.openDoc",
                title: "打开文档",
                arguments: [arr[index]],
              }
            )
          );
        });
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
    public children: Array<DocItem>,
    override iconPath = ThemeIcon.File,
    public override readonly command: vscode.Command
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.type}`;
    this.description = this.type;
  }
}
