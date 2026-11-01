// Radar (raunakpatil.com/radar): what's new in AI, and the AI tools worth knowing.
//  - Latest in AI: the newest headlines and the open models trending on Hugging Face, live from Ronie's worker (/feed,
//    rebuilt every half hour — worker/src/feed.js), or the saved snapshot (data/feed.json) should that not answer.
//  - The directory: data/tools.json, picked by hand and refreshed every few weeks (icons in img/tools/, fetched by
//    scripts/tool-icons.py), then the catalogue, data/catalog.json — open-source AI projects on GitHub and apps on
//    Hugging Face Spaces, rebuilt every week by scripts/build-catalog.mjs.
// main.js loads this once the page is headed for (or opened), and calls open() each time it's shown.

const D = window.PORTFOLIO;
const V = new URL(import.meta.url).searchParams.get('v') || '';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
// (the site uses no em dashes; text from outside — headlines, makers' descriptions — has them turned into commas)
const undash = (s) => String(s ?? '').replace(/\s*\u2014\s*(?=[.,!?)])/g, '').replace(/\s*\u2014\s*/g, ', ');
const esc = (s) => undash(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MOTION = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const view = $('.view[data-view="radar"]');

const FEED_URL = (D.assistant?.chatUrl || '').replace(/\/chat$/, '/feed');
const PRICES = { free: 'Free', freemium: 'Freemium', paid: 'Paid', open: 'Open source' };
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const ago = (iso, long) => {
  const m = (Date.now() - Date.parse(iso)) / 6e4;
  if (m < 60) { const n = Math.max(1, Math.round(m)); return long ? `${n} min ago` : `${n}m`; }
  if (m < 1440) { const n = Math.round(m / 60); return long ? `${n} hour${n > 1 ? 's' : ''} ago` : `${n}h`; }
  const n = Math.round(m / 1440); return long ? (n === 1 ? 'yesterday' : `${n} days ago`) : `${n}d`;
};
const short = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}k` : String(n)).replace('.0', '');
const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/* ---------- the data ---------- */
async function getFeed() {
  // live first (a few seconds at most), then the snapshot that ships with the site
  if (FEED_URL) {
    try {
      const r = await fetch(FEED_URL, { signal: AbortSignal.timeout(6000) });
      if (r.ok) { const f = await r.json(); if (f.news?.length) return { ...f, live: true }; }
    } catch { /* falls back */ }
  }
  const r = await fetch(`data/feed.json${V ? `?v=${V}` : ''}`);
  return { ...(await r.json()), live: false };
}
const tools = fetch(`data/tools.json${V ? `?v=${V}` : ''}`).then((r) => r.json());
// the long list (data/catalog.json, scripts/build-catalog.mjs, refreshed weekly) — fetched alongside, shown when in
let startCatalog;
const catalog = new Promise((done) => { startCatalog = () => done(fetch(`data/catalog.json${V ? `?v=${V}` : ''}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)); });
const idle = (f) => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 1200 }) : setTimeout(f, 300));
const feed = getFeed().catch(() => ({ news: [], models: [], live: false }));

/* ---------- latest in AI ---------- */
const LEAD_N = 5, LEAD_MS = 8000;
let lead = [], leadAt = 0, leadI = 0, leadTimer = 0, leadPaused = false;

function showLead(i, animate = true) {
  const box = $('#tl-lead-story');
  if (!box || !lead.length) return;
  leadI = (i + lead.length) % lead.length;
  const n = lead[leadI];
  const html = `<a class="tl-lead-link" href="${esc(n.link)}" target="_blank" rel="noopener">
      <span class="tl-kicker">${esc(n.source)}${n.topic ? ` <i>·</i> ${esc(n.topic)}` : ''}</span>
      <h2>${esc(n.title)}</h2>
      <span class="tl-lead-foot"><span>${esc(ago(n.date, true))}</span><span class="tl-read">Read the story <b>↗</b></span></span>
    </a>`;
  picture(n.image);
  if (animate && MOTION) {
    box.classList.add('out');
    setTimeout(() => { box.innerHTML = html; box.classList.remove('out'); }, 260);
  } else box.innerHTML = html;
  $$('#tl-lead-bars button').forEach((b, k) => {
    b.firstChild.style.transform = '';
    b.classList.toggle('done', k < leadI);
    b.classList.toggle('on', k === leadI);
    b.setAttribute('aria-current', String(k === leadI));
  });
  leadAt = performance.now();
}
// the story's picture fills the card behind its words: the next one fades in over the last once it has loaded
const imgAttrs = 'alt="" referrerpolicy="no-referrer" decoding="async"';
function picture(src) {
  const box = $('#tl-lead-pic');
  if (!box) return;
  const old = [...box.children];
  const done = () => old.forEach((o) => { o.classList.remove('in'); setTimeout(() => o.remove(), 700); });
  if (!src) { done(); return; }
  const img = new Image();
  img.alt = ''; img.referrerPolicy = 'no-referrer'; img.decoding = 'async';
  img.onload = () => { box.appendChild(img); requestAnimationFrame(() => img.classList.add('in')); done(); };
  img.onerror = done;
  img.src = src;
}
let lastFrame = 0;
function tickLead(now) {
  leadTimer = requestAnimationFrame(tickLead);
  const dt = lastFrame ? now - lastFrame : 0;
  lastFrame = now;
  // (held while the page is away, or the pointer is on the story: its time doesn't run)
  if (view.hidden || leadPaused || document.hidden || !MOTION || lead.length < 2) { leadAt += dt; return; }
  const t = Math.min(1, (now - leadAt) / LEAD_MS);
  const bar = $('#tl-lead-bars button.on b');
  if (bar) bar.style.transform = `scaleX(${t})`;
  if (t >= 1) showLead(leadI + 1);
}

function renderNews(f) {
  const box = $('#tl-news');
  box.removeAttribute('aria-busy');
  if (!f.news.length) {
    box.innerHTML = '<p class="tl-empty">The headlines couldn\'t be fetched just now, try again in a little while.</p>';
    return;
  }

  lead = f.news.slice(0, LEAD_N);
  $('#tl-lead-bars').innerHTML = lead.map((n, k) => `<button type="button" aria-label="Story ${k + 1}: ${esc(n.title)}"><b></b></button>`).join('');
  showLead(0, false);

  const rest = f.news;   // (the list has every story, newest first — the lead card turns through its first five)
  const topics = ['All', ...new Set(rest.map((n) => n.topic).filter(Boolean))];
  const chips = $('#tl-topics');
  chips.innerHTML = topics.length > 2 ? topics.map((t) => `<button class="chip" type="button" data-topic="${esc(t)}" aria-pressed="${t === 'All'}">${esc(t)}</button>`).join('') : '';
  // every headline is in the list; the card stays its size and the list scrolls inside it. Stacked (phones, tablets)
  // nothing scrolls inside the card, where a swipe down the page would get caught: the first few sit in the page, and
  // the rest are a tap away
  let topic = 'All', more = false;
  const FEW = 6, stacked = matchMedia('(max-width: 1180px)');
  const list = $('#tl-wire-list');
  const draw = (still = 0) => {
    const items = rest.filter((n) => topic === 'All' || n.topic === topic);
    const shown = stacked.matches && !more ? items.slice(0, FEW) : items;
    list.innerHTML = shown.map((n, i) => `<li><a class="tl-row" href="${esc(n.link)}" target="_blank" rel="noopener" style="${i < still ? 'animation:none' : `animation-delay:${Math.min(i - still, 10) * 35}ms`}">
        <span class="tl-ago">${esc(ago(n.date))}</span>
        <span class="tl-thumb" data-l="${esc(n.source[0])}">${n.image ? `<img src="${esc(n.image)}" ${imgAttrs} loading="lazy" onerror="this.remove()">` : ''}</span>
        <span class="tl-h">${esc(n.title)}</span>
        <span class="tl-src">${esc(n.source)}</span>
        <span class="ar" aria-hidden="true">↗</span></a></li>`).join('') || '<li class="tl-none">No stories on that today.</li>';
    if (stacked.matches && items.length > FEW) list.insertAdjacentHTML('beforeend', `<li class="tl-wire-more"><button type="button" class="tl-pill" aria-expanded="${more}">${more ? 'Show fewer' : `Show all ${items.length} headlines`}</button></li>`);
    list.scrollTop = 0;
  };
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.tl-wire-more button');
    if (!b) return;
    more = !more;
    if (more) { draw(FEW); return; }
    // (folding them away keeps the button under the finger, rather than leaving the reader further down the page)
    const y = b.getBoundingClientRect().top;
    draw(FEW);
    const nb = $('.tl-wire-more button', list);
    if (nb) scrollBy(0, nb.getBoundingClientRect().top - y);
  });
  stacked.addEventListener('change', () => draw());
  chips.onclick = (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    topic = b.dataset.topic;
    more = false;
    $$('.chip', chips).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    draw();
  };
  draw();

  const strip = $('#tl-models');
  if (!f.models?.length) { strip.closest('.tl-models').hidden = true; return; }
  // each model its own colour, sweeping the skill matrix's spectrum along the strip
  const count = f.models.length;
  const tile = (m, i, copy) => `<a class="tl-model" href="${esc(m.link)}" target="_blank" rel="noopener"${copy ? ' aria-hidden="true" tabindex="-1"' : ''} draggable="false" style="--h:${Math.round((((75 - i * (330 / count)) % 360) + 360) % 360)}">
      <span class="tl-model-top"><span>${esc(m.maker)}</span><span class="tl-rank">${String(i + 1).padStart(2, '0')}</span></span>
      <span class="tl-model-name">${esc(m.name)}</span>
      <span class="tl-model-bot"><span class="tl-task">${esc(m.task)}</span><span class="tl-stats"><span title="Likes">♥ ${short(m.likes)}</span><span title="Downloads last month">↓ ${short(m.downloads)}</span></span></span>
    </a>`;
  // one row that drifts along by itself — twice over, so it runs on without a seam — and can be swiped or dragged
  strip.innerHTML = f.models.map((m, i) => tile(m, i)).join('') + (MOTION ? f.models.map((m, i) => tile(m, i, true)).join('') : '');
  if (MOTION) drift(strip);
}

// the trending strip's drift: ~30 px a second, held while the pointer is on it (or a finger, or the keyboard), and for
// a moment after someone has scrolled it themselves; a drag with the mouse scrolls it too
function drift(strip) {
  let pos = 0, last = 0, hold = 0, over = false, drag = null, moved = false;
  const half = () => strip.scrollWidth / 2;
  const step = (now) => {
    requestAnimationFrame(step);
    const dt = Math.min(64, last ? now - last : 0);
    last = now;
    if (view.hidden || document.hidden || over || drag || now < hold) { pos = strip.scrollLeft; return; }
    pos += dt * 0.03;
    if (pos >= half()) pos -= half();
    strip.scrollLeft = pos;
  };
  requestAnimationFrame(step);
  const rest = (ms = 2500) => { hold = performance.now() + ms; };
  strip.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') over = true; });
  strip.addEventListener('pointerleave', () => { over = false; rest(600); });
  strip.addEventListener('touchstart', () => rest(4000), { passive: true });
  strip.addEventListener('wheel', () => rest(), { passive: true });
  strip.addEventListener('focusin', () => { over = true; });
  strip.addEventListener('focusout', () => { over = false; });
  // (a manual scroll past the copy's start jumps back by one set, so it never runs out)
  strip.addEventListener('scroll', () => {
    if (strip.scrollLeft >= half() + 1) strip.scrollLeft -= half();
    else if (strip.scrollLeft <= 0 && (drag || performance.now() < hold)) strip.scrollLeft += half();
  }, { passive: true });
  strip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button) return;
    drag = { x: e.clientX, left: strip.scrollLeft };
    moved = false;
  });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) { moved = true; strip.classList.add('dragging'); }
    strip.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', () => { if (drag) { drag = null; strip.classList.remove('dragging'); rest(1500); } });
  // a drag isn't a click on the tile it ended over
  strip.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
}

/* ---------- the directory ---------- */
// three sources in one list: Raunak's hand-picked tools first, then the catalogue — open-source projects on GitHub
// and apps on Hugging Face Spaces, taken in turns by how popular each is in its own place
const GH_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>';
const SOURCES = {
  all: ['Everything', ''],
  star: ["Raunak's picks", '<span class="tl-star" aria-hidden="true">★</span>'],
  saved: ['Saved', '<span class="tl-saved" aria-hidden="true">♥</span>'],
  pick: ['Hand-picked', ''],
  gh: ['GitHub', GH_SVG],
  hf: ['Hugging Face', '<span aria-hidden="true">🤗</span>'],
  ph: ['Product Hunt', '<span class="tl-ph" aria-hidden="true">P</span>'],
};
// each category's own ranked page, and what it's called there (scripts/build-seo-pages.mjs)
const LIST_PAGES = {
  chat: ['best-ai-chatbots', 'AI chatbots'], research: ['best-ai-research-tools', 'AI research tools'], code: ['best-ai-coding-tools', 'AI coding tools'],
  agents: ['best-ai-agents', 'AI agents'], image: ['best-ai-image-generators', 'AI image tools'], video: ['best-ai-video-tools', 'AI video tools'],
  voice: ['best-ai-voice-tools', 'AI voice tools'], music: ['best-ai-music-generators', 'AI music tools'], writing: ['best-ai-writing-tools', 'AI writing tools'],
  work: ['best-ai-productivity-tools', 'AI productivity tools'], design: ['best-ai-design-tools', 'AI design tools'], build: ['best-ai-developer-tools', 'AI developer tools'],
};
const SORTS = { picks: 'Featured', rising: 'Rising', az: 'A–Z', new: 'Newest' };
// Radar's mark (also in index.html, on the Ask button)
const MARK = '<svg class="tl-mark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle class="in" cx="12" cy="12" r="4.6"/><path class="sweep" d="M12 12 18.4 5.6"/><circle class="blip" cx="15.6" cy="15.2" r="1.4"/></svg>';
const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg>';
const GRAD = { red: '#fda4af', yellow: '#fde68a', green: '#86efac', blue: '#93c5fd', indigo: '#a5b4fc', purple: '#d8b4fe', pink: '#f9a8d4', gray: '#e5e7eb' };
const fmt = (n) => n.toLocaleString('en-US');
// (a Space's icon is sometimes several emoji: just the first)
const GRAPHEMES = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;
const firstGlyph = (e) => (GRAPHEMES ? GRAPHEMES.segment(e)[Symbol.iterator]().next().value?.segment : [...e][0]) || '🤗';
const CHEVRON = '<svg class="tl-dd-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg>';

// a small menu that drops from a pill: its options (with counts) are drawn each time it opens
function dropdown(host, { key, label, options, value, onPick }) {
  const box = document.createElement('div');
  box.className = 'tl-dd';
  box.innerHTML = `<button type="button" class="tl-dd-btn" aria-haspopup="listbox" aria-expanded="false"><span class="k">${label}</span><span class="v"></span>${CHEVRON}</button><div class="tl-dd-menu" role="listbox" aria-label="${label}"></div>`;
  host.appendChild(box);
  const btn = box.firstChild, menu = box.lastChild;
  const opts = () => menu.querySelectorAll('[role="option"]:not(:disabled)');
  const close = (focus) => {
    if (!box.classList.contains('open')) return;
    box.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    if (focus) btn.focus();
  };
  const open = () => {
    document.dispatchEvent(new CustomEvent('tl-dd-open', { detail: box }));
    menu.innerHTML = options().map(([v, text, n, pre = '']) => `<button type="button" role="option" data-v="${esc(v)}" aria-selected="${v === value()}"${n === 0 && v !== value() ? ' disabled' : ''}>${pre}<span class="t">${text}</span>${n == null ? '' : `<span class="n">${fmt(n)}</span>`}</button>`).join('');
    box.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    // (kept inside the window: it opens leftwards when there's no room on the right)
    menu.classList.toggle('left', btn.getBoundingClientRect().left + 260 > innerWidth);
    (menu.querySelector('[aria-selected="true"]') || opts()[0])?.focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => (box.classList.contains('open') ? close() : open()));
  menu.addEventListener('click', (e) => { const o = e.target.closest('[role="option"]'); if (o && !o.disabled) { onPick(o.dataset.v); close(true); } });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(true); return; }
    if (!/^Arrow(Up|Down)$/.test(e.key)) return;
    e.preventDefault();
    if (!box.classList.contains('open')) { open(); return; }
    const list = [...opts()], i = list.indexOf(document.activeElement);
    list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
  });
  document.addEventListener('tl-dd-open', (e) => { if (e.detail !== box) close(); });
  document.addEventListener('pointerdown', (e) => { if (!box.contains(e.target)) close(); });
  box.addEventListener('focusout', (e) => { if (!box.contains(e.relatedTarget) && e.relatedTarget) close(); });
  return {
    // the pill shows what's chosen, and turns dark while it narrows the list
    update(text, on) { box.querySelector('.v').innerHTML = text; box.classList.toggle('set', on); },
  };
}

function renderDirectory(T, catalogP) {
  const S = { view: 'all', q: '', src: 'all', price: 'all', cat: 'all', sort: 'picks', limit: 24 };
  const NEW_DAYS = 90;
  const STEP = 48;
  const grid = $('#tl-grid'), more = $('#tl-more'), count = $('#tl-count'), search = $('#tl-search'), clear = $('#tl-clear');
  // the search box says how to use it: search the directory, or describe a need and ask Radar — the longest wording
  // that fits the box as it is
  const hint = () => {
    const w = search.clientWidth, n = fmt(all.length);
    search.placeholder = w >= 560 ? `Search ${n} AI tools, or ask Radar, e.g. “turn my podcast into short clips”`
      : w >= 340 ? `Search ${n} AI tools, or ask Radar what you need` : `Search ${n} tools, or ask Radar`;
  };
  if (window.ResizeObserver) new ResizeObserver(hint).observe(search);
  const keyOf = (t) => `${t.n} ${t.d} ${T.categories[t.c]} ${PRICES[t.p] || ''} ${t.uses || ''} ${t.by || ''}`.toLowerCase();

  const curated = T.tools.map((t, i) => ({ ...t, src: 'pick', i }));
  let rising = new Set();
  // saved tools: kept in this browser only
  const SAVE_KEY = 'radar-saved';
  const saved = new Set((() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch { return []; } })());
  const keepSaved = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify([...saved])); } catch { /* private window: this visit only */ } };
  let all = curated.map((t) => ({ ...t, key: keyOf(t) }));

  // the catalogue joins when it arrives (it's the bigger file); anything already hand-picked isn't listed twice
  catalogP.then((C) => {
    if (!C) return;
    // (the catalogue is already one of each — scripts/build-catalog.mjs — but a name or link seen once is never shown twice)
    const norm = (x) => x.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const known = new Set(curated.flatMap((t) => [norm(t.n), t.u.replace(/\/$/, '').toLowerCase()]));
    const take = (list, make) => list.map(make).filter((t) => {
      const k = norm(t.n), u = t.u.toLowerCase();
      if (known.has(k) || known.has(u)) return false;
      known.add(k); known.add(u);
      return true;
    });
    const gh = take(C.gh || [], ([n, full, d, stars, c, oid, rel, rise]) => ({ n, u: `https://github.com/${full}`, d, c, p: 'open', src: 'gh', pop: stars, oid, by: full.split('/')[0], rel, rise }));
    const hf = take(C.hf || [], ([n, id, d, likes, c, emoji, from, to, rel, rise]) => ({ n, u: `https://huggingface.co/spaces/${id}`, d, c, p: 'free', src: 'hf', pop: likes, emoji, from, to, by: id.split('/')[0], rel, rise }));
    // in turns: the nth-most-popular GitHub project sits by the nth-most-liked Space
    gh.forEach((t, k) => { t.rank = k / gh.length; });
    // (Product Hunt's price label, where it gives one: otherwise "price on site")
    const ph = take(C.ph || [], ([n, slug, d, votes, c, thumb, p, link, rel, rise]) => ({ n, u: link, d, c, p: p || 'na', src: 'ph', pop: votes, thumb, slug, by: 'Product Hunt', rel, rise }));
    hf.forEach((t, k) => { t.rank = (k + 0.5) / hf.length; });
    ph.forEach((t, k) => { t.rank = (k + 0.25) / ph.length; });
    // rising: in turns again, the fastest-climbing of each place first (its stars, likes or upvotes gained a day)
    for (const list of [gh, hf, ph]) [...list].sort((a, b) => (b.rise || 0) - (a.rise || 0)).forEach((t, k, arr) => { t.riseRank = (k + 0.5) / arr.length; });
    const extra = [...gh, ...hf, ...ph].sort((a, b) => a.rank - b.rank).map((t, k) => ({ ...t, i: curated.length + k }));
    rising = new Set(extra.filter((t) => t.rise > 0).sort((a, b) => a.riseRank - b.riseRank).slice(0, 24).map((t) => t.i));
    all = [...all, ...extra.map((t) => ({ ...t, key: keyOf(t) }))];
    rankAll();
    learn();
    hint();
    drawViews();
    draw();
  });

  const inSrc = (t, s) => s === 'all' || (s === 'star' ? t.pick : s === 'saved' ? saved.has(keyFor(t)) : t.src === s);
  // misspellings: every word in the directory's names and descriptions is known (with how often it's used), and a
  // word that isn't one of them is read as the nearest that is — "trancribe audeo" searches for "transcribe audio"
  let vocab = new Map(), byLen = new Map(), effQ = '';
  const learn = () => {
    vocab = new Map();
    for (const t of all) for (const w of t.key.split(/[^a-z0-9]+/)) if (w.length > 2) vocab.set(w, (vocab.get(w) || 0) + 1);
    byLen = new Map();
    for (const w of vocab.keys()) { if (!byLen.has(w.length)) byLen.set(w.length, []); byLen.get(w.length).push(w); }
  };
  const near = (a, b, max) => {   // (edit distance, with swapped letters as one step; gives up past max)
    let prev2 = null, prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let low = i;
      for (let j = 1; j <= b.length; j++) {
        let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur.push(v);
        if (v < low) low = v;
      }
      if (low > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[b.length];
  };
  const fixWord = (w) => {
    if (w.length < 4 || /\d/.test(w) || vocab.has(w) || STOP.has(w)) return w;
    const max = w.length <= 5 ? 1 : w.length <= 9 ? 2 : 3;
    let best = w, bestD = max + 1, bestN = 0;
    for (let L = w.length - max; L <= w.length + max; L++) {
      for (const v of byLen.get(L) || []) {
        const d = near(w, v, Math.min(max, bestD));
        const n = vocab.get(v);
        if (d < bestD || (d === bestD && n > bestN)) { best = v; bestD = d; bestN = n; }
      }
    }
    return bestD <= max ? best : w;
  };
  const fixQ = (q) => q.split(/\s+/).map(fixWord).join(' ');
  const matches = (t, skip) => (skip === 'q' || !effQ || effQ.split(/\s+/).every((w) => t.key.includes(w)))
    && (skip === 'src' || inSrc(t, S.src))
    && (skip === 'price' || S.price === 'all' || t.p === S.price)
    && (skip === 'cat' || S.cat === 'all' || t.c === S.cat);
  // the three ways in: Raunak's top 50, everything, or what's newly released (in the last NEW_DAYS days)
  // (new releases: released — the project or Space created, the product launched — in the last NEW_DAYS days)
  // (and only real launches: a proper description, a GitHub project that's about AI, a Space people have liked)
  const AI_WORDS = /\b(ai|llms?|gpt[\w.-]*|agents?|agentic|models?|neural|ml|machine learning|deep learning|diffusion|transformers?|rag|embeddings?|chatbots?|vision|speech|tts|asr|stt|generative|prompts?|copilot|openai|anthropic|claude|gemini|llama|mistral|qwen|deepseek|ollama|langchain|inference|nlp|mcp|ocr|text-to-\w+|image-to-\w+|voice|lora|fine-?tun\w*|multimodal|reasoning|semantic)\b/i;
  const isFresh = (t) => t.rel && Date.now() - Date.parse(t.rel) < NEW_DAYS * 864e5 && (t.d || '').length >= 24
    && (t.src === 'gh' ? AI_WORDS.test(`${t.n} ${t.d}`) : t.src === 'hf' ? t.pop >= 50 : t.src !== 'pick');
  // The Top list: the first four picks stay where they are (ChatGPT, Claude, Gemini, Grok), then the tools Raunak has his
  // own link for, in the order he added them in HQ, then the rest of his picks — still as many as he picked
  const TOP_HEAD = 4;
  const topList = () => {
    const picks = all.filter((t) => t.pick).sort((a, b) => a.i - b.i);
    const keys = Object.keys(AFF);
    if (!keys.length) return picks;
    const byKey = new Map(all.map((t) => [keyFor(t), t]));
    const head = picks.slice(0, TOP_HEAD);
    const own = keys.map((k) => byKey.get(k)).filter((t) => t && !head.includes(t));
    return [...head, ...own, ...picks.filter((t) => !head.includes(t) && !own.includes(t))].slice(0, Math.max(picks.length, TOP_HEAD + own.length));
  };
  const pool = () => (S.view === 'top' ? topList() : S.view === 'new' ? all.filter(isFresh) : all);
  const tally = (skip, test) => pool().reduce((n, t) => n + (matches(t, skip) && test(t) ? 1 : 0), 0);
  const views = $('#tl-views');
  const drawViews = () => {
    const n = { top: all.filter((t) => t.pick).length, all: all.length, new: all.filter(isFresh).length };
    $('[data-v="top"] .tl-view-t', views).textContent = `Top ${n.top} AI tools`;
    $('[data-v="all"] small', views).textContent = `Search all ${fmt(n.all)} in the directory`;
    $('[data-v="new"] small', views).textContent = n.new ? `${fmt(n.new)} released in the last ${NEW_DAYS} days` : 'The latest releases';
  };
  views.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b || b.dataset.v === S.view) return;
    $$('[data-v]', views).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    S.view = b.dataset.v;
    $('.tl-bar').classList.toggle('top', S.view === 'top');
    $('.tl-bar').classList.toggle('new', S.view === 'new');
    set('view', S.view);
  });

  const bar = $('#tl-dds');
  const dd = {
    src: dropdown(bar, {
      key: 'src', label: 'Source', value: () => S.src, onPick: (v) => set('src', v),
      options: () => Object.entries(SOURCES).map(([k, [v, pre]]) => [k, v, tally('src', (t) => inSrc(t, k)), pre]),
    }),
    price: dropdown(bar, {
      key: 'price', label: 'Price', value: () => S.price, onPick: (v) => set('price', v),
      options: () => [['all', 'Any price', tally('price', () => true)], ...Object.entries(PRICES).map(([k, v]) => [k, v, tally('price', (t) => t.p === k), `<span class="tl-dot p-${k}" aria-hidden="true"></span>`])],
    }),
    cat: dropdown(bar, {
      key: 'cat', label: 'Category', value: () => S.cat, onPick: (v) => set('cat', v),
      options: () => [['all', 'All categories', tally('cat', () => true)], ...Object.entries(T.categories).map(([k, v]) => [k, esc(v), tally('cat', (t) => t.c === k)])],
    }),
    sort: dropdown(bar, {
      key: 'sort', label: 'Sort', value: () => S.sort, onPick: (v) => set('sort', v),
      options: () => Object.entries(SORTS).filter(([k]) => k !== 'new' || curated.some((t) => t.added)).map(([k, v]) => [k, v]),
    }),
  };
  const drawPills = () => {
    dd.src.update(`${SOURCES[S.src][1]}${SOURCES[S.src][0]}`, S.src !== 'all');
    dd.price.update(S.price === 'all' ? 'Any' : `<span class="tl-dot p-${S.price}" aria-hidden="true"></span>${PRICES[S.price]}`, S.price !== 'all');
    dd.cat.update(S.cat === 'all' ? 'All' : esc(T.categories[S.cat]), S.cat !== 'all');
    dd.sort.update(S.view === 'new' ? 'Newest' : SORTS[S.sort], false);
    clear.hidden = S.view === 'top' || !(S.q || S.src !== 'all' || S.price !== 'all' || S.cat !== 'all');
  };

  const icon = (t) => {
    if (t.src === 'gh') return `<span class="tool-icon" data-l="${esc(t.n[0])}"><img class="av" src="https://avatars.githubusercontent.com/u/${+t.oid}?s=64&amp;v=4" alt="" loading="lazy" width="64" height="64" onerror="this.remove()"></span>`;
    if (t.src === 'hf') return `<span class="tool-icon emo" style="--g1:${GRAD[t.from] || GRAD.gray};--g2:${GRAD[t.to] || GRAD.gray}">${esc(firstGlyph(t.emoji))}</span>`;
    if (t.src === 'ph') {
      const src = /^https:\/\//.test(t.thumb || '') ? `${t.thumb.split('?')[0]}?auto=format&fit=crop&w=96&h=96` : '';
      return `<span class="tool-icon" data-l="${esc(t.n[0])}">${src ? `<img class="av" src="${esc(src)}" alt="" loading="lazy" width="64" height="64" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}</span>`;
    }
    // (Raunak's own projects: their own artwork, edge to edge)
    return `<span class="tool-icon" data-l="${esc(t.n[0])}">${t.icon === false ? '' : `<img${t.full ? ' class="av"' : ''} src="img/tools/${slug(t.n)}.webp" alt="" loading="lazy" width="64" height="64" onerror="this.remove()">`}</span>`;
  };
  // each card has two sides. A tap anywhere on it turns it over (and back); only its ↗ goes to the tool's page.
  // The back only says what the front doesn't: what it does in plain words (written for each tool by Ronie's worker,
  // /explain, the first time anyone turns it over), how to get it, when it joined, where it ranks, what's like it.
  const GET = {
    pick: { free: 'Free on {host}', freemium: 'Free plan on {host}', paid: 'Paid plans on {host}', open: 'Free and open source' },
    gh: 'Clone it from GitHub', hf: 'Use it in the browser, nothing to install', ph: 'Plans on its own site',
  };
  const keyFor = (t) => (t.src === 'pick' ? `pick:${t.n}` : t.src === 'gh' ? `gh:${t.u.replace('https://github.com/', '')}`
    : t.src === 'hf' ? `hf:${t.u.replace('https://huggingface.co/spaces/', '')}` : `ph:${t.slug}`);
  // where a tool's links go: Raunak's own link when he has one for it, else its own page
  const affOf = (t) => { const a = AFF[keyFor(t)]; return a && /^https?:\/\//.test(a.u) ? a : null; };
  const linkOf = (t) => (affOf(t) ? affOf(t).u : t.u);
  const EX = new Map();
  const EX_URL = (D.assistant?.chatUrl || '').replace(/\/chat$/, '/explain');
  const explainOf = (t) => {
    const k = keyFor(t);
    if (!EX.has(k)) {
      EX.set(k, !EX_URL ? Promise.resolve('') : fetch(EX_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: k }), signal: AbortSignal.timeout(15000) })
        .then((r) => (r.ok ? r.json() : {})).then((j) => j.text || '').catch(() => ''));
      EX.get(k).then((x) => { if (!x) EX.delete(k); });   // (a miss can be tried again later)
    }
    return EX.get(k);
  };
  // where each one stands in its category (the order the directory lists them in). Raunak's own projects aren't put
  // with his picks at the head of it: each stands in the middle of its category's hand-picked tools, well placed but
  // not leading
  let standing = new Map(), leaders = {}, byI = new Map();
  const rankAll = () => {
    byI = new Map(all.map((t) => [t.i, t]));
    standing = new Map();
    leaders = {};
    const lead = (t) => (t.pick && !t.mine ? 1 : 0);
    for (const t of [...all].sort((a, b) => (a.src === 'pick' && b.src === 'pick' ? lead(b) - lead(a) : 0) || a.i - b.i)) {
      if (!t.mine) (leaders[t.c] ||= []).push(t);
    }
    for (const t of all) {
      if (!t.mine) continue;
      const list = (leaders[t.c] ||= []);
      list.splice(Math.ceil(list.filter((x) => x.src === 'pick').length / 2), 0, t);
    }
    rankAll.size = {};
    for (const [c, list] of Object.entries(leaders)) {
      list.forEach((t, k) => standing.set(t, k + 1));
      rankAll.size[c] = list.length;
    }
  };
  const back = (t) => {
    const get = t.src === 'pick' ? GET.pick[t.p].replace('{host}', esc(host(t.u))) : GET[t.src];
    const kicker = t.src === 'pick'
      ? (t.mine ? 'Built by Raunak' : topList().includes(t) ? `★ Raunak's top ${all.filter((x) => x.pick).length} · No. ${topList().indexOf(t) + 1}` : 'Hand-picked by Raunak')
      : t.src === 'gh' ? 'Open-source project' : t.src === 'ph' ? `Product Hunt launch · ▲ ${fmt(t.pop)}` : 'Hugging Face Space';
    // its neighbours in its category's ranking: the ones just above and below it
    const list = leaders[t.c] || [], at = (standing.get(t) || 1) - 1;
    const from = Math.max(0, Math.min(at - 1, list.length - 4));
    const like = list.slice(from, from + 4).filter((x) => x !== t).slice(0, 3).map((x) => esc(x.n)).join(', ');
    const rows = [
      ['Get it', get],
      t.rel ? ['Released', `${day(t.rel)} <i>· ${ago(t.rel, true)}</i>`, 'r-added'] : null,
      standing.get(t) ? ['Ranks', `No. ${fmt(standing.get(t))} of ${fmt(rankAll.size[t.c])} in ${esc(T.categories[t.c])}`] : null,
      like && !affOf(t) ? ['Similar', like] : null,
    ].filter(Boolean);
    const aff = affOf(t);
    return `<span class="tool-back-head">${icon(t)}<span class="tool-back-kicker">${kicker}</span></span>
      <p class="tool-back-what"><span class="tl-skel-line"></span><span class="tl-skel-line short"></span></p>
      <dl>${rows.map(([k, v, cls]) => `<div${cls ? ` class="${cls}"` : ''}><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>${aff
        ? `<span class="tool-back-go"><a class="tool-back-cta" href="${esc(aff.u)}" target="_blank" rel="sponsored noopener">${esc(aff.cta || `Try ${t.n}`)} <b>↗</b></a></span>` : ''}`;
  };
  const card = (t, k) => {
    const isNew = t.added && Date.now() - Date.parse(t.added) < 30 * 864e5;
    const rank = S.view === 'top' ? `<span class="tool-rank">${String(k + 1).padStart(2, '0')}</span>` : '';
    const when = S.view === 'new' && t.rel ? ` · ${ago(t.rel, true)}` : '';
    const pop = t.src === 'gh' ? `<span class="tool-pop" title="${fmt(t.pop)} stars on GitHub">★ ${short(t.pop)}</span>`
      : t.src === 'hf' ? `<span class="tool-pop" title="${fmt(t.pop)} likes on Hugging Face">♥ ${short(t.pop)}</span>`
      : t.src === 'ph' ? `<span class="tool-pop" title="${fmt(t.pop)} upvotes on Product Hunt">▲ ${short(t.pop)}</span>` : '';
    return `<div class="tool-card" data-i="${t.i}" style="animation-delay:${Math.min(k % STEP, 16) * 30}ms"><div class="tool-inner">
      <div class="tool tool-front${t.src === 'pick' ? '' : ' cat'}" role="button" tabindex="0" aria-label="${esc(t.n)} – turn over for details">
      <span class="tool-top">
        ${icon(t)}
        <span class="tool-flags">${rank}${t.uses ? `<span class="tool-uses">${esc(t.uses)}</span>` : ''}${isNew ? '<span class="tool-new">New</span>' : ''}${t.pick ? '<span class="tool-pick" title="One of Raunak\'s picks">★</span>' : ''}${rising.has(t.i) && S.sort !== 'rising' ? '<span class="tool-rise" title="Climbing fast right now">↑ Rising</span>' : ''}${pop}<button type="button" class="tool-save" aria-pressed="${saved.has(keyFor(t))}" aria-label="Save ${esc(t.n)}" title="Save">${HEART}</button><a class="tool-go" href="${esc(linkOf(t))}" target="_blank" rel="${affOf(t) ? 'sponsored noopener' : 'noopener'}" aria-label="Open ${esc(t.n)} (${esc(host(t.u))})" title="Open ${esc(host(t.u))}">↗</a></span>
      </span>
      <h3>${esc(t.n)}</h3>
      ${t.src === 'ph' ? `<span class="tool-by">Product Hunt${when}</span>` : t.by ? `<span class="tool-by">${t.src === 'gh' ? 'GitHub' : 'Hugging Face'} · ${esc(t.by)}${when}</span>` : when ? `<span class="tool-by">Added${when}</span>` : ''}
      <p>${esc(t.d)}</p>
      <span class="tool-bot"><span class="tool-cat">${esc(T.categories[t.c])}</span><span class="tool-price"><span class="tl-dot p-${t.p}"></span>${PRICES[t.p] || 'Price on site'}</span></span>
      </div>
      <div class="tool tool-back" role="button" tabindex="-1" aria-label="Turn ${esc(t.n)} back over" inert></div>
    </div></div>`;
  };
  // (the back is written as it turns, so its ranks and look-alikes are always the current ones; its plain-words line
  // arrives a moment later the first time, then straight away)
  const turn = (c, over) => {
    const [front, rear] = c.querySelectorAll('.tool');
    if (over) {
      const t = byI.get(+c.dataset.i);
      window.track?.('tool_view', t.n, null, { src: t.src, key: keyFor(t) });
      rear.innerHTML = back(t);
      const what = rear.querySelector('.tool-back-what');
      explainOf(t).then((x) => {
        if (!what.isConnected) return;
        // (if the plain-words line can't be had just now, its own description stands in, so no back is left without one)
        const line = x || t.d;
        if (line) { what.textContent = undash(line); what.classList.add('in'); } else what.remove();
      });
    }
    c.classList.toggle('flipped', over);
    front.inert = over;
    rear.inert = !over;
    rear.tabIndex = over ? 0 : -1;
    (over ? rear : front).focus({ preventScroll: true });
  };
  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.tool-card');
    const out = c && e.target.closest('.tool-go, .tool-back-cta');
    if (out) {   // (the link as it is now: one set after the card was drawn still counts)
      const t = byI.get(+c.dataset.i);
      out.href = linkOf(t);
      window.track?.('tool_open', t.n, null, { src: t.src, key: keyFor(t), href: out.href, aff: affOf(t) ? 1 : undefined, via: out.matches('.tool-back-cta') ? 'card' : undefined });
    }
    if (!c || out) return;   // (↗, and the button on the back, only open the page)
    const sv = e.target.closest('.tool-save');
    if (sv) {   // (♥ saves it, or lets it go)
      const k = keyFor(byI.get(+c.dataset.i));
      if (saved.has(k)) saved.delete(k); else saved.add(k);
      keepSaved();
      window.track?.('tool_save', byI.get(+c.dataset.i).n, saved.has(k) ? 1 : 0, { key: k });
      sv.setAttribute('aria-pressed', String(saved.has(k)));
      if (S.src === 'saved') draw();
      return;
    }
    turn(c, !c.classList.contains('flipped'));
  });
  grid.addEventListener('keydown', (e) => {
    const side = e.target.closest('.tool-front, .tool-back');
    if (!side || e.target.closest('.tool-go, .tool-save, .tool-back-cta')) return;
    if (e.key === 'Enter' || e.key === ' ' || (e.key === 'Escape' && side.classList.contains('tool-back'))) {
      e.preventDefault();
      turn(side.closest('.tool-card'), side.classList.contains('tool-front'));
    }
  });
  let items = [], shownN = 0, shownSig = '';
  // after Ask Radar answers, the grid holds the other likely tools for the question (the filters still apply)
  let askRest = null, askQ = '';
  const asking = () => askRest && S.view === 'all' && S.q === askQ;
  function draw() {
    const top = S.view === 'top';
    effQ = S.q;
    items = top ? pool() : asking() ? askRest.filter((t) => matches(t, 'q')) : pool().filter((t) => matches(t));
    // (nothing for what was typed: what it most likely meant, said so above the results)
    let fixed = '';
    if (!top && !asking() && !items.length && S.q) {
      const f = fixQ(S.q);
      if (f !== S.q) { effQ = f; items = pool().filter((t) => matches(t)); if (items.length) fixed = f; else effQ = S.q; }
    }
    items = top ? items   // (already in its order: topList)
      : S.view === 'new' ? items.sort((a, b) => b.rel.localeCompare(a.rel) || a.i - b.i)
      : asking() && S.sort === 'picks' ? items
      : S.sort === 'az' ? items.sort((a, b) => a.n.localeCompare(b.n))
      : S.sort === 'rising' ? items.sort((a, b) => (a.riseRank ?? 2) - (b.riseRank ?? 2) || a.i - b.i)
      : S.sort === 'new' ? items.sort((a, b) => (b.added || '').localeCompare(a.added || '') || a.i - b.i)
      : items.sort((a, b) => (a.src === 'pick' && b.src === 'pick' ? (b.pick ? 1 : 0) - (a.pick ? 1 : 0) : 0) || a.i - b.i);
    count.textContent = top ? `Raunak's top ${items.length} · ${day(T.updated)}` : S.view === 'new' ? `${fmt(items.length)} new releases · newest first`
      : asking() ? `${fmt(items.length)} more tools related to “${S.q}”`
      : fixed ? `Showing ${fmt(items.length)} for “${fixed}” · you typed “${S.q}”` : `${fmt(items.length)} of ${fmt(all.length)}`;
    // and where it fits, one quiet link to the same list as its own page (/ai-tools, scripts/build-seo-pages.mjs)
    const page = asking() || S.q ? null : top ? ['/ai-tools/top-50', 'The Top 50 as a page'] : S.view === 'new' ? ['/ai-tools/new-ai-tools', 'New AI tools, as a page']
      : S.cat !== 'all' && LIST_PAGES[S.cat] ? [`/ai-tools/${LIST_PAGES[S.cat][0]}`, `Best ${LIST_PAGES[S.cat][1]}, ranked`]
      : S.price === 'free' ? ['/ai-tools/free-ai-tools', 'Free AI tools, by category'] : S.src === 'gh' || S.price === 'open' ? ['/ai-tools/open-source-ai-tools', 'Open-source AI tools, ranked'] : null;
    if (page) count.insertAdjacentHTML('beforeend', ` · <a class="tl-count-page" href="${page[0]}">${page[1]} →</a>`);
    const n = Math.min(items.length, S.limit);
    const sig = `${S.view}|${asking()}|${items.slice(0, n).map((t) => t.i).join()}|${S.q}`;
    if (sig !== shownSig) {   // (the catalogue arriving under an unchanged first screen redraws nothing)
      grid.innerHTML = items.slice(0, n).map(card).join('') || (S.src === 'saved' && !saved.size
        ? '<div class="tl-none-box"><p>Nothing saved yet, tap the ♥ on any tool to keep it here.</p></div>'
        : askable(S.q) && S.q !== askQ ? `<div class="tl-none-box tl-asking"><p>${MARK}Radar is finding tools for “${esc(S.q)}”…</p></div>`
        : !$('#tl-answer').hidden ? '<div class="tl-none-box"><p>Radar&rsquo;s suggestions are just above, or clear the search to browse everything.</p><button type="button" class="tl-pill" id="tl-reset">Clear the search</button></div>'
        : `<div class="tl-none-box"><p>Nothing matches${S.q ? ` “${esc(S.q)}”` : ''}.</p><button type="button" class="tl-pill" id="tl-reset">Clear the filters</button></div>`);
      shownN = n;
      shownSig = sig;
    }
    more.hidden = items.length <= S.limit;
    more.textContent = `Show more · ${fmt(Math.min(S.limit, items.length))} of ${fmt(items.length)}`;
    drawPills();
  }
  // more cards: the next lot is added under the ones already there (nothing above them redraws)
  more.addEventListener('click', () => {
    const from = S.limit;
    S.limit += STEP;
    grid.insertAdjacentHTML('beforeend', items.slice(from, S.limit).map(card).join(''));
    shownN = Math.min(items.length, S.limit);
    shownSig = `${S.view}|${asking()}|${items.slice(0, shownN).map((t) => t.i).join()}|${S.q}`;
    more.hidden = items.length <= S.limit;
    more.textContent = `Show more · ${fmt(shownN)} of ${fmt(items.length)}`;
  });
  const set = (k, v) => { S[k] = v; S.limit = 24; draw(); toURL(k !== 'q'); if (k !== 'q') window.track?.('radar_filter', `${k}: ${v}`); };
  const reset = () => { Object.assign(S, { q: '', src: 'all', price: 'all', cat: 'all', limit: 24 }); search.value = ''; draw(); toURL(true); };
  // a view of the directory is a link: raunakpatil.com/radar?view=new&cat=video&price=free — and back steps back
  const PARAMS = { view: 'all', q: '', src: 'all', price: 'all', cat: 'all', sort: 'picks', ask: '' };
  const onRadar = () => /^\/radar(\.html)?\/?$/.test(location.pathname);
  function fromURL() {
    const u = new URLSearchParams(location.search);
    for (const k of Object.keys(PARAMS)) S[k] = u.get(k) || PARAMS[k];
    if (!['all', 'top', 'new'].includes(S.view)) S.view = 'all';
    if (!SOURCES[S.src]) S.src = 'all';
    if (S.price !== 'all' && !PRICES[S.price]) S.price = 'all';
    if (S.cat !== 'all' && !T.categories[S.cat]) S.cat = 'all';
    if (!SORTS[S.sort]) S.sort = 'picks';
    S.ask = S.ask === '1' ? '1' : '';
    S.q = S.q.toLowerCase().slice(0, 200);
    search.value = S.q;
    $$('[data-v]', views).forEach((x) => x.setAttribute('aria-selected', String(x.dataset.v === S.view)));
    $('.tl-bar').classList.toggle('top', S.view === 'top');
    $('.tl-bar').classList.toggle('new', S.view === 'new');
  }
  function toURL(push) {
    if (!onRadar()) return;
    const u = new URLSearchParams();
    for (const [k, d] of Object.entries(PARAMS)) if (S[k] && S[k] !== d) u.set(k, S[k]);
    const url = `/radar${u.toString() ? `?${u}` : ''}`;
    if (url !== location.pathname + location.search) history[push ? 'pushState' : 'replaceState'](null, '', url);
  }
  addEventListener('popstate', () => { if (onRadar()) { fromURL(); S.limit = 24; draw(); } });
  clear.addEventListener('click', reset);
  let qt = 0;
  let tq = 0;
  search.addEventListener('input', () => {
    clearTimeout(qt); qt = setTimeout(() => set('q', search.value.trim().toLowerCase()), 140);
    // (for the command centre: what was searched, once they've stopped typing, and how many it found)
    clearTimeout(tq); tq = setTimeout(() => { if (S.q.length > 1) window.track?.('radar_search', S.q, items.length, effQ !== S.q ? { fixed: effQ } : undefined); }, 1500);
  });
  search.addEventListener('keydown', (e) => { if (e.key === 'Escape' && search.value) { e.stopPropagation(); search.value = ''; set('q', ''); } });
  // "/" jumps to the search, as on most sites with one
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || view.hidden || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(document.activeElement?.tagName || '')) return;
    e.preventDefault();
    search.focus();
  });
  grid.addEventListener('click', (e) => { if (e.target.closest('#tl-reset')) reset(); if (e.target.closest('#tl-ask-now')) askApi.ask(); });
  hint();
  rankAll();
  learn();
  fromURL();
  drawViews();
  draw();
  affReady.then(() => S.view === 'top' && draw()).then(() => grid.querySelectorAll('.tool-card').forEach((c) => {
    const t = byI.get(+c.dataset.i), a = t && c.querySelector('.tool-go');
    if (a) { a.href = linkOf(t); a.rel = affOf(t) ? 'sponsored noopener' : 'noopener'; }
  }));
  const askApi = initAsk({
    all: () => all, keyFor, linkOf, icon, esc, cats: T.categories, prices: PRICES, loaded: catalogP, fix: (q) => fixQ(q.toLowerCase()),
    show(rest, q) { askRest = rest; askQ = q.trim().toLowerCase(); S.q = askQ; S.ask = '1'; S.limit = 24; draw(); toURL(false); },
    hide() { askRest = null; askQ = ''; if (S.ask) { S.ask = ''; draw(); toURL(false); } },
    // (closing Radar clears the question too: back to the whole directory)
    clear() { askRest = null; askQ = ''; S.ask = ''; search.value = ''; set('q', ''); },
  });
  if (S.ask && askable(S.q)) askApi.ask(); else S.ask = '';
  // arriving from one of the /ai-tools pages with ?open=<a tool's name> (and ?q= to find it): that tool's card in view,
  // turned over to what it does, among the ones like it (the address keeps only the search)
  const opening = (new URLSearchParams(location.search).get('open') || '').toLowerCase();
  if (opening) {
    const show = () => {
      const t = all.find((x) => x.n.toLowerCase() === opening);
      const c = t && grid.querySelector(`.tool-card[data-i="${t.i}"]`);
      if (!c) return false;
      setTimeout(() => {
        c.scrollIntoView({ block: 'center', behavior: MOTION ? 'smooth' : 'auto' });
        setTimeout(() => turn(c, true), MOTION ? 500 : 0);
      }, 300);
      return true;
    };
    // (once the catalogue has joined: its arrival redraws the cards)
    catalogP.then(() => setTimeout(show, 120), () => show());
    toURL(false);
  }
}

/* ---------- Ask Radar ---------- */
// Describe what you need ("turn my podcast into short clips") and Radar suggests a few tools, saying why. The page picks
// the likeliest few dozen by their words; Ronie's worker (POST /ask) reads those and chooses. The rest of the likely
// ones fill the grid below, so there's always more to look through.
const ASK_URL = (D.assistant?.chatUrl || '').replace(/\/chat$/, '/ask');
// Raunak's own links for some tools, set in HQ: a tool's key → { u: where its links go, cta }.
// Kept in this browser too, so the links are right from the first card even before the worker answers.
const AFF_URL = (D.assistant?.chatUrl || '').replace(/\/chat$/, '/aff');
let AFF = {};
try { AFF = JSON.parse(localStorage.getItem('rp-aff') || '{}') || {}; } catch { /* private mode */ }
const affReady = !AFF_URL ? Promise.resolve() : fetch(AFF_URL, { signal: AbortSignal.timeout(8000) })
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => { if (j && j.links && typeof j.links === 'object') { AFF = j.links; try { localStorage.setItem('rp-aff', JSON.stringify(AFF)); } catch { /* */ } } })
  .catch(() => {});
const STOP = new Set('a an and any app apps are best can could do does find for from get give good great help how i if in into is it its like make me my need of on or please recommend something some suggest that the thing this to tool tools use using want way what which with without would you your ai an'.split(' '));
const ALSO = {
  podcast: ['audio', 'voice', 'speech'], podcasts: ['audio', 'voice'], clip: ['video', 'short'], clips: ['video', 'short'],
  photo: ['image', 'picture'], photos: ['image', 'picture'], picture: ['image', 'photo'], pictures: ['image'], image: ['photo', 'picture'],
  images: ['image', 'photo'], art: ['image', 'drawing'], code: ['coding', 'developer', 'programming'], coding: ['code'],
  write: ['writing', 'copy', 'text'], writing: ['write', 'copy'], essay: ['writing'], slides: ['presentation', 'deck'],
  presentation: ['slides', 'deck'], song: ['music', 'audio'], songs: ['music'], music: ['song', 'audio'], meeting: ['notes', 'transcribe', 'transcription'],
  meetings: ['meeting', 'notes'], notes: ['meeting', 'note'], voice: ['speech', 'tts', 'audio'], video: ['clip', 'film'], videos: ['video'],
  chat: ['assistant', 'chatbot'], research: ['papers', 'search'], papers: ['research'], pdf: ['document', 'documents'], pdfs: ['pdf', 'document'],
  translate: ['translation', 'language'], logo: ['brand', 'design'], website: ['site', 'web'], '3d': ['model', 'mesh'],
  email: ['inbox', 'mail'], emails: ['email', 'inbox'], resume: ['cv', 'job'], transcribe: ['transcription', 'speech'],
  background: ['remove', 'photo'], summarise: ['summary', 'summarize'], summarize: ['summary', 'summarise'],
};
const EXAMPLES = [
  'Turn my podcast into short clips', 'Remove the background from product photos', 'Summarise long PDFs for me',
  'Build a website without writing code', 'Clone my voice for narration', 'Take notes in my meetings',
  'Make background music for my videos', 'Write code from plain English',
];
const words = (q) => q.toLowerCase().split(/[^a-z0-9+#]+/).filter((w) => w.length > 1 && !STOP.has(w));
// (a question, rather than a search: three words or more, two of them meaningful)
const askable = (q) => words(q).length >= 2 && q.trim().split(/\s+/).length >= 3;

function initAsk({ all, keyFor, linkOf, icon, esc: e, cats, prices, loaded, show, hide, clear, fix }) {
  const search = $('#tl-search'), btn = $('#tl-ask'), box = $('#tl-answer');
  if (!btn || !box || !ASK_URL) return { ask() {} };
  btn.hidden = false;
  let asked = 0, askedQ = '';
  // the mark opens Radar and closes it again: pressed in while it's open; the black key only when there's
  // something new to ask
  const setOpen = (on) => {
    btn.classList.toggle('open', on);
    btn.setAttribute('aria-expanded', String(on));
    btn.title = on ? 'Close Ask Radar' : 'Ask Radar: describe what you need';
  };
  const state = () => { btn.classList.toggle('ready', askable(search.value) && search.value.trim().toLowerCase() !== askedQ); };
  const chips = (list) => list.map((x) => `<button type="button" class="tl-try-chip" data-q="${e(x)}">${e(x)}</button>`).join('');
  // one way in, however it's opened (the empty search box in use, or the mark): the panel, with examples to try. It
  // goes the same way too: a click anywhere else, typing, ×, Esc, or the mark again
  let mode = '', pinned = false, holding = false, autoT = 0;
  const intro = (byHand) => {
    mode = 'intro';
    pinned = byHand;
    box.hidden = false;
    // (one line: the name, a few to try, and ×)
    box.classList.add('is-intro');
    box.innerHTML = `<div class="tl-intro"><span class="tl-intro-k">${MARK}<b>Ask Radar</b></span><span class="tl-intro-try">${chips(EXAMPLES)}</span><button type="button" class="tl-answer-x" aria-label="Close Ask Radar" title="Close (Esc)">×</button></div>`;
    setOpen(true);
    fitTry();
  };
  // as many examples as fit on the line, filling it: the ones that would spill over are left out (fewer on a narrow
  // screen), and the rest share the width that's left, so there's no gap at the end; again whenever the width changes
  const fitTry = () => {
    const row = box.querySelector('.tl-intro-try');
    if (!row) return;
    const list = [...row.children];
    row.classList.remove('fit');
    list.forEach((c) => { c.hidden = false; });
    for (let k = list.length - 1; k > 0 && row.scrollWidth > row.clientWidth + 1; k--) list[k].hidden = true;
    row.classList.add('fit');
  };
  if (window.ResizeObserver) new ResizeObserver(() => { if (mode === 'intro') fitTry(); }).observe(box);
  search.addEventListener('focus', () => { if (!search.value.trim() && box.hidden) intro(false); });
  search.addEventListener('blur', () => setTimeout(() => {
    if (mode === 'intro' && !pinned && !holding && !box.contains(document.activeElement) && document.activeElement !== btn) close();
  }, 150));
  box.addEventListener('pointerdown', () => { holding = true; setTimeout(() => { holding = false; }, 400); });
  document.addEventListener('pointerdown', (ev) => {
    if (mode === 'intro' && !box.contains(ev.target) && !btn.contains(ev.target) && ev.target !== search) close();
  });
  search.addEventListener('input', () => {
    state();
    if (search.value.trim()) {
      if (mode === 'intro') close();
      // a question answers itself: a moment after the typing stops, Radar asks (Enter asks at once)
      clearTimeout(autoT);
      const v = search.value.trim().toLowerCase();
      if (askable(v) && v !== askedQ) autoT = setTimeout(() => { if (search.value.trim().toLowerCase() === v) ask(); }, 900);
      return;
    }
    clearTimeout(autoT);
    close();
    if (document.activeElement === search) intro(false);
  });
  state();
  // the likeliest few dozen, by their own words (a word's ending is let go, so "podcasts" finds "podcast"): room for
  // the 16 best of the hand-picked tools and the 20 best of the catalogue, so a polished product isn't crowded out
  const likely = (q) => {
    const stem = (w) => (w.length > 5 ? w.slice(0, -2) : w.length > 3 ? w.replace(/s$/, '') : w);
    const terms = [...new Set([...words(q), ...words(fix(q))].flatMap((w) => [w, ...(ALSO[w] || [])]).map(stem))];
    const scored = all().map((t) => {
      const name = t.n.toLowerCase();
      let s = 0;
      for (const w of terms) { if (name.includes(w)) s += 4; if (t.key.includes(w)) s += 2; }
      if (s) s += t.src === 'pick' ? (t.pick ? 2 : 1) : 1 - (t.rank || 0);
      return [s, t];
    }).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]).map(([, t]) => t);
    return { top: [...scored.filter((t) => t.src === 'pick').slice(0, 16), ...scored.filter((t) => t.src !== 'pick').slice(0, 20)], all: scored.slice(0, 120) };
  };
  const head = (html) => `<div class="tl-answer-head"><span>${html}</span><button type="button" class="tl-answer-x" aria-label="Close Radar's suggestions" title="Close (Esc)">×</button></div>`;
  async function ask(text) {
    if (typeof text === 'string') { search.value = text; search.dispatchEvent(new Event('input')); }
    const q = search.value.trim().slice(0, 200);
    if (!askable(q)) {   // (not a question yet: say how, with a few to try)
      intro(false);
      search.focus();
      return;
    }
    const n = ++asked;
    mode = 'answer';
    box.classList.remove('is-intro');
    askedQ = q.toLowerCase();
    state();
    setOpen(true);
    box.hidden = false;
    box.innerHTML = head(`${MARK}<b>Radar</b> is reading the directory for “${e(q)}”…`)
      + `<ul class="tl-answer-list wait">${'<li><span class="tl-answer-skel"><i></i><b></b></span></li>'.repeat(3)}</ul>`;
    await loaded;   // (the whole catalogue, not just the first screen's)
    const pool = likely(q);
    const byKey = new Map(pool.top.map((t) => [keyFor(t), t]));
    let picks = [], failed = false;
    if (pool.top.length) {
      try {
        const r = await fetch(ASK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q, keys: [...byKey.keys()] }), signal: AbortSignal.timeout(20000) });
        if (r.ok) picks = (await r.json()).picks || []; else failed = true;
      } catch { failed = true; }
    }
    if (n !== asked) return;   // (a newer question took over)
    const found = picks.map((p) => [byKey.get(p.key), p.why]).filter(([t]) => t);
    // (if the model can't be reached, the best word matches still help)
    const list = found.length ? found : pool.top.slice(0, 4).map((t) => [t, '']);
    window.track?.('radar_ask', q, found.length, { picks: list.map(([t]) => t.n), failed: failed || undefined });
    const rest = pool.all.filter((t) => !list.some(([x]) => x === t));
    show(rest, q);
    const meta = (t) => `${e(cats[t.c] || '')}${prices[t.p] ? ` · ${prices[t.p]}` : ''}`;
    box.innerHTML = (list.length
      ? head(found.length ? `${MARK}<b>Radar</b> suggests, for “${e(q)}”` : `${MARK}<b>Radar</b> ${failed ? 'couldn’t reach its helper just now' : 'isn’t sure'}. Here are the closest matches for “${e(q)}”`)
        + `<ol class="tl-answer-list">${list.map(([t, why], k) => `<li><a href="${e(linkOf(t))}" target="_blank" rel="${linkOf(t) !== t.u ? 'sponsored noopener' : 'noopener'}" data-key="${e(keyFor(t))}"><span class="tl-answer-n">${k + 1}</span>${icon(t)}<span class="tl-answer-t"><b>${e(t.n)}</b><span>${e(why || t.d)}</span><i>${meta(t)}</i></span><span class="ar" aria-hidden="true">↗</span></a></li>`).join('')}</ol>`
        + `<p class="tl-answer-foot">Not quite it? Add a detail and Radar will look again.${rest.length ? ` <button type="button" class="tl-answer-more">${fmt(rest.length)} more related tools below ↓</button>` : ''}</p>`
      : head(`${MARK}<b>Radar</b> found nothing for “${e(q)}”`)
        + `<p class="tl-answer-none">Try saying what you want to make or do, for example:</p><div class="tl-answer-try">${chips(EXAMPLES.slice(0, 5))}</div>`);
  }
  function close() {
    box.classList.remove('is-intro');
    mode = '';
    pinned = false;
    askedQ = '';
    setOpen(false);
    state();
    if (box.hidden) return;
    asked++;
    box.hidden = true;
    box.innerHTML = '';
    hide();
  }
  // closed by hand (×, Esc, or the mark again): the panel goes and the search is cleared
  function dismiss() { close(); clear(); state(); }
  // the mark: asks what's typed (or shows how); pressed again, with nothing new to ask, it closes
  btn.addEventListener('click', () => {
    const fresh = askable(search.value) && search.value.trim().toLowerCase() !== askedQ;
    if (!box.hidden && !fresh) { dismiss(); return; }
    ask();
  });
  search.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && askable(search.value)) { ev.preventDefault(); clearTimeout(autoT); ask(); }
    if (ev.key === 'Escape' && !box.hidden) { ev.stopPropagation(); dismiss(); }
  });
  const pickChip = (ev) => { const c = ev.target.closest('.tl-try-chip'); if (c) { ev.preventDefault(); ask(c.dataset.q); } };
  box.addEventListener('click', (ev) => {
    if (ev.target.closest('.tl-answer-x')) { dismiss(); return; }
    if (ev.target.closest('.tl-answer-more')) { $('#tl-count').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    pickChip(ev);
  });
  box.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') dismiss(); });
  return { ask };
}

/* ---------- wiring ---------- */
const ready = Promise.all([
  tools.then((T) => { renderDirectory(T, catalog); idle(startCatalog); }).catch((e) => { console.error('Tools list failed', e); $('#tl-grid').innerHTML = '<p class="tl-empty">The tools list didn\'t load. Refresh to try again.</p>'; }),
  feed.then(renderNews),
]);
const leadBox = $('#tl-lead');
leadBox.addEventListener('pointerenter', () => { leadPaused = true; });
leadBox.addEventListener('pointerleave', () => { leadPaused = false; });
leadBox.addEventListener('focusin', () => { leadPaused = true; });
leadBox.addEventListener('focusout', () => { leadPaused = false; });
$('#tl-lead-bars').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const k = $$('#tl-lead-bars button').indexOf(b);
  showLead(k);
});
$('#tl-lead-prev').addEventListener('click', () => showLead(leadI - 1));
$('#tl-lead-next').addEventListener('click', () => showLead(leadI + 1));
// on a touch screen a swipe across the story turns it, left for the next; up and down still scroll the page
let swipe = null;
leadBox.addEventListener('touchstart', (e) => { const t = e.touches[0]; swipe = e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null; }, { passive: true });
leadBox.addEventListener('touchend', (e) => {
  if (!swipe) return;
  const t = e.changedTouches[0], dx = t.clientX - swipe.x, dy = t.clientY - swipe.y;
  swipe = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > 1.6 * Math.abs(dy)) showLead(leadI + (dx < 0 ? 1 : -1));
}, { passive: true });
// stacked, the news and models come first: a pill at the foot of the screen skips straight to the tools, until
// they're reached
const jump = $('#tl-jump'), dirBox = $('.tl-dir');
new IntersectionObserver(([en]) => jump.classList.toggle('on', !en.isIntersecting && en.boundingClientRect.top > 0)).observe(dirBox);
jump.addEventListener('click', () => dirBox.scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto', block: 'start' }));

export function open() {
  ready.then(() => {
    leadAt = performance.now();
    lastFrame = 0;
    if (!leadTimer) leadTimer = requestAnimationFrame(tickLead);
  });
}
