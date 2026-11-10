# Getting started

**Current state:** The app is not scaffolded yet. This page documents the intended first-run path from the README. Until Phase 0 completes, you can only read the product brief and roadmap.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| Node.js | Prefer the same engines as `pf2e-point-buy-calc`: **22.18+** or **24+** |
| npm | Used for `npm ci` / `npm run dev` |
| Git | Clone this repo |
| Optional | Familiarity with PF2e Remaster character creation (Player Core) |

### Missing prerequisites

- **Node too old** — install fails or Vite refuses to start. Upgrade to 22.18+ or 24+.
- **npm missing** — install Node with npm, or use a version manager that provides both.
- **No package.json yet** — expected today. Scaffolding is the first roadmap item; do not invent a different stack.

## Install and run (once scaffolded)

```sh
npm ci
npm run dev
```

Exact port and deploy target are TBD in implementation. Prefer matching the point-buy calculator’s Node engines.

### Verify success

When scaffolding is done, you should see:

1. Dev server starts without module-resolution errors for the attribute engine.
2. Empty shell loads a **default level-1 build** (Phase 0 exit criteria).
3. Mode toggle exists; GM panel is **hidden by default**.

### First useful action

1. Switch to **Player** mode (default).
2. Complete the session-zero questions without seeing ritual spoilers.
3. Set ancestry / background / class / level and confirm attribute boosts calculate.
4. Export the player-safe brief; optionally flip to **GM** mode and copy the tailoring summary.

## Failure symptoms (implied)

| Symptom | Likely cause |
|---------|----------------|
| `npm ci` fails with “no package.json” / lockfile missing | App not scaffolded — work Phase 0 first |
| Boost totals disagree with Remaster expectations | Engine not ported cleanly from `pf2e-point-buy-calc` |
| Player sees scapegoat / ritual / climax levers | GM content leaked — check mode gating |
| Share link restores wrong boosts | Serialize/parse drift vs the calculator |

## Rules sources

- [Player Core character creation](https://2e.aonprd.com/Rules.aspx?ID=2027)
- [Player Core options](https://2e.aonprd.com/Sources.aspx?ID=216)
- [Player Core 2 options](https://2e.aonprd.com/Sources.aspx?ID=227)

Pathfinder is a trademark of Paizo Inc. This is an unofficial fan tool for a private campaign.

## Related

- [Overview](overview.md)
- [Architecture](architecture.md)
- [Development](development.md)
- [README.md](../README.md)
