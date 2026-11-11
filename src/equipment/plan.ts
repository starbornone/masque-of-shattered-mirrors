import { calculate } from '../attributes/build.ts'
import type { Build } from '../attributes/build.ts'

export const maxEquipmentRows = 100
export const maxQuantity = 999
export const maxPriceCp = 100_000_000
export const maxBulkLight = 100_000

export type EquipmentItem = {
  id: string
  name: string
  priceCp: number
  bulkLight: number
  quantity: number
  carried: boolean
}

export type EquipmentPlan = {
  startingWealthCp: number | null
  items: EquipmentItem[]
}

export const emptyEquipmentPlan: EquipmentPlan = { startingWealthCp: null, items: [] }

function boundedInteger(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseEquipmentPlan(value: unknown): EquipmentPlan | null {
  if (!isRecord(value) || Object.keys(value).length !== 2) return null
  const { startingWealthCp, items } = value
  if (startingWealthCp !== null && !boundedInteger(startingWealthCp, 0, maxPriceCp)) return null
  if (!Array.isArray(items) || items.length > maxEquipmentRows) return null

  const ids = new Set<string>()
  const parsed: EquipmentItem[] = []
  for (const row of items) {
    if (!isRecord(row) || Object.keys(row).length !== 6) return null
    const { id, name, priceCp, bulkLight, quantity, carried } = row
    if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(id) || ids.has(id)) return null
    if (typeof name !== 'string' || !name.trim() || name.length > 120) return null
    if (!boundedInteger(priceCp, 0, maxPriceCp) || !boundedInteger(bulkLight, 0, maxBulkLight)) return null
    if (!boundedInteger(quantity, 1, maxQuantity) || typeof carried !== 'boolean') return null
    ids.add(id)
    parsed.push({ id, name, priceCp, bulkLight, quantity, carried })
  }
  return { startingWealthCp, items: parsed }
}

export function equipmentTotals(plan: EquipmentPlan, build: Build) {
  const ledger = calculate(build)
  const strength = ledger.rows.find(({ id }) => id === 'str')?.total ?? 0
  let costCp = 0
  let carriedLight = 0
  for (const item of plan.items) {
    costCp += item.priceCp * item.quantity
    if (item.carried) carriedLight += item.bulkLight * item.quantity
  }
  const bulk = Math.floor(carriedLight / 10)
  const encumbranceLimit = 5 + strength
  const carryingLimit = 10 + strength
  return {
    costCp,
    balanceCp: plan.startingWealthCp === null ? null : plan.startingWealthCp - costCp,
    bulk,
    leftoverLight: carriedLight % 10,
    encumbranceLimit,
    carryingLimit,
    encumbered: bulk > encumbranceLimit,
    overCapacity: bulk > carryingLimit,
    provisional: ledger.remaining > 0,
  }
}

export function formatCoins(cp: number) {
  const gp = Math.floor(cp / 100)
  const sp = Math.floor(cp % 100 / 10)
  const copper = cp % 10
  const parts = []
  if (gp) parts.push(`${gp} gp`)
  if (sp) parts.push(`${sp} sp`)
  if (copper) parts.push(`${copper} cp`)
  return parts.join(' ') || '0 gp'
}

export function formatItemBulk(light: number) {
  if (light === 0) return 'Negligible Bulk'
  if (light === 1) return 'Light Bulk'
  return `${light / 10} Bulk`
}

// Parse fractional gp and Bulk into integer copper and light units before summing.
export function parseEquipmentAmount(text: string, decimalPlaces: 0 | 1 | 2, maximum: number): number | null {
  const match = /^(\d+)(?:\.(\d*))?$/.exec(text.trim().replace(/^\.(?=\d)/, '0.'))
  if (!match || (decimalPlaces === 0 && match[2] !== undefined)) return null
  const fraction = match[2] ?? ''
  if (fraction.length > decimalPlaces) return null
  const value = Number(match[1]) * 10 ** decimalPlaces + Number(fraction.padEnd(decimalPlaces, '0'))
  return boundedInteger(value, 0, maximum) ? value : null
}
