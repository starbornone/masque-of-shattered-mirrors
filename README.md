# Masque Character Creator

A Pathfinder 2e Remaster character creator for **The Masque of Shattered Mirrors**—built for one player and one GM who will tailor the night around that character.

The player works through a **session-zero brief**, a **mechanical build**, and a **campaign-fit check**. The GM can open the player’s exported character for review.

The guide starts with the invitation and character concept, then walks through ancestry, heritage, ancestry feats, background, class, and attribute boosts. It assumes tabletop roleplaying experience and explains Pathfinder 2e Remaster rules as they come up. The build uses the boost logic from [`pf2e-point-buy-calc`](https://github.com/starbornone/pf2e-point-buy-calc).

## What it does

- **Session zero (player-safe)** — Why they accepted the invitation; who they would risk the night for; their art or craft; optional faith (Pharasma, Nocticula, or the Black Butterfly); the beautiful lie their mask tells.
- **Build** — Choose ancestry, background, class, level, and attribute boosts and flaws. Browse searchable summaries and rules links before choosing. The browser saves your progress, and the review offers a mechanical share link and printable ledger.
- **Heritage and ancestry feats** — Search Player Core and Player Core 2 options, read their rules, and record choices for the ancestry feat slots up to your level. Versatile heritages expand the available feats. Save extra-choice notes or use a custom entry for another source. Choices travel with character files and GM packages. Prerequisites remain advisory; granted abilities and training are recorded, not automatically applied.
- **Class, general, and skill feats** — Follow your class’s feat schedule, search Remaster options, and record extra choices. Background and class grants are listed separately, with bonus slots from common heritage and ancestry feats. Add slots for conditional or custom grants. Selections survive build changes and travel with player and GM files. [Feat guide details](docs/feat-choices.md)
- **Spells and cantrips** — Choose class- and level-appropriate spells with searchable Core rules. Keep daily preparations, repertoires, learned spells, and granted magic separate. Record signature spells, innate frequencies, and extra grants. Choices are saved and included in player and GM files. [Spell guide details](docs/spell-choices.md)
- **Starting equipment** — Browse common Player Core gear or add your own. Set starting wealth for the character when you know it, then check gear costs and carried Bulk against the current Strength modifier. Gear and wealth are saved in player and GM files. [Equipment guide details](docs/equipment-planner.md)
- **Foundry VTT export** — Download a PF2e Character actor with attributes, skills, Lore, gear, and a checklist for finishing setup in Foundry. [Import instructions](docs/foundry-export.md)
- **Skill planner** — Once attributes are complete, record starting training and plan later increases. The browser saves skill choices with the local build draft.
- **Character file** — Export or restore session-zero answers, the attribute build, planned skills, and optional starting language notes in one JSON file. This works at any stage of the guide.
- **Campaign fit** — The guide suggests backgrounds and classes with relevant boosts or training. The build review shows the modifiers that support Will, Perception, social skills, and investigation. An advisory appears when a finished build is heavily weighted toward physical attributes.
- **GM workspace** — Open a player character file at the password-protected `/gm/` route. Edit and copy the tailoring brief, or export a GM package that saves the character and edited notes together. Open that package to resume.

## What it does not do (yet)

- Pathbuilder export and multiple saved characters (planned)
- Multi-PC party balancing
- Spoiling the ritual, scapegoat identity, or deity climax levers to the player

## Modes

| Mode | Audience | Content |
|------|----------|---------|
| Player | The one PC | Guided concept, attributes, and skills with a restorable character file |
| GM | You | Character review, editable tailoring notes, and a restorable GM package |

## Tech intent

- Local-first static web app (Vite + TypeScript), same family as `pf2e-point-buy-calc`
- Reuse the ported attribute engine (`src/attributes/build.ts` and `src/attributes/options.ts`)
- Player Core / Player Core 2 catalogs first; custom rows for anything else
- Shareable build URL and printable ledger for the mechanical side. Markdown or JSON downloads for the session-zero answers.

## Campaign context (GM only)

The adventure is a social-horror masquerade. Combat is a failure state. Guests are roles in **The Rite of the Broken Mirror**. Someone the PC cares about—or the PC—is this generation’s scapegoat. The creator’s job is to produce a character who can *look, talk, and choose* under pressure, and to surface the backstory levers you need to personalize Cassia, the white dress, and the three deities.

Campaign notes live one level up in this folder tree.

## Run locally

Install Node.js **22.18+** or **24+** with npm. In a terminal at the repository root, install the locked dependencies and start the development server.

```sh
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173/). If the port is busy, use the URL Vite prints in the terminal. Press **Ctrl+C** in that terminal to stop the server.

Run the checks, build the app into `dist/`, and serve that build locally.

```sh
npm test
npm run lint
npm run build
npm run preview
```

The production preview defaults to [http://localhost:4173](http://localhost:4173/). Rebuild before previewing source changes. The development and preview ports have separate browser saves. Use **Export character** and **Import character** to move a draft between them.

### Open the GM workspace locally

Set `MASQUE_GM_PASSWORD` to your chosen local password in `.env.local` (or `.env`), then run:

```sh
npm run dev:gm
```

Open [http://localhost:5173/gm/](http://localhost:5173/gm/), using the port Vite prints. The browser asks for username **`gm`** and your configured password. Restart the server after changing the password. `.envlocal` is ignored by Git but is not a Vite environment-file name.

This command builds the private workspace before starting Vite. After editing GM components, run `npm run build:gm` and reload the page. Both `npm run dev` and `npm run preview` also handle `/gm/` once that build exists. A missing password or private build returns 503. The local server uses the same password check as Vercel and blocks direct requests for GM source and build files. [Vite server middleware](https://vite.dev/guide/api-plugin.html#configureserver), [Vite environment loading](https://vite.dev/config/#using-environment-variables-in-config)

In the workspace, open the player’s character JSON to generate a brief. Edit **Session notes (GM only)** and choose **Export GM package** to download `masque-gm-package.json`. Opening that package restores the character and your exact notes, including an empty editor. The workspace keeps edits in tab memory, so export before refreshing or opening another file. GM packages contain campaign spoilers and are rejected by the public character importer.

## Deployment and campaign settings

Vercel builds the site when changes are pushed to `main`.

To enable `/gm/`, set a long, unique `MASQUE_GM_PASSWORD` as a sensitive Production environment variable in Vercel and deploy. Open `/gm/` over HTTPS and enter `gm` as the username. The Function serves the workspace only after checking the password. [Vercel environment variables](https://vercel.com/docs/environment-variables)

Set `VITE_CAMPAIGN_START_LEVEL` to a whole number from 1 to 20 in the Vercel project's Production environment variables. The next build uses it for new drafts. An unset or invalid value starts new drafts at level 1. Players can change the level during attribute planning, and saved drafts and shared builds keep their own levels. [Vercel environment variables](https://vercel.com/docs/environment-variables)

For local development, set the same variable in `.env.local` and restart Vite. [Vite environment variables](https://vite.dev/guide/env-and-mode.html)

## Documentation

- [docs/getting-started.md](docs/getting-started.md) — local setup, troubleshooting, and a walkthrough of the player guide
- [docs/ancestry-options.md](docs/ancestry-options.md) — heritage and ancestry feat scope, data sources, and refresh instructions
- [docs/overview.md](docs/overview.md) — product overview for humans and agents
- [AGENTS.md](AGENTS.md) — working agreements and roadmap rules for coding agents
- [roadmap/roadmap.json](roadmap/roadmap.json) — machine-readable todo list (highest priority first)

## Rules sources

- [Player Core character creation](https://2e.aonprd.com/Rules.aspx?ID=2027)
- [Player Core options](https://2e.aonprd.com/Sources.aspx?ID=216)
- [Player Core 2 options](https://2e.aonprd.com/Sources.aspx?ID=227)

Pathfinder is a trademark of Paizo Inc. This is an unofficial fan tool for a private campaign.
