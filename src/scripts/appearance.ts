// Mask and theme are separate systems on <html>: data-mask and data-theme.
// Changing either runs through one shared motion: the new look is revealed through a circle
// that grows from the control that was used (View Transitions API, no library). Without
// support, or with reduced motion, the change is instant. Scroll position is kept.
import { maskById, maskIds, type MaskId } from '../content/masks';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const stall = document.querySelector<HTMLElement>('[data-stall]');
const chip = document.querySelector<HTMLButtonElement>('[data-mask-chip]');
const panel = document.querySelector<HTMLElement>('[data-mask-panel]');
const themeBtn = document.querySelector<HTMLButtonElement>('[data-theme-btn]');
const radios = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="mask"], input[name="mask-nav"]'));
const sections = ['top', 'work', 'about', 'contact'].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);

const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
const currentMask = () => (root.dataset.mask as MaskId) || 'fox';
const currentTheme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

function paintControls() {
  const id = currentMask();
  const m = maskById[id];
  radios.forEach((r) => { r.checked = r.value === id; });
  chip?.querySelector('[data-chip-name]')?.replaceChildren(m.name);
  chip?.querySelector('[data-chip-sr]')?.replaceChildren(`Choose a mask. Wearing the ${m.name}.`);
  const icon = chip?.querySelector('use');
  if (icon) { icon.setAttribute('href', `#mask-${id}`); icon.setAttribute('class', `m-${id}`); }
  if (themeBtn) {
    const next = currentTheme() === 'dark' ? 'Light' : 'Dark';
    themeBtn.querySelector('[data-theme-label]')?.replaceChildren(next);
    themeBtn.setAttribute('aria-label', `Switch to ${next.toLowerCase()} mode`);
  }
}

/** Keep whatever section the visitor is reading at the same place on screen. */
function keepPlace(apply: () => void) {
  const line = innerHeight * 0.35;
  const anchor = [...sections].reverse().find((s) => s.getBoundingClientRect().top <= line) ?? sections[0];
  const before = anchor?.getBoundingClientRect().top ?? 0;
  return () => {
    apply();
    if (!anchor) return;
    const drift = anchor.getBoundingClientRect().top - before;
    if (Math.abs(drift) > 1) scrollTo({ top: scrollY + drift, behavior: 'instant' as ScrollBehavior });
  };
}

function reveal(apply: () => void, from: HTMLElement | null, ms: number) {
  const update = keepPlace(apply);
  if (reduced.matches || !('startViewTransition' in document)) { update(); return; }
  const r = (from ?? document.body).getBoundingClientRect();
  root.style.setProperty('--vt-x', `${Math.round(r.left + r.width / 2)}px`);
  root.style.setProperty('--vt-y', `${Math.round(r.top + r.height / 2)}px`);
  root.style.setProperty('--vt-dur', `${ms}ms`);
  (document as Document & { startViewTransition: (cb: () => void) => unknown }).startViewTransition(update);
}

function setMask(id: MaskId, from: HTMLElement | null) {
  if (id === currentMask() || !maskIds.includes(id)) return;
  reveal(() => { root.dataset.mask = id; save('mask', id); paintControls(); }, from, maskById[id].reveal);
  if (stall && !reduced.matches) {
    stall.classList.remove('is-hop');
    void stall.offsetWidth;
    stall.classList.add('is-hop');
  }
}

radios.forEach((r) => r.addEventListener('change', () => {
  if (!r.checked) return;
  const origin = r.closest<HTMLElement>('.mask-opt, .panel-opt') ?? r;
  setMask(r.value as MaskId, origin);
  if (r.name === 'mask-nav') closePanel();
}));

themeBtn?.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  reveal(() => { root.dataset.theme = next; save('theme', next); paintControls(); }, themeBtn, 560);
});

/* Mask panel in the nav: the same choice, reachable from anywhere on the page */
function closePanel() { if (!panel || panel.hidden) return; panel.hidden = true; chip?.setAttribute('aria-expanded', 'false'); }
chip?.addEventListener('click', () => {
  if (!panel) return;
  const open = panel.hidden;
  panel.hidden = !open;
  chip.setAttribute('aria-expanded', String(open));
  if (open) panel.querySelector<HTMLInputElement>('input:checked')?.focus();
});
document.addEventListener('click', (e) => {
  if (panel && !panel.hidden && !panel.contains(e.target as Node) && !chip?.contains(e.target as Node)) closePanel();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel && !panel.hidden) { closePanel(); chip?.focus(); }
});

/* "Choose a mask": scroll to the stall and put focus on the picker so arrow keys work */
document.querySelector('[data-focus-picker]')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('mask-picker')?.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
  document.querySelector<HTMLInputElement>('input[name="mask"]:checked')?.focus({ preventScroll: true });
});

paintControls();
