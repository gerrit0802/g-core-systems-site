import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const html = await readFile('index.html', 'utf8');
const css = await readFile('site.css', 'utf8');
const js = await readFile('site.js', 'utf8');

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
const anchors = [...html.matchAll(/\shref="#([^"]+)"/g)].map((match) => match[1]);
const missingAnchors = anchors.filter((anchor) => !ids.includes(anchor));
const localAssets = [
  ...html.matchAll(/\s(?:src|href)="((?!https?:|mailto:|#)[^"]+)"/g),
].map((match) => match[1]);
const missingAssets = [];

for (const asset of localAssets) {
  try {
    await access(asset, constants.R_OK);
  } catch {
    missingAssets.push(asset);
  }
}

const assertBalanced = (source, open, close, label) => {
  const left = [...source].filter((char) => char === open).length;
  const right = [...source].filter((char) => char === close).length;
  if (left !== right) throw new Error(`${label}: ${left} opening and ${right} closing characters`);
};

if (duplicates.length) throw new Error(`Duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);
if (missingAnchors.length) throw new Error(`Missing anchors: ${[...new Set(missingAnchors)].join(', ')}`);
if (missingAssets.length) throw new Error(`Missing local assets: ${[...new Set(missingAssets)].join(', ')}`);
if (!html.includes('<meta name="viewport"')) throw new Error('Viewport meta tag is missing');
if (!css.includes('prefers-reduced-motion')) throw new Error('Reduced-motion support is missing');
if (!html.includes('<form') || !js.includes('data-project-form')) throw new Error('Project form wiring is missing');
if (html.includes('BetreuungsWerk')) throw new Error('Excluded product BetreuungsWerk is present');
if (!html.includes('TagesAnker') || !html.includes('Testphase')) throw new Error('TagesAnker status is incomplete');
if (!html.includes('STORY-FORGE™') || !html.includes('In Entwicklung')) throw new Error('STORY-FORGE status is incomplete');
assertBalanced(css, '{', '}', 'CSS braces are unbalanced');
assertBalanced(js, '{', '}', 'JavaScript braces are unbalanced');

console.log(`Validation passed: ${ids.length} IDs, ${anchors.length} internal links, ${localAssets.length} local asset references.`);
