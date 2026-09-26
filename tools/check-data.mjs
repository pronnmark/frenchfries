/* ------------------------------------------------------------------
   tools/check-data.mjs — content integrity gate for js/data.js
   Run: node tools/check-data.mjs
   Verifies shape, uniqueness, and that every chat thread's answer is
   really the conjugated form its gear claims it is.
------------------------------------------------------------------ */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'js/data.js'), 'utf8');

globalThis.window = {};
// data.js is a plain browser script; evaluating it populates window.DATA
// eslint-disable-next-line no-eval
(0, eval)(src);
const D = globalThis.window.DATA;
(0, eval)(readFileSync(join(root, 'js/phrases.js'), 'utf8'));
const PH = globalThis.window.PHRASES;

const errors = [];
const warns = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);

/* normalise for comparison: straight quotes, no elision markers, lowercase */
const norm = s => String(s)
  .replace(/[’‘]/g, "'")
  .replace(/\(e\)s|\(e\)|\(s\)/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const GEAR_IDS = D.GEARS.map(g => g.id);

/* ---- gears ------------------------------------------------------ */
if (D.GEARS.length !== 6) fail('GEARS', `expected 6 gears, got ${D.GEARS.length}`);
for (const g of D.GEARS) {
  for (const k of ['id', 'n', 'vibe', 'nick', 'fr', 'en', 'icon', 'instruction', 'when']) {
    if (!g[k] && g[k] !== 0) fail(`gear ${g.id}`, `missing "${k}"`);
  }
}

/* ---- verbs ------------------------------------------------------ */
const ids = new Set();
const cardIds = new Set();
let forms = 0, threads = 0;

for (const v of D.VERBS) {
  const V = `verb ${v.inf}`;
  if (ids.has(v.id)) fail(V, `duplicate verb id "${v.id}"`);
  ids.add(v.id);

  for (const k of ['id', 'inf', 'en', 'aux', 'family', 'enPP', 'enInf', 'pp']) {
    if (!v[k]) fail(V, `missing "${k}"`);
  }
  if (!['avoir', 'être'].includes(v.aux)) fail(V, `aux must be avoir/être, got "${v.aux}"`);
  if (!Array.isArray(v.enPresent) || v.enPresent.length !== 6) fail(V, 'enPresent must have 6 entries');

  /* cheats check */
  if (v.cheats) {
    for (const ck of ['future', 'necessity', 'desire']) {
      if (!Array.isArray(v.cheats[ck]) || v.cheats[ck].length !== 2 || !v.cheats[ck][0] || !v.cheats[ck][1]) {
        fail(V, `cheat "${ck}" must be [french, english]`);
      }
    }
  }

  /* muscle memory check */
  if (Array.isArray(v.muscleMemory)) {
    v.muscleMemory.forEach((m, mi) => {
      if (!Array.isArray(m) || m.length !== 2 || !m[0] || !m[1]) {
        fail(V, `muscleMemory item ${mi} must be [french, english]`);
      }
    });
  }

  for (const gid of GEAR_IDS) {
    const W = `${V} · ${gid}`;
    const g = v.gears[gid];
    if (!g) { fail(V, `missing gear "${gid}"`); continue; }

    /* forms */
    if (!Array.isArray(g.forms) || g.forms.length !== 6) { fail(W, 'needs exactly 6 forms'); continue; }
    const seen = new Set();
    g.forms.forEach((f, i) => {
      forms++;
      if (!f || !f.trim()) fail(W, `form ${i} is empty`);
      if (seen.has(norm(f))) warn(W, `form ${i} duplicates another person ("${f}")`);
      seen.add(norm(f));
      const nf = norm(f); // straightened apostrophes
      if (gid === 'subjonctif' && !/^(que |qu')/.test(nf)) fail(W, `subjunctive form ${i} should start with que/qu' ("${f}")`);
      if (gid !== 'subjonctif' && /^(que |qu')/.test(nf)) fail(W, `non-subjunctive form ${i} starts with que ("${f}")`);
    });

    /* passé composé must use the verb's declared auxiliary */
    if (gid === 'passe') {
      const first = norm(g.forms[0]);
      const usesEtre = /\b(suis)\b/.test(first);
      if (v.aux === 'être' && !usesEtre) fail(W, `declared aux "être" but form is "${g.forms[0]}"`);
      if (v.aux === 'avoir' && usesEtre) fail(W, `declared aux "avoir" but form is "${g.forms[0]}"`);
    }

    /* phrase */
    if (!Array.isArray(g.phrase) || g.phrase.length !== 2 || !g.phrase[0] || !g.phrase[1]) {
      fail(W, 'phrase must be [french, english]');
    }

    /* chat thread */
    const c = g.chat;
    if (!c) { fail(W, 'missing chat thread'); continue; }
    threads++;
    for (const k of ['in', 'inEn', 'ans', 'en']) if (!c[k]) fail(W, `chat missing "${k}"`);
    if (c.pre == null || c.post == null) fail(W, 'chat needs pre and post (may be empty strings)');

    /* the blank must actually be a form of this gear */
    const answer = norm(c.ans);
    const hit = g.forms.some(f => norm(f).includes(answer));
    if (!hit) fail(W, `chat answer "${c.ans}" is not part of any ${gid} form`);

    /* spacing around the blank — catches "J'ai"/"je suis" run-ons */
    if (c.pre && !/[\s'’]$/.test(c.pre)) fail(W, `chat "pre" must end with a space or apostrophe ("${c.pre}")`);
    if (c.post && !/^[\s.,!?;:…]/.test(c.post)) fail(W, `chat "post" must start with a space or punctuation ("${c.post}")`);

    /* sentence sanity */
    const sentence = `${c.pre}${c.ans}${c.post}`;
    if (/\s{2,}/.test(sentence)) fail(W, `double space in "${sentence}"`);
    if (!/[.!?…]$/.test(sentence.trim())) warn(W, `sentence has no end punctuation: "${sentence}"`);
    if (!/[?？]$/.test(c.in.trim()) && !/[.!…]$/.test(c.in.trim())) warn(W, `incoming message has no end punctuation: "${c.in}"`);

    /* prompts */
    for (let i = 0; i < 6; i++) {
      const p = D.promptFor(v, gid, i);
      if (!p || !p.trim()) fail(W, `empty English prompt for person ${i}`);
      if (/undefined|null/.test(p)) fail(W, `broken English prompt "${p}"`);
    }
    /* gear 2 and gear 3 must never produce the same English prompt */
    if (gid === 'imparfait') {
      for (let i = 0; i < 6; i++) {
        if (D.promptFor(v, 'passe', i) === D.promptFor(v, 'imparfait', i)) {
          fail(W, `prompt collides with passé composé ("${D.promptFor(v, gid, i)}")`);
        }
      }
    }
  }

  /* card ids */
  for (const card of D.allCardsForVerb(v.id)) {
    if (cardIds.has(card.id)) fail(V, `duplicate card id ${card.id}`);
    cardIds.add(card.id);
    if (!card.answer) fail(V, `card ${card.id} has no answer`);
    if (card.kind === 'form' && !card.prompt) fail(V, `card ${card.id} has no English prompt`);
    /* round-trip through cardById */
    const back = D.cardById(card.id);
    if (!back || back.answer !== card.answer) fail(V, `cardById("${card.id}") did not round-trip`);
  }
}

/* ---- phrasebook ------------------------------------------------- */
const catIds = new Set(PH.CATS.map(c => c.id));
if (!catIds.has('mine')) fail('PHRASES', 'the "mine" category (user phrases) must exist');
const phraseIds = new Set();
const phraseFr = new Set();
for (const p of PH.LIST) {
  const W = `phrase ${p.id}`;
  for (const k of ['id', 'cat', 'fr', 'en', 'reg']) if (!p[k]) fail(W, `missing "${k}"`);
  if (phraseIds.has(p.id)) fail(W, 'duplicate id');
  phraseIds.add(p.id);
  if (p.id.startsWith('u:')) fail(W, 'built-in ids must not start with "u:" (reserved for user phrases)');
  if (!catIds.has(p.cat)) fail(W, `unknown category "${p.cat}"`);
  if (p.cat === 'mine') fail(W, '"mine" is for user phrases only');
  if (!PH.REGISTERS[p.reg]) fail(W, `unknown register "${p.reg}"`);
  const f = norm(p.fr);
  if (phraseFr.has(f)) fail(W, `duplicate French "${p.fr}"`);
  phraseFr.add(f);
  if (/\s[?!]/.test(p.fr) === false && /[?!]$/.test(p.fr)) warn(W, 'French puts a space before ? and !');
}

/* ---- report ----------------------------------------------------- */
const line = '─'.repeat(52);
console.log(line);
console.log(`verbs   ${D.VERBS.length}`);
console.log(`gears   ${D.GEARS.length}`);
console.log(`forms   ${forms}`);
console.log(`threads ${threads}`);
console.log(`cards   ${cardIds.size}`);
console.log(`phrases ${PH.LIST.length} in ${PH.CATS.length} categories`);
console.log(line);

for (const w of warns) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`FAIL  ${e}`);

if (errors.length) {
  console.log(`\n${errors.length} error(s), ${warns.length} warning(s)`);
  process.exit(1);
}
console.log(`\nOK — no errors${warns.length ? `, ${warns.length} warning(s)` : ''}`);
