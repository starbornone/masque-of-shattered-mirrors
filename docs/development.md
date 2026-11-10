# Development

Guidance for humans and coding agents working in this repository.

## Current repo layout

```
masque-of-shattered-mirrors/
├── README.md              # Human product entry point
├── ROADMAP.md             # Phased delivery narrative (human)
├── AGENTS.md              # Agent working agreements + roadmap rules
├── docs/                  # Agent-ready documentation
└── roadmap/               # Machine-readable roadmap (name-roadmap/v1)
    ├── roadmap.json
    ├── completed.json
    └── cancelled.json
```

**Assumption:** Application source (`src/`, `package.json`, tests) appears when Phase 0 is implemented. Do not invent folders or scripts beyond what the README states.

## Intended local workflow (post-scaffold)

```sh
npm ci
npm run dev
```

| Expectation | Source |
|-------------|--------|
| Node 22.18+ or 24+ | README tech intent / point-buy calculator parity |
| Attribute smoke tests | Port or reuse `test/build.test.ts` from `pf2e-point-buy-calc` |
| Lint / format scripts | Not specified yet — add with the Vite scaffold; do not invent CI |

There is no documented test or lint command today. When you add them, update this file, [AGENTS.md](../AGENTS.md), and the README in the same change.

## Safe navigation for agents

1. Treat [README.md](../README.md) and [ROADMAP.md](../ROADMAP.md) as product authority for scope.
2. Keep player-facing UI free of ritual spoilers; GM wiring belongs behind the GM mode gate.
3. Prefer extracting/porting the attribute engine over rewriting boost math.
4. Catalog priority: Player Core and Player Core 2 first; custom rows for anything else.
5. Move roadmap items in `roadmap/*.json` in the same change as the work they describe. See [roadmap-format.md](roadmap-format.md).

## Where new code should land (planned)

| Concern | Module (planned) |
|---------|------------------|
| Boost math, serialize/parse | Attribute engine (from point-buy calculator) |
| Invitation + questions | SessionZero |
| Fit tips / combat flags | CampaignFit |
| Spoiler summaries | GMBrief (GM mode only) |

Details: [architecture.md](architecture.md).

## Unsupported platforms

- No native mobile app — local-first **static web** only.
- No server-side auth, database, or multi-tenant hosting in scope.
- Campaign markdown is **not** loaded in-app; keep notes in the vault one level up.

## Related

- [Contributing](contributing.md)
- [Getting started](getting-started.md)
- [AGENTS.md](../AGENTS.md)
