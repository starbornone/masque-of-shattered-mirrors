# Architecture

Scaffold is in place (Vite + React + TypeScript + Tailwind v4 + shadcn/ui). Attribute engine, SessionZero, CampaignFit, and GMBrief modules are still planned — see [ROADMAP.md](../ROADMAP.md).

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
               │  soft scores / flags   │
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
| App shell | Routing between steps; Player / GM mode toggle (GM panel hidden by default) |
| SessionZero | Invitation blurb and guided answers; localStorage + Markdown/JSON export |
| Build | Remaster attribute planning; share link + ledger export |
| Attribute engine | Ported `options` / `normalizeBuild` / `ancestryRule` / `calculate` / serialize-parse |
| CampaignFit | Checklist against Will, Perception, social, Stealth/Thievery, investigation |
| GMBrief | One-page tailoring summary; spoilers only when mode is GM |

The header and browser tab share the same [SVG emblem](../public/favicon.svg). It pairs Pharasma's spiraling comet with a fractured silver masquerade mask.

The [shell backdrop](../src/assets/verathe-mirror.svg) shows a fractured mirror with a spiral of still candles. The artwork sits to the right of the invitation on wide screens and fades into the lower corner on narrow screens.

## Data and control flow

1. Player completes session-zero questions → answers stored as `SessionZero` (localStorage + optional export).
2. Player (or GM) builds attributes → `Build` normalized and calculated by the ported engine.
3. Campaign-fit reads `Build` (+ maybe answer hints) → soft tips and combat-as-default warnings for both audiences.
4. GM mode overlays mapping of answers → scapegoat/stake wiring, Verathe framing, deity levers, Marius/mask beat.
5. Exports: mechanical share URL / JSON; session-zero Markdown or JSON; later a unified package (Phase 6).

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
