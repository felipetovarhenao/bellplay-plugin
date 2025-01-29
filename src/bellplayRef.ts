import * as vscode from "vscode";
import bellplay from "./bellplay.json";

const bellplayRefLookup: any = {};

function cleanDocString(input: string): string {
  return input
    .replace(/#(\w+)/g, "`$1`")
    .replace(/(@\w+)/g, "`$1`")
    .replace(/\b(null)\b/g, "`$1`");
}

const bellplayRefCompletions = bellplay.reference.map((x) => {
  let description = `\`\`\`bell\n${x.name}(`;
  let argDocs = x.args.length > 0 ? "\n---\n**Arguments**:\n" : "\n";
  const argCompletions: vscode.CompletionItem[] = [];
  if (x.args.length > 0) {
    description += "\n";
    x.args.forEach((arg: any, index: number) => {
      // argument as a list item, prepended with @ when not variadic
      let argname = `\t${arg.name === "<...>" ? arg.name : `@${arg.name}`}`;
      let argDoc = `\n- \`@${arg.name}\` [ ***${arg.type}*** ]`;

      let defaultValue = undefined;

      argDoc += `: ${cleanDocString(arg.description)}`;

      // append default value, if any
      if (arg.default !== undefined || arg.default === null) {
        defaultValue = arg.default === null ? "null" : arg.default;
        argDoc += arg.default !== undefined ? ` (_default_: \`${arg.default}\`)` : "";
      }
      if (!argDoc.endsWith(".")) {
        argDoc += ".";
      }
      if (arg.default === undefined) {
        argDoc += " (_required_).";
      }
      if (arg.options) {
        arg.options.forEach((opt: any) => {
          let optDoc = "\n\t- ";
          optDoc += `\`${opt.value}\``;
          if (opt.description) {
            optDoc += `: ${opt.description}`;
          }
          argDoc += optDoc;
        });
      }

      argname += ` ${defaultValue === undefined ? "null" : defaultValue}`;

      argDocs += argDoc;
      // concat to description
      description += `${argname}\n`;

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
  description += ")\n```\n\n";
  description += `\n${cleanDocString(x.description)}\n\n`;
  if (x.buffer_keys) {
    description += `\n---\n**Resulting keys**\n\n${x.buffer_keys.map((x) => `- \`'${x}'\``).join("\n")}\n\n`;
  }
  description += `${argDocs}\n\n`;
  const item = new vscode.CompletionItem(x.name, vscode.CompletionItemKind.Function);
  item.insertText = new vscode.SnippetString(`${x.name}(\${1})`);
  item.detail = `bellplay~ function (${bellplay.version})`;
  const docs: vscode.MarkdownString = new vscode.MarkdownString(description);
  item.documentation = docs;
  bellplayRefLookup[x.name] = {
    completion: item,
    args: argCompletions,
  };
  return item;
});

export { bellplayRefCompletions, bellplayRefLookup };
