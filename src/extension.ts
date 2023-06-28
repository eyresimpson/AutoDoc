"use strict";

import { ExtensionContext, commands, languages, window, workspace } from "vscode";
import * as vuepress from "./vuepress";
import { DocTreeProvider } from "./provider/DocTreeProvider";

export function activate(context: ExtensionContext) {
    const docTreeProvider = new DocTreeProvider();
  window.createTreeView("vuepressTree", {
    treeDataProvider: docTreeProvider,
  });
  commands.registerCommand("markdown.extension.vp.refreshEntry",()=>{
    docTreeProvider.refresh()
  })
  activateMdExt(context);
  return;
}

function activateMdExt(context: ExtensionContext) {
  // Vuepress
  vuepress.activate(context);
  languages.setLanguageConfiguration("markdown", {
    wordPattern:
      /([*_]{1,2}|~~|`+)?[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+(_+[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+)*\1/gu,
  });
}

export function deactivate() {}
