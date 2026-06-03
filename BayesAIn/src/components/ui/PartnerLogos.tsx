export function ProQuestLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="ProQuest" role="img">
      <rect width="200" height="80" fill="#1B6B76"/>
      <text x="100" y="48" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="600" letterSpacing="1">ProQuest</text>
    </svg>
  )
}

export function NasdaqLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Nasdaq" role="img">
      {/* N/ chevron mark */}
      <polyline points="8,50 8,14 24,36 38,14 38,50" fill="none" stroke="#0033A0" strokeWidth="5" strokeLinejoin="round"/>
      <line x1="8" y1="50" x2="24" y2="50" stroke="#0033A0" strokeWidth="5"/>
      <line x1="24" y1="36" x2="38" y2="36" stroke="#0033A0" strokeWidth="5"/>
      {/* Nasdaq text */}
      <text x="50" y="44" fill="#0033A0" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="700" letterSpacing="0.5">Nasdaq</text>
    </svg>
  )
}

export function MarketWatchLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 60" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="MarketWatch" role="img">
      <text x="0" y="44" fill="#1a1a1a" fontFamily="Georgia, serif" fontSize="30" fontWeight="800">Market</text>
      <text x="137" y="44" fill="#00A651" fontFamily="Georgia, serif" fontSize="30" fontWeight="500">Watch</text>
    </svg>
  )
}

export function MoneyShowLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 100" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="MoneyShow" role="img">
      <rect width="260" height="100" fill="#0D2F6E"/>
      <text x="130" y="52" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="800" letterSpacing="2">MONEYSHOW</text>
      <text x="130" y="72" textAnchor="middle" fill="#C0C8D8" fontFamily="Arial, sans-serif" fontSize="9" letterSpacing="1.5">INVEST SMARTER, TRADE WISER</text>
    </svg>
  )
}

export function ResearchGateLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="ResearchGate" role="img">
      <text x="0" y="44" fill="#00CBBA" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="600">ResearchGate</text>
    </svg>
  )
}

export function ElliottWaveLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 100" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Elliott Wave Trader" role="img">
      <rect width="260" height="100" fill="#1A4B9C"/>
      {/* "Elliott" text */}
      <text x="16" y="50" fill="white" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">Elliott</text>
      {/* W with wave effect — white base W then green wave path on top */}
      <text x="100" y="50" fill="white" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="900">W</text>
      {/* Green wave squiggle over the W */}
      <path d="M100,42 Q106,28 112,42 Q118,56 124,42" fill="none" stroke="#39D353" strokeWidth="3" strokeLinecap="round"/>
      {/* rest of name */}
      <text x="126" y="50" fill="white" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">ave</text>
      {/* TRADER line */}
      <text x="130" y="70" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" letterSpacing="4">TRADER®</text>
    </svg>
  )
}

export function SeekingAlphaLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 60" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Seeking Alpha" role="img">
      <text x="0" y="44" fill="#1a1a1a" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="400" letterSpacing="0.5">Seeking Alpha</text>
      {/* Orange alpha superscript */}
      <text x="212" y="28" fill="#E8820C" fontFamily="Georgia, serif" fontSize="20" fontStyle="italic" fontWeight="700">α</text>
    </svg>
  )
}

export function StockGumshoeLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Stock Gumshoe" role="img">
      {/* Magnifying glass */}
      <circle cx="22" cy="30" r="16" fill="none" stroke="#2D6B2D" strokeWidth="3"/>
      <text x="22" y="37" textAnchor="middle" fill="#2D6B2D" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="800">$</text>
      <line x1="34" y1="42" x2="44" y2="55" stroke="#2D6B2D" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Text */}
      <text x="52" y="28" fill="#1a1a1a" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">Stock</text>
      <text x="52" y="52" fill="#2D6B2D" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="600">Gumshoe</text>
    </svg>
  )
}

export function GreenBullLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Green Bull Research" role="img">
      {/* Bull icon (simplified) — upward trend with horns */}
      <path d="M12,55 Q8,38 14,32 Q10,22 18,24 Q22,18 28,22 Q36,20 40,28 Q46,30 42,38 L38,55 Z" fill="#2D8A3E" opacity="0.85"/>
      {/* Arrow up (chart) */}
      <polyline points="14,54 14,38 22,30 32,42 40,30 48,18" fill="none" stroke="#5ECA6A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Text */}
      <text x="56" y="36" fill="#2D8A3E" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="800" letterSpacing="1">GREEN BULL</text>
      <text x="56" y="58" fill="#4CAF5A" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="500" letterSpacing="2">RESEARCH</text>
    </svg>
  )
}

export function TalkMarketsLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="TalkMarkets" role="img">
      <rect width="260" height="80" fill="#151C2E"/>
      {/* Speech bubble icon */}
      <circle cx="34" cy="38" r="18" fill="none" stroke="#00BDB4" strokeWidth="2.5"/>
      <circle cx="18" cy="38" r="8" fill="none" stroke="#F4810A" strokeWidth="2"/>
      {/* TM letters in center */}
      <text x="34" y="43" textAnchor="middle" fill="#00BDB4" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="800">TM</text>
      {/* Name */}
      <text x="60" y="45" fill="#E8EAF0" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="600">TalkMarkets</text>
    </svg>
  )
}

export function EquitiesLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 70" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="EQUITIES.com" role="img">
      <text x="0" y="38" fill="#2C2C2C" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="800" letterSpacing="2">EQUITIES</text>
      <text x="148" y="38" fill="#E8820C" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="600">.com</text>
      <text x="0" y="56" fill="#8A8A8A" fontFamily="Arial, sans-serif" fontSize="9" letterSpacing="0.5">Impacting a New Era of Investing</text>
    </svg>
  )
}
