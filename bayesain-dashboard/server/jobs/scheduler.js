const cron = require('node-cron');

function initScheduler({ db }) {
  const { fetchTickerData } = require('../services/priceData');
  const { fetchBuzzScore } = require('../services/buzzData');
  const { calculatePriority } = require('../services/priorityScorer');
  const { generateChart } = require('../services/chartGenerator');

  cron.schedule('0 8 * * 1-5', async () => {
    console.log('[Scheduler] Morning refresh starting...');
    try {
      const today = new Date().toISOString().split('T')[0];
      const tickers = db.prepare('SELECT * FROM tickers').all();
      for (const ticker of tickers) {
        try {
          const data = await fetchTickerData(ticker.symbol);
          const buzzScore = await fetchBuzzScore(ticker.symbol);
          const priorityScore = calculatePriority({
            buzzScore, ivCurrent: data.ivCurrent, ivHistorical: data.ivHistorical,
            dailyChangePct: data.dailyChangePct, isCore: ticker.is_core === 1, daysSincePosted: 7
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
        } catch (e) { console.error(`Scheduler: failed ${ticker.symbol}`, e.message); }
      }
      const topTickers = db.prepare(`SELECT * FROM ticker_data WHERE date=? ORDER BY priority_score DESC LIMIT 10`).all(today);
      for (const td of topTickers) {
        try {
          const result = await generateChart({ ticker: td.symbol, s0: td.price, sigma: td.sigma||0.018, low: td.ppl_low, mode: td.ppl_mode, high: td.ppl_high });
          db.prepare('INSERT OR IGNORE INTO charts (symbol, date, chart_2d_path, chart_3d_path, sigma) VALUES (?,?,?,?,?)').run(td.symbol, today, result.path2d, result.path3d, td.sigma);
        } catch (e) { console.error(`[Scheduler] Chart failed: ${td.symbol}`, e.message); }
      }
      console.log('[Scheduler] Morning refresh complete.');
    } catch (err) { console.error('[Scheduler] Error:', err); }
  }, { timezone: 'America/New_York' });

  cron.schedule('0 9-17 * * 1-5', () => {
    console.log('[Scheduler] Engagement refresh — Phase 2 not yet implemented');
  }, { timezone: 'America/New_York' });

  console.log('[Scheduler] Initialized.');
}

module.exports = { initScheduler };
