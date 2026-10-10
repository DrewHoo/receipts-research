#!/usr/bin/env node
// The hallucination gate. Walks JSON files for objects carrying `receipts: [...]`
// and requires each receipt's `quote` to appear, whitespace-collapsed, in the text
// of its `url`. A row whose quote is not on its page does not survive.
//
//   node check-receipts.mjs [--pages DIR] [--offline] [--loose] FILE.json [FILE.json ...]
//
//   --pages DIR   Read and save page text under DIR, keyed by sha1(url): DIR/<sha>.txt
//                 wins over DIR/<sha>.html; DIR/index.json maps sha -> url for humans.
//                 Commit DIR so the check can be re-run without the network, and drop
//                 a .txt there yourself for pages a script can't fetch (paywall, PDF,
//                 bot wall, a reader's OCR).
//   --offline     Never fetch; a receipt with no saved page is a failure.
//   --loose       Also fold curly quotes, dashes, and case before matching.
//
// Receipt forms (see references/claims.md):
//   { url, quote, note?, retrieved? }   checked
//   { sources: [...], note? }           label form, counted as skipped
//
// Exit 1 if any receipt misses or cannot be fetched. No dependencies; Node 18+.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = { pages: null, offline: false, loose: false, files: [] };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--pages') opt.pages = args[++i];
  else if (a === '--offline') opt.offline = true;
  else if (a === '--loose') opt.loose = true;
  else opt.files.push(a);
}
if (!opt.files.length) {
  console.error('usage: check-receipts.mjs [--pages DIR] [--offline] [--loose] FILE.json ...');
  process.exit(2);
}

const sha1 = (s) => createHash('sha1').update(s).digest('hex');

function normalize(s) {
  let t = s.replace(/\s+/g, ' ').trim();
  if (opt.loose) {
    t = t
      .replace(/[‘’‚‛]/g, "'")
      .replace(/[“”„‟]/g, '"')
      .replace(/[‐‑‒–—−]/g, '-')
      .toLowerCase();
  }
  return t;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…' };
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/?(br|p|td|th|tr|li|h[1-6]|div|section|table)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

const index = {};
if (opt.pages) {
  mkdirSync(opt.pages, { recursive: true });
  const idx = join(opt.pages, 'index.json');
  if (existsSync(idx)) Object.assign(index, JSON.parse(readFileSync(idx, 'utf8')));
}
function saveIndex() {
  if (opt.pages) writeFileSync(join(opt.pages, 'index.json'), JSON.stringify(index, null, 1) + '\n');
}

const textCache = new Map();
async function pageText(url) {
  if (textCache.has(url)) return textCache.get(url);
  let result;
  const sha = sha1(url);
  if (opt.pages) {
    const txt = join(opt.pages, `${sha}.txt`);
    const html = join(opt.pages, `${sha}.html`);
    if (existsSync(txt)) result = { text: readFileSync(txt, 'utf8') };
    else if (existsSync(html)) result = { text: htmlToText(readFileSync(html, 'utf8')) };
  }
  if (!result) {
    if (opt.offline) result = { error: 'no saved page (offline)' };
    else {
      try {
        const res = await fetch(url, {
          headers: { 'user-agent': 'check-receipts/1 (receipts-research skill)' },
          signal: AbortSignal.timeout(20000),
          redirect: 'follow',
        });
        const type = res.headers.get('content-type') || '';
        if (!res.ok) result = { error: `HTTP ${res.status}` };
        else if (/pdf/i.test(type)) result = { error: `PDF — extract its text to ${opt.pages ?? '<pages dir>'}/${sha}.txt` };
        else {
          const body = await res.text();
          const isHtml = /html/i.test(type) || /^\s*</.test(body);
          result = { text: isHtml ? htmlToText(body) : body };
          if (opt.pages) {
            writeFileSync(join(opt.pages, isHtml ? `${sha}.html` : `${sha}.txt`), body);
            index[sha] = url;
            saveIndex();
          }
        }
        await new Promise((r) => setTimeout(r, 250));
      } catch (e) {
        result = { error: e.name === 'TimeoutError' ? 'timeout' : e.message };
      }
    }
  }
  if (result.text !== undefined) result.text = normalize(result.text);
  textCache.set(url, result);
  return result;
}

function rowLabel(obj) {
  const keys = ['date', 'season', 'name', 'team', 'home', 'away', 'visitor', 'id'];
  const parts = keys.filter((k) => obj[k] !== undefined && typeof obj[k] !== 'object').map((k) => `${k}=${obj[k]}`);
  return parts.length ? ` (${parts.join(' ')})` : '';
}

function* walk(value, path) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) yield* walk(value[i], `${path}[${i}]`);
  } else if (value && typeof value === 'object') {
    if (Array.isArray(value.receipts)) yield { obj: value, path };
    for (const [k, v] of Object.entries(value)) {
      if (k === 'receipts') continue;
      yield* walk(v, path ? `${path}.${k}` : k);
    }
  }
}

let totalMiss = 0;
let totalErr = 0;
for (const file of opt.files) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const tally = { receipts: 0, ok: 0, miss: 0, err: 0, skipped: 0 };
  const problems = [];
  for (const { obj, path } of walk(data, '')) {
    for (let i = 0; i < obj.receipts.length; i++) {
      const r = obj.receipts[i];
      tally.receipts++;
      const where = `${path || '<root>'}.receipts[${i}]${rowLabel(obj)}`;
      if (!r || typeof r !== 'object') {
        tally.err++;
        problems.push(`ERR  ${where}: receipt is not an object`);
        continue;
      }
      if (r.sources && !r.url) {
        tally.skipped++;
        continue;
      }
      if (!r.url || !r.quote) {
        tally.err++;
        problems.push(`ERR  ${where}: needs url and quote (or the sources form)`);
        continue;
      }
      const page = await pageText(r.url);
      if (page.error) {
        tally.err++;
        problems.push(`ERR  ${where}: ${page.error}\n       ${r.url}`);
        continue;
      }
      if (page.text.includes(normalize(r.quote))) tally.ok++;
      else {
        tally.miss++;
        const q = r.quote.length > 100 ? r.quote.slice(0, 97) + '...' : r.quote;
        problems.push(`MISS ${where}\n       ${r.url}\n       "${q}"`);
      }
    }
  }
  console.log(`${file}: ${tally.receipts} receipts — ${tally.ok} ok, ${tally.miss} miss, ${tally.err} unfetched, ${tally.skipped} label-form`);
  for (const p of problems) console.log('  ' + p);
  totalMiss += tally.miss;
  totalErr += tally.err;
}
process.exit(totalMiss || totalErr ? 1 : 0);
