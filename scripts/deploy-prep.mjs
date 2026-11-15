// Before every deploy: a new ?v= for the site's files (so browsers fetch the new ones), then radar.html rebuilt
// from index.html (scripts/build-radar-page.mjs) so /radar matches, and the /ai-tools pages with the same ?v=
// (scripts/build-seo-pages.mjs).   node scripts/deploy-prep.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const v = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
for (const name of ['index.html', 'ronie-pocket/index.html']) {
  const file = new URL(`../${name}`, import.meta.url);
  const html = readFileSync(file, 'utf8');
  const n = (html.match(/\?v=\d{14}/g) || []).length;
  if (!n) continue;
  writeFileSync(file, html.replace(/\?v=\d{14}/g, `?v=${v}`));
  console.log(`${name}: ?v=${v} (${n} files)`);
}
await import('./build-radar-page.mjs');
await import('./build-seo-pages.mjs');
