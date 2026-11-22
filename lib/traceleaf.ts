export const TRACELEAF_PATH = /^\/(?:about|app-privacy|blog(?:\/[a-z0-9-]+)?|confirmation-saint-guide|editorial-policy(?:\/(?:corrections|feast-calendars))?|patron-saint-of(?:\/[a-z0-9-]+)?|privacy|quiz|resources(?:\/(?:reading|teachers))?|saint-of-day|saints\/[a-z0-9-]+)?$/;
export const TRACELEAF_ID = /^[A-Za-z0-9_-]{8,96}$/;
export const TRACELEAF_STORAGE_KEY = "sd:traceleaf:v1";
export const TRACELEAF_ENABLED = Boolean(process.env.TRACELEAF_COLLECTOR_URL && process.env.TRACELEAF_SITES_TOKEN);

// Runs inside the site's existing production and privacy gate.
export const TRACELEAF_BOOTSTRAP = String.raw`
  var traceleafPath = ${TRACELEAF_PATH};
  var traceleafIdentifier = ${TRACELEAF_ID};
  var traceleafStorageKey = ${JSON.stringify(TRACELEAF_STORAGE_KEY)};
  var lastTraceleafPath;

  function traceleafPermission() {
    return !window[disabledKey] && allowed() && window.navigator.doNotTrack !== 'yes' &&
      window.doNotTrack !== '1' && !isAdmin(location.href);
  }

  function captureTraceleaf(type, name, path) {
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
      window.fetch('/api/traceleaf/collect', {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type, name: name, path: path,
          visitor: identity.visitor, session: identity.session, referrer: identity.referrer
        })
      }).catch(function () {});
    } catch (_) {}
  }

  function currentTraceleafPath() {
    return new URL(location.href).pathname.replace(/\/$/, '') || '/';
  }

  trackTraceleafPage = function (force) {
    var path = currentTraceleafPath();
    if (!force && path === lastTraceleafPath) return;
    lastTraceleafPath = path;
    captureTraceleaf('pageview', undefined, path);
  };
  window.traceleaf = {
    track: function (name) {
      if ((name === 'quiz_start' || name === 'quiz_complete') && currentTraceleafPath() === '/quiz') {
        captureTraceleaf('event', name, '/quiz');
      }
    }
  };
  trackTraceleafPage();
`;
