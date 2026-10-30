(function () {
  // Local file previews do not contribute to site analytics.
  if (!/^https?:$/.test(location.protocol) || window.__labAnalyticsInitialized) return;
  window.__labAnalyticsInitialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-Y5XK34EEF5');

  const google = document.createElement('script');
  google.async = true;
  google.src = 'https://www.googletagmanager.com/gtag/js?id=G-Y5XK34EEF5';
  document.head.appendChild(google);

  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  const clarity = document.createElement('script');
  clarity.async = true;
  clarity.src = 'https://www.clarity.ms/tag/z3lvkzeb1r';
  document.head.appendChild(clarity);
})();
