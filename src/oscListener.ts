import { Server } from "node-osc";
import * as vscode from "vscode";
import formatListenerOutput from "./formatListenerOutput";
import BellplayListener from "./BellplayListener";

export let oscServer: Server | null = null;
const bellplayListener = new BellplayListener();
let terminal: null | vscode.Terminal = null;

const startTerminal = () => {
  terminal = vscode.window.createTerminal({
    name: "bellplay~ listener",
    pty: {
      onDidWrite: bellplayListener.onDidWrite,
      open: bellplayListener.open,
      close: bellplayListener.close,
    },
    iconPath: new vscode.ThemeIcon("bell"),
  });
  terminal.show();
};

export function startOSCListener(): void {
  if (!terminal) {
    startTerminal();
  }

  if (!oscServer) {
    oscServer = new Server(12346, "127.0.0.1");
    oscServer.on("message", (msg: any) => {
      const path = msg.shift();
      if (path.startsWith("console/")) {
        bellplayListener.log(formatListenerOutput(msg));
      }
    });
  }
}

export function stopOSCListener(): void {
  if (oscServer) {
    oscServer.close();
    oscServer = null;
    vscode.window.showInformationMessage("🛑 Stopped bellplay~ listener.");
  }
}
