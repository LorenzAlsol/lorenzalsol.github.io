# Folklore portfolio

A single-page portfolio at the entrance to a folklore market. A mask seller offers four masks (Fox, Dragon, Owl, Stag); each mask changes how the site looks, moves and reads. Astro, TypeScript and GSAP. Static output, no backend.

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
- Seller and masks: flat SVG in `src/components/Stall.astro` and `src/components/MaskSprites.astro`. Replace with final art; keep the `.arm-*` pose groups.
- Masks: names, copy and reveal timing in `src/content/masks.ts`; palettes, type, composition and motion per mask in `src/styles/tokens.css` (`data-mask` and `data-theme` on `<html>`).

## Publish

```bash
npm run deploy
```

Builds the site and pushes it to the `gh-pages` branch, which GitHub Pages serves.
