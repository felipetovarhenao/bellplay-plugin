import * as vscode from "vscode";
import bellplayHoverProvider from "./bellplayHoverProvider";
import runBellplayCodeCommand from "./runBellplayCodeCommand";
import bellplayCompletionProvider from "./bellplayCompletionProvider";
import attrCompletionProvider from "./attrCompletionProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(runBellplayCodeCommand, bellplayCompletionProvider, bellplayHoverProvider, attrCompletionProvider);
}
