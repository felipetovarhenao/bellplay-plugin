import * as vscode from "vscode";
import { bellplayRefLookup } from "./bellplayRef";
import bellplay from "./bellplay.json";

const bellplayHoverProvider = vscode.languages.registerHoverProvider("bell", {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range);
    const result = bellplayRefLookup[word];
    if (!result) {
      return undefined;
    }
    const docs = new vscode.MarkdownString(result.completion.documentation.value);
    docs.appendMarkdown(`_bellplay~ (${bellplay.version})_`);
    return {
      contents: [docs],
    };
  },
});

export default bellplayHoverProvider;
