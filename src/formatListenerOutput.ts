import prettyPrint from "./prettyPrint";

// ANSI color codes
const ORANGE = "\x1b[38;5;208m"; // Extended ANSI code for orange
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const ITALICS = "\x1b[3m";

export default function formatListenerOutput(strings: string[]): string {
  if (strings.length === 0) return "";
  // Color the header (first string) in orange.
  const header = strings[0] === "" ? "" : `${ITALICS}${ORANGE}${strings[0]}${RESET} • `;
  // Join the remaining strings.
  let content = prettyPrint(strings.slice(1).join(" "));

  // Replace square brackets and numbers with their colored versions.
  content = content.replace(/(\[|\]|\b(-?\d+(\.\d+)?)\b)/g, (match) => {
    if (match === "[" || match === "]") {
      return `${YELLOW}${match}${RESET}`;
    } else {
      return `${CYAN}${match}${RESET}`;
    }
  });

  return `${header}${content}`;
}
