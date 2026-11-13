# Export to Foundry VTT

The actor export targets Foundry VTT 14 with Pathfinder Second Edition system 8.7.0. It uses the built-in actor import and works with a draft at any stage. [Foundry actor imports](https://foundryvtt.com/article/actors/#importing-an-actor) · [PF2e 8.7.0](https://github.com/foundryvtt/pf2e/releases/tag/pf2e-8.7.0)

1. In Masque, open **Character file → Export to Foundry VTT**. Optionally enter an actor name and choose **Download Foundry actor**.
2. In the Foundry Actors directory, create a blank **Character**. Right-click that actor, choose **Import Data**, and select `masque-foundry-actor.json`. Import replaces the selected actor’s data.
3. In the actor’s **Biography → Campaign Notes**, follow the checklist for ancestry, heritage, background, class, feats, and spells. Add the foundations first so Foundry can grant their features. Review Hit Points, equipped items, and any unassigned boosts before play.

## What transfers

- **Level, attributes, and skills.** Current attribute modifiers use Foundry’s manual attribute mode. Planned skill ranks and named Lore appear on the sheet. Complete any unfinished choices and check automatic proficiency grants in Foundry.
- **Gear.** Recognized starter gear uses PF2e inventory types. Ammunition purchase lots convert to individual units. Other gear, including the Adventurer’s Pack bundle, uses an equipment entry. Items marked left behind are dropped in Foundry. Review worn armor, held weapons, and containers there.
- **Wealth.** If the plan has a positive remaining balance, the actor receives that amount as gold, silver, and copper. Unset and overspent budgets add no coins.
- **Build choices.** The checklist carries the selected foundations, feats, spells, and language notes. Supported names link to their compendium entry. Add them through Foundry to resolve grants and spellcasting entries.

The export contains player mechanics only. It omits session-zero answers, GM notes, and GM packages. **Download backup** creates the editable backup for reopening the draft in Masque.

## Reference and verification

The exporter uses the PF2e actor template, document import preprocessor, and migration version `0.961` from the pinned [PF2e system source](https://github.com/foundryvtt/pf2e/tree/pf2e-8.7.0). Export tests cover actor fields, item quantities, carried status, compendium links, and the privacy boundary. The mapping has been checked against the published source. A live Foundry import has yet to be verified.

To regenerate the compendium index, run `python scripts/import-foundry-reference.py PATH_TO_PF2E_CHECKOUT` with the `pf2e-8.7.0` tag. The script reads the PF2e ancestry, background, class, heritage, feats, spells, and equipment packs. It limits data to Remaster Player Core and Player Core 2 and uses the existing Masque catalogs for feat, spell, and inventory selection. [Rules attribution](../public/rules-notice.txt)
