type MasqueradeMaskProps = {
  className?: string
  decorative?: boolean
}

/** Brand mark — Venetian-style masquerade mask. */
export function MasqueradeMask({
  className,
  decorative = true,
}: MasqueradeMaskProps) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
    >
      {!decorative ? <title>Masquerade mask</title> : null}
      <path
        d="M1.5 16c0-7.2 7-13.2 16.2-13.2h12.6C39.5 2.8 46.5 8.8 46.5 16c0 2.1-.6 4-1.8 5.4-.7.9-.9 2.1-.5 3.2.5 1.4-.4 2.7-1.8 2.8-2.3.3-4.5-.9-5.9-2.6-.8-.9-1.9-1.4-3.1-1.4H14.6c-1.2 0-2.3.5-3.1 1.4-1.4 1.7-3.6 2.9-5.9 2.6-1.4-.1-2.3-1.4-1.8-2.8.4-1.1.2-2.3-.5-3.2C2.1 20 1.5 18.1 1.5 16Z"
        fill="currentColor"
      />
      <ellipse cx="14" cy="15.2" rx="4.4" ry="3.1" fill="var(--background)" />
      <ellipse cx="34" cy="15.2" rx="4.4" ry="3.1" fill="var(--background)" />
      <path
        d="M7.2 10.8c2.6-2.2 5.8-3.4 9.4-3.4M40.8 10.8c-2.6-2.2-5.8-3.4-9.4-3.4"
        fill="none"
        stroke="var(--pharasma-bone, #f2efe8)"
        strokeOpacity="0.55"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M24 4.2v3.2M22.2 5.6h3.6"
        fill="none"
        stroke="var(--pharasma-bone, #f2efe8)"
        strokeOpacity="0.45"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}
