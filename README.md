# KIACHE? — Scan. Decode. Understand.

KIACHE is a mobile-first food label reader with barcode lookup, OCR, ingredient flags, nutrition context, an ingredient & E-number/INS-number dictionary, side-by-side product comparison, and guided food questions.

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Building for Production

```bash
npm run build
```

This compiles the TypeScript files into static production assets in the `dist/` directory with relative paths (`./assets/...`).

## Fixing Blank Screen on GitHub Pages

If your repository shows a blank screen on GitHub Pages, it is typically because GitHub Pages tried to serve the uncompiled root `index.html` (which points to raw TypeScript `/src/main.tsx` that browsers cannot execute directly) instead of building the Vite app.

### Recommended Fix (Automated via GitHub Actions):
1. In your GitHub repository, click **Settings**.
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment** > **Source**, change from **Deploy from a branch** to **GitHub Actions**.
4. Push a commit or go to the **Actions** tab and trigger the "Deploy to GitHub Pages" workflow.
5. GitHub will automatically run `npm run build` and publish your live app at your GitHub Pages URL!
