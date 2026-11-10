# Architecture

The app opens the player’s character guide, saved build step, or a shared build preview. The build review and shared preview include campaign fit. A separate GM entry point and GMBrief are planned in [ROADMAP.md](../ROADMAP.md).

## Goals that drive structure

1. **Player-safe by default** — ritual spoilers, scapegoat identity, and deity climax levers stay behind GM mode.
2. **Reuse proven boost math** — attribute ledger logic comes from `pf2e-point-buy-calc`, not a second implementation.
3. **Local-first** — static Vite + TypeScript app; persistence via localStorage, share URLs, and export files.

## Major components

```
┌─────────────────────────────────────────────────────────┐
│                     App shell (Vite)                    │
│  mode: Player | GM                                      │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐   ┌────────────────────────────┐
│  SessionZero module    │   │  Build module              │
│  questions, mask, art, │   │  ancestry / background /   │
│  faith, stake          │   │  class / level / boosts    │
│  export MD/JSON        │   │  engine: normalizeBuild,   │
│                        │   │  ancestryRule, calculate   │
└────────────┬───────────┘   └─────────────┬──────────────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
               ┌────────────────────────┐
               │  CampaignFit           │
               │  attributes and checks │
               └────────────┬───────────┘
                            ▼
               ┌────────────────────────┐
               │  GMBrief (GM mode)     │
               │  stake → scapegoat,    │
               │  faith → deity hooks,  │
               │  copyable summary      │
               └────────────────────────┘
```

| Component | Responsibility |
|-----------|----------------|
| App shell | Restores the player’s saved concept and build. Opens shared builds in a separate preview. |
| SessionZero | Guided questions, editable review, and [versioned storage and exports](../src/session-zero/draft.ts) |
| Build | [Guided Remaster attribute planning](../src/components/BuildGuide.tsx), a share link, and a printable ledger |
| Attribute engine | [`src/attributes/`](../src/attributes/) holds the ported catalogs, boost ledger, and versioned build serialization |
| CampaignFit | [Player-facing checklist](../src/components/CampaignFit.tsx) that connects current attribute modifiers to relevant checks |
| GMBrief | One-page tailoring summary; spoilers only when mode is GM |

The header and browser tab share the same [SVG emblem](../public/favicon.svg). A fractured oval mirror frames the silver masquerade mask.

The [shell backdrop](../src/assets/verathe-mirror.svg) shows a fractured mirror with a spiral of silver sparkles. The artwork sits to the right of the invitation on wide screens and fades into the lower corner on narrow screens.

## Data and control flow

1. Player answers or skips the session-zero questions. The browser stores answers and progress together in localStorage, and the review offers JSON and Markdown downloads of the answers.
2. Player selects ancestry, background, class, level, and boosts. The ported engine normalizes and calculates the current `Build`. The browser saves the build and current step separately from concept answers. The review shows unchosen options and unassigned boosts in an incomplete draft.
3. Campaign fit uses the calculated build in the review and shared preview. It shows the attribute contribution for each check. Proficiency belongs to the planned skill planner. [Paizo’s Remaster character sheet](https://downloads.paizo.com/RemasterPlayerCoreCharacterSheet.pdf)
4. GM mode overlays mapping of answers → scapegoat/stake wiring, Verathe framing, deity levers, Marius/mask beat.
5. A build URL contains only mechanics. Opening it previews the build, and choosing **Use shared build** replaces the saved mechanical draft. The printable ledger uses the same calculation as the live view. Concept answers export separately as Markdown or JSON.

Player export must never include GM-only spoilers. GM brief may reference campaign wiring that the player UI never shows.

## Catalog boundary

- First-class options: **Player Core** and **Player Core 2**.
- Anything else: custom rows, not a full AoN scrape.
- Skills planner (Phase 5) stays a sketch for the night—not a full digital sheet.

## How a change typically lands

| Kind of change | Where it belongs |
|----------------|------------------|
| Boost math / ledger | Attribute engine (+ smoke tests ported from `test/build.test.ts`) |
| Invitation copy, questions, mask | SessionZero |
| Soft “this night rewards…” tips | CampaignFit (+ player-facing copy) |
| Scapegoat / deity / Verathe wiring text | GMBrief only |
| Persistence / share / import | Serialization helpers shared with the point-buy calculator patterns |

Ship a usable solo session-zero + attributes loop **before** any feat catalog work. See [roadmap/roadmap.json](../roadmap/roadmap.json) and [ROADMAP.md](../ROADMAP.md).

## Related

- [Overview](overview.md)
- [Getting started](getting-started.md)
- [Decisions](decisions.md)
- [Development](development.md)
