import { invitationParagraphs } from '@/content/invitation'

export function InvitationLetter() {
  return (
    <article className="invitation-letter veil-in-delay relative mx-auto w-full max-w-2xl overflow-hidden rounded-sm">
      <div
        aria-hidden="true"
        className="invitation-letter-ribbon absolute inset-x-0 top-0 h-1.5"
      />
      <div className="relative px-6 pb-8 pt-7 sm:px-9 sm:pb-10 sm:pt-9">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="invitation-letter-meta text-[0.65rem] font-medium uppercase tracking-[0.22em]">
              House Verathe
            </p>
            <h2 className="font-heading text-2xl leading-none tracking-tight text-[color:var(--letter-ink)] sm:text-3xl">
              The letter
            </h2>
          </div>
          <div
            aria-hidden="true"
            className="invitation-letter-seal mt-1 size-11 shrink-0 rounded-full"
            title="Black wax seal"
          />
        </div>

        <div className="space-y-4">
          {invitationParagraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="font-heading text-[1.05rem] leading-[1.65] text-[color:var(--letter-ink)] sm:text-lg sm:leading-[1.7]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  )
}
