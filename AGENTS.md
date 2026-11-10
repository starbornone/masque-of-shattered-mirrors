# AGENTS

## Project

- **Title:** Masque Character Creator
- **Key:** `masque-of-shattered-mirrors`
- **Purpose:** A Pathfinder 2e Remaster character creator for *The Masque of Shattered Mirrors*—one player and one GM. It walks through a player-safe session-zero brief, a Remaster attribute build (reusing `pf2e-point-buy-calc` ledger logic), campaign-fit guidance for a social-horror masquerade, and a spoiler-gated GM tailoring handoff for House Verathe.

## Layout

| Path | Role |
|------|------|
| [README.md](README.md) | Human product entry point |
| [ROADMAP.md](ROADMAP.md) | Phased delivery narrative |
| [AGENTS.md](AGENTS.md) | This file — agent agreements |
| [docs/](docs/) | Overview, architecture, getting started, development, contributing, decisions, roadmap format |
| [roadmap/](roadmap/) | Machine-readable todo / completed / cancelled (`name-roadmap/v1`) |
| [src/](src/) | Vite + React + TypeScript app (`App.tsx` shell, `components/ui/` shadcn) |
| [components.json](components.json) | shadcn/ui config (radix-nova) |

Planned modules (see [docs/architecture.md](docs/architecture.md)): SessionZero, Build + attribute engine, CampaignFit, GMBrief, Player/GM mode shell.

## Working agreements

- Run: `npm ci` then `npm run dev`. Also `npm run build`, `npm run lint`, `npm run preview`.
- Node **22.18+** or **24+** (`package.json` engines).
- UI: prefer shadcn primitives (`npx shadcn@latest add …`) under `src/components/ui/`.
- Port or extract attribute math (`normalizeBuild`, `ancestryRule`, `calculate`, serialize/parse); do not reimplement boosts.
- Smoke-test boost math when the engine lands (port `test/build.test.ts` if available).
- Keep Player mode free of ritual spoilers, scapegoat identity, and deity climax levers.
- Do not invent auth, databases, CI, feat catalogs, or VTT import the README does not claim.

## Documentation

- Update [docs/](docs/) when behavior, setup, or architecture changes.
- Keep [README.md](README.md) and docs consistent; README stays the human brief.
- Record locked product choices in [docs/decisions.md](docs/decisions.md).
- Format contract for roadmap import: [docs/roadmap-format.md](docs/roadmap-format.md).

## Roadmap

This project's key is `masque-of-shattered-mirrors` and its title is `Masque Character Creator`. Keep the
roadmap in three files in `roadmap/` at the repository root:

- `roadmap/roadmap.json`: project status and items still to do, highest priority first
- `roadmap/completed.json`: finished items
- `roadmap/cancelled.json`: items that will not be done

All three use this shape:

```json
{
  "schema": "name-roadmap/v1",
  "file": "roadmap",
  "updatedAt": "2026-10-14T09:30:00+11:00",
  "project": { "key": "masque-of-shattered-mirrors", "title": "Masque Character Creator", "status": "active", "summary": "Optional, roadmap.json only." },
  "items": [
    { "id": "stable-kebab-id", "title": "Short imperative title", "group": "Optional area", "notes": "Optional detail" }
  ]
}
```

Rules:

1. `schema` is always `"name-roadmap/v1"`. `file` is `"roadmap"`,
   `"completed"` or `"cancelled"` to match the filename.
2. `project.key`, `project.title` and `project.status` are identical in all
   three files. Never change `project.key`. `status` is `active`, `paused` or
   `complete`. `summary` appears only in `roadmap.json`.
3. Every item has an `id`: lowercase kebab-case, unique across all three files,
   never renamed and never reused, even after the item is completed or cancelled.
   Titles and notes may be edited freely; the id stays the same.
4. Allowed item fields are `id`, `title`, `group` and `notes`, plus
   `completedAt` (`completed.json` only, required) and `cancelledAt` with an
   optional `reason` (`cancelled.json` only). Add no other fields.
5. When work is finished, move the item from `roadmap.json` to the end of
   `completed.json` and add `completedAt`. When it is dropped, move it to the
   end of `cancelled.json` and add `cancelledAt` and a short `reason`. Never
   delete an item outright. If a cancelled item is revived, move it back to
   `roadmap.json` with the same id and remove `cancelledAt`/`reason`.
6. Each item is in exactly one file. Split work into new items with new ids
   rather than changing what an existing id means.
7. Set `updatedAt` in every file you change. Timestamps are ISO 8601 with a
   UTC offset, e.g. `2026-10-14T09:30:00+11:00`.
8. Keep `roadmap.json` items in priority order. Titles are at most 500
   characters; notes and reasons at most 20,000; at most 2,000 items per file.
9. Output valid JSON only: UTF-8, two-space indent, no comments, no trailing
   commas. Create a missing file with an empty `items` array.
10. Update the roadmap in the same change as the work it describes: mark an
    item completed only when that work is actually done.

The format contract for other repositories this repo will import is in
[docs/roadmap-format.md](docs/roadmap-format.md).

## Do / don’t

**Do**

- Prefer small diffs that finish one roadmap item (or a clear slice).
- Update `roadmap/*.json` in the same change as the work.
- Gate GM spoilers behind GM mode.
- Cross-link docs with relative paths.

**Don’t**

- Rename or reuse roadmap ids.
- Invent APIs, catalogs, auth, or deploy targets the README does not support.
- Load campaign vault markdown into the app.
- Mark roadmap items completed before the work exists.
