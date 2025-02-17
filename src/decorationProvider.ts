import * as vscode from "vscode";

class ActiveScriptDecorationProvider implements vscode.FileDecorationProvider {
  private loadedFile: string | undefined;
  private readonly fileDecorationEmitter = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();

  // Expose the event from the emitter
  readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> = this.fileDecorationEmitter.event;

  setLoadedFile(filePath: string) {
    this.loadedFile = filePath;
    // Fire the event with `undefined` to trigger a refresh for all decorations
    this.fileDecorationEmitter.fire(undefined);
  }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    if (this.loadedFile && uri.fsPath === this.loadedFile) {
      return {
        badge: "⚡",
        tooltip: "This file is currently loaded in bellplay~",
      };
    }
    return undefined;
  }
}
const decorationProvider = new ActiveScriptDecorationProvider();

export default decorationProvider;
