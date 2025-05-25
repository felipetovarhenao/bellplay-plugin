import * as vscode from "vscode";
import bellplay from "./bellplay.json";

const bellplayRefLookup: any = {};

const bellplayRefCompletions = bellplay.reference.map((x) => {
  // let description = `\`\`\`bell\n${x.name}(`;

  const argCompletions: vscode.CompletionItem[] = [];
  if (x.args.length > 0) {
    x.args.forEach((arg: any, index: number) => {
      let defaultValue = undefined;

      // append default value, if any
      if (arg.default !== undefined || arg.default === null) {
        defaultValue = arg.default === null ? "null" : arg.default;
      }

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
        arg.options && arg.options.length > 0
          ? argCompletion.insertText.appendChoice(arg.options.map((opt: any) => `${opt.value}`))
          : argCompletion.insertText.appendVariable("1", `${defaultValue}`);
      }

      argCompletions.push(argCompletion);
    });
  }

  const item = new vscode.CompletionItem(x.name, vscode.CompletionItemKind.Function);
  item.insertText = new vscode.SnippetString(`${x.name}(\${1})`);
  item.detail = `bellplay~ function (${bellplay.version})`;
  const docs: vscode.MarkdownString = new vscode.MarkdownString(x.markdown);
  item.documentation = docs;
  bellplayRefLookup[x.name] = {
    completion: item,
    args: argCompletions,
  };
  return item;
});

export { bellplayRefCompletions, bellplayRefLookup };
