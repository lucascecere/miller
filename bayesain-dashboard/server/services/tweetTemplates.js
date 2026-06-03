const TEMPLATES = [
  (ticker, low, mode, high, price, iv) =>
    `$${ticker} PPL levels mapped by BayesAIn.\nSupport: $${low}\nMode: $${mode}\nResistance: $${high}\nIV at ${iv}% — compressed, breakout incoming.\nFollow for daily signals. 📊`,

  (ticker, low, mode, high, price, iv) =>
    `Running BayesAIn on $${ticker} right now.\nPPL range: $${low} — $${high}\nCurrent: $${price}\nIV: ${iv}%\nDrop your $${ticker} target below 👇 — let's compare notes.`,

  (ticker, low, mode, high, price, iv) =>
    `$${ticker} Bayesian update complete.\nMost probable path: $${mode}\nKey levels: $${low} | $${mode} | $${high}\nElliott Wave + Bayesian probability alignment = high-conviction setup.`,

  (ticker, low, mode, high, price, iv) =>
    `$${ticker} running hot.\nBayesAIn PPL range: $${low}–$${high}\nCurrent price: $${price}\nWhat's your read? Reply below.`
];

function generateTweetText(ticker, { pplLow, pplMode, pplHigh, price, ivCurrent }, templateIndex) {
  const idx = (templateIndex !== undefined && templateIndex !== null)
    ? templateIndex
    : (new Date().getDay() % 4);
  const iv = ((ivCurrent || 0.20) * 100).toFixed(1);
  return TEMPLATES[idx](ticker, pplLow.toFixed(2), pplMode.toFixed(2), pplHigh.toFixed(2), price.toFixed(2), iv);
}

module.exports = { generateTweetText, TEMPLATES };
