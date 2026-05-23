/**
 * One-off: add dark: surface classes wherever bg-white lacks them.
 * Skips tokens.js and strings that already include dark:bg-.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

const SKIP_FILES = new Set(['theme/tokens.js']);

/** Longest-first literal replacements for common box patterns */
const PAIRS = [
  ['bg-white border border-slate-100 rounded-3xl', 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl'],
  ['bg-white border border-slate-100 rounded-2xl', 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl'],
  ['bg-white rounded-3xl border border-slate-100', 'bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800'],
  ['bg-white rounded-2xl border border-slate-100', 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800'],
  ['bg-white rounded-[3rem] border border-slate-100', 'bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800'],
  ['bg-white rounded-[2.5rem] border border-slate-100', 'bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800'],
  ['bg-white border border-slate-200 rounded-3xl', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl'],
  ['bg-white border border-slate-200 rounded-2xl', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl'],
  ['bg-white border border-slate-200 rounded-xl', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl'],
  ['bg-white border rounded-3xl', 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl'],
  ['bg-white border rounded-2xl', 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl'],
  ['bg-white border rounded-xl', 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl'],
  ['bg-white rounded-3xl border', 'bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800'],
  ['bg-white rounded-2xl border', 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800'],
  ['bg-white rounded-xl border', 'bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800'],
  ['bg-white border border-slate-100', 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'],
  ['bg-white border border-slate-200', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'],
  ['bg-white border border-slate-100 rounded-xl', 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl'],
  ['bg-white w-full max-w-lg rounded-3xl', 'bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-100 dark:border-slate-800'],
  ['bg-white w-full max-w-md rounded-[2.5rem]', 'bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-100 dark:border-slate-800'],
  ['bg-white min-h-screen', 'bg-white dark:bg-slate-950 min-h-screen'],
  ['divide-y divide-slate-50', 'divide-y divide-slate-50 dark:divide-slate-800'],
  ['divide-y divide-slate-100', 'divide-y divide-slate-100 dark:divide-slate-800'],
  ['border-b border-slate-100', 'border-b border-slate-100 dark:border-slate-800'],
  ['border-t border-slate-100', 'border-t border-slate-100 dark:border-slate-800'],
  ['border border-slate-100 rounded-xl', 'border border-slate-100 dark:border-slate-800 rounded-xl'],
  ['hover:bg-slate-50 ', 'hover:bg-slate-50 dark:hover:bg-slate-800 '],
  ['hover:bg-slate-50"', 'hover:bg-slate-50 dark:hover:bg-slate-800"'],
  ['bg-slate-50 border-b border-slate-100', 'bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800'],
  ['bg-slate-50 rounded-xl', 'bg-slate-50 dark:bg-slate-800/80 rounded-xl'],
  ['text-slate-900"', 'text-slate-900 dark:text-slate-100"'],
  ['font-black text-slate-900', 'font-black text-slate-900 dark:text-slate-100'],
  ['text-3xl font-black text-slate-900', 'text-3xl font-black text-slate-900 dark:text-slate-100'],
  ['text-2xl font-black text-slate-900', 'text-2xl font-black text-slate-900 dark:text-slate-100'],
  ['text-xl font-black text-slate-900', 'text-xl font-black text-slate-900 dark:text-slate-100'],
  ['border border-slate-200 rounded-xl p-5', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5'],
  ['border border-slate-200 rounded-xl p-6', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6'],
  ['border border-slate-200 rounded-xl', 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl'],
  ['rounded-2xl border border-slate-100 overflow-hidden', 'rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden'],
  ['rounded-2xl border border-slate-100"', 'rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"'],
  ['text-slate-700"', 'text-slate-700 dark:text-slate-300"'],
  ['text-slate-600"', 'text-slate-600 dark:text-slate-400"'],
  ['dark:text-slate-100 dark:text-slate-100', 'dark:text-slate-100'],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.(jsx|tsx|js|ts)$/.test(name)) files.push(p);
  }
  return files;
}

function hasDarkBgNearby(chunk) {
  return /dark:bg-/.test(chunk);
}

function patchBareBgWhite(content) {
  return content.replace(/bg-white(?![\w-/])/g, (m, idx) => {
    const window = content.slice(idx, idx + 100);
    if (hasDarkBgNearby(window)) return m;
    if (content.slice(idx, idx + 12) === 'bg-white/') return m;
    return 'bg-white dark:bg-slate-900';
  });
}

let changed = 0;
for (const file of walk(srcDir)) {
  const rel = path.relative(srcDir, file).replace(/\\/g, '/');
  if (SKIP_FILES.has(rel)) continue;
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  for (const [from, to] of PAIRS) {
    if (!content.includes(from)) continue;
    content = content.split(from).join(to);
  }
  content = patchBareBgWhite(content);
  if (content !== orig) {
    fs.writeFileSync(file, content);
    changed += 1;
    console.log('updated', rel);
  }
}
console.log('done, files changed:', changed);
