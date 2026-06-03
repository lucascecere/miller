import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BayesAIn dark theme tokens
        'bq-bg-primary':    '#0B1426',
        'bq-bg-secondary':  '#111E36',
        'bq-bg-tertiary':   '#1A2847',
        'bq-text-primary':  '#F4EFE6',
        'bq-text-secondary':'#C9C2B5',
        'bq-text-muted':    '#8A8578',
        'bq-accent':        '#3B82F6',
        'bq-accent-violet': '#7C5CFF',
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'var(--font-fraunces)', 'Georgia', 'serif'],
        mono:  ['var(--font-jetbrains-mono)', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
