// Marks the nav link for the section crossing the middle of the viewport.
// Plain IntersectionObserver so reduced-motion visitors get it without GSAP.
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-link'));
const targets = links
  .map((a) => document.getElementById(a.getAttribute('href')?.slice(1) ?? ''))
  .filter((el): el is HTMLElement => !!el);
const footer = document.querySelector<HTMLElement>('.site-footer');
const lastId = targets[targets.length - 1]?.id;

function mark(id: string) {
  links.forEach((a) => {
    if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) mark(e.target === footer ? (lastId ?? '') : e.target.id);
    }
  },
  { rootMargin: '-40% 0px -55% 0px' },
);
targets.forEach((el) => io.observe(el));
if (footer) io.observe(footer);
window.addEventListener('pagehide', () => io.disconnect());
