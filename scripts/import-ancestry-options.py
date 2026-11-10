"""Extract the two Remaster Player Core books from a local foundryvtt/pf2e checkout.

Usage: python scripts/import-ancestry-options.py PATH_TO_PF2E_CHECKOUT
No network requests are made. Review the generated data before committing it.
"""
from html import unescape
import json
from pathlib import Path
import re
import subprocess
import sys

root = Path(sys.argv[1])
books = {'Pathfinder Player Core', 'Pathfinder Player Core 2'}


def annotation(kind, body, label, name):
    if label:
        return label
    parts = body.split('|')
    if kind == 'UUID':
        return parts[0].split('.Item.')[-1]
    if kind == 'Check':
        dc = next((p[3:] for p in parts if p.startswith('dc:')), '')
        return (f'DC {dc} ' if dc else '') + parts[0].replace('-', ' ')
    if kind == 'Template':
        distance = next(p.split(':')[1] for p in parts if p.startswith('distance:'))
        return f'{distance}-foot {parts[0]}'
    if kind == 'Damage':
        formula = parts[0]
        # Descriptive text following these rolls already explains their scaling.
        formula = {
            'Fruit Leshy': '1d8[vitality,healing]',
            'Agonizing Rebuke': '1d4[mental]',
            'Cantorian Rejuvenation': '4d6[healing]',
            'Fleeing Shriek': '1d6 per 2 levels (rounded up)[sonic]',
        }.get(name, formula)
        formula = formula.replace('floor(@actor.level/2)', 'half your level (rounded down)')
        formula = formula.replace('@actor.level', 'your level')
        return formula.replace('[', ' ').replace(']', '').replace(',', ' ')
    raise ValueError(kind)


def plain_text(html, name):
    # Foundry annotations have nested brackets, so match their balanced payloads.
    pattern = re.compile(r'@(UUID|Check|Damage|Template)\[')
    while match := pattern.search(html):
        end = match.end()
        depth = 1
        while depth:
            depth += (html[end] == '[') - (html[end] == ']')
            end += 1
        body = html[match.end():end - 1]
        label = ''
        if html[end:end + 1] == '{':
            close = html.index('}', end)
            label = html[end + 1:close]
            end = close + 1
        html = html[:match.start()] + annotation(match[1], body, label, name) + html[end:]
    html = re.sub(r'\[\[.*?\]\]\{([^}]+)\}', r'\1', html)
    html = re.sub(r'</(?:p|li|tr|h[1-6])>|<hr\s*/?>|<br\s*/?>', '\n\n', html)
    html = re.sub(r'<[^>]+>', '', html)
    lines = [re.sub(r'\s+', ' ', unescape(p)).strip() for p in html.split('\n\n')]
    lines = [p for p in lines if p and not p.startswith(('Effect:', 'Spell Effect:'))]
    text = '\n\n'.join(lines)
    assert not re.search(r'@\w|\[\[|<[^>]+>', text), (name, text)
    return text


result = {'heritages': [], 'feats': []}
for kind, folder in [('heritages', 'packs/heritages'), ('feats', 'packs/feats/ancestry')]:
    for path in sorted((root / folder).rglob('*.json')):
        item = json.loads(path.read_text(encoding='utf-8'))
        if not isinstance(item, dict):
            continue
        data = item.get('system', {})
        publication = data.get('publication', {})
        if publication.get('title') not in books or not publication.get('remaster'):
            continue
        assert publication['license'] == 'ORC'
        row = {
            'id': path.stem,
            'name': item['name'],
            'source': publication['title'].removeprefix('Pathfinder '),
            'rarity': data['traits']['rarity'],
            'traits': [{'gnoll': 'kholo', 'grippli': 'tripkee'}.get(trait, trait) for trait in data['traits']['value']],
            'description': plain_text(data['description']['value'], item['name']),
        }
        if kind == 'heritages':
            row['ancestry'] = (data.get('ancestry') or {}).get('slug', '')
        else:
            row['level'] = data['level']['value']
            row['prerequisites'] = '; '.join(p['value'] for p in data['prerequisites']['value'])
            row['repeatable'] = 'You can select this feat multiple times' in row['description']
            action = data['actionType']['value']
            count = data['actions']['value']
            row['action'] = f"{count} action{'s' if count != 1 else ''}" if action == 'action' else 'free action' if action == 'free' else action
        result[kind].append(row)
    result[kind].sort(key=lambda r: r['name'])
    assert len({r['id'] for r in result[kind]}) == len(result[kind])

target = Path('src/content/ancestry-options.json')
descriptions = {kind: {row['id']: row.pop('description') for row in rows} for kind, rows in result.items()}
Path('src/content/ancestry-descriptions.json').write_text(json.dumps(descriptions, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
revision = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
print(f"Imported {len(result['heritages'])} heritages and {len(result['feats'])} ancestry feats from {revision}.")

notice = (root / 'static/licenses/ORCLicense.md').read_text(encoding='utf-8')
credits = '\n\n'.join(line.strip().lstrip('*').strip() for line in notice.splitlines()
                       if 'Pathfinder Player Core ©' in line or 'Pathfinder Player Core 2 ©' in line)
Path('public/rules-notice.txt').write_text(
    'ORC NOTICE\nThis product is licensed under the ORC License located at the Library of Congress at TX 9-307-067 '
    'and available online at https://downloads.paizo.com/ORC_License_FINAL.pdf. '
    'All warranties are disclaimed as set forth therein.\n\nATTRIBUTION NOTICE\n' + credits +
    '\n\nRules data transcribed by the PF2e for Foundry VTT volunteer development team.\n'
    f'https://github.com/foundryvtt/pf2e/tree/{revision}\n'
    'Adapted plain-text rules catalog: Masque Character Creator contributors, 2026.\n\n'
    'RESERVED MATERIAL\nTrademarks, artwork, characters, deities, locations, plots, storylines, and trade dress '
    'are reserved to their respective owners to the extent they constitute Reserved Material under the ORC License.\n\n'
    'EXPRESSLY DESIGNATED LICENSED MATERIAL\nThis product contains no Expressly Designated Licensed Material.\n',
    encoding='utf-8',
)
