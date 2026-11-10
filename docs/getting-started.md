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

From the repository root, install the locked dependencies and start Vite.

```sh
npm ci
npm run dev
```

The development server defaults to `http://localhost:5173`. Run `npm run build` before `npm run preview` to serve the compiled app at `http://localhost:4173`. Use the URL printed in the terminal if Vite picks another port, and press **Ctrl+C** to stop either server.

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run lint` | `oxlint` |
| `npm test` | Attribute, skill planner, and draft storage and export tests |
| `npm run preview` | Serve the existing build in `dist/` locally |

### Verify success

1. Dev server starts without module-resolution errors.
2. The shell shows **Masque Character Creator** and the player’s guide.
3. **Accept the invitation** starts the guided questions. The review lets you edit any answer.
4. Skip any concept question and reload to restore the draft and your place. Download JSON or Markdown from the review.
5. **Continue to character build** opens the ancestry, background, class, and boost steps. The review shows the current ledger, including any boosts still to assign.
6. Reload to restore the build and its current step.
7. Use **Share build** in the review to copy a mechanical link. Opening it shows a preview. Choose **Use shared build** to replace the saved build in that browser.
8. Use **Print attribute ledger** in the review or preview to print or save a PDF from your browser.
9. Check **Campaign fit** beneath the ledger. If you change a boost, the corresponding modifier changes in the checklist.
10. Once all boosts are assigned, select **Plan skill proficiencies**. Enter level-1 training and assign later increases. Return to the review to see those ranks and base modifiers under **Campaign fit**.
11. Use **Export character** below the guide to save one JSON file at any stage. To resume from a file, choose **Import character**, select the file, and choose **Restore character** to replace the browser’s draft and return to the saved step.

The optional faith step describes each deity before you choose. The background and class steps offer expandable **Campaign-fit suggestions** with boost and proficiency notes. [Paizo’s Divine Mysteries deity tables](https://downloads.paizo.com/PZO13003_SupplementalGodTable.pdf)

### First useful action

Run `npm test` to check the attribute engine before changing the build flow. See [roadmap/roadmap.json](../roadmap/roadmap.json) for the next items.

## Failure symptoms

| Symptom | Likely cause |
|---------|----------------|
| `npm ci` engine warning / Vite fails | Node below 22.18 |
| `npm ci` reports `EPERM` on a native dependency on Windows | A running server may have the file open. Stop the project’s Vite servers and retry. |
| `@/` imports fail in the editor | `paths` missing from `tsconfig.app.json` / Vite alias |
| Boost totals disagree with Remaster expectations | Check build normalization and run the boost smoke tests |
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
