// The four perspectives. A visitor chooses a perspective, not a pet: the UI says Playful,
// Cinematic, Focused, Calm. The creature drawn on each mask is PROVISIONAL and lives only in
// the artwork (MaskSprites.astro) and the `creature` note below, never in copy or ids, so
// it can change without touching anything else.
//
// Mask (character) and theme (light/dark) are separate systems on <html>:
//   data-mask  = playful | cinematic | focused | calm
//   data-theme = dark | light
// Visual tokens live in src/styles/tokens.css, keyed by [data-mask].

export const maskIds = ['playful', 'cinematic', 'focused', 'calm'] as const;
export type MaskId = (typeof maskIds)[number];

/** The perspective shown on a first visit. */
export const DEFAULT_MASK: MaskId = 'playful';

/** Ids used before the rename, so saved choices and old ?mask= links keep working. */
export const legacyMaskIds: Record<string, MaskId> = { fox: 'playful', dragon: 'cinematic', owl: 'focused', stag: 'calm' };

export interface Mask {
  id: MaskId;
  /** Shown in the UI. */
  name: string;
  /** One line on how the whole site changes. */
  change: string;
  /** Provisional creature on the mask artwork (pending approval). Not used in copy. */
  creature: string;
  /** Duration of the page-wide reveal when this mask is put on, in ms. */
  reveal: number;
}

export const masks: Mask[] = [
  { id: 'playful', name: 'Playful', change: 'Looser layout, springy hover, louder type.', creature: 'fox', reveal: 700 },
  { id: 'cinematic', name: 'Cinematic', change: 'Wide crops, fast sweeps, high contrast.', creature: 'dragon', reveal: 520 },
  { id: 'focused', name: 'Focused', change: 'Tight grid, denser index, short transitions.', creature: 'owl', reveal: 380 },
  { id: 'calm', name: 'Calm', change: 'More space, slower fades, softer type.', creature: 'stag', reveal: 1000 },
];

export const maskById = Object.fromEntries(masks.map((m) => [m.id, m])) as Record<MaskId, Mask>;
