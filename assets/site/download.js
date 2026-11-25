/* download page: a licence key unlocks the three download links (the server checks the key again) */
const API = 'https://moviedoctor-api.michael-atias.co.il';
const shape = /^[A-Za-z0-9_-]{20,2000}\.[A-Za-z0-9_-]{40,200}$/;
const lang = document.documentElement.lang === 'en' ? 'en' : 'he';
const sec = document.getElementById(lang);
const form = sec.querySelector('[data-dl-form]'), err = sec.querySelector('[data-dl-err]'), list = sec.querySelector('[data-dl-links]');
if (new URLSearchParams(location.search).get('error') === 'key') err.hidden = false;
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const key = form.elements.key.value.replace(/\s+/g, '');
  if (!shape.test(key)) { err.hidden = false; return; }
  err.hidden = true;
  list.querySelectorAll('a[data-f]').forEach(a => { a.href = `${API}/dl?f=${a.dataset.f}&key=${encodeURIComponent(key)}`; });
  list.hidden = false; form.hidden = true;
});
