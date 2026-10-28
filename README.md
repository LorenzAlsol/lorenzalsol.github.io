# Folklore portfolio

A single-page portfolio at the entrance to a folklore market. A mask seller offers four masks; each is a perspective (Playful, Cinematic, Focused, Calm) that presents the same portfolio differently. Astro, TypeScript and GSAP. Static output, no backend.

## Run it

Needs Node 22.23.4 or newer.

```bash
npm install
npm run dev
```

## Make it yours

- Personal content: `src/content/site.ts`. Every `[BRACKETED]` value is a placeholder.
- Projects: `src/content/projects/*.json` (summary, problem, users, contribution, decisions, links, stack, role, year), images in `src/assets`.
- CV: add `public/cv.pdf`.
- Seller, rack and backdrops: flat SVG in `src/components/Stage.astro`; mask drawings in `src/components/MaskSprites.astro`. Replace with final art; keep the `.arm-*` pose groups. The creatures on the masks are provisional: UI and copy only say Playful, Cinematic, Focused, Calm.
- Masks: names, copy and reveal timing in `src/content/masks.ts`; palettes, type, composition and motion per mask in `src/styles/tokens.css` (`data-mask` and `data-theme` on `<html>`).

## Publish

```bash
npm run deploy
```

Builds the site and pushes it to the `gh-pages` branch, which GitHub Pages serves.
