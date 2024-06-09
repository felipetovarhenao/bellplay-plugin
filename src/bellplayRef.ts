import * as vscode from "vscode";
import bellplay from "./bellplay.json";

const bellplayRefLookup: any = {};

function replaceHashtagWords(input: string): string {
  return input.replace(/#(\w+)/g, "`$1`");
}

const bellplayRefCompletions = bellplay.map((x) => {
  let description = `\`\`\`c\n${x.name}()\n\`\`\`\n`;

  const argCompletions: vscode.CompletionItem[] = [];
  if (x.args.length > 0) {
    description += `\nArguments:\n`;
    x.args.forEach((arg: any, index: number) => {
      // argument as a list item, prepended with @ when not variadic
      let argname = `\n\t- ${arg.name === "<...>" ? arg.name : `@${arg.name}`}`;

      let defaultValue = undefined;

      // append default value, if any
      if (arg.default != undefined || arg.default === null) {
        defaultValue = arg.default === null ? "null" : arg.default;
        argname += ` ${defaultValue}`;
      }

      // concat to description
      description += argname;

      // stop early if arg is variadic
      if (arg.name === "<...>") {
        return;
      }
      // create arg completion
      const argCompletion = new vscode.CompletionItem(`@${arg.name}`, vscode.CompletionItemKind.Field);
      argCompletion.insertText = new vscode.SnippetString(`${arg.name} `);
      argCompletion.filterText = arg.name;
      argCompletion.sortText = `${index}`;

      if (defaultValue != undefined) {
        argCompletion.label += ` ${defaultValue}`;
        argCompletion.insertText.appendVariable("1", `${defaultValue}`);
      }

      argCompletions.push(argCompletion);
    });
  }

  description += `\n${replaceHashtagWords(x.description)}\n\n`;
  const item = new vscode.CompletionItem(x.name, vscode.CompletionItemKind.Function);
  item.insertText = new vscode.SnippetString(`${x.name}(\${1})`);
  item.detail = "bellplay~ function";
  const docs: any = new vscode.MarkdownString(description);
  item.documentation = docs;
  bellplayRefLookup[x.name] = {
    completion: item,
    args: argCompletions,
  };
  return item;
});

export { bellplayRefCompletions, bellplayRefLookup };
