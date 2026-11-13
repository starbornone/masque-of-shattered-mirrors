# Architecture

The public app opens the player’s character guide, saved build step, or a shared build preview. The build review and shared preview include campaign fit. The protected `/gm/` workspace reads the player’s exported character file and generates an editable tailoring brief.

## Goals that drive structure

1. **Player-safe by default** — ritual spoilers, scapegoat identity, and deity climax levers belong in private GM content.
2. **Reuse proven boost math** — attribute ledger logic comes from `pf2e-point-buy-calc`, not a second implementation.
3. **Local-first** — static Vite + TypeScript app; persistence via localStorage, share URLs, and export files.

## Major components

```
┌─────────────────────────────────────────────────────────┐
│                   Player app shell (Vite)               │
│  Public character guide                                 │
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
                 Character JSON export and import
                            ▼
               ┌────────────────────────┐
               │  Protected /gm/        │
               │  Character review      │
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
| GM workspace | [Character review](../gm/Workspace.tsx) and an [editable tailoring brief](../gm/TailoringBrief.tsx) behind the [GM Function](../api/gm.ts) |

The header and browser tab share the same [SVG emblem](../public/favicon.svg). A fractured oval mirror frames the silver masquerade mask.

The [shell backdrop](../src/assets/verathe-mirror.svg) shows a fractured mirror with a spiral of silver sparkles. The artwork sits beside the guide on wide screens and fades into the right margin on narrow screens. The concept, build, and skill screens share a heading style and dark panels. The invitation uses a paper surface with a silver ribbon and a mirror stamped into the wax seal.

## Data and control flow

1. Player answers or skips the session-zero questions. The review offers JSON and Markdown downloads of the answers.
2. Player selects ancestry, background, class, level, and boosts. The ported engine normalizes and calculates the current `Build`. The review shows unchosen options and unassigned boosts in an incomplete draft.
   A separate heritage and ancestry feat step follows ancestry. The optional `CharacterDraft.ancestryChoices` field stores one heritage, feat choices by standard slot level, and notes for each choice. The attribute `Build` and its share/print formats stay unchanged. Character saves, player JSON, and nested characters in GM packages include these selections. Older files without the field remain valid. See [ancestry option design and sources](ancestry-options.md).
   A feat step after attribute boosts records class, general, and skill feats in optional `CharacterDraft.featChoices`. Slot generation uses the selected class’s progression and separates granted feats from regular slots. The saved map keeps choices outside the current plan after class, level, or source changes. Custom and conditional grants use explicit extra slots. See [feat planning design](feat-choices.md).
   The next step stores optional `CharacterDraft.spellChoices`. It separates normal casting, learned spells, and independent grants, with stable keys preserving inactive selections. The picker and spell metadata load lazily; expanded selected rows load inert local rule descriptions. Lightweight indexes support strict saves and shared summaries. Public and private builds each split a shared rules-index chunk. See [spell planning design](spell-choices.md).
   The equipment step stores optional `CharacterDraft.equipmentPlan`, with a nullable starting wealth and saved item values. Totals use copper, light Bulk units, and the current Strength from the attribute ledger. Only the equipment step loads the starter catalog. The player build review and protected GM review share the totals and item list. See [equipment planning design](equipment-planner.md).
   The player file panel also exports a native Foundry character actor. A lazy exporter explicitly maps mechanical fields and includes a checklist with links to PF2e compendium entries. Native Masque backups and GM packages retain their own formats. See [Foundry export design](foundry-export.md).
3. A complete attribute ledger unlocks the skill planner. Players enter starting training, and the planner applies increases in level order with rank limits. The draft stores skills locally. The review includes planned skill ranks and base modifiers in campaign fit. [Paizo’s Remaster character sheet](https://downloads.paizo.com/RemasterPlayerCoreCharacterSheet.pdf)
4. A build URL contains only mechanics. Opening it previews the build, and choosing **Use shared build** replaces the attribute build and skill plan in the named active draft. The printable ledger uses the same calculation as the live view.
5. The [player draft library](../src/character/library.ts) stores a list of named characters and the active draft ID in localStorage. Without a library, the existing single-character save or older separate saves open as **Character 1**. The first successful write creates the library and keeps the old keys. Writes check that the stored library still matches the copy loaded by the tab. **Export character** downloads the active character in the existing file format. Imports validate the file and let the player add a named draft or replace the active one.
6. The GM workspace imports the character file into memory, displays the player’s choices, and generates a tailoring brief from curated campaign hooks. The GM can edit and copy the brief as Markdown, or export a [versioned GM package](../gm/package.ts) containing the character and current session notes. Opening a GM package restores those notes exactly without regeneration, including empty notes. Opening a player character generates a new brief. Invalid files leave the current character and edits intact. The workspace compares current notes with the loaded or last exported text. A valid replacement or regeneration needs an export or explicit discard when the notes differ. The browser leave listener is active only while edits are unsaved. The workspace remains in tab memory.

Player export must never include GM-only spoilers. GM brief may reference campaign wiring that the player UI never shows.

The GM package uses `format: "masque-gm-package"`, `version: 1`, a nested canonical player `character`, and string `sessionNotes`. Validation reuses the player character parser and rejects unsupported versions, malformed characters, missing or non-string notes, and unknown package fields. The public importer rejects the GM format. Package parsing and UI live only under `gm/` and are absent from the public build.

Vercel publishes `dist/` as the public site. Its Function builder runs the `vercel-build` script and packages `dist-gm/` with the GM Function. Both the GM page and its asset URLs rewrite to that Function, which checks the server-only `MASQUE_GM_PASSWORD` before reading files. See [Vercel routing and build configuration](../vercel.json).

For local dev and preview, [Vite middleware](../server/gm-local.ts) forwards `/gm/` and its assets to the same authentication handler. It loads the password server-side from Vite’s environment files. `npm run build:gm` uses [vite.gm.config.ts](../vite.gm.config.ts) with the repository root so Tailwind scans shared `src/` UI classes (cards, buttons) used by the private workspace; the HTML still emits to `dist-gm/index.html`. `npm run dev:gm` builds that workspace first. Direct GM source and build-file requests are denied by Vite’s filesystem rules, including `/@fs/` paths. The public build still contains only the player app. Tailwind sources are declared in [src/index.css](../src/index.css) (`src/` and `gm/` only).

The combat advisory appears once all boosts are assigned. It looks for Strength or Dexterity at +3 or higher, a second physical modifier at +2 or higher, and at least a two-point gap between the higher attack attribute and every mental attribute. The advisory uses current modifiers and leaves all choices and actions available.

The skill planner records level-1 training entered by the player and uses the standard class increase schedule, with the faster schedule for Rogues and Investigators. A full increase to Intelligence adds an untrained skill to train at that milestone. Base modifiers cover attributes and proficiency. Class features, skill feats, items, and situational bonuses are handled at the table. Share links and the printable attribute ledger continue to carry attribute data. [Player Core advancement rules](https://www.dualshadestudios.com/Backblaze/DSBackBlaze/Misc%20Backups/RPG%20Book%20Backups/Pathfinder%202e%20Books/Pathfinder%202e%20Player%20Core%201.pdf#page=30), [Player Core 2 Investigator progression](https://www.dualshadestudios.com/Backblaze/DSBackBlaze/Misc%20Backups/RPG%20Book%20Backups/Pathfinder%202e%20Books/Pathfinder%202e%20Player%20Core%202.pdf)

## Catalog boundary

- First-class options: **Player Core** and **Player Core 2**.
- Heritage and ancestry feat metadata is bundled separately from the rules descriptions. The guide loads the searchable rules picker on demand at the heritage step. GM review needs only metadata and selected notes, keeping the larger descriptions out of its bundle.
- Feat labels and progression data support saves, summaries, and GM handoff without loading the full catalog. The feat picker loads metadata on demand and fetches local rules chunks for selected options. No rules service is queried at runtime.
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
