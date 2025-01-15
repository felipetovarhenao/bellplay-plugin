import * as cp from "child_process";

export default function isProcessRunning(processName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const platform = process.platform;

    const cmd = platform === "win32" ? `tasklist` : `ps -ax | grep -i ${processName} | grep -v grep`;

    cp.exec(cmd, (err, stdout) => {
      if (err) {
        resolve(false);
      } else {
        const isRunning =
          platform === "win32"
            ? stdout.toLowerCase().includes(processName.toLowerCase())
            : stdout.split("\n").some((line) => line.toLowerCase().includes(processName.toLowerCase()));
        resolve(isRunning);
      }
    });
  });
}
