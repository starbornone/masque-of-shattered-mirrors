# Spell and cantrip choices

The skippable **Choose spells and cantrips** step follows feats. It separates daily preparations, spells known in a repertoire, learned spellbook or familiar spells, and independent grants. Search by name or trait, select a spell, and expand its full rules and heightening. The catalog contains 626 spells from Player Core and Player Core 2, including focus spells and composition/hex cantrips. Rituals are excluded.

## Casting and grants

The seven preset spellcasting classes use their normal level-based spell tables: Bard, Cleric, Druid, Witch, Wizard, Oracle, and Sorcerer. Witch patrons and Sorcerer bloodlines determine tradition; choose it before selecting ordinary spells. Other classes have no normal ranked slots here. Champion has a devotion-spell choice; other feat- or ancestry-granted magic uses explicit extra rows.

- Prepared casters choose a spell for each daily slot and may repeat a ranked spell to prepare multiple castings. Lower-rank spells can fill higher-rank slots. Clerics and Druids prepare from their available lists; Wizards and Witches prepare from learned spells.
- Spontaneous casters record their repertoire separately from the daily slot count. Sorcerer bloodline spells occupy part of the normal repertoire. Bard muse and Oracle mystery gifts are additional. At level 19, the three spontaneous classes know two rank 10 spells with one normal rank 10 slot. Signature-spell markings become available at level 3, with advisory checks for one per rank. Follow special rank 10 restrictions.
- Cantrips cost no slots and automatically heighten to half character level, rounded up. Composition and hex cantrips are separate from the normal cantrip choices and cost no Focus Points.
- Wizards and Witches record their starting learned spells and two more spells at each later level. The acquisition-level cap applies to these rows. Additional Learn a Spell gains use extra learned rows. A curriculum school adds restricted preparations and learned spells; Unified Magical Theory uses the base rows. The actual school curriculum must still be checked against its rules.
- Clerics choose their deity-allowed font to add its fixed Heal or Harm preparations. Font count increases from four to five at level 5 and six at level 15. The narrative faith answer does not select a mechanical deity or font.
- Initial focus spells and specified grants have separate rows. Later mystery gifts, feat effects, archetype slots, additional learned spells, and other conditional grants are recorded explicitly. Subclass selection and complete grant automation are outside this step.
- Extra innate spells retain their granted rank and frequency; innate cantrips still heighten. Focus spells heighten automatically and normally cost one Focus Point. The guide does not calculate the focus pool. “Added to your spell list” records access without granting a preparation, known spell, or slot.

Ordinary choices are filtered by tradition, cantrip type, and rank. Explicit source grants and **Include off-list spells granted by another rule** allow exceptions; record their source. Uncommon and rare access, exact subclass lists, prerequisites, slots added by feats, and other exceptions require checking the displayed rules. Advisory messages preserve every choice and never block navigation. The guide does not calculate DCs, spend resources, or apply effects. Displayed descriptions use base-rank values; read the Heightened entry for the chosen rank.

Primary references: [spellcasting rules](https://2e.aonprd.com/Rules.aspx?ID=2221), [Bard](https://2e.aonprd.com/Classes.aspx?ID=32), [Cleric](https://2e.aonprd.com/Classes.aspx?ID=33), [Druid](https://2e.aonprd.com/Classes.aspx?ID=34), [Witch](https://2e.aonprd.com/Classes.aspx?ID=38), [Wizard](https://2e.aonprd.com/Classes.aspx?ID=39), [Oracle](https://2e.aonprd.com/Classes.aspx?ID=61), [Sorcerer](https://2e.aonprd.com/Classes.aspx?ID=62), and [Oracle mysteries](https://2e.aonprd.com/Mysteries.aspx).

## Saved data and GM handoff

Optional `CharacterDraft.spellChoices` extends the existing version-1 character format. It contains per-class tradition choices, school preparation type, font choice, source notes, a stable slot-keyed map of `{ id, notes, signature, grantedAccess }`, and explicit extra rows with `{ id, kind, rank, level, source, frequency }`. Rank zero identifies a cantrip. Custom entries use `id: "custom"` and literal name/rule notes.

Browser saves, player JSON, and nested characters in GM packages preserve the entire plan. Older files without spell choices remain valid. Class or level changes retain inactive selections for review without counting them in the current plan. Removing an explicit extra row removes that row and its selection. Malformed data and unknown catalog IDs are rejected before replacing a draft. Attribute share links and the printable attribute ledger keep their existing attribute-only scope.

Build review and the protected GM character review list selected spells and notes. The private tailoring brief quotes player spell notes as literal text. GM notes, packages, and campaign hooks remain in the separately built, authenticated `/gm/` workspace.

## Sources and refresh

The catalog uses [PF2e for Foundry VTT commit 4cbdaa37d6c33e9519561bae2c59a23e0288cbce](https://github.com/foundryvtt/pf2e/tree/4cbdaa37d6c33e9519561bae2c59a23e0288cbce), restricted to the two Player Core books with Remaster and ORC metadata. Keep the [ORC notice](../public/rules-notice.txt) with the generated data.

From the app repository, with a local checkout of that source:

```sh
python scripts/import-spell-options.py PATH_TO_PF2E_CHECKOUT
npm test
npm run build
npm run build:gm
```

The importer makes no network requests. It writes `spell-labels.json`, `spell-options.json`, and `spell-rules/*.json` under `src/content/`. Conversion removes HTML and executable Foundry annotations, retains Heightened paragraphs, and displays base-rank dice values. Review formula and table conversions when updating the snapshot. Class slot profiles are curated separately in `src/spells/choices.ts`; verify them against the current class rules rather than assuming transcription data has every later correction.

The spell picker and metadata load at the spell step. Description chunks load when selected spell rows are expanded. Saves and summaries use only the smaller index, which is split into a shared rules-index chunk in both public and private builds. No external rules API runs in the browser.
