# Heritage and ancestry feat choices

The guide adds **Choose heritage and ancestry feats** after ancestry. This step explains the two kinds of choice, offers searchable rules, and stays skippable while other decisions are unfinished.

## Supported choices

- 106 heritages and 403 ancestry feats from **Player Core** and **Player Core 2**, covering all 16 preset ancestries and the books’ seven versatile heritages.
- One heritage and standard ancestry feat slots at levels 1, 5, 9, 13, and 17. Only slots up to the current character level are shown. Lower-level feats remain available in later slots, except lineage feats, which are restricted to the level-1 suggestions.
- Aiuvarin and dromaar also grant suggestions from elf and orc feats respectively. Other versatile heritages add feats with their heritage trait.
- Selected rules show rarity, prerequisites, action type when relevant, and their rules text. Uncommon and rare options require GM approval. Extra-choice notes can record a granted skill, spell, or feat. A custom entry records options from another source or a custom mixed heritage.

Suggestions check ancestry, heritage, and slot level. They do not fully validate prerequisites, access exceptions, or all special feat rules. Prior selections remain saved if a build change makes them questionable, with advisory messages in the chooser and review. Lowering the level retains higher-level selections. Custom access and unusual bonus slots can be recorded in choice notes.

The step records choices without applying their effects. The player includes granted training in the skill planner and handles senses, innate spells, bonuses, and other benefits using the selected rules. Attribute math remains in the existing engine. [Player Core character creation](https://2e.aonprd.com/Rules.aspx?ID=2027), [leveling up](https://2e.aonprd.com/Rules.aspx?ID=2065)

The later [feat guide](feat-choices.md) opens separate bonus choices for Versatile Human, Ancient Elf, Natural Ambition, General Training, Advanced General Training, and Multitalented. Ancestral Paragon can also add a bonus ancestry feat there. Use an extra feat slot for other conditional grants.

## Storage and privacy

The optional `ancestryChoices` field in version-1 character data has this shape:

```json
{
  "heritage": { "id": "skilled-human", "notes": "Society" },
  "feats": {
    "1": { "id": "natural-ambition", "notes": "Choose a class feat later." }
  }
}
```

An undecided heritage is `null`; undecided feat slots are omitted. IDs come from the appropriate catalog or are `custom`. Notes are literal strings. The parser rejects malformed selections, unknown catalog IDs, and unsupported slot levels. Compatibility warnings do not erase saved selections.

Browser saves, player exports, and characters nested in GM packages retain choices. Files created before this field existed still work. Attribute-only share links and printable ledgers keep their existing format. The protected GM workspace shows the selections and quotes them safely in generated tailoring notes. Only the private GM sources contain campaign wiring.

## Rules data and refresh

The catalog is adapted from [PF2e for Foundry VTT](https://github.com/foundryvtt/pf2e/tree/4cbdaa37d6c33e9519561bae2c59a23e0288cbce) at commit `4cbdaa37d6c33e9519561bae2c59a23e0288cbce`. Only heritage and ancestry feat records marked Remaster, ORC, and belonging to the two Player Core books are included. No adventure data, artwork, executable rule elements, or campaign vault text is imported.

- [ancestry-options.json](../src/content/ancestry-options.json) holds stable IDs, names, traits, levels, rarity, prerequisites, and source metadata.
- [ancestry-descriptions.json](../src/content/ancestry-descriptions.json) holds plain-text rules. The picker and these descriptions load when the player opens that step.
- [rules-notice.txt](../public/rules-notice.txt) contains the ORC notice and upstream attribution and is available from the picker.

To refresh, obtain a local checkout of the upstream source and run this from the app repository:

```sh
python scripts/import-ancestry-options.py PATH_TO_PF2E_CHECKOUT
npm test
npm run build
npm run build:gm
```

The script makes no network requests. It strips HTML and Foundry annotations, retains readable rule references, normalizes the legacy trait keys `gnoll` and `grippli` to `kholo` and `tripkee`, and converts inline dice notation into readable rules text. Review generated changes, scaling formulas, references, and attribution before committing. Update the pinned revision in this document after a refresh. No data is fetched while the app runs.
