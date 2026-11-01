// The site's own analytics, for Raunak's command centre (hq.html): what visitors do, where they're from, what they ask
// Ronie and look for on Radar. Kept in a D1 database (binding DB, see wrangler.toml); no third party sees any of it.
// - POST /t        the site's beacon (js/track.js): a batch of events from one visitor's tab
// - chats          written by the worker itself as Ronie answers (logChat), so the transcripts are complete
// - GET /admin/*   the dashboard's reads, behind the ADMIN_TOKEN secret (Authorization: Bearer …)
// Visitors' IP addresses are never stored: only the city, region and country Cloudflare reads from them, and the
// network's name (e.g. a company's or a university's).

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS visitors (vid TEXT PRIMARY KEY, first_ts INTEGER, last_ts INTEGER, name TEXT, email TEXT, company TEXT, note TEXT)`,
  `CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, vid TEXT, first_ts INTEGER, last_ts INTEGER,
    country TEXT, region TEXT, city TEXT, lat REAL, lon REAL, tz TEXT, org TEXT,
    device TEXT, os TEXT, browser TEXT, lang TEXT, screen TEXT, referrer TEXT, utm TEXT, landing TEXT,
    pages INTEGER DEFAULT 0, events INTEGER DEFAULT 0, engaged_ms INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, sid TEXT, vid TEXT, type TEXT, route TEXT, label TEXT, value REAL, data TEXT)`,
  `CREATE TABLE IF NOT EXISTS chats (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, sid TEXT, vid TEXT, name TEXT, mode TEXT, q TEXT, reply TEXT, model TEXT, country TEXT, city TEXT)`,
  `CREATE INDEX IF NOT EXISTS ev_ts ON events (ts)`,
  `CREATE INDEX IF NOT EXISTS ev_type_ts ON events (type, ts)`,
  `CREATE INDEX IF NOT EXISTS ev_vid ON events (vid, ts)`,
  `CREATE INDEX IF NOT EXISTS se_ts ON sessions (first_ts)`,
  `CREATE INDEX IF NOT EXISTS se_last ON sessions (last_ts)`,
  `CREATE INDEX IF NOT EXISTS se_vid ON sessions (vid)`,
  `CREATE INDEX IF NOT EXISTS ch_ts ON chats (ts)`,
  `CREATE INDEX IF NOT EXISTS ch_vid ON chats (vid, ts)`,
  // Radar's affiliate links, set in HQ: a tool (by its Radar key, e.g. "pick:Runway") and where its links go instead
  `CREATE TABLE IF NOT EXISTS affiliates (key TEXT PRIMARY KEY, name TEXT, url TEXT NOT NULL, cta TEXT, updated INTEGER)`,
];
// (the tables make themselves the first time they're needed, once per worker instance: no migration step)
let ready = null;
function schema(env) {
  ready ||= env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s))).catch((err) => { ready = null; throw err; });
  return ready;
}

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|embedly|quora link|pinterest|vkshare|w3c_validator|curl|wget|python-requests|axios|node-fetch|go-http/i;
const ID = /^[a-z0-9]{8,32}$/i;
const TYPES = new Set(['view', 'time', 'click', 'open', 'radar_search', 'radar_ask', 'tool_view', 'tool_open', 'tool_save', 'radar_filter', 'news_open', 'model_open', 'name', 'contact', 'game', 'ronie_step', 'outbound', 'scroll']);
const str = (v, n) => (v == null ? null : String(v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n) || null);

function uaParts(ua) {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? 'Tablet' : /mobi|iphone|ipod|android/i.test(ua) ? 'Mobile' : 'Desktop';
  const os = /windows/i.test(ua) ? 'Windows' : /iphone|ipad|ipod/i.test(ua) ? 'iOS' : /mac os x|macintosh/i.test(ua) ? 'macOS'
    : /android/i.test(ua) ? 'Android' : /cros/i.test(ua) ? 'ChromeOS' : /linux/i.test(ua) ? 'Linux' : 'Other';
  const browser = /edg\//i.test(ua) ? 'Edge' : /opr\/|opera/i.test(ua) ? 'Opera' : /samsungbrowser/i.test(ua) ? 'Samsung'
    : /firefox|fxios/i.test(ua) ? 'Firefox' : /chrome|crios/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : 'Other';
  return { device, os, browser };
}
const geoOf = (request) => {
  const cf = request.cf || {};
  return {
    country: str(cf.country, 2), region: str(cf.region, 60), city: str(cf.city, 60),
    lat: Number.isFinite(+cf.latitude) ? +cf.latitude : null, lon: Number.isFinite(+cf.longitude) ? +cf.longitude : null,
    tz: str(cf.timezone, 60), org: str(cf.asOrganization, 80),
  };
};
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return null; } };

// ---------- collecting ----------
export async function collect(request, env, ctx, cors, json) {
  if (!env.DB) return new Response(null, { status: 204, headers: cors });
  const ua = request.headers.get('User-Agent') || '';
  if (BOT.test(ua)) return new Response(null, { status: 204, headers: cors });
  if (env.LIMITER) {
    const { success } = await env.LIMITER.limit({ key: `t:${request.headers.get('CF-Connecting-IP') || 'anon'}` });
    if (!success) return json({ error: 'slow down' }, 429, cors);
  }
  let b;
  try { b = JSON.parse(await request.text()); } catch { return json({ error: 'bad request' }, 400, cors); }
  if (!b || !ID.test(b.vid || '') || !ID.test(b.sid || '')) return json({ error: 'bad request' }, 400, cors);
  const now = Date.now();
  const skew = Number.isFinite(+b.now) ? now - +b.now : 0;   // (the visitor's clock, put right)
  const evs = (Array.isArray(b.events) ? b.events : []).slice(0, 40)
    .filter((e) => e && TYPES.has(e.t))
    .map((e) => ({
      ts: Math.min(now, Math.max(now - 864e5, Math.round((+e.ts || now) + skew))),
      type: e.t, route: str(e.r, 40), label: str(e.l, 300),
      value: e.v != null && e.v !== '' && Number.isFinite(+e.v) ? +e.v : null,
      data: e.d && typeof e.d === 'object' ? JSON.stringify(e.d).slice(0, 2000) : null,
    }));
  ctx.waitUntil(store(env, request, b, evs, ua, now).catch((err) => console.error('track', err)));
  return new Response(null, { status: 204, headers: cors });
}

async function store(env, request, b, evs, ua, now) {
  await schema(env);
  const g = geoOf(request), u = uaParts(ua), c = b.ctx && typeof b.ctx === 'object' ? b.ctx : {};
  const name = str(String(b.name || '').replace(/[^\p{L}\p{M}' .-]/gu, ''), 40);
  const views = evs.filter((e) => e.type === 'view').length;
  const engaged = Math.min(36e5, evs.filter((e) => e.type === 'time').reduce((s, e) => s + Math.max(0, e.value || 0), 0));
  const first = evs.length ? Math.min(...evs.map((e) => e.ts)) : now;
  const last = evs.length ? Math.max(...evs.map((e) => e.ts)) : now;
  const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => str(c[k], 60)).some(Boolean)
    ? JSON.stringify({ source: str(c.utm_source, 60), medium: str(c.utm_medium, 60), campaign: str(c.utm_campaign, 60) }) : null;
  const contact = evs.find((e) => e.type === 'contact');
  let cd = {};
  try { cd = contact ? JSON.parse(contact.data || '{}') : {}; } catch { /* */ }
  const q = [
    env.DB.prepare(`INSERT INTO visitors (vid, first_ts, last_ts, name, email, company) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      ON CONFLICT(vid) DO UPDATE SET last_ts = MAX(last_ts, ?3), name = COALESCE(?4, name), email = COALESCE(?5, email), company = COALESCE(?6, company)`)
      .bind(b.vid, first, last, name, str(cd.email, 120), str(cd.company, 120)),
    env.DB.prepare(`INSERT INTO sessions (sid, vid, first_ts, last_ts, country, region, city, lat, lon, tz, org, device, os, browser, lang, screen, referrer, utm, landing, pages, events, engaged_ms)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22)
      ON CONFLICT(sid) DO UPDATE SET last_ts = MAX(last_ts, ?4), pages = pages + ?20, events = events + ?21, engaged_ms = engaged_ms + ?22`)
      .bind(b.sid, b.vid, first, last, g.country, g.region, g.city, g.lat, g.lon, g.tz || str(c.tz, 60), g.org, u.device, u.os, u.browser,
        str(c.lang, 20), str(c.screen, 20), hostOf(c.ref) === 'raunakpatil.com' ? null : str(c.ref, 300), utm, str(c.landing, 200), views, evs.length, engaged),
    ...evs.map((e) => env.DB.prepare(`INSERT INTO events (ts, sid, vid, type, route, label, value, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(e.ts, b.sid, b.vid, e.type, e.route, e.label, e.value, e.data)),
  ];
  await env.DB.batch(q);
}

// every question put to Ronie, and his answer (called from the /chat route once it has answered)
export async function logChat(env, request, body, row) {
  if (!env.DB) return;
  const ua = request.headers.get('User-Agent') || '';
  if (BOT.test(ua)) return;
  await schema(env);
  const g = geoOf(request), now = Date.now();
  const vid = ID.test(body.vid || '') ? body.vid : null, sid = ID.test(body.sid || '') ? body.sid : null;
  const name = str(String(body.name || '').replace(/[^\p{L}\p{M}' .-]/gu, ''), 40);
  const q = [env.DB.prepare(`INSERT INTO chats (ts, sid, vid, name, mode, q, reply, model, country, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(now, sid, vid, name, row.mode || 'chat', str(row.q, 1000), str(row.reply, 2000), str(row.model, 60), g.country, g.city)];
  if (vid) {
    q.push(env.DB.prepare(`INSERT INTO visitors (vid, first_ts, last_ts, name) VALUES (?1, ?2, ?2, ?3)
      ON CONFLICT(vid) DO UPDATE SET last_ts = MAX(last_ts, ?2), name = COALESCE(?3, name)`).bind(vid, now, name));
  }
  await env.DB.batch(q);
}

// ---------- reading (the dashboard) ----------
function authorised(request, env) {
  const want = env.ADMIN_TOKEN || '';
  const got = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!want || got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}

export async function admin(request, env, ctx, cors, json, tools) {
  if (!authorised(request, env)) return json({ error: 'unauthorised' }, 401, cors);
  if (!env.DB) return json({ error: 'no database: add the D1 binding (see README, "Command centre")' }, 503, cors);
  await schema(env);
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/admin\/?/, '');
  try {
    if (request.method === 'GET' && path === 'stats') return json(await stats(env, url), 200, cors);
    if (request.method === 'GET' && path === 'visitor') return json(await visitor(env, url.searchParams.get('vid') || ''), 200, cors);
    if (request.method === 'GET' && path === 'live') return json(await live(env), 200, cors);
    if (request.method === 'POST' && path === 'insights') return json(await insights(env, url, tools), 200, cors);
    if (request.method === 'GET' && path === 'affiliates') return json(await affiliateList(env), 200, cors);
    if (request.method === 'POST' && path === 'affiliates') {
      const b = await request.json();
      const key = str(b.key, 200), url = str(b.url, 1000);
      if (!key || !/^(pick|gh|hf|ph):./.test(key)) return json({ error: 'pick a tool from the list' }, 400, cors);
      try { if (!/^https?:$/.test(new URL(url).protocol)) throw 0; } catch { return json({ error: 'the link must start with https://' }, 400, cors); }
      await env.DB.prepare(`INSERT INTO affiliates (key, name, url, cta, updated) VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(key) DO UPDATE SET name = ?2, url = ?3, cta = ?4, updated = ?5`).bind(key, str(b.name, 120), url, str(b.cta, 40), Date.now()).run();
      affMemo = null;
      return json(await affiliateList(env), 200, cors);
    }
    if (request.method === 'POST' && path === 'affiliates/delete') {
      const b = await request.json();
      await env.DB.prepare(`DELETE FROM affiliates WHERE key = ?`).bind(str(b.key, 200)).run();
      affMemo = null;
      return json(await affiliateList(env), 200, cors);
    }
    if (request.method === 'POST' && path === 'note') {
      const b = await request.json();
      if (!ID.test(b.vid || '')) return json({ error: 'bad request' }, 400, cors);
      await env.DB.prepare(`UPDATE visitors SET note = ? WHERE vid = ?`).bind(str(b.note, 500), b.vid).run();
      return json({ ok: true }, 200, cors);
    }
    if (request.method === 'POST' && path === 'forget') {   // (a visitor who asks to be forgotten)
      const b = await request.json();
      if (!ID.test(b.vid || '')) return json({ error: 'bad request' }, 400, cors);
      await env.DB.batch(['visitors', 'sessions', 'events', 'chats'].map((t) => env.DB.prepare(`DELETE FROM ${t} WHERE vid = ?`).bind(b.vid)));
      return json({ ok: true }, 200, cors);
    }
  } catch (err) {
    return json({ error: String(err && err.message || err).slice(0, 300) }, 500, cors);
  }
  return json({ error: 'not found' }, 404, cors);
}

const all = async (env, sql, ...args) => (await env.DB.prepare(sql).bind(...args).all()).results || [];
const one = async (env, sql, ...args) => (await env.DB.prepare(sql).bind(...args).first()) || {};

async function stats(env, url) {
  const days = Math.max(1, Math.min(365, +url.searchParams.get('days') || 30));
  const off = Math.max(-840, Math.min(840, Math.round(+url.searchParams.get('tz') || 0)));   // minutes east of UTC
  const now = Date.now(), from = now - days * 864e5, prev = from - days * 864e5;
  const local = `'${off >= 0 ? '+' : ''}${off} minutes'`;
  const ev = (type, extra = '', limit = 25) => all(env, `SELECT label, COUNT(*) n, COUNT(DISTINCT vid) people, MAX(ts) last ${extra} FROM events
    WHERE type = ? AND ts >= ? AND label IS NOT NULL GROUP BY label ORDER BY n DESC LIMIT ${limit}`, type, from);
  const totals = (a, b) => one(env, `SELECT
      (SELECT COUNT(DISTINCT vid) FROM sessions WHERE first_ts >= ?1 AND first_ts < ?2) visitors,
      (SELECT COUNT(*) FROM sessions WHERE first_ts >= ?1 AND first_ts < ?2) sessions,
      (SELECT COALESCE(SUM(pages), 0) FROM sessions WHERE first_ts >= ?1 AND first_ts < ?2) views,
      (SELECT COALESCE(AVG(engaged_ms), 0) FROM sessions WHERE first_ts >= ?1 AND first_ts < ?2) avg_ms,
      (SELECT COUNT(*) FROM sessions WHERE first_ts >= ?1 AND first_ts < ?2 AND pages <= 1 AND events <= 3) bounces,
      (SELECT COUNT(*) FROM visitors WHERE first_ts >= ?1 AND first_ts < ?2) new_visitors,
      (SELECT COUNT(*) FROM chats WHERE ts >= ?1 AND ts < ?2) chats,
      (SELECT COUNT(DISTINCT COALESCE(vid, sid)) FROM chats WHERE ts >= ?1 AND ts < ?2) chatters,
      (SELECT COUNT(*) FROM events WHERE type IN ('radar_search', 'radar_ask') AND ts >= ?1 AND ts < ?2) searches,
      (SELECT COUNT(*) FROM events WHERE type = 'open' AND ts >= ?1 AND ts < ?2) opens`, a, b);
  const [cur, before, daily, heat, countries, cities, refs, utm, device, os, browser, lang, orgs, routes, times,
    clicks, outbound, searches, zero, asks, toolViews, toolOpens, toolSaves, filters, news, models, opens, people, chats, sessions, liveNow, steps, scrolls] = await Promise.all([
    totals(from, now + 1), totals(prev, from),
    all(env, `SELECT date(first_ts / 1000, 'unixepoch', ${local}) d, COUNT(DISTINCT vid) visitors, COUNT(*) sessions, SUM(pages) views
      FROM sessions WHERE first_ts >= ? GROUP BY d ORDER BY d`, from),
    all(env, `SELECT CAST(strftime('%w', first_ts / 1000, 'unixepoch', ${local}) AS INTEGER) wd, CAST(strftime('%H', first_ts / 1000, 'unixepoch', ${local}) AS INTEGER) h, COUNT(*) n
      FROM sessions WHERE first_ts >= ? GROUP BY wd, h`, from),
    all(env, `SELECT country k, COUNT(DISTINCT vid) n FROM sessions WHERE first_ts >= ? AND country IS NOT NULL GROUP BY k ORDER BY n DESC LIMIT 30`, from),
    all(env, `SELECT city, region, country, AVG(lat) lat, AVG(lon) lon, COUNT(DISTINCT vid) n FROM sessions WHERE first_ts >= ? AND city IS NOT NULL
      GROUP BY city, country ORDER BY n DESC LIMIT 300`, from),
    all(env, `SELECT referrer k, COUNT(*) n FROM sessions WHERE first_ts >= ? AND referrer IS NOT NULL GROUP BY k ORDER BY n DESC LIMIT 40`, from),
    all(env, `SELECT utm k, COUNT(*) n FROM sessions WHERE first_ts >= ? AND utm IS NOT NULL GROUP BY k ORDER BY n DESC LIMIT 20`, from),
    all(env, `SELECT device k, COUNT(*) n FROM sessions WHERE first_ts >= ? GROUP BY k ORDER BY n DESC`, from),
    all(env, `SELECT os k, COUNT(*) n FROM sessions WHERE first_ts >= ? GROUP BY k ORDER BY n DESC`, from),
    all(env, `SELECT browser k, COUNT(*) n FROM sessions WHERE first_ts >= ? GROUP BY k ORDER BY n DESC`, from),
    all(env, `SELECT lang k, COUNT(*) n FROM sessions WHERE first_ts >= ? AND lang IS NOT NULL GROUP BY k ORDER BY n DESC LIMIT 12`, from),
    all(env, `SELECT org k, COUNT(DISTINCT vid) n FROM sessions WHERE first_ts >= ? AND org IS NOT NULL GROUP BY k ORDER BY n DESC LIMIT 25`, from),
    all(env, `SELECT label k, COUNT(*) n, COUNT(DISTINCT vid) people FROM events WHERE type = 'view' AND ts >= ? GROUP BY k ORDER BY n DESC LIMIT 20`, from),
    all(env, `SELECT route k, SUM(value) ms, COUNT(DISTINCT sid) sessions FROM events WHERE type = 'time' AND ts >= ? GROUP BY k ORDER BY ms DESC LIMIT 20`, from),
    all(env, `SELECT label, route, COUNT(*) n, COUNT(DISTINCT vid) people FROM events WHERE type = 'click' AND ts >= ? AND label IS NOT NULL
      GROUP BY label, route ORDER BY n DESC LIMIT 40`, from),
    ev('outbound', ', MAX(json_extract(data, \'$.href\')) href', 30),
    all(env, `SELECT label, COUNT(*) n, COUNT(DISTINCT vid) people, ROUND(AVG(value)) results, MAX(ts) last FROM events
      WHERE type = 'radar_search' AND ts >= ? AND label IS NOT NULL GROUP BY label ORDER BY n DESC LIMIT 60`, from),
    all(env, `SELECT label, COUNT(*) n, MAX(ts) last FROM events WHERE type = 'radar_search' AND ts >= ? AND value = 0 AND label IS NOT NULL
      GROUP BY label ORDER BY n DESC LIMIT 30`, from),
    all(env, `SELECT e.ts, e.label, e.data, e.vid, s.city, s.country FROM events e LEFT JOIN sessions s ON s.sid = e.sid
      WHERE e.type = 'radar_ask' AND e.ts >= ? ORDER BY e.ts DESC LIMIT 100`, from),
    ev('tool_view', ', MAX(json_extract(data, \'$.src\')) src', 40),
    ev('tool_open', ', MAX(json_extract(data, \'$.src\')) src', 40),
    all(env, `SELECT label, SUM(CASE WHEN value = 1 THEN 1 ELSE -1 END) n FROM events WHERE type = 'tool_save' AND ts >= ? AND label IS NOT NULL
      GROUP BY label HAVING n > 0 ORDER BY n DESC LIMIT 25`, from),
    ev('radar_filter', '', 40),
    ev('news_open', ', MAX(json_extract(data, \'$.source\')) source', 30),
    ev('model_open', '', 20),
    all(env, `SELECT label, json_extract(data, '$.kind') kind, COUNT(*) n, COUNT(DISTINCT vid) people, MAX(ts) last FROM events
      WHERE type = 'open' AND ts >= ? AND label IS NOT NULL GROUP BY label, kind ORDER BY n DESC LIMIT 60`, from),
    all(env, `SELECT v.vid, v.name, v.email, v.company, v.note, v.first_ts, v.last_ts,
        (SELECT COUNT(*) FROM sessions s WHERE s.vid = v.vid) visits,
        (SELECT COUNT(*) FROM chats c WHERE c.vid = v.vid) chats,
        (SELECT COALESCE(SUM(engaged_ms), 0) FROM sessions s WHERE s.vid = v.vid) ms,
        (SELECT city || ', ' || COALESCE(country, '') FROM sessions s WHERE s.vid = v.vid AND city IS NOT NULL ORDER BY last_ts DESC LIMIT 1) place,
        (SELECT org FROM sessions s WHERE s.vid = v.vid ORDER BY last_ts DESC LIMIT 1) org,
        (SELECT device || ' · ' || os FROM sessions s WHERE s.vid = v.vid ORDER BY last_ts DESC LIMIT 1) tech
      FROM visitors v WHERE v.last_ts >= ? ORDER BY (v.name IS NOT NULL OR v.email IS NOT NULL) DESC, v.last_ts DESC LIMIT 400`, from),
    all(env, `SELECT id, ts, sid, vid, name, mode, q, reply, model, country, city FROM chats WHERE ts >= ? ORDER BY ts DESC LIMIT 1500`, from),
    all(env, `SELECT s.*, v.name FROM sessions s LEFT JOIN visitors v ON v.vid = s.vid WHERE s.last_ts >= ? ORDER BY s.last_ts DESC LIMIT 150`, from),
    live(env),
    all(env, `SELECT label k, COUNT(*) n FROM events WHERE type = 'ronie_step' AND ts >= ? GROUP BY k ORDER BY n DESC LIMIT 30`, from),
    all(env, `SELECT label k, COUNT(DISTINCT sid) n FROM events WHERE type = 'scroll' AND value >= 75 AND ts >= ? GROUP BY k ORDER BY n DESC LIMIT 20`, from),
  ]);
  return {
    days, from, now, tz: off, totals: cur, previous: before, daily, heat, countries, cities, referrers: refs, utm,
    tech: { device, os, browser, lang }, orgs, routes, times, clicks, outbound,
    radar: { searches, zero, asks, toolViews, toolOpens, toolSaves, filters, news, models },
    opens, people, chats, sessions, live: liveNow, steps, scrolls,
  };
}

// ---------- affiliate links ----------
// the list for HQ, each with how often its link was followed (Radar's ↗, its card's button, or an Ask Radar answer)
async function affiliateList(env) {
  const month = Date.now() - 30 * 864e5;
  const links = await all(env, `SELECT a.key, a.name, a.url, a.cta, a.updated,
      (SELECT COUNT(*) FROM events e WHERE e.type = 'tool_open' AND json_extract(e.data, '$.key') = a.key) clicks,
      (SELECT COUNT(*) FROM events e WHERE e.type = 'tool_open' AND json_extract(e.data, '$.key') = a.key AND e.ts >= ?) clicks30,
      (SELECT COUNT(*) FROM events e WHERE e.type = 'tool_view' AND json_extract(e.data, '$.key') = a.key AND e.ts >= ?) views30
    FROM affiliates a ORDER BY a.rowid`, month, month);   // (oldest first: the order of Radar's Top list)
  return { links };
}
// what Radar reads on every visit: { links: { key: { u, cta } } }, kept a minute in memory and five in browsers
let affMemo = null;
export async function affiliatesPublic(env, cors, json) {
  const headers = { ...cors, 'Cache-Control': 'public, max-age=300' };
  if (!env.DB) return new Response('{"links":{}}', { headers: { ...headers, 'Content-Type': 'application/json' } });
  if (!affMemo || affMemo.until < Date.now()) {
    await schema(env);
    const rows = await all(env, `SELECT key, url, cta FROM affiliates ORDER BY rowid`);   // (in the order they were added: Radar's Top list follows it)
    affMemo = { until: Date.now() + 6e4, body: JSON.stringify({ links: Object.fromEntries(rows.map((r) => [r.key, { u: r.url, cta: r.cta || null }])) }) };
  }
  return new Response(affMemo.body, { headers: { ...headers, 'Content-Type': 'application/json' } });
}

async function live(env) {
  const since = Date.now() - 5 * 6e4;
  const rows = await all(env, `SELECT s.sid, s.vid, s.city, s.country, s.lat, s.lon, s.device, s.os, s.browser, s.referrer, s.last_ts, s.pages, v.name,
      (SELECT route FROM events e WHERE e.sid = s.sid AND e.type = 'view' ORDER BY e.ts DESC LIMIT 1) route
    FROM sessions s LEFT JOIN visitors v ON v.vid = s.vid WHERE s.last_ts >= ? ORDER BY s.last_ts DESC LIMIT 50`, since);
  return rows;
}

async function visitor(env, vid) {
  if (!ID.test(vid)) return { error: 'bad vid' };
  const [v, sessions, events, chats] = await Promise.all([
    one(env, `SELECT * FROM visitors WHERE vid = ?`, vid),
    all(env, `SELECT * FROM sessions WHERE vid = ? ORDER BY first_ts DESC LIMIT 100`, vid),
    all(env, `SELECT ts, sid, type, route, label, value, data FROM events WHERE vid = ? AND type != 'time' ORDER BY ts DESC LIMIT 800`, vid),
    all(env, `SELECT ts, sid, mode, q, reply, model FROM chats WHERE vid = ? ORDER BY ts DESC LIMIT 500`, vid),
  ]);
  return { visitor: v, sessions, events, chats };
}

// "What are people asking Ronie about?" — the period's questions, summed up by the same model that answers them
async function insights(env, url, tools) {
  const days = Math.max(1, Math.min(365, +url.searchParams.get('days') || 30));
  const rows = await all(env, `SELECT q, name, city, country FROM chats WHERE ts >= ? AND mode = 'chat' AND q IS NOT NULL ORDER BY ts DESC LIMIT 300`, Date.now() - days * 864e5);
  const asks = await all(env, `SELECT label FROM events WHERE type IN ('radar_ask', 'radar_search') AND ts >= ? AND label IS NOT NULL ORDER BY ts DESC LIMIT 200`, Date.now() - days * 864e5);
  if (!rows.length && !asks.length) return { text: 'Nothing to read yet: no questions in this period.' };
  const list = rows.map((r) => `- ${r.q}${r.name ? ` (${r.name}${r.city ? `, ${r.city}` : ''})` : ''}`).join('\n').slice(0, 9000);
  const radar = [...new Set(asks.map((a) => a.label))].slice(0, 120).join('; ').slice(0, 3000);
  const system = `You analyse visitor behaviour for Raunak Patil, an AI engineer, from what people typed on his portfolio website: questions to his chatbot Ronie, and searches on Radar, his AI tools directory.
Write a short briefing for Raunak in plain text (no markdown symbols except "- " bullets). Sections, each a line in capitals followed by 2 to 5 bullets:
WHO IS VISITING (recruiters, engineers, students, curious visitors; any named people or companies worth following up),
WHAT THEY ASK RONIE (the main themes, with rough counts),
WHAT THEY LOOK FOR ON RADAR,
GAPS (questions Ronie or the site can't answer well, things worth adding),
NEXT STEPS (2 or 3 concrete actions).
Be specific and brief. Don't invent anything not in the data.`;
  const text = await tools.generate(env, system, [{ role: 'user', content: `Questions to Ronie (newest first):\n${list || '(none)'}\n\nRadar searches and questions: ${radar || '(none)'}` }], { maxTokens: 700, temperature: 0.3 });
  return { text: text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\*\*?|#+ /g, '').trim() };
}
