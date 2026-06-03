const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { generateChart } = require('../services/chartGenerator');

router.post('/generate/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const tickerData = db.prepare('SELECT * FROM ticker_data WHERE symbol = ? AND date = ?').get(symbol, today);
  if (!tickerData) {
    return res.status(400).json({ error: `No price data for ${symbol} today. Run Refresh Prices first.` });
  }

  try {
    const result = await generateChart({
      ticker: symbol,
      s0: tickerData.price,
      sigma: tickerData.sigma || 0.018,
      low: tickerData.ppl_low,
      mode: tickerData.ppl_mode,
      high: tickerData.ppl_high
    });

    const info = db.prepare(`
      INSERT INTO charts (symbol, date, chart_2d_path, chart_3d_path, sigma)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT DO NOTHING
    `).run(symbol, today, result.path2d, result.path3d, tickerData.sigma);

    const chartId = info.lastInsertRowid;

    db.prepare(`
      UPDATE posts SET status = 'chart_ready', chart_id = ?
      WHERE symbol = ? AND date = ? AND status = 'draft'
    `).run(chartId, symbol, today);

    res.json({ symbol, path2d: result.path2d, path3d: result.path3d, generatedAt: result.generatedAt });
  } catch (err) {
    console.error(`Chart generation failed for ${symbol}:`, err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate-all', async (req, res) => {
  const { limit = 10 } = req.body || {};
  const today = new Date().toISOString().split('T')[0];

  const topTickers = db.prepare(`
    SELECT td.* FROM ticker_data td
    WHERE td.date = ?
    ORDER BY td.priority_score DESC
    LIMIT ?
  `).all(today, limit);

  if (!topTickers.length) {
    return res.status(400).json({ error: 'No ticker data for today. Run Refresh Prices first.' });
  }

  const results = [];
  for (const td of topTickers) {
    try {
      const result = await generateChart({
        ticker: td.symbol,
        s0: td.price,
        sigma: td.sigma || 0.018,
        low: td.ppl_low,
        mode: td.ppl_mode,
        high: td.ppl_high
      });
      db.prepare(`
        INSERT INTO charts (symbol, date, chart_2d_path, chart_3d_path, sigma)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT DO NOTHING
      `).run(td.symbol, today, result.path2d, result.path3d, td.sigma);
      results.push({ symbol: td.symbol, success: true, path2d: result.path2d });
    } catch (err) {
      results.push({ symbol: td.symbol, success: false, error: err.message });
    }
  }

  res.json({ results });
});

router.get('/latest/:symbol', (req, res) => {
  const { symbol } = req.params;
  const today = new Date().toISOString().split('T')[0];
  const chart = db.prepare('SELECT * FROM charts WHERE symbol = ? AND date = ? ORDER BY generated_at DESC LIMIT 1').get(symbol, today);
  if (!chart) return res.status(404).json({ error: 'No chart for today' });
  res.json({ symbol, path2d: chart.chart_2d_path, path3d: chart.chart_3d_path, generatedAt: chart.generated_at });
});

module.exports = router;
