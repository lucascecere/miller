const publications = [
  'Development of a Bayesian Real Options Framework: And Its Application to Capital Budgeting Problems',
  'Bayesian Learning and Real Options: Valuing Strategic Investments',
  'Real Options Analysis: A New Standard for Decision-Making Under Uncertainty',
  'Using Risk-Adjusted Interest Rates in Option Pricing',
  'Bridging Decision Analysis and Real Options for Practical Valuation',
]

export function PublicationsList() {
  return (
    <div>
      <ol className="space-y-4 mb-6">
        {publications.map((title, i) => (
          <li key={i} className="flex gap-4">
            <span className="font-mono text-xs text-lm-muted mt-1 flex-shrink-0 w-5">{i + 1}.</span>
            <p className="font-serif text-lm-cream-muted leading-relaxed italic">&ldquo;{title}&rdquo;</p>
          </li>
        ))}
      </ol>
      <p className="text-sm text-lm-muted border-l-2 border-lm-border pl-4">
        Additional peer-reviewed publications available on request. Best Presentation Award, 18th International Conference on Business &amp; Finance, Paris (2016).
      </p>
    </div>
  )
}
