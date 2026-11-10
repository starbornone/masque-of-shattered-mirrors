# Roadmap format contract

Schema id: **`name-roadmap/v1`**

Other repositories (and humans) can import or mirror this contract. Agent rules live in [AGENTS.md](../AGENTS.md). This repo’s live files are under [`roadmap/`](../roadmap/).

## Files

| File | `file` field | Purpose |
|------|--------------|---------|
| `roadmap/roadmap.json` | `"roadmap"` | Project status + items still to do, **highest priority first** |
| `roadmap/completed.json` | `"completed"` | Finished items |
| `roadmap/cancelled.json` | `"cancelled"` | Items that will not be done |

Each item lives in **exactly one** file.

## Schema shape

```json
{
  "schema": "name-roadmap/v1",
  "file": "roadmap",
  "updatedAt": "2026-10-14T09:30:00+11:00",
  "project": {
    "key": "masque-of-shattered-mirrors",
    "title": "Masque Character Creator",
    "status": "active",
    "summary": "Optional, roadmap.json only."
  },
  "items": [
    {
      "id": "stable-kebab-id",
      "title": "Short imperative title",
      "group": "Optional area",
      "notes": "Optional detail"
    }
  ]
}
```

### Field rules

1. `schema` is always `"name-roadmap/v1"`. `file` matches the filename: `"roadmap"`, `"completed"`, or `"cancelled"`.
2. `project.key`, `project.title`, and `project.status` are **identical** in all three files. Never change `project.key`. `status` is `active`, `paused`, or `complete`. `summary` appears **only** in `roadmap.json`.
3. Every item has an `id`: lowercase kebab-case, unique across all three files, **never renamed and never reused** after completion or cancellation. Titles and notes may be edited; the id stays.
4. Allowed item fields: `id`, `title`, `group`, `notes`, plus:
   - `completedAt` — required on items in `completed.json`
   - `cancelledAt` — required on items in `cancelled.json`
   - `reason` — optional on cancelled items
   - Add no other fields.
5. Titles ≤ 500 characters; notes and reasons ≤ 20,000; ≤ 2,000 items per file.
6. `updatedAt` is ISO 8601 with a UTC offset (e.g. `2026-10-14T09:30:00+11:00`). Set it on every file you change.
7. Output valid JSON only: UTF-8, two-space indent, no comments, no trailing commas. A missing file should be created with `"items": []`.

## Move semantics

| Event | Action |
|-------|--------|
| Work finished | Move item from `roadmap.json` to the **end** of `completed.json`; add `completedAt`. Same `id`. |
| Work dropped | Move item to the **end** of `cancelled.json`; add `cancelledAt` and a short `reason`. |
| Cancelled item revived | Move back to `roadmap.json` with the **same** `id`; remove `cancelledAt` / `reason`. |
| Delete | **Never** delete an item outright. |
| Scope split | New work → **new** ids. Do not change what an existing id means. |

Update the roadmap in the **same change** as the work it describes. Mark completed only when the work is actually done.

## Id permanence

- Ids are stable forever across todo ↔ completed ↔ cancelled.
- Do not recycle ids for different work.
- Prefer sharp items (imperative titles) over vague epics.

## Minimal valid examples

### `roadmap/roadmap.json`

```json
{
  "schema": "name-roadmap/v1",
  "file": "roadmap",
  "updatedAt": "2026-11-10T13:27:30+11:00",
  "project": {
    "key": "masque-of-shattered-mirrors",
    "title": "Masque Character Creator",
    "status": "active",
    "summary": "PF2e Remaster session-zero and character creator for The Masque of Shattered Mirrors."
  },
  "items": [
    {
      "id": "scaffold-vite-typescript-app",
      "title": "Scaffold Vite + TypeScript app",
      "group": "Phase 0",
      "notes": "Local-first static app; Node 22.18+ or 24+."
    }
  ]
}
```

### `roadmap/completed.json`

```json
{
  "schema": "name-roadmap/v1",
  "file": "completed",
  "updatedAt": "2026-11-10T13:27:30+11:00",
  "project": {
    "key": "masque-of-shattered-mirrors",
    "title": "Masque Character Creator",
    "status": "active"
  },
  "items": [
    {
      "id": "define-product-brief",
      "title": "Write product README and scope",
      "group": "Docs",
      "notes": "Session zero, build, campaign fit, GM handoff.",
      "completedAt": "2026-11-10T13:27:30+11:00"
    }
  ]
}
```

### `roadmap/cancelled.json`

```json
{
  "schema": "name-roadmap/v1",
  "file": "cancelled",
  "updatedAt": "2026-11-10T13:27:30+11:00",
  "project": {
    "key": "masque-of-shattered-mirrors",
    "title": "Masque Character Creator",
    "status": "active"
  },
  "items": [
    {
      "id": "in-app-campaign-markdown-reader",
      "title": "Load campaign markdown inside the app",
      "group": "Non-goals",
      "notes": "Would couple the creator to vault spoilers.",
      "cancelledAt": "2026-11-10T13:27:30+11:00",
      "reason": "Campaign notes stay in the vault; app stays a creator."
    }
  ]
}
```

## This project’s identity

| Field | Value |
|-------|--------|
| `project.key` | `masque-of-shattered-mirrors` |
| `project.title` | `Masque Character Creator` |
| `project.status` | `active` |

## Related

- Live todo list: [roadmap/roadmap.json](../roadmap/roadmap.json)
- [AGENTS.md](../AGENTS.md)
- [Contributing](contributing.md)
