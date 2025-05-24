# fzf-ts

A TypeScript interface to the [fzf](https://github.com/junegunn/fzf) command-line fuzzy finder.

## Installation

### As a CLI tool

```bash
npm install -g fzf-ts
```

### As a library

```bash
npm install fzf-ts
```

## Requirements

- Node.js 14 or later
- [fzf](https://github.com/junegunn/fzf) must be installed on your system

### Installing fzf

**macOS (Homebrew):**
```bash
brew install fzf
```

**Linux (most distributions):**
```bash
sudo apt install fzf
```

**Other platforms:** See the [fzf installation guide](https://github.com/junegunn/fzf#installation)

## Usage

### CLI usage

Use it just like you would use fzf - pipe data to it and capture the output:

```bash
cat file.txt | fzf-ts
ls | fzf-ts
find . -type f | fzf-ts --preview 'cat {}'
echo -e "line 1\nline 2\nline 3" | fzf-ts
```

All fzf command-line arguments are passed through directly to fzf.

### Library usage

```typescript
import { getUserSelection, checkIfFzfIsInstalled } from 'fzf-ts';

async function example() {
  // Optional: Check if fzf is available
  const fzfAvailable = await checkIfFzfIsInstalled();
  if (!fzfAvailable) {
    console.error('fzf is not installed');
    return;
  }

  const selection = await getUserSelection({
    items: [
      { display: 'Option 1', value: 1 },
      { display: 'Option 2', value: 2 },
    ],
    fzfArgs: ['--no-sort', '--ansi'], // Optional fzf arguments
    getPreview: async (item) => `Preview for ${item.display}`, // Optional preview function
  });

  console.log('Selected:', selection);
}
```

## How it works

This library interfaces with the `fzf` command-line tool via:
- **stdout**: Sending items to fzf's stdin
- **temporary files**: Communicating selection state and preview content between the Node.js process and fzf

The preview functionality uses a polling mechanism with temporary files to provide dynamic previews as you navigate through items.

## API

### `getUserSelection<T extends FzfSelection>(options)`

Displays a list of items using fzf and returns the selected item.

#### Parameters

- `options.items`: Array of items to select from
  - Each item must have a `display` property (string shown in the list)
  - Items can optionally have `previewPrefix` and `previewSuffix` strings
- `options.fzfArgs`: Optional array of fzf command-line arguments
- `options.getPreview`: Optional async function that returns a string preview for an item
  - **Note**: This function is called for each item as you navigate through the list
  - Can be slow operations like web requests - the preview will update when the async operation completes
  - Example from `demo.ts`:
    ```typescript
    getPreview: async (item) => {
      await new Promise(resolve => setTimeout(resolve, 250)); // Simulate delay
      return `Preview for ${item.display}\n${JSON.stringify(item, null, 2)}`;
    }
    ```
- `options.debounceMs`: Optional debounce delay in milliseconds before calling `getPreview` (defaults to 0)
  - Useful when `getPreview` makes expensive calls like web requests
  - Prevents rapid calls when quickly navigating through items

#### Returns

A promise that resolves to the selected item, or `undefined` if no selection was made.

### `checkIfFzfIsInstalled()`

Checks if fzf is installed on the system.

#### Returns

A promise that resolves to `true` if fzf is installed, `false` otherwise.