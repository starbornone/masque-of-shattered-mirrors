# Class, general, and skill feat choices

The **Choose class, general, and skill feats** step follows attribute boosts. It explains feat types and prerequisites, offers searchable rules, and allows every choice to remain undecided. Use **Edit feats** from build review to return after skill planning.

## Slots and grants

The planner uses the 16 preset classes’ progression tables from Player Core and Player Core 2. This includes classes that first choose a class feat at level 2, the Rogue’s skill feat at every level, and the Investigator’s extra odd-level skill feats. Skillful Lessons rows explain their mental-skill or methodology-skill restriction. The app does not select a methodology or validate that restriction automatically. [Rogue rules](https://2e.aonprd.com/Classes.aspx?ID=37), [Investigator rules](https://2e.aonprd.com/Classes.aspx?ID=59)

Regular slots are separated into class, general, and skill groups. Granted and extra feats appear in their own group, so they do not use another regular slot:

- Fixed feat grants from the selected background and unconditional class features appear automatically. They can have extra-choice notes. No feat is assumed when a background does not grant one.
- A background reference outside the Core catalogs, such as Bookkeeper’s Eye for Numbers, stays visible as a named grant with a rules link. Its legacy rules text is not copied into the Core catalog.
- Versatile Human and General Training grant a level-1 general feat choice. Advanced General Training has its own level-7 cap. Natural Ambition grants a level-1 class feat choice.
- Ancient Elf and Multitalented grant multiclass dedication choices, excluding the character’s own class. Ancient Elf allows its level-2 dedication at character level 1; check its other requirements.
- Ancestral Paragon grants a level-1 ancestry feat choice, excluding lineage feats. Supported grants can chain into further choices without spending normal slots.
- Fighter Combat Flexibility and Improved Flexibility provide separate daily choices capped at feat levels 8 and 14. They are saved as preparation choices, not permanent extra level slots. [Fighter rules](https://2e.aonprd.com/Classes.aspx?ID=35)
- Explicit extra slots record a subclass, conditional grant, custom class, or other rule not modeled automatically. Record the source, type, level gained, and maximum feat level. Subclass selections and complete grant automation are outside this step.

The catalog contains 1,418 class, general, and skill feats from the two Remaster Player Core books, including archetype feats. Archetype options are hidden until enabled, except dedicated multiclass choices. General slots allow feats with the general trait, including skill feats with that trait. Skill slots offer skill feats. Level caps use the slot or granting rule, rather than the character’s current level alone.

The picker checks type, class, and allowed feat level. Prerequisites, access, skill rank at the acquisition level, dedication restrictions, and conditional class features still require checking the displayed rules. Incompatible or duplicate selections receive advisory messages. Repeatable feats remain usable with notes for different choices. The guide records feats without automatically applying their statistics, training, spells, or other benefits.

## Saved data

The optional `featChoices` field in version-1 character data contains `choices`, a map from stable slot keys to `{ "id": "feat-id", "notes": "literal text" }`, and `extra`, an array of explicit grant slots. Extra slots have `id`, `kind`, `level`, `maxLevel`, and `source`. Bonus ancestry feat IDs have the `ancestry:` prefix. `custom` records an option from another source.

Unknown feat IDs and malformed fields are rejected. Files without `featChoices` still load. Player saves, player JSON, and nested characters in GM packages preserve the field. Class, level, ancestry, and background changes keep selections that leave the active plan. Those selections can be reviewed or cleared separately. Removing an extra slot also keeps its selected feat outside the plan until cleared.

Fixed grants can be derived from the selected background or class before notes are entered. Their stable slots join saved notes to the correct grant. The protected GM workspace reviews selected feats and quotes their notes safely in the tailoring brief. No GM notes or campaign wiring enter player files or public rules chunks.

## Sources and refresh

The source snapshot is [PF2e for Foundry VTT commit 4cbdaa37d6c33e9519561bae2c59a23e0288cbce](https://github.com/foundryvtt/pf2e/tree/4cbdaa37d6c33e9519561bae2c59a23e0288cbce). Only Player Core and Player Core 2 entries marked Remaster and ORC are included. The existing [ORC notice](../public/rules-notice.txt) credits both books and the transcription team.

Run from the app repository with a local upstream checkout:

```sh
python scripts/import-feat-options.py PATH_TO_PF2E_CHECKOUT
npm test
npm run build
npm run build:gm
```

The importer makes no network requests. It generates `feat-labels.json`, `feat-options.json`, `feat-progression.json`, and the `feat-rules/` chunks under `src/content/`. Shared [conversion helpers](../scripts/rules_text.py) remove HTML and executable annotations. Review any formula conversions and source changes before committing. Class and background grants include only explicit unconditional feat references, avoiding technical stand-ins such as Foundry’s Pet item for a Witch familiar. Curated bonus-choice rules live in [the slot planner](../src/feats/choices.ts).

The app loads the catalog when the feat step opens and a local rules chunk when a feat is selected. Saves, review, and GM handoff use the smaller label and progression files.
