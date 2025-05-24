import { getUserSelection, checkIfFzfIsInstalled } from "./fzf-ts";

async function main() {
  const selections = await getUserSelection({
    items: [
      {
        id: "1",
        display: "Item 1",
        previewPrefix: "prefix",
        previewSuffix: "suffix",
        x: 1,
      },
      {
        id: "2",
        display: "Item 2",
        previewPrefix: "prefix",
        previewSuffix: "suffix",
        x: 2,
      },
    ],
    getPreview: async (item) => `${item.x}`,
  });
  console.log(selections);
}

main();
