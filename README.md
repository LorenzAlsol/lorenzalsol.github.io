# Folklore portfolio

A single-page portfolio told as a short story. Astro, TypeScript, GSAP and Three.js. Static output, no backend.

## Run it

Needs Node 22.23.4 or newer.

```bash
npm install
npm run dev
```

## Make it yours

- Personal content: `src/content/site.ts`. Every `[BRACKETED]` value is a placeholder.
- Projects: `src/content/projects/*.json`, images in `src/assets`.
- CV: add `public/cv.pdf`.
- Mascot: `src/mascot/avatar.ts`.

## Publish

```bash
npm run deploy
```

Builds the site and pushes it to the `gh-pages` branch, which GitHub Pages serves.
