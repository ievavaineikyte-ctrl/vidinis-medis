# Vidinis Medis (Inner Tree)

An interactive browser application for exploring emotional zones through a generative tree interface. Built as a bachelor's degree project using HTML5, JavaScript, and p5.js.

## Live Preview

> **For recruiters:** Click the link below to view the project — no setup required.

**[Open Live Demo](https://ievavaineikyte-ctrl.github.io/vidinis-medis/)** *(enable GitHub Pages first — see below)*

---

## How to View This Project

### Option 1 — GitHub Pages (recommended for sharing)

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set Source to **Deploy from a branch**
3. Branch: `main` | Folder: **`/build`**
4. Save — your site will be live at:
   ```
   https://ievavaineikyte-ctrl.github.io/vidinis-medis/
   ```

> **Important:** The entry point is `build/index.html`, not the root folder. Always deploy the `/build` folder on GitHub Pages.

### Option 2 — Run locally

1. Clone this repository
2. Navigate to the **`build/`** folder
3. Start a local server (required — do not open `index.html` directly via `file://`)

```bash
git clone https://github.com/ievavaineikyte-ctrl/vidinis-medis.git
cd vidinis-medis/build
python -m http.server 8080
```

4. Open in your browser:
   ```
   http://localhost:8080
   ```

---

## Project Structure

| Folder / File | Description |
|---------------|-------------|
| `build/` | **Production build — open this folder** |
| `build/index.html` | **Entry point** — start here |
| `projektiniai/` | Source files for development |
| `source.txt` | Full documentation (LT) |

---

## How to Use the App

1. Wait for the page to load
2. Click **"Atrask"** to enter the tree scene
3. Select a branch (emotional zone) on the tree
4. Explore zone depth and toggle visual states

---

## Tech Stack

- HTML5 / Canvas 2D
- JavaScript (ES6+)
- p5.js v1.9.3
- Custom modular architecture (`tree-*.js`, `sketch-core.js`)
- Offline fonts (no internet required)

---

## Contact

**Ieva Vaineikytė** — Junior Web Developer  
📧 ieva.vaineikyte@gmail.com  
🔗 [GitHub](https://github.com/ievavaineikyte-ctrl)
