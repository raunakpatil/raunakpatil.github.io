// Builds worker/src/facts.js — the only knowledge Ronie's chat model gets — from js/data.js.
// Run after editing data.js:  node scripts/ronie-facts.mjs   (then redeploy the worker)
import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/data.js', import.meta.url), 'utf8'), ctx);
const D = ctx.window.PORTFOLIO;
const A = D.assistant;

const lines = [];
const add = (s = '') => lines.push(s);
const clean = (s) => String(s).replace(/\{[a-z]+\}/gi, 'you').replace(/\s+/g, ' ').trim();

add(`Name: ${D.name}`);
if (D.status) add(`Current status (the newest information — wherever anything below disagrees, this is right): ${clean(D.status)}`);
add(`Summary: ${clean(D.bio)}`);
add(`Email: ${A.email}`);
add(`Links: ${D.links.map((l) => `${l.label}: ${l.href.replace('mailto:', '')}`).join(' | ')}`);
add('Pages on this website: Dashboard, Projects, Library (case studies and certificates), Ronie Pocket (raunakpatil.com/ronie-pocket, the offline Android assistant and on-device image generator: no account, chat and pictures stay on the phone), and Radar (raunakpatil.com/radar) — the latest AI news headlines, open models trending on Hugging Face, and a directory of 6,000+ AI tools (a few hundred hand-picked by Raunak, the rest gathered every week from GitHub, Hugging Face and Product Hunt). More about it under Radar below.');
add(`Time spent in AI/ML: ${D.time.hours}+ hours since ${D.time.start.year} (started in ${D.time.start.city}).`);
add();
add('Experience and education (oldest first):');
for (const e of D.experience) add(`- ${e.years}: ${clean(e.org)} — ${clean(e.role)} (${e.place})`);
add();
add('Skills (with tools):');
for (const s of D.skills.items) add(`- ${s.name}: ${s.tools.join(', ')}`);
add();
add('Projects:');
const abs = (u) => !u || u === '#' ? '' : (u.startsWith('/') ? `https://raunakpatil.com${u}` : u);
for (const p of D.projects) {
  const link = abs(p.link), demo = abs(p.demo);
  add(`- ${p.title} (${p.year}, ${p.category}): ${clean(p.description)} Tech: ${p.tags.join(', ')}.${link ? ` Link: ${link}` : ''}${demo && /^https?:/.test(demo) ? ` ${(p.demoText || 'Live demo').replace(/\s*[↗→]\s*$/, '')}: ${demo}` : ''}`);
}
add();
add('Case studies from his work:');
for (const c of D.caseStudies) add(`- ${c.title} (${c.year}): ${clean(c.description)}`);
add();
add('Certifications:');
for (const c of D.certifications) add(`- ${c.title} — ${c.issuer}, ${c.date}`);
if (D.profile && D.profile.traits) {
  add();
  add('About him:');
  for (const t of D.profile.traits) add(`- ${t.title} (in his own words): ${clean(t.text)}`);
}
// the scripted story Ronie already tells (journey, what he builds, how he works, fun facts)
const story = Object.entries(A.steps)
  .filter(([id]) => /^(journey|builds|works|facts)-/.test(id))
  .map(([, s]) => clean([].concat(s.say || [])[0] || ''))
  .filter(Boolean);
if (story.length) {
  add();
  add('Things Ronie already says about him:');
  for (const s of story) add(`- ${s}`);
}

// Radar: what's on the page and how it works, so Ronie can explain it (the tools, news and models a visitor asks
// about are looked up by the worker with each question, from the same data)
{
  const T = JSON.parse(fs.readFileSync(new URL('../data/tools.json', import.meta.url), 'utf8'));
  let C = { gh: [], hf: [], ph: [] };
  try { C = JSON.parse(fs.readFileSync(new URL('../data/catalog.json', import.meta.url), 'utf8')); } catch { /* not built yet */ }
  const round = (n) => `${Math.floor(n / 100) * 100}`.replace(/\B(?=(\d{3})+$)/g, ',');
  const total = T.tools.length + C.gh.length + C.hf.length + C.ph.length;
  const top = T.tools.filter((t) => t.pick).map((t) => t.n);
  const mine = T.tools.filter((t) => t.mine).map((t) => t.n);
  add();
  add('Radar (raunakpatil.com/radar, the Radar tab on this website), what it has and how it works:');
  add('- Latest in AI: the newest AI news from TechCrunch, The Verge, Ars Technica, MIT Technology Review, The Decoder and the OpenAI, Google DeepMind, Google and Hugging Face blogs, refreshed every half hour. A large card turns through the top five stories (swipe it or use the arrows); beside or under it is the list of all the headlines, newest first, which can be filtered by topic (Policy, Models, Agents, Business, Hardware, Safety, Research and so on).');
  add('- Trending open models: the open models trending on Hugging Face this week, as a strip of coloured cards with each one\'s maker, task, likes and downloads.');
  add(`- AI Tools: a directory of ${round(total)}+ AI tools, in ${Object.keys(T.categories).length} categories (${Object.values(T.categories).join(', ')}). About ${T.tools.length} are hand-picked by Raunak; the rest come from GitHub open-source projects, Hugging Face Spaces apps and Product Hunt launches, refreshed every week.`);
  add('- Three views of the tools: Browse all tools (search the whole directory), Top 50 AI tools (what Raunak recommends right now) and New releases (the best of what was released in the last 90 days).');
  add('- Filters: Source (Everything, Raunak\'s picks, Saved, Hand-picked, GitHub, Hugging Face or Product Hunt), Price (Free, Freemium, Paid, Open source), Category, and Sort (Featured, Rising, Newest, A to Z).');
  add('- Each tool card shows what it does, its category and price. Tapping a card turns it over to a plain-words summary, how to get it, where it ranks in its category and similar tools; the arrow opens the tool\'s own site, and the heart saves it to a Saved list in that browser.');
  add('- Ask Radar: type what you want to do in plain words in the search box, like "turn my podcast into short clips", and Radar suggests the best few tools for it with a reason for each. Searching forgives misspellings.');
  add(`- Raunak's Top 50 AI tools, in order: ${top.map((n, i) => `${i + 1}. ${n}`).join('; ')}.`);
  if (mine.length) add(`- Raunak's own projects ${mine.join(', ')} are listed in the directory among the other tools, so people can find them there too.`);
}

add();
add('Glossary (use these exact meanings): RAG = retrieval-augmented generation; LLM = large language model; RLHF = reinforcement learning from human feedback; NLP = natural language processing; MARL = multi-agent reinforcement learning; ML = machine learning; ATS = applicant tracking system; SHAP = SHapley Additive exPlanations; DIAT = Defence Institute of Advanced Technology; QA = quality assurance.');

const out = `// Generated by scripts/ronie-facts.mjs from js/data.js — do not edit by hand.\nexport const FACTS = ${JSON.stringify(lines.join('\n'))};\n`;
fs.mkdirSync(new URL('../worker/src/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../worker/src/facts.js', import.meta.url), out);
console.log(`worker/src/facts.js: ${lines.length} lines, ${out.length} chars`);
