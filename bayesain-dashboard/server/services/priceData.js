const yahooFinance = require('yahoo-finance2').default;

async function fetchTickerData(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);
    const price = quote.regularMarketPrice || 0;
    const dailyChangePct = quote.regularMarketChangePercent || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    let sigma = 0.018;
    try {
      const hist = await yahooFinance.historical(symbol, {
        period1: sixMonthsAgo.toISOString().split('T')[0],
        interval: '1d'
      });
      if (hist.length > 10) {
        const closes = hist.map(d => d.close).filter(Boolean);
        const logReturns = [];
        for (let i = 1; i < closes.length; i++) {
          if (closes[i] > 0 && closes[i-1] > 0) {
            logReturns.push(Math.log(closes[i] / closes[i-1]));
          }
        }
        if (logReturns.length > 5) {
          const mean = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
          const variance = logReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (logReturns.length - 1);
          sigma = Math.sqrt(variance * 252);
        }
      }
    } catch (e) {
      console.warn(`Historical data unavailable for ${symbol}, using default sigma`);
    }

    const pplLow  = parseFloat((price * 0.93).toFixed(2));
    const pplMode = parseFloat(price.toFixed(2));
    const pplHigh = parseFloat((price * 1.07).toFixed(2));
    const ivCurrent    = quote.impliedVolatility || sigma || 0.20;
    const ivHistorical = sigma || 0.20;

    return { price, dailyChangePct, sigma, pplLow, pplMode, pplHigh, ivCurrent, ivHistorical };
  } catch (err) {
    console.error(`fetchTickerData failed for ${symbol}:`, err.message);
    throw err;
  }
}

module.exports = { fetchTickerData };
