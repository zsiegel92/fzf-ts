#!/usr/bin/env node
#!/usr/bin/env node

// src/fzf-ts.ts
import { spawn, exec } from "child_process";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
async function getTempFilePath(prefix = "fzf-ts-tmp-") {
  const tempDir = await fs.mkdtemp(join(tmpdir(), prefix));
  return join(tempDir, "fzf-ts-tmp.tmp");
}
var defaultFzfArgs = [
  "--no-sort",
  "--no-mouse",
  "--wrap",
  "--ansi",
  "--bind",
  "alt-up:preview-up,alt-down:preview-down,alt-u:preview-page-up,alt-d:preview-page-down"
];
async function getUserSelection({
  items,
  fzfArgs = defaultFzfArgs,
  getPreview,
  debounceMs = 0
}) {
  if (!items.length) {
    return void 0;
  }
  const tmpSel = await getTempFilePath();
  const tmpPrev = await getTempFilePath();
  await Promise.all([fs.writeFile(tmpSel, ""), fs.writeFile(tmpPrev, "")]);
  let locked = false;
  let debounceTimeout = null;
  const monitor = setInterval(async () => {
    if (locked) return;
    try {
      const hovered = (await fs.readFile(tmpSel, "utf8")).trim();
      if (hovered) {
        const item2 = items.find((i, index) => index.toString() === hovered);
        if (!item2) return;
        if (!getPreview) return;
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(async () => {
          try {
            const currentItem = item2;
            const preview = await getPreview(currentItem);
            const currentHovered = (await fs.readFile(tmpSel, "utf8")).trim();
            const currentSelectedItem = items.find(
              (_, index) => index.toString() === currentHovered
            );
            if (currentSelectedItem !== currentItem && currentHovered !== "") {
              return;
            }
            let fullPreview = preview;
            if (currentItem.previewPrefix) {
              fullPreview = `${currentItem.previewPrefix}

${preview}`;
            }
            if (currentItem.previewSuffix) {
              fullPreview = `${preview}

${currentItem.previewSuffix}`;
            }
            await fs.writeFile(tmpPrev, fullPreview);
          } catch {
          }
        }, debounceMs);
        await fs.writeFile(tmpSel, "");
      }
    } catch {
    }
  }, 10);
  const previewCmd = [
    `SEL="${tmpSel}"`,
    `PREV="${tmpPrev}"`,
    `bash -c '`,
    `  echo "$1" > "$SEL";`,
    `  while [[ -s "$SEL" ]]; do sleep 0.01; done;`,
    `  cat "$PREV"`,
    `' -- {1}`
  ].join(" ");
  const args = [
    ...fzfArgs,
    "--delimiter= ",
    "--with-nth=2..",
    ...getPreview ? ["--preview", previewCmd] : []
  ];
  const child = spawn("fzf", args, {
    stdio: ["pipe", "pipe", "inherit"]
  });
  child.stdin.write(
    items.map((i, index) => `${index} ${i.display}`).join("\n")
  );
  child.stdin.end();
  let out = "";
  for await (const chunk of child.stdout) out += chunk;
  const code = await new Promise((r) => child.on("close", r));
  clearInterval(monitor);
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  if (code === 1 || code === 130) {
    return void 0;
  }
  if (code !== 0) throw new Error(`fzf exited with ${code}`);
  const chosenIds = out.trim().split("\n").map((l) => l.split(" ")[0]);
  const item = items.find((_, index) => chosenIds.includes(index.toString()));
  if (!item) throw new Error(`No item found for id: ${chosenIds}`);
  return item;
}

// src/main.ts
async function main() {
  if (process.stdin.isTTY) {
    console.error("Error: No input provided. Pipe data to fzf-ts.");
    process.exit(1);
  }
  const lines = [];
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    lines.push(...chunk.toString().split("\n").filter(Boolean));
  }
  if (lines.length === 0) {
    process.exit(0);
  }
  const fzfArgs = process.argv.slice(2);
  const result = await getUserSelection({
    items: lines.map((line) => ({ display: line })),
    fzfArgs,
    getPreview: async () => ""
  });
  if (result) {
    console.log(result.display);
  }
}
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
