'use strict';

import { ExtensionContext, languages } from 'vscode';
import * as vuepress from './vuepress';

export function activate(context: ExtensionContext) {
    activateMdExt(context);
    return;
}

function activateMdExt(context: ExtensionContext) {
    // Vuepress
    vuepress.activate(context);
    languages.setLanguageConfiguration('markdown', {
        wordPattern: /([*_]{1,2}|~~|`+)?[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+(_+[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+)*\1/gu
    });
}


export function deactivate() { }
