# How to Build & Install Pixel Agents

## Prerequisites

- Node.js (v18+)
- npm
- VS Code

---

## Step 1 — Install dependencies

Run this once after cloning or after adding new packages:

```bash
npm install
cd webview-ui && npm install && cd ..
```

---

## Step 2 — Build

Builds the extension backend (esbuild) and the React webview (Vite):

```bash
npm run build
```

This runs in order: type-check → lint → esbuild (extension) → vite (webview).  
Output lands in `dist/`.

---

## Step 3 — Package into a .vsix file

```bash
npx vsce package
```

This produces a file like `pixel-agent-1.2.5.vsix` in the project root.  
It uses the `package` script internally, which is the same as `build` but with production minification.

---

## Step 4 — Install in VS Code

### Option A — From the terminal (recommended)

```bash
code --install-extension pixel-agent-1.2.5.vsix
```

Replace `1.2.5` with whatever version number was generated.

### Option B — From inside VS Code

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run **Extensions: Install from VSIX...**
3. Browse to the `.vsix` file and select it

> **Reinstalling or updating?**
> Running the same install command on top of an already-installed version updates it in place.
> No need to uninstall first — VS Code replaces the old version automatically.
> Just reload the window after (`Developer: Reload Window`).

---

## Step 5 — Reload VS Code

After installing, reload the window:

- Command Palette → **Developer: Reload Window**  
  or just close and reopen VS Code.

---

## Quick dev loop (no .vsix needed)

If you just want to test changes without packaging:

1. Press **F5** in VS Code — this opens an Extension Development Host with your current build loaded.
2. Any change to `src/` requires a rebuild (`npm run build`) and a reload of the dev host window.

---

## One-liner: build + package + install

```bash
npm run build && npx vsce package && code --install-extension pixel-agent-$(node -p "require('./package.json').version").vsix
```

---

## Updating the version number

Edit `"version"` in `package.json` before packaging if you want to bump it.  
The `.vsix` filename and the extension registry entry both pull from that field.
