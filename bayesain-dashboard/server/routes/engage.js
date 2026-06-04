const express = require('express');
const router = express.Router();
const { supabase } = require('../db/db');

const MOCK_REPLY_TO_US = [
  {
    id: '1',
    text: 'Checked out @LukeMillerPHD BayesAIn levels — $SPY called it exactly. Following now.',
    author_handle: '@TradingJoe',
    follower_count: 3200,
    priority: 'HIGH',
    suggested_reply: "Thanks for tracking it! BayesAIn uses Bayesian probability to map these levels in advance. More calls daily — stay tuned."
  },
  {
    id: '2',
    text: 'The $QQQ level you posted last week was spot on. What\'s your model using for IV inputs?',
    author_handle: '@OptionsFlow99',
    follower_count: 8700,
    priority: 'HIGH',
    suggested_reply: "We pull realized IV and blend it with the Bayesian prior — the model weights recent vol regimes more heavily. Happy to break it down in a post if there\'s interest."
  },
  {
    id: '3',
    text: 'Following @LukeMillerPHD for the AI probability levels. Different approach from the usual TA noise.',
    author_handle: '@QuietTrader_K',
    follower_count: 1100,
    priority: 'MEDIUM',
    suggested_reply: "Appreciate that — the idea is to quantify what the market is pricing in, not draw lines and hope. Glad it\'s resonating."
  },
  {
    id: '4',
    text: 'Not sure I buy the Bayesian angle here. How is this different from just Monte Carlo sims?',
    author_handle: '@SkepticalMacro',
    follower_count: 5400,
    priority: 'MEDIUM',
    suggested_reply: "Fair push. The key difference is the prior — we update continuously with realized vol and price action rather than assuming a flat distribution. The levels shift as the market regime shifts."
  },
  {
    id: '5',
    text: 'Bookmarking this $SOXL call. Will report back in 5 days.',
    author_handle: '@SemiFan2024',
    follower_count: 890,
    priority: 'LOW',
    suggested_reply: "Love it — that\'s exactly how it should work. Accountability in public. Tag us when you report back."
  }
];

const MOCK_ENGAGE_OUT = [
  {
    id: '10',
    text: 'Elliott Wave says $SPY is in wave 3 extension. Target: 580.',
    author_handle: '@EWTAnalyst',
    follower_count: 12400,
    priority: 'HIGH',
    source_query: '"Elliott Wave" finance',
    suggested_reply: "Interesting wave count. BayesAIn has $SPY with a high-probability zone at $565 — Bayesian model shows that level has historically caused reactions. Watching it closely."
  },
  {
    id: '11',
    text: 'IV crush is real — $QQQ options are way overpriced heading into FOMC.',
    author_handle: '@VolTrader_LA',
    follower_count: 9800,
    priority: 'HIGH',
    source_query: 'implied volatility ETF',
    suggested_reply: "Agreed on the crush risk. Our model flags when IV is elevated relative to the Bayesian prior — $QQQ is showing that exact signal right now. Worth watching the 48-hour window."
  },
  {
    id: '12',
    text: 'Most retail traders don\'t understand probability. They see a 60% win rate and think it\'s gospel.',
    author_handle: '@ProbTrading',
    follower_count: 22100,
    priority: 'HIGH',
    source_query: 'probability trading',
    suggested_reply: "Exactly right. Win rate without position sizing and expected value math is just noise. BayesAIn focuses on probability zones, not predictions — different mental model entirely."
  },
  {
    id: '13',
    text: 'AI in trading is mostly hype. Show me edge, not just buzzwords.',
    author_handle: '@AlgoSkeptic',
    follower_count: 6700,
    priority: 'MEDIUM',
    source_query: 'AI trading signals',
    suggested_reply: "Respect the skepticism — it\'s warranted. We post levels publicly before they hit and track results openly. The track record speaks louder than the pitch. Check the pinned thread."
  },
  {
    id: '14',
    text: 'Anyone else using Bayesian models for their ETF watchlist? Looking for tools.',
    author_handle: '@DataDrivenFin',
    follower_count: 3300,
    priority: 'MEDIUM',
    source_query: 'Bayesian trading model',
    suggested_reply: "That\'s exactly what BayesAIn does — maps 120 price paths per ETF and surfaces the high-probability zones. @LukeMillerPHD posts the levels daily. Might be worth a follow."
  }
];

router.get('/feed', (req, res) => {
  res.json({
    reply_to_us: MOCK_REPLY_TO_US,
    engage_out: MOCK_ENGAGE_OUT,
    last_updated: new Date().toISOString(),
    is_mock: true
  });
});

router.post('/skip', async (req, res) => {
  try {
    const { tweet_id } = req.body;
    if (!tweet_id) return res.status(400).json({ error: 'tweet_id required' });

    const { data: rows } = await supabase.from('settings').select('value').eq('key', 'skipped_tweet_ids');
    let ids = [];
    if (rows && rows[0]) {
      try { ids = JSON.parse(rows[0].value); } catch { ids = []; }
    }
    if (!ids.includes(tweet_id)) ids.push(tweet_id);
    await supabase.from('settings').upsert({ key: 'skipped_tweet_ids', value: JSON.stringify(ids) }, { onConflict: 'key' });

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /engage/skip error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
