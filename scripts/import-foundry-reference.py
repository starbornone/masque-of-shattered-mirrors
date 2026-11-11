"""Prepare player-facing compendium references from a local PF2e 8.7.0 checkout."""
import json
from pathlib import Path
import re
import sys

root = Path(sys.argv[1])
packs = root / 'packs/pf2e'
content = Path(__file__).resolve().parents[1] / 'src/content'
books = {'Pathfinder Player Core', 'Pathfinder Player Core 2'}


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def load_catalog(name):
    return read(content / f'{name}.json')


manifest = read(root / 'system.pf2e.json')
assert manifest['id'] == 'pf2e' and manifest['version'] == '8.7.0'
migration = (root / 'src/module/migration/runner/base.ts').read_text(encoding='utf-8')
schema = float(re.search(r'LATEST_SCHEMA_VERSION = (\d+\.\d+)', migration)[1])
assert schema == 0.961


def core_record(item):
    publication = item.get('system', {}).get('publication', {})
    return publication.get('title') in books and publication.get('license') == 'ORC' and publication.get('remaster') is True


def compendium_uuid(pack, item):
    ident = item['_id']
    assert re.fullmatch(r'[a-zA-Z0-9]{16}', ident), ident
    return f'Compendium.pf2e.{pack}.Item.{ident}'


def references(folder, pack, selected=None):
    result = {}
    for path in sorted((packs / folder).rglob('*.json')):
        if selected is not None and path.stem not in selected:
            continue
        item = read(path)
        if isinstance(item, dict) and core_record(item):
            if path.stem in result:
                raise ValueError(f'Ambiguous {folder} source: {path.stem}')
            result[path.stem] = compendium_uuid(pack, item)
    return result


ancestry_choices = load_catalog('ancestry-options')
feats = set(load_catalog('feat-labels')) | {option['id'] for option in ancestry_choices['feats']}
spells = set(load_catalog('spell-labels'))
links = {
    'ancestry': references('ancestries', 'ancestries'),
    'background': references('backgrounds', 'backgrounds'),
    'class': references('classes', 'classes'),
    'heritage': references('heritages', 'heritages', {option['id'] for option in ancestry_choices['heritages']}),
    'feat': references('feats', 'feats-srd', feats),
    'spell': references('spells', 'spells-srd', spells),
}
assert all(links.values()), 'Missing reference packs'

equipment = {}
for row in load_catalog('starting-equipment') + [
    {'id': f'{name.lower()}-pieces', 'name': f'{name} Pieces'} for name in ('Gold', 'Silver', 'Copper')
]:
    item = read(packs / 'equipment' / f"{row['id']}.json")
    assert core_record(item)
    system = item['system']
    # Keep verified inventory documents. Kits require Foundry's item-grant workflow.
    if item['type'] == 'kit':
        equipment[row['name']] = {'uuid': compendium_uuid('equipment-srd', item)}
        continue
    system['description'] = {'value': ''}
    system['_migration'] = {'version': schema, 'previous': None}
    equipment[row['name']] = {
        'uuid': compendium_uuid('equipment-srd', item),
        'name': item['name'],
        'type': item['type'],
        'img': item['img'],
        'units': system.get('price', {}).get('per', 1),
        'system': system,
    }

data = {
    'systemVersion': manifest['version'],
    'coreVersion': manifest['compatibility']['verified'],
    'schemaVersion': schema,
    'links': links,
    'equipment': equipment,
}
(content / 'foundry-reference.json').write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f"Prepared {sum(len(group) for group in links.values())} compendium links and {len(equipment)} equipment references.")
