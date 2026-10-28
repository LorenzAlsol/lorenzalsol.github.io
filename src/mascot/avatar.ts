// ---------------------------------------------------------------------------
// MASCOT SLOT. This is the only file to edit when your own character is ready.
//
// The rest of the page talks to the avatar through AvatarAdapter and nothing else:
//   mount(slot)     put your character inside `slot` (an element in the bottom-left guide)
//   setState(state) 'idle' | 'talking' | 'hop'
//   destroy()       optional cleanup
//
// To swap the placeholder, return your own adapter from createAvatar(). Sketches:
//
//   SVG with CSS or its own animation: slot.replaceChildren(svg); setState sets svg.dataset.state.
//   Sprite sheet: draw frames to a <canvas> or step a CSS background-position per state.
//   Lottie / Rive: these need their own package, so ask before adding one. Then load it
//     lazily inside mount() and map each state to an animation or state-machine input.
//
// Keep the slot's size (about 64 to 96px square) and the avatar decorative: the guide
// button around it already has an accessible name.
// ---------------------------------------------------------------------------

export type AvatarState = 'idle' | 'talking' | 'hop';

export interface AvatarAdapter {
  mount(slot: HTMLElement): void | Promise<void>;
  setState(state: AvatarState): void;
  destroy?(): void;
}

/** Placeholder: adopts the server-rendered blob SVG and reflects the state in `data-state`. */
function placeholderAvatar(): AvatarAdapter {
  let art: SVGElement | null = null;
  return {
    mount(slot) {
      art = slot.querySelector<SVGElement>('[data-avatar-art]');
      art?.setAttribute('data-state', 'idle');
    },
    setState(state) {
      art?.setAttribute('data-state', state);
    },
    destroy() {
      art = null;
    },
  };
}

export function createAvatar(): AvatarAdapter {
  return placeholderAvatar();
}
