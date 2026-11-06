// Builds data/catalog.json — the long tail of Radar's directory of AI tools, beside the hand-picked data/tools.json:
//  - open-source AI projects on GitHub (the most-starred under a set of AI topics),
//  - AI apps on Hugging Face Spaces (the most-liked ones that are up and running), and
//  - AI products launched on Product Hunt (the most upvoted; with a PRODUCTHUNT_TOKEN).
// Each gets one of the directory's categories from its own words, the day it was released — the GitHub project or
// the Space created, the Product Hunt launch, for "New releases" — and how fast it's rising (for the Rising sort). Nothing is listed twice — not a tool already hand-picked,
// not two entries with the same name or the same description (the most popular one stays), not a copied Space.
// Run weekly by .github/workflows/refresh-radar.yml, or by hand:
//   node scripts/build-catalog.mjs     (GITHUB_TOKEN in the environment, or a logged-in `gh`, for GitHub)
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { isExcluded } from './excluded-tools.mjs';

const TOKEN = process.env.GITHUB_TOKEN || (() => { try { return execSync('gh auth token', { encoding: 'utf8' }).trim(); } catch { return ''; } })();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// it's a portfolio: adult content, "undress" and face-swap / deepfake apps, and the like, stay out
const SKIP = /\b(nsfw|uncensored|porn\w*|hentai|nude\w*|nudify|undress\w*|sex\w*|erotic\w*|onlyfans|deep-?nude|deepfakes?|face-?swap\w*|faceswap|roop|waifu|lewd|eros|jailbreak\w*|crack(ed)?|keygen|cheat\w*|aimbot|casino|gambl\w*|betting|crypto|airdrop|telegram bot|spam\w*|scrap(er|ing) (instagram|tiktok))\b/i;
// lists, courses and books are worth reading, but they aren't tools
const NOT_TOOLS = /^awesome|\bawesome[- ]|curated list|\b(list|collection) of\b|\b(course|courses|tutorials?|lessons|roadmap|interview|cheat ?sheet|book|papers? (list|reading)|notes|homework|leetcode|study guide|learning path|from scratch|\d+[- ]days?(-of)?|examples|samples|cookbook|recipes|resources|starter kit|boilerplate|template|playground)\b/i;

// (a name is read as words — "llms-from-scratch", "DeepLearningExamples" — and the page is in English: descriptions
// written mostly in another script are left to directories for those readers)
const words = (n) => n.replace(/[-_.]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
const foreign = (d) => (d.match(/[^\x00-ɏ -⯿\u{1f000}-\u{1faff}\s]/gu) || []).length > d.length * 0.25;
const notTool = (name, desc) => NOT_TOOLS.test(`${words(name)} ${desc}`) || foreign(desc);

// the directory's categories, guessed from a project's name, description and topics (first match wins)
const CATS = [
  ['music', /\b(music|song|songs|melod\w*|beats?|singing|singer|lyrics|midi|instrumental)\b/i],
  ['video', /\b(video|videos|animat\w*|motion|lip-?sync|talking[- ]head|film|movie|frames?)\b/i],
  ['voice', /\b(speech|tts|text-to-speech|voice|voices|audio|transcri\w*|whisper|asr|speaker|podcast|dubbing)\b/i],
  ['design', /\b(3d|mesh|meshes|gaussian|nerf|point ?cloud|avatar|ui design|figma|cad|sketch to|svg|vector)\b/i],
  ['image', /(diffusion|illusion|comic)|\b(image|images|flux|sdxl|comfyui|photo\w*|pictures?|upscal\w*|inpaint\w*|background|logo|art|artwork|illustrat\w*|drawings?|paint\w*|anime|portraits?|text-to-image|img2img|segment\w*|ocr|vision|detection|depth)\b/i],
  ['research', /\b(search|research|papers?|arxiv|leaderboards?|benchmarks?|arena|evaluat\w*|evals?|scholar|citations?|knowledge graph)\b/i],
  ['code', /\b(code|coding|coder|programming|developer tools?|ide|copilot|vibe[- ]coding|app builder|terminal|cli|devtools?|sql)\b/i],
  ['agents', /\b(agents?|agentic|automation|automate|workflows?|browser[- ]use|computer[- ]use|rpa|multi-agent|autonomous|mcp)\b/i],
  ['writing', /\b(writ\w*|essay|story|stories|novel|translat\w*|summar\w*|grammar|paraphras\w*|copywriting|blog)\b/i],
  ['work', /\b(notes?|meeting|calendar|email|documents?|pdf|productivity|slides|presentation|spreadsheet|excel|notion|obsidian|resume)\b/i],
  ['chat', /\b(chat\w*|assistant|chatbot|conversation\w*|gpt|llms?|language models?|qwen|llama|deepseek|gemma|mistral|claude)\b/i],
];
// (its own name and description first; its tags only when those say nothing)
const catOf = (own, tags, fallback) => (CATS.find(([, re]) => re.test(own)) || CATS.find(([, re]) => re.test(tags)) || [fallback])[0];
const tidy = (s, n = 140) => {
  const t = String(s || '').replace(/:[a-z0-9_+-]+:/g, '').replace(/\s*\u2014\s*(?=[.,!?)])/g, '').replace(/\s*\u2014\s*/g, ', ').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t;
};

/* ---------- GitHub ---------- */
const TOPICS = ['llm', 'large-language-models', 'ai-agents', 'agents', 'generative-ai', 'chatgpt', 'openai', 'rag', 'llmops',
  'stable-diffusion', 'diffusion-models', 'text-to-speech', 'speech-recognition', 'text-to-image', 'text-to-video',
  'ai-tools', 'mcp', 'ollama', 'langchain', 'artificial-intelligence', 'ai', 'machine-learning', 'deep-learning',
  'computer-vision', 'nlp', 'multimodal', 'ai-coding', 'vector-database', 'prompt-engineering', 'local-llm'];
async function gh(path) {
  for (let tries = 0; tries < 4; tries++) {
    const r = await fetch(`https://api.github.com/${path}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'raunakpatil.com tools', ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) } });
    if (r.ok) return r.json();
    if (r.status === 403 || r.status === 429) { await sleep(20000); continue; }   // (search allows 30 calls a minute)
    if (r.status === 422) return { items: [] };                                   // (past the 1000th result)
    throw new Error(`GitHub ${r.status} for ${path}`);
  }
  throw new Error(`GitHub kept refusing ${path}`);
}
async function github() {
  const repos = new Map();
  for (const t of TOPICS) {
    for (let page = 1; page <= 10; page++) {
      const j = await gh(`search/repositories?q=${encodeURIComponent(`topic:${t} stars:>=1000 archived:false fork:false`)}&sort=stars&order=desc&per_page=100&page=${page}`);
      for (const r of j.items || []) repos.set(r.full_name, r);
      await sleep(2100);
      if ((j.items || []).length < 100) break;
    }
    process.stdout.write(`\rGitHub: ${repos.size} projects after "${t}"        `);
  }
  console.log();
  const out = [];
  for (const r of repos.values()) {
    const text = `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`;
    if (!r.description || SKIP.test(text) || notTool(r.name, r.description)) continue;
    const name = r.name.replace(/[-_]+/g, (m) => (m === '_' ? ' ' : '-'));
    if (isExcluded({ name, url: r.homepage || '', slug: r.name, text: `${r.description || ''} ${r.homepage || ''}` })) continue;
    out.push([name, r.full_name, tidy(r.description), r.stargazers_count, catOf(`${r.name} ${r.description}`, (r.topics || []).join(' '), 'build'), r.owner.id, (r.created_at || '').slice(0, 10)]);
  }
  return out.sort((a, b) => b[3] - a[3]);
}

/* ---------- Hugging Face Spaces ---------- */
const COLORS = ['red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'gray'];
async function spaces(max = 4500) {
  const out = [];
  let url = 'https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=1000&expand[]=cardData&expand[]=likes&expand[]=runtime&expand[]=tags&expand[]=createdAt';
  let seen = 0;
  while (url && seen < max) {
    const r = await fetch(url, { headers: { 'User-Agent': 'raunakpatil.com tools' } });
    if (!r.ok) throw new Error(`Hugging Face ${r.status}`);
    const list = await r.json();
    seen += list.length;
    for (const s of list) {
      const c = s.cardData || {};
      const title = tidy(c.title || s.id.split('/')[1].replace(/[-_]+/g, ' '), 60);
      const desc = tidy(c.short_description || '');
      const text = `${s.id} ${title} ${desc} ${(c.tags || []).join(' ')} ${(s.tags || []).join(' ')} ${(c.models || []).join(' ')}`;
      if (s.runtime?.stage !== 'RUNNING' || !desc || (s.likes || 0) < 40 || c.duplicated_from || SKIP.test(text) || notTool(title, desc)) continue;
      if (isExcluded({ name: title, url: `https://huggingface.co/spaces/${s.id}`, slug: s.id.split('/').pop(), text: `${s.id} ${title} ${desc}` })) continue;
      out.push([title, s.id, desc, s.likes, catOf(`${s.id} ${title} ${desc}`, text, 'build'), c.emoji || '🤗', COLORS.includes(c.colorFrom) ? c.colorFrom : 'gray', COLORS.includes(c.colorTo) ? c.colorTo : 'gray', (s.createdAt || '').slice(0, 10)]);
    }
    process.stdout.write(`\rHugging Face: ${out.length} spaces kept of ${seen}        `);
    url = (r.headers.get('link') || '').match(/<([^>]+)>;\s*rel="next"/)?.[1] || null;
  }
  console.log();
  return out;
}

/* ---------- Product Hunt ---------- */
// AI products launched on Product Hunt in the last couple of years, most upvoted first — where the paid and freemium
// apps come from. Needs a Product Hunt developer token (PRODUCTHUNT_TOKEN, a GitHub secret for the Action); without
// one, the last catalogue's list is kept as it was.
const PH_TOKEN = process.env.PRODUCTHUNT_TOKEN || '';
async function gql(query, variables = {}) {
  for (let tries = 0; tries < 4; tries++) {
    const r = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PH_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'raunakpatil.com radar' },
      body: JSON.stringify({ query, variables }),
    });
    if (r.status === 429) { await sleep(60000); continue; }   // (its limit resets every 15 minutes; a minute's wait is usually enough)
    const j = await r.json();
    if (j.errors?.length) throw new Error(`Product Hunt: ${j.errors[0].message}`);
    return j.data;
  }
  throw new Error('Product Hunt kept refusing');
}
// its labels for price, in the directory's words
const PH_PRICE = (v) => (/free_?options|freemium/i.test(v || '') ? 'freemium' : /payment|paid/i.test(v || '') ? 'paid' : /free/i.test(v || '') ? 'free' : '');
async function producthunt() {
  // (whether its posts carry a price label is checked first, so the query only asks for fields that exist)
  const fields = (await gql('{ __type(name: "Post") { fields { name } } }')).__type.fields.map((f) => f.name);
  const extra = ['pricingType'].filter((f) => fields.includes(f)).join(' ');
  const after = new Date(Date.now() - 730 * 864e5).toISOString();
  const out = [];
  let cursor = null;
  for (let page = 0; page < 60; page++) {
    const d = await gql(`query($after: DateTime, $cursor: String) {
      posts(topic: "artificial-intelligence", order: VOTES, postedAfter: $after, first: 20, after: $cursor) {
        pageInfo { endCursor hasNextPage }
        edges { node { name tagline slug website votesCount createdAt thumbnail { url } topics(first: 6) { edges { node { slug } } } ${extra} } }
      } }`, { after, cursor });
    for (const { node: p } of d.posts.edges) {
      const tags = p.topics.edges.map((e) => e.node.slug).join(' ');
      if (!p.tagline || p.votesCount < 150 || SKIP.test(`${p.name} ${p.tagline} ${tags}`) || notTool(p.name, p.tagline)) continue;
      if (isExcluded({ name: p.name, url: p.website || '', slug: p.slug, text: `${p.tagline} ${p.website || ''}` })) continue;
      out.push([tidy(p.name, 60), p.slug, tidy(p.tagline), p.votesCount, catOf(`${p.name} ${p.tagline}`, tags.replace(/-/g, ' '), 'work'),
        p.thumbnail?.url || '', PH_PRICE(p.pricingType), p.website || `https://www.producthunt.com/posts/${p.slug}`, (p.createdAt || '').slice(0, 10)]);
    }
    process.stdout.write(`\rProduct Hunt: ${out.length} kept after ${page + 1} pages        `);
    if (!d.posts.pageInfo.hasNextPage) break;
    cursor = d.posts.pageInfo.endCursor;
    await sleep(1500);
  }
  console.log();
  return out.sort((a, b) => b[3] - a[3]);
}

/* ---------- once each, since when, and how fast it's rising ---------- */
// data/catalog.json is what the page loads: each entry ends with the day it was released and how fast it's rising
// (stars, likes or upvotes gained a day). What only this script needs — the day each one joined Radar, and its last
// few counts, to measure the rise — is kept apart, in data/catalog-state.json, so visitors never download it.
const FILE = new URL('../data/catalog.json', import.meta.url);
const STATE = new URL('../data/catalog-state.json', import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const prev = (() => { try { return JSON.parse(readFileSync(FILE, 'utf8')); } catch { return null; } })();
const state = (() => { try { return JSON.parse(readFileSync(STATE, 'utf8')); } catch { return { joined: {}, pop: {} }; } })();
// (catalogues before v3 kept the joined date in the entry itself)
if (prev?.v === 2) {
  for (const r of prev.gh || []) state.joined[`gh:${r[1]}`] ||= r[6];
  for (const r of prev.hf || []) state.joined[`hf:${r[1]}`] ||= r[8];
  for (const r of prev.ph || []) state.joined[`ph:${r[1]}`] ||= r[8];
}
const firstRun = !Object.keys(state.joined).length;

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const curated = JSON.parse(readFileSync(new URL('../data/tools.json', import.meta.url), 'utf8')).tools;
const names = new Set(curated.map((t) => norm(t.n)));
const links = new Set(curated.map((t) => t.u.toLowerCase().replace(/\/$/, '')));
const blurbs = new Set();
// (each list comes most popular first, so the first of any two alike is the one kept)
const once = (url, name, desc) => {
  const n = norm(name), d = norm(desc).slice(0, 80);
  if (links.has(url.toLowerCase()) || names.has(n) || (d.length > 20 && blurbs.has(d))) return false;
  names.add(n);
  if (d.length > 20) blurbs.add(d);
  return true;
};

const days = (d) => (Date.parse(today) - Date.parse(d)) / 864e5;
// a day's gain, measured from a count 3–21 days old; until there is one, for something released in the last 120 days,
// its average since then (an old giant's lifetime average says nothing about now, so it waits to be measured)
function rise(key, pop, rel) {
  const past = (state.pop[key] || []).filter(([d]) => d !== today);
  const base = past.filter(([d]) => days(d) >= 3 && days(d) <= 21).sort((a, b) => a[0].localeCompare(b[0]))[0];
  state.pop[key] = [...past.slice(-5), [today, pop]];
  const r = base ? (pop - base[1]) / days(base[0]) : rel && days(rel) <= 120 ? pop / Math.max(14, days(rel)) : 0;
  return Math.max(0, Math.round(r * 10) / 10);
}
const keep = new Set();
const entry = (src, r, at) => {
  const key = `${src}:${r[1]}`, rel = r[at] || '';
  keep.add(key);
  state.joined[key] ||= firstRun ? rel || today : today;
  return [...r.slice(0, at), rel, rise(key, r[3], rel)];
};

const [hfAll, ghAll] = [await spaces(), await github()];
// (without a token, the last list is kept — brought back to the shape the fetch gives: released last)
const phAll = PH_TOKEN ? await producthunt() : (console.log('Product Hunt: no PRODUCTHUNT_TOKEN — keeping the last list'),
  (prev?.ph || []).map((r) => [...r.slice(0, 8), prev.v === 2 ? r[9] || r[8] : r[8]]));
// (a second pass: a name, slug or blocked domain kept from an earlier run, or one the fetch above missed)
const allowed = (r, url, slug) => !isExcluded({ name: r[0], url, slug, text: r[2] });
const repos = ghAll.filter((r) => allowed(r, `https://github.com/${r[1]}`, String(r[1]).split('/').pop()) && once(`https://github.com/${r[1]}`, r[0], r[2])).map((r) => entry('gh', r, 6));
const hf = hfAll.filter((r) => allowed(r, `https://huggingface.co/spaces/${r[1]}`, String(r[1]).split('/').pop()) && once(`https://huggingface.co/spaces/${r[1]}`, r[0], r[2])).map((r) => entry('hf', r, 8));
const ph = phAll.filter((r) => allowed(r, r[7], r[1]) && once(r[7], r[0], r[2])).map((r) => entry('ph', r, 8));
const added = [...keep].filter((k) => state.joined[k] === today).length;
for (const k of Object.keys(state.joined)) if (!keep.has(k)) delete state.joined[k];
for (const k of Object.keys(state.pop)) if (!keep.has(k)) delete state.pop[k];

// one entry to a line, so each run's change is a small diff
const lines = (rows) => rows.map((r) => `    ${JSON.stringify(r)}`).join(',\n');
writeFileSync(FILE, `{\n  "v": 3,\n  "updated": "${today}",\n  "gh": [\n${lines(repos)}\n  ],\n  "hf": [\n${lines(hf)}\n  ],\n  "ph": [\n${lines(ph)}\n  ]\n}\n`);
const obj = (o) => Object.keys(o).sort().map((k) => `    ${JSON.stringify(k)}: ${JSON.stringify(o[k])}`).join(',\n');
writeFileSync(STATE, `{\n  "joined": {\n${obj(state.joined)}\n  },\n  "pop": {\n${obj(state.pop)}\n  }\n}\n`);
const kept = repos.length + hf.length + ph.length, seen = ghAll.length + hfAll.length + phAll.length;
console.log(`data/catalog.json: ${repos.length} GitHub projects, ${hf.length} Hugging Face spaces, ${ph.length} Product Hunt launches (${seen - kept} repeats and look-alikes dropped, ${added} new today)`);
