import { getUserSelection, checkIfFzfIsInstalled } from "./fzf-ts";

async function main() {
  await checkIfFzfIsInstalled();
  const selection = await getUserSelection({
    items: Array.from({ length: 1000 }, (_, i) => ({
      display: `Item ${i}`,
      previewPrefix: "prefix",
      previewSuffix: "suffix",
      extraDetail: `Extra detail for item ${i}`,
    })),
    getPreview: async (item) => `
      Viewing an item after a simulated delay of 0.25s:
      ${JSON.stringify(item, null, 2)}

      Here's a random number to prove the previews are re-rendering on each selection: ${Math.floor(
        100 * Math.random()
      )}
      `,
  });
  console.log(selection);
}

main();
