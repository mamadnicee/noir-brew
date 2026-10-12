# Noir Brew — interactive 3D coffee house

A full-screen Three.js coffee experience built with React, Vite and TypeScript. The real model is served from `public/models/clifford.glb` at `/models/clifford.glb`; its original GLTF materials are retained.

## Run locally
Install dependencies with `npm install`, then start the local server with `npm run dev`. The production build command is `npm run build`.

## Controls
Choose a section with the top navigation or the previous/next controls. Click the 3D canvas to advance; vertical wheel/trackpad scrolling and touch swipes change sections as well. Arrow keys move between stops; Home and End jump to the first and last. The camera animates to each named zone and the corresponding content panel changes.

## Cloudflare Pages
Use build command `npm run build` and output directory `dist`. The included `public/_redirects` provides SPA fallback routing.

## Cart and payments
The cart is an in-browser demo with quantity controls, item removal and a subtotal. There is no real payment backend or checkout processing.
