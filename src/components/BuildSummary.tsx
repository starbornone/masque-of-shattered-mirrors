import type { Build } from '@/attributes/build'
import { buildSelections } from '@/attributes/ledger'
import { AttributeLedger } from '@/components/BuildBoosts'

export function BuildSummary({ build }: { build: Build }) {
  return (
    <div className="space-y-4">
      <dl className="grid gap-3 sm:grid-cols-3">
        {buildSelections(build).map(({ label, name }) => (
          <div key={label}><dt className="font-medium text-primary">{label}</dt><dd>{name}</dd></div>
        ))}
      </dl>
      <AttributeLedger build={build} />
    </div>
  )
}
