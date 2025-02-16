export default function prettyPrint(input: string): string {
  let indentLevel = 0;
  const indentSize = 3;
  const words = input.split(/\s+/);
  let result: string[] = [];
  let currentLine: string[] = [];

  words.forEach((word) => {
    if (word === "[") {
      if (currentLine.length > 0) {
        result.push(" ".repeat(indentLevel * indentSize) + currentLine.join(" "));
        currentLine = [];
      }
      result.push(" ".repeat(indentLevel * indentSize) + "[");
      indentLevel++;
    } else if (word === "]") {
      if (currentLine.length > 0) {
        result.push(" ".repeat(indentLevel * indentSize) + currentLine.join(" "));
        currentLine = [];
      }
      indentLevel = Math.max(0, indentLevel - 1);
      result.push(" ".repeat(indentLevel * indentSize) + "]");
    } else {
      currentLine.push(word);
    }
  });

  if (currentLine.length > 0) {
    result.push(" ".repeat(indentLevel * indentSize) + currentLine.join(" "));
  }

  return result.join("\r\n");
}
