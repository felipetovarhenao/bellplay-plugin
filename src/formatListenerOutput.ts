import prettyPrint from "./prettyPrint";

// ANSI color codes
const ORANGE = "\x1b[38;5;208m"; // Extended ANSI code for orange
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const ITALICS = "\x1b[3m";
const RED = "\x1b[31m";
const GREEN = "\x1b[92m";
const BLUE = "\x1b[38;2;65;105;225m";
const GRAY = "\x1b[38;5;241m";
const PURPLE = "\x1b[35m";

enum MessageType {
  MESSAGE,
  ERROR,
  WARNING,
  BUG,
}

export default function formatListenerOutput(strings: string[]): string {
  if (strings.length < 3) return "";
  // get message type
  const typeIndex: number = Number(strings[0]);
  const type = [MessageType.MESSAGE, MessageType.ERROR, MessageType.WARNING, MessageType.BUG][Number.isNaN(typeIndex) ? 0 : typeIndex];
  // Color the header (first string) in orange.
  const header = strings[1] === "" ? "" : `${ITALICS}${ORANGE}${strings[1]}${RESET} ${GRAY}•${RESET} `;
  // Join the remaining strings.
  let content = strings.slice(2).join(" ");
  switch (type) {
    case MessageType.ERROR:
      content = `${RED}${content}${RESET}`;
      break;
    case MessageType.WARNING:
      content = `${GREEN}${content}${RESET}`;
      break;
    case MessageType.BUG:
      content = `${BLUE}${content}${RESET}`;
      break;
    default:
      // Replace square brackets and numbers with their colored versions.
      content = prettyPrint(content).replace(/(\[|\]|\bnull\b|\b(-?\d+(\.\d+)?)\b)/g, (match) => {
        if (match === "[" || match === "]") {
          return `${YELLOW}${match}${RESET}`;
        } else if (match === "null") {
          return `${PURPLE}${match}${RESET}`;
        } else {
          return `${CYAN}${match}${RESET}`;
        }
      });
      break;
  }

  return `${RESET}${header}${content}`;
}
