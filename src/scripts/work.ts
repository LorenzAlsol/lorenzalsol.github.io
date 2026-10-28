// Work: project tabs, and the hero-to-project aperture.
const root = document.querySelector<HTMLElement>('[data-work]');

if (root) {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));

  function select(i: number, focus = false) {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    panels.forEach((p, j) => { p.hidden = i !== j; });
    if (focus) tabs[i].focus();
  }

  // Without JS every project is shown in a column; with JS they become tabs.
  root.classList.add('tabs-ready');
  select(0);

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const next = { ArrowDown: (i + 1) % n, ArrowRight: (i + 1) % n, ArrowUp: (i + n - 1) % n, ArrowLeft: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(next, true);
    });
  });

  // The first project's image arrives through a mask-shaped aperture as you scroll in.
  // A short, scroll-linked reveal: no pinning, no hijack. Skipped for reduced motion.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const media = root.querySelector<HTMLElement>('.panel:not([hidden]) .media');
  if (media && !reduced.matches) {
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      media.classList.add('aperture');
      gsap.fromTo(media, { '--ap': 16 }, {
        '--ap': 190, ease: 'none',
        scrollTrigger: {
          trigger: media, start: 'top 94%', end: 'top 40%', scrub: 0.4,
          onLeave: () => media.classList.add('done'),
          onEnterBack: () => media.classList.remove('done'),
        },
      });
      // If the visitor is already past it (reload mid-page), do not leave it masked.
      if (media.getBoundingClientRect().top < innerHeight * 0.4) media.classList.add('done');
    });
  }
}
