# French Fries — Duolingo Design Methodology

Playful, tactile, 3D gamified learning experience inspired by Duolingo Feather. Light by default, dark on request, zero build step.

> **Tokens decide. Components express. Screens compose.**

---

## 1. Core Principles

**Tactile 3D physical feel.**
Buttons and cards have physical depth (`box-shadow: 0 4px 0 var(--border-shade)` or `border-bottom: 4px solid ...`) that depresses realistically on press (`translateY(3px)`). Every interaction feels responsive and joyful.

**Vibrant, meaningful color.**
Duolingo Green (`#58cc02`) for mastery and primary actions, Action Blue (`#1cb0f6`) for verbs and links, Fire Orange (`#ff9600`) for streaks, Coral Red (`#ff4b4b`) for "Again" reviews, and vibrant individual hues for the 6 verb gears.

**Gamified feedback & micro-metrics.**
Top bar displays live daily streak (🔥) and cards due (⚡). The daily goal bar uses a chunky capsule meter with glossy highlight.

**Zero-friction drill loop.**
Chat bubbles with expressive borders and tails. Flashcards in elevated 3D cards. A fixed bottom action bar with high-contrast, oversized 3D buttons for "Again" and "Knew it" with immediate interval previews.

---

## 2. Token Architecture

| File | Owns | Contents |
|------|------|----------|
| `css/tokens.css` | Duolingo color palette, 3D bevels, typography, radius, animations, dark mode overrides | Raw token values |
| `css/base.css` | Reset, document defaults, focus ring, accessibility | Token references |
| `css/components.css` | 3D buttons (`.btn`), cards (`.list__item`), meters, bubbles, switches, pills | Reusable component kit |
| `css/screens.css` | Screen layouts (Home, Onboarding, Gears, Verb Dashboard, Drill, Settings) | Compositions |
