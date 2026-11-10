# Overview

**Masque Character Creator** is a Pathfinder 2e Remaster character creator for *The Masque of Shattered Mirrors*. It is built for **one player and one GM** who will tailor the night around that character.

This is not a general PF2e sheet builder. It walks the player through a **session-zero brief**, a **mechanical build**, and a **campaign-fit check**, then hands the GM a spoiler-safe summary they can wire into House Verathe.

## Who it is for

| Audience | What they get |
|----------|----------------|
| The one PC | Invitation framing, guided questions, build UI, soft “this night rewards…” tips |
| The GM | Same build, plus how answers map to scapegoat/stake wiring and deity hooks |

## Core capabilities

- **Session zero (player-safe)** — Why they accepted the invitation; who they would risk the night for; their art or craft; optional faith (Pharasma, Nocticula, or the Black Butterfly); the beautiful lie their mask tells.
- **Build** — Ancestry, heritage, ancestry feats, background, class, level, attribute boosts/flaws, using the same Remaster ledger model as [`pf2e-point-buy-calc`](https://github.com/starbornone/pf2e-point-buy-calc).
- **Campaign fit** — A checklist showing how the build’s attribute modifiers contribute to Will, Perception, social skills, investigation, and other relevant checks.
- **GM handoff** — Export a short tailoring brief (stake, art, faith, mask) without leaking ritual secrets. Optional player export of the attribute ledger / share link.

## Planned extensions

The roadmap now includes class, general, and skill feat choices; spells; equipment and bulk; player-only Foundry and Pathbuilder exports; and multiple named local drafts. Heritage and ancestry feat choices are the first addition. See [the roadmap](../ROADMAP.md).

## Non-goals

- Multi-PC party balancing
- Spoiling the ritual, scapegoat identity, or deity climax levers to the player
- In-app reading of campaign markdown (notes stay in the vault; the app stays a creator)

## Campaign context (GM only)

The adventure is a social-horror masquerade. Combat is a failure state. Guests are roles in **The Rite of the Broken Mirror**. Someone the PC cares about—or the PC—is this generation’s scapegoat. The creator’s job is to produce a character who can *look, talk, and choose* under pressure, and to surface the backstory levers needed to personalize Cassia, the white dress, and the three deities.

Campaign notes live one level up in this folder tree, outside the app.

## Tech direction

- Local-first static web app (Vite + TypeScript), same family as `pf2e-point-buy-calc`
- Reuse the ported attribute engine for boost calculations and versioned build data
- Player Core / Player Core 2 catalogs first; custom rows for anything else
- Shareable build URL + JSON backup for the mechanical side; Markdown or JSON for session-zero answers

The player can resume the guide in the same browser, download concept answers, and review campaign fit before sharing or printing a mechanical build. The protected `/gm/` workspace reviews character files and saves edited tailoring notes in a separate GM package.

## Next reads

- [Getting started](getting-started.md) — prerequisites and first run (once scaffolded)
- [Architecture](architecture.md) — components and control flow
- [Development](development.md) — local workflow for agents and contributors
- [Decisions](decisions.md) — key design choices
- [Roadmap format](roadmap-format.md) — import contract for `roadmap/*.json`
- Human product brief: [README.md](../README.md)
- Phased delivery notes: [ROADMAP.md](../ROADMAP.md)
