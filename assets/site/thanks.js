  if (new URLSearchParams(location.search).get('lang') === 'en') {
    document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr';
    document.getElementById('he').hidden = true; document.getElementById('en').hidden = false;
    document.title = 'Movie Doctor: thank you for your order';
  }
