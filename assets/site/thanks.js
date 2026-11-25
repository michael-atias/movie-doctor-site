/* the small bilingual pages: ?lang=en shows the English part */
if (new URLSearchParams(location.search).get('lang') === 'en') {
  const html = document.documentElement;
  html.lang = 'en'; html.dir = 'ltr';
  document.getElementById('he').hidden = true; document.getElementById('en').hidden = false;
  if (html.dataset.titleEn) document.title = html.dataset.titleEn;
  const l = document.querySelector('[data-lang-link]');
  if (l) { l.textContent = 'עברית'; l.lang = 'he'; l.href = location.pathname.split('/').pop(); }
}
