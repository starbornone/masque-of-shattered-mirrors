# Getting started

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| Node.js | **22.18+** or **24+** (`engines` in `package.json`) |
| npm | Used for `npm ci` / `npm run dev` |
| Git | Clone this repo |
| Optional | Familiarity with PF2e Remaster character creation (Player Core) |

### Missing prerequisites

- **Node too old** — install fails or Vite refuses to start. Upgrade to 22.18+ or 24+.
- **npm missing** — install Node with npm, or use a version manager that provides both.

## Install and run

```sh
npm ci
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run lint` | `oxlint` |
| `npm run preview` | Serve the production build |

### Verify success

1. Dev server starts without module-resolution errors.
2. The shell shows **Masque Character Creator** with a Player badge.
3. `npm run build` completes cleanly.

Default level-1 build loading and the Player/GM mode toggle are still Phase 0 follow-ups (attribute engine + mode gate).

### First useful action

Confirm the app shell loads, then continue Phase 0: port the attribute engine from `pf2e-point-buy-calc` and wire shared `Build` / `SessionZero` types. See [roadmap/roadmap.json](../roadmap/roadmap.json).

## Failure symptoms

| Symptom | Likely cause |
|---------|----------------|
| `npm ci` engine warning / Vite fails | Node below 22.18 |
| `@/` imports fail in the editor | `paths` missing from `tsconfig.app.json` / Vite alias |
| Boost totals disagree with Remaster expectations | Engine not ported cleanly (not scaffolded yet) |
| Player sees scapegoat / ritual / climax levers | GM content leaked — check mode gating when it lands |

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
