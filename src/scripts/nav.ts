// Marks the nav link for the section crossing the upper-middle of the viewport.
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-link'));
const targets = links
  .map((a) => document.getElementById(a.getAttribute('href')?.slice(1) ?? ''))
  .filter((el): el is HTMLElement => !!el);
const footer = document.querySelector<HTMLElement>('.footer');
const lastId = targets[targets.length - 1]?.id;

function mark(id: string | null) {
  links.forEach((a) => {
    if (id && a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) mark(e.target === footer ? (lastId ?? null) : e.target.id);
  },
  { rootMargin: '-35% 0px -60% 0px' },
);
targets.forEach((el) => io.observe(el));
if (footer) io.observe(footer);
const hero = document.getElementById('top');
if (hero) new IntersectionObserver((es) => { if (es[0].isIntersecting) mark(null); }, { rootMargin: '-35% 0px -60% 0px' }).observe(hero);
window.addEventListener('pagehide', () => io.disconnect());
