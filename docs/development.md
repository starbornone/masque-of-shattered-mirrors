# Development

Guidance for humans and coding agents working in this repository.

## Repo layout

```
masque-of-shattered-mirrors/
├── README.md
├── ROADMAP.md
├── AGENTS.md
├── package.json
├── vite.config.ts
├── components.json          # shadcn/ui config (radix-nova)
├── src/
│   ├── main.tsx
│   ├── App.tsx              # App shell (player-safe default)
│   ├── index.css            # Tailwind v4 + shadcn tokens
│   ├── attributes/          # Ported point-buy rules and serialization
│   ├── components/ui/       # shadcn primitives
│   └── lib/utils.ts
├── test/
├── docs/
└── roadmap/
```

## Local workflow

```sh
npm ci
npm run dev
```

| Expectation | Detail |
|-------------|--------|
| Node 22.18+ or 24+ | Matches `package.json` engines |
| Lint | `npm run lint` → `oxlint` |
| Build | `npm run build` → `tsc -b && vite build` |
| UI kit | shadcn/ui (Radix Nova) — add with `npx shadcn@latest add <name>` |
| Tests | `npm test` checks [boost math](../test/build.test.ts) and [session-zero storage and exports](../test/session-zero.test.ts) |

Path alias: `@/*` → `./src/*` (TypeScript + Vite).

## Safe navigation for agents

1. Treat [README.md](../README.md) and [ROADMAP.md](../ROADMAP.md) as product authority for scope.
2. Keep player-facing UI free of ritual spoilers; GM wiring belongs behind the GM mode gate.
3. Prefer extracting/porting the attribute engine over rewriting boost math.
4. Catalog priority: Player Core and Player Core 2 first; custom rows for anything else.
5. Move roadmap items in `roadmap/*.json` in the same change as the work they describe. See [roadmap-format.md](roadmap-format.md).
6. Prefer existing shadcn primitives under `src/components/ui/` before inventing new UI chrome.

## Where new code should land

| Concern | Module |
|---------|--------|
| Boost math, serialize/parse | [Attribute engine](../src/attributes/build.ts) from the point-buy calculator |
| Invitation + questions | [Session-zero guide](../src/components/SessionZeroGuide.tsx) |
| Ancestry, background, class, and boosts | [Build guide](../src/components/BuildGuide.tsx) |
| Fit tips / combat flags | CampaignFit |
| Spoiler summaries | Protected `gm/` workspace and brief generator |
| Shared chrome / controls | `src/components/ui/` via shadcn |

Details: [architecture.md](architecture.md).

## Ancestry rules catalog

See [ancestry option design and refresh instructions](ancestry-options.md). The importer reads a local upstream checkout and includes only the two Remaster Player Core books. Keep the rules attribution with the generated data and verify player and GM file round trips.

## Unsupported platforms

- No native mobile app — local-first **static web** only.
- The `/gm/` route uses server-side password protection. No database or multi-tenant hosting is in scope.
- Campaign markdown is **not** loaded in-app; keep notes in the vault one level up.

## Related

- [Contributing](contributing.md)
- [Getting started](getting-started.md)
- [AGENTS.md](../AGENTS.md)
