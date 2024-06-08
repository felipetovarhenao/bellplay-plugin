import * as vscode from "vscode";
import { bellplayRefCompletions, bellplayRefLookup, bellplayRefDict } from "./bellplayRef";

export function activate(context: vscode.ExtensionContext) {
  const bellplayHoverProvider = vscode.languages.registerHoverProvider("bell", {
    provideHover(document: vscode.TextDocument, position: vscode.Position) {
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

  const attrCompletionProvider = vscode.languages.registerCompletionItemProvider(
    "bell",
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const linePrefix = document.lineAt(position).text.slice(0, position.character);
        const regex = /(?<=\()\w+/;
        const match = linePrefix.split("").reverse().join("").match(regex);

        if (match && match[0]) {
          const token = match[0].split("").reverse().join("");
          const result = bellplayRefDict[token];
          return result.args.map((arg: any) => {
            const argname = arg.name.split(" ")[0].slice(1);
            const item = new vscode.CompletionItem(`@${argname}`, vscode.CompletionItemKind.Keyword);
            item.insertText = `${argname} `;
            return item;
          });
        }
        return undefined;
      },
    },
    "@"
  );

  context.subscriptions.push(bellplayCompletionProvider, bellplayHoverProvider, attrCompletionProvider);
}
