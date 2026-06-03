const express = require('express');
const router = express.Router();
const { sql } = require('../db/db');
const { generateTweetText } = require('../services/tweetTemplates');

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const { rows: tdRows } = await sql`SELECT * FROM ticker_data WHERE symbol = ${symbol} AND date = ${today}`;
    const tickerData = tdRows[0];

    let { rows: postRows } = await sql`SELECT * FROM posts WHERE symbol = ${symbol} AND date = ${today}`;
    let post = postRows[0];

    if (!post && tickerData) {
      const tweetText = generateTweetText(symbol, {
        pplLow: tickerData.ppl_low, pplMode: tickerData.ppl_mode, pplHigh: tickerData.ppl_high,
        price: tickerData.price, ivCurrent: tickerData.iv_current
      });
      await sql`INSERT INTO posts (symbol, date, tweet_text, status) VALUES (${symbol}, ${today}, ${tweetText}, 'draft') ON CONFLICT DO NOTHING`;
      const { rows: newPost } = await sql`SELECT * FROM posts WHERE symbol = ${symbol} AND date = ${today}`;
      post = newPost[0];
    }

    const { rows: chartRows } = await sql`SELECT * FROM charts WHERE symbol = ${symbol} AND date = ${today} ORDER BY generated_at DESC LIMIT 1`;
    const chart = chartRows[0];

    const { rows: history } = await sql`
      SELECT posted_by, posted_at, date FROM posts
      WHERE symbol = ${symbol} AND status = 'posted'
      ORDER BY posted_at DESC LIMIT 10
    `;

    const templates = tickerData ? [0,1,2,3].map(i =>
      generateTweetText(symbol, {
        pplLow: tickerData.ppl_low, pplMode: tickerData.ppl_mode, pplHigh: tickerData.ppl_high,
        price: tickerData.price, ivCurrent: tickerData.iv_current
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
  } catch (err) {
    console.error('GET /posts error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { tweetText } = req.body;
  const today = new Date().toISOString().split('T')[0];
  await sql`UPDATE posts SET tweet_text = ${tweetText} WHERE symbol = ${symbol} AND date = ${today}`;
  res.json({ ok: true, symbol, tweetText });
});

router.post('/:symbol/mark-posted', async (req, res) => {
  const { symbol } = req.params;
  const { postedBy } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  await sql`UPDATE posts SET status = 'posted', posted_by = ${postedBy || 'Unknown'}, posted_at = ${now} WHERE symbol = ${symbol} AND date = ${today}`;
  res.json({ symbol, status: 'posted', postedAt: now, postedBy: postedBy || 'Unknown' });
});

module.exports = router;
