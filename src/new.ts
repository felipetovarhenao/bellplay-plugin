import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import { Client } from "node-osc";
import launchBellplay from "./launchBellplay";
import isProcessRunning from "./isProcessRunning";
import sendOscMessage from "./sendOscMessage";

export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(play) Send to Bellplay~";
  statusBarItem.command = "extension.runInBellplay";
  context.subscriptions.push(statusBarItem);

  vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === "bell") {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  });

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor?.document.languageId === "bell") {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  });

  const disposable = vscode.commands.registerCommand("extension.runInBellplay", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found.");
      return;
    }

    const document = editor.document;
    if (document.languageId !== "bell") {
      vscode.window.showErrorMessage("The active file is not a .bell file.");
      return;
    }

    const filePath = document.fileName;

    try {
      const isRunning = await isProcessRunning("bellplay");
      if (!isRunning) {
        launchBellplay();
        // Give some time for the process to start
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      sendOscMessage(filePath);
      vscode.window.showInformationMessage(`Sent ${path.basename(filePath)} to bellplay~.`);
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to send file to bellplay~: ${(err as any).message}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
