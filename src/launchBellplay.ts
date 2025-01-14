import * as cp from "child_process";

export default function launchBellplay(): boolean {
  const platform = process.platform;
  const bellplayPath = platform === "win32" ? "C:\\Program Files\\bellplay~\\" : "/Applications/bellplay~.app";

  try {
    const child = cp.spawn(platform === "win32" ? "start" : "open", [bellplayPath], {
      shell: true,
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    return true;
  } catch (error) {
    return false;
  }
}
