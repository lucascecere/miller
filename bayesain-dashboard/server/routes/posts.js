const express = require('express');
const router = express.Router();
const { supabase } = require('../db/db');
const { generateTweetText } = require('../services/tweetTemplates');

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const { data: tdRows } = await supabase.from('ticker_data').select('*').eq('symbol', symbol).eq('date', today);
    const tickerData = tdRows && tdRows[0];

    let { data: postRows } = await supabase.from('posts').select('*').eq('symbol', symbol).eq('date', today);
    let post = postRows && postRows[0];

    if (!post && tickerData) {
      const tweetText = generateTweetText(symbol, {
        pplLow: tickerData.ppl_low, pplMode: tickerData.ppl_mode, pplHigh: tickerData.ppl_high,
        price: tickerData.price, ivCurrent: tickerData.iv_current
      });
      await supabase.from('posts').upsert({ symbol, date: today, tweet_text: tweetText, status: 'draft' }, { onConflict: 'symbol,date', ignoreDuplicates: true });
      const { data: newPost } = await supabase.from('posts').select('*').eq('symbol', symbol).eq('date', today);
      post = newPost && newPost[0];
    }

    const { data: chartRows } = await supabase.from('charts').select('*').eq('symbol', symbol).eq('date', today).order('generated_at', { ascending: false }).limit(1);
    const chart = chartRows && chartRows[0];

    const { data: history } = await supabase
      .from('posts')
      .select('posted_by, posted_at, date')
      .eq('symbol', symbol)
      .eq('status', 'posted')
      .order('posted_at', { ascending: false })
      .limit(10);

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
      postHistory: history || []
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
  const { error } = await supabase.from('posts').update({ tweet_text: tweetText }).eq('symbol', symbol).eq('date', today);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, symbol, tweetText });
});

router.post('/:symbol/mark-posted', async (req, res) => {
  const { symbol } = req.params;
  const { postedBy } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const { error } = await supabase.from('posts')
    .update({ status: 'posted', posted_by: postedBy || 'Unknown', posted_at: now })
    .eq('symbol', symbol)
    .eq('date', today);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ symbol, status: 'posted', postedAt: now, postedBy: postedBy || 'Unknown' });
});

module.exports = router;
