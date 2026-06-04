const express = require('express');
const router = express.Router();
const { supabase } = require('../db/db');
const { generateTweetText, generateResultTweet } = require('../services/tweetTemplates');

router.get('/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('symbol, date, tweet_text, posted_by, posted_at, template_used, likes_count, replies_count')
      .eq('status', 'posted')
      .order('posted_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('GET /posts/history error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const { data: tdRows } = await supabase.from('ticker_data').select('*').eq('symbol', symbol).eq('date', today);
    const tickerData = tdRows && tdRows[0];

    const upPct = tickerData ? tickerData.up_pct : null;

    let { data: postRows } = await supabase.from('posts').select('*').eq('symbol', symbol).eq('date', today);
    let post = postRows && postRows[0];

    // Always recompute the tweet from live ticker_data so it matches the chart and PPL cards.
    // Only skip if the post has already been marked as posted (preserve the record).
    if (tickerData && (!post || post.status !== 'posted')) {
      const tweetText = generateTweetText(symbol, {
        price: tickerData.price,
        pplLow: tickerData.ppl_low,
        pplMode: tickerData.ppl_mode,
        pplHigh: tickerData.ppl_high,
        upPct,
        ivCurrent: tickerData.iv_current
      });
      await supabase.from('posts').upsert({
        symbol,
        date: today,
        tweet_text: tweetText,
        status: post ? post.status : 'draft',
        ppl_high: tickerData.ppl_high,
        ppl_low: tickerData.ppl_low,
        price_at_post: tickerData.price
      }, { onConflict: 'symbol,date' });
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

    const templateData = tickerData ? {
      price: tickerData.price,
      pplLow: tickerData.ppl_low,
      pplMode: tickerData.ppl_mode,
      pplHigh: tickerData.ppl_high,
      upPct,
      ivCurrent: tickerData.iv_current
    } : null;

    const templates = templateData ? [0,1,2,3].map(i => generateTweetText(symbol, templateData, i)) : [];

    if (post && (post.result_status === 'HIT_HIGH' || post.result_status === 'HIT_LOW')) {
      const direction = post.result_status === 'HIT_HIGH' ? 'HIGH' : 'LOW';
      const calledLevel = direction === 'HIGH' ? post.ppl_high : post.ppl_low;
      const days = post.result_date
        ? Math.max(1, Math.round((new Date(post.result_date) - new Date(post.created_at)) / (1000 * 60 * 60 * 24)))
        : 1;
      templates.push(generateResultTweet(symbol, {
        postDate: new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calledLevel: calledLevel ? calledLevel.toFixed(2) : '—',
        actualPrice: post.result_price ? post.result_price.toFixed(2) : '—',
        days,
        direction,
      }));
    } else {
      templates.push(null);
    }

    res.json({
      symbol,
      tweetText: post ? post.tweet_text : '',
      status: post ? post.status : 'draft',
      result_status: post ? post.result_status : null,
      result_price: post ? post.result_price : null,
      result_date: post ? post.result_date : null,
      chartPath2d: chart ? chart.chart_2d_path : null,
      chartPath3d: chart ? chart.chart_3d_path : null,
      pplLow: tickerData ? tickerData.ppl_low : null,
      pplMode: tickerData ? tickerData.ppl_mode : null,
      pplHigh: tickerData ? tickerData.ppl_high : null,
      price: tickerData ? tickerData.price : null,
      upPct,
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
