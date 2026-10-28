const root = document.documentElement;
const button = document.getElementById('theme-toggle') as HTMLButtonElement | null;

const current = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

function label() {
  if (!button) return;
  // Shows the mode you will switch to.
  const next = current() === 'dark' ? 'Dawn' : 'Dusk';
  button.textContent = next;
  button.setAttribute('aria-label', `Switch to ${next} theme`);
}

label();
requestAnimationFrame(() => root.classList.add('theme-ready'));

button?.addEventListener('click', () => {
  root.dataset.theme = current() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  label();
});
