async function fetchTickerData(symbol) {
  try {
    // Fetch current quote
    const quoteRes = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!quoteRes.ok) throw new Error(`Yahoo quote HTTP ${quoteRes.status}`);
    const quoteJson = await quoteRes.json();
    const meta = quoteJson?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error(`No quote data for ${symbol}`);

    const price = meta.regularMarketPrice || 0;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const dailyChangePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

    // Compute historical annualized volatility from 6-month daily returns
    let sigma = 0.20; // default 20% annual vol
    try {
      const histRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (histRes.ok) {
        const histJson = await histRes.json();
        const closes = histJson?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(Boolean);
        if (closes && closes.length > 10) {
          const logReturns = [];
          for (let i = 1; i < closes.length; i++) {
            if (closes[i] > 0 && closes[i - 1] > 0) {
              logReturns.push(Math.log(closes[i] / closes[i - 1]));
            }
          }
          if (logReturns.length > 5) {
            const mean = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
            const variance = logReturns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / (logReturns.length - 1);
            sigma = Math.sqrt(variance * 252); // annualized vol
          }
        }
      }
    } catch (e) {
      console.warn(`Historical data unavailable for ${symbol}, using default sigma`);
    }

    // Try to get implied volatility from nearest-expiry ATM options
    let ivCurrent = sigma;
    try {
      const optRes = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (optRes.ok) {
        const optJson = await optRes.json();
        const calls = optJson?.optionChain?.result?.[0]?.options?.[0]?.calls || [];
        const puts  = optJson?.optionChain?.result?.[0]?.options?.[0]?.puts  || [];

        // Find ATM call and put (nearest strike to current price)
        const findATM = (chain) => chain.reduce((best, opt) => {
          if (!best) return opt;
          return Math.abs(opt.strike - price) < Math.abs(best.strike - price) ? opt : best;
        }, null);

        const atmCall = findATM(calls);
        const atmPut  = findATM(puts);
        const ivs = [atmCall?.impliedVolatility, atmPut?.impliedVolatility].filter(Boolean);
        if (ivs.length > 0) {
          ivCurrent = ivs.reduce((a, b) => a + b, 0) / ivs.length;
        }
      }
    } catch (e) {
      console.warn(`Options IV unavailable for ${symbol}, using historical vol`);
    }

    // sigma = IV / sqrt(252) — daily volatility, matches Luke's spreadsheet formula
    const annualIV = ivCurrent || sigma;
    const dailySigma = parseFloat((annualIV / Math.sqrt(252)).toFixed(6));

    // PPL display levels match what the HTML's syncTri() computes: S₀ × 0.93 / 1.0 / 1.07
    // The HTML handles this automatically — we store matching values for card display only
    const pplLow  = parseFloat((price * 0.93).toFixed(2));
    const pplMode = parseFloat(price.toFixed(2));
    const pplHigh = parseFloat((price * 1.07).toFixed(2));

    return { price, dailyChangePct, sigma: dailySigma, pplLow, pplMode, pplHigh, ivCurrent: annualIV, ivHistorical: sigma };
  } catch (err) {
    console.error(`fetchTickerData failed for ${symbol}:`, err.message);
    throw err;
  }
}

module.exports = { fetchTickerData };
