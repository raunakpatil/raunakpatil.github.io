// Audits Radar's on-page SEO on the built pages (ai-tools/ and radar.html), or, with --live, https://raunakpatil.com.
//   node scripts/audit-seo.mjs
//   node scripts/audit-seo.mjs --live
//   node scripts/audit-seo.mjs --schema     also ask validator.schema.org about one page of each kind
// Exits 1 when a check fails. Prints a Pass/Fail line per check.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, relative } from 'node:path';

const ROOT = new URL('../', import.meta.url);
const SITE = 'https://raunakpatil.com';
const live = process.argv.includes('--live');
const schema = process.argv.includes('--schema');
const MAX_URLS = 50000;
const MAX_BYTES = 50 * 1024 * 1024;

const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
};
const fail = [];
const pass = [];
const note = (ok, name, detail) => {
  (ok ? pass : fail).push(name);
  console.log(`${ok ? 'Pass' : 'Fail'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const meta = (html, key) => {
  if (key === 'title') return (html.match(/<title>(.*?)<\/title>/is) || [])[1]?.trim() || '';
  if (key === 'canonical') return (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  return (html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`)) || [])[1] || '';
};
const unescape = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');

let robots, sitemap, pages;
if (live) {
  robots = await (await fetch(`${SITE}/robots.txt`)).text();
  sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const sample = [
    `${SITE}/radar`,
    ...locs.filter((u) => /\/ai-tools\/best-ai-/.test(u)),
    ...locs.filter((u) => u.endsWith('/ai-tools/') || u.endsWith('/ai-tools')),
    ...locs.filter((u) => /\/ai-tools\/(top-50|free-ai-tools|open-source-ai-tools|new-ai-tools)$/.test(u)),
    ...locs.filter((u) => /\/ai-tools\/tool\//.test(u)).slice(0, 8),
    ...locs.filter((u) => /\/ai-tools\/alternatives\//.test(u)).slice(0, 3),
  ];
  pages = [];
  for (const url of [...new Set(sample)]) {
    const res = await fetch(url);
    pages.push({ url, html: await res.text(), status: res.status });
  }
} else {
  robots = read('robots.txt');
  sitemap = read('sitemap.xml');
  const files = [...walk(join(ROOT.pathname, 'ai-tools')), join(ROOT.pathname, 'radar.html')];
  pages = files.map((file) => ({ file: relative(ROOT.pathname, file), html: readFileSync(file, 'utf8') }));
}

const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const lastmods = [...sitemap.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map((m) => m[1]);
const locSet = new Set(locs);
const bytes = Buffer.byteLength(sitemap);

note(locs.length === lastmods.length && locs.length > 0, 'sitemap has a lastmod for every URL', `${locs.length} URLs`);
note(lastmods.every((d) => /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(d)), 'sitemap lastmod values are valid dates', [...new Set(lastmods)].join(', ') || 'none');
note(bytes <= MAX_BYTES && locs.length <= MAX_URLS, 'sitemap is within size limits', `${bytes} bytes, ${locs.length} URLs (limits ${MAX_BYTES} bytes, ${MAX_URLS} URLs)`);
note(new Set(locs).size === locs.length, 'sitemap URLs are unique', `${locs.length - new Set(locs).size} duplicates`);

const toolLocs = locs.filter((u) => u.includes('/ai-tools/tool/'));
const catLocs = locs.filter((u) => /\/ai-tools\/best-ai-[a-z0-9-]+$/.test(u));
note(catLocs.length === 12, 'sitemap lists every category page', `${catLocs.length} category URLs`);
note(toolLocs.length > 0, 'sitemap lists tool pages', `${toolLocs.length} tool URLs`);

if (!live) {
  const expected = new Set(pages.map((p) => {
    if (p.file === 'radar.html') return `${SITE}/radar`;
    if (p.file.endsWith('/index.html') || p.file === 'ai-tools/index.html') return `${SITE}/${p.file.slice(0, -'index.html'.length)}`;
    return `${SITE}/${p.file.slice(0, -'.html'.length)}`;
  }));
  const missing = [...expected].filter((u) => !locSet.has(u));
  const generated = locs.filter((u) => u.includes('/ai-tools/') || u.endsWith('/radar'));
  const extra = generated.filter((u) => !expected.has(u));
  note(missing.length === 0 && extra.length === 0, 'sitemap matches every built Radar page', missing.length || extra.length ? `missing ${missing.slice(0, 3).join(' ')} extra ${extra.slice(0, 3).join(' ')}` : `${expected.size} pages`);
}

const allows = /User-agent:\s*\*[\s\S]*?Allow:\s*\//i.test(robots) && !/Disallow:\s*\/\s*(\n|$)/i.test(robots);
const blocksTools = /Disallow:\s*\/ai-tools/i.test(robots) || /Disallow:\s*\/radar/i.test(robots);
note(allows && !blocksTools, 'robots.txt allows indexing', allows ? 'Allow: /' : 'missing Allow');
note(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt points at the sitemap', (robots.match(/Sitemap:\s*\S+/) || ['none'])[0]);

const required = ['title', 'description', 'canonical', 'og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
const missingTag = {};
const titles = new Map();
const descs = new Map();
const kinds = { radar: [], category: [], tool: [], hub: [], other: [] };
let ellipsis = 0;
let longDesc = 0;
let shortDesc = 0;
let badCanon = 0;
let ldErrors = 0;

const kindOf = (file, url) => {
  const s = file || url || '';
  if (s.includes('radar.html') || s.endsWith('/radar')) return 'radar';
  if (/best-ai-/.test(s)) return 'category';
  if (s.includes('/tool/')) return 'tool';
  if (s.endsWith('ai-tools/index.html') || s.endsWith('/ai-tools/') || s.endsWith('/ai-tools')) return 'hub';
  return 'other';
};

for (const page of pages) {
  const html = page.html;
  const kind = kindOf(page.file, page.url);
  kinds[kind].push(page);
  if (page.status && page.status !== 200) badCanon++;
  for (const key of required) if (!meta(html, key)) missingTag[key] = (missingTag[key] || 0) + 1;
  const title = unescape(meta(html, 'title'));
  const desc = unescape(meta(html, 'description'));
  const canon = meta(html, 'canonical');
  if (title) titles.set(title, [...(titles.get(title) || []), page.file || page.url]);
  if (desc) descs.set(desc, [...(descs.get(desc) || []), page.file || page.url]);
  if (desc.includes('…') || desc.endsWith('...')) ellipsis++;
  if (desc.length > 160) longDesc++;
  if (desc.length < 50) shortDesc++;
  if (canon && !locSet.has(canon)) badCanon++;
  if (meta(html, 'og:url') && canon && meta(html, 'og:url') !== canon) badCanon++;
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1]);
  if (blocks.length !== 1) ldErrors++;
  else {
    try {
      const data = JSON.parse(blocks[0]);
      const nodes = data['@graph'] || [data];
      const types = new Set(nodes.map((n) => n['@type']));
      if (data['@context'] !== 'https://schema.org') ldErrors++;
      if (kind === 'tool' && !types.has('SoftwareApplication')) ldErrors++;
      if (kind === 'category' && !types.has('ItemList')) ldErrors++;
      if (kind !== 'radar' && !types.has('BreadcrumbList')) ldErrors++;
      if (kind === 'radar' && data['@type'] !== 'WebSite' && !types.has('WebSite')) ldErrors++;
      for (const n of nodes) {
        if (n['@type'] === 'BreadcrumbList') {
          const els = n.itemListElement || [];
          if (els.map((e) => e.position).join() !== els.map((_, i) => i + 1).join()) ldErrors++;
          if (els.some((e) => !e.name || typeof e.item !== 'string' || !e.item.startsWith('https://'))) ldErrors++;
        }
        if (n['@type'] === 'ItemList') {
          const els = n.itemListElement || [];
          if (n.numberOfItems !== els.length || !els.length) ldErrors++;
          if (els.some((e) => e['@type'] !== 'ListItem' || !e.name || typeof e.url !== 'string' || !e.url.startsWith('http'))) ldErrors++;
        }
        if (n['@type'] === 'SoftwareApplication') {
          if (!n.name || !n.description || typeof n.url !== 'string' || !n.url.startsWith('http')) ldErrors++;
        }
      }
    } catch { ldErrors++; }
  }
}

note(Object.keys(missingTag).length === 0, 'titles, descriptions, canonical, Open Graph and Twitter tags', Object.keys(missingTag).length ? Object.entries(missingTag).map(([k, n]) => `${k} missing on ${n}`).join('; ') : `${pages.length} pages`);
note(ellipsis === 0, 'meta descriptions are not cut off with an ellipsis', ellipsis ? `${ellipsis} still end in an ellipsis` : 'none');
note(longDesc === 0, 'meta descriptions are within 160 characters', longDesc ? `${longDesc} are longer` : `max ok on ${pages.length} pages`);
note(shortDesc === 0, 'meta descriptions are at least 50 characters', shortDesc ? `${shortDesc} are shorter` : 'none are thin');
note(badCanon === 0, 'canonical and og:url agree and the canonical is in the sitemap', badCanon ? `${badCanon} mismatches` : 'all agree');

const dupTitles = [...titles].filter(([, ps]) => ps.length > 1);
const dupDescs = [...descs].filter(([, ps]) => ps.length > 1);
const catTitles = kinds.category.map((p) => unescape(meta(p.html, 'title')));
const catDescs = kinds.category.map((p) => unescape(meta(p.html, 'description')));
note(kinds.category.length === 12 && new Set(catTitles).size === 12, 'each category page has a unique title', catTitles.length ? `${new Set(catTitles).size} distinct` : 'no category pages in this run');
note(kinds.category.length === 12 && new Set(catDescs).size === 12 && catDescs.every((d) => d.length <= 160 && /[.!?]$/.test(d)), 'each category page has a unique templated description', catDescs.length ? `${new Set(catDescs).size} distinct` : 'no category pages in this run');
note(dupTitles.length === 0, 'no duplicated titles', dupTitles.length ? dupTitles.slice(0, 3).map(([t]) => t).join(' | ') : `${titles.size} titles`);
note(dupDescs.length === 0, 'no duplicated meta descriptions', dupDescs.length ? `${dupDescs.length} shared` : `${descs.size} descriptions`);
note(ldErrors === 0 && kinds.tool.length > 0 && kinds.category.length > 0, 'JSON-LD: SoftwareApplication, ItemList and BreadcrumbList', ldErrors ? `${ldErrors} pages failed structural checks` : `${kinds.tool.length} tools, ${kinds.category.length} categories, radar ${kinds.radar.length}`);

if (schema) {
  const samples = [
    ['radar', kinds.radar[0]],
    ['category', kinds.category[0]],
    ['tool', kinds.tool[0]],
    ['hub', kinds.hub[0]],
  ].filter(([, p]) => p);
  let schemaFail = 0;
  for (const [name, page] of samples) {
    const block = (page.html.match(/<script type="application\/ld\+json">.*?<\/script>/s) || [])[0] || '';
    const html = `<!doctype html><html><head>${block}</head><body></body></html>`;
    const res = await fetch('https://validator.schema.org/validate', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ html }) });
    const body = (await res.text()).replace(/^\)\]\}'\n/, '');
    const data = JSON.parse(body);
    const errors = data.totalNumErrors || 0;
    if (errors) schemaFail++;
    console.log(`  schema.org ${name}: ${errors} errors, ${data.totalNumWarnings || 0} warnings`);
  }
  note(schemaFail === 0, 'JSON-LD validates against schema.org', `${samples.length} sample pages`);
}

if (!live) {
  const lists = ['/ai-tools/top-50', '/ai-tools/new-ai-tools', '/ai-tools/free-ai-tools', '/ai-tools/open-source-ai-tools'];
  const listFiles = new Set(lists.map((href) => `${href.slice(1)}.html`));
  const listPages = pages.filter((p) => listFiles.has(p.file) || /best-ai-/.test(p.file) || p.file.includes('/tool/') || p.file.includes('/alternatives/'));
  let missingListLink = 0;
  for (const p of listPages) for (const href of lists) if (!p.html.includes(`href="${href}"`)) missingListLink++;
  note(listPages.length > 1000 && missingListLink === 0, 'category, tool, alternatives and collection pages link the four lists', missingListLink ? `${missingListLink} missing links across ${listPages.length} pages` : `${listPages.length} pages`);

  const byFile = new Map(pages.map((p) => [p.file, p.html]));
  let orphanTools = 0;
  let factsMissing = 0;
  for (const p of pages) {
    if (!p.file.startsWith('ai-tools/best-ai-')) continue;
    if (!p.html.includes('Radar lists ')) factsMissing++;
  }
  for (const p of pages.filter((x) => x.file.includes('/tool/'))) {
    const cat = (p.html.match(/<dt>Category<\/dt><dd><a href="([^"]+)">/) || [])[1];
    const self = (p.html.match(/<link rel="canonical" href="https:\/\/raunakpatil\.com(\/ai-tools\/tool\/[^"]+)"/) || [])[1];
    const catFile = cat ? `ai-tools${cat.slice('/ai-tools'.length)}.html` : '';
    const catHtml = byFile.get(catFile) || '';
    if (!self || !catHtml.includes(`href="${self}"`)) orphanTools++;
  }
  note(factsMissing === 0 && kinds.category.length === 12, 'each category page states how its list breaks down', factsMissing ? `${factsMissing} missing the catalogue counts` : '12 pages');
  note(orphanTools === 0, 'every tool page is linked from its category page', orphanTools ? `${orphanTools} tool pages have no category link` : `${kinds.tool.length} tool pages`);

  const smDate = new Map([...sitemap.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
  let dateMismatch = 0;
  for (const p of pages.filter((x) => x.file.startsWith('ai-tools/'))) {
    const canon = meta(p.html, 'canonical');
    const updated = (p.html.match(/<meta name="page-updated" content="([^"]*)"/) || [])[1] || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(updated) || smDate.get(canon) !== updated) dateMismatch++;
  }
  note(dateMismatch === 0, 'page-updated matches the sitemap lastmod', dateMismatch ? `${dateMismatch} pages differ` : 'all directory pages');

  let headSm = '';
  try { headSm = execSync('git show HEAD:sitemap.xml', { encoding: 'utf8' }); } catch { headSm = ''; }
  const headDate = new Map([...headSm.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
  const ownFiles = [['https://raunakpatil.com/', 'index.html'], ['https://raunakpatil.com/radar', 'radar.html'], ['https://raunakpatil.com/ronie', 'ronie.html']];
  let ownBad = 0;
  for (const [url, file] of ownFiles) {
    let changed = true;
    try { execSync(`git diff --quiet HEAD -- ${file}`, { stdio: 'ignore' }); changed = false; } catch { changed = true; }
    const cur = smDate.get(url) || '';
    const prev = headDate.get(url) || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cur)) ownBad++;
    else if (!changed && prev && cur !== prev) ownBad++;
  }
  note(ownBad === 0, 'rebuilding the directory does not restamp /, /radar or /ronie', ownBad ? `${ownBad} own URLs moved` : 'kept');

  const generated = [...pages.filter((p) => p.file.startsWith('ai-tools/')).map((p) => p.html), sitemap, read('ai-tools/radar.json')].join('\n');
  const hedra = /\bhedra\b/i.test(generated) || /hedra\.com/i.test(generated) || generated.includes('/tool/hedra');
  note(!hedra, 'Hedra stays out of the public directory, sitemap and radar.json', hedra ? 'found a name, slug or hedra.com link' : 'absent');
}

console.log(`\n${pass.length} passed, ${fail.length} failed${live ? ' (live sample)' : ' (build output)'}`);
if (fail.length) process.exit(1);
