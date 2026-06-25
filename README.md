<p align="center">
  <img src="docs/figures/logo.png" alt="kv-query logo" width="160px"/>
</p>
<h1 align="center">kv-query</h1>

A lightweight key-value query tool for storing and searching entries using a simple text format.<br>
The most common search pattern is a direct **key -> value** lookup. In practice, though, you often need multiple keys to point to one value, one key to match several values, or even a partial match on the key.<br>
This project handles exactly those scenarios: ***get the results you want with minimal typing while keeping your mental model simple***.

## Features

- Easy-to-write key-value entries, e.g., `"tag1 | tag2" value`
- Strict or partial keyword search with AND/OR logic
- High performance: rapid querying and rendering of tens of thousands of entries.
- **Web UI**: single HTML with a command-line-like interface.
- **Terminal CLI**: single native binary.
> **Note:** The Web UI and Terminal CLI are independent, optional interfaces — you do not need to set up both.

## Data source

The initial data for both interfaces is a flat array where keys and values alternate:

- **Web UI** <- `data/raw.js` (loaded at first launch, then persisted in `localStorage`)

```js
// [k1, v1, k2, v2, ...]
export const KV_DATA = [
  "apple | fruit | red", "A sweet red fruit",
  "banana | fruit | yellow", "A long yellow fruit",
  …
];
```

- **Terminal CLI** <- `data/raw.nim` (compiled directly into the binary)

```nim
# [k1, v1, k2, v2, ...]
const KV_DATA* = [
  "apple | fruit | red", "A sweet red fruit",
  "banana | fruit | yellow", "A long yellow fruit",
  …
];
```

---

## Web UI (Browser)

### Start the dev server

You need Node.js ≥ 22.18.0 installed.

```bash
# git clone https://github.com/niooh/kv-query.git && cd kv-query/

npm install
npm run dev  # open http://localhost:5173
```

### Build

```bash
npm run build  # output to dist/index.html
```

The build inlines all assets into a single `index.html` that can run offline.

### Usage

#### Commands

Type commands into the input box, then results appear below.

| Command | Description |
|---------|-------------|
| `help` | Show all commands |
| `help <cmd>` / `<cmd> -h` | Show help for a specific command |
| `get -a` / `ls` | List all entries, sorted by frequency |
| `get -s [terms]` | Strict match, OR logic |
| `get -sa [terms]` | Strict match, AND logic |
| `get -c [terms]` | Contains match, OR logic |
| `get -ca [terms]` | Contains match, AND logic |
| `add <key> <value>` | Add a new entry to the end |
| `clear` | Clear all panel output |
| `edit` | Open a textarea with the full data for manual editing |
| `import` | Replace (`-a` to append) data from a file or an editor |
| `export` | Download as text or copy to clipboard |

Click on a result value to copy it to the clipboard and increase its frequency automatically, and most‑used entries will rise to the top.<br>
Use `help <cmd>` (e.g. `help edit`) to see full details and examples for each command.

#### Text format for `edit / import / export`

The web UI uses a user-friendly text format for its `edit`, `import`, and `export` commands.

````
"tag1 | tag2 | tag3" the value text
"multi-line key" ```
Line 1
Line 2
```
// comments and empty lines are ignored
---
"multi-line key" 5
````

- The section above `---` contains key‑value entries (single or multi‑line).
- The section below `---` is the frequency data (only shown for entries with frequency > 0).
- The key is double‑quoted and supports escaped characters (e.g. `\"`, `\\`).
- Values start right after the closing quote and a single space, and can contain any characters.

### Data persistence

The web UI stores its data (entries + frequencies) in `localStorage`. On first launch it loads the default dataset from `data/raw.js`.

---

## Terminal CLI (Standalone executable)

### Notes
- This terminal CLI does not edit data; it queries a pre‑compiled index built from `data/raw.nim`.
- Only basic features are provided here. If you want more intelligent features, such as auto-building after editing, and treat the copy function as a priority, see the [kv-copy](https://github.com/niooh/kv-copy) project.

### Build

You need Nim ≥ 2.0.0 (e.g. Version 2.2.6) installed.

```bash
npm run build:bin  # output to dist/kv_query
```

### Usage

```bash
./dist/kv_query <cmd> [terms]
```

### Commands

| Command           | Description      |
|-------------------|------------------|
| `-h`              | Show help        |
| `ls`              | List all entries |
| `<mode> [terms]`  | Query and print results directly |
| `c <mode> [terms]`| Query and copy selected value to clipboard using OSC 52 |

### Modes

`<mode>` must be one of:

| Mode   | Match type | Logic |
|--------|------------|-------|
| `-s`   | Strict     | OR    |
| `-sa`  | Strict     | AND   |
| `-c`   | Contains   | OR    |
| `-ca`  | Contains   | AND   |

### Example

```
$ ./dist/kv_query -s fruit
  apple | fruit | red  A sweet red fruit
  banana | fruit | yellow  A long yellow fruit
  tomato | fruit | red  vegetable : Botanically a fruit, culinarily a vegetable
  grape | fruit | purple  Small round fruit for wine

$ ./dist/kv_query c -c yellow
  1 banana | fruit | yellow  A long yellow fruit
Copied.
```

## Contribute

If you'd like to contribute to the codebase, please follow these steps:

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b new-feature
   ```

2. Commit your changes with a clear message (e.g., using [Conventional Commits](https://www.conventionalcommits.org/)):
   ```bash
   git commit -m "feat: add some feature"
   ```

3. Push to your branch:
   ```bash
   git push origin new-feature
   ```

4. Open a Pull Request. Make sure to review the pull request template at `.github/PULL_REQUEST_TEMPLATE.md` before submitting.
