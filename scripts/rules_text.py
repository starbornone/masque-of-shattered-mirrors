"""Render Foundry rules annotations as inert, readable text."""
from html import unescape
import re


def annotation(kind, body, label, name):
    if label:
        return label
    parts = body.split('|')
    if kind == 'UUID':
        return parts[0].split('.Item.')[-1]
    if kind == 'Check':
        dc = next((p[3:] for p in parts if p.startswith('dc:')), '')
        if dc == '@self.level':
            dc = ''  # The following rules sentence specifies the level-based DC.
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
            'Floral Restoration': '4d8[healing]',
        }.get(name, formula)
        formula = formula.replace('floor(@actor.level/2)', 'half your level (rounded down)')
        formula = formula.replace('@actor.level', 'your level')
        formula = formula.replace('@actor.flags.pf2e.barbarian.instinct.dragon.damageType', "your dragon instinct's damage type")
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
    html = re.sub(r'\[\[/r ([\dd+ -]+)\]\]', r'\1', html)
    def action_link(match):
        command = match[1].split()
        action = command[1].replace('-', ' ').title()
        skill = next((p.split('=')[1] for p in command[2:] if p.startswith(('skill=', 'statistic='))), '')
        return action + (f' ({skill.title()})' if skill else '')
    html = re.sub(r'\[\[(/act [^\]]+)\]\]', action_link, html)
    html = re.sub(r'</(?:p|li|tr|h[1-6])>|<hr\s*/?>|<br\s*/?>', '\n\n', html)
    html = re.sub(r'<[^>]+>', '', html)
    lines = [re.sub(r'\s+', ' ', unescape(p)).strip() for p in html.split('\n\n')]
    lines = [p for p in lines if p and not p.startswith(('Effect:', 'Spell Effect:'))]
    text = '\n\n'.join(lines)
    assert not re.search(r'@\w|\[\[|<[^>]+>', text), (name, text)
    return text
