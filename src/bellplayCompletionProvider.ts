import * as vscode from "vscode";
import { bellplayRefCompletions, bellplayRefLookup } from "./bellplayRef";

const bellplayCompletionProvider = vscode.languages.registerCompletionItemProvider("bell", {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
    const range = document.getWordRangeAtPosition(position);

    if (!range) {
      return undefined;
    }

    const start = range.start.character;
    const prefix = document.lineAt(position).text.slice(start - 1, start);

    // stop early if token is not a global variable
    if (/[$#@]/.test(prefix)) {
      return undefined;
    }

    return [...bellplayRefCompletions];
  },
});

export default bellplayCompletionProvider;
