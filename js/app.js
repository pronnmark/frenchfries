/* ------------------------------------------------------------------
   app.js — screens, the chat-bubble loop, flashcards, audio, storage.

   Conventions:
   - DOM is built with h() — no innerHTML anywhere.
   - Styling comes from the design system (css/*). This file sets
     classes and data-gear; it never sets a colour or a pixel value.
   - JS hooks are data-* attributes, not component class names.
------------------------------------------------------------------ */
(() => {
  const D = window.DATA;
  const { GEARS, GEAR_BY_ID, VERBS, VERB_BY_ID } = D;
  const GRADE = FSRS.GRADE;

  const $ = id => document.getElementById(id);
  const txt = s => document.createTextNode(String(s));

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

  /** Design-system switch: <span.switch><input><span.switch__track></span> */
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
    settings: { audio: true, english: true, rate: 0.85, voice: '', newPerSession: 8, sessionLen: 20 },
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
        cards: raw.cards || {}
      };
    } catch {
      return structuredClone(DEFAULTS);
    }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(S)); }

  const today = () => new Date().toISOString().slice(0, 10);

  function bumpStreak() {
    const t = today();
    if (S.streak.last === t) return;
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    S.streak.count = S.streak.last === y ? S.streak.count + 1 : 1;
    S.streak.last = t;
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
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = Speech.pick ? Speech.pick.lang : 'fr-FR';
      if (Speech.pick) u.voice = Speech.pick;
      u.rate = S.settings.rate;
      window.speechSynthesis.speak(u);
    }
  };

  // "je suis allé(e)" → "je suis allé"; "il est venu / elle est venue" → "…, …"
  const speakable = s => s.replace(/\(e\)s|\(e\)|\(s\)/g, '').replace(/\s*\/\s*/g, ', ');

  /* ------------------------------ router -------------------------- */
  const SCREENS = ['onboarding', 'home', 'gears', 'verb', 'drill', 'settings'];
  let back = [];

  function show(name, push) {
    const cur = current();
    if (push !== false && cur && cur !== name) back.push(cur);
    for (const s of SCREENS) $(`screen-${s}`).hidden = s !== name;
    const sc = document.querySelector(`#screen-${name} .screen__scroll`);
    if (sc) sc.scrollTo(0, 0);
  }
  function current() { return SCREENS.find(s => !$(`screen-${s}`).hidden); }
  function goBack() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const prev = back.pop() || 'home';
    show(prev === 'drill' ? 'home' : prev, false);
    if (current() === 'home') renderHome();
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

  /* ---------------------------- card pools ------------------------ */
  function poolFor(mode) {
    const out = [];
    for (const vid of S.active) {
      for (const c of D.allCardsForVerb(vid)) {
        if (mode === 'chat' && c.kind !== 'chat') continue;
        if (mode === 'flash' && c.kind !== 'form') continue;
        out.push(c);
      }
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

  function buildSession(mode) {
    const now = Date.now();
    const due = [], fresh = [];
    for (const c of poolFor(mode)) {
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

  function statTile(value, label) {
    return h('div', { class: 'stat' }, [
      h('b', { class: 'stat__value', text: value }),
      h('span', { class: 'stat__label', text: label })
    ]);
  }

  function renderHome() {
    const ready = readyCount('mixed');
    const mixed = dueCount('mixed');
    const pool = poolFor('mixed');

    $('home-due').textContent = ready;
    $('home-due-sub').textContent = ready === 1 ? 'card ready' : 'cards ready';
    $('home-streak').textContent = `🔥 ${S.streak.count}`;
    $('home-newcount').textContent = `${Math.min(mixed.fresh, S.settings.newPerSession)} new`;
    $('home-totalcount').textContent = `${S.active.length} verbs · ${pool.length} cards in rotation`;

    let seen = 0;
    for (const c of pool) if (S.cards[c.id]) seen++;
    $('home-bar').style.width = `${Math.round(seen / Math.max(pool.length, 1) * 100)}%`;

    $('count-chat').textContent = readyCount('chat') || '✓';
    $('count-flash').textContent = readyCount('flash') || '✓';
    $('count-mixed').textContent = ready || '✓';

    // ---- verb garage
    const list = $('verb-list');
    clear(list);
    for (const v of VERBS) {
      const on = S.active.includes(v.id);
      const pct = Math.round(verbProgress(v.id) * 100);
      const main = h('button', {
        class: 'list-row__main',
        attrs: { 'aria-label': `${v.inf} — ${v.en}, ${pct}% learned. Open dashboard.` },
        on: { click: () => openVerb(v.id) }
      }, [
        h('span', { class: 'verb-list__inf', lang: 'fr' }, [txt(v.inf), h('span', { class: 'tag', text: v.family })]),
        h('span', { class: 'verb-list__en', text: v.en }),
        h('span', { class: 'meter meter--inline' }, [
          h('span', { class: 'meter__fill meter__fill--brand', style: { width: `${pct}%` } })
        ])
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
      list.appendChild(h('div', { class: `list-row${on ? '' : ' list-row--off'}` }, [main, sw]));
    }

    // ---- stats
    let mature = 0;
    for (const c of pool) if (strengthOf(c.id) > 0.8) mature++;
    const acc = S.log.reviews ? Math.round(S.log.good / S.log.reviews * 100) : 0;
    const grid = $('stat-grid');
    clear(grid);
    grid.appendChild(statTile(S.log.reviews, 'reps'));
    grid.appendChild(statTile(`${acc}%`, 'instant'));
    grid.appendChild(statTile(mature, 'mastered'));

    // ---- per-gear mastery
    const mastery = $('mastery');
    clear(mastery);
    for (const g of GEARS) {
      let sum = 0, n = 0;
      for (const c of pool) if (c.gearId === g.id) { sum += strengthOf(c.id); n++; }
      const pct = n ? Math.round(sum / n * 100) : 0;
      mastery.appendChild(h('div', { class: 'mastery__row', gear: g.id }, [
        h('span', { class: 'mastery__name', text: `${g.icon} ${g.nick}` }),
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
        h('span', { class: 'gear-list__n', text: g.n }),
        h('span', null, [
          h('span', { class: 'gear-list__name', text: g.nick }),
          h('span', { class: 'gear-list__meta', text: `${g.en} · ${g.fr} — ${g.when}` })
        ])
      ]));
    }
  }

  /* --------------------------- gears screen ----------------------- */
  function exampleEl(phrase) {
    return h('button', { class: 'example', on: { click: () => Speech.say(phrase[0], true) } }, [
      h('span', { class: 'example__fr', lang: 'fr', text: phrase[0] }),
      h('span', { class: 'example__en', text: phrase[1] })
    ]);
  }

  function renderGears() {
    const body = $('gears-body');
    clear(body);
    body.appendChild(h('p', {
      class: 'section__sub',
      text: 'You do not need 21 tenses. You need 6 gears — Time, Shape (aspect) and Mood, sorted by what they actually do in a conversation. Examples use avoir; tap one to hear it.'
    }));
    const ref = VERB_BY_ID.avoir;
    for (const g of GEARS) {
      body.appendChild(h('section', { class: 'card card--gear', gear: g.id }, [
        h('p', { class: 'gear-doc__fr', text: `Gear ${g.n} · ${g.fr}` }),
        h('h2', { class: 'gear-doc__title', text: `${g.icon} ${g.nick}` }),
        h('p', { class: 'gear-doc__instruction', text: g.instruction }),
        exampleEl(ref.gears[g.id].phrase)
      ]));
    }
    body.appendChild(h('div', { class: 'u-pad-bottom' }));
  }

  /* --------------------------- verb dashboard --------------------- */
  let openVerbId = 'avoir';

  function openVerb(vid) {
    openVerbId = vid;
    const v = VERB_BY_ID[vid];
    $('verb-title').textContent = v.inf;
    const body = $('verb-body');
    clear(body);

    body.appendChild(h('header', { class: 'verb-hero' }, [
      h('h2', { class: 'verb-hero__inf', lang: 'fr', text: v.inf }),
      h('p', { class: 'verb-hero__en', text: v.en }),
      h('p', {
        class: 'verb-hero__meta',
        text: `${v.family} · passé composé with ${v.aux} · ${Math.round(verbProgress(vid) * 100)}% learned`
      })
    ]));

    const sw = switchEl(S.active.includes(vid), `Keep ${v.inf} in rotation`, e => {
      if (e.target.checked) S.active.push(vid);
      else S.active = S.active.filter(x => x !== vid);
      if (!S.active.length) { S.active = [vid]; e.target.checked = true; }
      save();
      toast(e.target.checked ? `${v.inf} added to rotation` : `${v.inf} paused`);
    });
    body.appendChild(h('div', { class: 'card row' }, [
      h('div', { class: 'row__body' }, [
        h('p', { class: 'row__title', text: 'In rotation' }),
        h('p', { class: 'row__sub', text: 'Include this verb in your daily reviews.' })
      ]),
      sw
    ]));

    for (const g of GEARS) {
      const gg = v.gears[g.id];
      const conj = h('div', { class: 'conj' });
      gg.forms.forEach((f, i) => {
        conj.appendChild(h('button', {
          class: 'conj__row',
          attrs: { 'aria-label': `${f} — ${D.glossFor(v, g.id, i)}. Hear it.` },
          on: { click: () => Speech.say(speakable(f), true) }
        }, [
          h('span', { class: 'conj__fr', lang: 'fr', text: f }),
          h('span', { class: 'conj__en', text: D.glossFor(v, g.id, i) }),
          h('span', { class: 'conj__speaker', text: '🔊', attrs: { 'aria-hidden': 'true' } })
        ]));
      });

      const example = exampleEl(gg.phrase);
      example.classList.add('gear-block__example');

      body.appendChild(h('section', { class: 'card card--gear', gear: g.id }, [
        h('div', { class: 'gear-block__head' }, [
          h('span', { class: 'gear-block__n', text: g.n }),
          h('h2', { class: 'gear-block__title', text: `${g.icon} ${g.nick}` }),
          h('span', { class: 'gear-block__fr', text: g.fr })
        ]),
        h('p', { class: 'gear-block__instruction', text: g.instruction }),
        conj,
        example,
        h('button', {
          class: 'btn btn--ghost gear-block__drill',
          text: 'Drill this gear 💬',
          on: {
            click: () => startDrill({
              label: `${v.inf} · ${g.nick}`,
              build: () => D.allCardsForVerb(vid).filter(x => x.gearId === g.id)
            })
          }
        })
      ]));
    }
    body.appendChild(h('div', { class: 'u-pad-bottom' }));
    show('verb');
  }

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

    if (card.kind === 'chat') {
      $('thread').hidden = false;
      $('flashcard').hidden = true;
      $('thread-head').textContent = `${v.inf} · ${g.icon} ${g.nick}`;
      $('bubble-in-text').textContent = card.incoming;
      $('bubble-in-en').textContent = card.incomingEn;
      $('bubble-in-en').hidden = !S.settings.english;
      $('reply-pre').textContent = card.pre;
      $('reply-post').textContent = card.post;
      const blank = $('reply-blank');
      blank.textContent = '________';
      blank.className = 'blank';
      const vibe = $('vibe-tag');
      vibe.textContent = `${g.icon} The Vibe: ${g.vibe}`;
      vibe.dataset.gear = g.id;
      $('reveal-en').textContent = card.replyEn;
      $('reveal-en').hidden = true;
    } else {
      $('thread').hidden = true;
      $('flashcard').hidden = false;
      $('flashcard').dataset.gear = g.id;
      $('flash-gear').textContent = `${g.icon} ${g.nick} · ${g.fr}`;
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
  $('grade-again').addEventListener('click', () => grade(GRADE.AGAIN));
  $('grade-good').addEventListener('click', () => grade(GRADE.GOOD));

  (function swipe() {
    const stage = $('drill-stage');
    let x0 = null, dx = 0;
    const start = e => {
      if (!Drill.revealed) return;
      x0 = e.touches ? e.touches[0].clientX : e.clientX;
      dx = 0;
      stage.classList.add('drill__stage--dragging');
    };
    const move = e => {
      if (x0 === null) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      dx = x - x0;
      stage.style.transform = `translateX(${dx}px) rotate(${dx / 40}deg)`;
      stage.classList.toggle('drill__stage--left', dx < -30);
      stage.classList.toggle('drill__stage--right', dx > 30);
    };
    const end = () => {
      if (x0 === null) return;
      stage.classList.remove('drill__stage--dragging');
      const d = dx;
      x0 = null;
      stage.style.transform = '';
      stage.classList.remove('drill__stage--left', 'drill__stage--right');
      if (d < -70) grade(GRADE.AGAIN);
      else if (d > 70) grade(GRADE.GOOD);
    };
    stage.addEventListener('touchstart', start, { passive: true });
    stage.addEventListener('touchmove', move, { passive: true });
    stage.addEventListener('touchend', end);
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
    renderVoices();
  }

  $('set-audio').addEventListener('change', e => { S.settings.audio = e.target.checked; save(); syncAudioIcon(); });
  $('set-english').addEventListener('change', e => { S.settings.english = e.target.checked; save(); });
  $('set-rate').addEventListener('change', e => {
    S.settings.rate = Number(e.target.value);
    save();
    Speech.say('Bonjour, je suis prêt.', true);
  });
  $('set-new').addEventListener('change', e => { S.settings.newPerSession = Number(e.target.value) || 0; save(); });
  $('set-len').addEventListener('change', e => { S.settings.sessionLen = Math.max(5, Number(e.target.value) || 20); save(); });
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
        S = { ...DEFAULTS, ...data, settings: { ...DEFAULTS.settings, ...(data.settings || {}) } };
        save();
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
    renderHome();
    renderSettings();
    toast('Progress reset');
  });

  /* ------------------------------- wiring ------------------------- */
  for (const b of document.querySelectorAll('[data-back]')) b.addEventListener('click', goBack);
  $('home-settings').addEventListener('click', () => { renderSettings(); show('settings'); });
  $('verb-speak').addEventListener('click', () => Speech.say(VERB_BY_ID[openVerbId].inf, true));

  function syncAudioIcon() {
    const b = $('drill-audio');
    b.textContent = S.settings.audio ? '🔊' : '🔇';
    b.setAttribute('aria-label', S.settings.audio ? 'Mute audio' : 'Unmute audio');
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
      startDrill(modeSource(mode));
    });
  }

  /* -------------------------------- boot -------------------------- */
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
  }
})();
