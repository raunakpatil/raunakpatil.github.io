// Shared by the page (js/radar.js, js/hq.js) and, through scripts/excluded-tools.mjs, by the
// catalogue and page builds. data/excluded-tools.json is the list. A match is the tool's name,
// its Product Hunt / repo slug, or a link on one of its domains (hedra.com and its subdomains).
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; } };

export function excludedChecker(data = {}) {
  const names = new Set((data.names || []).map(norm).filter(Boolean));
  const slugs = new Set((data.slugs || []).map((s) => String(s).toLowerCase()).filter(Boolean));
  const domains = (data.domains || []).map((d) => String(d).toLowerCase().replace(/^www\./, '')).filter(Boolean);
  let pattern = null;
  if (data.namePattern) {
    try { pattern = new RegExp(data.namePattern, 'i'); } catch { pattern = null; }
  }
  const domainHit = (host) => !!host && domains.some((d) => host === d || host.endsWith(`.${d}`));
  const domainInText = (text) => {
    const low = String(text || '').toLowerCase();
    return domains.some((d) => new RegExp(`(^|[^a-z0-9.])${d.replace(/\./g, '\\.')}([^a-z0-9]|$)`).test(low));
  };
  return ({ name = '', url = '', slug = '', text = '' } = {}) => {
    if (names.has(norm(name))) return true;
    if (pattern && name && pattern.test(name)) return true;
    const s = String(slug || '').toLowerCase();
    if (s && slugs.has(s)) return true;
    if (domainHit(hostOf(url))) return true;
    if (domainInText(`${url}\n${text}`)) return true;
    return false;
  };
}
