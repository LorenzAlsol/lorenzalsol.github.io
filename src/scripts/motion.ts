// GSAP motion. Loaded as its own chunk, and never for visitors who prefer reduced motion.
// No scroll-jacking: scrolling stays native; everything here reacts to it.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let started = false;

async function start() {
  if (started || reduced.matches) return;
  started = true;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  clearTimeout((window as unknown as { __mt?: number }).__mt);
  document.documentElement.classList.remove('motion-timeout');

  // Reverts everything (and ScrollTrigger) if the visitor switches to reduced motion mid-visit.
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    // Reveals as sections enter.
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const delay = el.classList.contains('fact') ? [...(el.parentElement?.children ?? [])].indexOf(el) * 0.12 : 0;
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onComplete: () => {
            el.classList.add('is-revealed'); // keeps the CSS pre-state off
            gsap.set(el, { clearProps: 'transform,opacity' }); // hover lift can use CSS again
          },
        },
      );
    });

    // Flourishes draw in.
    document.querySelectorAll<SVGElement>('.flourish').forEach((svg) => {
      const lines = svg.querySelectorAll('.flourish-line');
      const gem = svg.querySelector('.flourish-gem');
      const st = { trigger: svg, start: 'top 90%', once: true };
      gsap.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, ease: 'power2.out', scrollTrigger: st });
      if (gem) {
        gsap.fromTo(
          gem,
          { opacity: 0, scale: 0, svgOrigin: '120 8' },
          { opacity: 1, scale: 1, svgOrigin: '120 8', duration: 0.5, delay: 0.7, ease: 'back.out(2)', scrollTrigger: st },
        );
      }
    });

    // Parallax: the moon and fireflies drift at different speeds as the hero scrolls away.
    const hero = document.querySelector<HTMLElement>('.hero');
    if (hero) {
      const scrub = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
      const orb = hero.querySelector('.orb');
      if (orb) gsap.to(orb, { y: () => hero.offsetHeight * 0.35, ease: 'none', scrollTrigger: scrub });
      hero.querySelectorAll('.firefly').forEach((f, i) => {
        gsap.to(f, { y: (i % 2 ? -1 : 1) * (50 + i * 28), ease: 'none', scrollTrigger: scrub });
      });
    }
  });
}

start();
reduced.addEventListener('change', () => {
  if (!reduced.matches) { started = false; start(); }
});
