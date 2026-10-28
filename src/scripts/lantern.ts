// Tiny loader: Three.js is fetched after first paint, and never for reduced-motion users.
const root = document.querySelector<HTMLElement>('[data-lantern]');
const stage = root?.querySelector<HTMLElement>('[data-stage]');

if (root && stage) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-face]'));
  type Lantern = Awaited<ReturnType<typeof import('./lantern-scene').createLantern>>;
  let lantern: Lantern | null = null;
  let starting = false;

  const teardown = () => {
    lantern?.dispose();
    lantern = null;
    root.classList.remove('is-3d');
  };

  const start = async () => {
    if (lantern || starting || motion.matches) return;
    starting = true;
    try {
      const { createLantern } = await import('./lantern-scene');
      const labels: string[] = JSON.parse(root.dataset.labels ?? '[]');
      const made = await createLantern({
        stage,
        labels,
        initials: root.dataset.initials ?? '',
        // Same action as the real links.
        onPick: (face) => links[face]?.click(),
      });
      if (motion.matches) { made.dispose(); return; }
      lantern = made;
      root.classList.add('is-3d');
    } catch {
      // No WebGL or a load error: the static image and the four links stay.
    } finally {
      starting = false;
    }
  };

  links.forEach((a, i) => {
    a.addEventListener('focus', () => lantern?.focusFace(i));
    a.addEventListener('blur', () => lantern?.setFocused(false));
  });
  motion.addEventListener('change', () => (motion.matches ? teardown() : start()));
  window.addEventListener('pagehide', teardown);

  // After first paint.
  const idle = (window as any).requestIdleCallback as undefined | ((cb: () => void, o?: { timeout: number }) => void);
  const kick = () => (idle ? idle(start, { timeout: 1500 }) : setTimeout(start, 200));
  if (document.readyState === 'complete') kick();
  else window.addEventListener('load', kick, { once: true });
}
