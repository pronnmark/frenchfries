# French Fries — design system

One dark theme, four stylesheets, no framework, no build. The rule is simple:

> **Tokens decide, components express, screens compose.**

## Layers

| File | Owns | May contain |
|------|------|-------------|
| `css/tokens.css` | colour, space, type, radius, elevation, motion, z-index, gear hues | raw values — **this is the only file allowed to** |
| `css/base.css` | reset, document defaults, focus ring, a few utilities | token references |
| `css/components.css` | the reusable kit (card, btn, pill, switch, meter, bubble, dialog…) | token references |
| `css/screens.css` | per-screen layout and composition | component classes + token references |

A rule in `screens.css` that invents a colour, radius or font size is a bug — the value belongs in
`tokens.css` or the pattern belongs in `components.css`.

## Naming

- Components use BEM: `block`, `block__element`, `block--modifier`
  (`grade__btn grade__btn--again`, `card card--gear`).
- Utilities are prefixed `u-` and are deliberately few. If you reach for a utility three times,
  promote it to a component.
- **JS never hooks a component class.** Behaviour attaches to `data-*` attributes
  (`data-mode`, `data-back`, `data-gear`) or to an `id`. That means a class can be renamed for
  visual reasons without breaking the app.

## Tokens worth knowing

```
--bg  --bg-raised  --surface  --surface-raised   surfaces, dark → light
--border  --border-strong                        hairlines
--text  --text-muted  --text-subtle              type, all AA on --bg
--brand (blue)  --accent (amber)  --success  --danger
--space-1…10        4pt scale: 4,8,12,16,20,24,32,40,48,64
--radius-xs…pill    6,10,14,18,22,999
--size-2xs…3xl      11,12,13,15,17,20,26,32,38
--dur-1/2/3 + --ease-out/--ease-pop
--control-height    44px — the minimum touch target, used by every control
```

### Gear identity

The six gears each own a hue, defined once in `tokens.css`. Put `data-gear="<gear id>"` on any
element and every descendant can style itself with `var(--gear)`:

```html
<section class="card card--gear" data-gear="imparfait"> … </section>
```

```css
.gear-doc__fr { color: var(--gear); }
```

`js/data.js` deliberately carries **no** colour values — a gear's hue exists in exactly one place.

## Component inventory

**Shell** `.screen` · `.screen__scroll` · `.appbar` (+`__title`, `__slot`, `__progress`, `__count`)
**Actions** `.btn` (`--primary`, `--ghost`, `--danger`, `--block`, `--lg`) · `.icon-btn`
**Containers** `.card` (`--quiet`, `--hero`, `--gear`, `--interactive`) · `.row` (+`__body`, `__title`, `__sub`) · `.list-row` (+`__main`, `--off`)
**Data** `.meter` (+`__fill`, `--thin`, `--inline`, `__fill--gear/--accent/--brand`) · `.stat` (+`__value`, `__label`)
**Labels** `.pill` (`--gear`) · `.tag` · `.eyebrow` · `.section__title` / `.section__sub`
**Form** `.switch` (+`__input`, `__track`) · `.field__control` (`--number`, `--select`, `--range`)
**Drill** `.bubble` (`--in`, `--out`, `__translation`) · `.blank` (`--filled`) · `.flashcard` · `.grade` (+`__btn--again/--good`)
**Overlay** `.toast` · `.dialog` (+`__title`, `__body`, `__actions`)

## Interaction rules

- Minimum touch target is `--control-height` (44px). Nothing tappable is smaller.
- Press feedback is `transform: scale(.97–.98)` at `--dur-1`, never a colour flash alone.
- Focus is one treatment everywhere: `:focus-visible` → `--ring`. Never remove it.
- Every animation is skipped under `prefers-reduced-motion`.
- `[hidden]` is forced to `display: none` in `base.css`, because several toggled elements are
  `display:flex/grid` and would otherwise ignore it.

## Layering

`--z-stage(1) < --z-tap(3) < --z-grade(4) < --z-appbar(6) < --z-toast(40) < --z-dialog(50)`

The drill's full-screen tap layer sits *below* the app bar on purpose: back and mute must stay
clickable while a card is still hidden.

## Accessibility contract

- All body text passes WCAG AA on `--bg`; `--text-subtle` is the lightest allowed and is reserved
  for ≥13px.
- Icon-only buttons carry `aria-label`; decorative emoji carry `aria-hidden="true"`.
- French strings carry `lang="fr"` so screen readers and speech synthesis switch voice.
- Revealed answers are announced through `#live-region`; toasts are `role="status"`.
- The viewport does **not** set `maximum-scale`, so pinch-zoom works.

## Adding UI

1. Can you build it from existing components? Do that.
2. Needs a new visual pattern? Add a component to `components.css` using only tokens.
3. Needs a new value (a colour, a size)? Add a token first, then use it.
