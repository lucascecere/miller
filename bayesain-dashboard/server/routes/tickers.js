const express = require('express');
const router = express.Router();
const { sql } = require('../db/db');
const { fetchTickerData } = require('../services/priceData');
const { fetchBuzzScore } = require('../services/buzzData');
const { calculatePriority } = require('../services/priorityScorer');

router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { rows } = await sql`
      SELECT t.id, t.symbol, t.company_name, t.is_core,
             td.price, td.daily_change_pct, td.iv_current, td.iv_historical,
             td.buzz_score, td.priority_score, td.ppl_low, td.ppl_mode, td.ppl_high, td.sigma,
             p.status, p.tweet_text,
             c.chart_2d_path, c.chart_3d_path,
             p.posted_at as last_posted_at
      FROM tickers t
      LEFT JOIN ticker_data td ON t.symbol = td.symbol AND td.date = ${today}
      LEFT JOIN posts p ON t.symbol = p.symbol AND p.date = ${today}
      LEFT JOIN charts c ON t.symbol = c.symbol AND c.date = ${today}
      ORDER BY COALESCE(td.priority_score, 0) DESC
    `;

    const result = rows.map(row => {
      let daysSincePosted = null;
      if (row.last_posted_at) {
        const posted = new Date(row.last_posted_at);
        daysSincePosted = Math.floor((Date.now() - posted) / (1000 * 60 * 60 * 24));
      }
      return { ...row, days_since_posted: daysSincePosted };
    });

    res.json(result);
  } catch (err) {
    console.error('GET /tickers error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { rows: tickers } = await sql`SELECT * FROM tickers`;

  let refreshed = 0;
  const errors = [];

  for (const ticker of tickers) {
    try {
      const data = await fetchTickerData(ticker.symbol);
      const buzzScore = await fetchBuzzScore(ticker.symbol);

      const { rows: lastPosts } = await sql`
        SELECT posted_at FROM posts WHERE symbol = ${ticker.symbol} AND status = 'posted'
        ORDER BY posted_at DESC LIMIT 1
      `;

      let daysSincePosted = 7;
      if (lastPosts.length > 0 && lastPosts[0].posted_at) {
        daysSincePosted = Math.floor((Date.now() - new Date(lastPosts[0].posted_at)) / (1000 * 60 * 60 * 24));
      }

      const priorityScore = calculatePriority({
        buzzScore,
        ivCurrent: data.ivCurrent,
        ivHistorical: data.ivHistorical,
        dailyChangePct: data.dailyChangePct,
        isCore: ticker.is_core === 1,
        daysSincePosted
      });

      await sql`
        INSERT INTO ticker_data (symbol, date, price, daily_change_pct, iv_current, iv_historical, buzz_score, priority_score, ppl_low, ppl_mode, ppl_high, sigma)
        VALUES (${ticker.symbol}, ${today}, ${data.price}, ${data.dailyChangePct}, ${data.ivCurrent}, ${data.ivHistorical}, ${buzzScore}, ${priorityScore}, ${data.pplLow}, ${data.pplMode}, ${data.pplHigh}, ${data.sigma})
        ON CONFLICT (symbol, date) DO UPDATE SET
          price = EXCLUDED.price,
          daily_change_pct = EXCLUDED.daily_change_pct,
          iv_current = EXCLUDED.iv_current,
          iv_historical = EXCLUDED.iv_historical,
          buzz_score = EXCLUDED.buzz_score,
          priority_score = EXCLUDED.priority_score,
          ppl_low = EXCLUDED.ppl_low,
          ppl_mode = EXCLUDED.ppl_mode,
          ppl_high = EXCLUDED.ppl_high,
          sigma = EXCLUDED.sigma,
          updated_at = CURRENT_TIMESTAMP
      `;
      refreshed++;
    } catch (err) {
      console.error(`Refresh failed for ${ticker.symbol}:`, err.message);
      errors.push({ symbol: ticker.symbol, error: err.message });
    }
  }

  res.json({ refreshed, errors, timestamp: new Date().toISOString() });
});

module.exports = router;
