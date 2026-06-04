const express = require('express');
const router = express.Router();
const { supabase } = require('../db/db');
const { generateTweetText } = require('../services/tweetTemplates');

router.get('/build', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: rows, error } = await supabase
      .from('ticker_data')
      .select('*')
      .eq('date', today)
      .order('priority_score', { ascending: false })
      .limit(5);

    if (error) throw error;

    const tweets = (rows || []).map((row, i) => ({
      rank: i + 1,
      symbol: row.symbol,
      price: row.price,
      text: generateTweetText(row.symbol, {
        price: row.price,
        pplLow: row.ppl_low,
        pplMode: row.ppl_mode,
        pplHigh: row.ppl_high,
        upPct: row.up_pct,
        ivCurrent: row.iv_current
      }, 0)
    }));

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    res.json({
      opener: `BayesAIn is watching these 5 ETFs today.\n\nEach one is at a key Bayesian probability level.\n\nHere's what our AI sees 🤖\n\n${dateStr} | #BayesAIn #ETF #Trading`,
      tweets
    });
  } catch (err) {
    console.error('GET /thread/build error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
