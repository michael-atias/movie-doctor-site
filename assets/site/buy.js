/* Buy buttons -> Paddle checkout (overlay).
   Paddle.js is loaded only when a visitor presses a Buy button, so the page itself sets no cookies and
   contacts no third party until then (privacy.html says so).
   PADDLE_TOKEN: the client-side token from Paddle > Developer tools > Authentication (starts with "live_").
   It is public by design (it can only open a checkout). While it is empty the buttons simply go to #price. */
const PADDLE_TOKEN = '';
const PRICE_ID = 'pri_01m87z5srm4nkkkr0jc2q09cvw';   // Movie Doctor Pro, $39 one-time
const SUCCESS_PAGE = 'thanks.html';

let loading = null;
function loadPaddle() {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    s.onload = () => { window.Paddle.Initialize({ token: PADDLE_TOKEN }); resolve(window.Paddle); };
    s.onerror = () => { loading = null; reject(new Error('Paddle did not load')); };
    document.head.appendChild(s);
  });
  return loading;
}

function open(e) {
  if (!PADDLE_TOKEN) return;               // not set up yet: the link's own href (#price) is used
  e.preventDefault();
  const btn = e.currentTarget;
  btn.setAttribute('aria-busy', 'true');
  const lang = document.documentElement.lang === 'he' ? 'he' : 'en';
  loadPaddle().then(P => {
    P.Checkout.open({
      items: [{ priceId: PRICE_ID, quantity: 1 }],
      settings: { displayMode: 'overlay', theme: 'light', locale: lang,
                  successUrl: new URL(SUCCESS_PAGE + (lang === 'he' ? '' : '?lang=en'), location.href).href }
    });
  }).catch(() => { location.hash = 'price'; })
    .finally(() => btn.removeAttribute('aria-busy'));
}

document.querySelectorAll('[data-buy]').forEach(a => a.addEventListener('click', open));
