import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Luke Miller, PhD — Bayesian Decision Systems'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#06080F',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top accent line */}
        <div style={{ width: 60, height: 3, background: '#3B82F6', marginBottom: 40 }} />

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#F4EFE6',
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 32,
          }}
        >
          Luke Miller, PhD
        </div>

        {/* Subhead */}
        <div
          style={{
            fontSize: 28,
            color: '#C9C2B5',
            lineHeight: 1.4,
            maxWidth: 800,
            marginBottom: 48,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Associate Professor · Bayesian timing analyst.{'\n'}
          Trading the system since 2007.
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 20,
            color: '#3B82F6',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: 1,
          }}
        >
          lukemillerphd.org
        </div>
      </div>
    ),
    { ...size }
  )
}
