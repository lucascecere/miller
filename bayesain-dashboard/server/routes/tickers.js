const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { fetchTickerData } = require('../services/priceData');
const { fetchBuzzScore } = require('../services/buzzData');
const { calculatePriority } = require('../services/priorityScorer');

router.get('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT t.id, t.symbol, t.company_name, t.is_core,
           td.price, td.daily_change_pct, td.iv_current, td.iv_historical,
           td.buzz_score, td.priority_score, td.ppl_low, td.ppl_mode, td.ppl_high, td.sigma,
           p.status, p.tweet_text,
           c.chart_2d_path, c.chart_3d_path,
           p.posted_at as last_posted_at
    FROM tickers t
    LEFT JOIN ticker_data td ON t.symbol = td.symbol AND td.date = ?
    LEFT JOIN posts p ON t.symbol = p.symbol AND p.date = ?
    LEFT JOIN charts c ON t.symbol = c.symbol AND c.date = ?
    ORDER BY COALESCE(td.priority_score, 0) DESC
  `).all(today, today, today);

  const result = rows.map(row => {
    let daysSincePosted = null;
    if (row.last_posted_at) {
      const posted = new Date(row.last_posted_at);
      daysSincePosted = Math.floor((Date.now() - posted) / (1000 * 60 * 60 * 24));
    }
    return { ...row, days_since_posted: daysSincePosted };
  });

  res.json(result);
});

router.post('/refresh', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const tickers = db.prepare('SELECT * FROM tickers').all();

  let refreshed = 0;
  const errors = [];

  for (const ticker of tickers) {
    try {
      const data = await fetchTickerData(ticker.symbol);
      const buzzScore = await fetchBuzzScore(ticker.symbol);

      const lastPost = db.prepare(
        `SELECT posted_at FROM posts WHERE symbol = ? AND status = 'posted' ORDER BY posted_at DESC LIMIT 1`
      ).get(ticker.symbol);

      let daysSincePosted = 7;
      if (lastPost && lastPost.posted_at) {
        daysSincePosted = Math.floor((Date.now() - new Date(lastPost.posted_at)) / (1000 * 60 * 60 * 24));
      }

      const priorityScore = calculatePriority({
        buzzScore,
        ivCurrent: data.ivCurrent,
        ivHistorical: data.ivHistorical,
        dailyChangePct: data.dailyChangePct,
        isCore: ticker.is_core === 1,
        daysSincePosted
      });

      db.prepare(`
        INSERT INTO ticker_data (symbol, date, price, daily_change_pct, iv_current, iv_historical, buzz_score, priority_score, ppl_low, ppl_mode, ppl_high, sigma)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(symbol, date) DO UPDATE SET
          price=excluded.price, daily_change_pct=excluded.daily_change_pct,
          iv_current=excluded.iv_current, iv_historical=excluded.iv_historical,
          buzz_score=excluded.buzz_score, priority_score=excluded.priority_score,
          ppl_low=excluded.ppl_low, ppl_mode=excluded.ppl_mode, ppl_high=excluded.ppl_high,
          sigma=excluded.sigma, updated_at=CURRENT_TIMESTAMP
      `).run(ticker.symbol, today, data.price, data.dailyChangePct, data.ivCurrent, data.ivHistorical, buzzScore, priorityScore, data.pplLow, data.pplMode, data.pplHigh, data.sigma);

      refreshed++;
    } catch (err) {
      console.error(`Refresh failed for ${ticker.symbol}:`, err.message);
      errors.push({ symbol: ticker.symbol, error: err.message });
    }
  }

  res.json({ refreshed, errors, timestamp: new Date().toISOString() });
});

module.exports = router;
