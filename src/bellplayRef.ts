import * as vscode from "vscode";
import bellplay from "./bellplay.json";

const bellplayRefLookup: any = {};

const bellplayRefCompletions = bellplay.map((x) => {
  let description = `\`\`\`c\n${x.name}()\n\`\`\`\n`;

  const argCompletions: vscode.CompletionItem[] = [];
  if (x.args.length > 0) {
    description += `\nArguments:\n`;
    x.args.forEach((arg: any) => {
      // argument as a list item, prepended with @ when not variadic
      let argname = `\n\t- ${arg.name === "<...>" ? arg.name : `@${arg.name}`}`;

      // provide default value, if any
      if (arg.default != undefined || arg.default === null) {
        argname += ` ${arg.default === null ? "null" : arg.default}`;
      }

      // concat to description
      description += argname;

      // create arg completion
      const argCompletion = new vscode.CompletionItem(arg.name, vscode.CompletionItemKind.Field);
      argCompletion.insertText = `${arg.name} `;
      argCompletions.push(argCompletion);
    });
  }
  description += `\n${x.description}\n\n`;
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
