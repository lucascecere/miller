const express = require('express');
const router = express.Router();
const { supabase } = require('../db/db');
const { fetchTickerData } = require('../services/priceData');
const { fetchBuzzScore } = require('../services/buzzData');
const { calculatePriority } = require('../services/priorityScorer');

router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.rpc('get_tickers_today', { p_date: today });
    if (error) throw error;

    const result = (data || []).map(row => {
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

router.post('/', async (req, res) => {
  try {
    const { symbol, company_name } = req.body;
    if (!symbol) return res.status(400).json({ error: 'symbol required' });
    const { data, error } = await supabase.from('tickers').insert({ symbol: symbol.toUpperCase(), company_name: company_name || null }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('POST /tickers error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    await supabase.from('ticker_data').delete().eq('symbol', symbol.toUpperCase());
    const { error } = await supabase.from('tickers').delete().eq('symbol', symbol.toUpperCase());
    if (error) throw error;
    res.json({ ok: true, symbol: symbol.toUpperCase() });
  } catch (err) {
    console.error('DELETE /tickers/:symbol error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { data: tickers, error: tickerErr } = await supabase.from('tickers').select('*');
  if (tickerErr) return res.status(500).json({ error: tickerErr.message });

  let refreshed = 0;
  const errors = [];

  for (const ticker of tickers) {
    try {
      const data = await fetchTickerData(ticker.symbol);
      const buzzScore = await fetchBuzzScore(ticker.symbol);

      const { data: lastPosts } = await supabase
        .from('posts')
        .select('posted_at')
        .eq('symbol', ticker.symbol)
        .eq('status', 'posted')
        .order('posted_at', { ascending: false })
        .limit(1);

      let daysSincePosted = 7;
      if (lastPosts && lastPosts.length > 0 && lastPosts[0].posted_at) {
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

      const { error: upsertErr } = await supabase.from('ticker_data').upsert({
        symbol: ticker.symbol,
        date: today,
        price: data.price,
        daily_change_pct: data.dailyChangePct,
        iv_current: data.ivCurrent,
        iv_historical: data.ivHistorical,
        buzz_score: buzzScore,
        priority_score: priorityScore,
        ppl_low: data.pplLow,
        ppl_mode: data.pplMode,
        ppl_high: data.pplHigh,
        sigma: data.sigma,
        updated_at: new Date().toISOString()
      }, { onConflict: 'symbol,date' });

      if (upsertErr) throw upsertErr;
      refreshed++;
    } catch (err) {
      console.error(`Refresh failed for ${ticker.symbol}:`, err.message);
      errors.push({ symbol: ticker.symbol, error: err.message });
    }
  }

  res.json({ refreshed, errors, timestamp: new Date().toISOString() });
});

module.exports = router;
