// The site's own analytics: what visitors look at and click, sent in small batches to Ronie's worker (POST /t,
// worker/src/analytics.js) for Raunak's command centre (hq.html). No cookies and no third parties: a random visitor id
// in localStorage, a session id that lasts until 30 minutes of quiet. Other scripts add their own moments with
// window.track(type, label, value, data). Raunak's own browser is left out once he has opened the command centre.
(function () {
  var URL_T = 'https://ronie-chat.ronie-chat.workers.dev/t';
  var get = function (s, k) { try { return s.getItem(k); } catch (e) { return null; } };
  var put = function (s, k, v) { try { s.setItem(k, v); } catch (e) { /* private mode */ } };
  var noop = function () {};
  var off = get(window.localStorage, 'rp-notrack') === '1' || navigator.doNotTrack === '1' || navigator.webdriver;
  if (off) { window.track = noop; return; }

  var rid = function () { var a = new Uint8Array(12); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return (b % 36).toString(36); }).join(''); };
  var vid = get(localStorage, 'rp-vid');
  if (!vid || !/^[a-z0-9]{8,32}$/.test(vid)) { vid = rid(); put(localStorage, 'rp-vid', vid); }
  // a session: this tab's, until half an hour without a sound
  var now = Date.now();
  var sid = get(localStorage, 'rp-sid'), seen = +get(localStorage, 'rp-sid-at') || 0, fresh = false;
  if (!sid || now - seen > 30 * 6e4) { sid = rid(); fresh = true; put(localStorage, 'rp-sid', sid); }
  put(localStorage, 'rp-sid-at', String(now));

  var q = [], timer = 0, sentCtx = !fresh;
  var u = new URLSearchParams(location.search);
  var ctx = {
    ref: document.referrer || '', landing: location.pathname + location.search + location.hash,
    lang: navigator.language || '', tz: (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || '',
    screen: screen.width + 'x' + screen.height,
    utm_source: u.get('utm_source') || u.get('ref') || '', utm_medium: u.get('utm_medium') || '', utm_campaign: u.get('utm_campaign') || '',
  };

  // where on the site: the page in the address (/radar, /ronie, /ai-tools/…) or its #part
  function route() {
    var h = location.hash.replace(/^#/, '').split(/[?&]/)[0];
    var p = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
    if (/^\/(ronie)$/.test(p) || h === 'assistant') return 'ronie';
    if (/^\/(radar|tools)$/.test(p)) return 'radar';
    if (p.indexOf('/ai-tools') === 0) return p.slice(1).slice(0, 40);
    return h || 'dashboard';
  }

  function flush(beacon) {
    clearTimeout(timer); timer = 0;
    if (!q.length) return;
    var body = { vid: vid, sid: sid, now: Date.now(), name: get(localStorage, 'rai-name') || '', events: q.splice(0, 40) };
    if (!sentCtx) { body.ctx = ctx; sentCtx = true; } else body.ctx = { lang: ctx.lang, tz: ctx.tz, screen: ctx.screen };
    var text = JSON.stringify(body);
    put(localStorage, 'rp-sid-at', String(Date.now()));
    // (text/plain: a "simple" request, so no preflight, and sendBeacon can carry it as the page goes)
    if (beacon && navigator.sendBeacon && navigator.sendBeacon(URL_T, new Blob([text], { type: 'text/plain' }))) { if (q.length) flush(beacon); return; }
    fetch(URL_T, { method: 'POST', body: text, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(noop);
    if (q.length) flush(beacon);
  }
  function track(t, l, v, d) {
    q.push({ t: t, ts: Date.now(), r: route(), l: l == null ? undefined : String(l).slice(0, 300), v: v, d: d });
    if (!timer) timer = setTimeout(flush, q.length > 20 ? 0 : 4000);
  }
  window.track = track;

  // ---- what part of the site, and for how long (time only counts while the tab is in front)
  var cur = null, since = 0;
  function leave() {
    if (cur && since) { var ms = Date.now() - since; if (ms > 800) q.push({ t: 'time', ts: Date.now(), r: cur, v: Math.min(ms, 30 * 6e4) }); }
    since = 0;
  }
  function arrive() {
    var r = route();
    if (r !== cur) { leave(); cur = r; track('view', r); }
    if (!since && document.visibilityState === 'visible') since = Date.now();
  }
  addEventListener('hashchange', arrive);
  addEventListener('popstate', arrive);
  ['pushState', 'replaceState'].forEach(function (m) {
    var o = history[m];
    history[m] = function () { var r = o.apply(this, arguments); setTimeout(arrive, 0); return r; };
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { leave(); flush(true); } else if (cur) { since = Date.now(); put(localStorage, 'rp-sid-at', String(Date.now())); }
  });
  addEventListener('pagehide', function () { leave(); flush(true); });
  arrive();

  // ---- how far down the page they read (the deepest quarter reached, once per part of the site)
  var deep = {};
  addEventListener('scroll', function () {
    var r = cur, h = document.documentElement.scrollHeight - innerHeight;
    if (h < 200) return;
    var pct = Math.min(100, Math.round((scrollY / h) * 4) * 25);
    if (pct > (deep[r] || 0)) { deep[r] = pct; if (pct >= 50) track('scroll', r, pct); }
  }, { passive: true });

  // ---- clicks: links and buttons, by what they say. Parts with their own, richer moments are skipped here.
  var OWN = '.tool-card, .tl-row, .tl-lead, .tl-model, #tl-models a, .pcard, #cases, #certs, .tcard, #tl-dds, #tl-views, .tool-save, [data-notrack]';
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('a, button, [role="button"], [role="link"]');
    if (!el) return;
    var txt = function (sel) { var n = el.querySelector(sel); return n ? n.textContent.replace(/\s+/g, ' ').trim() : ''; };
    // Radar's headlines and trending models
    if (el.matches('a.tl-row')) return track('news_open', txt('.tl-h'), null, { source: txt('.tl-src'), href: el.href.slice(0, 300) });
    if (el.matches('a.tl-model')) return track('model_open', txt('.tl-model-name'), null, { maker: txt('.tl-model-top span'), href: el.href.slice(0, 300) });
    if (el.matches('a.tl-lead-link')) return track('news_open', txt('h2'), null, { source: txt('.tl-kicker').split('·')[0].trim(), href: el.href.slice(0, 300), lead: 1 });
    if (el.matches('.tl-answer-list a')) return track('tool_open', txt('b'), null, { via: 'ask', key: el.dataset.key || undefined, aff: /sponsored/.test(el.rel) ? 1 : undefined, href: el.href.slice(0, 300) });
    if (el.closest(OWN)) return;
    var label = (el.getAttribute('aria-label') || el.textContent || el.title || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    // (a button in the project popup says which project it was)
    var dt = el.closest('#detail') && document.getElementById('detail-title');
    if (dt && label && !el.matches('.modal-close')) label = label + ' · ' + dt.textContent.trim().slice(0, 80);
    var href = el.tagName === 'A' ? el.href : '';
    if (href && /^https?:/.test(href) && new URL(href).host !== location.host) track('outbound', label || href, null, { href: href.slice(0, 300) });
    else if (label) track('click', label, null, href ? { href: href.slice(0, 200) } : undefined);
  }, true);
})();
