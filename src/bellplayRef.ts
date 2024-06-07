import * as vscode from "vscode";
import bellplay from "./bellplay.json";

const bellplayRefLookup: any = {};

const bellplayRefCompletions = bellplay.map((x) => {
  let description = `\`\`\`c\n${x.name}()\n\`\`\`\n`;
  if (x.args.length > 0) {
    description += `\nArguments:\n`;
    x.args.forEach((arg: any) => (description += `\n\t- ${arg.name}`));
  }
  description += `\n${x.description}\n\n`;
  const item = new vscode.CompletionItem(x.name);
  item.insertText = new vscode.SnippetString(`${x.name}(\${1})`);
  const docs: any = new vscode.MarkdownString(description);
  item.documentation = docs;
  bellplayRefLookup[x.name] = item;
  return item;
});

export { bellplayRefCompletions, bellplayRefLookup };
