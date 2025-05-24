import { spawn, exec } from "child_process";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
async function getTempFilePath(prefix = "fzf-ts-tmp-") {
    const tempDir = await fs.mkdtemp(join(tmpdir(), prefix));
    return join(tempDir, "fzf-ts-tmp.tmp");
}
export async function getUserSelection({ items, fzfArgs = [
    "--no-sort",
    "--no-mouse",
    "--wrap",
    "--ansi",
    "--bind",
    "alt-up:preview-up,alt-down:preview-down,alt-u:preview-page-up,alt-d:preview-page-down",
], getPreview, }) {
    if (!items.length) {
        return undefined;
    }
    const tmpSel = await getTempFilePath();
    const tmpPrev = await getTempFilePath();
    await Promise.all([fs.writeFile(tmpSel, ""), fs.writeFile(tmpPrev, "")]);
    let locked = false;
    const monitor = setInterval(async () => {
        if (locked)
            return;
        try {
            const hovered = (await fs.readFile(tmpSel, "utf8")).trim();
            if (hovered) {
                const item = items.find((i, index) => index.toString() === hovered);
                if (!item)
                    return;
                if (!getPreview)
                    return;
                const preview = await getPreview(item);
                let fullPreview = preview;
                if (item.previewPrefix) {
                    fullPreview = `${item.previewPrefix}\n\n${preview}`;
                }
                if (item.previewSuffix) {
                    fullPreview = `${preview}\n\n${item.previewSuffix}`;
                }
                await fs.writeFile(tmpPrev, fullPreview);
                await fs.writeFile(tmpSel, "");
            }
        }
        catch {
            /* ignore EBUSY/ENOENT etc. – fzf may still be opening the file */
        }
    }, 10);
    const previewCmd = [
        `SEL="${tmpSel}"`,
        `PREV="${tmpPrev}"`,
        `bash -c '`,
        `  echo "$1" > "$SEL";`,
        `  while [[ -s "$SEL" ]]; do sleep 0.01; done;`,
        `  cat "$PREV"`,
        `' -- {1}`,
    ].join(" ");
    const args = [
        ...fzfArgs,
        "--delimiter= ",
        "--with-nth=2..",
        ...(getPreview ? ["--preview", previewCmd] : []),
    ];
    const child = spawn("fzf", args, {
        stdio: ["pipe", "pipe", "inherit"],
    });
    child.stdin.write(items.map((i, index) => `${index} ${i.display}`).join("\n"));
    child.stdin.end();
    let out = "";
    for await (const chunk of child.stdout)
        out += chunk;
    const code = await new Promise((r) => child.on("close", r));
    clearInterval(monitor);
    if (code === 1 || code === 130) {
        return undefined;
    }
    if (code !== 0)
        throw new Error(`fzf exited with ${code}`);
    const chosenIds = out
        .trim()
        .split("\n")
        .map((l) => l.split(" ")[0]);
    const item = items.find((i, index) => chosenIds.includes(index.toString()));
    if (!item)
        throw new Error(`No item found for id: ${chosenIds}`);
    return item;
}
export async function checkIfFzfIsInstalled() {
    const child = exec("fzf --version");
    const code = await new Promise((r) => child.on("close", r));
    return code === 0;
}
