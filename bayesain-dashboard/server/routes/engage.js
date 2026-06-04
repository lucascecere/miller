const express = require('express');
const router = express.Router();
const { supabase } = require('../db/db');
const { generateReply, generateThread, generateInformational, generateWeCalledIt, generateReplyFromImage } = require('../services/aiGenerator');
const { fetchNews } = require('../services/newsService');

function requireAI(res) {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'AI not configured' });
    return false;
  }
  return true;
}

// POST /api/engage/reply
// Body: { tweetText, authorHandle?, authorFollowers?, ticker?, pplLevels?, userIntent? }
// Response: { reply: string }
router.post('/reply', async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const { tweetText, authorHandle, authorFollowers, userIntent } = req.body;
    let { ticker, pplLevels, newsContext } = req.body;
    if (!tweetText || !tweetText.trim()) return res.status(400).json({ error: 'tweetText required' });

    const today = new Date().toISOString().split('T')[0];

    // Auto-detect tickers from tweet if none provided
    if (!ticker) {
      const matches = tweetText.match(/\$([A-Z]{1,5})/g);
      if (matches && matches.length > 0) {
        ticker = matches[0].replace('$', '');
      }
    }

    // Auto-fetch live PPL data for the ticker if not provided
    if (ticker && !pplLevels) {
      const { data: tdRows } = await supabase
        .from('ticker_data')
        .select('price, ppl_low, ppl_mode, ppl_high, iv_current')
        .eq('symbol', ticker.toUpperCase())
        .eq('date', today)
        .limit(1);
      if (tdRows && tdRows[0]) {
        const td = tdRows[0];
        pplLevels = { low: td.ppl_low, mode: td.ppl_mode, high: td.ppl_high, price: td.price };
      }
    }

    // Auto-fetch top news headlines if no context provided
    if (!newsContext) {
      try {
        const items = await fetchNews();
        if (items.length > 0) {
          newsContext = items.slice(0, 3).map(i => i.title).join(' | ');
        }
      } catch { /* non-blocking */ }
    }

    const reply = await generateReply({ tweetText, authorHandle, authorFollowers, ticker, pplLevels, userIntent, newsContext });
    res.json({ reply, autoTicker: ticker || null, autoPplLevels: pplLevels || null });
  } catch (err) {
    console.error('POST /engage/reply error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/engage/reply-from-image
// Body: { imageBase64, mediaType?, authorHandle?, userIntent?, newsContext?, ticker?, pplLevels? }
// Response: { reply: string }
router.post('/reply-from-image', async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const { imageBase64, mediaType, authorHandle, userIntent, newsContext, ticker, pplLevels } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

    const reply = await generateReplyFromImage({ imageBase64, mediaType, authorHandle, userIntent, newsContext, ticker, pplLevels });
    res.json({ reply });
  } catch (err) {
    console.error('POST /engage/reply-from-image error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/engage/thread
// Body: { topic, tickers?, audience?, tweetCount?, newsContext? }
// tickers: [{ symbol, pplLevels: { low, mode, high } }]
// audience: 'beginner' | 'casual' | 'active'
// Response: { thread: string }
router.post('/thread', async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const { topic, tickers, audience, tweetCount, newsContext } = req.body;
    if (!topic || !topic.trim()) return res.status(400).json({ error: 'topic required' });

    const thread = await generateThread({ topic, tickers, audience, tweetCount, newsContext });
    res.json({ thread });
  } catch (err) {
    console.error('POST /engage/thread error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/engage/informational
// Body: { topic, category?, format?, audience?, newsContext?, ticker?, pplLevels? }
// format: 'single' | 'thread' | 'list'
// audience: 'beginner' | 'intermediate'
// Response: { content: string }
router.post('/informational', async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const { topic, category, format, audience, newsContext, ticker, pplLevels } = req.body;
    if (!topic || !topic.trim()) return res.status(400).json({ error: 'topic required' });

    const content = await generateInformational({ topic, category, format, audience, newsContext, ticker, pplLevels });
    res.json({ content });
  } catch (err) {
    console.error('POST /engage/informational error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/engage/called-it
// Body: { ticker, postDate, calledLevel, actualPrice, daysElapsed, originalPostUrl?, bounceStrength?, newsContext? }
// Response: { post: string }
router.post('/called-it', async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const { ticker, postDate, calledLevel, actualPrice, daysElapsed, originalPostUrl, bounceStrength, newsContext } = req.body;
    if (!ticker || !postDate || calledLevel == null || actualPrice == null || daysElapsed == null) {
      return res.status(400).json({ error: 'ticker, postDate, calledLevel, actualPrice, daysElapsed are required' });
    }

    const post = await generateWeCalledIt({ ticker, postDate, calledLevel, actualPrice, daysElapsed, originalPostUrl, bounceStrength, newsContext });
    res.json({ post });
  } catch (err) {
    console.error('POST /engage/called-it error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engage/news
// Response: { items: [{ title, link, source, pubDate }] }
router.get('/news', async (req, res) => {
  try {
    const items = await fetchNews();
    res.json({ items });
  } catch (err) {
    console.error('GET /engage/news error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/engage/log
// Body: { team_member, minutes, description? }
// Response: { ok: true, id: string }
router.post('/log', async (req, res) => {
  try {
    const { team_member, minutes, description } = req.body;
    if (!team_member || minutes == null) return res.status(400).json({ error: 'team_member and minutes are required' });

    const { data, error } = await supabase
      .from('engagement_log')
      .insert({ team_member, minutes: parseInt(minutes, 10), description: description || null })
      .select('id')
      .single();

    if (error) throw error;
    res.json({ ok: true, id: data.id });
  } catch (err) {
    console.error('POST /engage/log error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engage/log/today
// Response: { entries: [{ id, team_member, minutes, description, created_at }] }
router.get('/log/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data, error } = await supabase
      .from('engagement_log')
      .select('id, team_member, minutes, description, created_at')
      .gte('created_at', todayISO)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ entries: data || [] });
  } catch (err) {
    console.error('GET /engage/log/today error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/engage/skip
// Body: { tweet_id }
// Response: { ok: true }
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
