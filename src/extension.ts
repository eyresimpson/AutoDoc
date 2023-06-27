"use strict";

import { ExtensionContext, languages, window, workspace } from "vscode";
import * as vuepress from "./vuepress";
import { DocTreeProvider } from "./provider/DocTreeProvider";

export function activate(context: ExtensionContext) {
  window.createTreeView("nodeDependencies", {
    treeDataProvider: new DocTreeProvider(),
  });
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
