import { Server } from "node-osc";
import * as vscode from "vscode";
import formatListenerOutput from "./formatListenerOutput";

let oscServer: Server | null = null;

// Create a custom terminal that implements the required members.
class OSCLoggerTerminal {
  private _writeEmitter = new vscode.EventEmitter<string>();
  public onDidWrite: vscode.Event<string> = this._writeEmitter.event;

  // Called when the terminal is opened.
  open(): void {
    // Initial welcome message.
    this._writeEmitter.fire("🎧 Listening to bellplay~ messages\r\n");
  }

  // Called when the terminal is closed.
  close(): void {
    stopOSCListener();
  }

  // Helper method to log a message.
  public log(message: string): void {
    // Append a newline to ensure each message is on its own line.
    this._writeEmitter.fire(message + "\r\n");
  }
}

// Instantiate the custom terminal.
const oscLoggerTerminal = new OSCLoggerTerminal();

const terminal = vscode.window.createTerminal({
  name: "bellplay~ listener",
  pty: {
    onDidWrite: oscLoggerTerminal.onDidWrite,
    open: oscLoggerTerminal.open,
    close: oscLoggerTerminal.close,
  },
});

export function startOSCListener(): void {
  terminal.show(); // Show our custom terminal.

  if (!oscServer) {
    oscServer = new Server(12346, "127.0.0.1");
    oscServer.on("message", (msg: any) => {
      const path = msg.shift();
      if (path.startsWith("console/")) {
        oscLoggerTerminal.log(formatListenerOutput(msg));
      }
    });
  }
}

export function stopOSCListener(): void {
  if (oscServer) {
    oscServer.close();
    oscServer = null;
    vscode.window.showInformationMessage("🛑 Stopped OSC listener.");
  }
}
