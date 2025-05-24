#!/usr/bin/env node
import { getUserSelection } from "./fzf-ts";

async function main() {
  if (process.stdin.isTTY) {
    console.error("Error: No input provided. Pipe data to fzf-ts.");
    process.exit(1);
  }
  const lines: string[] = [];
  process.stdin.setEncoding('utf8');  
  for await (const chunk of process.stdin) {
    lines.push(...chunk.toString().split('\n').filter(Boolean));
  }
  if (lines.length === 0) {
    process.exit(0);
  }
  const fzfArgs = process.argv.slice(2);
  const result = await getUserSelection({
    items: lines.map(line => ({ display: line })),
    fzfArgs,
    getPreview: async () => "",
  });
  if (result) {
    console.log(result.display);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});