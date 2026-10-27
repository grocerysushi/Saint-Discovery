// Runs before hydration so mount events queue even on a slow connection.
// No Google script on admin/local/preview pages. A document that enters admin
// stays disabled until a full public-page load (including back/forward visits).
export const ANALYTICS_BOOTSTRAP = `
(function () {
  var disabledKey = 'ga-disable-G-C75CMC27YN';
  function allowed() {
    try {
      var value = JSON.parse(window.localStorage.getItem('sd:privacy:v1') || 'null');
      return value && value.version === 1 && value.analytics === true && value.classroom === false &&
        Number.isFinite(value.expires) && value.expires > Date.now() && value.expires <= Date.now() + 180 * 86400000;
    }
    catch (_) { return false; }
  }
  window[disabledKey] = true;
  window.addEventListener('storage', function (event) {
    if (event.key === 'sd:privacy:v1' || event.key === null) {
      window[disabledKey] = true;
      location.reload();
    }
  });
  function isAdmin(value) {
    try { return /^\\/admin(?:\\/|$)/i.test(decodeURIComponent(new URL(value, location.href).pathname)); }
    catch (_) { return true; }
  }
  if (!allowed() || !['www.saintdiscoveryquiz.com', 'saintdiscoveryquiz.com'].includes(location.hostname) || isAdmin(location.href)) {
    window[disabledKey] = true;
    return;
  }
  window[disabledKey] = false;
  function blockAdmin(value) {
    if (isAdmin(value)) window[disabledKey] = true;
  }
  ['pushState', 'replaceState'].forEach(function (method) {
    var original = history[method];
    history[method] = function () {
      blockAdmin(arguments[2] == null ? location.href : arguments[2]);
      return original.apply(this, arguments);
    };
  });
  window.addEventListener('popstate', function () { blockAdmin(location.href); }, true);
  window.addEventListener('pageshow', function () {
    blockAdmin(location.href);
    if (!allowed()) { window[disabledKey] = true; location.reload(); }
  }, true);
  window.addEventListener('storage', function (event) {
    // Other tabs may have old reader/internal settings; reload before resuming.
    if (event.key === 'sd:analytics-mode' || event.key === 'sd:privacy:v1' || event.key === null) window[disabledKey] = true;
  });
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  function safeUrl(value) {
    try { var url = new URL(value); url.searchParams.delete('token'); return url.href; }
    catch (_) { return ''; }
  }
  var settings = {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: safeUrl(location.href),
    page_referrer: safeUrl(document.referrer)
  };
  try {
    var mode = window.localStorage.getItem('sd:analytics-mode');
    if (mode === 'internal') settings.traffic_type = 'internal';
    if (mode === 'developer') settings.debug_mode = true;
  } catch (_) {}
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', 'G-C75CMC27YN', settings);
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-C75CMC27YN';
  document.head.appendChild(script);
})();
`;
