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
    getPreview: async (item) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return `
      Viewing an item after a simulated delay of 0.25s:
      ${JSON.stringify(item, null, 2)}
      `;
    },
  });
  console.log(selections);
}

main();
