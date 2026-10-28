// The four masks. Mask (character) and theme (light/dark) are separate systems:
// a mask sets typography, composition, motion and decoration; the theme sets the surfaces.
// Visual tokens live in src/styles/tokens.css, keyed by [data-mask]; this file holds the
// names, copy and the motion numbers that scripts need.

export const maskIds = ['fox', 'dragon', 'owl', 'stag'] as const;
export type MaskId = (typeof maskIds)[number];

/** The mask worn on a first visit. */
export const DEFAULT_MASK: MaskId = 'fox';

export interface Mask {
  id: MaskId;
  name: string;
  mood: string;
  /** What changes when this mask is worn. Shown in the picker caption. */
  change: string;
  /** Duration of the page-wide reveal when this mask is put on, in ms. */
  reveal: number;
}

export const masks: Mask[] = [
  { id: 'fox', name: 'Fox', mood: 'Playful', change: 'Looser layout, springy hover, louder type.', reveal: 700 },
  { id: 'dragon', name: 'Dragon', mood: 'Cinematic', change: 'Wide crops, fast sweeps, high contrast.', reveal: 520 },
  { id: 'owl', name: 'Owl', mood: 'Focused', change: 'Tight grid, denser index, short transitions.', reveal: 380 },
  { id: 'stag', name: 'Stag', mood: 'Calm', change: 'More space, slower fades, softer type.', reveal: 1000 },
];

export const maskById = Object.fromEntries(masks.map((m) => [m.id, m])) as Record<MaskId, Mask>;
