// Public publisher ID, verified against the site's approved AdSense account.
export const ADSENSE_CLIENT = "ca-pub-6122544703023536";

// Auto ads cannot be unloaded by removing their script element. Once loaded,
// use document navigations so Google's runtime never follows a reader into the
// quiz, admin, an ad-disabled article, or other non-blog content through the SPA.
export const BLOG_ADS_BOOTSTRAP = `
(function () {
  try {
    var privacy = JSON.parse(window.localStorage.getItem('sd:privacy:v1') || 'null');
    if (privacy && privacy.classroom === true) return;
  } catch (_) { return; }
  var current = new URL(location.href);
  if (current.protocol !== 'https:' || !['www.saintdiscoveryquiz.com', 'saintdiscoveryquiz.com'].includes(current.hostname)) return;
  if (!/^\\/blog(?:\\/[a-z0-9]+(?:-[a-z0-9]+)*)?\\/?$/.test(current.pathname) || current.searchParams.has('preview')) return;
  if (document.getElementById('saint-discovery-adsense')) return;

  function changesPage(url) {
    return url.origin === current.origin && (url.pathname !== current.pathname || url.search !== current.search);
  }
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var target = event.target;
    var anchor = target && target.closest ? target.closest('a[href]') : null;
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
    var destination;
    try { destination = new URL(anchor.href, location.href); } catch (_) { return; }
    if (!changesPage(destination)) return;
    event.preventDefault();
    event.stopPropagation();
    location.assign(destination.href);
  }, true);

  ['pushState', 'replaceState'].forEach(function (method) {
    var original = history[method];
    history[method] = function () {
      if (arguments[2] != null) {
        var destination;
        try { destination = new URL(arguments[2], location.href); } catch (_) {}
        if (destination && changesPage(destination)) {
          if (method === 'replaceState') location.replace(destination.href);
          else location.assign(destination.href);
          return;
        }
      }
      return original.apply(this, arguments);
    };
  });
  function restoreDocument() {
    if (changesPage(new URL(location.href))) location.reload();
  }
  window.addEventListener('popstate', restoreDocument, true);
  window.addEventListener('pageshow', restoreDocument, true);

  var script = document.createElement('script');
  script.id = 'saint-discovery-adsense';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}';
  document.head.appendChild(script);
})();
`;
