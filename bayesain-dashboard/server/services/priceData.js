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

    // Fetch 6-month historical to compute sigma
    let sigma = 0.018;
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
            sigma = Math.sqrt(variance * 252);
          }
        }
      }
    } catch (e) {
      console.warn(`Historical data unavailable for ${symbol}, using default sigma`);
    }

    const pplLow  = parseFloat((price * 0.93).toFixed(2));
    const pplMode = parseFloat(price.toFixed(2));
    const pplHigh = parseFloat((price * 1.07).toFixed(2));
    const ivCurrent    = sigma || 0.20;
    const ivHistorical = sigma || 0.20;

    return { price, dailyChangePct, sigma, pplLow, pplMode, pplHigh, ivCurrent, ivHistorical };
  } catch (err) {
    console.error(`fetchTickerData failed for ${symbol}:`, err.message);
    throw err;
  }
}

module.exports = { fetchTickerData };
