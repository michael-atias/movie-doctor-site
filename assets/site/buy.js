/* Paying: PayPal (or a card through PayPal), automatic; Bit, confirmed by the seller.
   PayPal's script is loaded only when the visitor presses the PayPal button, so the page itself sets no
   cookies and contacts no third party until then (privacy.html says so).
   PAYPAL_CLIENT_ID is public by design (PayPal > Apps & Credentials > Live > Client ID). */
const PAYPAL_CLIENT_ID = 'BAAhOmPCllMPIi4IMelN-8eG3jWv1gyFb816q8DwU__eOjGjY7OxyoHhezJPt7buaZ2WwAsMcl9zqoc0TI';   // public by design
const API = 'https://moviedoctor-api.michael-atias.co.il';

const he = document.documentElement.lang === 'he';
const T = he ? {
  loading: 'טוען את PayPal…', fail: 'משהו השתבש בתשלום. לא חויבת. נסה שוב או כתוב לנו.',
  paid: 'התשלום התקבל. המפתח וקישור ההורדה נשלחו אל ', notReady: 'התשלום ב-PayPal ייפתח בקרוב. בינתיים אפשר לשלם בביט.',
  need: 'כתוב שם וכתובת מייל תקינה.', sending: 'שולח…',
  bit: (c, a, p) => `קוד ההזמנה שלך: <b dir="ltr">${c}</b><br>שלם <b>${a} ₪</b> בביט ${p ? `למספר <b dir="ltr">${p}</b>` : ''} וכתוב בהערה את הקוד.<br>אחרי שנראה את התשלום נשלח לך את המפתח ואת קישור ההורדה במייל, תוך יום עסקים.`,
} : {
  loading: 'Loading PayPal…', fail: 'Something went wrong with the payment. You were not charged. Try again or write to us.',
  paid: 'Payment received. Your key and download link were sent to ', notReady: 'PayPal checkout opens soon. Meanwhile you can pay with Bit.',
  need: 'Write your name and a valid e-mail address.', sending: 'Sending…',
  bit: (c, a, p) => `Your order code: <b>${c}</b><br>Pay <b>₪${a}</b> with Bit ${p ? `to <b>${p}</b>` : ''} and write the code in the note.<br>Once we see the payment we e-mail your key and download link, within one working day.`,
};

const box = document.querySelector('[data-pay]');
const msg = box?.querySelector('[data-pay-msg]');
const say = (t) => { if (msg) msg.textContent = t; };

let sdk = null;
function loadPayPal() {
  if (sdk) return sdk;
  sdk = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=USD&intent=capture&components=buttons&locale=${he ? 'he_IL' : 'en_US'}`;
    s.onload = () => resolve(window.paypal);
    s.onerror = () => { sdk = null; reject(new Error('paypal')); };
    document.head.appendChild(s);
  });
  return sdk;
}

async function post(path, body) {
  const r = await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || r.status);
  return d;
}

box?.querySelector('[data-paypal-open]')?.addEventListener('click', async (e) => {
  if (!PAYPAL_CLIENT_ID) { say(T.notReady); return; }
  const btn = e.currentTarget, holder = box.querySelector('#paypal-buttons');
  btn.disabled = true; say(T.loading);
  try {
    const paypal = await loadPayPal();
    holder.hidden = false; btn.hidden = true; say('');
    await paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'pay' },
      createOrder: async () => (await post('/api/paypal/order', { lang: he ? 'he' : 'en' })).id,
      onApprove: async (data) => {
        const d = await post('/api/paypal/capture', { orderID: data.orderID });
        say(T.paid + d.email);
        location.href = 'thanks.html' + (he ? '' : '?lang=en');
      },
      onError: () => say(T.fail),
    }).render(holder);
  } catch { btn.disabled = false; say(T.fail); }
});

const bitForm = box?.querySelector('[data-bit-form]');
box?.querySelector('[data-bit-open]')?.addEventListener('click', (e) => {
  bitForm.hidden = false; e.currentTarget.hidden = true; bitForm.querySelector('input')?.focus();
});
bitForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = bitForm.elements.name.value.trim(), email = bitForm.elements.email.value.trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { say(T.need); return; }
  say(T.sending);
  try {
    const d = await post('/api/bit/order', { name, email, lang: he ? 'he' : 'en' });
    const out = box.querySelector('[data-bit-result]');
    out.innerHTML = T.bit(String(d.code).replace(/[^A-Z0-9-]/g, ''), String(d.amount).replace(/[^0-9.]/g, ''), String(d.phone || '').replace(/[^0-9-+ ]/g, ''));
    out.hidden = false; bitForm.hidden = true; say('');
  } catch { say(T.fail); }
});

/* shekel estimate from our API (Bank of Israel rate); keeps the printed number if anything fails */
(() => {
  const els = document.querySelectorAll('[data-ils]');
  if (!els.length) return;
  fetch(API + '/api/rate').then(r => r.ok ? r.json() : null).then(d => {
    const n = Number(d && d.ils);
    if (Number.isFinite(n) && n > 50 && n < 400) els.forEach(el => { el.textContent = String(Math.round(n)); });
  }).catch(() => {});
})();
