/* ------------------------------------------------------------------
   app.js — screens, the chat-bubble loop, flashcards, audio, storage.

   Conventions (see DESIGN.md):
   - DOM is built with h() — no innerHTML anywhere.
   - This file sets classes and data-gear. It never sets a colour,
     a size or a spacing value; the design system owns those.
   - JS hooks are data-* attributes, never component class names.
------------------------------------------------------------------ */
(() => {
  const D = window.DATA;
  const { GEARS, GEAR_BY_ID, VERBS, VERB_BY_ID } = D;
  const P = window.PHRASES;
  const CAT_BY_ID = Object.fromEntries(P.CATS.map(c => [c.id, c]));
  const GRADE = FSRS.GRADE;

  const $ = id => document.getElementById(id);

  /** h('div', {class, text, lang, gear, attrs, on}, [children]) */
  function h(tag, opts, children) {
    const n = document.createElement(tag);
    const o = opts || {};
    if (o.class) n.className = o.class;
    if (o.text != null) n.textContent = String(o.text);
    if (o.lang) n.lang = o.lang;
    if (o.gear) n.dataset.gear = o.gear;
    if (o.style) for (const k of Object.keys(o.style)) n.style.setProperty(k, o.style[k]);
    if (o.attrs) for (const k of Object.keys(o.attrs)) n.setAttribute(k, o.attrs[k]);
    if (o.on) for (const k of Object.keys(o.on)) n.addEventListener(k, o.on[k]);
    for (const c of children || []) if (c) n.appendChild(c);
    return n;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  const dot = () => h('span', { class: 'dot', attrs: { 'aria-hidden': 'true' } });
  const gearIndex = g => h('span', { class: 'gear-index', text: g.n, attrs: { 'aria-hidden': 'true' } });

  /** Fills an existing .gear-label element with its dot + text.
      gear may be null (phrase cards), which falls back to the brand hue. */
  function setGearLabel(el, gear, text) {
    if (gear) el.dataset.gear = gear.id;
    else delete el.dataset.gear;
    clear(el);
    if (gear) el.appendChild(dot());
    el.appendChild(h('span', { class: 'gear-label__text', text }));
  }

  function switchEl(checked, label, onChange) {
    const input = h('input', {
      class: 'switch__input',
      attrs: { type: 'checkbox', 'aria-label': label },
      on: { change: onChange }
    });
    input.checked = !!checked;
    return h('span', { class: 'switch' }, [input, h('span', { class: 'switch__track' })]);
  }

  /* ------------------------------ storage ------------------------- */
  const KEY = 'frenchfries.v1';
  const DEFAULTS = {
    onboarded: false,
    active: ['etre', 'avoir'],
    cards: {},
    phrases: [],          // your own phrases: { id: 'u:…', cat, reg, fr, en, note }
    settings: {
      theme: 'light',
      audio: true,
      english: true,
      rate: 0.85,
      voice: '',
      newPerSession: 8,
      sessionLen: 20
    },
    streak: { count: 0, last: null },
    log: { reviews: 0, good: 0, again: 0 }
  };

  let S = loadState();

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      return {
        ...DEFAULTS, ...raw,
        settings: { ...DEFAULTS.settings, ...(raw.settings || {}) },
        streak: { ...DEFAULTS.streak, ...(raw.streak || {}) },
        log: { ...DEFAULTS.log, ...(raw.log || {}) },
        cards: raw.cards || {},
        phrases: Array.isArray(raw.phrases) ? raw.phrases : []
      };
    } catch {
      return structuredClone(DEFAULTS);
    }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(S)); }

  /** Local calendar day as YYYY-MM-DD — a streak follows your clock, not UTC. */
  function dayKey(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + (offsetDays || 0));
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  const today = () => dayKey(0);

  function bumpStreak() {
    const t = today();
    if (S.streak.last === t) return;
    S.streak.count = S.streak.last === dayKey(-1) ? S.streak.count + 1 : 1;
    S.streak.last = t;
  }

  /** The streak as it stands now: one missed day and it is gone. */
  function liveStreak() {
    return S.streak.last === today() || S.streak.last === dayKey(-1) ? S.streak.count : 0;
  }

  /* ------------------------------- theme -------------------------- */
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme() {
    const choice = S.settings.theme || 'light';
    const dark = choice === 'dark' || (choice === 'auto' && darkQuery.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('meta-theme').setAttribute('content', dark ? '#0f1116' : '#ffffff');
    for (const b of document.querySelectorAll('[data-theme-choice]')) {
      b.setAttribute('aria-pressed', String(b.dataset.themeChoice === choice));
    }
  }

  darkQuery.addEventListener('change', () => {
    if (S.settings.theme === 'auto') applyTheme();
  });

  for (const b of document.querySelectorAll('[data-theme-choice]')) {
    b.addEventListener('click', () => {
      S.settings.theme = b.dataset.themeChoice;
      save();
      applyTheme();
    });
  }

  /* ------------------------------- audio -------------------------- */
  const Speech = {
    voices: [],
    pick: null,
    init() {
      if (!window.speechSynthesis) return;
      const refresh = () => {
        Speech.voices = (window.speechSynthesis.getVoices() || []).filter(v => /^fr/i.test(v.lang));
        Speech.choose(S.settings.voice);
        renderVoices();
      };
      refresh();
      window.speechSynthesis.onvoiceschanged = refresh;
    },
    choose(uri) {
      Speech.pick = Speech.voices.find(v => v.voiceURI === uri) ||
        Speech.voices.find(v => /fr-FR/i.test(v.lang)) || Speech.voices[0] || null;
    },
    say(text, force) {
      if (!window.speechSynthesis) return;
      if (!force && !S.settings.audio) return;
      const synth = window.speechSynthesis;
      const busy = synth.speaking || synth.pending;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = Speech.pick ? Speech.pick.lang : 'fr-FR';
      if (Speech.pick) u.voice = Speech.pick;
      u.rate = S.settings.rate;
      // Safari silently drops a speak() issued in the same tick as cancel().
      if (busy) setTimeout(() => synth.speak(u), 60);
      else synth.speak(u);
    }
  };

  // "je suis allé(e)" → "je suis allé"; "il est venu / elle est venue" → "…, …"
  const speakable = s => s.replace(/\(e\)s|\(e\)|\(s\)/g, '').replace(/\s*\/\s*/g, ', ');

  /* ------------------------------ router -------------------------- */
  const SCREENS = ['onboarding', 'home', 'phrases', 'gears', 'verb', 'drill', 'settings'];
  let back = [];
  let depth = 0; // history entries we pushed, so the phone's Back gesture walks screens

  function show(name, push) {
    const cur = current();
    if (push !== false && cur && cur !== name) {
      back.push(cur);
      history.pushState({ ff: name }, '');
      depth++;
    }
    for (const s of SCREENS) $(`screen-${s}`).hidden = s !== name;
    const sc = document.querySelector(`#screen-${name} .screen__scroll`);
    if (sc) sc.scrollTo(0, 0);
  }
  function current() { return SCREENS.find(s => !$(`screen-${s}`).hidden); }
  /** In-app back buttons go through history so it stays in step with the screen. */
  function goBack() {
    if (depth > 0) history.back(); // popstate below does the work
    else stepBack();
  }

  window.addEventListener('popstate', () => {
    if (depth > 0) depth--;
    for (const d of document.querySelectorAll('dialog[open]')) d.close();
    stepBack();
  });

  function stepBack() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const prev = back.pop() || 'home';
    show(prev === 'drill' ? 'home' : prev, false);
    if (current() === 'home') renderHome();
    if (current() === 'phrases') renderPhrases();
  }

  let toastTimer = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 1800);
  }
  const announce = msg => { $('live-region').textContent = msg; };

  /** Design-system confirm — replaces window.confirm. */
  function confirmAction(title, body, okLabel) {
    return new Promise(resolve => {
      const dlg = $('confirm-dialog');
      $('confirm-title').textContent = title;
      $('confirm-body').textContent = body;
      $('confirm-ok').textContent = okLabel;
      const done = ok => {
        dlg.close();
        $('confirm-ok').onclick = null;
        $('confirm-cancel').onclick = null;
        resolve(ok);
      };
      $('confirm-ok').onclick = () => done(true);
      $('confirm-cancel').onclick = () => done(false);
      dlg.onclose = () => resolve(false);
      dlg.showModal();
    });
  }

  /* ---------------------------- phrases --------------------------- */
  // Yours first, so a phrase you just added is the next one introduced.
  const allPhrases = () => [...S.phrases, ...P.LIST];
  const isOwn = p => p.id.startsWith('u:');
  const phraseCardId = id => `ph:${id}`;

  function phraseCard(p) {
    return {
      id: phraseCardId(p.id),
      kind: 'phrase',
      phraseId: p.id,
      cat: p.cat,
      reg: p.reg,
      answer: p.fr,    // French out
      prompt: p.en,    // English in
      note: p.note || ''
    };
  }

  /** Lowercase, no accents, straight apostrophes — for search and dedupe. */
  const fold = s => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

  /* ---------------------------- card pools ------------------------ */
  function poolFor(mode) {
    const out = [];
    if (mode !== 'phrase') {
      for (const vid of S.active) {
        for (const c of D.allCardsForVerb(vid)) {
          if (mode === 'chat' && c.kind !== 'chat') continue;
          if (mode === 'flash' && c.kind !== 'form') continue;
          out.push(c);
        }
      }
    }
    if (mode === 'phrase' || mode === 'mixed') {
      for (const p of allPhrases()) out.push(phraseCard(p));
    }
    return out;
  }

  function dueCount(mode) {
    const now = Date.now();
    let due = 0, fresh = 0;
    for (const c of poolFor(mode)) {
      const st = S.cards[c.id];
      if (!st) fresh++;
      else if (st.due <= now) due++;
    }
    return { due, fresh };
  }
  const readyCount = mode => {
    const d = dueCount(mode);
    return d.due + Math.min(d.fresh, S.settings.newPerSession);
  };

  function buildSession(mode, keep) {
    const now = Date.now();
    const due = [], fresh = [];
    for (const c of poolFor(mode)) {
      if (keep && !keep(c)) continue;
      const st = S.cards[c.id];
      if (!st) fresh.push(c);
      else if (st.due <= now) due.push(c);
    }
    due.sort((a, b) => S.cards[a.id].due - S.cards[b.id].due);
    const session = [...due, ...fresh.slice(0, S.settings.newPerSession)].slice(0, S.settings.sessionLen);
    for (let i = session.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [session[i], session[j]] = [session[j], session[i]];
    }
    return session;
  }

  /* ------------------------------- home --------------------------- */
  const strengthOf = id => FSRS.strength(S.cards[id], Date.now());

  function verbProgress(vid) {
    const cards = D.allCardsForVerb(vid);
    let sum = 0;
    for (const c of cards) sum += strengthOf(c.id);
    return sum / cards.length;
  }

  function metric(value, label) {
    return h('div', { class: 'metric' }, [
      h('b', { class: 'metric__value', text: value }),
      h('span', { class: 'metric__label', text: label })
    ]);
  }

  function setCount(el, n) {
    el.textContent = n || '✓';
    el.className = n ? 'list__meta list__meta--active' : 'list__meta list__meta--done';
  }

  function renderHome() {
    const ready = readyCount('mixed');
    const pool = poolFor('mixed');

    $('home-due').textContent = ready;
    $('home-due-sub').textContent =
      `${ready === 1 ? 'card' : 'cards'} ready · ${S.active.length} verbs in rotation`;
    const streak = liveStreak();
    $('home-streak').textContent = streak
      ? `🔥 ${streak}-day streak`
      : '🔥 Start a streak';
    if ($('top-streak')) $('top-streak').textContent = streak;
    if ($('top-due')) $('top-due').textContent = ready;

    let seen = 0;
    for (const c of pool) if (S.cards[c.id]) seen++;
    $('home-bar').style.width = `${Math.round(seen / Math.max(pool.length, 1) * 100)}%`;

    setCount($('count-phrases'), readyCount('phrase'));
    setCount($('count-chat'), readyCount('chat'));
    setCount($('count-flash'), readyCount('flash'));
    setCount($('count-mixed'), ready);

    // ---- garage
    const list = $('verb-list');
    clear(list);
    for (const v of VERBS) {
      const on = S.active.includes(v.id);
      const pct = Math.round(verbProgress(v.id) * 100);
      const main = h('button', {
        class: 'list__body',
        attrs: { 'aria-label': `${v.inf} — ${v.en}, ${pct}% learned. Open dashboard.` },
        on: { click: () => openVerb(v.id) }
      }, [
        h('span', { class: 'list__title', lang: 'fr', text: v.inf }),
        h('span', { class: 'list__sub', text: `${v.en} · ${v.family}` })
      ]);

      const sw = switchEl(on, `Keep ${v.inf} in rotation`, e => {
        if (e.target.checked) S.active.push(v.id);
        else S.active = S.active.filter(x => x !== v.id);
        if (!S.active.length) {
          S.active = [v.id];
          e.target.checked = true;
          toast('Keep at least one verb in rotation');
        }
        save();
        renderHome();
      });

      list.appendChild(h('div', { class: `list__item${on ? '' : ' list__item--muted'}` }, [
        main,
        h('span', { class: 'list__meta', text: `${pct}%` }),
        sw
      ]));
    }

    // ---- progress
    let mature = 0;
    for (const c of pool) if (strengthOf(c.id) > 0.8) mature++;
    const acc = S.log.reviews ? Math.round(S.log.good / S.log.reviews * 100) : 0;
    const row = $('stat-row');
    clear(row);
    row.appendChild(metric(S.log.reviews, 'reps'));
    row.appendChild(metric(`${acc}%`, 'instant'));
    row.appendChild(metric(mature, 'mastered'));

    // ---- mastery by gear
    const mastery = $('mastery');
    clear(mastery);
    for (const g of GEARS) {
      let sum = 0, n = 0;
      for (const c of pool) if (c.gearId === g.id) { sum += strengthOf(c.id); n++; }
      const pct = n ? Math.round(sum / n * 100) : 0;
      mastery.appendChild(h('div', { class: 'mastery__row', gear: g.id }, [
        dot(),
        h('span', { class: 'mastery__name', text: g.nick }),
        h('span', { class: 'meter mastery__meter' }, [
          h('span', { class: 'meter__fill meter__fill--gear', style: { width: `${pct}%` } })
        ]),
        h('span', { class: 'mastery__pct', text: `${pct}%` })
      ]));
    }
  }

  /* ---------------------------- onboarding ------------------------ */
  function renderOnboarding() {
    const ol = $('ob-gears');
    clear(ol);
    for (const g of GEARS) {
      ol.appendChild(h('li', { class: 'gear-list__item', gear: g.id }, [
        gearIndex(g),
        h('span', null, [
          h('span', { class: 'gear-list__name', text: g.nick }),
          h('span', { class: 'gear-list__meta', text: `${g.fr} — ${g.when}` })
        ])
      ]));
    }
  }

  /* --------------------------- gears screen ----------------------- */
  function exampleEl(phrase) {
    return h('button', {
      class: 'example',
      attrs: { 'aria-label': `${phrase[0]} — ${phrase[1]}. Hear it.` },
      on: { click: () => Speech.say(phrase[0], true) }
    }, [
      h('span', { class: 'example__fr', lang: 'fr', text: phrase[0] }),
      h('span', { class: 'example__en', text: phrase[1] })
    ]);
  }

  function renderGears() {
    const body = $('gears-body');
    clear(body);
    body.appendChild(h('p', {
      class: 'section__sub',
      text: 'Six gears — Time, Shape and Mood — sorted by what they do in a conversation. Examples use avoir; tap one to hear it.'
    }));
    const ref = VERB_BY_ID.avoir;
    for (const g of GEARS) {
      body.appendChild(h('section', { class: 'gear-doc', gear: g.id }, [
        h('div', { class: 'gear-doc__head' }, [
          gearIndex(g),
          h('h2', { class: 'gear-doc__title', text: g.nick })
        ]),
        h('p', { class: 'gear-doc__fr', text: `${g.en} · ${g.fr}` }),
        h('p', { class: 'gear-doc__instruction', text: g.instruction }),
        exampleEl(ref.gears[g.id].phrase)
      ]));
    }
    body.appendChild(h('div', { class: 'u-tail' }));
  }

  /* --------------------------- verb dashboard --------------------- */
  let openVerbId = 'avoir';

  function openVerb(vid) {
    openVerbId = vid;
    const v = VERB_BY_ID[vid];
    $('verb-title').textContent = v.inf;
    const body = $('verb-body');
    clear(body);

    const enCapitalized = v.en.charAt(0).toUpperCase() + v.en.slice(1);
    const infUpper = v.inf.toUpperCase();

    const heroElements = [
      h('h2', { class: 'verb-hero__inf', lang: 'fr', text: `${infUpper} (${enCapitalized})` })
    ];

    if (v.pp) {
      heroElements.push(h('button', {
        class: 'verb-pp-callout',
        attrs: { 'aria-label': `The Past Participle (The key to the past tense): ${v.pp} (uses ${v.aux}). Tap to hear it.` },
        on: { click: () => Speech.say(speakable(v.pp), true) }
      }, [
        h('span', { class: 'verb-pp-callout__label', text: 'The Past Participle (The key to the past tense): ' }),
        h('strong', { class: 'verb-pp-callout__val', lang: 'fr', text: v.pp }),
        h('span', { class: 'verb-pp-callout__aux', text: ` (uses ${v.aux})` })
      ]));
    }

    heroElements.push(h('p', {
      class: 'verb-hero__meta',
      text: `${v.family} · ${Math.round(verbProgress(vid) * 100)}% learned`
    }));

    body.appendChild(h('header', { class: 'verb-hero' }, heroElements));

    const sw = switchEl(S.active.includes(vid), `Keep ${v.inf} in rotation`, e => {
      if (e.target.checked) S.active.push(vid);
      else S.active = S.active.filter(x => x !== vid);
      if (!S.active.length) { S.active = [vid]; e.target.checked = true; }
      save();
      toast(e.target.checked ? `${v.inf} added to rotation` : `${v.inf} paused`);
    });
    body.appendChild(h('div', { class: 'row' }, [
      h('div', { class: 'row__body' }, [
        h('p', { class: 'row__title', text: 'In rotation' }),
        h('p', { class: 'row__sub', text: 'Tap any line below to hear it.' })
      ]),
      sw
    ]));

    for (const g of GEARS) {
      const gg = v.gears[g.id];
      const conj = h('div', { class: 'conj' });
      gg.forms.forEach((f, i) => {
        const rowChildren = [
          h('span', { class: 'conj__bullet', text: '⚬' }),
          h('div', { class: 'conj__main' }, [
            h('span', { class: 'conj__fr', lang: 'fr', text: f }),
            i === 2 ? h('span', { class: 'conj__note', text: '“on” = “we” in everyday speech' }) : null
          ].filter(Boolean)),
          h('span', { class: 'conj__en', text: D.glossFor(v, g.id, i) })
        ];

        conj.appendChild(h('button', {
          class: 'conj__row',
          attrs: { 'aria-label': `${f} — ${D.glossFor(v, g.id, i)}. Hear it.` },
          on: { click: () => Speech.say(speakable(f), true) }
        }, rowChildren));
      });

      let instruction = g.instruction;
      if (g.id === 'passe') {
        const auxName = v.aux === 'être' ? 'Être' : 'Avoir';
        instruction = `Use for completed dots on the timeline (a finished event). Formula: Present of ${auxName} + "${v.pp}".`;
      }

      body.appendChild(h('section', { class: 'gear-block', gear: g.id }, [
        h('div', { class: 'gear-block__head' }, [
          gearIndex(g),
          h('h2', { class: 'gear-block__title', text: `${g.n}. ${g.nick}` }),
          h('span', { class: 'gear-block__fr', text: g.fr })
        ]),
        h('p', { class: 'gear-block__instruction', text: instruction }),
        conj,
        exampleEl(gg.phrase),
        h('button', {
          class: 'btn gear-block__drill',
          text: 'Drill this gear',
          on: {
            click: () => startDrill({
              label: `${v.inf} · ${g.nick}`,
              build: () => D.allCardsForVerb(vid).filter(x => x.gearId === g.id)
            })
          }
        })
      ]));
    }

    /* Conversational Cheats Section */
    if (v.cheats) {
      const cheatList = h('div', { class: 'cheat-list' });
      const infCap = v.inf.charAt(0).toUpperCase() + v.inf.slice(1);
      const cheatItems = [
        { hack: `The Future Hack: Aller + ${infCap}`, fr: v.cheats.future[0], en: v.cheats.future[1] },
        { hack: `The Necessity Hack: Il faut + ${infCap}`, fr: v.cheats.necessity[0], en: v.cheats.necessity[1] },
        { hack: `The Desire Hack: Vouloir + ${infCap}`, fr: v.cheats.desire[0], en: v.cheats.desire[1] }
      ];

      cheatItems.forEach(c => {
        cheatList.appendChild(h('button', {
          class: 'cheat-item',
          attrs: { 'aria-label': `${c.hack}: ${c.fr} (${c.en}). Hear it.` },
          on: { click: () => Speech.say(speakable(c.fr), true) }
        }, [
          h('span', { class: 'cheat-item__bullet', text: '⚬' }),
          h('div', { class: 'cheat-item__body' }, [
            h('div', { class: 'cheat-item__hack', text: c.hack }),
            h('div', { class: 'cheat-item__fr', lang: 'fr', text: c.fr }),
            h('div', { class: 'cheat-item__en', text: `(${c.en})` })
          ])
        ]));
      });

      body.appendChild(h('section', { class: 'verb-section' }, [
        h('div', { class: 'verb-section__head' }, [
          h('h2', { class: 'verb-section__title', text: '⚡ The Conversational Cheats' }),
          h('p', { class: 'verb-section__sub', text: 'Do not conjugate!' })
        ]),
        cheatList
      ]));
    }

    /* Muscle Memory Section */
    if (v.muscleMemory && v.muscleMemory.length) {
      const muscleList = h('div', { class: 'muscle-list' });
      v.muscleMemory.forEach((m, idx) => {
        muscleList.appendChild(h('button', {
          class: 'muscle-item',
          attrs: { 'aria-label': `${m[0]} — ${m[1]}. Hear it.` },
          on: { click: () => Speech.say(speakable(m[0]), true) }
        }, [
          h('span', { class: 'muscle-item__num', text: `${idx + 1}.` }),
          h('div', { class: 'muscle-item__body' }, [
            h('span', { class: 'muscle-item__fr', lang: 'fr', text: m[0] }),
            h('span', { class: 'muscle-item__en', text: ` (${m[1]})` })
          ])
        ]));
      });

      body.appendChild(h('section', { class: 'verb-section' }, [
        h('div', { class: 'verb-section__head' }, [
          h('h2', { class: 'verb-section__title', text: '🧠 Muscle Memory Sentences' }),
          h('p', { class: 'verb-section__sub', text: '3 short, highly common phrases you can actually use today. Read out loud.' })
        ]),
        muscleList
      ]));
    }
    body.appendChild(h('div', { class: 'u-tail' }));
    show('verb');
  }

  /* ----------------------------- phrasebook ----------------------- */
  let phraseCat = 'all';

  function visiblePhrases() {
    const q = fold($('phrase-search').value);
    return allPhrases().filter(p =>
      (phraseCat === 'all' || p.cat === phraseCat) &&
      (!q || fold(p.fr).includes(q) || fold(p.en).includes(q) || fold(p.note).includes(q)));
  }

  function renderPhraseCats() {
    const box = $('phrase-cats');
    clear(box);
    const counts = {};
    for (const p of allPhrases()) counts[p.cat] = (counts[p.cat] || 0) + 1;
    const chip = (id, label) => h('button', {
      class: 'chip',
      text: label,
      attrs: { type: 'button', 'aria-pressed': String(phraseCat === id) },
      on: { click: () => { phraseCat = id; renderPhrases(); } }
    });
    box.appendChild(chip('all', 'All'));
    for (const c of P.CATS) {
      if (!counts[c.id] && c.id !== 'mine') continue;
      box.appendChild(chip(c.id, `${c.icon} ${c.name}${counts[c.id] ? ` · ${counts[c.id]}` : ''}`));
    }
    const on = box.querySelector('[aria-pressed="true"]');
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function phraseRow(p) {
    const own = isOwn(p);
    const learned = Math.round(strengthOf(phraseCardId(p.id)) * 100);
    return h('div', { class: 'phrase' }, [
      h('button', {
        class: 'phrase__main',
        attrs: { type: 'button', 'aria-label': `${p.fr} — ${p.en}. Hear it.` },
        on: { click: () => Speech.say(speakable(p.fr), true) }
      }, [
        h('span', { class: 'phrase__fr', lang: 'fr', text: p.fr }),
        h('span', { class: 'phrase__en', text: p.en }),
        p.note ? h('span', { class: 'phrase__note', text: p.note }) : null
      ]),
      h('div', { class: 'phrase__side' }, [
        h('span', { class: `tag tag--${p.reg || 'neutral'}`, text: P.REGISTERS[p.reg] || P.REGISTERS.neutral }),
        learned ? h('span', { class: 'phrase__learned', text: `${learned}%` }) : null,
        own ? h('button', {
          class: 'icon-btn icon-btn--sm',
          attrs: { type: 'button', 'aria-label': `Edit “${p.fr}”` },
          on: { click: () => openPhraseForm(p) }
        }, [svgUse('i-edit')]) : null
      ])
    ]);
  }

  function svgUse(id) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(ns, 'use');
    use.setAttribute('href', `#${id}`);
    svg.appendChild(use);
    return svg;
  }

  function renderPhrases() {
    renderPhraseCats();
    const body = $('phrase-body');
    clear(body);
    const list = visiblePhrases();

    if (!list.length) {
      const searching = !!$('phrase-search').value.trim();
      body.appendChild(h('div', { class: 'empty' }, [
        h('p', { class: 'empty__title', text: searching ? 'No phrase matches that' : 'No phrases here yet' }),
        h('p', { class: 'empty__sub', text: 'Heard something useful? Save it and it joins your practice.' }),
        h('button', { class: 'btn btn--secondary', text: 'Add a phrase', on: { click: () => openPhraseForm(null) } })
      ]));
    } else if (phraseCat === 'all') {
      for (const c of P.CATS) {
        const inCat = list.filter(p => p.cat === c.id);
        if (!inCat.length) continue;
        body.appendChild(h('h2', { class: 'phrase-group', text: `${c.icon} ${c.name}` }));
        const box = h('div', { class: 'phrase-list' });
        for (const p of inCat) box.appendChild(phraseRow(p));
        body.appendChild(box);
      }
    } else {
      const box = h('div', { class: 'phrase-list' });
      for (const p of list) box.appendChild(phraseRow(p));
      body.appendChild(box);
    }
    body.appendChild(h('div', { class: 'u-tail' }));

    const ids = new Set(list.map(p => p.id));
    const ready = buildSession('phrase', c => ids.has(c.phraseId)).length;
    const btn = $('phrase-drill');
    btn.textContent = ready ? `Practice ${ready} ${ready === 1 ? 'phrase' : 'phrases'}` : 'All caught up ✓';
    btn.disabled = !ready;
  }

  $('phrase-search').addEventListener('input', renderPhrases);
  $('phrase-add').addEventListener('click', () => openPhraseForm(null));
  $('phrase-drill').addEventListener('click', () => {
    const ids = new Set(visiblePhrases().map(p => p.id));
    const cat = CAT_BY_ID[phraseCat];
    startDrill({
      label: cat ? cat.name : 'Phrases',
      build: () => buildSession('phrase', c => ids.has(c.phraseId))
    });
  });

  /* add / edit form */
  let editingId = null;

  function openPhraseForm(p) {
    editingId = p ? p.id : null;
    $('phrase-dialog-title').textContent = p ? 'Edit phrase' : 'Add a phrase';

    const cat = $('pf-cat');
    clear(cat);
    for (const c of P.CATS) {
      const o = h('option', { text: `${c.icon} ${c.name}` });
      o.value = c.id;
      cat.appendChild(o);
    }
    const reg = $('pf-reg');
    clear(reg);
    for (const [id, label] of Object.entries(P.REGISTERS)) {
      const o = h('option', { text: label });
      o.value = id;
      reg.appendChild(o);
    }

    $('pf-fr').value = p ? p.fr : '';
    $('pf-en').value = p ? p.en : '';
    $('pf-note').value = p ? (p.note || '') : '';
    cat.value = p ? p.cat : (phraseCat !== 'all' ? phraseCat : 'mine');
    reg.value = p ? (p.reg || 'neutral') : 'casual';
    $('pf-delete').hidden = !p;
    $('phrase-dialog').showModal();
  }

  $('phrase-form').addEventListener('submit', e => {
    e.preventDefault();
    const rec = {
      fr: $('pf-fr').value.trim(),
      en: $('pf-en').value.trim(),
      note: $('pf-note').value.trim(),
      cat: $('pf-cat').value || 'mine',
      reg: $('pf-reg').value || 'neutral'
    };
    if (!rec.fr || !rec.en) { toast('Add both the French and the English'); return; }
    const dupe = allPhrases().find(x => x.id !== editingId && fold(x.fr) === fold(rec.fr));
    if (dupe) { toast('That phrase is already in your phrasebook'); return; }

    if (editingId) {
      const i = S.phrases.findIndex(x => x.id === editingId);
      if (i >= 0) S.phrases[i] = { ...S.phrases[i], ...rec };
    } else {
      S.phrases.unshift({ id: `u:${Date.now().toString(36)}`, ...rec });
    }
    save();
    $('phrase-dialog').close();
    renderPhrases();
    toast(editingId ? 'Phrase updated' : 'Saved — it joins your practice');
  });

  $('pf-cancel').addEventListener('click', () => $('phrase-dialog').close());
  $('pf-hear').addEventListener('click', () => {
    const fr = $('pf-fr').value.trim();
    if (fr) Speech.say(speakable(fr), true);
  });
  $('pf-delete').addEventListener('click', async () => {
    const id = editingId;
    $('phrase-dialog').close();
    const ok = await confirmAction('Delete this phrase?', 'It and its practice history will be removed.', 'Delete');
    if (!ok) return;
    S.phrases = S.phrases.filter(x => x.id !== id);
    delete S.cards[phraseCardId(id)];
    save();
    renderPhrases();
    toast('Phrase deleted');
  });
  // Tapping the backdrop closes the sheet, as on every phone.
  $('phrase-dialog').addEventListener('click', e => {
    if (e.target === $('phrase-dialog')) $('phrase-dialog').close();
  });

  /* ------------------------------- drill -------------------------- */
  const Drill = { queue: [], done: 0, revealed: false, card: null, again: 0, good: 0, source: null };

  /** source = { label, build() -> cards[] } */
  function startDrill(source) {
    const cards = source.build();
    if (!cards.length) { toast('Nothing due — add a verb or come back later'); return; }
    Drill.source = source;
    Drill.queue = cards.slice();
    Drill.done = 0;
    Drill.again = 0;
    Drill.good = 0;
    $('drill-done').hidden = true;
    $('drill-stage').hidden = false;
    show('drill');
    nextCard();
  }

  const modeSource = mode => ({ label: mode, build: () => buildSession(mode) });

  function nextCard() {
    if (!Drill.queue.length) { finishDrill(); return; }
    Drill.card = Drill.queue.shift();
    Drill.revealed = false;
    renderCard(Drill.card);
    $('grade-zone').hidden = true;
    $('swipe-hint').hidden = true;
    $('tap-layer').classList.remove('drill__tap--off');
    // honest denominator: everything still in hand, including this card
    const total = Drill.done + Drill.queue.length + 1;
    $('drill-bar').style.width = `${Math.round(Drill.done / total * 100)}%`;
    $('drill-count').textContent = `${Drill.done} / ${total}`;
  }

  function renderCard(card) {
    const v = VERB_BY_ID[card.verbId];
    const g = GEAR_BY_ID[card.gearId];
    const stage = $('drill-stage');
    stage.style.transform = '';
    stage.classList.remove('drill__stage--left', 'drill__stage--right');

    if (card.kind === 'phrase') {
      const cat = CAT_BY_ID[card.cat] || CAT_BY_ID.mine;
      $('thread').hidden = true;
      $('flashcard').hidden = false;
      setGearLabel($('flash-gear'), null, `${cat.icon} ${cat.name}`);
      $('flash-context').textContent = P.REGISTERS[card.reg] || '';
      $('flash-prompt').textContent = `“${card.prompt}”`;
      $('flash-fr').textContent = card.answer;
      $('flash-en').textContent = card.note;
      $('flash-phrase').textContent = '';
      $('flash-ask').hidden = false;
      $('flash-answer').hidden = true;
      $('flash-hint').hidden = false;
    } else if (card.kind === 'chat') {
      $('thread').hidden = false;
      $('flashcard').hidden = true;
      $('thread-head').textContent = `${v.inf} · ${g.nick}`;
      $('bubble-in-text').textContent = card.incoming;
      $('bubble-in-en').textContent = card.incomingEn;
      $('bubble-in-en').hidden = !S.settings.english;
      $('reply-pre').textContent = card.pre;
      $('reply-post').textContent = card.post;
      const blank = $('reply-blank');
      blank.textContent = '________';
      blank.className = 'blank';
      setGearLabel($('vibe-tag'), g, `The Vibe: ${g.vibe}`);
      $('reveal-en').textContent = card.replyEn;
      $('reveal-en').hidden = true;
    } else {
      $('thread').hidden = true;
      $('flashcard').hidden = false;
      setGearLabel($('flash-gear'), g, `${g.nick} · ${g.fr}`);
      $('flash-context').textContent = `${v.inf} · ${v.en}`;
      $('flash-prompt').textContent = `“${card.prompt}”`;
      $('flash-fr').textContent = card.answer;
      // only echo the gloss when it says more than the prompt already did
      $('flash-en').textContent = card.gloss === card.prompt ? '' : card.gloss;
      $('flash-phrase').textContent = v.gears[card.gearId].phrase[0];
      $('flash-ask').hidden = false;
      $('flash-answer').hidden = true;
      $('flash-hint').hidden = false;
    }
  }

  function reveal() {
    if (Drill.revealed || !Drill.card) return;
    Drill.revealed = true;
    const card = Drill.card;

    if (card.kind === 'chat') {
      const blank = $('reply-blank');
      blank.textContent = card.answer;
      blank.className = 'blank blank--filled';
      $('reveal-en').hidden = !S.settings.english;
      Speech.say(speakable(card.sentence));
      announce(`${card.answer}. ${card.sentence}`);
    } else {
      $('flash-ask').hidden = true;
      $('flash-answer').hidden = false;
      $('flash-hint').hidden = true;
      Speech.say(speakable(card.answer));
      announce(card.answer);
    }

    const st = S.cards[card.id] || FSRS.newState();
    $('when-again').textContent = FSRS.preview(st, GRADE.AGAIN);
    $('when-good').textContent = FSRS.preview(st, GRADE.GOOD);
    $('grade-zone').hidden = false;
    $('swipe-hint').hidden = false;
    $('tap-layer').classList.add('drill__tap--off');
  }

  function grade(g) {
    if (!Drill.revealed || !Drill.card) return;
    const card = Drill.card;
    const prev = S.cards[card.id] || FSRS.newState();
    S.cards[card.id] = FSRS.review(prev, g, Date.now());
    if (navigator.vibrate) navigator.vibrate(g === GRADE.GOOD ? 8 : [12, 40, 12]);

    S.log.reviews++;
    if (g === GRADE.GOOD) {
      S.log.good++;
      Drill.good++;
    } else {
      S.log.again++;
      Drill.again++;
      // "show me that exact bubble again in 3 minutes" — within a session
      // that means a handful of cards later.
      const at = Math.min(Drill.queue.length, 4 + Math.floor(Math.random() * 3));
      Drill.queue.splice(at, 0, card);
    }
    Drill.done++;
    bumpStreak();
    save();
    nextCard();
  }

  function finishDrill() {
    $('drill-stage').hidden = true;
    $('grade-zone').hidden = true;
    $('swipe-hint').hidden = true;
    $('drill-bar').style.width = '100%';
    const total = Drill.good + Drill.again;
    const pct = total ? Math.round(Drill.good / total * 100) : 0;
    $('done-summary').textContent =
      `${Drill.done} reps · ${pct}% instant recall. The algorithm has scheduled the rest.`;
    $('drill-done').hidden = false;
    save();
    renderHome();
  }

  /* --------------------------- input: tap/swipe ------------------- */
  $('tap-layer').addEventListener('click', reveal);
  // Once revealed, a tap on the card replays it (a swipe is not a tap).
  $('drill-stage').addEventListener('click', () => {
    if (!Drill.revealed || !Drill.card) return;
    const c = Drill.card;
    Speech.say(speakable(c.kind === 'chat' ? c.sentence : c.answer), true);
  });
  $('grade-again').addEventListener('click', () => grade(GRADE.AGAIN));
  $('grade-good').addEventListener('click', () => grade(GRADE.GOOD));

  (function swipe() {
    const stage = $('drill-stage');
    let x0 = null, y0 = 0, dx = 0, axis = null;
    const start = e => {
      if (!Drill.revealed) return;
      const pt = e.touches ? e.touches[0] : e;
      x0 = pt.clientX;
      y0 = pt.clientY;
      dx = 0;
      axis = null;
      stage.classList.add('drill__stage--dragging');
    };
    const move = e => {
      if (x0 === null) return;
      const pt = e.touches ? e.touches[0] : e;
      // Decide once per gesture: a mostly-vertical drag is a scroll, not a grade.
      if (!axis) {
        const ax = Math.abs(pt.clientX - x0), ay = Math.abs(pt.clientY - y0);
        if (ax < 8 && ay < 8) return;
        axis = ax > ay ? 'x' : 'y';
      }
      if (axis === 'y') return;
      dx = pt.clientX - x0;
      stage.style.transform = `translateX(${dx}px) rotate(${dx / 40}deg)`;
      stage.classList.toggle('drill__stage--left', dx < -30);
      stage.classList.toggle('drill__stage--right', dx > 30);
    };
    const end = () => {
      if (x0 === null) return;
      stage.classList.remove('drill__stage--dragging');
      const d = axis === 'x' ? dx : 0;
      x0 = null;
      stage.style.transform = '';
      stage.classList.remove('drill__stage--left', 'drill__stage--right');
      if (d < -70) grade(GRADE.AGAIN);
      else if (d > 70) grade(GRADE.GOOD);
    };
    stage.addEventListener('touchstart', start, { passive: true });
    stage.addEventListener('touchmove', move, { passive: true });
    stage.addEventListener('touchend', end);
    stage.addEventListener('touchcancel', end);
    stage.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  })();

  document.addEventListener('keydown', e => {
    if (current() !== 'drill' || $('confirm-dialog').open) return;
    if (e.key === ' ' || e.key === 'Enter') {
      if (e.target.closest('.grade__btn, .icon-btn, .btn')) return; // let buttons be buttons
      e.preventDefault();
      if (Drill.revealed) grade(GRADE.GOOD); else reveal();
    }
    if (e.key === 'ArrowLeft') grade(GRADE.AGAIN);
    if (e.key === 'ArrowRight') grade(GRADE.GOOD);
  });

  /* ------------------------------ settings ------------------------ */
  function renderVoices() {
    const sel = $('set-voice');
    if (!sel) return;
    clear(sel);
    if (!Speech.voices.length) {
      sel.appendChild(h('option', { text: 'No French voice found' }));
      $('voice-sub').textContent = 'No French system voice detected — add one in your OS speech settings.';
      return;
    }
    for (const v of Speech.voices) {
      const o = h('option', { text: `${v.name} (${v.lang})` });
      o.value = v.voiceURI;
      if (Speech.pick && v.voiceURI === Speech.pick.voiceURI) o.selected = true;
      sel.appendChild(o);
    }
  }

  function renderSettings() {
    $('set-audio').checked = S.settings.audio;
    $('set-english').checked = S.settings.english;
    $('set-rate').value = S.settings.rate;
    $('set-new').value = S.settings.newPerSession;
    $('set-len').value = S.settings.sessionLen;
    applyTheme();
    renderVoices();
  }

  $('set-audio').addEventListener('change', e => { S.settings.audio = e.target.checked; save(); syncAudioIcon(); });
  $('set-english').addEventListener('change', e => { S.settings.english = e.target.checked; save(); });
  $('set-rate').addEventListener('change', e => {
    S.settings.rate = Number(e.target.value);
    save();
    Speech.say('Bonjour, je suis prêt.', true);
  });
  const clampInt = (v, lo, hi, fallback) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(Math.max(n, lo), hi) : fallback;
  };
  $('set-new').addEventListener('change', e => {
    S.settings.newPerSession = clampInt(e.target.value, 0, 40, DEFAULTS.settings.newPerSession);
    e.target.value = S.settings.newPerSession;
    save();
  });
  $('set-len').addEventListener('change', e => {
    S.settings.sessionLen = clampInt(e.target.value, 5, 200, DEFAULTS.settings.sessionLen);
    e.target.value = S.settings.sessionLen;
    save();
  });
  $('set-voice').addEventListener('change', e => {
    S.settings.voice = e.target.value;
    Speech.choose(e.target.value);
    save();
    Speech.say('Bonjour ! On y va.', true);
  });
  $('set-onboard').addEventListener('click', () => { renderOnboarding(); show('onboarding'); });

  $('set-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = h('a');
    a.href = URL.createObjectURL(blob);
    a.download = `frenchfries-progress-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('set-import').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        const looksRight = data && typeof data === 'object' && !Array.isArray(data) &&
          data.cards && typeof data.cards === 'object' && Array.isArray(data.active);
        if (!looksRight) throw new Error('not a profile');
        S = {
          ...DEFAULTS, ...data,
          settings: { ...DEFAULTS.settings, ...(data.settings || {}) },
          streak: { ...DEFAULTS.streak, ...(data.streak || {}) },
          log: { ...DEFAULTS.log, ...(data.log || {}) },
          active: data.active.filter(id => VERB_BY_ID[id]),
          phrases: Array.isArray(data.phrases)
            ? data.phrases.filter(p => p && p.id && p.fr && p.en)
            : []
        };
        if (!S.active.length) S.active = DEFAULTS.active.slice();
        save();
        applyTheme();
        renderHome();
        renderSettings();
        toast('Progress imported');
      } catch {
        toast('That file is not valid progress JSON');
      }
    };
    r.readAsText(f);
  });
  $('set-reset').addEventListener('click', async () => {
    const ok = await confirmAction(
      'Reset all progress?',
      'Every review, streak and schedule stored in this browser will be erased. This cannot be undone.',
      'Erase everything'
    );
    if (!ok) return;
    localStorage.removeItem(KEY);
    S = structuredClone(DEFAULTS);
    save();
    applyTheme();
    renderHome();
    renderSettings();
    toast('Progress reset');
  });

  /* ------------------------------- wiring ------------------------- */
  for (const b of document.querySelectorAll('[data-back]')) b.addEventListener('click', goBack);
  $('home-settings').addEventListener('click', () => { renderSettings(); show('settings'); });
  $('verb-speak').addEventListener('click', () => Speech.say(VERB_BY_ID[openVerbId].inf, true));

  function syncAudioIcon() {
    const on = S.settings.audio;
    $('icon-sound-on').hidden = !on;
    $('icon-sound-off').hidden = on;
    $('drill-audio').setAttribute('aria-label', on ? 'Mute audio' : 'Unmute audio');
  }
  $('drill-audio').addEventListener('click', () => {
    S.settings.audio = !S.settings.audio;
    save();
    syncAudioIcon();
    toast(S.settings.audio ? 'Audio on' : 'Audio muted');
  });

  $('done-again').addEventListener('click', () => startDrill(Drill.source));
  $('ob-start').addEventListener('click', () => {
    S.onboarded = true;
    save();
    renderHome();
    show('home', false);
    back = [];
  });

  for (const m of document.querySelectorAll('[data-mode]')) {
    m.addEventListener('click', () => {
      const mode = m.dataset.mode;
      if (mode === 'gears') { renderGears(); show('gears'); return; }
      if (mode === 'phrases') { renderPhrases(); show('phrases'); return; }
      startDrill(modeSource(mode));
    });
  }

  /* -------------------------------- boot -------------------------- */
  applyTheme();
  Speech.init();
  renderOnboarding();
  renderHome();
  syncAudioIcon();
  show(S.onboarded ? 'home' : 'onboarding', false);

  // Offline shell. Skipped on file:// where service workers are unavailable.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline is a bonus, not a requirement */ });
    });
    // A new deploy's worker claims the page mid-session; reload once so the
    // page is not running old JS against new HTML. Not on first install.
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded || current() === 'drill') return;
      reloaded = true;
      location.reload();
    });
  }
})();
