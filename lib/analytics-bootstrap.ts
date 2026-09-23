// Runs before hydration so mount events queue even on a slow connection.
// Do not send local/preview traffic or email tokens to the production property.
export const ANALYTICS_BOOTSTRAP = `
(function () {
  if (!['www.saintdiscoveryquiz.com', 'saintdiscoveryquiz.com'].includes(location.hostname)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  function safeUrl(value) {
    try { var url = new URL(value); url.searchParams.delete('token'); return url.href; }
    catch (_) { return ''; }
  }
  window.gtag('js', new Date());
  window.gtag('config', 'G-C75CMC27YN', {
    page_location: safeUrl(location.href),
    page_referrer: safeUrl(document.referrer)
  });
})();
`;
