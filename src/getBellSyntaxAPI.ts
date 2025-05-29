import * as vscode from "vscode";

export default async function getBellSyntaxAPI() {
  const ext = vscode.extensions.getExtension("tovarhenao.bell-syntax");

  if (!ext) {
    vscode.window.showErrorMessage("Required extension not found.");
    return;
  }

  const api = ext.isActive ? ext.exports : await ext.activate();

  return api;
}
