# Contributing

This is a private-campaign fan tool. Contributions should keep the product narrow: one PC, one GM, session-zero + Remaster attributes + campaign fit + GM handoff.

## Propose changes

1. Read [overview.md](overview.md) and [ROADMAP.md](../ROADMAP.md) so the change fits an existing phase.
2. Prefer small diffs that finish one roadmap item (or a clear slice of one).
3. Keep player-safe boundaries: do not expose ritual secrets, scapegoat identity, or deity climax levers in Player mode.
4. Reuse `pf2e-point-buy-calc` attribute logic rather than inventing a second Remaster ledger.

## Documentation expectations

| Change type | Update |
|-------------|--------|
| User-visible behavior | [README.md](../README.md) and the matching `docs/` page |
| Architecture / module boundaries | [architecture.md](architecture.md), [decisions.md](decisions.md) if a choice is new |
| Run / test / Node engines | [getting-started.md](getting-started.md), [development.md](development.md), [AGENTS.md](../AGENTS.md) |
| Scope completed or dropped | `roadmap/*.json` (see below) |

Keep the README as the human entry point; keep `docs/` specific and cross-linked.

## Roadmap moves with the work

Roadmap items live in three files under [`roadmap/`](../roadmap/):

- `roadmap.json` — still to do (priority order)
- `completed.json` — finished (`completedAt` required)
- `cancelled.json` — will not be done (`cancelledAt` + optional `reason`)

Rules that matter day to day:

- Finish work → **move** the item to `completed.json` (same `id`); do not delete it.
- Drop work → **move** to `cancelled.json` with a short `reason`.
- Never rename or reuse an `id`.
- Set `updatedAt` on every file you touch.
- Mark completed only when the work is actually done.

Full contract: [roadmap-format.md](roadmap-format.md). Agent rules: [AGENTS.md](../AGENTS.md).

## Open decisions (do not silently lock)

From [ROADMAP.md](../ROADMAP.md):

1. Repo home — Starmist repo vs sibling package depending on extracted point-buy core.
2. Start level — confirm with the player before locking Phase 2 defaults.
3. How hard to push recommendations — soft tips vs gated filters.
4. City/region — leave blank or GM-configurable; do not invent one.

Record a choice in [decisions.md](decisions.md) when it is made.

## Related

- [Development](development.md)
- [Decisions](decisions.md)
