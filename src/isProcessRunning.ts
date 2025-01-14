import * as cp from "child_process";

export default function isProcessRunning(processName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const platform = process.platform;
    const cmd = platform === "win32" ? `tasklist` : `ps -ax`;

    cp.exec(cmd, (err, stdout) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stdout.toLowerCase().indexOf(processName.toLowerCase()) > -1);
      }
    });
  });
}
