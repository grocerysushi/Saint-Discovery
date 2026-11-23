export const TRACELEAF_PATH = /^\/(?:about|app-privacy|blog(?:\/[a-z0-9-]+)?|confirmation-saint-guide|editorial-policy(?:\/(?:corrections|feast-calendars))?|patron-saint-of(?:\/[a-z0-9-]+)?|privacy|quiz|resources(?:\/(?:reading|teachers))?|saint-of-day|saints\/[a-z0-9-]+)?$/;
export const TRACELEAF_ID = /^[A-Za-z0-9_-]{8,96}$/;
export const TRACELEAF_ATTEMPT = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export const TRACELEAF_UTM = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
export const TRACELEAF_PLACEMENT = /^[a-z][a-z0-9_-]{0,47}$/;
export const TRACELEAF_ARTICLE_PATH = /^\/blog\/[a-z0-9-]+$/;
export const TRACELEAF_STORAGE_KEY = "sd:traceleaf:v1";
// Prefer a non-secret build flag so server credentials (TRACELEAF_SITES_TOKEN)
// do not need to be exposed at build time for static layouts.
export const TRACELEAF_ENABLED =
  process.env.NEXT_PUBLIC_TRACELEAF_ENABLED === "true" ||
  (process.env.NEXT_PUBLIC_TRACELEAF_ENABLED !== "false" &&
    Boolean(process.env.TRACELEAF_COLLECTOR_URL && process.env.TRACELEAF_SITES_TOKEN));

export type TraceleafEventName = "quiz_start" | "quiz_step" | "quiz_complete" | "quiz_load_error" |
  "directory_search" | "article_to_quiz" | "app_store_click";
export type TraceleafEventOptions = { attempt?: string; step?: number; placement?: string };

// Runs inside the site's existing production and privacy gate.
export const TRACELEAF_BOOTSTRAP = String.raw`
  var traceleafPath = ${TRACELEAF_PATH};
  var traceleafIdentifier = ${TRACELEAF_ID};
  var traceleafAttempt = ${TRACELEAF_ATTEMPT};
  var traceleafCampaign = ${TRACELEAF_UTM};
  var traceleafPlacement = ${TRACELEAF_PLACEMENT};
  var traceleafArticlePath = ${TRACELEAF_ARTICLE_PATH};
  var traceleafStorageKey = ${JSON.stringify(TRACELEAF_STORAGE_KEY)};
  var traceleafAppId = /\/id6828221648\/?$/;
  var lastTraceleafPath;

  function traceleafPermission() {
    return !window[disabledKey] && allowed() && window.navigator.doNotTrack !== 'yes' &&
      window.doNotTrack !== '1' && !isAdmin(location.href);
  }

  function captureTraceleaf(type, name, path, details) {
    if (!traceleafPermission() || !traceleafPath.test(path) || path.length > 180) return;
    try {
      var now = Date.now();
      var saved = JSON.parse(window.localStorage.getItem(traceleafStorageKey) || 'null');
      var continuingVisitor = saved && typeof saved.visitor === 'string' && traceleafIdentifier.test(saved.visitor) &&
        Number.isFinite(saved.startedAt) && now >= saved.startedAt && now - saved.startedAt < 30 * 86400000;
      var continuingSession = continuingVisitor && typeof saved.session === 'string' && traceleafIdentifier.test(saved.session) &&
        Number.isFinite(saved.seenAt) && now >= saved.seenAt && now - saved.seenAt < 30 * 60000;
      var referrer = continuingSession ? saved.referrer : '';
      if (!continuingSession && document.referrer) {
        var previous = new URL(document.referrer);
        if (/^https?:$/.test(previous.protocol) && previous.origin !== location.origin) referrer = previous.origin;
      }
      var identity = {
        visitor: continuingVisitor ? saved.visitor : window.crypto.randomUUID(),
        startedAt: continuingVisitor ? saved.startedAt : now,
        session: continuingSession ? saved.session : window.crypto.randomUUID(),
        seenAt: now,
        referrer: referrer
      };
      window.localStorage.setItem(traceleafStorageKey, JSON.stringify(identity));
      var body = Object.assign({
        type: type, name: name, path: path,
        visitor: identity.visitor, session: identity.session, referrer: identity.referrer
      }, details || {});
      window.fetch('/api/traceleaf/collect', {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(function () {});
    } catch (_) {}
  }

  function currentTraceleafPath() {
    return new URL(location.href).pathname.replace(/\/$/, '') || '/';
  }

  function traceleafCampaignLabels() {
    var params = new URL(location.href).searchParams;
    function label(key) {
      var value = (params.get(key) || '').trim();
      if (traceleafCampaign.test(value)) return value;
    }
    return {
      utmSource: label('utm_source'),
      utmMedium: label('utm_medium'),
      utmCampaign: label('utm_campaign')
    };
  }

  trackTraceleafPage = function (force) {
    var path = currentTraceleafPath();
    if (!force && path === lastTraceleafPath) return;
    lastTraceleafPath = path;
    captureTraceleaf('pageview', undefined, path, traceleafCampaignLabels());
  };

  function trackTraceleafEvent(name, options) {
    var path = currentTraceleafPath();
    options = options || {};
    if (name === 'quiz_start' || name === 'quiz_step' || name === 'quiz_complete') {
      if (path !== '/quiz') return;
      var attempt = typeof options.attempt === 'string' && traceleafAttempt.test(options.attempt)
        ? options.attempt.toLowerCase() : undefined;
      if (name === 'quiz_step') {
        var step = options.step;
        if (!attempt || !Number.isInteger(step) || step < 1 || step > 20) return;
        captureTraceleaf('event', name, path, { attempt: attempt, step: step });
      } else captureTraceleaf('event', name, path, { attempt: attempt });
      return;
    }
    if (name === 'quiz_load_error' && path === '/quiz' ||
        name === 'directory_search' && (path === '/' || path === '/resources') ||
        name === 'article_to_quiz' && traceleafArticlePath.test(path)) {
      captureTraceleaf('event', name, path);
    } else if (name === 'app_store_click' && typeof options.placement === 'string' &&
        traceleafPlacement.test(options.placement)) {
      captureTraceleaf('event', name, path, { placement: options.placement });
    }
  }

  window.traceleaf = { track: trackTraceleafEvent };
  window.addEventListener('click', function (event) {
    var link = event.target && event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var target;
    try { target = new URL(link.href, location.href); } catch (_) { return; }
    if (target.origin === location.origin && target.pathname.replace(/\/$/, '') === '/quiz') {
      trackTraceleafEvent('article_to_quiz');
    } else if (target.protocol === 'https:' && target.hostname === 'apps.apple.com' &&
        traceleafAppId.test(target.pathname)) {
      trackTraceleafEvent('app_store_click', { placement: link.getAttribute('data-traceleaf-placement') });
    }
  }, true);
  window.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.getAttribute || form.getAttribute('data-traceleaf-event') !== 'directory_search') return;
    var field = form.querySelector('input[name="q"]');
    if (field && field.value.trim()) trackTraceleafEvent('directory_search');
  }, true);

  trackTraceleafPage();
  if (window.performance && typeof window.performance.getEntriesByType === 'function') {
    var traceleafLoadedPath = currentTraceleafPath();
    function collectTraceleafTiming() {
      window.setTimeout(function () {
        var navigation = window.performance.getEntriesByType('navigation')[0];
        var duration = navigation && Math.round(navigation.loadEventEnd);
        if (Number.isFinite(duration) && duration > 0) {
          captureTraceleaf('event', 'page_performance', traceleafLoadedPath, { durationMs: Math.min(duration, 60000) });
        }
      }, 0);
    }
    if (document.readyState === 'complete') collectTraceleafTiming();
    else window.addEventListener('load', collectTraceleafTiming, { once: true });
  }
`;
