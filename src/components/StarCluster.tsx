type StarClusterProps = {
  className?: string
}

const stars = [
  { cx: 42, cy: 38, r: 1.1, delay: '0s', dur: '4.2s' },
  { cx: 78, cy: 52, r: 1.6, delay: '0.4s', dur: '5.1s' },
  { cx: 118, cy: 28, r: 1.2, delay: '1.1s', dur: '3.8s' },
  { cx: 156, cy: 64, r: 2.1, delay: '0.2s', dur: '4.8s' },
  { cx: 188, cy: 36, r: 1.0, delay: '1.6s', dur: '5.4s' },
  { cx: 54, cy: 96, r: 1.4, delay: '0.8s', dur: '4.5s' },
  { cx: 96, cy: 88, r: 2.4, delay: '0.1s', dur: '5.8s' },
  { cx: 138, cy: 112, r: 1.3, delay: '1.3s', dur: '4.1s' },
  { cx: 176, cy: 98, r: 1.7, delay: '0.6s', dur: '5.2s' },
  { cx: 210, cy: 78, r: 1.1, delay: '1.9s', dur: '3.9s' },
  { cx: 68, cy: 148, r: 1.5, delay: '0.3s', dur: '4.7s' },
  { cx: 112, cy: 152, r: 1.2, delay: '1.4s', dur: '5.6s' },
  { cx: 152, cy: 168, r: 2.0, delay: '0.9s', dur: '4.3s' },
  { cx: 194, cy: 142, r: 1.3, delay: '1.7s', dur: '5.0s' },
  { cx: 34, cy: 172, r: 1.0, delay: '2.1s', dur: '4.4s' },
  { cx: 88, cy: 198, r: 1.6, delay: '0.5s', dur: '5.3s' },
  { cx: 134, cy: 206, r: 1.1, delay: '1.2s', dur: '3.7s' },
  { cx: 178, cy: 192, r: 1.8, delay: '0.7s', dur: '4.9s' },
  { cx: 216, cy: 168, r: 1.2, delay: '1.5s', dur: '5.5s' },
  { cx: 58, cy: 218, r: 1.4, delay: '2.0s', dur: '4.0s' },
  { cx: 164, cy: 48, r: 0.9, delay: '2.3s', dur: '4.6s' },
  { cx: 28, cy: 118, r: 1.0, delay: '1.0s', dur: '5.7s' },
  { cx: 204, cy: 118, r: 1.5, delay: '0.15s', dur: '4.2s' },
] as const

/** Soft night-sky cluster for background atmosphere. */
export function StarCluster({ className }: StarClusterProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      {stars.map((star) => (
        <circle
          key={`${star.cx}-${star.cy}`}
          cx={star.cx}
          cy={star.cy}
          r={star.r}
          className="star-twinkle"
          style={{
            animationDelay: star.delay,
            animationDuration: star.dur,
          }}
        />
      ))}
      {/* A few larger cross-flare stars for depth */}
      <g className="star-twinkle" style={{ animationDelay: '0.3s', animationDuration: '5.2s' }}>
        <path
          d="M96 72v12M90 78h12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>
      <g className="star-twinkle" style={{ animationDelay: '1.8s', animationDuration: '4.6s' }}>
        <path
          d="M168 128v10M163 133h10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>
      <g className="star-twinkle" style={{ animationDelay: '0.9s', animationDuration: '5.5s' }}>
        <path
          d="M48 160v9M44 164.5h8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </svg>
  )
}
