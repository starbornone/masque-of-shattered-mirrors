# Masque Character Creator

A Pathfinder 2e Remaster character creator for **The Masque of Shattered Mirrors**—built for one player and one GM who will tailor the night around that character.

This is not a general PF2e sheet builder. It walks the player through a **session-zero brief**, a **mechanical build**, and a **campaign-fit check**, then hands the GM a spoiler-safe summary they can wire into House Verathe.

The guide starts with the invitation and character concept, then walks through ancestry, background, class, and attribute boosts. It assumes tabletop roleplaying experience and explains Pathfinder 2e Remaster rules as they come up. The build uses the boost logic from [`pf2e-point-buy-calc`](https://github.com/starbornone/pf2e-point-buy-calc).

## What it does

- **Session zero (player-safe)** — Why they accepted the invitation; who they would risk the night for; their art or craft; optional faith (Pharasma, Nocticula, or the Black Butterfly); the beautiful lie their mask tells.
- **Build** — Ancestry, background, class, level, and attribute boosts and flaws. The guide saves the current build and step in the browser. The review offers a mechanical share link and a printable ledger.
- **Campaign fit** — Soft guidance toward Will, Perception, social skills, Stealth/Thievery, and investigation over pure damage. Flags builds that lean hard into combat-as-default.
- **GM handoff (planned)** — A short tailoring brief with campaign context behind a separate GM entry.

## What it does not do (yet)

- Full feat/spell/equipment catalogs
- Foundry/Pathbuilder import-export
- Multi-PC party balancing
- Spoiling the ritual, scapegoat identity, or deity climax levers to the player

## Modes

| Mode | Audience | Content |
|------|----------|---------|
| Player | The one PC | Saved concept answers, JSON and Markdown downloads, and a guided attribute build |
| GM (planned entry) | You | Read-only concept answers, attribute ledger, and campaign tailoring |

## Tech intent

- Local-first static web app (Vite + TypeScript), same family as `pf2e-point-buy-calc`
- Reuse the ported attribute engine (`src/attributes/build.ts` and `src/attributes/options.ts`)
- Player Core / Player Core 2 catalogs first; custom rows for anything else
- Shareable build URL and printable ledger for the mechanical side. Markdown or JSON downloads for the session-zero answers.

## Campaign context (GM only)

The adventure is a social-horror masquerade. Combat is a failure state. Guests are roles in **The Rite of the Broken Mirror**. Someone the PC cares about—or the PC—is this generation’s scapegoat. The creator’s job is to produce a character who can *look, talk, and choose* under pressure, and to surface the backstory levers you need to personalize Cassia, the white dress, and the three deities.

Campaign notes live one level up in this folder tree.

## Run

Requires Node **22.18+** or **24+**.

```sh
npm ci
npm run dev
```

Other scripts include `npm run build`, `npm run lint`, `npm test`, and `npm run preview`.

Dev server defaults to Vite’s local URL (usually `http://localhost:5173`). Deploy target TBD.

## Documentation

- [docs/overview.md](docs/overview.md) — product overview for humans and agents
- [AGENTS.md](AGENTS.md) — working agreements and roadmap rules for coding agents
- [roadmap/roadmap.json](roadmap/roadmap.json) — machine-readable todo list (highest priority first)

## Rules sources

- [Player Core character creation](https://2e.aonprd.com/Rules.aspx?ID=2027)
- [Player Core options](https://2e.aonprd.com/Sources.aspx?ID=216)
- [Player Core 2 options](https://2e.aonprd.com/Sources.aspx?ID=227)

Pathfinder is a trademark of Paizo Inc. This is an unofficial fan tool for a private campaign.
