// The durable "do not publish" list (data/excluded-tools.json), for the catalogue refresh and the page builds.
import { readFileSync } from 'node:fs';
import { excludedChecker } from '../js/excluded-tools.js';

const data = JSON.parse(readFileSync(new URL('../data/excluded-tools.json', import.meta.url), 'utf8'));
export const isExcluded = excludedChecker(data);
