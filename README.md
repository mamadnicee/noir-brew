# NOIR BREW — immersive coffee experience

A Vite + React + TypeScript single-page experience centered on the supplied Clifford GLB scene. Wheel or swipe to move between bounded camera stations; use the station rail for direct, accessible navigation. Product selection, cart, finder, journal and newsletter interactions are local demo UI only.

## Local development

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: Vite

The cart is stored in browser local storage. Newsletter and checkout are explicitly demo-only; no payment or external submission is connected. WebGL support is required for the 3D scene; a static visual fallback is provided. The bundled model is at `public/assets/clifford.glb`.
