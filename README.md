# Masque Character Creator

A Pathfinder 2e Remaster character creator for **The Masque of Shattered Mirrors**—built for one player and one GM who will tailor the night around that character.

This is not a general PF2e sheet builder. It walks the player through a **session-zero brief**, a **mechanical build**, and a **campaign-fit check**, then hands the GM a spoiler-safe summary they can wire into House Verathe.

Attribute boost math is meant to reuse the logic already proven in [`pf2e-point-buy-calc`](https://github.com/starbornone/pf2e-point-buy-calc) (`normalizeBuild`, `ancestryRule`, `calculate`, share/backup serialization).

## What it does

- **Session zero (player-safe)** — Why they accepted the invitation; who they would risk the night for; their art or craft; optional faith (Pharasma, Nocticula, or the Black Butterfly); the beautiful lie their mask tells.
- **Build** — Ancestry, background, class, level, attribute boosts/flaws, with the same Remaster ledger model as the point-buy calculator.
- **Campaign fit** — Soft guidance toward Will, Perception, social skills, Stealth/Thievery, and investigation over pure damage. Flags builds that lean hard into combat-as-default.
- **GM handoff** — Export a short tailoring brief (stake, art, faith, mask) without leaking ritual secrets. Optional player export of the attribute ledger / share link.

## What it does not do (yet)

- Full feat/spell/equipment catalogs
- Foundry/Pathbuilder import-export
- Multi-PC party balancing
- Spoiling the ritual, scapegoat identity, or deity climax levers to the player

## Modes

| Mode | Audience | Content |
|------|----------|---------|
| Player | The one PC | Invitation framing, questions, build UI, soft “this night rewards…” tips |
| GM | You | Same build, plus how answers map to scapegoat/stake wiring and deity hooks |

## Tech intent

- Local-first static web app (Vite + TypeScript), same family as `pf2e-point-buy-calc`
- Port or extract the attribute engine (`build.ts` / `options.ts`) rather than reimplementing boosts
- Player Core / Player Core 2 catalogs first; custom rows for anything else
- Shareable build URL + JSON backup for the mechanical side; Markdown or JSON for the session-zero answers

## Campaign context (GM only)

The adventure is a social-horror masquerade. Combat is a failure state. Guests are roles in **The Rite of the Broken Mirror**. Someone the PC cares about—or the PC—is this generation’s scapegoat. The creator’s job is to produce a character who can *look, talk, and choose* under pressure, and to surface the backstory levers you need to personalize Cassia, the white dress, and the three deities.

Campaign notes live one level up in this folder tree.

## Run (once scaffolded)

```sh
npm ci
npm run dev
```

Exact port and deploy target TBD in implementation; prefer the same Node engines as the point-buy calculator (22.18+ or 24+).

## Documentation

- [docs/overview.md](docs/overview.md) — product overview for humans and agents
- [AGENTS.md](AGENTS.md) — working agreements and roadmap rules for coding agents
- [roadmap/roadmap.json](roadmap/roadmap.json) — machine-readable todo list (highest priority first)

## Rules sources

- [Player Core character creation](https://2e.aonprd.com/Rules.aspx?ID=2027)
- [Player Core options](https://2e.aonprd.com/Sources.aspx?ID=216)
- [Player Core 2 options](https://2e.aonprd.com/Sources.aspx?ID=227)

Pathfinder is a trademark of Paizo Inc. This is an unofficial fan tool for a private campaign.
