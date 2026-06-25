// Theme definitions for the live homepage preview variants.
// Each `styleVars` string is applied to <html> so every `lm-*` Tailwind
// utility (and the base-layer font rules) cascade to the variant's palette.
// We override BOTH the project's custom `--font-family-*` vars (used by the
// base layer) and Tailwind's default `--font-*` vars (used by the
// font-serif/font-sans/font-mono utilities) so fonts switch everywhere.

export interface VariantTheme {
  styleVars: string;
  fontHead?: string;
}

const vars = (o: Record<string, string>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');

// ── Ivory — warm light editorial / journal ──────────────────────────────
export const ivory: VariantTheme = {
  fontHead: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`,
  styleVars: vars({
    '--color-lm-bg': '#FBF8F1',
    '--color-lm-surface': '#FFFFFF',
    '--color-lm-text': '#1F1D18',
    '--color-lm-text-muted': '#494438',
    '--color-lm-accent': '#8A1C2B',
    '--color-lm-muted': '#8C8676',
    '--color-lm-border': '#E7DFCF',
    '--color-lm-cyan': '#8A1C2B',
    '--font-family-serif': "'Fraunces', Georgia, serif",
    '--font-serif': "'Fraunces', Georgia, serif",
    '--font-family-sans': "'Newsreader', Georgia, serif",
    '--font-sans': "'Newsreader', Georgia, serif",
    '--font-mono': "'Inter', system-ui, sans-serif",
  }),
};

// ── Spotlight — bold blue + gold thought-leader (Alex Edmans style) ──────
// Light content body. `lm-accent` = royal blue for content links/buttons;
// `lm-cyan` is repurposed as the gold used for the hero headline and CTAs.
export const spotlight: VariantTheme = {
  fontHead: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`,
  styleVars: vars({
    '--color-lm-bg': '#FFFFFF',
    '--color-lm-surface': '#F4F6FB',
    '--color-lm-text': '#16202E',
    '--color-lm-text-muted': '#465061',
    '--color-lm-accent': '#2F5FD9',
    '--color-lm-muted': '#8A93A3',
    '--color-lm-border': '#E2E7F0',
    '--color-lm-cyan': '#E0A93B',
    '--font-family-serif': "'Poppins', system-ui, sans-serif",
    '--font-serif': "'Poppins', system-ui, sans-serif",
    '--font-family-sans': "'Inter', system-ui, sans-serif",
    '--font-sans': "'Inter', system-ui, sans-serif",
    '--font-mono': "'Inter', system-ui, sans-serif",
  }),
};

// ── Quant — elevated dark (polished version of the current direction) ────
export const quant: VariantTheme = {
  styleVars: vars({
    '--color-lm-bg': '#07090E',
    '--color-lm-surface': '#0E1219',
    '--color-lm-text': '#ECEFF4',
    '--color-lm-text-muted': '#AAB3C2',
    '--color-lm-accent': '#22D3EE',
    '--color-lm-muted': '#6B7689',
    '--color-lm-border': '#19202E',
    '--color-lm-cyan': '#22D3EE',
  }),
};
