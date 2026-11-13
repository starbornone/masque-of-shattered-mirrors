import { useState } from 'react'
import type { Build } from '@/attributes/build'
import { EquipmentTotals } from '@/components/EquipmentSummary'
import { Button } from '@/components/ui/button'
import catalog from '@/content/starting-equipment.json'
import { emptyEquipmentPlan, formatCoins, formatItemBulk, maxBulkLight, maxEquipmentRows, maxPriceCp, maxQuantity, parseEquipmentAmount } from '@/equipment/plan'
import type { EquipmentItem, EquipmentPlan } from '@/equipment/plan'

const field = 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring'
const groups = ['Weapons', 'Armor and clothing', 'Shields', 'Ammunition', 'Adventuring gear']

type AmountFieldProps = {
  label: string
  value: number | null
  places: 0 | 1 | 2
  minimum?: number
  maximum: number
  placeholder?: string
  allowBlank?: boolean
  onChange: (value: number | null) => void
}

function AmountField({ label, value, places, minimum = 0, maximum, placeholder, allowBlank = false, onChange }: AmountFieldProps) {
  const savedText = value === null ? '' : String(value / 10 ** places)
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? savedText
  const parsed = parseEquipmentAmount(text, places, maximum)
  const invalid = !(text === '' && allowBlank) && (parsed === null || parsed < minimum)

  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        className={`${field} text-base`}
        inputMode={places ? 'decimal' : 'numeric'}
        placeholder={placeholder}
        value={text}
        aria-invalid={invalid}
        onChange={(event) => {
          const next = event.currentTarget.value
          setDraft(next)
          if (next === '' && allowBlank) onChange(null)
          const amount = parseEquipmentAmount(next, places, maximum)
          if (amount !== null && amount >= minimum) onChange(amount)
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            event.currentTarget.blur()
          }
        }}
      />
      {invalid ? <span className="block text-sm text-primary">
        Enter {places ? `a value with up to ${places} decimal places` : 'a whole number'} from {minimum} to {maximum / 10 ** places}.
      </span> : null}
    </label>
  )
}

function CustomItemForm({ disabled, onAdd }: { disabled: boolean; onAdd: (item: Pick<EquipmentItem, 'name' | 'priceCp' | 'bulkLight'>) => void }) {
  const [name, setName] = useState('')
  const [priceCp, setPriceCp] = useState<number | null>(null)
  const [bulkLight, setBulkLight] = useState<number | null>(null)

  return (
    <details className="rounded-md border border-border p-3">
      <summary className="font-medium">Add custom gear</summary>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Enter 0 gp for gear you’re given. For Bulk, 0.1 is light and 0 is negligible.</p>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Item name</span>
          <input className={field} value={name} maxLength={120} onChange={(event) => setName(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault() }} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <AmountField label="Unit price (gp)" value={priceCp} places={2} maximum={maxPriceCp} placeholder="e.g. 0.50" allowBlank onChange={setPriceCp} />
          <AmountField label="Unit Bulk" value={bulkLight} places={1} maximum={maxBulkLight} placeholder="e.g. 0.1" allowBlank onChange={setBulkLight} />
        </div>
        <Button type="button" variant="outline" disabled={disabled || !name.trim() || priceCp === null || bulkLight === null} onClick={() => {
          if (!name.trim() || priceCp === null || bulkLight === null) return
          onAdd({ name: name.trim(), priceCp, bulkLight })
          setName('')
          setPriceCp(null)
          setBulkLight(null)
        }}>Add custom item</Button>
      </div>
    </details>
  )
}

export default function EquipmentGuide({ plan = emptyEquipmentPlan, build, onChange }: {
  plan?: EquipmentPlan
  build: Build
  onChange: (plan: EquipmentPlan) => void
}) {
  const [itemId, setItemId] = useState('')
  const selected = catalog.find((item) => item.id === itemId)
  const full = plan.items.length >= maxEquipmentRows

  function addItem(item: Pick<EquipmentItem, 'name' | 'priceCp' | 'bulkLight'>) {
    if (full) return
    const { name, priceCp, bulkLight } = item
    onChange({
      ...plan,
      items: [...plan.items, { id: crypto.randomUUID(), name, priceCp, bulkLight, quantity: 1, carried: true }],
    })
  }

  function updateItem(id: string, changes: Partial<EquipmentItem>) {
    onChange({ ...plan, items: plan.items.map((item) => item.id === id ? { ...item, ...changes } : item) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <AmountField label="Starting wealth (gp, optional)" value={plan.startingWealthCp} places={2} maximum={maxPriceCp} placeholder="Set your starting wealth" allowBlank onChange={(startingWealthCp) => onChange({ ...plan, startingWealthCp })} />
        <p className="text-sm text-muted-foreground">Enter the amount agreed for this character. One gp is 10 sp or 100 cp.</p>
      </div>
      <EquipmentTotals plan={plan} build={build} />
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Browse starter equipment</span>
          <select className={field} value={itemId} onChange={(event) => setItemId(event.currentTarget.value)}>
            <option value="">Choose an item</option>
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {catalog.filter((item) => item.group === group).map((item) => (
                  <option key={item.id} value={item.id}>{item.name} · {formatCoins(item.priceCp)}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {selected ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium">{formatCoins(selected.priceCp)} · {formatItemBulk(selected.bulkLight)}</p>
            {selected.details ? <p className="text-muted-foreground">{selected.details}</p> : null}
            <a className="text-primary underline underline-offset-2" href={`https://2e.aonprd.com/Search.aspx?q=${encodeURIComponent(selected.name)}`} target="_blank" rel="noreferrer">Find {selected.name} rules</a>
          </div>
        ) : null}
        <Button type="button" variant="outline" disabled={!selected || full} onClick={() => {
          if (selected) addItem(selected)
          setItemId('')
        }}>Add selected item</Button>
        <CustomItemForm onAdd={addItem} disabled={full} />
        {full ? <p className="text-sm text-muted-foreground">Remove a line to add more equipment.</p> : null}
      </div>
      {plan.items.length ? (
        <ul className="space-y-2">
          {plan.items.map((item) => (
            <li key={item.id} className="space-y-2 rounded-md border border-border p-3">
              <p className="font-medium wrap-anywhere">{item.name}</p>
              <p className="text-sm text-muted-foreground">{formatCoins(item.priceCp)} · {formatItemBulk(item.bulkLight)} per unit</p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-24 min-w-11">
                  <AmountField label="Quantity" value={item.quantity} places={0} minimum={1} maximum={maxQuantity} onChange={(quantity) => { if (quantity !== null) updateItem(item.id, { quantity }) }} />
                </div>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-primary" checked={item.carried} onChange={(event) => updateItem(item.id, { carried: event.currentTarget.checked })} />
                  Carried
                </label>
                <Button type="button" variant="ghost" aria-label={`Remove ${item.name}`} onClick={() => onChange({ ...plan, items: plan.items.filter(({ id }) => id !== item.id) })}>Remove</Button>
              </div>
              <details className="text-sm">
                <summary>Adjust price or Bulk</summary>
                <div className="grid grid-cols-2 gap-3">
                  <AmountField label="Unit price (gp)" value={item.priceCp} places={2} maximum={maxPriceCp} onChange={(priceCp) => { if (priceCp !== null) updateItem(item.id, { priceCp }) }} />
                  <AmountField label="Unit Bulk" value={item.bulkLight} places={1} maximum={maxBulkLight} onChange={(bulkLight) => { if (bulkLight !== null) updateItem(item.id, { bulkLight }) }} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : null}
      <details className="rounded-md border border-border p-3 text-sm">
        <summary className="font-medium">Equipment and Bulk rules</summary>
        <div className="space-y-2 text-muted-foreground">
          <p>Check your class for weapon and armor training. An armor’s Dexterity cap limits how much Dexterity adds to AC. Meeting its Strength requirement reduces its penalties. A shield’s AC bonus applies after you Raise a Shield.</p>
          <p>Ten light items count as 1 Bulk. Ignore leftover light items when comparing against your limits. Uncheck Carried for gear you leave behind. Its cost still counts.</p>
          <p>Armor and backpacks start with their worn Bulk. Adjust a line for different carrying conditions, item size, or container discounts. If you carry coins, add 1 Bulk per full 1,000 coins as custom gear with a price of 0 gp. Features that change your Bulk limits are handled separately at the table.</p>
          <a className="text-primary underline underline-offset-2" href="https://2e.aonprd.com/Rules.aspx?ID=2153" target="_blank" rel="noreferrer">Read the Player Core Bulk rules</a>
        </div>
      </details>
    </div>
  )
}
