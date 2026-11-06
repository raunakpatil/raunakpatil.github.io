// Builds radar.html — what raunakpatil.com/radar serves — from index.html: the same site, with Radar's own title,
// description and address, and a plain list of the hand-picked tools and the latest headlines for search engines that
// don't run the page's script (the script shows the real page instead; html.js hides the list). Run it whenever
// index.html changes, before deploying — the Refresh Radar Action runs it too, to keep the list current:
//   node scripts/build-radar-page.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { isExcluded } from './excluded-tools.mjs';

const at = (p) => new URL(`../${p}`, import.meta.url);
const html = readFileSync(at('index.html'), 'utf8');
const tools = JSON.parse(readFileSync(at('data/tools.json'), 'utf8'));
const feed = (() => { try { return JSON.parse(readFileSync(at('data/feed.json'), 'utf8')); } catch { return { news: [] }; } })();
const catalog = (() => { try { return JSON.parse(readFileSync(at('data/catalog.json'), 'utf8')); } catch { return { gh: [], hf: [], ph: [] }; } })();
// the same exclusion as the page build, so a listed tool in data/excluded-tools.json never reaches /radar's index
tools.tools = tools.tools.filter((t) => !isExcluded({ name: t.n, url: t.u }));
catalog.gh = (catalog.gh || []).filter((r) => !isExcluded({ name: r[0], url: `https://github.com/${r[1]}`, slug: String(r[1] || '').split('/').pop(), text: r[2] }));
catalog.hf = (catalog.hf || []).filter((r) => !isExcluded({ name: r[0], url: `https://huggingface.co/spaces/${r[1]}`, slug: String(r[1] || '').split('/').pop(), text: r[2] }));
catalog.ph = (catalog.ph || []).filter((r) => !isExcluded({ name: r[0], url: r[7], slug: r[1], text: r[2] }));
const slug = (n) => n.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tool';   // (as scripts/build-seo-pages.mjs names the tool pages)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const total = tools.tools.length + (catalog.gh?.length || 0) + (catalog.hf?.length || 0) + (catalog.ph?.length || 0);
const count = `${Math.floor(total / 100) * 100}+`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const TITLE = `Best AI Tools on the Radar: ${count} AI tools, AI news and trending models`;
const DESC = `Find an AI tool among ${count} ranked by category, with a Top 50, new releases and this week's AI news. Ask Radar in plain words.`;
if (DESC.length > 160) throw new Error(`radar description is ${DESC.length} characters`);
const swap = (s, re, to) => { if (!re.test(s)) throw new Error(`radar page: not found ${re}`); return s.replace(re, to); };
let page = html;
page = swap(page, /<title>[^<]*<\/title>/, `<title>${esc(TITLE)}</title>`);
page = swap(page, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(DESC)}">`);
page = swap(page, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(TITLE)}">`);
page = swap(page, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(DESC)}">`);
page = swap(page, /<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="https://raunakpatil.com/radar">');
page = swap(page, /<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://raunakpatil.com/radar">');
page = swap(page, /<meta property="og:image" content="[^"]*">/, '<meta property="og:image" content="https://raunakpatil.com/img/radar-og.png">');
page = swap(page, /<meta property="og:image:alt" content="[^"]*">/, '<meta property="og:image:alt" content="Radar: the best AI tools on the radar">');
page = swap(page, /<meta name="twitter:card" content="summary_large_image">/, `<meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(TITLE)}">
  <meta name="twitter:description" content="${esc(DESC)}">
  <meta name="twitter:image" content="https://raunakpatil.com/img/radar-og.png">
  <meta name="twitter:image:alt" content="Radar: the best AI tools on the radar">`);
// (what the page is, for search engines: a collection of AI tools that can be searched)
const LD = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Radar', alternateName: 'Best AI Tools on the Radar', url: 'https://raunakpatil.com/radar', description: DESC, potentialAction: { '@type': 'SearchAction', target: 'https://raunakpatil.com/radar?q={q}', 'query-input': 'required name=q' } };
page = swap(page, /<\/head>/, `  <script type="application/ld+json">${JSON.stringify(LD)}</script>\n</head>`);

const cats = tools.categories;
const picked = tools.tools;
const seo = `
        <div class="tl-seo">
          <h2>Latest in AI</h2>
          <ul>${feed.news.slice(0, 12).map((n) => `<li><a href="${esc(n.link)}">${esc(n.title)}</a> · ${esc(n.source)}</li>`).join('')}</ul>
          <h2><a href="/ai-tools/">Best AI tools on the Radar</a></h2>
          <ul><li><a href="/ai-tools/top-50">Top 50 AI tools</a></li><li><a href="/ai-tools/new-ai-tools">New AI tools</a></li><li><a href="/ai-tools/free-ai-tools">Free AI tools</a></li><li><a href="/ai-tools/open-source-ai-tools">Open-source AI tools</a></li>${['best-ai-chatbots', 'best-ai-research-tools', 'best-ai-coding-tools', 'best-ai-agents', 'best-ai-image-generators', 'best-ai-video-tools', 'best-ai-voice-tools', 'best-ai-music-generators', 'best-ai-writing-tools', 'best-ai-productivity-tools', 'best-ai-design-tools', 'best-ai-developer-tools'].map((s) => `<li><a href="/ai-tools/${s}">${esc(s.replace(/-/g, ' ').replace(/\bai\b/, 'AI').replace(/^b/, 'B'))}</a></li>`).join('')}</ul>
          <h2>Hand-picked AI tools</h2>
          ${Object.entries(cats).map(([k, v]) => `<h3>${esc(v)}</h3><ul>${picked.filter((t) => t.c === k).map((t) => `<li><a href="/ai-tools/tool/${slug(t.n)}">${esc(t.n)}</a>: ${esc(t.d)}</li>`).join('')}</ul>`).join('\n          ')}
        </div>`;
page = swap(page, /(<section class="view tl" data-view="radar" hidden>)/, `$1${seo}`);
const note = '<!-- Generated by scripts/build-radar-page.mjs from index.html, edit index.html, then run it again. -->\n';
writeFileSync(at('radar.html'), page.replace('<!doctype html>\n', `<!doctype html>\n${note}`));
console.log(`radar.html: ${picked.length} hand-picked tools and ${Math.min(12, feed.news.length)} headlines for search engines; ${count} tools in the description`);
