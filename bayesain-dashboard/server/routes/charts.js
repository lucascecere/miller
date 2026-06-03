const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { sql } = require('../db/db');
const { generateChart } = require('../services/chartGenerator');

const IS_VERCEL = !!process.env.VERCEL;

// Serve chart files stored in /tmp (Vercel) or public/charts/ (local)
router.get('/file/:symbol/:date/:type', (req, res) => {
  const { symbol, date, type } = req.params;
  const chartsDir = IS_VERCEL ? '/tmp/charts' : path.resolve(__dirname, '../../public/charts');
  const filePath = path.join(chartsDir, `${symbol}-${date}-${type}.png`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Chart not found — click Generate Chart to create it.' });
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  fs.createReadStream(filePath).pipe(res);
});

router.post('/generate/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const { rows } = await sql`SELECT * FROM ticker_data WHERE symbol = ${symbol} AND date = ${today}`;
  const tickerData = rows[0];

  if (!tickerData) {
    return res.status(400).json({ error: `No price data for ${symbol}. Run Refresh Prices first.` });
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

    const { rows: inserted } = await sql`
      INSERT INTO charts (symbol, date, chart_2d_path, chart_3d_path, sigma)
      VALUES (${symbol}, ${today}, ${result.path2d}, ${result.path3d}, ${tickerData.sigma})
      ON CONFLICT (symbol, date) DO UPDATE SET
        chart_2d_path = EXCLUDED.chart_2d_path,
        chart_3d_path = EXCLUDED.chart_3d_path,
        generated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    if (inserted.length > 0) {
      await sql`
        UPDATE posts SET status = 'chart_ready', chart_id = ${inserted[0].id}
        WHERE symbol = ${symbol} AND date = ${today} AND status = 'draft'
      `;
    }

    res.json({ symbol, path2d: result.path2d, path3d: result.path3d, generatedAt: result.generatedAt });
  } catch (err) {
    console.error(`Chart generation failed for ${symbol}:`, err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate-all', async (req, res) => {
  const { limit = 10 } = req.body || {};
  const today = new Date().toISOString().split('T')[0];

  const { rows: topTickers } = await sql`
    SELECT * FROM ticker_data WHERE date = ${today}
    ORDER BY priority_score DESC LIMIT ${limit}
  `;

  if (!topTickers.length) {
    return res.status(400).json({ error: 'No ticker data for today. Run Refresh Prices first.' });
  }

  const results = [];
  for (const td of topTickers) {
    try {
      const result = await generateChart({
        ticker: td.symbol, s0: td.price, sigma: td.sigma || 0.018,
        low: td.ppl_low, mode: td.ppl_mode, high: td.ppl_high
      });
      await sql`
        INSERT INTO charts (symbol, date, chart_2d_path, chart_3d_path, sigma)
        VALUES (${td.symbol}, ${today}, ${result.path2d}, ${result.path3d}, ${td.sigma})
        ON CONFLICT (symbol, date) DO UPDATE SET
          chart_2d_path = EXCLUDED.chart_2d_path,
          chart_3d_path = EXCLUDED.chart_3d_path,
          generated_at = CURRENT_TIMESTAMP
      `;
      results.push({ symbol: td.symbol, success: true, path2d: result.path2d });
    } catch (err) {
      results.push({ symbol: td.symbol, success: false, error: err.message });
    }
  }
  res.json({ results });
});

router.get('/latest/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await sql`
    SELECT * FROM charts WHERE symbol = ${symbol} AND date = ${today}
    ORDER BY generated_at DESC LIMIT 1
  `;
  if (!rows.length) return res.status(404).json({ error: 'No chart for today' });
  const c = rows[0];
  res.json({ symbol, path2d: c.chart_2d_path, path3d: c.chart_3d_path, generatedAt: c.generated_at });
});

module.exports = router;
