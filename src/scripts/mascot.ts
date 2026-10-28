import { createAvatar } from '../mascot/avatar';

const root = document.querySelector<HTMLElement>('[data-mascot]');

if (root) {
  const lines: Record<string, string[]> = JSON.parse(root.dataset.lines ?? '{}');
  const sections: { id: string; label: string }[] = JSON.parse(root.dataset.sections ?? '[]');
  const bubble = root.querySelector<HTMLElement>('[data-bubble]')!;
  const line = root.querySelector<HTMLElement>('[data-line]')!;
  const avatarBtn = root.querySelector<HTMLButtonElement>('[data-avatar-btn]')!;
  const slot = root.querySelector<HTMLElement>('[data-avatar-slot]')!;
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-next]')!;
  const goBtn = root.querySelector<HTMLButtonElement>('[data-go]')!;
  const hideBtn = root.querySelector<HTMLButtonElement>('[data-hide]')!;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const KEY = 'mascot-hidden';
  const avatar = createAvatar();
  void avatar.mount(slot);

  let current = sections[0]?.id ?? 'start';
  let tip = 0;
  let visible = true;
  let timer = 0;

  const read = (): string | null => { try { return sessionStorage.getItem(KEY); } catch { return null; } };
  const write = (hidden: boolean) => { try { sessionStorage.setItem(KEY, hidden ? '1' : '0'); } catch {} };

  const nextSection = () => {
    const i = sections.findIndex((s) => s.id === current);
    return sections[(i + 1) % sections.length];
  };

  function settle(ms: number) {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => avatar.setState('idle'), ms);
  }
  function talk() { avatar.setState('talking'); settle(1600); }
  function hop() { avatar.setState('hop'); settle(700); }

  function render() {
    const set = lines[current] ?? [];
    line.textContent = set[tip % Math.max(set.length, 1)] ?? '';
    goBtn.textContent = `Go to ${nextSection().label}`;
    nextBtn.hidden = set.length < 2;
  }

  function setVisible(v: boolean, remember: boolean) {
    visible = v;
    bubble.hidden = !v;
    avatarBtn.setAttribute('aria-expanded', String(v));
    if (remember) write(!v);
    if (v) { render(); talk(); }
  }

  function onSection(id: string) {
    if (id === current) return;
    current = id;
    tip = 0;
    if (visible) { render(); talk(); }
  }

  nextBtn.addEventListener('click', () => { tip += 1; render(); hop(); });
  goBtn.addEventListener('click', () => {
    document.getElementById(nextSection().id)?.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
    hop();
  });
  hideBtn.addEventListener('click', () => {
    setVisible(false, true);
    avatarBtn.focus(); // the Hide button just disappeared; keep keyboard users in place
  });
  avatarBtn.addEventListener('click', () => {
    if (visible) hop();
    else setVisible(true, true);
  });

  // Start collapsed on small screens unless the visitor already chose this session.
  const stored = read();
  setVisible(stored === null ? window.innerWidth >= 600 : stored === '0', false);
  root.classList.add('is-ready');

  // Which section is crossing the middle of the viewport. The footer belongs to the last one.
  const last = sections[sections.length - 1]?.id;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onSection(e.target.matches('footer') ? (last ?? current) : e.target.id);
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  sections.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
  const footer = document.querySelector('footer');
  if (footer) io.observe(footer);

  window.addEventListener('pagehide', () => { io.disconnect(); window.clearTimeout(timer); avatar.destroy?.(); });
}
