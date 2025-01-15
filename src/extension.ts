import * as vscode from "vscode";
import bellplayHoverProvider from "./bellplayHoverProvider";
import runBellplayCodeCommand from "./runBellplayCodeCommand";
import bellplayCompletionProvider from "./bellplayCompletionProvider";
import attrCompletionProvider from "./attrCompletionProvider";
import decorationProvider from "./decorationProvider";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerFileDecorationProvider(decorationProvider);
  context.subscriptions.push(runBellplayCodeCommand, bellplayCompletionProvider, bellplayHoverProvider, attrCompletionProvider);
}
