// HQ, Raunak's command centre (hq.html): reads the site's own analytics from Ronie's worker (GET /admin/stats etc.,
// worker/src/analytics.js) with the ADMIN_TOKEN passphrase, and draws them in the site's look.
// hq.html?demo shows made-up visitors, for a look before the database is set up.
const API = 'https://ronie-chat.ronie-chat.workers.dev';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ls = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const DEMO = new URLSearchParams(location.search).has('demo');
const S = { key: ls.get('hq-key') || '', days: +ls.get('hq-days') || 30, tab: 'overview', data: null, convo: null, peopleFilter: 'all', peopleQ: '' };

// ---------- little helpers ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const short = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${Math.round(n / 1e3)}k` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : fmt(n));
const dur = (ms) => {
  const s = Math.round((ms || 0) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};
const ago = (ts) => {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const when = (ts) => new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
let regionNames = null;
try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }); } catch { /* old browser */ }
const country = (cc) => { if (!cc) return 'Unknown'; try { return regionNames ? regionNames.of(cc) : cc; } catch { return cc; } };
const flag = (cc) => (cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0))) : '·');
const place = (city, cc) => [city, cc ? country(cc) : ''].filter(Boolean).join(', ') || 'Unknown';
const hue = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 100; return h; };
const initials = (n) => String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
const avatar = (p) => (p.name ? `<span class="avatar" style="--p:${hue(p.name)}%">${esc(initials(p.name))}</span>` : '<span class="avatar anon">?</span>');
const ROUTES = { dashboard: 'Dashboard', projects: 'Projects', library: 'Library', radar: 'Radar', ronie: 'Ronie', assistant: 'Ronie' };
const routeName = (r) => ROUTES[r] || (r && r.startsWith('ai-tools') ? `SEO · ${r.replace(/^ai-tools\/?/, '/') || '/'}` : r || '—');
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u || ''; } };
const SPECTRUM = ['#ff70f3', '#e07cf8', '#b48cff', '#8fa8ff', '#5fd6e0', '#38ffb3'];

const ICON = {
  people: '<svg viewBox="0 0 16 16"><circle cx="6" cy="5.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 14c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4M11 3.2a2.4 2.4 0 0 1 0 4.6M12.4 10.2c1.2.6 1.9 1.9 2.1 3.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  eye: '<svg viewBox="0 0 16 16"><path d="M1 8s2.6-5 7-5 7 5 7 5-2.6 5-7 5-7-5-7-5Z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>',
  clock: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor"/><path d="M8 8 L11 5.5" stroke="currentColor" stroke-linecap="round"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/></svg>',
  chat: '<svg viewBox="0 0 16 16"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6a1.5 1.5 0 0 1-1.5 1.5H7l-3.5 3v-3h0A1.5 1.5 0 0 1 2 9.5Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  id: '<svg viewBox="0 0 16 16"><rect x="1.5" y="3" width="13" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="5.5" cy="7.5" r="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M9 6.5h3.5M9 9h2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  chart: '<svg viewBox="0 0 16 16"><path d="M3 13V8M6.5 13V4M10 13V7M13.5 13V2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  globe: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor"/><path d="M1.5 8h13M8 1.5c2 2.2 2 10.8 0 13M8 1.5c-2 2.2-2 10.8 0 13" fill="none" stroke="currentColor"/></svg>',
  live: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="currentColor"/><path d="M4.5 4.5a5 5 0 0 0 0 7M11.5 4.5a5 5 0 0 1 0 7M2.5 2.5a8 8 0 0 0 0 11M13.5 2.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  link: '<svg viewBox="0 0 16 16"><path d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.8 2.8 0 0 1 4 4L11 8.5M9 11.5l-1.2 1.2a2.8 2.8 0 0 1-4-4L5 7.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  device: '<svg viewBox="0 0 16 16"><rect x="1.5" y="3" width="10" height="7" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M4 13h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="11.5" y="6" width="3.5" height="7" rx=".8" fill="var(--card)" stroke="currentColor" stroke-width="1.2"/></svg>',
  grid: '<svg viewBox="0 0 16 16"><path d="M2 2h3v3H2zM6.5 2h3v3h-3zM11 2h3v3h-3zM2 6.5h3v3H2zM6.5 6.5h3v3h-3zM11 6.5h3v3h-3zM2 11h3v3H2zM6.5 11h3v3h-3zM11 11h3v3h-3z" fill="currentColor" opacity=".8"/></svg>',
  building: '<svg viewBox="0 0 16 16"><path d="M2.5 14V3.5L8 2v12M8 6h5.5v8M1.5 14h13M4.5 5.5v0M4.5 8v0M4.5 10.5v0M10.5 8.5v0M10.5 11v0" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  radar: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor"/><circle cx="8" cy="8" r="3.5" fill="none" stroke="currentColor" opacity=".6"/><path d="M8 8l4.5-4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3.5c.7 4.6 3.9 7.8 8.5 8.5-4.6.7-7.8 3.9-8.5 8.5-.7-4.6-3.9-7.8-8.5-8.5 4.6-.7 7.8-3.9 8.5-8.5Z" fill="currentColor"/></svg>',
  folder: '<svg viewBox="0 0 16 16"><path d="M1.5 4.5A1.5 1.5 0 0 1 3 3h3l1.5 1.5H13a1.5 1.5 0 0 1 1.5 1.5v5.5A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5Z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  book: '<svg viewBox="0 0 16 16"><path d="M2 3h4.5A1.5 1.5 0 0 1 8 4.5V14a1.5 1.5 0 0 0-1.5-1.5H2zM14 3H9.5A1.5 1.5 0 0 0 8 4.5V14a1.5 1.5 0 0 1 1.5-1.5H14z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  cursor: '<svg viewBox="0 0 16 16"><path d="M3 2l9.5 5-4 1.2L7 12.5Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  out: '<svg viewBox="0 0 16 16"><path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10M9 2h5v5M14 2 7.5 8.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mail: '<svg viewBox="0 0 16 16"><rect x="1.5" y="3" width="13" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m2 4 6 5 6-5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  heart: '<svg viewBox="0 0 16 16"><path d="M8 13.5S2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 7.5-6 7.5Z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
};
const card = (cls, icon, title, body, aside = '') => `<article class="card ${cls}"><div class="card-label">${ICON[icon] || ''}<span>${esc(title)}</span>${aside ? `<span class="aside">${aside}</span>` : ''}</div>${body}</article>`;
const empty = (t = 'Nothing yet in this period.') => `<p class="empty">${esc(t)}</p>`;

// a list of bars, longest first: [{ k (html), n, sub?, attrs? }]
function bars(rows, { color = 'var(--violet)', max = 10, unit = '', fmtN = fmt } = {}) {
  rows = rows.filter((r) => r && r.n > 0).slice(0, max);
  if (!rows.length) return empty();
  const top = Math.max(...rows.map((r) => r.n));
  return `<div class="bars">${rows.map((r, i) => `<div class="bar${r.attrs ? ' link' : ''}" ${r.attrs || ''} style="--w:${(r.n / top).toFixed(3)};--c:${r.c || color};animation-delay:${i * 30}ms">
    <span class="k">${r.k}${r.sub ? `<small>${r.sub}</small>` : ''}</span><span class="n">${fmtN(r.n)}${unit}</span></div>`).join('')}</div>`;
}
// shares of a whole, as one segmented bar
function split(title, rows) {
  const total = rows.reduce((s, r) => s + r.n, 0) || 1;
  const top = rows.slice(0, 5), rest = rows.slice(5).reduce((s, r) => s + r.n, 0);
  if (rest) top.push({ k: 'Other', n: rest });
  const col = (i) => (top[i].k === 'Other' ? '#444' : SPECTRUM[Math.round((i * (SPECTRUM.length - 1)) / Math.max(1, Math.min(top.length, 6) - 1))]);
  return `<div class="split"><h4>${esc(title)}</h4>
    <div class="split-bar">${top.map((r, i) => `<i style="flex:${r.n};background:${col(i)}" data-tip="${esc(r.k)}: ${Math.round((r.n / total) * 100)}%"></i>`).join('')}</div>
    <div class="split-keys">${top.map((r, i) => `<span style="--c:${col(i)}">${esc(r.k || 'Unknown')}<b>${Math.round((r.n / total) * 100)}%</b></span>`).join('')}</div></div>`;
}

// ---------- talking to the worker ----------
async function api(path, opts = {}) {
  if (DEMO) return demoApi(path, opts);
  const r = await fetch(`${API}${path}`, { ...opts, headers: { Authorization: `Bearer ${S.key}`, ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } });
  if (r.status === 401) { const e = new Error('unauthorised'); e.code = 401; throw e; }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}
const tz = () => -new Date().getTimezoneOffset();

async function load() {
  setStatus('Reading the logs…');
  $('#refresh').classList.add('spin');
  try {
    S.data = await api(`/admin/stats?days=${S.days}&tz=${tz()}`);
    setStatus(`${DEMO ? 'Demo data · ' : ''}Last ${S.days === 1 ? '24 hours' : `${S.days} days`} · updated ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
    render();
  } catch (err) {
    if (err.code === 401) { showLogin('That passphrase didn’t open it.'); return; }
    setStatus(`Couldn’t reach the worker: ${err.message}`, true);
  } finally { $('#refresh').classList.remove('spin'); }
}
function setStatus(t, bad) { const s = $('#status'); s.hidden = false; s.textContent = t; s.classList.toggle('err', !!bad); }

// ---------- login ----------
function showLogin(msg = '') {
  $('#login').hidden = false;
  $('#tabs').hidden = $('#bar-end').hidden = $('#status').hidden = true;
  $$('.view').forEach((v) => { v.hidden = true; });
  $('#login-err').innerHTML = msg ? esc(msg) : '<a href="?demo" style="color:var(--on-card-2);text-decoration:underline;text-underline-offset:3px">Preview with sample data</a>';
  setTimeout(() => $('#key').focus(), 50);
}
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  S.key = $('#key').value.trim();
  ls.set('hq-key', S.key);
  start();
});
$('#lock').addEventListener('click', () => { S.key = ''; ls.set('hq-key', null); if (DEMO) location.search = ''; else showLogin(); });
function start() {
  $('#login').hidden = true;
  $('#tabs').hidden = $('#bar-end').hidden = false;
  ls.set('rp-notrack', '1');   // (Raunak's own visits stay out of the numbers from now on, in this browser)
  route();
  load();
}

// ---------- tabs & range ----------
function route() {
  const t = location.hash.replace('#', '');
  S.tab = ['overview', 'people', 'ronie', 'radar', 'work', 'links'].includes(t) ? t : 'overview';
  $$('#tabs a').forEach((a) => a.classList.toggle('active', a.dataset.tab === S.tab));
  $$('.view').forEach((v) => { v.hidden = v.dataset.view !== S.tab; });
  moveIndicator();
  if (S.data) render();
}
function moveIndicator() {
  const a = $('#tabs a.active'), ind = $('.tabs-indicator');
  if (!a || !ind) return;
  ind.style.width = `${a.offsetWidth}px`;
  ind.style.transform = `translateX(${a.offsetLeft}px)`;
}
addEventListener('hashchange', route);
addEventListener('resize', () => { moveIndicator(); clearTimeout(S.rz); S.rz = setTimeout(() => S.data && S.tab !== 'links' && render(), 200); });   // (the form keeps what's typed: a phone's keyboard resizes the page)
document.fonts?.ready.then(moveIndicator);
$$('#range button').forEach((b) => {
  b.setAttribute('aria-pressed', String(+b.dataset.days === S.days));
  b.addEventListener('click', () => {
    S.days = +b.dataset.days; ls.set('hq-days', String(S.days));
    $$('#range button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    load();
  });
});
$('#refresh').addEventListener('click', load);

function render() {
  const v = $(`.view[data-view="${S.tab}"]`);
  v.innerHTML = VIEWS[S.tab](S.data);
  AFTER[S.tab]?.(v, S.data);
}

// ---------- tooltips (anything with data-tip) ----------
const tip = $('#tip');
function showTip(html, x, y) {
  tip.innerHTML = html; tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = `${Math.min(innerWidth - w - 8, Math.max(8, x + 14))}px`;
  tip.style.top = `${Math.max(8, y - h - 12)}px`;
}
const hideTip = () => { tip.hidden = true; };
document.addEventListener('pointermove', (e) => {
  const t = e.target.closest?.('[data-tip]');
  if (t) showTip(t.dataset.tip, e.clientX, e.clientY); else if (!e.target.closest?.('.chart, .map')) hideTip();
});

// ---------- the line chart: visitors and sessions, a day at a time ----------
function lineChart(el, days, series) {
  const W = el.clientWidth || 600, H = el.clientHeight || 220, L = 34, R = 8, T = 10, B = 24;
  const n = days.length, max = Math.max(1, ...series.flatMap((s) => s.values));
  const step = niceStep(max), top = Math.ceil(max / step) * step;
  const x = (i) => L + (n <= 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (n - 1));
  const y = (v) => T + (H - T - B) * (1 - v / top);
  const ticks = []; for (let v = 0; v <= top; v += step) ticks.push(v);
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((W - L) / 70))));
  const path = (vals) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const s0 = series[0];
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(series.map((s) => s.name).join(' and '))} per day">
    <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s0.color}" stop-opacity=".28"/><stop offset="1" stop-color="${s0.color}" stop-opacity="0"/></linearGradient>
    <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs>
    <g class="axis">${ticks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 3}" text-anchor="end">${short(v)}</text>`).join('')}
    ${days.map((d, i) => (i % every === 0 || i === n - 1) && !(i === n - 1 && n - 1 - Math.floor((n - 1) / every) * every < every / 2 && i % every) ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(dayLabel(d))}</text>` : '').join('')}</g>
    <path d="${path(s0.values)}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="url(#area)"/>
    ${series.map((s) => `<path d="${path(s.values)}" fill="none" stroke="${s.color}" stroke-width="5" opacity=".35" filter="url(#glow)"/><path d="${path(s.values)}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}
    <g class="hover" opacity="0"><line class="cross" y1="${T}" y2="${H - B}" x1="-10" x2="-10"/>
    ${series.map((s, k) => `<circle class="pt${k}" r="4" cx="-10" cy="-10" fill="${s.color}" stroke="var(--card)" stroke-width="2"/>`).join('')}</g>
  </svg>`;
  const svg = el.firstChild, cross = svg.querySelector('.cross'), hov = svg.querySelector('.hover');
  el.onpointermove = (e) => {
    const r = svg.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round(n <= 1 ? 0 : ((px - L) / (W - L - R)) * (n - 1))));
    hov.setAttribute('opacity', 1); cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
    series.forEach((s, k) => { const c = svg.querySelector(`.pt${k}`); c.setAttribute('cx', x(i)); c.setAttribute('cy', y(s.values[i])); });
    showTip(`<b>${esc(new Date(`${days[i]}T12:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }))}</b><br>${series.map((s) => `<span class="m">${esc(s.name)}</span> ${fmt(s.values[i])}`).join('<br>')}`, e.clientX, e.clientY);
  };
  el.onpointerleave = () => { hideTip(); hov.setAttribute('opacity', 0); };
}
const niceStep = (max) => { const raw = max / 4, p = 10 ** Math.floor(Math.log10(raw || 1)), m = raw / p; return Math.max(1, (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p); };
const dayLabel = (d) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
function fillDays(daily, days) {
  const out = [], by = new Map(daily.map((r) => [r.d, r]));
  const n = Math.max(days, 1);
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(Date.now() - i * 864e5), d = new Date(t - t.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    out.push(by.get(d) || { d, visitors: 0, sessions: 0, views: 0 });
  }
  return out;
}

// ---------- the dotted world map, with a glowing pin for every city ----------
let land = null;
const loadLand = () => (land ||= fetch('js/world-land.json').then((r) => r.json()).then(({ q, r }) => r.map((f) => {
  let x = f[0], y = f[1];
  const pts = [[x / q, y / q]];
  for (let i = 2; i < f.length; i += 2) { x += f[i]; y += f[i + 1]; pts.push([x / q, y / q]); }
  return pts;
})).catch(() => []));
const LAT_TOP = 78, LAT_BOT = -56;
async function drawMap(box, cities) {
  const cv = box.querySelector('canvas'), dpr = Math.min(2, devicePixelRatio || 1);
  const W = box.clientWidth, H = box.clientHeight;
  if (!W || !H) return;
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const px = (lon) => ((lon + 180) / 360) * W, py = (lat) => ((LAT_TOP - lat) / (LAT_TOP - LAT_BOT)) * H;
  const rings = await loadLand();
  // land: the coastlines filled on a tiny canvas, one pixel per dot, then each land pixel drawn as a dot
  const gap = W < 600 ? 5 : 6, cols = Math.floor(W / gap), rows = Math.floor(H / gap);
  const m = document.createElement('canvas'); m.width = Math.ceil(W); m.height = Math.ceil(H);
  const mg = m.getContext('2d', { willReadFrequently: true });
  mg.beginPath();
  for (const ring of rings) for (const off of [-360, 0, 360]) {   // (as the site's map: rings unwrapped past ±180° drawn again a world over)
    ring.forEach(([lon, lat], i) => { const X = px(lon + off), Y = py(lat); if (i) mg.lineTo(X, Y); else mg.moveTo(X, Y); });
    mg.closePath();
  }
  mg.fillStyle = '#fff'; mg.fill('evenodd');
  const mask = mg.getImageData(0, 0, m.width, m.height).data;
  g.fillStyle = '#3d3d3d';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i * gap + gap / 2, y = j * gap + gap / 2;
    if (mask[(Math.round(y) * m.width + Math.round(x)) * 4 + 3] > 90) { g.beginPath(); g.arc(x, y, 1.15, 0, 7); g.fill(); }
  }
  // the visitors: a soft glow and a bright core, bigger for more people
  const top = Math.max(1, ...cities.map((c) => c.n));
  const pins = cities.filter((c) => c.lat != null && c.lon != null).map((c) => ({ ...c, x: px(c.lon), y: py(c.lat), r: 2.4 + Math.sqrt(c.n / top) * 7 }));
  for (const p of [...pins].sort((a, b) => a.n - b.n)) {
    const t = Math.sqrt(p.n / top), col = t > .66 ? '56,255,179' : t > .33 ? '180,140,255' : '255,112,243';
    const grd = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
    grd.addColorStop(0, `rgba(${col},.55)`); grd.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = grd; g.beginPath(); g.arc(p.x, p.y, p.r * 3.2, 0, 7); g.fill();
    g.fillStyle = `rgb(${col})`; g.beginPath(); g.arc(p.x, p.y, Math.max(2, p.r * .45), 0, 7); g.fill();
  }
  box.onpointermove = (e) => {
    const r = box.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null, bd = 16;
    for (const p of pins) { const d = Math.hypot(p.x - x, p.y - y); if (d < Math.max(bd, p.r)) { bd = d; best = p; } }
    if (best) showTip(`<b>${flag(best.country)} ${esc(best.city)}</b>${best.region ? `, ${esc(best.region)}` : ''}<br><span class="m">${esc(country(best.country))} · ${fmt(best.n)} visitor${best.n === 1 ? '' : 's'}</span>`, e.clientX, e.clientY);
    else hideTip();
  };
  box.onpointerleave = hideTip;
}

// ---------- what people ask Ronie about: a rough sort by words ----------
const TOPICS = [
  ['Hiring & roles', /\b(hir(e|ing)|job|role|position|available|open to|salary|ctc|resume|cv|notice|freelanc|contract|work with|recruit|interview|relocat|visa|join)\b/i],
  ['Contact', /\b(e-?mail|contact|linkedin|reach|phone|number|meet|call|connect|get in touch)\b/i],
  ['Projects', /\b(project|built|build|app|zeul|radar|portfolio|website|github|smart glasses|case stud|demo)\b/i],
  ['Skills & stack', /\b(skill|python|rag|llm|ml|machine learning|deep learning|model|stack|tech|framework|langchain|pytorch|tensorflow|agent|evaluation|cloud|aws|azure|react)\b/i],
  ['Background', /\b(study|studied|universit|degree|msc|education|experience|years|career|background|from|nagpur|london|bengaluru|company|worked|previous)\b/i],
  ['About Ronie', /\b(ronie|robot|who are you|are you|your name|what are you|can you)\b/i],
  ['AI tools & news', /\b(tool|news|best|recommend|chatgpt|claude|gemini|openai|which ai)\b/i],
  ['Personal & fun', /\b(hobb|favou?rite|like to|music|game|fun|joke|age|old|married|girlfriend|food|movie|sport)\b/i],
];
const topicOf = (q) => (TOPICS.find(([, re]) => re.test(q)) || ['Other'])[0];

// a conversation: Ronie's messages from one visit (or one visitor, when the visit isn't known)
function conversations(chats) {
  const by = new Map();
  for (const c of [...chats].sort((a, b) => a.ts - b.ts)) {
    const k = c.sid || c.vid || `c${c.id}`;
    if (!by.has(k)) by.set(k, { key: k, vid: c.vid, msgs: [], name: null, city: c.city, country: c.country, mode: c.mode });
    const v = by.get(k);
    v.msgs.push(c);
    if (c.name) v.name = c.name;
    v.last = c.ts;
  }
  return [...by.values()].sort((a, b) => b.last - a.last);
}

// =================================== the views ===================================
const VIEWS = {};
const AFTER = {};

function kpi(icon, title, value, prev, { unit = '', fmtV = fmt, sub = '', k = .5 } = {}) {
  let delta = '';
  if (prev != null && S.days < 365) {
    if (!prev && value) delta = '<span class="delta up">new</span>';
    else if (prev) { const p = Math.round(((value - prev) / prev) * 100); delta = `<span class="delta ${p > 0 ? 'up' : p < 0 ? 'down' : ''}">${p > 0 ? '▲' : p < 0 ? '▼' : '•'} ${Math.abs(p)}%</span>`; }
  }
  return card('s2 kpi', icon, title, `<div class="kpi-num">${fmtV(value)}${unit ? `<small>${unit}</small>` : ''}</div><div class="kpi-sub">${delta}<span>${sub || (delta ? 'vs previous period' : '')}</span></div>`).replace('class="card s2 kpi"', `class="card s2 kpi" style="--k:${Math.max(.08, Math.min(1, k)).toFixed(2)}"`);
}

VIEWS.overview = (d) => {
  const t = d.totals, p = d.previous || {};
  const named = d.people.filter((x) => x.name || x.email).length;
  const avgMs = t.avg_ms || 0;
  const days = fillDays(d.daily, Math.min(S.days, 365));
  const sources = groupSources(d.referrers, d.utm);
  const live = d.live || [];
  const orgs = d.orgs.filter((o) => !/^(reliance|bharti|airtel|vodafone|jio|comcast|verizon|at&t|t-mobile|charter|cox|bsnl|act fibernet|hathway|google fiber|spectrum|bt\b|virgin|sky\b|orange|telefonica|deutsche telekom|vodafone|claro|telstra|optus|rogers|bell canada|shaw)/i.test(o.k));
  return [
    kpi('people', 'Visitors', t.visitors, p.visitors, { sub: `${fmt(t.new_visitors)} new`, k: t.visitors / Math.max(1, t.visitors, p.visitors) }),
    kpi('grid', 'Visits', t.sessions, p.sessions, { sub: `${t.sessions ? Math.round((t.bounces / t.sessions) * 100) : 0}% left at once`, k: t.sessions / Math.max(1, t.sessions, p.sessions) }),
    kpi('eye', 'Page views', t.views, p.views, { sub: `${t.sessions ? (t.views / t.sessions).toFixed(1) : 0} per visit`, k: t.views / Math.max(1, t.views, p.views) }),
    kpi('clock', 'Avg. time', avgMs, p.avg_ms, { fmtV: dur, sub: 'on the site, per visit', k: avgMs / Math.max(1, avgMs, p.avg_ms || 0) }),
    kpi('chat', 'Ronie messages', t.chats, p.chats, { sub: `from ${fmt(t.chatters)} ${t.chatters === 1 ? 'person' : 'people'}`, k: t.chats / Math.max(1, t.chats, p.chats) }),
    kpi('id', 'Known people', named, null, { sub: 'gave a name or email', k: named / Math.max(1, t.visitors) }),
    card('s8', 'chart', 'Traffic', `<div class="legend"><span><i style="background:var(--violet)"></i>Visitors</span><span><i style="background:var(--mint)"></i>Visits</span></div><div class="chart" id="traffic" style="height:240px"></div>`, `${fmt(t.visitors)} visitors`),
    card('s4', 'live', 'Live now', `<div class="live-head"><span class="pulse"></span><span class="kpi-num" id="live-n">${live.length}</span><span class="mono" style="color:var(--on-card-3);font-size:11px">on the site in the last 5 min</span></div><div class="feed" id="live-list">${liveRows(live)}</div>`),
    card('s8', 'globe', 'Where they are', `<div class="map" id="map"><canvas></canvas></div>`, `${fmt(d.cities.length)} cities · ${fmt(d.countries.length)} countries`),
    card('s4', 'globe', 'Countries', bars(d.countries.map((c) => ({ k: `${flag(c.k)} ${esc(country(c.k))}`, n: c.n })), { color: 'var(--mint)', max: 12 })),
    card('s4', 'eye', 'Sections', bars(d.routes.map((r) => {
      const tm = d.times.find((x) => x.k === r.k);
      return { k: esc(routeName(r.k)), n: r.n, sub: tm ? `${dur(tm.ms / Math.max(1, tm.sessions))} avg` : '' };
    }), { color: 'var(--violet)', max: 10 }), 'views · time per visit'),
    card('s4', 'link', 'Where they came from', bars(sources, { color: 'var(--pink)', max: 10 }), 'visits'),
    card('s4', 'device', 'Devices', d.sessions.length || d.tech.device.length
      ? split('Device', d.tech.device) + split('System', d.tech.os) + split('Browser', d.tech.browser) + split('Language', d.tech.lang.map((l) => ({ ...l, k: langName(l.k) })))
      : empty()),
    card('s6', 'clock', 'When they visit', heatmap(d.heat), 'your time zone'),
    card('s6', 'building', 'Networks', bars(orgs.map((o) => ({ k: esc(o.k), n: o.n })), { color: 'var(--amber)', max: 10 }), 'companies, universities, hosts'),
    card('s12', 'grid', 'Recent visits', sessionsTable(d.sessions.slice(0, 15)), `latest 15 · all in <a href="#people" style="text-decoration:underline">People</a>`),
  ].join('');
};
AFTER.overview = (v, d) => {
  const days = fillDays(d.daily, Math.min(S.days, 365));
  if (S.days === 1) {   // (a day: hours would be nicer, but a day-chart of two points still reads)
    lineChart($('#traffic', v), days.slice(-2).map((x) => x.d), [{ name: 'Visitors', color: '#b48cff', values: days.slice(-2).map((x) => x.visitors) }, { name: 'Visits', color: '#38ffb3', values: days.slice(-2).map((x) => x.sessions) }]);
  } else {
    lineChart($('#traffic', v), days.map((x) => x.d), [{ name: 'Visitors', color: '#b48cff', values: days.map((x) => x.visitors) }, { name: 'Visits', color: '#38ffb3', values: days.map((x) => x.sessions) }]);
  }
  drawMap($('#map', v), d.cities);
  bindRows(v);
};

function groupSources(refs, utm) {
  const by = new Map();
  const add = (k, n) => by.set(k, (by.get(k) || 0) + n);
  for (const r of refs) {
    const h = host(r.k);
    const k = /google\./.test(h) ? 'Google' : /bing\./.test(h) ? 'Bing' : /duckduckgo/.test(h) ? 'DuckDuckGo' : /linkedin|lnkd\.in/.test(h) ? 'LinkedIn'
      : /github/.test(h) ? 'GitHub' : /t\.co$|twitter|x\.com/.test(h) ? 'X / Twitter' : /reddit/.test(h) ? 'Reddit' : /facebook|fb\./.test(h) ? 'Facebook'
      : /instagram/.test(h) ? 'Instagram' : /youtube/.test(h) ? 'YouTube' : /chatgpt|openai/.test(h) ? 'ChatGPT' : /perplexity/.test(h) ? 'Perplexity' : h;
    add(k, r.n);
  }
  for (const u of utm) { try { const j = JSON.parse(u.k); add(`${j.source || '?'}${j.campaign ? ` · ${j.campaign}` : ''} (utm)`, u.n); } catch { /* */ } }
  return [...by].map(([k, n]) => ({ k: esc(k), n })).sort((a, b) => b.n - a.n);
}
const langName = (l) => { try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(l); } catch { return l; } };
function heatmap(heat) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  heat.forEach((h) => { grid[h.wd][h.h] += h.n; });
  const max = Math.max(1, ...grid.flat());
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const order = [1, 2, 3, 4, 5, 6, 0];
  return `<div class="heat"><span></span>${Array.from({ length: 24 }, (_, h) => `<span class="hh">${h % 6 === 0 ? String(h).padStart(2, '0') : ''}</span>`).join('')}
    ${order.map((wd) => `<span>${names[wd]}</span>${grid[wd].map((n, h) => `<i style="--o:${n ? (.15 + .85 * (n / max)).toFixed(2) : .05}" data-tip="<b>${names[wd]} ${String(h).padStart(2, '0')}:00</b><br><span class=m>${n} visit${n === 1 ? '' : 's'}</span>"></i>`).join('')}`).join('')}</div>`;
}
function liveRows(live) {
  if (!live.length) return empty('No one right now.');
  return live.map((s) => `<button class="row" type="button" data-vid="${esc(s.vid)}"><b>${s.name ? esc(s.name) : 'Someone'} <span style="font-weight:400;color:var(--on-card-2)">in ${flag(s.country)} ${esc(place(s.city, s.country))}</span></b><span class="m">${ago(s.last_ts)}</span>
    <span class="d">${esc(routeName(s.route))} · ${esc(s.device || '')} · ${esc(s.browser || '')}${s.referrer ? ` · from ${esc(host(s.referrer))}` : ''}</span></button>`).join('');
}
function sessionsTable(rows) {
  if (!rows.length) return empty();
  return `<div class="table-wrap"><table><thead><tr><th>Who</th><th>Where</th><th>From</th><th>Device</th><th class="n">Pages</th><th class="n">Time</th><th class="n">When</th></tr></thead><tbody>
    ${rows.map((s) => `<tr data-vid="${esc(s.vid)}"><td><div class="who">${avatar(s)}<span>${s.name ? esc(s.name) : '<span style="color:var(--on-card-3)">Anonymous</span>'}<span class="sub">${esc(routeName((s.landing || '').replace(/^\/?#?/, '').split(/[?&#]/)[0] || 'dashboard'))}</span></span></div></td>
      <td>${flag(s.country)} ${esc(place(s.city, s.country))}<span class="sub">${esc(s.org || '')}</span></td>
      <td>${s.referrer ? esc(host(s.referrer)) : '<span style="color:var(--on-card-3)">Direct</span>'}${s.utm ? `<span class="sub">${esc((() => { try { return JSON.parse(s.utm).source; } catch { return ''; } })())}</span>` : ''}</td>
      <td>${esc(s.device || '')}<span class="sub">${esc([s.os, s.browser].filter(Boolean).join(' · '))}</span></td>
      <td class="n">${fmt(s.pages)}</td><td class="n">${dur(s.engaged_ms)}</td><td class="n">${ago(s.last_ts)}</td></tr>`).join('')}</tbody></table></div>`;
}
function bindRows(v) {
  $$('[data-vid]', v).forEach((r) => r.addEventListener('click', () => r.dataset.vid && openVisitor(r.dataset.vid)));
}

// ---------- People ----------
VIEWS.people = (d) => {
  const P = d.people;
  const named = P.filter((p) => p.name).length, mailed = P.filter((p) => p.email).length, chatted = P.filter((p) => p.chats).length;
  const back = P.filter((p) => p.visits > 1).length;
  return [
    kpi('people', 'People seen', P.length, null, { sub: 'in this period' }),
    kpi('id', 'Named', named, null, { sub: 'told Ronie their name', k: named / Math.max(1, P.length) }),
    kpi('mail', 'Left an email', mailed, null, { sub: 'via Ronie’s contact form', k: mailed / Math.max(1, P.length) }),
    kpi('chat', 'Talked to Ronie', chatted, null, { sub: 'at least one message', k: chatted / Math.max(1, P.length) }),
    kpi('grid', 'Came back', back, null, { sub: 'more than one visit', k: back / Math.max(1, P.length) }),
    kpi('clock', 'Most time', Math.max(0, ...P.map((p) => p.ms)), null, { fmtV: dur, sub: 'one visitor, all visits' }),
    card('s12', 'people', 'Everyone', `<div class="filter-row">
      <input class="search" id="people-q" type="search" placeholder="Search names, places, companies, emails…" value="${esc(S.peopleQ)}">
      ${[['all', 'All'], ['named', 'Named'], ['email', 'Emailed'], ['chat', 'Chatted'], ['back', 'Returning']].map(([k, l]) => `<button class="pill" type="button" data-f="${k}" aria-pressed="${S.peopleFilter === k}">${l}</button>`).join('')}
    </div><div id="people-table">${peopleTable(P)}</div>`, 'click someone for their whole story'),
  ].join('');
};
function peopleTable(P) {
  const q = S.peopleQ.toLowerCase(), f = S.peopleFilter;
  const rows = P.filter((p) => (f === 'all' || (f === 'named' && p.name) || (f === 'email' && p.email) || (f === 'chat' && p.chats) || (f === 'back' && p.visits > 1))
    && (!q || [p.name, p.email, p.company, p.place, p.org, p.note].some((x) => x && x.toLowerCase().includes(q))));
  if (!rows.length) return empty('No one matches.');
  return `<div class="table-wrap"><table><thead><tr><th>Person</th><th>Where</th><th>Network</th><th>Device</th><th class="n">Visits</th><th class="n">Messages</th><th class="n">Time</th><th class="n">Last seen</th></tr></thead><tbody>
    ${rows.map((p) => `<tr data-vid="${esc(p.vid)}"><td><div class="who">${avatar(p)}<span>${p.name ? esc(p.name) : '<span style="color:var(--on-card-3)">Anonymous</span>'}
      <span class="sub">${[p.email && `<span class="tag mail">${esc(p.email)}</span>`, p.company && esc(p.company), p.note && `✎ ${esc(p.note.slice(0, 40))}`].filter(Boolean).join(' ')}</span></span></div></td>
      <td>${esc(p.place || 'Unknown')}</td><td>${esc(p.org || '')}</td><td>${esc(p.tech || '')}</td>
      <td class="n">${fmt(p.visits)}</td><td class="n">${p.chats ? `<span class="tag chat">${fmt(p.chats)}</span>` : '–'}</td><td class="n">${dur(p.ms)}</td><td class="n">${ago(p.last_ts)}</td></tr>`).join('')}
  </tbody></table></div>`;
}
AFTER.people = (v, d) => {
  const redraw = () => { $('#people-table', v).innerHTML = peopleTable(d.people); bindRows($('#people-table', v)); };
  $('#people-q', v).addEventListener('input', (e) => { S.peopleQ = e.target.value; redraw(); });
  $$('[data-f]', v).forEach((b) => b.addEventListener('click', () => { S.peopleFilter = b.dataset.f; $$('[data-f]', v).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); redraw(); }));
  bindRows($('#people-table', v));
};

// ---------- Ronie ----------
VIEWS.ronie = (d) => {
  const chats = d.chats.filter((c) => c.mode !== 'game');
  const games = d.chats.filter((c) => c.mode === 'game');
  const convos = conversations(d.chats);
  const talk = convos.filter((c) => c.mode !== 'game');
  const fails = chats.filter((c) => /^\[/.test(c.reply || '')).length;
  const topics = new Map();
  chats.forEach((c) => { const t = topicOf(c.q || ''); topics.set(t, (topics.get(t) || 0) + 1); });
  const firstQs = new Map();
  talk.forEach((c) => { const q = (c.msgs[0].q || '').trim().toLowerCase(); if (q) firstQs.set(q, (firstQs.get(q) || 0) + 1); });
  if (!S.convo || !convos.find((c) => c.key === S.convo)) S.convo = convos[0]?.key || null;
  return [
    kpi('chat', 'Messages', chats.length, null, { sub: `${fmt(talk.length)} conversations` }),
    kpi('people', 'People', new Set(chats.map((c) => c.vid || c.sid)).size, null, { sub: `${fmt(new Set(chats.filter((c) => c.name).map((c) => c.name)).size)} named` }),
    kpi('grid', 'Per conversation', talk.length ? chats.length / talk.length : 0, null, { fmtV: (v) => v.toFixed(1), sub: 'messages, on average' }),
    kpi('spark', '20 questions', new Set(games.map((g) => g.sid || g.vid)).size, null, { sub: `${fmt(games.length)} turns played` }),
    kpi('clock', 'Unanswered', fails, null, { sub: 'quota out or error', k: fails / Math.max(1, chats.length) }),
    kpi('id', 'Contact forms', d.people.filter((p) => p.email).length, null, { sub: 'name + email left' }),
    card('s8', 'spark', 'What people want, in short', `<p style="color:var(--on-card-2);font-size:13px;margin-bottom:14px">Ronie reads this period’s questions and Radar searches, and briefs you on who’s visiting, what they want and what to add.</p>
      <button class="go-dark" type="button" id="brief-go">${ICON.spark.replace('<svg', '<svg width="14" height="14"')} Write the briefing</button><div class="brief" id="brief" style="margin-top:16px"></div>`),
    card('s4', 'chart', 'Topics', bars([...topics].map(([k, n], i) => ({ k: esc(k), n, c: SPECTRUM[i % SPECTRUM.length] })).sort((a, b) => b.n - a.n), { max: 10 }), 'by keywords'),
    card('s4', 'chat', 'Conversations', `<div class="feed convos" id="convos">${convos.length ? convos.map((c) => `<button class="row${c.key === S.convo ? ' on' : ''}" type="button" data-convo="${esc(c.key)}">
      <b>${c.name ? esc(c.name) : 'Anonymous'} <span style="font-weight:400;color:var(--on-card-3)">${flag(c.country)} ${esc(c.city || '')}</span></b><span class="m">${ago(c.last)}</span>
      <span class="d">${c.mode === 'game' ? '<span class="tag">game</span>' : ''}<span class="tag chat">${c.msgs.length}</span>${esc(c.msgs[0].q || '')}</span></button>`).join('') : empty()}</div>`, `${fmt(convos.length)}`),
    card('s8', 'chat', 'Transcript', `<div id="transcript" class="transcript"></div>`),
    card('s6', 'search', 'Opening questions', bars([...firstQs].map(([k, n]) => ({ k: `“${esc(k)}”`, n })).sort((a, b) => b.n - a.n), { color: 'var(--violet)', max: 12 }), 'how conversations start'),
    card('s6', 'cursor', 'Ronie’s menu', bars(d.steps.map((s) => ({ k: esc(s.k), n: s.n })), { color: 'var(--mint)', max: 12 }), 'steps visitors reached'),
  ].join('');
};
AFTER.ronie = (v, d) => {
  const convos = conversations(d.chats);
  const show = () => {
    const c = convos.find((x) => x.key === S.convo);
    const box = $('#transcript', v);
    if (!c) { box.innerHTML = empty('Pick a conversation.'); return; }
    let lastT = 0;
    box.innerHTML = `<div class="t-head"><h3>${c.name ? esc(c.name) : 'Anonymous visitor'}</h3><span>${flag(c.country)} ${esc(place(c.city, c.country))}</span><span class="mono">${when(c.msgs[0].ts)}</span>
      ${c.vid ? `<button class="pill" type="button" data-vid="${esc(c.vid)}">Visitor profile →</button>` : ''}</div>`
      + c.msgs.map((m) => {
        const gapT = m.ts - lastT > 10 * 6e4 ? `<span class="msg-time">${when(m.ts)}</span>` : ''; lastT = m.ts;
        const fail = /^\[/.test(m.reply || '');
        return `${gapT}<div class="msg you">${esc(m.q || '')}</div><div class="msg ronie${fail ? ' fail' : ''}">${esc(fail ? `no answer: ${m.reply.slice(1, -1)}` : m.reply || '')}</div>`;
      }).join('');
    bindRows(box);
  };
  $$('[data-convo]', v).forEach((b) => b.addEventListener('click', () => { S.convo = b.dataset.convo; $$('[data-convo]', v).forEach((x) => x.classList.toggle('on', x === b)); show(); }));
  show();
  $('#brief-go', v).addEventListener('click', async (e) => {
    const b = e.currentTarget; b.disabled = true; b.lastChild.textContent = ' Reading…';
    try { const j = await api(`/admin/insights?days=${S.days}`, { method: 'POST', body: '{}' }); $('#brief', v).textContent = j.text || 'Nothing came back.'; }
    catch (err) { $('#brief', v).textContent = `Couldn’t write it: ${err.message}`; }
    b.disabled = false; b.lastChild.textContent = ' Write it again';
  });
};

// ---------- Radar ----------
VIEWS.radar = (d) => {
  const R = d.radar;
  const total = R.searches.reduce((s, r) => s + r.n, 0);
  const asks = R.asks.length, opens = R.toolOpens.reduce((s, r) => s + r.n, 0), flips = R.toolViews.reduce((s, r) => s + r.n, 0);
  const SRC = { pick: 'Pick', gh: 'GitHub', hf: 'HF Space', ph: 'Product Hunt' };
  const topQ = Math.max(1, ...R.searches.map((r) => r.n));
  return [
    kpi('search', 'Searches', total, null, { sub: `${fmt(R.searches.length)} different` }),
    kpi('spark', 'Ask Radar', asks, null, { sub: 'questions in plain words' }),
    kpi('eye', 'Cards flipped', flips, null, { sub: `${fmt(R.toolViews.length)} tools` }),
    kpi('out', 'Tools visited', opens, null, { sub: 'clicked through ↗' }),
    kpi('heart', 'Saved', R.toolSaves.reduce((s, r) => s + r.n, 0), null, { sub: 'still ♥ at the end' }),
    kpi('book', 'Headlines read', R.news.reduce((s, r) => s + r.n, 0), null, { sub: `${fmt(R.models.reduce((s, r) => s + r.n, 0))} models opened` }),
    card('s8', 'search', 'What they search for', R.searches.length ? `<div class="cloud">${R.searches.slice(0, 50).map((r) => `<span style="--s:${(r.n / topQ).toFixed(2)}" data-tip="<b>${esc(r.label)}</b><br><span class=m>${r.n}× · ${r.people} people · ~${r.results ?? '?'} results</span>">${esc(r.label)}<small>${r.n}</small></span>`).join('')}</div>` : empty()),
    card('s4', 'search', 'Found nothing', bars(R.zero.map((r) => ({ k: `“${esc(r.label)}”`, n: r.n })), { color: 'var(--pink)', max: 12 }), 'tools worth adding?'),
    card('s6', 'spark', 'Ask Radar: questions and picks', R.asks.length ? `<ul class="qa">${R.asks.map((a) => {
      let j = {}; try { j = JSON.parse(a.data || '{}'); } catch { /* */ }
      return `<li data-vid="${esc(a.vid)}" style="cursor:pointer"><q>${esc(a.label)}</q><span class="m">${ago(a.ts)} · ${flag(a.country)} ${esc(a.city || '')}${j.failed ? ' · helper unreachable' : ''}</span>
        ${(j.picks || []).length ? `<span class="picks">${j.picks.map((p) => `<span>${esc(p)}</span>`).join('')}</span>` : ''}</li>`;
    }).join('')}</ul>` : empty()),
    card('s6', 'eye', 'Cards flipped', bars(R.toolViews.map((r) => ({ k: esc(r.label), n: r.n, sub: SRC[r.src] || '' })), { color: 'var(--violet)', max: 14 }), 'tools people read about'),
    card('s4', 'out', 'Tools visited', bars(R.toolOpens.map((r) => ({ k: esc(r.label), n: r.n, sub: SRC[r.src] || '' })), { color: 'var(--mint)', max: 12 })),
    card('s4', 'heart', 'Saved', bars(R.toolSaves.map((r) => ({ k: esc(r.label), n: r.n })), { color: 'var(--pink)', max: 12 })),
    card('s4', 'grid', 'Filters & views', bars(R.filters.map((r) => ({ k: esc(r.label), n: r.n })), { color: 'var(--amber)', max: 12 })),
    card('s8', 'book', 'Headlines read', bars(R.news.map((r) => ({ k: esc(r.label), n: r.n, sub: esc(r.source || '') })), { color: 'var(--violet)', max: 12 })),
    card('s4', 'radar', 'Trending models opened', bars(R.models.map((r) => ({ k: esc(r.label), n: r.n })), { color: 'var(--mint)', max: 12 })),
  ].join('');
};
AFTER.radar = (v) => bindRows(v);

// ---------- Affiliates: Radar's cards that go through Raunak's affiliate links ----------
// Every tool on Radar has a key (pick:Runway, gh:owner/repo, hf:owner/space, ph:slug); a link set here for a key replaces
// that tool's ↗ on Radar, and its card's back gets a button to it (with "Affiliate link" under it).
let toolList = null;
const loadTools = () => (toolList ||= Promise.all([
  fetch('data/tools.json').then((r) => r.json()).catch(() => ({ tools: [] })),
  fetch('data/catalog.json').then((r) => r.json()).catch(() => ({})),
]).then(([T, C]) => [
  ...T.tools.map((t) => ({ key: `pick:${t.n}`, name: t.n, url: t.u, src: 'Hand-picked', pop: 1e9 })),
  ...(C.ph || []).map((r) => ({ key: `ph:${r[1]}`, name: r[0], url: r[7], src: 'Product Hunt', pop: r[3] })),
  ...(C.gh || []).map((r) => ({ key: `gh:${r[1]}`, name: r[0], url: `https://github.com/${r[1]}`, src: 'GitHub', pop: r[3] })),
  ...(C.hf || []).map((r) => ({ key: `hf:${r[1]}`, name: r[0], url: `https://huggingface.co/spaces/${r[1]}`, src: 'HF Space', pop: r[3] })),
]));
const SRCNAME = { pick: 'Hand-picked', gh: 'GitHub', hf: 'HF Space', ph: 'Product Hunt' };
VIEWS.links = () => card('s12', 'link', 'Add a link', `<form class="aff-form" id="aff-form" autocomplete="off">
    <label class="aff-f aff-tool"><span>Tool on Radar</span>
      <input class="search" id="aff-q" placeholder="Start typing a tool's name, e.g. Runway" required>
      <div class="aff-menu" id="aff-menu" hidden></div></label>
    <label class="aff-f"><span>Your link</span><input class="search" id="aff-url" type="url" placeholder="https://runwayml.com/?ref=…" required></label>
    <label class="aff-f aff-cta"><span>Button text <i>(optional)</i></span><input class="search" id="aff-cta" maxlength="40" placeholder="Try Runway"></label>
    <button class="go-dark" type="submit" id="aff-save">Save</button>
    <p class="aff-pick" id="aff-pick"></p>
  </form>
  <p class="aff-help">On Radar, this tool's ↗ goes through your link, and the back of its card gets a button to it. Live for visitors within about five minutes.</p>`)
  + card('s12', 'out', 'Your links', '<div id="aff-list"><p class="empty">Loading…</p></div>', 'clicks are people following the link from Radar');
AFTER.links = async (v) => {
  let chosen = null;
  const q = $('#aff-q', v), menu = $('#aff-menu', v), pickEl = $('#aff-pick', v), list = $('#aff-list', v);
  const choose = (t) => {
    chosen = t; q.value = t.name; menu.hidden = true;
    pickEl.innerHTML = `<span class="tag">${esc(t.src)}</span> ${esc(t.name)} · now goes to <span class="mono">${esc(host(t.url))}</span>`;
    $('#aff-url', v).focus();
  };
  q.addEventListener('input', async () => {
    chosen = null; pickEl.textContent = '';
    const term = q.value.trim().toLowerCase();
    if (term.length < 2) { menu.hidden = true; return; }
    const all = await loadTools();
    const hits = all.filter((t) => t.name.toLowerCase().includes(term))
      .sort((a, b) => (b.name.toLowerCase().startsWith(term) - a.name.toLowerCase().startsWith(term)) || b.pop - a.pop).slice(0, 8);
    menu.innerHTML = hits.length ? hits.map((t, i) => `<button type="button" data-i="${i}"><b>${esc(t.name)}</b><span>${esc(t.src)} · ${esc(host(t.url))}</span></button>`).join('') : '<p class="empty">No tool by that name on Radar.</p>';
    menu.hidden = false;
    $$('button', menu).forEach((b) => b.addEventListener('click', () => choose(hits[+b.dataset.i])));
  });
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !menu.hidden) { e.preventDefault(); $('button', menu)?.click(); } if (e.key === 'Escape') menu.hidden = true; });
  document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.aff-tool')) menu.hidden = true; });

  const draw = (links) => {
    list.innerHTML = !links.length ? empty('No links yet. Add one above.') : `<div class="table-wrap"><table><thead><tr><th>Tool</th><th>Goes to</th><th>Button</th><th class="n">Clicks · 30d</th><th class="n">All time</th><th class="n">Card views · 30d</th><th></th></tr></thead><tbody>
      ${links.map((l, i) => `<tr data-i="${i}" style="cursor:default"><td><b style="font-weight:500">${esc(l.name || l.key.split(':').slice(1).join(':'))}</b><span class="sub">${esc(SRCNAME[l.key.split(':')[0]] || '')}</span></td>
        <td><a href="${esc(l.url)}" target="_blank" rel="noopener" style="text-decoration:underline;text-underline-offset:3px">${esc(host(l.url))}</a><span class="sub mono" style="word-break:break-all">${esc(l.url.length > 70 ? `${l.url.slice(0, 70)}…` : l.url)}</span></td>
        <td>${esc(l.cta || `Try ${l.name || ''}`)}</td><td class="n">${fmt(l.clicks30)}</td><td class="n">${fmt(l.clicks)}</td><td class="n">${fmt(l.views30)}</td>
        <td class="n" style="white-space:nowrap"><button class="pill" type="button" data-edit="${i}">Edit</button> <button class="pill" type="button" data-del="${i}">Remove</button></td></tr>`).join('')}
    </tbody></table></div>`;
    $$('[data-edit]', list).forEach((b) => b.addEventListener('click', () => {
      const l = links[+b.dataset.edit];
      choose({ key: l.key, name: l.name || l.key, url: l.url, src: SRCNAME[l.key.split(':')[0]] || '' });
      $('#aff-url', v).value = l.url; $('#aff-cta', v).value = l.cta || '';
      v.scrollIntoView({ behavior: 'smooth' });
    }));
    $$('[data-del]', list).forEach((b) => b.addEventListener('click', async () => {
      const l = links[+b.dataset.del];
      if (!confirm(`Remove your link for ${l.name || l.key}? Its card goes back to its own page.`)) return;
      try { draw((await api('/admin/affiliates/delete', { method: 'POST', body: JSON.stringify({ key: l.key }) })).links); } catch (err) { alert(err.message); }
    }));
  };
  $('#aff-form', v).addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!chosen) { pickEl.innerHTML = '<span style="color:var(--pink)">Pick the tool from the list as you type.</span>'; q.focus(); return; }
    const btn = $('#aff-save', v); btn.disabled = true; btn.textContent = 'Saving…';
    try {
      const j = await api('/admin/affiliates', { method: 'POST', body: JSON.stringify({ key: chosen.key, name: chosen.name, url: $('#aff-url', v).value.trim(), cta: $('#aff-cta', v).value.trim() }) });
      draw(j.links);
      pickEl.innerHTML = `<span style="color:var(--mint)">Saved.</span> ${esc(chosen.name)} now goes through your link on Radar.`;
      chosen = null; q.value = ''; $('#aff-url', v).value = ''; $('#aff-cta', v).value = '';
    } catch (err) { pickEl.innerHTML = `<span style="color:var(--pink)">${esc(err.message)}</span>`; }
    btn.disabled = false; btn.textContent = 'Save';
  });
  try { draw((await api('/admin/affiliates')).links); } catch (err) { list.innerHTML = empty(`Couldn’t load: ${err.message}`); }
};

// ---------- Work: projects, the library, clicks ----------
VIEWS.work = (d) => {
  const by = (kind) => d.opens.filter((o) => (o.kind || 'project') === kind).map((o) => ({ k: esc(o.label), n: o.n, sub: `${o.people} ${o.people === 1 ? 'person' : 'people'}` }));
  const out = d.outbound.map((o) => ({ k: esc(o.label || host(o.href)), n: o.n, sub: esc(host(o.href || '')) }));
  const social = d.outbound.filter((o) => /linkedin|github|youtube|instagram|x\.com|twitter|mailto/i.test(`${o.href} ${o.label}`)).reduce((s, o) => s + o.n, 0);
  const mail = d.clicks.filter((c) => /email|mail/i.test(c.label)).reduce((s, c) => s + c.n, 0);
  const projects = by('project'), cases = by('case study'), certs = by('certificate');
  return [
    kpi('folder', 'Projects opened', projects.reduce((s, r) => s + r.n, 0), null, { sub: `${projects.length} different` }),
    kpi('book', 'Case studies', cases.reduce((s, r) => s + r.n, 0), null, { sub: 'opened' }),
    kpi('id', 'Certificates', certs.reduce((s, r) => s + r.n, 0), null, { sub: 'opened' }),
    kpi('out', 'Left for links', d.outbound.reduce((s, o) => s + o.n, 0), null, { sub: `${fmt(social)} to profiles` }),
    kpi('mail', 'Email clicks', mail, null, { sub: 'buttons that write to you' }),
    kpi('cursor', 'Clicks', d.clicks.reduce((s, c) => s + c.n, 0), null, { sub: 'buttons & links' }),
    card('s6', 'folder', 'Projects', bars(projects, { color: 'var(--violet)', max: 14 }), 'opened, from the tunnel or the list'),
    card('s6', 'out', 'Links they followed', bars(out, { color: 'var(--mint)', max: 14 }), 'leaving the site'),
    card('s4', 'book', 'Case studies', bars(cases, { color: 'var(--pink)', max: 10 })),
    card('s4', 'id', 'Certificates', bars(certs, { color: 'var(--amber)', max: 10 })),
    card('s4', 'eye', 'Read to the end', bars(scrolls(d), { color: 'var(--violet)', max: 10, unit: '' }), 'visits scrolling 75%+'),
    card('s12', 'cursor', 'What they click', bars(d.clicks.map((c) => ({ k: esc(c.label), n: c.n, sub: esc(routeName(c.route)) })), { color: 'var(--violet)', max: 30 }), 'every button and link, by its words'),
  ].join('');
};
const scrolls = () => (S.data.scrolls || []).map((s) => ({ k: esc(routeName(s.k)), n: s.n }));

// ---------- one visitor, the whole story ----------
const KIND = {
  view: ['#6a6a6a', 'page'], click: ['#8fa8ff', 'click'], outbound: ['#38ffb3', 'link'], open: ['#b48cff', 'opened'], radar_search: ['#ff70f3', 'search'],
  radar_ask: ['#ff70f3', 'ask radar'], tool_view: ['#e07cf8', 'tool'], tool_open: ['#38ffb3', 'visited'], tool_save: ['#ff70f3', 'saved'], radar_filter: ['#ffc861', 'filter'],
  news_open: ['#5fd6e0', 'news'], model_open: ['#5fd6e0', 'model'], name: ['#38ffb3', 'name'], contact: ['#ffc861', 'contact'], game: ['#b48cff', 'game'],
  ronie_step: ['#555', 'ronie'], scroll: ['#444', 'scroll'], chat: ['#b48cff', 'ronie'],
};
function describe(e) {
  let j = {}; try { j = JSON.parse(e.data || '{}'); } catch { /* */ }
  const l = esc(e.label || '');
  switch (e.type) {
    case 'view': return `Looked at <b>${esc(routeName(e.label))}</b>`;
    case 'click': return `Clicked “${l}”`;
    case 'outbound': return `Left for <b>${l}</b> <span class="m">${esc(host(j.href))}</span>`;
    case 'open': return `Opened ${esc(j.kind || 'project')} <b>${l}</b>`;
    case 'radar_search': return `Searched Radar for “<b>${l}</b>” <span class="m">${e.value ?? '?'} results</span>`;
    case 'radar_ask': return `Asked Radar “<b>${l}</b>”${(j.picks || []).length ? ` <span class="m">→ ${esc(j.picks.join(', '))}</span>` : ''}`;
    case 'tool_view': return `Read about <b>${l}</b>`;
    case 'tool_open': return `Went to <b>${l}</b>${j.via ? ' (from Ask Radar)' : ''}`;
    case 'tool_save': return `${e.value ? 'Saved' : 'Unsaved'} <b>${l}</b>`;
    case 'radar_filter': return `Filtered Radar: ${l}`;
    case 'news_open': return `Read “${l}” <span class="m">${esc(j.source || '')}</span>`;
    case 'model_open': return `Opened model <b>${l}</b>`;
    case 'name': return `Told Ronie their name: <b>${l}</b>`;
    case 'contact': return `Wrote to you via Ronie (${esc(j.kind || l)})${j.email ? ` · <b>${esc(j.email)}</b>` : ''}${j.message ? `<br><span style="color:var(--on-card-2)">“${esc(j.message)}”</span>` : ''}`;
    case 'game': return 'Started 20 questions with Ronie';
    case 'ronie_step': return `Ronie: ${l}`;
    case 'scroll': return `Scrolled ${e.value}% of ${esc(routeName(e.label))}`;
    default: return l;
  }
}
async function openVisitor(vid) {
  const dlg = $('#drawer'), box = $('#drawer-in');
  box.innerHTML = '<p class="empty">Loading…</p>';
  if (!dlg.open) dlg.showModal();
  let j;
  try { j = await api(`/admin/visitor?vid=${encodeURIComponent(vid)}`); } catch (err) { box.innerHTML = empty(`Couldn’t load: ${err.message}`); return; }
  const v = j.visitor || {}, ss = j.sessions || [];
  const first = ss[ss.length - 1] || {}, last = ss[0] || {};
  const places = [...new Set(ss.map((s) => place(s.city, s.country)))];
  const items = [...j.events.map((e) => ({ ...e })), ...j.chats.map((c) => ({ ts: c.ts, sid: c.sid, type: 'chat', q: c.q, reply: c.reply, mode: c.mode }))].sort((a, b) => b.ts - a.ts);
  let curS = null;
  const tl = items.map((e) => {
    let head = '';
    if (e.sid !== curS) {
      curS = e.sid;
      const s = ss.find((x) => x.sid === e.sid);
      head = `<div class="tl-sess">${s ? `${when(s.first_ts)} · ${flag(s.country)} ${esc(place(s.city, s.country))} · ${esc(s.device || '')} · ${dur(s.engaged_ms)}${s.referrer ? ` · from ${esc(host(s.referrer))}` : ''}` : 'Visit'}</div>`;
    }
    const [c, k] = KIND[e.type] || ['#444', e.type];
    const body = e.type === 'chat'
      ? `${e.mode === 'game' ? 'Game: ' : ''}“<b>${esc(e.q || '')}</b>”<br><span style="color:var(--on-card-2)">Ronie: ${esc(e.reply || '')}</span>`
      : describe(e);
    return `${head}<div class="tl-item" style="--c:${c}"><span class="m">${new Date(e.ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span><span class="kind">${esc(k)}</span>${body}</div>`;
  }).join('');
  box.innerHTML = `<div class="d-top">${avatar(v)}<div><h2>${v.name ? esc(v.name) : 'Anonymous visitor'}</h2><p>${esc(places.join(' · ') || 'Unknown place')}</p></div>
      <button class="d-close" type="button" aria-label="Close">×</button></div>
    <dl class="facts">
      ${[['Email', v.email && `<a href="mailto:${esc(v.email)}" style="text-decoration:underline">${esc(v.email)}</a>`], ['Company', v.company && esc(v.company)], ['First seen', v.first_ts && `${when(v.first_ts)}`], ['Last seen', v.last_ts && ago(v.last_ts)],
        ['Visits', fmt(ss.length)], ['Time on site', dur(ss.reduce((s, x) => s + (x.engaged_ms || 0), 0))], ['Messages to Ronie', fmt(j.chats.length)],
        ['Network', esc(last.org || '')], ['Device', esc([last.device, last.os, last.browser].filter(Boolean).join(' · '))], ['Language', esc(last.lang ? langName(last.lang) : '')],
        ['Time zone', esc(last.tz || '')], ['First came from', first.referrer ? esc(host(first.referrer)) : 'Direct / unknown'], ['Landed on', esc(first.landing || '')]]
        .filter(([, x]) => x).map(([k, x]) => `<div><dt>${k}</dt><dd>${x}</dd></div>`).join('')}
    </dl>
    <textarea class="note" id="note" placeholder="Your notes on this person (only you see these)">${esc(v.note || '')}</textarea>
    <p class="d-sec">Everything they did, newest first</p>
    <div class="timeline">${tl || empty()}</div>
    <button class="danger" type="button" id="forget">Forget this visitor (deletes everything about them)</button>`;
  $('.d-close', box).addEventListener('click', () => dlg.close());
  $('#note', box).addEventListener('change', (e) => api('/admin/note', { method: 'POST', body: JSON.stringify({ vid, note: e.target.value }) }).then(() => { const p = S.data.people.find((x) => x.vid === vid); if (p) p.note = e.target.value; }).catch(() => {}));
  $('#forget', box).addEventListener('click', async () => {
    if (!confirm('Delete every record of this visitor? This can’t be undone.')) return;
    await api('/admin/forget', { method: 'POST', body: JSON.stringify({ vid }) }).catch(() => {});
    dlg.close(); load();
  });
}
$('#drawer').addEventListener('click', (e) => { if (e.target.id === 'drawer') e.target.close(); });

// ---------- live: the "now" card refreshes itself every 30 s ----------
setInterval(async () => {
  if (!S.data || S.tab !== 'overview' || document.hidden || DEMO) return;
  try {
    const live = await api('/admin/live');
    S.data.live = live;
    const n = $('#live-n'), l = $('#live-list');
    if (n) n.textContent = live.length;
    if (l) { l.innerHTML = liveRows(live); bindRows(l); }
  } catch { /* next time */ }
}, 30000);

// =================================== demo data ===================================
// Made-up visitors, so the page can be seen (and its look checked) before the database exists: hq.html?demo
function demoApi(path, opts = {}) {
  const D = (demoApi.d ||= makeDemo());
  if (path.startsWith('/admin/stats')) {
    const days = +new URLSearchParams(path.split('?')[1]).get('days') || 30;
    return Promise.resolve(D.stats(days));
  }
  if (path.startsWith('/admin/visitor')) return Promise.resolve(D.visitor(new URLSearchParams(path.split('?')[1]).get('vid')));
  if (path.startsWith('/admin/affiliates')) {
    const A = (demoApi.aff ||= [{ key: 'pick:Runway', name: 'Runway', url: 'https://runwayml.com/?via=raunak', cta: 'Try Runway free', updated: Date.now(), clicks: 41, clicks30: 17, views30: 63 }]);
    const b = opts.body ? JSON.parse(opts.body) : null;
    if (path.endsWith('/delete')) demoApi.aff = A.filter((x) => x.key !== b.key);
    else if (b) { demoApi.aff = [{ ...b, updated: Date.now(), clicks: 0, clicks30: 0, views30: 0 }, ...A.filter((x) => x.key !== b.key)]; }
    return Promise.resolve({ links: demoApi.aff });
  }
  if (path.startsWith('/admin/insights')) {
    return new Promise((r) => setTimeout(() => r({ text: `WHO IS VISITING
- Mostly recruiters and engineering managers from the UK and India; a few students curious about RAG.
- Priya Sharma (Monzo) and Daniel Okafor (DeepMind) asked about availability and left emails: worth replying today.

WHAT THEY ASK RONIE
- Hiring & availability (about 40%): notice period, relocation to London, open to contract work.
- Projects (25%): how Radar ranks tools, what the Smart Glasses do.
- Skills (20%): RAG evaluation, LLM agents in production.

WHAT THEY LOOK FOR ON RADAR
- Video generation and AI voice tools; "free AI image generator" is the top search.
- Several searches for "podcast clips" found nothing.

GAPS
- Ronie can't say your notice period or salary range.
- No case study on LLM evaluation, though it's asked about often.

NEXT STEPS
- Reply to the two people who left emails.
- Add a short "Availability" fact to data.js so Ronie can answer it.
- Add 2 or 3 podcast-to-clips tools to Radar's picks.` }), 900));
  }
  return Promise.resolve({ ok: true });
}
function makeDemo() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const wpick = (a) => { const t = a.reduce((s, x) => s + x[1], 0); let r = rnd() * t; for (const x of a) { r -= x[1]; if (r <= 0) return x[0]; } return a[0][0]; };
  const CITIES = [
    ['London', 'England', 'GB', 51.51, -0.13, 18], ['Bengaluru', 'Karnataka', 'IN', 12.97, 77.59, 16], ['Nagpur', 'Maharashtra', 'IN', 21.15, 79.09, 9], ['Mumbai', 'Maharashtra', 'IN', 19.08, 72.88, 10],
    ['Pune', 'Maharashtra', 'IN', 18.52, 73.86, 7], ['San Francisco', 'California', 'US', 37.77, -122.42, 9], ['New York', 'New York', 'US', 40.71, -74.0, 7], ['Seattle', 'Washington', 'US', 47.6, -122.33, 4],
    ['Berlin', 'Berlin', 'DE', 52.52, 13.4, 5], ['Amsterdam', 'North Holland', 'NL', 52.37, 4.9, 4], ['Dublin', 'Leinster', 'IE', 53.35, -6.26, 3], ['Manchester', 'England', 'GB', 53.48, -2.24, 5],
    ['Edinburgh', 'Scotland', 'GB', 55.95, -3.19, 3], ['Toronto', 'Ontario', 'CA', 43.65, -79.38, 4], ['Singapore', '', 'SG', 1.35, 103.82, 4], ['Dubai', 'Dubai', 'AE', 25.2, 55.27, 3],
    ['Sydney', 'New South Wales', 'AU', -33.87, 151.21, 2], ['Paris', 'Île-de-France', 'FR', 48.86, 2.35, 3], ['Hyderabad', 'Telangana', 'IN', 17.39, 78.49, 6], ['Delhi', 'Delhi', 'IN', 28.61, 77.21, 6],
    ['Tokyo', 'Tokyo', 'JP', 35.68, 139.69, 2], ['São Paulo', 'São Paulo', 'BR', -23.55, -46.63, 2], ['Lagos', 'Lagos', 'NG', 6.52, 3.38, 1], ['Zurich', 'Zurich', 'CH', 47.37, 8.54, 2],
  ];
  const ORGS = [['Reliance Jio', 6], ['BT', 4], ['Comcast', 3], ['Google LLC', 3], ['Microsoft Corporation', 3], ['University of London', 2], ['Amazon.com', 2], ['Deutsche Telekom', 2], ['Tata Consultancy Services', 2], ['Infosys', 1], ['Monzo Bank', 1], ['Imperial College London', 1], ['Bharti Airtel', 5], ['Virgin Media', 3]];
  const REFS = [[null, 30], ['https://www.linkedin.com/', 22], ['https://www.google.com/', 18], ['https://github.com/raunakpatil', 8], ['https://t.co/x', 3], ['https://www.bing.com/', 3], ['https://chatgpt.com/', 2], ['https://news.ycombinator.com/', 2], ['https://www.reddit.com/r/LocalLLaMA', 2]];
  const NAMES = ['Priya Sharma', 'Daniel Okafor', 'Sophie Turner', 'Arjun Mehta', 'Emma Clarke', 'Rahul Verma', 'Lucas Becker', 'Aisha Khan', 'Tom Hughes', 'Neha Joshi', 'Marco Rossi', 'Chen Wei', 'Olivia Brown', 'Vikram Rao', 'Hannah Smith', 'Ankit Patel'];
  const QS = [
    ['Is Raunak open to work?', 'Yes! He’s open to AI engineering roles, especially building LLM systems people can trust. Want his email?'],
    ['What is his experience with RAG?', 'Plenty: he’s built retrieval pipelines with evaluation baked in, from chunking strategy to answer grading.'],
    ['Tell me about Radar', 'Radar is his AI tools directory: thousands of tools, a hand-picked Top 50, and Ask Radar to find the right one in plain words.'],
    ['What projects has he built?', 'Radar, me (hello!), Zeul, a wallpaper app, and the Smart Glasses. Which one should I show you?'],
    ['Can he relocate to London?', 'He studied in London and is happy to work there. Best to ask him directly about the details.'],
    ['What’s his notice period?', 'I don’t know that one, I’m afraid. Drop him an email and he’ll tell you.'],
    ['Where did he study?', 'An MSc in Data Science & AI, and a BE in Electronics & Communications at GH Raisoni University in Nagpur.'],
    ['Does he know LangChain?', 'Yes, LangChain and LlamaIndex, plus plain Python when a framework gets in the way.'],
    ['Who are you?', 'I’m Ronie, Raunak’s Own Neural Intelligence Engine. I live on this site and know everything about him.'],
    ['How do I contact him?', 'His email is the fastest way. I can open a message for you.'],
    ['What are his hobbies?', 'He makes 3D art in Blender and runs a YouTube channel about eldritch lore.'],
    ['Best AI tool for video editing?', 'On Radar, Runway and Descript are his picks for that. Want me to open Radar?'],
    ['Has he worked with LLM evaluation?', 'Yes, it’s one of his favourite topics: building evals that catch hallucinations before users do.'],
  ];
  const SEARCHES = [['free ai image generator', 9, 42], ['video', 8, 310], ['voice clone', 6, 28], ['coding agent', 6, 35], ['podcast clips', 4, 0], ['claude', 5, 12], ['transcribe', 4, 22], ['music', 3, 64], ['3d model', 3, 19], ['resume', 3, 6], ['presentation slides', 2, 9], ['ocr pdf', 2, 14], ['anime', 2, 0], ['logo', 2, 11], ['rag', 3, 40]];
  const ASKS = [['turn my podcast into short clips', ['Opus Clip', 'Descript', 'Riverside']], ['I need to clone my voice for a youtube video', ['ElevenLabs', 'Play.ht']], ['help me write unit tests for a python repo', ['Cursor', 'Claude Code', 'Aider']], ['make a logo for my bakery', ['Looka', 'Ideogram', 'Canva Magic Design']], ['summarise long research papers', ['Elicit', 'SciSpace', 'NotebookLM']]];
  const TOOLS = ['ElevenLabs', 'Cursor', 'Runway', 'Claude', 'Perplexity', 'Midjourney', 'NotebookLM', 'Suno', 'Descript', 'Gamma', 'Ideogram', 'ComfyUI', 'Ollama', 'Whisper', 'Kling'];
  const PROJECTS = [['Radar: Best AI Tools', 'project', 30], ['Ronie, the robot assistant', 'project', 22], ['Smart Glasses', 'project', 18], ['Zeul — Wallpaper App', 'project', 11], ['ResRescue', 'project', 7], ['LLM evaluation at scale', 'case study', 9], ['RAG in production', 'case study', 6], ['Elements of AI', 'certificate', 3], ['Machine Learning (DRDO)', 'certificate', 4]];
  const ROUTE_W = [['dashboard', 40], ['projects', 18], ['radar', 22], ['ronie', 14], ['library', 8]];
  const now = Date.now();
  const visitors = [], sessions = [], events = [], chats = [];
  for (let v = 0; v < 260; v++) {
    const vid = `demo${v.toString(36).padStart(4, '0')}x`;
    const c = wpick(CITIES.map((x) => [x, x[5]]));
    const named = rnd() < .14 ? NAMES[v % NAMES.length] : null;
    const email = named && rnd() < .45 ? `${named.toLowerCase().replace(' ', '.')}@${pick(['gmail.com', 'monzo.com', 'deepmind.com', 'tcs.com', 'outlook.com'])}` : null;
    const org = wpick(ORGS);
    const device = wpick([['Desktop', 6], ['Mobile', 4], ['Tablet', .5]]);
    const os = device === 'Desktop' ? wpick([['Windows', 5], ['macOS', 4], ['Linux', 1]]) : wpick([['iOS', 5], ['Android', 5]]);
    const browser = wpick([['Chrome', 6], ['Safari', os === 'iOS' || os === 'macOS' ? 5 : .3], ['Edge', 1.5], ['Firefox', 1]]);
    const nVisits = rnd() < .2 ? 2 + Math.floor(rnd() * 4) : 1;
    let first = now - Math.pow(rnd(), 1.6) * 120 * 864e5;
    const vis = { vid, first_ts: first, last_ts: first, name: named, email, company: email ? email.split('@')[1].split('.')[0].replace(/^./, (x) => x.toUpperCase()) : null, note: null };
    visitors.push(vis);
    for (let s = 0; s < nVisits; s++) {
      const t0 = first + s * rnd() * 9 * 864e5;
      if (t0 > now) break;
      // (people visit in their daytime)
      const sid = `${vid}s${s}`;
      const ref = s ? null : wpick(REFS);
      const pages = 1 + Math.floor(rnd() * 5);
      const ms = Math.round((rnd() < .25 ? rnd() * 20 : 30 + rnd() * 420) * 1000);
      sessions.push({ sid, vid, first_ts: t0, last_ts: t0 + ms, country: c[2], region: c[1], city: c[0], lat: c[3] + (rnd() - .5) * .2, lon: c[4] + (rnd() - .5) * .2, tz: '', org,
        device, os, browser, lang: wpick([['en-GB', 4], ['en-US', 5], ['en-IN', 4], ['de-DE', 1], ['hi-IN', 1], ['fr-FR', .5]]), screen: '1920x1080', referrer: ref, utm: rnd() < .05 ? JSON.stringify({ source: 'cv', campaign: 'applications' }) : null,
        landing: wpick([['/', 6], ['/radar', 3], ['/ronie', 1.5], ['/ai-tools/best-ai-video-tools', 1]]), pages, events: 0, engaged_ms: ms });
      vis.last_ts = Math.max(vis.last_ts, t0 + ms);
      let t = t0;
      const ev = (type, label, value, data) => { t += 4000 + rnd() * 40000; events.push({ ts: t, sid, vid, type, route: null, label, value, data: data ? JSON.stringify(data) : null }); };
      for (let p = 0; p < pages; p++) {
        const r = wpick(ROUTE_W);
        ev('view', r);
        events.push({ ts: t + 1, sid, vid, type: 'time', route: r, label: null, value: ms / pages });
        if (r === 'projects' || (r === 'dashboard' && rnd() < .3)) { const pr = wpick(PROJECTS.filter((x) => x[1] === 'project').map((x) => [x, x[2]])); ev('open', pr[0], null, { kind: 'project' }); if (rnd() < .4) ev('outbound', 'Visit project ↗ · ' + pr[0], null, { href: 'https://github.com/raunakpatil' }); }
        if (r === 'library') { const pr = wpick(PROJECTS.filter((x) => x[1] !== 'project').map((x) => [x, x[2]])); ev('open', pr[0], null, { kind: pr[1] }); }
        if (r === 'radar') {
          if (rnd() < .6) { const q = wpick(SEARCHES.map((x) => [x, x[1]])); ev('radar_search', q[0], q[2]); }
          if (rnd() < .2) { const a = pick(ASKS); ev('radar_ask', a[0], a[1].length, { picks: a[1] }); }
          for (let k = 0; k < Math.floor(rnd() * 3); k++) ev('tool_view', pick(TOOLS), null, { src: 'pick' });
          if (rnd() < .4) ev('tool_open', pick(TOOLS), null, { src: 'pick' });
          if (rnd() < .15) ev('tool_save', pick(TOOLS), 1);
          if (rnd() < .3) ev('radar_filter', pick(['view: top', 'view: new', 'cat: video', 'price: free', 'cat: image', 'sort: rising', 'src: gh']));
          if (rnd() < .3) ev('news_open', pick(['Microsoft recorded $10 billion in revenue from OpenAI', 'Akai is embracing vibe-coded mods with an open-source MPC', 'Google expands AI Search ads globally']), null, { source: pick(['TechCrunch', 'The Verge']) });
          if (rnd() < .15) ev('model_open', pick(['LFM3-1.7B', 'MiniMax-M3.1-Flash', 'LTX-2.5', 'flux-3-image-klein']));
        }
        if (r === 'ronie') {
          ev('ronie_step', 'start');
          if (named) ev('name', named);
          const n = 1 + Math.floor(rnd() * 5);
          for (let k = 0; k < n; k++) { const qa = pick(QS); t += 20000; chats.push({ id: chats.length + 1, ts: t, sid, vid, name: named, mode: 'chat', q: qa[0], reply: rnd() < .04 ? '[quota]' : qa[1], model: 'qwen', country: c[2], city: c[0] }); }
          if (email) ev('contact', 'hire', null, { name: named, email, kind: 'A full-time role', message: 'Hi Raunak, loved Radar. We’re hiring an AI engineer for our assistant team, are you free for a chat next week?' });
          if (rnd() < .2) { ev('game', 'start'); for (let k = 0; k < 6; k++) chats.push({ id: chats.length + 1, ts: t += 8000, sid, vid, name: named, mode: 'game', q: pick(['Yes', 'No', 'Probably']), reply: pick(['Is it an animal?', 'Is it bigger than a car?', 'Is it a giraffe?']), model: 'qwen', country: c[2], city: c[0] }); }
          if (rnd() < .5) ev('ronie_step', pick(['hire', 'about', 'projects-menu', 'your-name', 'message']));
        }
        if (rnd() < .3) ev('click', pick(['Projects', 'Radar', 'Library', 'Discover →', 'Email Raunak', 'Download CV', 'Hello Stranger: talk to Ronie, my assistant', 'Show links']));
        if (rnd() < .18) ev('outbound', pick(['LinkedIn', 'GitHub', 'YouTube', 'Instagram']), null, { href: pick(['https://www.linkedin.com/in/raunakpatil', 'https://github.com/raunakpatil', 'https://youtube.com/@eldritch']) });
        if (rnd() < .3) ev('scroll', r, pick([50, 75, 100]));
      }
    }
    first = vis.first_ts;
  }
  const visitor = (vid) => ({
    visitor: visitors.find((v) => v.vid === vid) || {},
    sessions: sessions.filter((s) => s.vid === vid).sort((a, b) => b.first_ts - a.first_ts),
    events: events.filter((e) => e.vid === vid && e.type !== 'time').sort((a, b) => b.ts - a.ts),
    chats: chats.filter((c) => c.vid === vid).sort((a, b) => b.ts - a.ts),
  });
  const count = (rows, key, extra = () => ({})) => {
    const m = new Map();
    for (const r of rows) { const k = key(r); if (k == null) continue; const x = m.get(k) || { k, n: 0, people: new Set(), last: 0, ...extra(r) }; x.n++; x.people.add(r.vid); x.last = Math.max(x.last, r.ts || r.first_ts); m.set(k, x); }
    return [...m.values()].map((x) => ({ ...x, label: x.k, people: x.people.size })).sort((a, b) => b.n - a.n);
  };
  const stats = (days) => {
    const from = now - days * 864e5, prev = from - days * 864e5;
    const ss = sessions.filter((s) => s.first_ts >= from), ps = sessions.filter((s) => s.first_ts >= prev && s.first_ts < from);
    const ev = events.filter((e) => e.ts >= from), ch = chats.filter((c) => c.ts >= from);
    const tot = (S2, C2, a, b) => ({
      visitors: new Set(S2.map((s) => s.vid)).size, sessions: S2.length, views: S2.reduce((s, x) => s + x.pages, 0),
      avg_ms: S2.length ? S2.reduce((s, x) => s + x.engaged_ms, 0) / S2.length : 0, bounces: S2.filter((s) => s.pages <= 1 && s.engaged_ms < 15000).length,
      new_visitors: visitors.filter((v) => v.first_ts >= a && v.first_ts < b).length, chats: C2.filter((c) => c.mode === 'chat').length, chatters: new Set(C2.map((c) => c.vid)).size,
    });
    const day = (ts) => new Date(ts - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    const daily = count(ss, (s) => day(s.first_ts)).map((x) => ({ d: x.k, sessions: x.n, visitors: x.people, views: ss.filter((s) => day(s.first_ts) === x.k).reduce((a, s) => a + s.pages, 0) }));
    const heat = []; ss.forEach((s) => { const d = new Date(s.first_ts); heat.push({ wd: d.getDay(), h: (d.getHours() + 10 + Math.floor(rnd() * 3)) % 24, n: 1 }); });
    const by = (type) => ev.filter((e) => e.type === type);
    const evc = (type, extra) => count(by(type), (e) => e.label, extra);
    const cityRows = count(ss, (s) => `${s.city}|${s.country}`, (s) => ({ city: s.city, region: s.region, country: s.country, lat: s.lat, lon: s.lon }));
    const people = visitors.filter((v) => v.last_ts >= from).map((v) => {
      const vs = sessions.filter((s) => s.vid === v.vid);
      const l = vs[vs.length - 1];
      return { ...v, visits: vs.length, chats: chats.filter((c) => c.vid === v.vid).length, ms: vs.reduce((s, x) => s + x.engaged_ms, 0), place: `${l.city}, ${l.country}`, org: l.org, tech: `${l.device} · ${l.os}` };
    }).sort((a, b) => (!!(b.name || b.email) - !!(a.name || a.email)) || b.last_ts - a.last_ts);
    const recent = [...ss].sort((a, b) => b.last_ts - a.last_ts);
    const named = Object.fromEntries(visitors.map((v) => [v.vid, v.name]));
    return {
      days, totals: tot(ss, ch, from, now + 1), previous: tot(ps, chats.filter((c) => c.ts >= prev && c.ts < from), prev, from), daily, heat,
      countries: count(ss, (s) => s.country).map((x) => ({ k: x.k, n: x.people })),
      cities: cityRows.map((x) => ({ city: x.city, region: x.region, country: x.country, lat: x.lat, lon: x.lon, n: x.people })),
      referrers: count(ss, (s) => s.referrer), utm: count(ss, (s) => s.utm),
      tech: { device: count(ss, (s) => s.device), os: count(ss, (s) => s.os), browser: count(ss, (s) => s.browser), lang: count(ss, (s) => s.lang).slice(0, 8) },
      orgs: count(ss, (s) => s.org).map((x) => ({ k: x.k, n: x.people })),
      routes: evc('view').map((x) => ({ k: x.k, n: x.n, people: x.people })),
      times: count(ev.filter((e) => e.type === 'time'), (e) => e.route).map((x) => ({ k: x.k, ms: ev.filter((e) => e.type === 'time' && e.route === x.k).reduce((s, e) => s + e.value, 0), sessions: x.n })),
      clicks: evc('click').map((x) => ({ ...x, route: 'dashboard' })), outbound: evc('outbound', (e) => ({ href: JSON.parse(e.data).href })),
      radar: {
        searches: evc('radar_search', (e) => ({ results: e.value })), zero: evc('radar_search').filter((x) => SEARCHES.find((s) => s[0] === x.k)[2] === 0),
        asks: by('radar_ask').map((e) => ({ ...sessions.find((s) => s.sid === e.sid), ...e })).sort((a, b) => b.ts - a.ts).slice(0, 40),
        toolViews: evc('tool_view', () => ({ src: 'pick' })), toolOpens: evc('tool_open', () => ({ src: 'pick' })), toolSaves: evc('tool_save'),
        filters: evc('radar_filter'), news: evc('news_open', (e) => ({ source: JSON.parse(e.data).source })), models: evc('model_open'),
      },
      opens: count(by('open'), (e) => `${e.label}|${JSON.parse(e.data).kind}`, (e) => ({ kind: JSON.parse(e.data).kind, title: e.label })).map((x) => ({ ...x, label: x.title })),
      people, chats: [...ch].sort((a, b) => b.ts - a.ts),
      sessions: recent.slice(0, 150).map((s) => ({ ...s, name: named[s.vid] })),
      live: recent.slice(0, 3).map((s) => ({ ...s, last_ts: now - rnd() * 24e4, name: named[s.vid], route: pick(['radar', 'projects', 'ronie']) })),
      steps: evc('ronie_step').map((x) => ({ k: x.k, n: x.n })),
      scrolls: count(by('scroll').filter((e) => e.value >= 75), (e) => e.label).map((x) => ({ k: x.k, n: x.n })),
    };
  };
  return { stats, visitor };
}

// =================================== go ===================================
if (DEMO || S.key) start(); else showLogin();
