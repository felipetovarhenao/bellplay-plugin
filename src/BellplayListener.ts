import * as vscode from "vscode";
// Create a custom terminal that implements the required members.
export default class BellplayListener {
  private _writeEmitter = new vscode.EventEmitter<string>();
  public onDidWrite: vscode.Event<string> = this._writeEmitter.event;

  // Called when the terminal is opened.
  open(): void {
    // Initial welcome message.
    this._writeEmitter.fire("🎧 Listening to bellplay~ messages\r\n");
  }

  // Called when the terminal is closed.
  close(): void {
    // stopOSCListener();
  }

  // Helper method to log a message.
  public log(message: string): void {
    // Append a newline to ensure each message is on its own line.
    this._writeEmitter.fire(message + "\r\n");
  }
}
