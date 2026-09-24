# 🍟 French Fries — the 6-Gear Verb Engine

Learn French verbs the way they actually work in conversation: **6 gears, not 21 tenses.**
Zero-friction drills that look like a text message thread, native audio on every reveal, and an
FSRS spaced-repetition engine underneath.

No build step, no dependencies, no backend. Open `index.html` and it runs.

---

## The 6 gears

| # | Vibe | Tense | When you reach for it |
|---|------|-------|-----------------------|
| 1 | The "Right Now" | Le Présent | Happening now · everyday truth |
| 2 | The "Done Deal" | Le Passé Composé | One finished event — a dot on the timeline |
| 3 | The "Background" | L'Imparfait | Scene · habit · "used to" |
| 4 | The "Guarantee" | Le Futur Simple | Will definitely happen |
| 5 | The "Alternate Universe" | Le Conditionnel | Would · politely · if |
| 6 | The "Heart & Gut" | Le Subjonctif | Emotion · doubt · necessity |

Every verb plugs into the exact same dashboard: the 6 gears, all six persons per gear with
English glosses, and a real-world phrase you can steal today.

## The loop

**Read the chat → think of the word → tap to check → swipe to grade.**

1. **Prompt** — a grey incoming bubble, your blue reply with a blank, and the vibe tag underneath
   (`⏪ The Vibe: Done Deal`). Contextual hook, not a sterile list.
2. **Reveal** — tap anywhere; the blank fills and the full sentence is spoken aloud in French
   (phonological loop).
3. **Grade** — 🔴 swipe left ("wrong / too slow") or 🟢 swipe right ("knew it instantly").
   Left brings that exact bubble back in ~3 minutes. Right hides it for days, then weeks, then
   months — at the mathematical moment you were about to forget it.

No typing. No multiple choice. 50 reps while you wait for the bus.

## Modes

- **💬 Chat Drill** — the core loop, one thread per verb per gear (90 threads shipped).
- **🃏 Flashcards** — **English in, French out**: the front shows the English conjugation
  (*"we used to have"*), you say the French, tap, and the answer is *nous avions*. The prompt is
  generated per gear so the "Done Deal" and the "Background" can never collide (*"I had"* vs
  *"I used to have"*). Same swipe grading, same scheduler.
- **⚡ Mixed Review** — everything the algorithm says is due right now.
- **⚙ The 6 Gears** — what each gear means, with an *avoir* example you can tap to hear.
- **Verb dashboard** — the full 6-gear template for any verb, every form tappable for audio,
  plus "Drill this gear".

## What is in the box

15 verbs × 6 gears × 6 persons = **540 conjugated forms + 90 chat threads**, all hand-written:

`être · avoir · aller · faire · pouvoir · vouloir · devoir · savoir · dire · venir · prendre · voir`
plus the three regular models `parler (-er) · finir (-ir) · attendre (-re)`.

Two verbs (*être*, *avoir*) start in rotation; flip any other verb on from the garage.

## The engine (FSRS)

`js/fsrs.js` is a real [FSRS-4.5](https://github.com/open-spaced-repetition) implementation —
difficulty/stability memory states, power-law forgetting curve, 90% target retention — reduced to
a two-button interface (Again / Good) so the UI stays a swipe.

- 🔴 Again → state `relearning`, due in 3 minutes, stability takes the forgetting penalty.
- 🟢 Good → stability grows, next interval = the point where recall probability decays to 90%
  (≈ 3 days → ~1 week → ~3 weeks → months).

The grade buttons show you the actual next interval before you commit.

## Run it

```bash
open index.html            # that is genuinely it
# or, for a proper origin (recommended — enables the service worker and PWA install):
python3 -m http.server 8080
```

Then visit <http://localhost:8080>. On iOS/Android use **Share → Add to Home Screen** for a
full-screen app; the service worker precaches the shell so it launches with no network. Deploy
anywhere static (Pages, Netlify, an S3 bucket, a Coolify static app).

> Changing a file in `ASSETS`? Bump `CACHE` in `sw.js`, or returning users keep the old shell.

### Keyboard (desktop)

| Key | Action |
|-----|--------|
| `Space` / `Enter` | reveal, then grade as Good |
| `←` | 🔴 Again |
| `→` | 🟢 Good |

## Audio

Uses the Web Speech API with your device's French voice — no audio files, works offline.
macOS: *System Settings → Accessibility → Spoken Content → System Voice → Manage Voices* and add
a French voice (Thomas, Amélie, Audrey) for a proper native sound. Pick the exact voice and speech
rate in Settings.

## Data

Everything lives in `localStorage` under `frenchfries.v1` — progress never leaves the device.
Settings has **Export / Import** (plain JSON) to move a profile between browsers, and a reset.

## Design system

The UI is built on a token layer, not ad-hoc CSS — see **[DESIGN.md](DESIGN.md)**.

> Tokens decide, components express, screens compose.

`tokens.css` is the only file allowed to contain a raw value; `components.css` holds the kit
(`.card`, `.btn`, `.pill`, `.switch`, `.meter`, `.bubble`, `.grade`, `.dialog`…); `screens.css`
only composes them. JS hooks are `data-*` attributes, never component classes, so styling can be
renamed without breaking behaviour. Each gear owns one hue, declared once — set
`data-gear="imparfait"` on any element and its subtree can use `var(--gear)`.

## Checks

```bash
node tools/check-data.mjs   # 15 verbs · 540 forms · 90 threads · 630 cards
```

It verifies far more than shape: every chat thread's blank must genuinely be a form of the gear
it claims, the passé composé must use the verb's declared auxiliary, subjunctive forms must carry
`que/qu'`, spacing around each blank must produce a clean sentence, and no two gears may generate
the same English prompt.

## Adding a verb

Append one object to `VERBS` in `js/data.js`. Cards, dashboards, drills and stats are generated
from it — nothing else to touch.

```js
{
  id: 'boire', inf: 'boire', en: 'to drink', aux: 'avoir', family: 'irregular',
  enPresent: ['drink','drink','drinks','drink','drink','drink'],
  enPast: 'drank', enPP: 'drunk', enInf: 'drink',
  gears: {
    present: {
      forms: ['je bois','tu bois','il/elle boit','nous buvons','vous buvez','ils/elles boivent'],
      phrase: ['Je bois de l’eau.', 'I drink water.'],
      chat: { in: 'Un verre de vin ?', inEn: 'A glass of wine?',
              pre: 'Non, je ', ans: 'bois', post: ' de l’eau.', en: 'No, I drink water.' }
    },
    // …passe, imparfait, futur, conditionnel, subjonctif
  }
}
```

Then run `node tools/check-data.mjs` — it will tell you if anything in the new entry is off.

## Layout

```
index.html                 all screens (onboarding, home, gears, dashboard, drill, settings)
css/tokens.css             design tokens — the only file with raw values
css/base.css               reset, document defaults, focus ring, utilities
css/components.css         the component kit
css/screens.css            per-screen composition
js/data.js                 the 6 gears + every verb + card generation
js/fsrs.js                 FSRS-4.5 scheduler
js/app.js                  screens, the loop, swipe/tap input, audio, storage
sw.js                      offline app shell (bump CACHE when assets change)
tools/check-data.mjs       content integrity gate
DESIGN.md                  the design system
```

MIT.
