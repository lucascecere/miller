const express = require('express');
const router = express.Router();
const { supabase } = require('../db/db');

router.post('/check', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: openPosts, error: openErr } = await supabase
      .from('posts')
      .select('id, symbol, ppl_high, ppl_low, created_at')
      .eq('result_status', 'OPEN')
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .not('ppl_high', 'is', null);

    if (openErr) throw openErr;

    const now = new Date().toISOString();
    const hits = [];
    let checked = 0;
    let expired = 0;

    const symbolsSet = [...new Set((openPosts || []).map(p => p.symbol))];
    const priceMap = {};
    for (const symbol of symbolsSet) {
      const { data: tdRows } = await supabase.from('ticker_data').select('price').eq('symbol', symbol).eq('date', today);
      if (tdRows && tdRows[0]) priceMap[symbol] = tdRows[0].price;
    }

    for (const post of (openPosts || [])) {
      checked++;
      const currentPrice = priceMap[post.symbol];
      const age = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24);

      if (age > 14) {
        await supabase.from('posts').update({ result_status: 'EXPIRED' }).eq('id', post.id);
        expired++;
        continue;
      }

      if (currentPrice == null) continue;

      const distHigh = Math.abs(currentPrice - post.ppl_high) / post.ppl_high;
      const distLow = post.ppl_low ? Math.abs(currentPrice - post.ppl_low) / post.ppl_low : Infinity;

      if (distHigh <= 0.01) {
        await supabase.from('posts').update({ result_status: 'HIT_HIGH', result_price: currentPrice, result_date: now }).eq('id', post.id);
        hits.push({ symbol: post.symbol, status: 'HIT_HIGH', result_price: currentPrice });
      } else if (distLow <= 0.01) {
        await supabase.from('posts').update({ result_status: 'HIT_LOW', result_price: currentPrice, result_date: now }).eq('id', post.id);
        hits.push({ symbol: post.symbol, status: 'HIT_LOW', result_price: currentPrice });
      }
    }

    res.json({ checked, hits, expired });
  } catch (err) {
    console.error('POST /results/check error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/open', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .in('result_status', ['OPEN', 'HIT_HIGH', 'HIT_LOW'])
      .not('ppl_high', 'is', null)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const symbolsSet = [...new Set((posts || []).map(p => p.symbol))];
    const priceMap = {};
    for (const symbol of symbolsSet) {
      const { data: tdRows } = await supabase.from('ticker_data').select('price').eq('symbol', symbol).eq('date', today);
      if (tdRows && tdRows[0]) priceMap[symbol] = tdRows[0].price;
    }

    const enriched = (posts || []).map(p => {
      const current = priceMap[p.symbol];
      let is_close = false;
      if (current != null) {
        const distHigh = Math.abs(current - p.ppl_high) / p.ppl_high;
        const distLow = p.ppl_low ? Math.abs(current - p.ppl_low) / p.ppl_low : Infinity;
        is_close = distHigh <= 0.02 || distLow <= 0.02;
      }
      return { ...p, current_price: current ?? null, is_close };
    });

    enriched.sort((a, b) => {
      const rank = item => (item.result_status === 'HIT_HIGH' || item.result_status === 'HIT_LOW') ? 0 : item.is_close ? 1 : 2;
      return rank(a) - rank(b);
    });

    res.json(enriched);
  } catch (err) {
    console.error('GET /results/open error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/public', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('posts')
      .select('date, symbol, ppl_low, ppl_high, result_status, result_price, result_date, created_at')
      .not('ppl_high', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const all = rows || [];
    const total = all.length;
    const hitCount = all.filter(r => r.result_status === 'HIT_HIGH' || r.result_status === 'HIT_LOW').length;
    const expiredCount = all.filter(r => r.result_status === 'EXPIRED').length;
    const open_count = all.filter(r => r.result_status === 'OPEN').length;
    const hit_rate_pct = (hitCount + expiredCount) > 0
      ? Math.round((hitCount / (hitCount + expiredCount)) * 100)
      : null;

    const hitRows = all.filter(r => r.result_date);
    const avg_days_to_hit = hitRows.length > 0
      ? Math.round(hitRows.reduce((sum, r) => sum + (new Date(r.result_date) - new Date(r.created_at)) / (1000 * 60 * 60 * 24), 0) / hitRows.length)
      : null;

    const formatted = all.map(r => ({
      date: r.date,
      symbol: r.symbol,
      ppl_low: r.ppl_low,
      ppl_high: r.ppl_high,
      result_status: r.result_status,
      result_price: r.result_price,
      result_date: r.result_date,
      days_to_hit: r.result_date
        ? Math.round((new Date(r.result_date) - new Date(r.created_at)) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json({ stats: { total, hit_rate_pct, avg_days_to_hit, open_count }, rows: formatted });
  } catch (err) {
    console.error('GET /results/public error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
