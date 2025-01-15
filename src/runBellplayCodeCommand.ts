import * as vscode from "vscode";
import sendOscMessage from "./sendOscMessage";
import isProcessRunning from "./isProcessRunning";
import * as path from "path";
import { Server } from "node-osc";
import launchBellplay from "./launchBellplay";
import decorationProvider from "./decorationProvider";

const runBellplayCodeCommand = vscode.commands.registerCommand("extension.runInBellplay", async () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("❌ No active editor found.");
    return;
  }

  const document = editor.document;
  if (document.languageId !== "bell") {
    vscode.window.showErrorMessage("❌ The active file is not a .bell file.");
    return;
  }

  const filePath = document.fileName;

  const runScript = () => {
    vscode.window.showInformationMessage(`⚡ Running ${path.basename(filePath)} script in bellplay~.`);
    sendOscMessage(filePath);
    decorationProvider.setLoadedFile(filePath); // Persist the loaded file state
  };

  try {
    const isRunning = await isProcessRunning("bellplay~");
    if (isRunning) {
      runScript();
    } else {
      vscode.window.showInformationMessage(`🚀 Launching bellplay~...`);
      const launched = await launchBellplay();
      if (!launched) {
        vscode.window.showErrorMessage("❌ Failed to launch bellplay~. Please open it manually and try again.");
        return;
      } else {
        // Listen for OSC message indicating bellplay~ is ready
        const oscServer = new Server(12346, "127.0.0.1", () => {
          vscode.window.showInformationMessage("⏳ Waiting for bellplay~ to load...");
        });

        oscServer.on("message", (msg: any) => {
          if (msg[0] === "/ready") {
            runScript();
            oscServer.close(); // Close the server after receiving the readiness signal
          }
        });

        // Add a timeout to avoid waiting indefinitely
        setTimeout(() => {
          oscServer.close();
        }, 30000); // 30-second timeout
      }
    }
  } catch (err) {
    vscode.window.showErrorMessage(`❌ Failed to send file to bellplay~: ${(err as any).message}`);
  }
});

export default runBellplayCodeCommand;
