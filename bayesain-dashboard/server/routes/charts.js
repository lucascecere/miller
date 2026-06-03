const express = require('express');
const router = express.Router();
const { sql } = require('../db/db');

// Only require Puppeteer if not on Vercel
let generateChart;
if (!process.env.VERCEL) {
  generateChart = require('../services/chartGenerator').generateChart;
}

router.post('/generate/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const { rows } = await sql`SELECT * FROM ticker_data WHERE symbol = ${symbol} AND date = ${today}`;
  const tickerData = rows[0];

  if (!tickerData) {
    return res.status(400).json({ error: `No price data for ${symbol} today. Run Refresh Prices first.` });
  }

  // On Vercel: return URL to open HTML tool with pre-filled values
  if (process.env.VERCEL) {
    const params = new URLSearchParams({
      s0: tickerData.price,
      sigma: tickerData.sigma || 0.018,
      triLow: tickerData.ppl_low,
      triMode: tickerData.ppl_mode,
      triHigh: tickerData.ppl_high
    });
    return res.json({
      symbol,
      mode: 'manual',
      chartToolUrl: `/bayesain.html?${params.toString()}`,
      message: `Open the chart tool, values are pre-filled for ${symbol}`
    });
  }

  // Local: run Puppeteer
  try {
    const result = await generateChart({
      ticker: symbol,
      s0: tickerData.price,
      sigma: tickerData.sigma || 0.018,
      low: tickerData.ppl_low,
      mode: tickerData.ppl_mode,
      high: tickerData.ppl_high
    });

    const { rows: insertedChart } = await sql`
      INSERT INTO charts (symbol, date, chart_2d_path, chart_3d_path, sigma)
      VALUES (${symbol}, ${today}, ${result.path2d}, ${result.path3d}, ${tickerData.sigma})
      ON CONFLICT DO NOTHING
      RETURNING id
    `;

    if (insertedChart.length > 0) {
      await sql`
        UPDATE posts SET status = 'chart_ready', chart_id = ${insertedChart[0].id}
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

  // On Vercel: return chart tool URLs for all tickers
  if (process.env.VERCEL) {
    const results = topTickers.map(td => {
      const params = new URLSearchParams({
        s0: td.price, sigma: td.sigma || 0.018,
        triLow: td.ppl_low, triMode: td.ppl_mode, triHigh: td.ppl_high
      });
      return { symbol: td.symbol, success: true, mode: 'manual', chartToolUrl: `/bayesain.html?${params.toString()}` };
    });
    return res.json({ results, mode: 'manual' });
  }

  // Local: run Puppeteer sequentially
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
        ON CONFLICT DO NOTHING
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

// Returns pre-filled chart tool URL for this ticker (used by frontend on Vercel)
router.get('/tool-url/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await sql`SELECT * FROM ticker_data WHERE symbol = ${symbol} AND date = ${today}`;
  const td = rows[0];
  if (!td) return res.status(404).json({ error: 'No data for today. Refresh prices first.' });
  const params = new URLSearchParams({
    s0: td.price, sigma: td.sigma || 0.018,
    triLow: td.ppl_low, triMode: td.ppl_mode, triHigh: td.ppl_high
  });
  res.json({ url: `/bayesain.html?${params.toString()}`, ticker: symbol, price: td.price });
});

module.exports = router;
