import * as vscode from "vscode";
import { bellplayRefCompletions, bellplayRefLookup } from "./bellplayRef";

export function activate(context: vscode.ExtensionContext) {
  
  const bellplayHoverProvider = vscode.languages.registerHoverProvider("bell", {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);
      const result = bellplayRefLookup[word];
      if (!result) {
        return undefined;
      }
      return {
        contents: [result.documentation],
      };
    },
  });

  const bellplayCompletionProvider = vscode.languages.registerCompletionItemProvider("bell", {
    provideCompletionItems() {
      return [...bellplayRefCompletions];
    },
  });

  context.subscriptions.push(bellplayCompletionProvider, bellplayHoverProvider);
}
