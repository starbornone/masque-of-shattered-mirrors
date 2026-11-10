"""Extract Remaster feat choices and progression from a local foundryvtt/pf2e checkout."""
import json
from pathlib import Path
import re
import subprocess
import sys
from rules_text import plain_text

root = Path(sys.argv[1])
books = {'Pathfinder Player Core', 'Pathfinder Player Core 2'}
class_ids = {'alchemist', 'barbarian', 'bard', 'champion', 'cleric', 'druid', 'fighter', 'investigator', 'monk', 'oracle', 'ranger', 'rogue', 'sorcerer', 'swashbuckler', 'witch', 'wizard'}


def records(folder):
    for path in sorted((root / folder).rglob('*.json')):
        item = json.loads(path.read_text(encoding='utf-8'))
        if isinstance(item, dict) and 'system' in item:
            yield path.stem, item


def remaster(item):
    publication = item['system'].get('publication', {})
    return publication.get('title') in books and publication.get('remaster') and publication.get('license') == 'ORC'


all_feats = list(records('packs/feats'))
options, descriptions, labels, fixed_grants = [], {}, {}, {}
by_name = {item['name']: ident for ident, item in all_feats if remaster(item)}
failures = []
for ident, item in all_feats:
    data = item['system']
    if not remaster(item) or data['category'] not in ['class', 'general', 'skill']:
        continue
    traits = data['traits']['value']
    group = next((t for t in traits if t in class_ids), 'archetypes-' + ('a-f' if item['name'][0].lower() < 'g' else 'g-l' if item['name'][0].lower() < 'm' else 'm-r' if item['name'][0].lower() < 's' else 's-z')) if data['category'] == 'class' else data['category']
    try:
        text = plain_text(data['description']['value'], item['name'])
    except AssertionError as error:
        failures.append(str(error))
        continue
    action = data['actionType']['value']
    count = data['actions']['value']
    options.append({
        'id': ident, 'name': item['name'], 'kind': data['category'],
        'level': data['level']['value'], 'traits': traits,
        'source': data['publication']['title'].removeprefix('Pathfinder '),
        'rarity': data['traits']['rarity'],
        'prerequisites': '; '.join(p['value'] for p in data['prerequisites']['value']),
        'repeatable': bool(re.search(r'(?:select|take) this feat (?:multiple times|more than once)', text)),
        'action': f"{count} action{'s' if count != 1 else ''}" if action == 'action' else 'free action' if action == 'free' else action,
        'rulesGroup': group,
    })
    descriptions.setdefault(group, {})[ident] = text
    labels[ident] = item['name']
if failures:
    print('\n'.join(failures))
    raise SystemExit(f'{len(failures)} descriptions need a readable conversion.')
assert len(labels) == len(options)


def feat_refs(item):
    refs = [i['uuid'] for i in item['system'].get('items', {}).values()]
    refs += [r['uuid'] for r in item['system'].get('rules', []) if r['key'] == 'GrantItem' and not r.get('predicate')]
    result = []
    for ref in refs:
        if ref.startswith('Compendium.pf2e.feats-srd.Item.'):
            name = ref.split('.Item.')[-1]
            ident = by_name.get(name)
            # Ignore internal stand-ins, such as the Pet item implementing a witch's familiar.
            if ident in labels and ident not in result and name in item['system']['description']['value']:
                result.append(ident)
    return result


for ident, item in all_feats:
    if ident in labels:
        grants = feat_refs(item)
        if grants:
            fixed_grants[ident] = grants

backgrounds = {ident: feat_refs(item) for ident, item in records('packs/backgrounds') if remaster(item)}
background_references = {}
for ident, item in records('packs/backgrounds'):
    if not remaster(item):
        continue
    references = []
    for entry in item['system'].get('items', {}).values():
        ref = entry['uuid']
        if ref.startswith('Compendium.pf2e.feats-srd.Item.'):
            name = ref.split('.Item.')[-1]
            if by_name.get(name) not in labels:
                references.append(name)
    if references:
        background_references[ident] = references
features = {item['name']: item for _, item in records('packs/classfeatures')}
classes = {}
for ident, item in records('packs/classes'):
    if ident not in class_ids or not remaster(item):
        continue
    data = item['system']
    grants = []
    for feature in data['items'].values():
        record = features.get(feature['name'])
        if record:
            grants += [{'level': feature['level'], 'feat': feat} for feat in feat_refs(record)]
    classes[ident] = {
        'class': data['classFeatLevels']['value'],
        'general': data['generalFeatLevels']['value'],
        'skill': data['skillFeatLevels']['value'],
        'fixed': grants,
    }
assert set(classes) == class_ids
output = Path('src/content')
for name, value in [('feat-options', sorted(options, key=lambda o: o['name'])), ('feat-labels', labels), ('feat-progression', {'classes': classes, 'backgrounds': backgrounds, 'backgroundReferences': background_references, 'fixedGrants': fixed_grants})]:
    (output / f'{name}.json').write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
rules = output / 'feat-rules'
rules.mkdir(exist_ok=True)
for group, value in sorted(descriptions.items()):
    (rules / f'{group}.json').write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
revision = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
print(f'Imported {len(options)} class/general/skill feats and {len(classes)} class progressions from {revision}.')
