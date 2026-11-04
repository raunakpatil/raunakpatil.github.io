// Builds Radar's pages for search engines, plain HTML under /ai-tools, from the same data the Radar page shows:
//   /ai-tools/                         the hub: every category, the collections and the Top 50
//   /ai-tools/best-ai-video-tools ...  one page per category, its tools ranked as Radar ranks them
//   /ai-tools/top-50, free-ai-tools, open-source-ai-tools, new-ai-tools
//   /ai-tools/alternatives/<tool>      alternatives to each of the Top 50
//   /ai-tools/tool/<tool>              a page per tool: the hand-picked ones and the best-known of the catalogue
// plus sitemap.xml with all of them. Each tool's plain-words line comes from Ronie's worker (/explained: only the ones
// already written), kept in data/explained.json so a build never depends on it. The Refresh Radar Action runs this
// after each refresh; run it by hand after editing data/tools.json:  node scripts/build-seo-pages.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const at = (p) => new URL(`../${p}`, import.meta.url);
const read = (p, d) => { try { return JSON.parse(readFileSync(at(p), 'utf8')); } catch { return d; } };
const T = read('data/tools.json');
const C = read('data/catalog.json', { gh: [], hf: [], ph: [] });
const SITE = 'https://raunakpatil.com';
const WORKER = 'https://ronie-chat.ronie-chat.workers.dev';
const NOW = new Date();
const TODAY = NOW.toISOString().slice(0, 10);
const MONTH = NOW.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const YEAR = NOW.getUTCFullYear();
const V = (readFileSync(at('index.html'), 'utf8').match(/css\/style\.css\?v=(\d+)/) || [])[1] || '';

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const undash = (s) => String(s ?? '').replace(/\s*\u2014\s*(?=[.,)!?])/g, '').replace(/\s*\u2014\s*/g, ', ');
const slug = (n) => n.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tool';
const fmt = (n) => Number(n).toLocaleString('en-US');
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
// A search snippet: the whole text when it fits, otherwise the longest whole sentence that fits,
// otherwise a word boundary. Source ellipses are closed into a sentence, never left as a cut-off "…".
const sentence = (s, n = 160) => {
  let t = String(s ?? '').replace(/\s+/g, ' ').replace(/,?\s*…+(?=\s|$)/g, '.').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
  const dangling = /(?:\b(?:and|or|the|a|an|of|for|to|with|from|in|on|by|at|as|its|their|that|which|into|than)\s*)$/i;
  const finish = (x) => {
    let y = x.trim().replace(/[,:;]\s*$/, '').trim();
    while (dangling.test(y)) y = y.replace(dangling, '').trim().replace(/[,:;]\s*$/, '').trim();
    if (!y || /[.!?]$/.test(y)) return y;
    return `${y}.`;
  };
  if (t.length <= n) {
    const done = finish(t);
    if (done.length <= n) return done;
  }
  // The longest run of whole sentences that fits.
  let end = -1;
  for (let i = 0; i < n && i < t.length; i++) {
    if ('.!?'.includes(t[i]) && (i + 1 === t.length || /\s/.test(t[i + 1]))) end = i + 1;
  }
  if (end >= 80) return t.slice(0, end).trim();
  // Otherwise the longest clause, so a short first sentence does not throw away the names that follow.
  let clause = -1;
  for (let i = 0; i < n && i < t.length; i++) if (',;:'.includes(t[i])) clause = i;
  if (clause >= 80) return finish(t.slice(0, clause));
  if (end >= 40) return t.slice(0, end).trim();
  const cut = t.slice(0, n - 1).replace(/\s+\S*$/, '');
  const done = finish(cut);
  return done.length <= n ? done : done.slice(0, n).trim();
};
// Tool titles stay on the query ("<name> alternatives") and under the length Google shows.
const toolTitle = (name) => {
  const full = `${name}: what it is, price and alternatives | Radar`;
  if (full.length <= 65) return full;
  const alt = `${name} alternatives | Radar`;
  if (alt.length <= 65) return alt;
  const suffix = ' | Radar';
  const room = 65 - suffix.length;
  let cut = name.slice(0, room).replace(/[\s|:–—-]+[^\s|:–—-]*$/, '').replace(/[\s|:–—-]+$/, '');
  if (cut.length < 12) cut = name.slice(0, room).trim();
  return `${cut}${suffix}`;
};
const norm = (x) => x.toLowerCase().replace(/[^a-z0-9]+/g, '');

// ---------- the tools, as Radar lists them ----------
const CATS = T.categories;
const curated = T.tools.map((t, i) => ({ ...t, d: undash(t.d), src: 'pick', i }));
const known = new Set(curated.flatMap((t) => [norm(t.n), t.u.replace(/\/$/, '').toLowerCase()]));
const take = (list, make) => list.map(make).filter((t) => {
  const k = norm(t.n), u = t.u.toLowerCase();
  if (known.has(k) || known.has(u)) return false;
  known.add(k); known.add(u);
  return true;
});
const gh = take(C.gh || [], ([n, full, d, stars, c, oid, rel]) => ({ n, u: `https://github.com/${full}`, d: undash(d), c, p: 'open', src: 'gh', pop: stars, oid, by: full.split('/')[0], full, rel }));
const hf = take(C.hf || [], ([n, id, d, likes, c, emoji, from, to, rel]) => ({ n, u: `https://huggingface.co/spaces/${id}`, d: undash(d), c, p: 'free', src: 'hf', pop: likes, emoji, from, to, by: id.split('/')[0], full: id, rel }));
const ph = take(C.ph || [], ([n, s, d, votes, c, thumb, p, link, rel]) => ({ n, u: link, d: undash(d), c, p: p || 'na', src: 'ph', pop: votes, thumb, slug: s, rel }));
const catalogue = [...gh, ...hf, ...ph].filter((t) => CATS[t.c] && t.d);
const all = [...curated, ...catalogue];
const keyFor = (t) => (t.src === 'pick' ? `pick:${t.n}` : t.src === 'gh' ? `gh:${t.full}` : t.src === 'hf' ? `hf:${t.full}` : `ph:${t.slug}`);

// which get a page of their own: every hand-picked tool, and the catalogue's best-known (popular enough that people
// search for them by name)
const PAGE_MIN = { gh: 20000, hf: 500, ph: 500 };
const paged = [...curated, ...catalogue.filter((t) => t.pop >= PAGE_MIN[t.src] && t.d.length >= 24)];
const used = new Set();
for (const t of paged) {
  let s = slug(t.n);
  if (used.has(s)) s = `${s}-${t.src === 'gh' ? 'github' : t.src === 'hf' ? 'hugging-face' : 'product-hunt'}`;
  for (let k = 2; used.has(s); k++) s = `${slug(t.n)}-${k}`;
  used.add(s);
  t.page = `/ai-tools/tool/${s}`;
}

// where each stands in its category: Raunak's picks first, then the rest of the hand-picked in Radar's order, then the
// catalogue by popularity; his own projects sit in the middle of the hand-picked ones, well placed but never leading
// (the same as the card backs on Radar)
const top = curated.filter((t) => t.pick);
const ranked = {};
for (const c of Object.keys(CATS)) {
  const mine = curated.filter((t) => t.c === c && t.mine);
  const picks = curated.filter((t) => t.c === c && !t.mine).sort((a, b) => ((b.pick ? 1 : 0) - (a.pick ? 1 : 0)) || a.i - b.i);
  for (const t of mine) picks.splice(Math.ceil(picks.length / 2), 0, t);
  const rest = catalogue.filter((t) => t.c === c);
  // (the catalogue's three places in turns, each by its own popularity)
  const bySrc = ['gh', 'hf', 'ph'].map((s) => rest.filter((t) => t.src === s).sort((a, b) => b.pop - a.pop));
  const mixed = [];
  for (let k = 0; bySrc.some((l) => l[k]); k++) for (const l of bySrc) if (l[k]) mixed.push(l[k]);
  ranked[c] = [...picks, ...mixed];
  ranked[c].forEach((t, k) => { t.rank = k + 1; });
}
const catSize = (c) => ranked[c].length;

// ---------- the plain-words lines ----------
const kept = read('data/explained.json', {});
async function explained() {
  const want = paged.map(keyFor).filter((k) => !kept[k]);
  for (let i = 0; i < want.length; i += 100) {
    try {
      const r = await fetch(`${WORKER}/explained`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keys: want.slice(i, i + 100) }), signal: AbortSignal.timeout(20000) });
      if (r.ok) Object.assign(kept, (await r.json()).texts || {});
    } catch { /* the ones kept still serve */ }
  }
  const live = new Set(paged.map(keyFor));
  for (const k of Object.keys(kept)) if (!live.has(k)) delete kept[k];
  writeFileSync(at('data/explained.json'), `${JSON.stringify(Object.fromEntries(Object.entries(kept).sort()), null, 1)}\n`);
}

// ---------- words about each category (written by hand; the lists are from the data) ----------
const CAT_PAGE = {
  chat: { s: 'best-ai-chatbots', h: 'AI chatbots and assistants', intro: 'The assistants people use every day to ask questions, write, plan, read files and get things done, from the big general ones to the ones built around a single job.' },
  research: { s: 'best-ai-research-tools', h: 'AI research and search tools', intro: 'Tools that search the web, read papers and documents for you, and answer with sources you can check.' },
  code: { s: 'best-ai-coding-tools', h: 'AI coding tools', intro: 'Editors, coding agents and app builders that write, explain and fix code, for developers and for people who have never written a line.' },
  agents: { s: 'best-ai-agents', h: 'AI agents and automation tools', intro: 'Agents that take a task and carry it out across apps and the web, and the automation platforms that wire tools together without code.' },
  image: { s: 'best-ai-image-generators', h: 'AI image generators and editors', intro: 'Tools that make pictures from a sentence, edit photos, remove backgrounds and upscale, for art, products and everything between.' },
  video: { s: 'best-ai-video-tools', h: 'AI video tools', intro: 'Video generators, avatar and dubbing tools, and editors that cut, caption and clip footage for you.' },
  voice: { s: 'best-ai-voice-tools', h: 'AI voice and audio tools', intro: 'Text to speech, voice cloning, transcription and dictation, and clean-up for recordings and calls.' },
  music: { s: 'best-ai-music-generators', h: 'AI music generators', intro: 'Tools that compose songs, beats and soundtracks from a prompt, separate stems and help musicians work faster.' },
  writing: { s: 'best-ai-writing-tools', h: 'AI writing tools', intro: 'Help with drafting, rewriting, grammar, tone and translation, for emails, essays, posts and books.' },
  work: { s: 'best-ai-productivity-tools', h: 'AI productivity tools', intro: 'Meeting notes, slides, email, calendars, docs and to-do lists, with AI that takes the busywork off your hands.' },
  design: { s: 'best-ai-design-tools', h: 'AI design and 3D tools', intro: 'Design tools for interfaces, graphics, logos and 3D, with AI that drafts layouts, assets and models.' },
  build: { s: 'best-ai-developer-tools', h: 'AI tools for building with AI', intro: 'Models, APIs, frameworks and local runners for people building their own AI apps and agents.' },
};
const PRICE = { free: 'Free', freemium: 'Free plan', paid: 'Paid', open: 'Open source', na: 'Price on site' };
const PRICE_LONG = { free: 'Free to use', freemium: 'Free plan, with paid upgrades', paid: 'Paid plans', open: 'Free and open source', na: 'Pricing on its own site' };
const FROM = (t) => (t.mine ? 'Built by Raunak, listed among the other tools'
  : t.src === 'pick' ? (t.pick ? `Hand-picked: No. ${top.indexOf(curated[t.i]) + 1} in Raunak's Top 50` : 'Hand-picked by Raunak')
  : t.src === 'gh' ? `Open-source project on GitHub, ${fmt(t.pop)} stars` : t.src === 'hf' ? `App on Hugging Face Spaces, ${fmt(t.pop)} likes` : `Launched on Product Hunt, ${fmt(t.pop)} upvotes`);
const catLink = (c) => `/ai-tools/${CAT_PAGE[c].s}`;
// (a category's name inside a sentence: lower case, but AI and 3D stay as they are)
const lowH = (c) => CAT_PAGE[c].h.toLowerCase().replace(/\bai\b/g, 'AI').replace(/\b3d\b/g, '3D');
// One complete, unique description per category. The names and the count come from the data, so it
// stays current without a hand-written sentence per page, and it stays inside a search snippet.
const categoryDesc = (c) => {
  const picks = ranked[c].filter((t) => t.src === 'pick');
  if (!picks.length) return `Best ${lowH(c)} in ${MONTH}, ranked with prices.`;
  const names = picks.map((t) => t.n);
  const total = catSize(c);
  for (const k of [3, 2, 1]) {
    const shown = names.slice(0, k);
    const more = total - shown.length;
    const line = `Best ${lowH(c)} in ${MONTH}: ${shown.join(', ')}${more > 0 ? ` and ${fmt(more)} more` : ''}, ranked with prices.`;
    if (line.length <= 160) return line;
  }
  return sentence(`Best ${lowH(c)} in ${MONTH}, ranked with prices.`);
};
// One sentence that names the tool and a few alternatives, shortened until it fits a snippet.
const altDesc = (t, alts) => {
  const kind = lowH(t.c);
  for (const k of [4, 3, 2, 1]) {
    const shown = alts.slice(0, k).map((x) => x.n);
    if (!shown.length) break;
    const line = `${t.n} alternatives in ${MONTH}: ${shown.join(', ')} and more ${kind}, compared by what they do and what they cost.`;
    if (line.length <= 160) return line;
  }
  return sentence(`${t.n} alternatives in ${MONTH}: other ${kind}, compared by what they do and what they cost.`);
};

// ---------- the page around the content: the site's own top bar and title, Radar's views and search bar, and its
// tool cards (css/style.css, the same file the site uses; css/pages.css adds the little these pages need). Whatever a
// visitor does goes on into Radar: the search asks Radar, the views open them there, and a tool opens on Radar
// turned over to what it does, among the ones like it (search engines follow the same links to the pages here).
const GRAD = { red: '#fda4af', yellow: '#fde68a', green: '#86efac', blue: '#93c5fd', indigo: '#a5b4fc', purple: '#d8b4fe', pink: '#f9a8d4', gray: '#e5e7eb' };
const MARK = '<svg class="tl-mark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle class="in" cx="12" cy="12" r="4.6"/><path class="sweep" d="M12 12 18.4 5.6"/><circle class="blip" cx="15.6" cy="15.2" r="1.4"/></svg>';
const HEART = '<svg class="tl-heart" viewBox="0 0 24 24" aria-label="love" role="img"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg>';
const icon = (t) => {
  if (t.src === 'gh') return `<span class="tool-icon" data-l="${esc(t.n[0])}"><img class="av" src="https://avatars.githubusercontent.com/u/${+t.oid}?s=64&amp;v=4" alt="" loading="lazy" width="64" height="64" onerror="this.remove()"></span>`;
  if (t.src === 'hf') return `<span class="tool-icon emo" style="--g1:${GRAD[t.from] || GRAD.gray};--g2:${GRAD[t.to] || GRAD.gray}">${esc([...(t.emoji || '🤗')][0])}</span>`;
  if (t.src === 'ph') {
    const src = /^https:\/\//.test(t.thumb || '') ? `${t.thumb.split('?')[0]}?auto=format&fit=crop&w=96&h=96` : '';
    return `<span class="tool-icon" data-l="${esc(t.n[0])}">${src ? `<img class="av" src="${esc(src)}" alt="" loading="lazy" width="64" height="64" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}</span>`;
  }
  return `<span class="tool-icon" data-l="${esc(t.n[0])}">${t.icon === false ? '' : `<img${t.full ? ' class="av"' : ''} src="/img/tools/${slug(t.n)}.webp" alt="" loading="lazy" width="64" height="64" onerror="this.remove()">`}</span>`;
};
// (a tool on Radar: found by its name, its card turned over — radar.js reads ?open=)
const onRadar = (t) => `/radar?q=${encodeURIComponent(t.n.toLowerCase())}&open=${encodeURIComponent(t.n)}`;
const short = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}k` : String(n));
const card = (t, { rank, when } = {}) => {
  const pop = t.src === 'gh' ? `<span class="tool-pop" title="${fmt(t.pop)} stars on GitHub">★ ${short(t.pop)}</span>`
    : t.src === 'hf' ? `<span class="tool-pop" title="${fmt(t.pop)} likes on Hugging Face">♥ ${short(t.pop)}</span>`
    : t.src === 'ph' ? `<span class="tool-pop" title="${fmt(t.pop)} upvotes on Product Hunt">▲ ${short(t.pop)}</span>` : '';
  const by = t.src === 'ph' ? 'Product Hunt' : t.by ? `${t.src === 'gh' ? 'GitHub' : 'Hugging Face'} · ${t.by}` : '';
  const line = [by, when].filter(Boolean).join(' · ');
  return `<div class="tool-card"><div class="tool tool-front${t.src === 'pick' ? '' : ' cat'}">
      <span class="tool-top">${icon(t)}<span class="tool-flags">${rank ? `<span class="tool-rank">${String(rank).padStart(2, '0')}</span>` : ''}${t.uses ? `<span class="tool-uses">${esc(t.uses)}</span>` : ''}${t.pick ? '<span class="tool-pick" title="One of Raunak\'s picks">★</span>' : ''}${pop}<a class="tool-go" href="${esc(t.u)}" target="_blank" rel="noopener${t.src === 'pick' ? '' : ' nofollow'}" aria-label="Open ${esc(t.n)} (${esc(host(t.u))})" title="Open ${esc(host(t.u))}">↗</a></span></span>
      <h3><a class="pg-open" href="${t.page || onRadar(t)}" data-radar="${esc(onRadar(t))}">${esc(t.n)}</a></h3>
      ${line ? `<span class="tool-by">${esc(line)}</span>` : ''}
      <p>${esc(t.d)}</p>
      <span class="tool-bot"><span class="tool-cat">${esc(CATS[t.c])}</span><span class="tool-price"><span class="tl-dot p-${t.p}"></span>${PRICE_TAG[t.p] || 'Price on site'}</span></span>
    </div></div>`;
};
const PRICE_TAG = { free: 'Free', freemium: 'Freemium', paid: 'Paid', open: 'Open source' };
const grid = (items, opts = {}) => `<div class="tl-grid">${items.map((t, k) => card(t, { rank: opts.ranked ? k + 1 : 0, when: opts.when ? opts.when(t) : '' })).join('')}</div>`;
const sec = (h, sub) => `<div class="tl-sec-head pg-sec"><h2>${h}</h2>${sub ? `<span>${sub}</span>` : ''}</div>`;
const more = (href, text) => `<a class="tl-pill pg-more" href="${href}">${text} →</a>`;

// the views and the search box, as on Radar: each goes on to Radar itself
const VIEWS = [['all', 'Browse all tools', `Search all ${fmt(all.length)} in the directory`, '/radar'], ['top', 'Top 50 AI tools', 'What Raunak recommends right now', '/radar?view=top'], ['new', 'New releases', 'The latest releases', '/radar?view=new']];
const head = (title, view) => `<div class="tl-dir-head pg-head">
      <h1 class="page-title">${title}</h1>
      <nav class="tl-views" aria-label="Radar's views">${VIEWS.map(([k, t, s, u]) => `<a href="${u}"${k === view ? ' class="on" aria-current="page"' : ''}><span class="tl-view-t">${t}</span><small>${s}</small></a>`).join('')}</nav>
    </div>`;
const searchBar = (placeholder = `Search ${fmt(all.length)} AI tools, or ask Radar what you need`) => `<form class="tl-search pg-search" action="/radar" method="get" role="search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>
      <input name="q" type="search" placeholder="${esc(placeholder)}" aria-label="Search AI tools, or describe what you need and ask Radar" autocomplete="off" spellcheck="false" required>
      <button type="submit" class="tl-ask" name="ask" value="1" aria-label="Ask Radar" title="Ask Radar: describe what you need">${MARK}<span>Ask Radar</span></button>
    </form>`;
// (the categories as raised chips, the one this page is about pressed in)
const catChips = (on) => `<nav class="chips pg-chips" aria-label="AI tools by category"><a class="chip${on === 'hub' ? ' on' : ''}" href="/ai-tools/"${on === 'hub' ? ' aria-current="page"' : ''}>All lists</a>${Object.keys(CATS).map((c) => `<a class="chip${on === c ? ' on' : ''}" href="${catLink(c)}"${on === c ? ' aria-current="page"' : ''}>${esc(CATS[c])}<b>${fmt(catSize(c))}</b></a>`).join('')}</nav>`;
const crumbs = (trail) => ({
  html: `<nav class="pg-crumbs" aria-label="Breadcrumb">${trail.map(([n, u], k) => (k < trail.length - 1 ? `<a href="${u}">${esc(n)}</a><i>/</i>` : `<span>${esc(n)}</span>`)).join('')}</nav>`,
  ld: { '@type': 'BreadcrumbList', itemListElement: trail.map(([n, u], k) => ({ '@type': 'ListItem', position: k + 1, name: n, item: SITE + u })) },
});
// the links button at the right of the bar, as on the site: the dots grow into a pill of icon links (his profile,
// then the links in js/data.js; the icons are main.js's)
const SOCIAL_ICONS = {
  Profile: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c.6-3.7 3.7-6.2 7.5-6.2s6.9 2.5 7.5 6.2"/>',
  Email: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  LinkedIn: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  GitHub: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  YouTube: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  Instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
};
const SITE_LINKS = (() => {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(at('js/data.js'), 'utf8'), ctx);
  return [{ label: 'Profile', href: '/#profile' }, ...(ctx.window.PORTFOLIO.links || [])];
})();
const SOCIAL = `<div class="social" id="social">
      <nav class="social-links" id="social-links" aria-label="Elsewhere" inert>${SITE_LINKS.map((l, i) => {
        const ext = /^https?:/.test(l.href);
        return `<a href="${esc(l.href)}" style="--i:${SITE_LINKS.length - 1 - i}" data-label="${esc(l.label)}" aria-label="${esc(l.label)}"${ext ? ' target="_blank" rel="noopener"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true">${SOCIAL_ICONS[l.label] || '<circle cx="12" cy="12" r="8"/>'}</svg></a>`;
      }).join('')}</nav>
      <button class="social-btn" type="button" aria-expanded="false" aria-controls="social-links" aria-label="Show links"><span class="social-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>
    </div>`;
const pages = [];
function page({ path, title, desc, body, ld = [], trail, prio = 0.6 }) {
  const c = crumbs(trail);
  const graph = { '@context': 'https://schema.org', '@graph': [c.ld, ...ld] };
  const description = sentence(desc);
  const image = `${SITE}/img/radar-og.png`;
  const imageAlt = 'Radar: the best AI tools on the radar';
  const html = `<!doctype html>
<!-- Generated by scripts/build-seo-pages.mjs from Radar's data, edit that script or the data, then run it again. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}${path}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Radar · Raunak Patil">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}${path}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${imageAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${imageAlt}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico?v=2" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
  <link rel="stylesheet" href="/css/style.css${V ? `?v=${V}` : ''}">
  <link rel="stylesheet" href="/css/pages.css${V ? `?v=${V}` : ''}">
  <script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
</head>
<body class="pg-page">
  <header class="topbar">
    <a class="brand" href="/"><span class="brand-full">Raunak Patil</span><span class="brand-short">RP</span></a>
    <nav class="tabs" aria-label="Main">
      <span class="tabs-indicator" aria-hidden="true"></span>
      <a href="/#dashboard">Dashboard</a>
      <a href="/#projects">Projects</a>
      <a href="/#library">Library</a>
      <a href="/radar" class="active">Radar</a>
    </nav>
    ${SOCIAL}
  </header>
  <main>
    <section class="tl pg-body">
      ${c.html}
      ${body}
      <p class="tl-foot">Built with ${HEART} by Raunak Patil · updated ${esc(day(TODAY))}</p>
    </section>
  </main>
  <script>
    // the black pill under the Radar tab, as on the site; and a tool opens on Radar itself, turned over
    (function () {
      var a = document.querySelector('.tabs a.active'), i = document.querySelector('.tabs-indicator');
      function place() { i.style.width = a.offsetWidth + 'px'; i.style.transform = 'translateX(' + a.offsetLeft + 'px)'; }
      i.style.transition = 'none'; place(); addEventListener('resize', place);
      if (document.fonts) document.fonts.ready.then(place);
      // (on a phone the categories are a row you swipe along: it starts at the one this page is about)
      var on = document.querySelector('.pg-chips .chip.on');
      if (on) on.parentNode.scrollLeft = on.offsetLeft - on.parentNode.offsetLeft - 10;
      // the links button: open and close as on the site
      var so = document.getElementById('social'), sb = so.querySelector('.social-btn'), sl = document.getElementById('social-links');
      function setOpen(o) { so.classList.toggle('open', o); so.closest('.topbar').classList.toggle('links-open', o); sb.setAttribute('aria-expanded', String(o)); sb.setAttribute('aria-label', o ? 'Hide links' : 'Show links'); sl.inert = !o; }
      sb.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!so.classList.contains('open')); });
      document.addEventListener('click', function (e) { if (so.classList.contains('open') && !so.contains(e.target)) setOpen(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
      document.addEventListener('click', function (e) {
        var l = e.target.closest && e.target.closest('a[data-radar]');
        if (!l || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault(); location.href = l.getAttribute('data-radar');
      });
    })();
  </script>
  <script src="/js/track.js${V ? `?v=${V}` : ''}" defer></script>
</body>
</html>
`;
  pages.push({ path, html, prio });
}
const itemList = (name, items) => ({ '@type': 'ItemList', name, numberOfItems: items.length, itemListElement: items.map((t, k) => ({ '@type': 'ListItem', position: k + 1, name: t.n, url: t.page ? SITE + t.page : t.u })) });
const intro = (html) => `<p class="pg-sub">${html}</p>`;
const count = (html) => `<p class="tl-count">${html}</p>`;
const HUB = ['Radar', '/radar'], AT = ['AI tools', '/ai-tools/'];

// ---------- category pages ----------
const catTitles = new Set();
const catDescs = new Set();
for (const c of Object.keys(CATS)) {
  const P = CAT_PAGE[c], list1 = ranked[c].filter((t) => t.src === 'pick');
  const extra = (s) => ranked[c].filter((t) => t.src === s).slice(0, 8);
  const sections = [
    ['gh', `Popular open-source ${lowH(c)}`, 'on GitHub, by stars'],
    ['hf', 'To try in the browser', 'on Hugging Face Spaces, by likes'],
    ['ph', 'Launched on Product Hunt', 'by upvotes'],
  ].filter(([s]) => extra(s).length);
  const title = `Best ${P.h} in ${YEAR}, ranked | Radar`;
  const desc = categoryDesc(c);
  if (catTitles.has(title)) throw new Error(`duplicate category title: ${title}`);
  if (catDescs.has(desc)) throw new Error(`duplicate category description: ${desc}`);
  if (desc.length > 160 || desc.length < 40 || !/[.!?]$/.test(desc) || desc.includes('…')) throw new Error(`bad category description for ${c} (${desc.length}): ${desc}`);
  catTitles.add(title);
  catDescs.add(desc);
  page({
    path: catLink(c),
    title,
    desc,
    trail: [HUB, AT, [P.h, catLink(c)]],
    prio: 0.9,
    ld: [itemList(`Best ${P.h}`, list1)],
    body: `${head(`Best ${esc(lowH(c))}`, '')}
      ${intro(`${esc(P.intro)} The ${list1.length} Raunak picked, in Radar's order, then the most popular of the other ${fmt(catSize(c) - list1.length)}. Updated for ${esc(MONTH)}.`)}
      <div class="tl-bar pg-bar">${searchBar(`Search ${fmt(catSize(c))} ${lowH(c)}, or ask Radar what you need`)}</div>
      ${catChips(c)}
      ${count(`${list1.length} hand-picked · ${fmt(catSize(c))} on Radar · <a class="tl-count-page" href="/radar?cat=${c}">See them all on Radar →</a>`)}
      ${grid(list1, { ranked: true })}
      ${sections.map(([s, h, by]) => `${sec(esc(h), by)}${grid(extra(s))}`).join('\n      ')}
      ${more(`/radar?cat=${c}`, `Browse all ${fmt(catSize(c))} ${lowH(c)} on Radar`)}`,
  });
}

// ---------- collections ----------
page({
  path: '/ai-tools/top-50',
  title: `Top 50 AI tools right now (${MONTH}) | Radar`,
  desc: `The 50 AI tools worth knowing in ${MONTH}, from ${top.slice(0, 5).map((t) => t.n).join(', ')} to the best for video, voice, music and code. Picked by hand and kept current.`,
  trail: [HUB, AT, ['Top 50', '/ai-tools/top-50']],
  prio: 0.9,
  ld: [itemList('Top 50 AI tools', top)],
  body: `${head('Top 50 AI tools', 'top')}
      ${intro(`The fifty Raunak recommends in ${esc(MONTH)}, across every kind of work, in his order.`)}
      <div class="tl-bar pg-bar">${searchBar()}</div>
      ${catChips('')}
      ${count(`Raunak's top ${top.length} · ${esc(day(TODAY))} · <a class="tl-count-page" href="/radar?view=top">See the Top 50 on Radar →</a>`)}
      ${grid(top, { ranked: true })}
      ${more('/radar?view=top', 'Open the Top 50 on Radar')}`,
});
const freeCur = curated.filter((t) => ['free', 'freemium', 'open'].includes(t.p));
page({
  path: '/ai-tools/free-ai-tools',
  title: `Free AI tools: ${freeCur.length} that cost nothing to start (${YEAR}) | Radar`,
  desc: `${freeCur.length} hand-picked AI tools that are free, have a free plan, or are open source, in every category: chat, coding, images, video, voice, music and more.`,
  trail: [HUB, AT, ['Free AI tools', '/ai-tools/free-ai-tools']],
  prio: 0.8,
  ld: [itemList('Free AI tools', freeCur)],
  body: `${head('Free AI tools', '')}
      ${intro(`${freeCur.length} of Radar's hand-picked tools you can start with for free: free outright, with a free plan, or open source. Updated for ${esc(MONTH)}.`)}
      <div class="tl-bar pg-bar">${searchBar('Search free AI tools, or ask Radar what you need')}</div>
      ${catChips('')}
      ${Object.keys(CATS).map((c) => { const l = ranked[c].filter((t) => t.src === 'pick' && freeCur.includes(t)); return l.length ? `${sec(`<a href="${catLink(c)}">${esc(CATS[c])}</a>`, `${l.length} free to start`)}${grid(l)}` : ''; }).join('\n      ')}
      ${more('/radar?price=free', 'All the free tools on Radar')}`,
});
const openCur = curated.filter((t) => t.p === 'open');
const openGh = gh.filter((t) => CATS[t.c]).sort((a, b) => b.pop - a.pop).slice(0, 60);
page({
  path: '/ai-tools/open-source-ai-tools',
  title: `Open-source AI tools: the best on GitHub (${MONTH}) | Radar`,
  desc: `Open-source AI you can run, read and change: ${openCur.slice(0, 4).map((t) => t.n).join(', ')}, and the ${openGh.length} most-starred AI projects on GitHub right now.`,
  trail: [HUB, AT, ['Open-source AI tools', '/ai-tools/open-source-ai-tools']],
  prio: 0.8,
  ld: [itemList('Open-source AI tools', [...openCur, ...openGh])],
  body: `${head('Open-source AI tools', '')}
      ${intro(`The open-source tools Raunak picked, then the ${openGh.length} most-starred AI projects on GitHub in ${esc(MONTH)}, refreshed every week.`)}
      <div class="tl-bar pg-bar">${searchBar('Search open-source AI, or ask Radar what you need')}</div>
      ${catChips('')}
      ${sec('Hand-picked', `${openCur.length} open source`)}${grid(openCur)}
      ${sec('Most-starred on GitHub', 'right now')}${grid(openGh, { ranked: true })}
      ${more('/radar?src=gh', `All ${fmt(gh.length)} open-source projects on Radar`)}`,
});
const AI_WORDS = /\b(ai|llms?|gpt[\w.-]*|agents?|agentic|models?|neural|ml|machine learning|deep learning|diffusion|transformers?|rag|embeddings?|chatbots?|vision|speech|tts|asr|stt|generative|prompts?|copilot|openai|anthropic|claude|gemini|llama|mistral|qwen|deepseek|ollama|langchain|inference|nlp|mcp|ocr|text-to-\w+|image-to-\w+|voice|lora|fine-?tun\w*|multimodal|reasoning|semantic)\b/i;
const fresh = catalogue.filter((t) => t.rel && NOW - Date.parse(t.rel) < 90 * 864e5 && t.d.length >= 24 && (t.src === 'gh' ? AI_WORDS.test(`${t.n} ${t.d}`) : t.src === 'hf' ? t.pop >= 50 : true))
  .sort((a, b) => b.rel.localeCompare(a.rel) || b.pop - a.pop).slice(0, 80);
const relDay = (t) => new Date(t.rel).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
page({
  path: '/ai-tools/new-ai-tools',
  title: `New AI tools: the latest releases (${MONTH}) | Radar`,
  desc: `The newest AI tools, newest first: open-source projects, Hugging Face apps and Product Hunt launches from the last 90 days, refreshed every week. Latest: ${fresh.slice(0, 3).map((t) => t.n).join(', ')}.`,
  trail: [HUB, AT, ['New AI tools', '/ai-tools/new-ai-tools']],
  prio: 0.9,
  ld: [itemList('New AI tools', fresh)],
  body: `${head('New AI tools', 'new')}
      ${intro(`The ${fresh.length} newest on Radar from the last 90 days, newest first, from GitHub, Hugging Face and Product Hunt. Updated ${esc(day(TODAY))}.`)}
      <div class="tl-bar pg-bar">${searchBar()}</div>
      ${catChips('')}
      ${count(`${fresh.length} new · newest first · <a class="tl-count-page" href="/radar?view=new">All new releases on Radar →</a>`)}
      ${grid(fresh, { when: relDay })}
      ${more('/radar?view=new', 'Open the new releases on Radar')}`,
});

// ---------- alternatives to each of the Top 50 (not to his own projects) ----------
const altOf = new Map();
for (const t of top.filter((x) => !x.mine)) {
  const alts = ranked[t.c].filter((x) => x !== t && !x.mine).slice(0, 16);
  const path = `/ai-tools/alternatives/${slug(t.n)}`;
  altOf.set(t, path);
  page({
    path,
    title: `Best ${t.n} alternatives in ${YEAR} (${alts.length} compared) | Radar`,
    desc: altDesc(t, alts),
    trail: [HUB, AT, [CAT_PAGE[t.c].h, catLink(t.c)], [`${t.n} alternatives`, path]],
    prio: 0.8,
    ld: [itemList(`${t.n} alternatives`, alts)],
    body: `${head(`${esc(t.n)} alternatives`, '')}
      ${intro(`${esc(t.n)}: ${esc(t.d)} If it isn't quite right, here are ${alts.length} other ${esc(lowH(t.c))}, in Radar's order, for ${esc(MONTH)}.`)}
      <div class="tl-bar pg-bar">${searchBar(`Tools like ${t.n}: describe what you need, and ask Radar`)}</div>
      ${catChips(t.c)}
      ${count(`${alts.length} alternatives · <a class="tl-count-page" href="${esc(onRadar(t))}" data-radar="${esc(onRadar(t))}">${esc(t.n)} on Radar →</a>`)}
      ${grid(alts, { ranked: true })}
      ${more(`/radar?cat=${t.c}`, `All ${fmt(catSize(t.c))} ${lowH(t.c)} on Radar`)}`,
  });
}

// (for whoever makes it: the "Listed on Radar" badge, linking back to this page, ready to copy)
const badge = (t) => {
  const snip = `<a href="${SITE}${t.page}"><img src="${SITE}/img/badges/listed-on-radar.svg" alt="${esc(t.n)} is listed on Radar" height="40"></a>`;
  return `<details class="pg-own"><summary>Make ${esc(t.n)}? Show it's listed on Radar</summary>
        <p>Add this badge to your site or README. It links to this page.</p>
        <img src="/img/badges/listed-on-radar.svg" alt="Listed on Radar" width="168" height="40">
        <pre><code>${esc(snip)}</code></pre>
        <pre><code>${esc(`[![Listed on Radar](${SITE}/img/badges/listed-on-radar.svg)](${SITE}${t.page})`)}</code></pre>
      </details>`;
};

// ---------- a page per tool: its card turned over, big, then the ones like it ----------
const APP_CAT = { chat: 'CommunicationApplication', research: 'ReferenceApplication', code: 'DeveloperApplication', agents: 'BusinessApplication', image: 'MultimediaApplication', video: 'MultimediaApplication', voice: 'MultimediaApplication', music: 'MultimediaApplication', writing: 'BusinessApplication', work: 'BusinessApplication', design: 'DesignApplication', build: 'DeveloperApplication' };
const KICK = (t) => (t.mine ? 'Built by Raunak' : t.src === 'pick' ? (t.pick ? `★ Raunak's top ${top.length} · No. ${top.indexOf(t) + 1}` : 'Hand-picked by Raunak')
  : t.src === 'gh' ? 'Open-source project' : t.src === 'ph' ? `Product Hunt launch · ▲ ${fmt(t.pop)}` : 'Hugging Face Space');
function toolPages() {
  for (const t of paged) {
    const list0 = ranked[t.c], at0 = t.rank - 1;
    const from = Math.max(0, Math.min(at0 - 4, list0.length - 9));
    const like = list0.slice(from, from + 9).filter((x) => x !== t).slice(0, 8);
    const plain = kept[keyFor(t)] ? undash(kept[keyFor(t)]) : '';
    const rel = t.src === 'pick' ? '' : ' nofollow';
    const facts = [
      ['Get it', esc(PRICE_LONG[t.p] || PRICE_LONG.na)],
      ['Category', `<a href="${catLink(t.c)}">${esc(CATS[t.c])}</a>`],
      ['Ranks', `No. ${fmt(t.rank)} of ${fmt(catSize(t.c))} in ${esc(CATS[t.c])}`],
      t.rel ? ['Released', esc(day(t.rel))] : null,
      ['On Radar', esc(FROM(t))],
      ['Website', `<a href="${esc(t.u)}" rel="noopener${rel}" target="_blank">${esc(host(t.u))}${t.full ? ` · ${esc(t.full)}` : ''}</a>`],
    ].filter(Boolean);
    const alt = altOf.get(t);
    const ld = { '@type': 'SoftwareApplication', name: t.n, description: plain || t.d, applicationCategory: APP_CAT[t.c] || 'Application', url: t.u, ...(['free', 'open'].includes(t.p) ? { offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' } } : {}) };
    const about = (plain || t.d).trim();
    const named = about.toLowerCase().startsWith(t.n.toLowerCase()) ? about : `${t.n}: ${about}`;
    page({
      path: t.page,
      title: toolTitle(t.n),
      desc: `${named} ${PRICE_LONG[t.p] || ''}. Similar: ${like.slice(0, 3).map((x) => x.n).join(', ')}.`.replace(/\s+/g, ' ').trim(),
      trail: [HUB, AT, [CAT_PAGE[t.c].h, catLink(t.c)], [t.n, t.page]],
      prio: t.src === 'pick' ? 0.7 : 0.5,
      ld: [ld],
      body: `${head(`${icon(t)}<span>${esc(t.n)}</span>`, '').replace('class="page-title"', 'class="page-title pg-tool-title"')}
      <article class="card tl-lead pg-turned">
        <span class="tool-back-kicker">${esc(KICK(t))}</span>
        <p class="pg-turned-d">${esc(t.d)}</p>
        ${plain ? `<p class="pg-turned-plain"><b>In plain words</b>${esc(plain)}</p>` : ''}
        <dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="pg-turned-go">
          <a class="tl-read" href="${esc(onRadar(t))}" data-radar="${esc(onRadar(t))}">See it on Radar <b>→</b></a>
          <a class="pg-dark-pill" href="${esc(t.u)}" rel="noopener${rel}" target="_blank">Open ${esc(host(t.u))} ↗</a>
          ${alt ? `<a class="pg-dark-pill" href="${alt}">${esc(t.n)} alternatives</a>` : ''}
        </div>
      </article>
      <div class="tl-bar pg-bar">${searchBar(`Tools like ${t.n}: describe what you need, and ask Radar`)}</div>
      ${sec(`Like ${esc(t.n)}`, `${esc(lowH(t.c))} near it on Radar`)}
      ${grid(like)}
      ${more(`/radar?cat=${t.c}`, `All ${fmt(catSize(t.c))} ${lowH(t.c)} on Radar`)}
      ${badge(t)}`,
    });
  }
}

// ---------- the hub ----------
function hub() {
  const tile = (href, title, sub, items, n) => `<a class="tool tool-front pg-tile" href="${href}">
        <span class="tool-top"><span class="pg-tile-ics">${items.slice(0, 3).map(icon).join('')}</span>${n ? `<span class="tool-pop">${n}</span>` : ''}</span>
        <h3>${title}</h3>
        <p>${sub}</p>
      </a>`;
  page({
    path: '/ai-tools/',
    title: `Best AI Tools on the Radar: ${fmt(all.length)} AI tools, ranked and updated weekly`,
    desc: `${fmt(all.length)} AI tools by category, plus the Top 50, new releases, and free and open-source picks. Updated every week.`,
    trail: [HUB, AT],
    prio: 1,
    ld: [{ '@type': 'CollectionPage', name: 'Best AI Tools on the Radar', url: `${SITE}/ai-tools/` }],
    body: `${head('Best AI tools <em>on the Radar</em>', '')}
      ${intro(`${fmt(all.length)} AI tools: ${curated.length} hand-picked by Raunak, and the best of GitHub, Hugging Face and Product Hunt, updated every week. Pick a list, or search them all on <a href="/radar">Radar</a>.`)}
      <div class="tl-bar pg-bar">${searchBar()}</div>
      ${catChips('hub')}
      ${sec('Lists', `for ${esc(MONTH)}`)}
      <div class="tl-grid">
      ${tile('/ai-tools/top-50', 'Top 50 AI tools', 'The fifty worth knowing right now, in Raunak\'s order.', top, '50')}
      ${tile('/ai-tools/new-ai-tools', 'New AI tools', 'The latest releases from GitHub, Hugging Face and Product Hunt, newest first.', fresh, fmt(fresh.length))}
      ${tile('/ai-tools/free-ai-tools', 'Free AI tools', 'Free outright, with a free plan, or open source, by category.', freeCur, fmt(freeCur.length))}
      ${tile('/ai-tools/open-source-ai-tools', 'Open-source AI tools', 'The ones Raunak picked, and the most-starred on GitHub.', openCur, fmt(openCur.length + openGh.length))}
      </div>
      ${sec('By category', 'ranked')}
      <div class="tl-grid">
      ${Object.keys(CATS).map((c) => { const l = ranked[c].filter((t) => t.src === 'pick'); return tile(catLink(c), `Best ${esc(lowH(c))}`, `${l.slice(0, 3).map((t) => esc(t.n)).join(', ')} and ${fmt(catSize(c) - 3)} more.`, l, fmt(catSize(c))); }).join('\n      ')}
      </div>
      ${sec('Alternatives', 'to the Top 50')}
      <nav class="chips pg-chips">${[...altOf].map(([t, p]) => `<a class="chip" href="${p}">${esc(t.n)} alternatives</a>`).join('')}</nav>
      ${more('/radar', `Search all ${fmt(all.length)} on Radar`)}`,
  });
}

// ---------- write it all ----------
await explained();
toolPages();
hub();
if (existsSync(at('ai-tools'))) rmSync(at('ai-tools'), { recursive: true });
for (const p of pages) {
  const file = p.path.endsWith('/') ? `${p.path}index.html` : `${p.path}.html`;
  const url = at(file.slice(1));
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, p.html);
}
// the same lists as open data (/ai-tools/radar.json): what the best-ai-tools repo builds its README from
// each week, and free for anyone to use with a link back
const pub = (t) => ({ name: t.n, url: t.u, about: t.d, plain: kept[keyFor(t)] ? undash(kept[keyFor(t)]) : undefined, category: t.c, price: t.p, from: t.src === 'pick' ? 'hand-picked' : { gh: 'github', hf: 'hugging-face', ph: 'product-hunt' }[t.src], stars: t.src === 'gh' ? t.pop : undefined, likes: t.src === 'hf' ? t.pop : undefined, upvotes: t.src === 'ph' ? t.pop : undefined, released: t.rel || undefined, rank: t.rank, mine: t.mine || undefined, page: t.page ? SITE + t.page : undefined });
writeFileSync(at('ai-tools/radar.json'), `${JSON.stringify({
  about: 'Radar (raunakpatil.com/radar): the best AI tools on the radar, updated every week. Free to use with a link to https://raunakpatil.com/radar',
  updated: TODAY, total: all.length,
  categories: Object.fromEntries(Object.keys(CATS).map((c) => [c, { name: CATS[c], title: `Best ${CAT_PAGE[c].h}`, page: SITE + catLink(c), size: catSize(c), tools: ranked[c].slice(0, 40).map(pub) }])),
  top50: top.map(pub),
  new: fresh.slice(0, 40).map(pub),
  openSource: openGh.slice(0, 30).map(pub),
  free: freeCur.map(pub),
  pages: { hub: `${SITE}/ai-tools/`, top50: `${SITE}/ai-tools/top-50`, new: `${SITE}/ai-tools/new-ai-tools`, free: `${SITE}/ai-tools/free-ai-tools`, openSource: `${SITE}/ai-tools/open-source-ai-tools`, alternatives: Object.fromEntries([...altOf].map(([t, p]) => [t.n, SITE + p])) },
})}\n`);
// the sitemap: the site's own pages, then all of these. One file: 6,000 tools do not each have a page
// (only the hand-picked ones and the catalogue names people search for), so this stays far under
// the 50,000 URL and 50MB limits and does not need a sitemap index.
const own = [['/', 1.0, 'weekly'], ['/radar', 0.9, 'daily'], ['/ronie', 0.6, 'monthly']];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${own.map(([u, p, f]) => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><changefreq>${f}</changefreq><priority>${p.toFixed(1)}</priority></url>`).join('\n')}
${pages.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${TODAY}</lastmod><priority>${p.prio.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`;
const urlCount = pages.length + own.length;
if (urlCount > 50000) throw new Error(`sitemap has ${urlCount} URLs, over the 50,000 limit; split it into a sitemap index`);
if (Buffer.byteLength(sitemap) > 50 * 1024 * 1024) throw new Error('sitemap is over 50MB; split it into a sitemap index');
if (!/^\d{4}-\d{2}-\d{2}$/.test(TODAY)) throw new Error(`sitemap lastmod is not a date: ${TODAY}`);
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
for (const p of pages) if (!listed.has(SITE + p.path)) throw new Error(`sitemap missing ${p.path}`);
for (const [u] of own) if (!listed.has(SITE + u)) throw new Error(`sitemap missing ${u}`);
writeFileSync(at('sitemap.xml'), sitemap);
const n = (re) => pages.filter((p) => re.test(p.path)).length;
console.log(`ai-tools: ${pages.length} pages (${n(/\/tool\//)} tools, ${n(/\/alternatives\//)} alternatives, ${Object.keys(CATS).length} categories, 4 collections, the hub); ${Object.keys(kept).length} plain-words lines; sitemap.xml: ${pages.length + own.length} addresses`);
