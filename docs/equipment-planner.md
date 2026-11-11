# Starting equipment and Bulk

Open **Plan starting equipment** after spells, or choose **Edit equipment** from build review. Starting wealth is a per-character amount entered in gold pieces. Leave it blank to see costs before the budget is settled. Enter zero to plan with no spending money. Both gear and wealth are optional.

Browse 46 starter options across weapons, armor and clothing, shields, ammunition, and adventuring gear. The selected item shows its listed price and Bulk and links to its rules. Ammunition lines specify their purchase lot. The Adventurer’s Pack includes the price and Bulk of the complete bundle. For other gear, **Add custom gear** accepts a name, unit price, and unit Bulk. Use **Adjust price or Bulk** on a line for a different price, granted gear, or an adjusted load.

All quantities count toward gear cost. **Carried** controls whether the line contributes to the character’s load. Ten light items make 1 Bulk. Remaining light items are shown separately and rounded down for limit checks. The planner uses 5 plus current Strength as the unencumbered limit and 10 plus Strength as the maximum. Limits are provisional while boosts are unfinished. The warnings leave review available. [Player Core Bulk](https://2e.aonprd.com/Rules.aspx?ID=2153)

The planner uses worn Bulk for armor and backpacks. Adjust item values for different item sizes, armor carried unworn, and container discounts. Count 1 Bulk per full 1,000 coins if the character carries enough coins to matter. Capacity changes from feats and other features are handled at the table. [Backpack rules](https://2e.aonprd.com/Equipment.aspx?ID=2704)

## Saved data and sources

An optional `equipmentPlan` field in version-1 character files contains `startingWealthCp` and an array of saved item rows. Unit prices and wealth use integer copper. Bulk uses integer light units. Each line keeps its name, price, Bulk, quantity, and carried status when the starter catalog changes. Browser drafts, player exports, and nested characters in GM packages keep the plan. Older exports still open.

Starter prices and statistics come from Player Core via the PF2e for Foundry VTT transcription. The catalog is a curated set of published gear values and short guidance. The Adventurer’s Pack uses the printed bundle Bulk. [Transcription snapshot](https://github.com/foundryvtt/pf2e/tree/bdea4f90b512ccaa13c7205c357e8863a451950d/packs/pf2e/equipment) · [Adventurer’s Pack](https://2e.aonprd.com/Equipment.aspx?ID=2700) · [Rules attribution](../public/rules-notice.txt)
