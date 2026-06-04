function generateTweetText(ticker, { price, pplLow, pplMode, pplHigh, upPct, ivCurrent }, idx) {
  const i = idx !== undefined && idx !== null ? idx : (new Date().getDay() % 4);
  const low = (pplLow || 0).toFixed(2);
  const mode = (pplMode || 0).toFixed(2);
  const high = (pplHigh || 0).toFixed(2);

  switch (i) {
    case 0:
      return `Something is setting up in $${ticker}.

Our AI mapped 120 price paths. Most of them converge around $${high}.

We'll check back in 5 days. Follow to watch it play out. 🤖

#${ticker} #BayesAIn`;

    case 1:
      return `$${ticker} has a magnetic level at $${high}.

This is where our Bayesian AI says the market is most likely to react — either bounce or break.

We don't predict. We identify probability zones.

Current price: $${mode} | Target zone: $${high}`;

    case 2:
      return `Watching $${ticker} closely today.

BayesAIn sees a high-probability zone between $${low} and $${high}.

Price is at $${mode} right now.

If it moves — up OR down — we'll post the result. That's how you build trust in public.`;

    case 3:
      return `Quick poll for traders:

Where does $${ticker} go from $${mode}?

⬆️ Toward $${high}
⬇️ Toward $${low}

BayesAIn says ${upPct ?? 50}% probability up.

Reply with your read. 👇`;

    default:
      return `Something is setting up in $${ticker}.

Our AI mapped 120 price paths. Most of them converge around $${high}.

We'll check back in 5 days. Follow to watch it play out. 🤖

#${ticker} #BayesAIn`;
  }
}

function generateResultTweet(ticker, { postDate, calledLevel, actualPrice, days, direction }) {
  const verb = direction === 'HIGH' ? 'hit' : 'tested';
  return `On ${postDate}, we posted that $${ticker} had a key level at $${calledLevel}.

Today it ${verb} $${actualPrice}.

BayesAIn called it ${days} day${days !== 1 ? 's' : ''} in advance.

This is what Bayesian probability looks like in practice. 📊

#${ticker} #BayesAIn`;
}

module.exports = { generateTweetText, generateResultTweet };
