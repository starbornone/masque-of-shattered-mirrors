type SpiralingCometProps = {
  className?: string
  decorative?: boolean
}

/** Pharasma's holy symbol — a spiraling comet (soul's winding path). */
export function SpiralingComet({
  className,
  decorative = true,
}: SpiralingCometProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
    >
      {!decorative ? <title>Spiraling comet of Pharasma</title> : null}
      <defs>
        <linearGradient id="comet-tail" x1="18" y1="78" x2="72" y2="22">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="45%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d="M18 78c8-6 14-14 18-24 4-10 10-18 20-22 8-3 16-2 22 2"
        fill="none"
        stroke="url(#comet-tail)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M34 62c5-4 9-10 11-17 3-8 8-14 15-16"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="72" cy="24" r="7" className="comet-pulse" fill="currentColor" />
      <circle cx="72" cy="24" r="3.2" fill="var(--pharasma-bone, #f4f1ea)" />
    </svg>
  )
}
