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
| `npm run dev:gm` | Build the private GM workspace, then start the local server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run build:gm` | Build the protected workspace into `dist-gm/` |
| `npm run lint` | `oxlint` |
| `npm test` | Attribute, skill planner, and draft storage and export tests |
| `npm run preview` | Serve the existing build in `dist/` locally |

### Verify success

1. Dev server starts without module-resolution errors.
2. The shell shows **Masque Character Creator** and the player’s guide.
3. **Accept the invitation** starts the guided questions. The review lets you edit any answer.
4. Skip any concept question and reload to restore the draft and your place. Download JSON or Markdown from the review.
5. **Continue to character build** opens the ancestry, background, class, and boost steps. Use **Browse ancestries**, **Browse backgrounds**, or **Browse classes** to search the options and read about them before selecting. Each preset links to its full rules. The build review shows the current ledger and any boosts still to assign.
6. Reload to restore the build and its current step.
   The **Choose heritage and ancestry feats** step follows ancestry. Search by name or ability, choose one heritage, and record ancestry feats at levels 1, 5, 9, 13, and 17 up to your character’s level. Each selected option shows rules, rarity, prerequisites where applicable, and space for extra choices. **Decide later** leaves the step open. If you change ancestry or heritage, prior choices stay saved with review guidance. Choices above a reduced level are retained for later. The build review and GM character review include the selections.
7. In build review, **What’s left** shows up to three next steps, with unfinished mechanics first, followed by advisory checks and optional choices. Select an action to open its editor, then use **Back to build review** to return to the same spot. When an action is resolved, focus moves to the next available action or the review heading. You can still export a partial draft.
8. Use **Share build** in the review to copy a mechanical link. Opening it shows a preview. Choose **Use shared build** to replace the attribute build and skill plan in the named active draft.
9. Use **Print attribute ledger** in the review or preview to print or save a PDF from your browser.
10. Check **Campaign fit** beneath the ledger. If you change a boost, the corresponding modifier changes in the checklist.
11. Once all boosts are assigned, select **Plan skill proficiencies**. Enter level-1 training and assign later increases. Return to the review to see those ranks and base modifiers under **Campaign fit**.
12. Open **Starting languages (optional)** in the build review to check the rules and jot down the languages you plan to take. The browser saves the notes as you type.
13. Use **Export character** below the guide to save the active draft as JSON at any stage. Choose **Import character** to open a backup as a new draft or replace the active draft.

### Named character drafts

Use **New draft** above the guide to name and start a character. Choose a name in **Active character draft** to resume that draft’s answers and guide step. **Rename** updates the name. To remove a draft, select it, choose **Delete**, and confirm the deletion.

Existing saves open as **Character 1**. Drafts are stored in the current browser. Use **Export character** to keep a portable backup of the active draft. To restore a file, select **Import as new draft** and give it a name, or choose **Replace active draft** to overwrite the draft named in the preview.

The optional faith step describes each deity before you choose. The background and class steps offer expandable **Campaign-fit suggestions** with boost and proficiency notes. [Paizo’s Divine Mysteries deity tables](https://downloads.paizo.com/PZO13003_SupplementalGodTable.pdf)

Heritage and ancestry feat choices are recorded with the character. Add any training they grant when planning skills, and check other benefits against the option’s rules. The app does not apply those effects automatically. Attribute share links and the printable attribute ledger retain their existing scope. [Ancestry option details](ancestry-options.md)

After attribute boosts, **Choose class, general, and skill feats** shows the slots for your class and level. Expand each feat group, search by name, trait, or prerequisite, and read a selected feat’s rules. **Granted and extra feats** lists background and class grants and bonus choices from supported ancestry options. Fixed grants do not spend another slot. Use the notes for any skill, spell, or other choice required by a feat.

For an untracked subclass or conditional grant, expand **Additional choices from other rules**, add a slot, and record its source, level gained, and maximum feat level. Return after skill planning if you need to check training. All choices can remain undecided. Build changes retain previous selections for review, including a **Saved choices outside the current plan** section. Player exports and GM packages include the feat plan. [Feat guide details](feat-choices.md)

### Spell choices

After feats, **Choose spells and cantrips** shows your class’s cantrips and ranked preparations or repertoire. Choose the tradition for a Witch or Sorcerer, the school preparation type for a Wizard, or the deity-allowed font for a Cleric. Expand a group and spell row, search, choose, and read the rules. Repertoire counts are spells known; daily slot counts appear separately in each rank heading.

Wizards and Witches can record learned spells separately from daily preparations. **Additional spells and granted access** records innate, focus, feat, archetype, and other grants with their source, rank, level, and frequency. All selections remain optional, survive refreshes, and travel with **Export character**. Earlier selections remain saved after class or level changes. [Spell planning details](spell-choices.md)

### Starting equipment

Continue from spells to **Plan starting equipment**. Enter the character’s starting wealth in gp when you know it. Browse starter gear or add a custom item, then adjust quantities and mark what the character carries. The totals show cost, remaining wealth when set, and Bulk. Choose **Review build** at any point and use **Edit equipment** to return. [Equipment planning details](equipment-planner.md)

### Foundry VTT

Open **Export to Foundry VTT** in the player’s Character file panel. Download the actor and use **Import Data** on a new blank Character in a PF2e world. Check **Biography → Campaign Notes** for the choices to finish in Foundry. Use **Export character** to keep an editable Masque backup. [Foundry import instructions](foundry-export.md)

### First useful action

Run `npm test` to check the attribute engine before changing the build flow. See [roadmap/roadmap.json](../roadmap/roadmap.json) for the next items.

### Local GM access

Set `MASQUE_GM_PASSWORD` in `.env.local` or `.env`, restart with `npm run dev:gm`, and open `/gm/` on the printed local URL. Enter **`gm`** for the browser prompt’s username and the configured password. The password stays on the server. `.envlocal` is not loaded by Vite.

The GM workspace uses a separate build. Rebuild with `npm run build:gm` after editing GM code, then reload. `npm run preview` can serve it after both builds exist. Local dev and preview use the same authentication handler as Vercel. No player-interface link is added.

To save and resume GM preparation:

1. Open a player character JSON in **Character or GM package JSON file** to generate a tailoring brief.
2. Edit **Session notes (GM only)** and choose **Export GM package**. The downloaded `masque-gm-package.json` contains the character and those notes.
3. Open that GM package in the same file input to restore both. The notes are restored exactly, without regenerating the brief.

When **Unsaved edits** is visible, opening a valid replacement file or choosing **Regenerate from character** asks what to do with your current notes. **Export package** starts a download of the current character and notes, then continues. **Discard edits** continues without exporting. **Cancel** keeps the current character and notes. Invalid imports keep your work in place.

Edits stay in tab memory. The browser can warn on refresh, navigation, or tab close while edits are unsaved. Some browsers and mobile exit flows skip this warning, so export the package before leaving. GM packages contain spoilers and cannot be imported by the public player guide.

The GM file panel collapses after a successful import. Expand **Replace character or GM package** to open another file; the session notes stay in view while the import controls are tucked away.

## Failure symptoms

| Symptom | Likely cause |
|---------|----------------|
| `npm ci` engine warning / Vite fails | Node below 22.18 |
| `npm ci` reports `EPERM` on a native dependency on Windows | A running server may have the file open. Stop the project’s Vite servers and retry. |
| `@/` imports fail in the editor | `paths` missing from `tsconfig.app.json` / Vite alias |
| Boost totals disagree with Remaster expectations | Check build normalization and run the boost smoke tests |
| `/gm/` shows the player guide | Restart the server to load the local GM middleware |
| `/gm/` returns 503 | Set `MASQUE_GM_PASSWORD` in `.env.local`, restart, and run `npm run build:gm` |
| GM password prompt asks for a username | Enter `gm` |
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
