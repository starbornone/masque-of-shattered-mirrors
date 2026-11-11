"""Extract inert Player Core/Player Core 2 spell rules from a local PF2e checkout."""
import json
from pathlib import Path
import re
import subprocess
import sys
from rules_text import plain_text

root = Path(sys.argv[1])
options, labels, descriptions, failures = [], {}, {}, []
for path in sorted((root / 'packs/spells').rglob('*.json')):
    item = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(item, dict) or 'system' not in item:
        continue
    data = item['system']
    publication = data.get('publication', {})
    if publication.get('title') not in {'Pathfinder Player Core', 'Pathfinder Player Core 2'} or not publication.get('remaster') or publication.get('license') != 'ORC' or data.get('ritual'):
        continue
    ident, name = path.stem, item['name']
    traits = data['traits']
    rank = data['level']['value']
    cantrip = 'cantrip' in traits['value']
    granted = 'focus' in traits['value'] or not traits['traditions']
    group = 'granted' if granted else f'rank-{0 if cantrip else rank}'
    html = data['description']['value']
    html = re.sub(r'</(?:td|th)>', ' | ', html)
    html = html.replace('[[/r 1D4]]', '1d4').replace('[[/r 1d4 #Creative Splash]]', '1d4')
    html = re.sub(r'<span class="action-glyph">([123])</span>', lambda m: f'{m[1]} action' + ('s' if m[1] != '1' else ''), html)
    # Dice annotations are rendered at base rank; Heightened paragraphs remain intact.
    html = html.replace('@item.rank', str(rank)).replace('@item.level', str(rank))
    try:
        text = plain_text(html, name)
    except AssertionError as error:
        failures.append(str(error))
        continue
    labels[ident] = [name, rank, cantrip, granted]
    options.append({
        'id': ident, 'name': name, 'rank': rank, 'cantrip': cantrip, 'granted': granted,
        'traditions': traits['traditions'], 'traits': traits['value'], 'rarity': traits['rarity'],
        'actions': data['time']['value'], 'range': data['range']['value'],
        'target': data['target']['value'], 'duration': data['duration']['value'],
        'sustained': data['duration'].get('sustained', False),
        'defense': data.get('defense'), 'source': publication['title'].removeprefix('Pathfinder '),
        'rulesGroup': group,
    })
    descriptions.setdefault(group, {})[ident] = text
if failures:
    print('\n'.join(failures))
    raise SystemExit(f'{len(failures)} descriptions need a readable conversion.')
assert len(options) > 600, 'Check the input checkout and publication filters before replacing the catalog.'
output = Path('src/content')
for name, value in [('spell-options', sorted(options, key=lambda o: o['name'])), ('spell-labels', labels)]:
    (output / f'{name}.json').write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
rules = output / 'spell-rules'
rules.mkdir(exist_ok=True)
for group, value in sorted(descriptions.items()):
    (rules / f'{group}.json').write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
revision = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
print(f'Imported {len(options)} spells from {revision}.')
