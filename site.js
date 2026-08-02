const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

const setHeaderState = () => header?.classList.toggle('scrolled', window.scrollY > 16);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
}));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll('main section[id]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${active.target.id}`));
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.1, 0.4] });
  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('[data-dialog-open]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById(trigger.dataset.dialogOpen)?.showModal();
  });
});

document.querySelectorAll('.legal-dialog').forEach((dialog) => {
  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelector('[data-project-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = `Projektanfrage: ${data.get('type')}`;
  const body = [
    'Guten Tag,',
    '',
    'ich möchte folgende Projektanfrage an G-Core Systems richten:',
    '',
    `Name: ${data.get('name')}`,
    `E-Mail: ${data.get('email')}`,
    `Anfrage als: ${data.get('audience')}`,
    `Art der Anfrage: ${data.get('type')}`,
    `Gewünschter Zeitraum: ${data.get('timeline') || 'nicht angegeben'}`,
    `Budgetrahmen: ${data.get('budget') || 'nicht angegeben'}`,
    '',
    'Aufgabe oder Idee:',
    String(data.get('description')),
    '',
    'Mit freundlichen Grüßen',
    String(data.get('name'))
  ].join('\n');
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
