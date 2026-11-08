# mAEIOw (test build)

Categorical logic: build syllogisms from A, E, I and O statements and check them with Venn diagrams.

## Files

- `index.html` + `core.js` (engine), `workbench.js` — Workbench: the syllogism builder (from Logic Workbench's Categorical tab).
- `diagrams.html` + `diagrams.js` — Diagrams: Venn, Carroll, Euler, square of opposition, all valid moods. `diagrams.html?m=EIO&fig=2&v=carroll` opens one directly.
- `learn.html` + `learn.js` — Learn.
- `learn-content.js` — the Learn entries. Edit this to add or correct them.
- `theme.css` — mAEIOw's colours and header. Change the brand here.
- `icon.svg`, `icon-*.png`, `maskable-512.png`, `apple-touch-icon.png` — the logo.
- `manifest.webmanifest`, `sw.js` — make it installable and work offline. Bump `VERSION` in `sw.js` after any change.

## Put it on GitHub Pages

1. Create a repo called `maeiow` and upload everything in this folder (there are no folders, so you can select them all at once).
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open `https://cosmickillswitch.github.io/maeiow/` and install from Chrome's menu (⋮ → Install app).

There's no build step. Files load directly, so it needs to be served (GitHub Pages, or `python3 -m http.server` locally) rather than opened as a file.
