# NOIR BREW

An editorial coffee storefront concept built with React, TypeScript, Vite, CSS, and Three.js. The page includes a procedurally modeled espresso machine, fixed scroll/click camera presets (no orbit controls), sample catalog with roast filters and search, product details, local-only cart, roast lab, coffee finder, journal, honest demo/contact disclosures, and a locally handled wholesale inquiry form (no data is transmitted).

## Development

Requirements: Node.js 18+ and npm.

```sh
npm install
npm run dev
```

Available scripts: `npm run dev`, `npm run build`, and `npm run preview`. This project archive was not built or tested.

## Optional 3D asset

`public/models/clifford.glb` is optional and is **not included**. If you have the appropriately licensed asset, put it at exactly `public/models/clifford.glb`; Three.js GLTFLoader will attempt to load it automatically. When the file is absent or fails to load, the locally generated procedural espresso-machine scene remains in use. No other supplied model has been renamed or substituted.

## Project details

- Styling uses plain CSS in `src/index.css`; no Tailwind dependency.
- The cart persists only in the visitor's browser via localStorage. There is no checkout, payment processing, mailing list, or contact backend. Product prices and business details are illustrative sample content.
- The 3D camera moves only between authored presets based on scrolling through the page; there are no user camera controls. Layout adapts to viewport size and respects reduced-motion preferences, with a text fallback if WebGL is unavailable.
- `public/_redirects` provides an SPA fallback for static hosts that support Netlify-style redirects.
