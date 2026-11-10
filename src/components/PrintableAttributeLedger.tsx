import { calculate } from '@/attributes/build'
import type { Build } from '@/attributes/build'
import { attributes } from '@/attributes/options'
import { buildSelections } from '@/attributes/ledger'

export function PrintableAttributeLedger({ build }: { build: Build }) {
  const { rows, remaining } = calculate(build)

  return (
    <article className="print-attribute-ledger hidden bg-white text-black print:block">
      <p className="mb-1 text-sm">The Masque of Shattered Mirrors</p>
      <h1 className="mb-4 text-3xl">Level {build.level} attribute ledger</h1>
      <dl className="mb-4 grid grid-cols-3 gap-4">
        {buildSelections(build).map(({ label, name }) => (
          <div key={label}><dt className="font-semibold">{label}</dt><dd>{name}</dd></div>
        ))}
      </dl>
      <table className="w-full border-collapse text-left text-sm tabular-nums">
        <caption className="mb-2 text-left">Attribute modifiers and contributions</caption>
        <thead>
          <tr className="border-y border-black">
            <th scope="col" className="py-2 pr-2">Attribute</th>
            <th scope="col" className="px-2">Ancestry</th>
            <th scope="col" className="px-2">Background</th>
            <th scope="col" className="px-2">Class</th>
            <th scope="col" className="px-2">Level 1 free</th>
            <th scope="col" className="px-2">Later levels</th>
            <th scope="col" className="pl-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, ancestry, background, classBoost, free, advancement, total, partial }) => (
            <tr key={id} className="border-b border-gray-400">
              <th scope="row" className="py-2 pr-2 font-medium">{attributes[id]}</th>
              {[ancestry, background, classBoost, free, advancement].map((value, index) => (
                <td key={index} className="px-2">{value > 0 ? '+' : ''}{value}</td>
              ))}
              <td className="pl-2 font-semibold">{total > 0 ? '+' : ''}{total}{partial ? ' (partial)' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {remaining > 0 ? <p className="mt-4">Draft with {remaining} unassigned {remaining === 1 ? 'boost' : 'boosts'}.</p> : null}
    </article>
  )
}
