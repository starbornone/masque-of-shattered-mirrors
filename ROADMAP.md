# Roadmap

Phased delivery. Ship a usable solo session-zero + attributes loop before any feat catalog work.

Machine-readable status for agents: [`roadmap/roadmap.json`](roadmap/roadmap.json) (see [`docs/roadmap-format.md`](docs/roadmap-format.md)).

## Phase 0 — Scaffold

- [x] New Vite + TypeScript app with Tailwind v4 + shadcn/ui (radix-nova)
- [x] Extract or copy attribute engine: `options`, `normalizeBuild`, `ancestryRule`, `calculate`, serialize/parse
- [x] Shared types for `Build` + new `SessionZero` answers
- [x] Player / GM mode toggle (hide GM panel by default)
- [x] Smoke tests for boost math (reuse or port `test/build.test.ts`)

**Exit:** App runs locally; empty shell can load a default level-1 build.

## Phase 1 — Session zero (player-safe)

- [x] Start the step-by-step guide with the invitation and character concept for players new to Pathfinder 2e Remaster. Show progress and let players edit answers from the review.
- [x] Invitation blurb (no ritual spoilers)
- [x] Guided questions:
  - Why accept?
  - Who matters? (named stake) *or* “I am the one they are watching”
  - Art / craft
  - Optional deity interest with short descriptions of Pharasma, Nocticula, and the Black Butterfly
  - Mask concept (“most beautiful lie”)
- [x] Save answers on this browser and export JSON or Markdown

**Exit:** Player can finish questions without seeing GM secrets.

## Phase 2 — Attribute creator (campaign-ready)

- [x] Extend the guide through the mechanical build, introducing Remaster terms as players make each choice.
- [x] Port UI patterns from the point-buy calculator (ancestry / background / class / level / milestones / voluntary flaws)
- [ ] Default level configurable (GM sets expected start level)
- [x] Save the build and current step across refreshes
- [x] Share link for mechanical build only
- [x] Printable attribute ledger

**Exit:** Full Remaster attribute planning works inside this app.

## Phase 3 — Campaign fit

- [x] Show a build-based checklist for Will, Perception, social and investigative skills, Stealth, Thievery, Athletics, and optional Religion and Performance.
- [x] Show a mechanical advisory when a completed build is heavily weighted toward physical attributes.
- [x] Suggest backgrounds and classes with relevant boosts, key attributes, or starting proficiencies.

**Exit:** Player sees clear “fit” feedback; GM sees the same scores.

## Phase 4 — GM tailoring brief

- [x] Remove the mode switch from the player interface
- [ ] Choose a separate GM entry point outside the player interface
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

- [x] Plan skill training and level-appropriate increases once the attribute ledger is complete
- [x] Map planned skill ranks and base modifiers to the campaign-fit checklist
- [x] Track optional named Lore skills
- [ ] Optional starting language notes (Osiriani flavor for the Descent archway is GM-side only)

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
