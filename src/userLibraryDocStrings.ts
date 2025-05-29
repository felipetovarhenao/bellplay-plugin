import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import getBellSyntaxAPI from "./getBellSyntaxAPI";

let cachedDocStrings: Record<string, vscode.Hover> = {};

function readConfigFile(): string | undefined {
  const homeDir = os.homedir();
  const configPath = path.join(homeDir, "bellplay.config.txt");
  if (fs.existsSync(configPath)) {
    return fs.readFileSync(configPath, "utf-8");
  }
  return undefined;
}

function parseImports(configContent: string): string[] {
  const match = configContent.match(/\[\s*imports\s+([^\]]*)\]/);
  if (!match) return [];

  const raw = match[1];
  const regex = /"([^"]+)"/g;
  const results: string[] = [];
  let m;
  while ((m = regex.exec(raw)) !== null) {
    results.push(m[1]);
  }
  return results;
}

function resolveBellFilePaths(importPaths: string[]): string[] {
  return importPaths.map((p) => {
    if (p.startsWith("Macintosh HD:")) {
      return p.slice("Macintosh HD:".length);
    }
    if (p.startsWith("~/")) {
      return path.join(os.homedir(), p.slice(2));
    }
    if (/^[A-Z]:[\\/]/i.test(p)) {
      return path.normalize(p);
    }
    return p;
  });
}

function extractSymbolNamesFromFile(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");

  const regex = /(?<=\)#\s*)([A-Za-z][A-Za-z0-9_]*[A-Za-z0-9]?)(?=\s*=[^=])/gm;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

async function buildSymbolDocMap(filePaths: string[]): Promise<Record<string, vscode.Hover>> {
  const symbolMap: Record<string, vscode.Hover> = {};
  const api = await getBellSyntaxAPI();

  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) continue;
    const symbols = extractSymbolNamesFromFile(filePath);
    const document = await vscode.workspace.openTextDocument(filePath);

    for (const sym of symbols) {
      const hover = api.findDocString(document, sym);
      if (hover) {
        symbolMap[sym] = hover;
      }
    }
  }

  return symbolMap;
}

// Called during extension activation
export async function initializeUserDocStrings() {
  const configFile = readConfigFile();
  if (!configFile) return;

  const imports = resolveBellFilePaths(parseImports(configFile));

  if (imports.length === 0) return;

  cachedDocStrings = await buildSymbolDocMap(imports);
}

// Accessor to use after initialization
export function getUserDocStringMap(): Record<string, vscode.Hover> {
  return cachedDocStrings;
}
