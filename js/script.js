// matcha-haha — small interactions

// Highlight active nav link
(function highlightActiveNav() {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.primary-nav a, .secondary-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const target = href.split('#')[0].toLowerCase();
    if (target === path) a.style.color = 'var(--green-900)';
  });
})();

// Smooth scroll for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Subtle header shadow on scroll
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => {
    if (window.scrollY > 8) header.style.boxShadow = '0 1px 0 rgba(0,0,0,0.04)';
    else header.style.boxShadow = 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
