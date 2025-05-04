import prettyPrint from "./prettyPrint";

// ANSI color codes
const ORANGE = "\x1b[38;2;240;169;131m"; // #f0a983
const YELLOW = "\x1b[38;2;223;192;131m"; // #dfc083
const CYAN = "\x1b[38;2;129;207;223m"; // #81cfdf
const RESET = "\x1b[0m";
const ITALICS = "\x1b[3m";
const RED = "\x1b[38;2;229;113;113m"; // #e57171
const BLUE = "\x1b[38;2;121;191;245m"; // #79bff5
const GREEN = "\x1b[38;2;167;220;139m"; // #a7dc8b
const GRAY = "\x1b[38;5;241m";
const PURPLE = "\x1b[38;2;158;142;238m"; // #9e8eee

enum MessageType {
  MESSAGE,
  ERROR,
  WARNING,
  BUG,
}

export default function formatListenerOutput(string: string): string {
  const strings = string.split(" ");

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
      // content = prettyPrint(content);
      content = content.replace(/(\[|\]|\bnull\b|\b(-?\d+(\.\d+)?)\b)/g, (match) => {
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
