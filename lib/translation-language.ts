import { SITE_LANGUAGES, TRANSLATED_HOST } from "./site-languages";

// The source HTML is English. Only Google's fixed translation host may use the
// requested target language. Run before hydration rather than waiting for a
// component effect to expose the translated document's language.
export const TRANSLATION_LANGUAGE_BOOTSTRAP = `
(function () {
  if (location.hostname !== ${JSON.stringify(TRANSLATED_HOST)}) return;
  var supported = ${JSON.stringify(SITE_LANGUAGES.map(item => item.code))};
  function syncLanguage() {
    var language = new URLSearchParams(location.search).get('_x_tr_tl');
    if (supported.indexOf(language) === -1) return;
    var root = document.documentElement;
    var direction = language === 'ar' ? 'rtl' : 'ltr';
    if (root.lang !== language) root.lang = language;
    if (root.dir !== direction) root.dir = direction;
  }
  syncLanguage();
  // Google can replace root attributes after its translation UI initializes.
  // Watch only those two attributes; never rewrite translated page content.
  new MutationObserver(syncLanguage).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang', 'dir']
  });
  window.addEventListener('pageshow', syncLanguage);
  window.addEventListener('popstate', syncLanguage);
})();
`;
