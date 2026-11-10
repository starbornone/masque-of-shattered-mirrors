# Roadmap

Phased delivery. Ship a usable solo session-zero + attributes loop before any feat catalog work.

Machine-readable status for agents: [`roadmap/roadmap.json`](roadmap/roadmap.json) (see [`docs/roadmap-format.md`](docs/roadmap-format.md)).

## Phase 0 — Scaffold

- [ ] New Vite + TypeScript app (or monorepo sibling next to `pf2e-point-buy-calc`)
- [ ] Extract or copy attribute engine: `options`, `normalizeBuild`, `ancestryRule`, `calculate`, serialize/parse
- [ ] Shared types for `Build` + new `SessionZero` answers
- [ ] Player / GM mode toggle (hide GM panel by default)
- [ ] Smoke tests for boost math (reuse or port `test/build.test.ts`)

**Exit:** App runs locally; empty shell can load a default level-1 build.

## Phase 1 — Session zero (player-safe)

- [ ] Invitation blurb (no ritual spoilers)
- [ ] Guided questions:
  - Why accept?
  - Who matters? (named stake) *or* “I am the one they are watching”
  - Art / craft
  - Optional deity interest (Pharasma / Nocticula / Black Butterfly / none)
  - Mask concept (“most beautiful lie”)
- [ ] Persist answers in localStorage + export JSON/Markdown
- [ ] Soft table lines: etiquette over hit points; investigate before violence

**Exit:** Player can finish questions without seeing GM secrets.

## Phase 2 — Attribute creator (campaign-ready)

- [ ] Port UI patterns from the point-buy calculator (ancestry / background / class / level / milestones / voluntary flaws)
- [ ] Default level configurable (GM sets expected start level)
- [ ] Share link for mechanical build only
- [ ] Printable / copyable attribute ledger

**Exit:** Full Remaster attribute planning works inside this app.

## Phase 3 — Campaign fit

- [ ] Score or checklist against night demands:
  - Will / Wisdom pressure (shards, mirrors, entity)
  - Perception / Investigation
  - Diplomacy, Deception, Intimidation, Society
  - Stealth, Thievery
  - Athletics (climax interventions)
  - Religion (optional deity path)
  - Performance (Velys / mask competition flavor)
- [ ] Warn when Strength/attack focus is the only investment (not forbidden—flagged)
- [ ] Suggest backgrounds that rhyme with the night (Artist, Entertainer, Noble, Acolyte, Detective, Servant, Refugee, Haunted, Blessed, Charlatan, etc.) without forcing them
- [ ] Suggest classes that can carry solo social-horror (Bard, Rogue, Investigator, Oracle, Witch, Cleric, Swashbuckler, …) as *hints*, not locks

**Exit:** Player sees clear “fit” feedback; GM sees the same scores.

## Phase 4 — GM tailoring brief

- [ ] Auto-generate a one-page GM summary from answers + build:
  - Stake → scapegoat wiring options
  - Art → Verathe “honored guest” framing
  - Faith → which deity lever to seed early
  - Mask → Marius competition beat
  - Key skills → which NPCs/rooms pay off
- [ ] Keep spoilers behind GM mode only
- [ ] Copy-to-clipboard for session notes

**Exit:** You can run session zero and leave with a personalization plan.

## Phase 5 — Skills & proficiency sketch

- [ ] Level-appropriate skill increase planner ( Remaster proficiency ranks )
- [ ] Map skill choices to campaign-fit checklist
- [ ] Optional starting language / lore notes (Osiriani flavor for the Descent archway is GM-side only)

**Exit:** Skills planned enough to play the night without a full digital sheet.

## Phase 6 — Polish & share

- [ ] Single export package: session-zero + attributes + skills + GM brief
- [ ] Import previous export
- [ ] Tone/CSS: masquerade-adjacent, readable, not a combat dashboard
- [ ] README “Run locally” filled with real commands/ports
- [ ] Optional static deploy (same pattern as `pf.starmist.studio` if desired)

**Exit:** Ready to hand a link to the player.

## Later (explicitly out of early scope)

- Feat and spell pickers
- Ancestry feat / heritage detail beyond boosts
- Equipment and bulk
- Foundry VTT / Pathbuilder JSON
- Multi-character parties
- In-app reading of campaign markdown (keep notes in the vault; app stays a creator)

## Open decisions

1. **Repo home** — New repo under Starmist, vs sibling package that depends on extracted `pf2e-point-buy` core.
2. **Start level** — Confirm with the player before locking Phase 2 defaults.
3. **How hard to push recommendations** — Soft tips vs gated “recommended for this table” filters.
4. **City/region** — Still a campaign placeholder; app should leave it blank or GM-configurable, not invent one.
