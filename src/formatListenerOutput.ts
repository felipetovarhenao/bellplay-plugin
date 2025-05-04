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

// Pattern matchers and color map
const PATTERN_MATCHERS = [
  { name: "fraction", regex: /(?<![A-Za-z_0-9$#@)\]])[+\-]?\d+\/\d+/ },
  { name: "decimal", regex: /(?<![A-Za-z_0-9$#@)\]])((?<!\d\.)[+\-])?(\d+(\.(?!\.))\d*|\d*((?<!\.\.)\.)\d+|\d+)([eE][+\-]?\d+)?(?!\w)/ },
  { name: "pitch", regex: /((?<!\$|#)(?<=\b)[A-Ga-g][#bxdq\^v]*[0-9]+(?:[+-]\d+\/\d+t)?(?=\b))/ },
  { name: "null", regex: /\bnull\b/ },
  { name: "bracket", regex: /\[|\]/ },
  { name: "buffer", regex: /\bu\d{9}\b/ },
];

const COLOR_MAP: Record<string, string> = {
  fraction: CYAN,
  decimal: CYAN,
  pitch: BLUE,
  null: PURPLE,
  bracket: YELLOW,
  buffer: GREEN,
};

export default function formatListenerOutput(string: string): string {
  const strings = string.split(" ");
  if (strings.length < 3) return "";

  const typeIndex: number = Number(strings[0]);
  const type = [MessageType.MESSAGE, MessageType.ERROR, MessageType.WARNING, MessageType.BUG][Number.isNaN(typeIndex) ? 0 : typeIndex];

  const header = strings[1] === "" ? "" : `${ITALICS}${ORANGE}${strings[1]}${RESET} ${GRAY}•${RESET} `;
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
      // Single-pass replacement using combined regex
      const combinedRegex = new RegExp(PATTERN_MATCHERS.map((p) => `(?<${p.name}>${p.regex.source})`).join("|"), "g");

      content = content.replace(combinedRegex, (match, ...args) => {
        const groups = args[args.length - 1];
        for (const key in groups) {
          if (groups[key]) {
            return `${COLOR_MAP[key]}${groups[key]}${RESET}`;
          }
        }
        return match;
      });
      break;
  }

  return `${RESET}${header}${content}`;
}
