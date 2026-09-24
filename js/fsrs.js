/* ------------------------------------------------------------------
   fsrs.js — FSRS-4.5 scheduler (2-button: Again / Good)
   The "invisible engine": every swipe updates stability + difficulty,
   and the next due date is the mathematical moment you are about to
   forget the card (desired retention = 90%).
------------------------------------------------------------------ */

const FSRS = (() => {
  const W = [
    0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234,
    1.616, 0.1544, 1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407,
    2.9466, 0.5034, 0.6567
  ];

  const DECAY = -0.5;
  const FACTOR = Math.pow(0.9, 1 / DECAY) - 1; // 19/81
  const REQUEST_RETENTION = 0.9;
  const MAX_INTERVAL = 365;        // days
  const AGAIN_DELAY_MIN = 3;       // "show it again in 3 minutes"
  const MIN_INTERVAL = 1;          // days

  const GRADE = { AGAIN: 1, GOOD: 3 };

  const clampD = d => Math.min(Math.max(d, 1), 10);

  const initStability = g => Math.max(W[g - 1], 0.1);
  const initDifficulty = g => clampD(W[4] - (g - 3) * W[5]);

  // Retrievability after t days with stability s
  function retrievability(t, s) {
    if (s <= 0) return 0;
    return Math.pow(1 + FACTOR * t / s, DECAY);
  }

  function nextInterval(s) {
    const i = (s / FACTOR) * (Math.pow(REQUEST_RETENTION, 1 / DECAY) - 1);
    return Math.min(Math.max(Math.round(i), MIN_INTERVAL), MAX_INTERVAL);
  }

  function nextDifficulty(d, g) {
    const delta = d - W[6] * (g - 3);
    return clampD(W[7] * initDifficulty(4) + (1 - W[7]) * delta);
  }

  function recallStability(d, s, r, g) {
    const hardPenalty = 1;                 // "hard" is not exposed in this UI
    const easyBonus = g === 4 ? W[16] : 1; // ditto "easy"
    return s * (1 + Math.exp(W[8]) *
      (11 - d) *
      Math.pow(s, -W[9]) *
      (Math.exp(W[10] * (1 - r)) - 1) *
      hardPenalty * easyBonus);
  }

  function forgetStability(d, s, r) {
    const sf = W[11] *
      Math.pow(d, -W[12]) *
      (Math.pow(s + 1, W[13]) - 1) *
      Math.exp(W[14] * (1 - r));
    return Math.min(sf, s);
  }

  /** A brand new memory state. */
  function newState() {
    return { s: 0, d: 0, reps: 0, lapses: 0, due: 0, last: 0, state: 'new', ivl: 0 };
  }

  /**
   * Grade a card.
   * @param {object} st   memory state (mutated copy returned)
   * @param {number} g    FSRS.GRADE.AGAIN | FSRS.GRADE.GOOD
   * @param {number} now  epoch ms
   */
  function review(st, g, now) {
    now = now || Date.now();
    const out = Object.assign({}, st);
    const isNew = !out.reps || out.state === 'new';

    if (isNew) {
      out.s = initStability(g);
      out.d = initDifficulty(g);
    } else {
      const elapsedDays = Math.max((now - (out.last || now)) / 86400000, 0);
      const r = retrievability(elapsedDays, out.s || 0.1);
      out.d = nextDifficulty(out.d || initDifficulty(g), g);
      out.s = g === GRADE.AGAIN
        ? forgetStability(out.d, out.s || 0.1, r)
        : recallStability(out.d, out.s || 0.1, r, g);
      out.lastR = r;
    }

    out.reps = (out.reps || 0) + 1;
    out.last = now;

    if (g === GRADE.AGAIN) {
      out.lapses = (out.lapses || 0) + 1;
      out.state = 'relearning';
      out.ivl = 0;
      out.due = now + AGAIN_DELAY_MIN * 60000; // back in 3 minutes
    } else {
      out.state = 'review';
      out.ivl = nextInterval(out.s);
      out.due = now + out.ivl * 86400000;
    }
    return out;
  }

  /** Human label for what a grade will do, used on the swipe hints. */
  function preview(st, g, now) {
    const next = review(st, g, now);
    return next.ivl ? fmtDays(next.ivl) : '3 min';
  }

  function fmtDays(d) {
    if (d < 1) return '<1 day';
    if (d === 1) return '1 day';
    if (d < 30) return d + ' days';
    if (d < 60) return '1 month';
    if (d < 365) return Math.round(d / 30) + ' months';
    return (d / 365).toFixed(1) + ' years';
  }

  /** 0..1 estimate of how well the card is known right now. */
  function strength(st, now) {
    if (!st || !st.reps || !st.s) return 0;
    const elapsed = Math.max(((now || Date.now()) - st.last) / 86400000, 0);
    const r = retrievability(elapsed, st.s);
    const matured = Math.min(st.s / 30, 1); // 30d stability ≈ mature
    return Math.max(0, Math.min(1, r * 0.4 + matured * 0.6));
  }

  return {
    GRADE, newState, review, preview, strength, retrievability,
    nextInterval, fmtDays, AGAIN_DELAY_MIN
  };
})();
