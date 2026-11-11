# Decisions

Lightweight records inferred from [README.md](../README.md) and [ROADMAP.md](../ROADMAP.md). Add new entries when open decisions close.

---

## ADR-001 — Campaign-specific creator, not a general sheet builder

**Context:** A full PF2e digital sheet (feats, spells, equipment, Foundry/Pathbuilder) is a large product. This table needs one tailored PC for a social-horror masquerade night.

**Decision:** Scope the app to session-zero brief → Remaster attribute build → campaign-fit feedback → GM tailoring handoff for *The Masque of Shattered Mirrors* only.

**Consequences:** Feat/spell/equipment catalogs, party tools, and VTT import stay out of early (and likely long-term) scope. Copy and fit tips can speak directly to House Verathe and the night’s pressures.

---

## ADR-002 — Reuse `pf2e-point-buy-calc` attribute engine

**Context:** Remaster boost/flaw ledger math is easy to get wrong and already proven in [`pf2e-point-buy-calc`](https://github.com/starbornone/pf2e-point-buy-calc).

**Decision:** Port or extract `normalizeBuild`, `ancestryRule`, `calculate`, and share/backup serialization instead of reimplementing boosts.

**Consequences:** Scaffolding must include a clean copy/extract path and smoke tests (port `test/build.test.ts`). UI may differ; ledger semantics should stay aligned with the calculator.

---

## ADR-003 — Player / GM mode with spoilers gated

**Context:** The same character data serves the player and the GM, but ritual, scapegoat, and deity climax levers must not leak to the player.

**Decision.** The public app opens the player guide. The GM opens `/gm/` directly and signs in with HTTP Basic authentication enforced by a Vercel Function. The workspace reads character exports in the browser.

**Consequences.** The player and GM builds have separate outputs. The Function checks credentials for the GM page and its assets, and it disables caching of those responses. Keep campaign-only data in private sources. Every new campaign-facing string needs an audience check.

---

## ADR-004 — Local-first Vite + TypeScript static app

**Context:** The sibling calculator is a local-first static web app; this tool should be handable as a link without a backend.

**Decision:** Vite + TypeScript static app; persistence via localStorage, share URLs, and file export (JSON / Markdown). Node engines match the calculator (22.18+ or 24+).

**Consequences:** The app stores drafts in the browser and builds on Vercel from pushes to `main`.

---

## ADR-005 — Soft campaign fit, not hard locks

**Context:** The night rewards Will, Perception, social skills, Stealth/Thievery, and investigation. Hard-gating classes/backgrounds would fight player agency.

**Decision:** Soft tips, checklists, and warnings (e.g. combat-as-default flags). Suggest backgrounds/classes that rhyme with the night as hints, not locks. Combat investment is allowed but flagged.

**Consequences:** Recommendation strength remains an open product dial (tips vs gated filters). Fit UI must stay advisory in copy.

---

## ADR-006 — Campaign notes stay outside the app

**Context:** Full campaign markdown lives in the vault one level up; loading it in-app risks spoilers and couples the creator to adventure text.

**Decision:** Do not ship in-app reading of campaign markdown. The app stays a character creator; GM uses vault notes separately.

**Consequences:** Cancelled as a feature direction. City/region stays blank or GM-configurable—never invented by the app.

---

## ADR-007 — Guide players through Pathfinder 2e Remaster

**Context.** The player has tabletop roleplaying experience and is new to Pathfinder 2e Remaster.

**Decision.** Guide character creation one step at a time. Keep the concept questions direct and explain Pathfinder rules where the player makes the relevant mechanical choice.

**Consequences.** Show progress and let players revisit choices from review. Keep draft steps open when answers are missing. Require an answer only where a later feature needs it, such as finished attributes before a skill planner uses their modifiers. Track the work in [the roadmap](../ROADMAP.md).

---

## ADR-008 — Configure the default level when building the app

**Decision.** The maintainer sets `VITE_CAMPAIGN_START_LEVEL` for new builds. The app falls back to level 1 and lets the player change the level in the attribute guide.

**Consequences.** Saved drafts and shared builds retain their level. The campaign’s intended start level remains an open decision.

---

## ADR-009 — Separate GM packages preserve edited preparation

**Decision.** The protected workspace exports a versioned GM JSON package with the canonical player character and exact edited session notes. It accepts both player character exports and GM packages. Only a player character import generates a new brief; a GM package restores its saved notes, including an empty string.

**Consequences.** The public guide rejects GM packages and its exports retain the player-only format. GM package code stays in the private build. GM edits remain in tab memory until copied or exported, with no server storage or public share link.

---

## ADR-010 — Record ancestry choices separately from attribute math

**Decision.** Add a skippable heritage and ancestry feat step with the Player Core and Player Core 2 options, including versatile heritages and custom entries. Store choices and extra-choice notes in an optional field on the character draft, preserving older exports and the attribute engine’s formats.

**Consequences.** Filter suggestions by ancestry, heritage, slot level, and lineage timing. Show prerequisites and advisory review messages without blocking navigation. Preserve choices when ancestry, heritage, or level changes. The player accounts for granted training and other effects manually; this step does not claim to validate a complete character sheet. Keep campaign-specific tailoring in the protected GM build.

---

## ADR-011 — Separate regular, granted, and conditional feat slots

**Decision.** Add a skippable class, general, and skill feat step using Remaster Player Core options and class progression data. Separate fixed grants and bonus choices from regular level slots. Support explicit extra slots for subclass-dependent, conditional, and custom rules.

**Consequences.** Keep choices and notes in an optional character field, with backward-compatible player and GM exports. Preserve inactive selections after build changes. Suggestions check feat type, class, and level; other prerequisites and effects remain advisory and manual. Load rules descriptions only for selected options, and keep GM campaign content in private sources.

---

## ADR-012 — Separate spell preparations, known spells, and grants

**Decision.** Add a skippable spell step using Remaster Core rules, class-based slot profiles, separate learning and repertoire records, and explicit grants for innate, focus, conditional, and other magic. Preserve inactive selections after build changes and keep the optional plan in native character saves and GM packages.

**Consequences.** Teach ranks, traditions, preparation, repertoires, cantrips, signatures, and focus resources in brief mechanical terms. Filter ordinary choices by type, tradition, and rank; keep access and source restrictions advisory. Resource tracking, spell DCs, complete subclass automation, and spell effects remain manual. Load large rules only on demand. GM tailoring and package content stay in the protected private build.

---

## ADR-013 — Set starting wealth per character

**Decision.** Keep starting wealth optional on each character draft. The equipment planner uses common Player Core gear and editable item lines. It shows costs and compares carried Bulk with the current Strength modifier.

**Consequences.** A blank budget still allows gear planning, and zero remains a valid budget. Gear and wealth travel with character exports and GM packages. The player can adjust costs and Bulk for granted gear, containers, or other circumstances. See [equipment planning](equipment-planner.md).

---

## ADR-014 — Export a native Foundry player actor

**Decision.** Create PF2e Character JSON for Foundry’s built-in actor import. Transfer current modifiers, skill ranks, Lore, and inventory. Link remaining selections to the system compendiums so players can use Foundry’s setup workflow for grants and spells.

**Consequences.** The player file panel owns the export. An explicit mechanical mapping excludes session-zero answers and private GM data. The export targets Foundry 14 with PF2e 8.7.0. The character backup continues to carry the complete Masque draft. See [Foundry import instructions](foundry-export.md).

---

## Related

- [Architecture](architecture.md)
- [Contributing](contributing.md)
- [Overview](overview.md)
