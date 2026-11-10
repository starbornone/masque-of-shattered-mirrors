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
| App shell | Restores the [player’s saved character](../src/character/draft.ts). Opens shared builds in a separate preview. |
| SessionZero | Guided questions, editable review, and [versioned storage and exports](../src/session-zero/draft.ts) |
| Build | [Guided Remaster attribute planning](../src/components/BuildGuide.tsx), a share link, and a printable ledger |
| Attribute engine | [`src/attributes/`](../src/attributes/) holds the ported catalogs, boost ledger, and versioned build serialization |
| Skills | [Skill planner](../src/components/SkillPlanner.tsx) for starting training, named Lore, and level-based increases |
| CampaignFit | [Build suggestions](../src/components/BuildFitSuggestions.tsx) at the background and class steps, plus a [review checklist](../src/components/CampaignFit.tsx) that connects current modifiers to relevant checks |
| GMBrief | One-page tailoring summary; spoilers only when mode is GM |

The header and browser tab share the same [SVG emblem](../public/favicon.svg). A fractured oval mirror frames the silver masquerade mask.

The [shell backdrop](../src/assets/verathe-mirror.svg) shows a fractured mirror with a spiral of silver sparkles. The artwork sits to the right of the invitation on wide screens and fades into the lower corner on narrow screens.

## Data and control flow

1. Player answers or skips the session-zero questions. The review offers JSON and Markdown downloads of the answers.
2. Player selects ancestry, background, class, level, and boosts. The ported engine normalizes and calculates the current `Build`. The review shows unchosen options and unassigned boosts in an incomplete draft.
3. A complete attribute ledger unlocks the skill planner. Players enter starting training, and the planner applies increases in level order with rank limits. The draft stores skills locally. The review includes planned skill ranks and base modifiers in campaign fit. [Paizo’s Remaster character sheet](https://downloads.paizo.com/RemasterPlayerCoreCharacterSheet.pdf)
4. A build URL contains only mechanics. Opening it previews the build, and choosing **Use shared build** replaces the saved mechanical draft. The printable ledger uses the same calculation as the live view.
5. One versioned player draft stores concept answers, attributes, skills, and guide progress in localStorage. The app reads the older separate saves when a combined draft is unavailable. **Export character** downloads the same format. **Import character** validates the whole file before asking the player to replace their draft.
6. Planned GM mode maps answers to scapegoat/stake wiring, Verathe framing, deity levers, and the Marius/mask beat.

Player export must never include GM-only spoilers. GM brief may reference campaign wiring that the player UI never shows.

The combat advisory appears once all boosts are assigned. It looks for Strength or Dexterity at +3 or higher, a second physical modifier at +2 or higher, and at least a two-point gap between the higher attack attribute and every mental attribute. The advisory uses current modifiers and leaves all choices and actions available.

The skill planner records level-1 training entered by the player and uses the standard class increase schedule, with the faster schedule for Rogues and Investigators. A full increase to Intelligence adds an untrained skill to train at that milestone. Base modifiers cover attributes and proficiency. Class features, skill feats, items, and situational bonuses are handled at the table. Share links and the printable attribute ledger continue to carry attribute data. [Player Core advancement rules](https://www.dualshadestudios.com/Backblaze/DSBackBlaze/Misc%20Backups/RPG%20Book%20Backups/Pathfinder%202e%20Books/Pathfinder%202e%20Player%20Core%201.pdf#page=30), [Player Core 2 Investigator progression](https://www.dualshadestudios.com/Backblaze/DSBackBlaze/Misc%20Backups/RPG%20Book%20Backups/Pathfinder%202e%20Books/Pathfinder%202e%20Player%20Core%202.pdf)

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
