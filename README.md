# KIACHE? — Scan. Decode. Understand.

KIACHE is a mobile-first food label reader with barcode lookup, OCR, ingredient flags, nutrition context, an ingredient & E-number/INS-number dictionary, side-by-side product comparison, and guided food questions.

---

## Why a Blank Screen Happened on GitHub & How It Is Fixed

When deploying to GitHub Pages, a blank screen happens due to two common issues:
1. **Jekyll Processing**: By default, GitHub Pages runs Jekyll, which parses `.html` files for Liquid templating tags. JavaScript template literals containing `${{...}}` cause Jekyll build errors, crashing page generation. The addition of `.nojekyll` and cleaning up template syntax resolves this.
2. **Missing Build Artifacts or TSX References**: If GitHub Pages serves raw files without building, browsers cannot run TypeScript. 

The repository is now structured so **both** GitHub Pages deployment methods work out of the box with zero blank screens.

---

## How to Fix the Blank Screen on Your GitHub Pages (Choose Option 1 or 2)

### Option 1: Direct Branch Deployment (Easiest — 30 seconds)
Root `index.html` is completely standalone and `.nojekyll` is included.
1. In your GitHub repository, click **Settings**.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment**:
   - **Source**: Select **Deploy from a branch**
   - **Branch**: Select **`main`** (or **`master`**), folder **`/ (root)`**
4. Click **Save**.
5. Within 1 minute, visit your GitHub Pages URL — KIACHE will load immediately.

---

### Option 2: Automated Deployment via GitHub Actions
A workflow is configured in `.github/workflows/deploy.yml` that automatically builds the project and publishes it to GitHub Pages.
1. In your GitHub repository, click **Settings** > **Pages**.
2. Under **Build and deployment**:
   - **Source**: Change to **GitHub Actions**
3. Push your latest code (or go to the **Actions** tab, select **Deploy to GitHub Pages**, and click **Run workflow**).
4. GitHub will build and publish your app automatically.

---

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

This compiles static production assets into `dist/` with `.nojekyll` included.
