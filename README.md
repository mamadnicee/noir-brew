# Noir Brew

An interactive, single-page coffee-house experience built with React, TypeScript, Vite, and Three.js.

## Run locally

```bash
npm install
npm run dev
```

Vite prints a local URL (normally `http://localhost:5173`). For a production build:

```bash
npm run build
```

The deployable static site is generated in `dist/`. For Cloudflare Pages, set the build command to `npm run build` and the build output directory to `dist` (no framework preset is required). The project includes `public/_redirects` so direct routes fall back to the app entry point.

## 3D model and 404 troubleshooting

The scene loads the model from the exact public path **`public/models/clifford.glb`**, served in development at **`/models/clifford.glb`** (the URL respects Vite's configured base path). Keep the filename and letter case unchanged. If the model returns 404, confirm the file is present at that exact path, was included in the deployment artifact, and that Cloudflare Pages is publishing `dist/`. Check the browser Network tab for the model request; on a non-root deployment, verify the site base path and model URL agree. A successful page load without the model can indicate a failed model request or WebGL/browser limitation.

## Interactions

- Use the top navigation, lower zone dots/arrows, or scroll on the 3D canvas to move smoothly between the five experience zones; this is section/camera navigation rather than ordinary page scrolling.
- Drag the model to orbit. Click a visible marker for its science fact; zone-specific product lists and science content follow the active zone.
- Search the menu, add drinks to the bag, adjust quantities in the cart drawer, and toggle English/Persian. The cart is a demo and does not process payments. Use the reset control to return the camera to the opening zone.
