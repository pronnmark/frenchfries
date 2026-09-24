# French Fries — design methodology

Light by default, dark on request, no framework, no build. Four stylesheets and one rule:

> **Tokens decide. Components express. Screens compose.**

---

## 1. Principles

**Paper, not chrome.**
The surface is paper; the content sits on it. A hairline before a box, a box before a shadow, a
shadow only for things that float (toast, dialog, the switch knob). If a group of elements reads
as a group because of space alone, it does not get a border.

**Type is the hierarchy.**
Size, weight and colour rank the content — not coloured panels, not badges, not boxes. There are
seven type roles and three text colours. Needing an eighth size means a role is missing, not that
a one-off value is justified.

**Colour means something or it is absent.**
Exactly three jobs: **gear identity** (six hues), **action** (brand blue), **state** (success,
danger). Nothing is coloured for decoration. That is why the six gear hues read instantly — they
are the only colour on most screens.

**One idea per screen.**
The drill screen shows a card and two choices. Nothing else competes: no stats, no streak, no
navigation. The eye should land in one place.

**Motion confirms, never entertains.**
Three durations, two easings. Animation exists to say "that landed" (`pop` on a revealed answer)
or "this arrived" (`grade-in`). Everything is skipped under `prefers-reduced-motion`.

**Say less.**
Labels are the shortest phrase that is still unambiguous: "Again", "Knew it", "Garage",
"English in, French out." Sentences in the UI end without exclamation.

---

## 2. Layers

| File | Owns | May contain |
|------|------|-------------|
| `css/tokens.css` | colour, space, type, radius, elevation, motion, z-index, gear hues, **both themes** | raw values — the only file allowed them |
| `css/base.css` | reset, document defaults, focus ring, a few utilities | token references |
| `css/components.css` | the reusable kit | token references |
| `css/screens.css` | per-screen layout and composition | component classes + token references |

A rule in `screens.css` that invents a colour, radius or font size is a bug: the value belongs in
`tokens.css`, or the pattern belongs in `components.css`.

---

## 3. Theming

Light and dark are the **same semantic tokens with different primitives**. `[data-theme='dark']`
swaps `--paper`, `--ink-*`, `--line-*`, the brand and the six gear hues; nothing else in the
codebase changes, and no component knows which theme is active.

```css
:root              { --bg: var(--paper); --text: var(--ink-900); }
[data-theme='dark'] { --paper: #0f1116; --ink-900: #edeff3; }
```

Two consequences worth knowing:

- `--on-brand` is white in **both** themes, which is why the dark brand blue is a shade deeper
  than the light one — white has to clear 4.5:1 on it either way.
- Washes are derived (`color-mix(in srgb, var(--gear) 10%, transparent)`), so tinted backgrounds
  follow the theme automatically instead of being redefined per theme.

The theme is applied by an inline script in `<head>` **before first paint**, so there is no flash
of the wrong palette. Settings offers Light / Dark / Auto; Auto follows `prefers-color-scheme`
live, without a reload.

---

## 4. Naming and hooks

- Components use BEM: `block`, `block__element`, `block--modifier`
  (`grade__btn grade__btn--again`, `list__item list__item--muted`).
- Utilities are prefixed `u-`. There are five. A utility reached for three times becomes a
  component.
- **JS never hooks a component class.** Behaviour attaches to `data-*` attributes (`data-mode`,
  `data-back`, `data-gear`, `data-theme-choice`) or an `id`. A class can therefore be renamed for
  visual reasons without breaking the app.
- `js/app.js` sets classes and `data-gear` and nothing else: no colours, no sizes, no spacing.

### Gear identity

Six hues live once, in `tokens.css`. Put `data-gear="<gear id>"` on any element and its entire
subtree can style itself from `var(--gear)`:

```html
<section class="gear-block" data-gear="imparfait"> … </section>
```
```css
.gear-block__fr { color: var(--gear); }
.dot { background: var(--gear); }
```

`js/data.js` carries **no** colour values. The gear's identity in the UI is a small dot or a
numbered chip — never a filled card, never an emoji.

---

## 5. Component inventory

**Shell** `.screen` · `.screen__scroll` · `.appbar` (+`__title`, `__slot`, `__progress`, `__count`)
**Action** `.btn` (`--primary`, `--quiet`, `--danger`, `--block`, `--lg`) · `.icon-btn` · `.segment` (+`__btn`)
**Container** `.panel` (`--framed`, `--inset`, `--gear`) · `.row` (+`__body`, `__title`, `__sub`) · `.section` (+`__title`, `__sub`)
**Collection** `.list` (+`__item`, `__body`, `__title`, `__sub`, `__meta`, `--muted`)
**Identity** `.dot` · `.gear-label` (+`__text`) · `.gear-index`
**Data** `.meter` (+`__fill`, `--thin`, `__fill--gear/--brand`) · `.metric` (+`__value`, `__label`)
**Form** `.switch` (+`__input`, `__track`) · `.field__control` (`--number`, `--select`, `--range`)
**Drill** `.bubble` (`--in`, `--out`, `__translation`) · `.blank` (`--filled`) · `.flashcard` · `.grade` (+`__btn--again/--good`)
**Overlay** `.toast` · `.dialog` (+`__title`, `__body`, `__actions`)

---

## 6. Interaction contract

- Minimum touch target is `--control-height` (44px). Nothing tappable is smaller.
- Press feedback is `transform: scale(.97–.985)` at `--dur-1`, never a colour flash alone.
- Focus is one treatment everywhere: `:focus-visible` → `--ring`. Never removed, never restyled
  per component.
- `[hidden]` is forced to `display: none` in `base.css`, because several toggled elements are
  `display:flex/grid` and would otherwise ignore it.
- Layering is fixed:
  `--z-stage(1) < --z-tap(3) < --z-grade(4) < --z-appbar(6) < --z-toast(40) < --z-dialog(50)`.
  The drill's full-screen tap layer sits **below** the app bar on purpose — back and mute stay
  clickable while a card is still hidden.

---

## 7. Accessibility contract

- All text passes WCAG AA against its background in both themes. `--text-subtle` is the lightest
  permitted and is reserved for ≥13px.
- Icon-only buttons carry `aria-label`; decorative marks carry `aria-hidden="true"`.
- Icons are inline SVG using `currentColor` — they inherit theme and state, and there is no emoji
  in the chrome.
- French strings carry `lang="fr"` so screen readers and speech synthesis switch voice.
- Revealed answers are announced through `#live-region`; toasts are `role="status"`.
- The viewport sets no `maximum-scale`, so pinch-zoom works.

---

## 8. Adding UI

1. Can it be built from existing components? Build it.
2. Needs a new pattern? Add a component to `components.css`, using tokens only.
3. Needs a new value? Add the token first, in both themes, then use it.
4. Reaching for a box? Try space, then a hairline, then a box.
