'use client'

import { useId } from 'react'

interface ArchLogoProps {
  className?: string
  size?: number
}

export function ArchLogo({ className = '', size = 28 }: ArchLogoProps) {
  const uid = useId().replace(/:/g, 'i')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="33%" r="55%">
          <stop offset="0%"   stopColor="#22D3EE" stopOpacity="0.45" />
          <stop offset="55%"  stopColor="#3B82F6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-orb`} cx="50%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="1" />
          <stop offset="22%"  stopColor="#A5F3FC"  stopOpacity="0.96" />
          <stop offset="52%"  stopColor="#22D3EE"  stopOpacity="0.88" />
          <stop offset="80%"  stopColor="#3B82F6"  stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1D4ED8"  stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow behind orb */}
      <circle cx="15" cy="10" r="11" fill={`url(#${uid}-bg)`} />

      {/* Arch 1 — outermost, most faint. Semicircle: chord=28, r=14, crown at y=6 */}
      <path
        d="M 1 30 L 1 20 A 14 14 0 0 1 29 20 L 29 30"
        stroke="#3B82F6"
        strokeWidth="1.1"
        strokeOpacity="0.22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arch 2 — chord=22, r=11, crown at y=9.5 */}
      <path
        d="M 4 30 L 4 20.5 A 11 11 0 0 1 26 20.5 L 26 30"
        stroke="#3B82F6"
        strokeWidth="1.1"
        strokeOpacity="0.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arch 3 — chord=16, r=8, crown at y=13 */}
      <path
        d="M 7 30 L 7 21 A 8 8 0 0 1 23 21 L 23 30"
        stroke="#60A5FA"
        strokeWidth="1.1"
        strokeOpacity="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arch 4 — chord=11, r=5.5, crown at y=16 */}
      <path
        d="M 9.5 30 L 9.5 21.5 A 5.5 5.5 0 0 1 20.5 21.5 L 20.5 30"
        stroke="#22D3EE"
        strokeWidth="1.1"
        strokeOpacity="0.78"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arch 5 — innermost, full cyan. chord=6, r=3, crown at y=19 */}
      <path
        d="M 12 30 L 12 22 A 3 3 0 0 1 18 22 L 18 30"
        stroke="#22D3EE"
        strokeWidth="1"
        strokeOpacity="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glowing orb — the dominant visual anchored at the tunnel's vanishing point */}
      <circle cx="15" cy="10" r="4.5" fill={`url(#${uid}-orb)`} />
      <circle cx="15" cy="10" r="2.2"  fill="#22D3EE" fillOpacity="0.75" />
      <circle cx="15" cy="10" r="1.1"  fill="white"   fillOpacity="0.95" />
    </svg>
  )
}
