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
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 28"
      width={40}
      height={28}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
    >
      {!decorative ? <title>Masquerade mask</title> : null}
      <path
        d="M3 14.5c0-5.4 5.4-9.7 12.2-9.7h9.6C31.6 4.8 37 9.1 37 14.5c0 1.7-.5 3.2-1.4 4.4-.5.7-.6 1.6-.3 2.4.3 1-.3 1.9-1.3 2-1.8.2-3.4-.7-4.4-2-.6-.7-1.5-1.1-2.4-1.1h-6.4c-.9 0-1.8.4-2.4 1.1-1 1.3-2.6 2.2-4.4 2-1-.1-1.6-1-1.3-2 .3-.8.2-1.7-.3-2.4C3.5 17.7 3 16.2 3 14.5Z"
        fill="currentColor"
      />
      <ellipse cx="13.2" cy="13.8" rx="3.2" ry="2.3" fill="var(--background)" />
      <ellipse cx="26.8" cy="13.8" rx="3.2" ry="2.3" fill="var(--background)" />
      <path
        d="M8.5 10.2c1.8-1.3 3.9-2 6.2-2M31.5 10.2c-1.8-1.3-3.9-2-6.2-2"
        fill="none"
        stroke="var(--pharasma-bone, #f2efe8)"
        strokeOpacity="0.5"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
