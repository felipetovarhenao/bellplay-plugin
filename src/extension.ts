import * as vscode from "vscode";
import { bellplayRefCompletions, bellplayRefLookup } from "./bellplayRef";
import bellplay from "./bellplay.json";

export function activate(context: vscode.ExtensionContext) {
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

        // we only want to show completions if @ is preceded by spaces or alpha + parens
        const cleanAttrPattern = /(?<=(\w+\(|\s+))@$/;
        const isCleanAttr = cleanAttrPattern.test(linePrefix);

        // stop early
        if (!isCleanAttr) {
          return;
        }

        /* 
        we use regex pattern for a reversed function, so as to catch the most recent function.
        this might cause some issues but in general works well
        */
        const regex = /(?<=\()\w+\.?/;

        // reverse line prefix and apply regex
        const match = linePrefix.split("").reverse().join("").match(regex);

        if (match && match[0]) {
          // if matched, reverse back
          let token = match[0].split("").reverse().join("");
          let isDotted = false;

          // check if function is using dotted syntax and remove dot
          if (token.startsWith(".")) {
            token = token.slice(1);
            isDotted = true;
          }

          // check if it exists
          const result = bellplayRefLookup[token];
          if (!result) {
            return undefined;
          }

          // remove first argument for dotted syntax
          return isDotted ? result.args.slice(1) : result.args;
        }
        return undefined;
      },
    },
    "@"
  );

  context.subscriptions.push(bellplayCompletionProvider, bellplayHoverProvider, attrCompletionProvider);
}
