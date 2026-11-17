// Claude Code PostToolUse hook: formats the file that was just written or edited.
// Runs ESLint --fix (for script files) and then Prettier on that one file, and
// reports any ESLint errors that remain back to Claude. It never blocks a tool call.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

let input = "";
for await (const chunk of process.stdin) input += chunk;

let file;
try {
  const data = JSON.parse(input.replace(/^﻿/, ""));
  file = data.tool_response?.filePath ?? data.tool_input?.file_path;
} catch {
  process.exit(0);
}
if (!file) process.exit(0);

const abs = path.resolve(file);
const rel = path.relative(root, abs);
const outsideProject = rel.startsWith("..") || path.isAbsolute(rel);
if (outsideProject || rel.split(path.sep)[0] === "node_modules")
  process.exit(0);

const run = (entry, args) =>
  spawnSync(
    process.execPath,
    [path.join(root, "node_modules", entry), ...args],
    {
      cwd: root,
      encoding: "utf8",
    },
  );

let lintReport = "";
if (/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(abs)) {
  const eslint = run("eslint/bin/eslint.js", ["--fix", abs]);
  if (eslint.status === 1) lintReport = eslint.stdout.trim();
}

run("prettier/bin/prettier.cjs", [
  "--write",
  "--ignore-unknown",
  "--log-level",
  "warn",
  abs,
]);

if (lintReport) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `ESLint found problems in ${rel} that --fix could not resolve:\n${lintReport}`,
      },
    }),
  );
}
process.exit(0);
