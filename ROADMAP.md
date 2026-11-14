# Roadmap

The current priorities cover build review, GM handoff, and quick reference at the table. The original delivery phases are recorded below.

Machine-readable status for agents: [`roadmap/roadmap.json`](roadmap/roadmap.json) (see [`docs/roadmap-format.md`](docs/roadmap-format.md)).

## Current priorities

### Phase 1 — MVP/Now

- [x] Protect unsaved GM notes when replacing a character, regenerating the brief, or leaving the page.
- [x] Put actionable next steps at the top of build review and return there after edits.
- [x] Enlarge touch targets and check contrast in phone and portrait tablet layouts.
- [x] Offer optional skill planning immediately after boosts, with a return path to relevant feat choices.
- [x] Clarify GM handoff, draft backups, and attribute sharing. Preview the effects of applying a shared build.
- [x] Profile draft saves and switching with phone emulation and improve save status and recovery.

### Phase 2 — Next

- [x] Add a read-only Table View for quick access to checks, training, and relevant gear or spells.
- [x] Generate a one-page print or PDF table card from Table View.
- [ ] Let the GM review revised character files and keep their edited notes.
- [ ] Make Table View reopen after a refresh in airplane mode.
- [ ] Verify a live Foundry actor import and surface the remaining setup before download.

### Phase 3 — Later

- [ ] Prototype a player-approved prompt card based on the mask's lie.
- [ ] Revisit Pathbuilder export when it supports importing third-party character builds. [Transfer findings](docs/pathbuilder-transfer.md)

## Original delivery phases

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
- [x] Explain ancestry, background, and class options with searchable summaries and direct rules links.
- [x] Port UI patterns from the point-buy calculator (ancestry / background / class / level / milestones / voluntary flaws)
- [x] Let the maintainer configure the starting level for new character drafts
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
- [x] Add a password-protected `/gm/` entry outside the player interface
- [x] Support the same password check in local dev and preview, with documented GM setup
- [x] Collapse imported character file controls to leave more room for GM notes
- [x] Auto-generate a GM tailoring brief from answers + build:
  - Stake → scapegoat wiring options
  - Art → Verathe “honored guest” framing
  - Faith → which deity lever to seed early
  - Mask → Marius competition beat
  - Key skills → which NPCs/rooms pay off
- [x] Keep tailoring suggestions in the protected GM build
- [x] Copy-to-clipboard for session notes

**Exit:** You can run session zero and leave with a personalization plan.

## Phase 5 — Skills & proficiency sketch

- [x] Plan skill training and level-appropriate increases once the attribute ledger is complete
- [x] Map planned skill ranks and base modifiers to the campaign-fit checklist
- [x] Track optional named Lore skills
- [x] Add optional starting language notes and general Remaster guidance to the build review

**Exit:** Skills planned enough to play the night without a full digital sheet.

## Phase 6 — Polish & share

- [x] Export and restore one player character file with session-zero answers, attributes, and skills
- [x] Export and restore a separate GM package containing the character and edited session notes behind the protected GM route
- [x] Polish the player guide with silver-blue progress, a framed invitation, and layouts for narrow screens
- [x] Document local installation, development, checks, and production preview in the README
- [x] Build the static site on Vercel when changes are pushed to `main`

**Exit:** Ready to hand a link to the player.

## Phase 7 — Extend character creation

- [x] Add heritage and ancestry feat choices with beginner guidance, rules references, and saved selections
- [x] Add class, general, and skill feat pickers, including bonus choices granted by other options
- [x] Add spell and cantrip selection with class slots, searchable rules, and saved grants
- [x] Add starting equipment choices, configurable wealth, costs, and Bulk

**Exit:** The player can record the remaining character creation choices with brief mechanical guidance.

## Phase 8 — Character management and integrations

- [x] Export player characters as native PF2e actors for Foundry VTT
- [x] Support multiple named local character drafts

**Exit:** Characters remain easy to manage and transfer, with GM preparation kept separate.

## Outside scope

- Multi-PC party balancing
- In-app reading of campaign markdown (cancelled; keep campaign notes in the vault)

## Open decisions

1. **Repo home** — New repo under Starmist, vs sibling package that depends on extracted `pf2e-point-buy` core.
2. **Start level** — Confirm with the player before locking Phase 2 defaults.
3. **How hard to push recommendations** — Soft tips vs gated “recommended for this table” filters.
4. **City/region** — Still a campaign placeholder; app should leave it blank or GM-configurable, not invent one.
