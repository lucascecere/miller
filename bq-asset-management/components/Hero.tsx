'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const slides = [
  { src: '/nh-white-mountains.jpg', alt: 'White Mountains, New Hampshire' },
  { src: '/nh-wildcat-mountain.jpg', alt: 'Wildcat Mountain, White Mountains NH' },
  { src: '/nh-ski-slope.jpg', alt: 'New Hampshire ski slopes in winter' },
  { src: '/nh-wildflowers.jpg', alt: 'New Hampshire wildflowers' },
  { src: '/nh-mountain-valley.jpg', alt: 'New Hampshire mountain valley' },
  { src: '/nh-lake-winnipesaukee.jpg', alt: 'Summit view over Lake Winnipesaukee, NH' },
]

export function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section aria-label="Hero" className="relative flex items-center overflow-hidden" style={{ minHeight: '88vh' }}>

      {/* Background slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay — charcoal tint for legibility */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(26,31,43,0.70)' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-28 lg:py-36 w-full">
        <p className="eyebrow mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>BQ ASSET MANAGEMENT</p>
        <h1
          className="font-serif leading-[1.08] tracking-tight text-balance text-white"
          style={{ fontSize: 'clamp(40px, 5vw, 64px)', maxWidth: '14ch' }}
        >
          Wealth management for those who&apos;ve earned theirs.
        </h1>
        <p className="font-sans text-lg leading-relaxed mt-6 max-w-lg" style={{ color: 'rgba(255,255,255,0.72)' }}>
          A Registered Investment Adviser providing fiduciary wealth management to high-net-worth individuals, families, and institutions.
        </p>
        <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
          <a
            href="#contact"
            className="inline-flex items-center justify-center text-sm font-semibold tracking-wide rounded-sm px-8 py-4 transition-colors"
            style={{ backgroundColor: '#FAFAF7', color: '#1E3A5F' }}
          >
            Schedule a Consultation
          </a>
          <a
            href="#approach"
            className="inline-flex items-center py-4 text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            Learn about our approach →
          </a>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center gap-2 mt-14">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`View photo ${i + 1}`}
              className="transition-all duration-300"
              style={{
                height: '2px',
                width: i === current ? '28px' : '12px',
                backgroundColor: i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
