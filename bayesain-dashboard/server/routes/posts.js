const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { generateTweetText } = require('../services/tweetTemplates');

router.get('/:symbol', (req, res) => {
  const { symbol } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const tickerData = db.prepare('SELECT * FROM ticker_data WHERE symbol = ? AND date = ?').get(symbol, today);

  let post = db.prepare('SELECT * FROM posts WHERE symbol = ? AND date = ?').get(symbol, today);

  if (!post && tickerData) {
    const tweetText = generateTweetText(symbol, {
      pplLow: tickerData.ppl_low,
      pplMode: tickerData.ppl_mode,
      pplHigh: tickerData.ppl_high,
      price: tickerData.price,
      ivCurrent: tickerData.iv_current
    });
    db.prepare(`INSERT OR IGNORE INTO posts (symbol, date, tweet_text, status) VALUES (?, ?, ?, 'draft')`).run(symbol, today, tweetText);
    post = db.prepare('SELECT * FROM posts WHERE symbol = ? AND date = ?').get(symbol, today);
  }

  const chart = db.prepare('SELECT * FROM charts WHERE symbol = ? AND date = ? ORDER BY generated_at DESC LIMIT 1').get(symbol, today);

  const history = db.prepare(`
    SELECT posted_by, posted_at, date FROM posts
    WHERE symbol = ? AND status = 'posted'
    ORDER BY posted_at DESC LIMIT 10
  `).all(symbol);

  const templates = tickerData ? [0,1,2,3].map(i =>
    generateTweetText(symbol, {
      pplLow: tickerData.ppl_low,
      pplMode: tickerData.ppl_mode,
      pplHigh: tickerData.ppl_high,
      price: tickerData.price,
      ivCurrent: tickerData.iv_current
    }, i)
  ) : [];

  res.json({
    symbol,
    tweetText: post ? post.tweet_text : '',
    status: post ? post.status : 'draft',
    chartPath2d: chart ? chart.chart_2d_path : null,
    chartPath3d: chart ? chart.chart_3d_path : null,
    pplLow: tickerData ? tickerData.ppl_low : null,
    pplMode: tickerData ? tickerData.ppl_mode : null,
    pplHigh: tickerData ? tickerData.ppl_high : null,
    price: tickerData ? tickerData.price : null,
    ivCurrent: tickerData ? tickerData.iv_current : null,
    templates,
    postHistory: history
  });
});

router.put('/:symbol', (req, res) => {
  const { symbol } = req.params;
  const { tweetText } = req.body;
  const today = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE posts SET tweet_text = ? WHERE symbol = ? AND date = ?').run(tweetText, symbol, today);
  res.json({ ok: true, symbol, tweetText });
});

router.post('/:symbol/mark-posted', (req, res) => {
  const { symbol } = req.params;
  const { postedBy } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  db.prepare(`UPDATE posts SET status = 'posted', posted_by = ?, posted_at = ? WHERE symbol = ? AND date = ?`).run(postedBy || 'Unknown', now, symbol, today);
  res.json({ symbol, status: 'posted', postedAt: now, postedBy: postedBy || 'Unknown' });
});

module.exports = router;
