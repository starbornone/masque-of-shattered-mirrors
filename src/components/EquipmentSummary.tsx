import type { Build } from '@/attributes/build'
import { equipmentTotals, formatCoins } from '@/equipment/plan'
import type { EquipmentPlan } from '@/equipment/plan'

export function EquipmentTotals({ plan, build }: { plan: EquipmentPlan; build: Build }) {
  const totals = equipmentTotals(plan, build)
  const { balanceCp, costCp, bulk, leftoverLight, encumbranceLimit, carryingLimit } = totals
  return (
    <div className="space-y-2 rounded-md border border-border p-3" aria-live="polite">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Gear cost</dt>
          <dd className="font-semibold">{formatCoins(costCp)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">{balanceCp !== null && balanceCp < 0 ? 'Over budget' : 'Wealth remaining'}</dt>
          <dd className="font-semibold">{balanceCp === null ? 'Budget unset' : formatCoins(Math.abs(balanceCp))}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Carried Bulk</dt>
          <dd className="font-semibold">{bulk}{leftoverLight > 0 ? ` + ${leftoverLight} light` : ''}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">
        With your current Strength, carry up to {encumbranceLimit} Bulk without penalty. Maximum {carryingLimit} Bulk.
        {totals.provisional ? ' Limits may change as you assign boosts.' : ''}
      </p>
      {totals.overCapacity ? (
        <p className="text-sm font-medium text-primary">This load exceeds your carrying limit.</p>
      ) : totals.encumbered ? (
        <p className="text-sm font-medium text-primary">This load makes you encumbered. You become clumsy 1 and your Speeds drop by 10 feet, to a minimum of 5 feet.</p>
      ) : null}
    </div>
  )
}

export function EquipmentSummary({ plan, build }: { plan?: EquipmentPlan; build: Build }) {
  if (!plan || (!plan.items.length && plan.startingWealthCp === null)) return null
  return (
    <section className="space-y-2">
      <h3 className="text-xl">Starting equipment</h3>
      {plan.startingWealthCp !== null ? <p>Starting wealth {formatCoins(plan.startingWealthCp)}</p> : null}
      <EquipmentTotals plan={plan} build={build} />
      {plan.items.length ? (
        <ul className="space-y-1">
          {plan.items.map((item) => (
            <li key={item.id} className="wrap-anywhere">
              {item.quantity} × {item.name}{item.carried ? '' : ' (left behind)'}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
