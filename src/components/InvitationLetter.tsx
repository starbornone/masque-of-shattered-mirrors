import { invitationParagraphs } from '@/content/invitation'

export function InvitationLetter() {
  return (
    <article className="invitation-letter veil-in-delay relative mx-auto w-full max-w-2xl overflow-hidden rounded-sm">
      <div
        aria-hidden="true"
        className="invitation-letter-ribbon absolute inset-x-0 top-0 h-1.5"
      />
      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <div className="invitation-letter-heading mb-5 flex items-center justify-between gap-4 pb-4">
          <div>
            <p className="invitation-letter-meta text-[0.65rem] font-medium uppercase tracking-[0.22em]">
              House Verathe
            </p>
            <h3 className="mt-1 font-heading text-3xl leading-none text-[color:var(--letter-ink)] sm:text-4xl">
              The letter
            </h3>
          </div>
          <div aria-hidden="true" className="invitation-letter-seal grid size-12 shrink-0 place-items-center sm:size-14">
            <svg className="size-7 sm:size-8" viewBox="0 0 32 32" fill="none">
              <ellipse cx="16" cy="16" rx="10" ry="12" stroke="currentColor" />
              <path d="m19 5-4 7 4 3-4 6 2 7m2-13 6-2" stroke="currentColor" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="invitation-letter-copy space-y-4">
          {invitationParagraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="font-heading text-lg leading-[1.6] text-[color:var(--letter-ink)] sm:text-xl sm:leading-[1.55]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  )
}
