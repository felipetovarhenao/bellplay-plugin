import * as vscode from "vscode";
import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";

export default function launchBellplay(): boolean {
  const platform = process.platform;
  const defaultPath = platform === "win32" ? "C:\\Program Files\\bellplay~\\bellplay.exe" : "/Applications/bellplay~.app";

  // Read user-defined path from VSCode settings
  const config = vscode.workspace.getConfiguration("bellplay");
  const userDefinedPath = config.get<string>("defaultPath");

  // Use user-defined path if set, otherwise use the default
  const bellplayPath = userDefinedPath && userDefinedPath.trim() ? userDefinedPath : defaultPath;

  try {
    // Validate the path
    if (!fs.existsSync(bellplayPath)) {
      vscode.window.showErrorMessage(`The path "${bellplayPath}" does not exist.`);
      return false;
    }

    if (!isExecutableFile(bellplayPath, platform)) {
      vscode.window.showErrorMessage(`The path "${bellplayPath}" is not a valid application.`);
      return false;
    }

    // Launch the application
    const child = cp.spawn(platform === "win32" ? "start" : "open", [bellplayPath], {
      shell: true,
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    return true;
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to launch bellplay~: ${error.message}`);
    return false;
  }
}

/**
 * Validates if the given file path points to a valid executable or application.
 */
function isExecutableFile(filePath: string, platform: string): boolean {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (platform === "win32") {
      return ext === ".exe";
    } else if (platform === "darwin") {
      return ext === ".app";
    }
    return false;
  } catch {
    return false;
  }
}
