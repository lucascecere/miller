const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { supabase } = require('../db/db');

const IS_VERCEL = !!process.env.VERCEL;
const SUPABASE_URL = process.env.SUPABASE_URL;

// Upload chart PNGs (base64) from browser, store in Supabase Storage or local disk
async function uploadImage(base64Data, storePath, localDir, localFile) {
  if (IS_VERCEL) {
    const buf = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const { error } = await supabase.storage.from('charts').upload(storePath, buf, { contentType: 'image/png', upsert: true });
    if (error) throw error;
    return `${SUPABASE_URL}/storage/v1/object/public/charts/${storePath}`;
  } else {
    fs.mkdirSync(localDir, { recursive: true });
    const buf = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    fs.writeFileSync(path.join(localDir, localFile), buf);
    return `charts/${localFile}`;
  }
}

router.post('/upload/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { chartData2d, chartData3d, upPct, timeframe = 'daily', pplLow, pplMode, pplHigh } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const chartsDir = path.resolve(__dirname, '../../public/charts');

  const columnMap = {
    'daily':  { col2d: 'chart_2d_path',     col3d: 'chart_3d_path',  suffix: '2d'     },
    '2hr':    { col2d: 'chart_2hr_path',     col3d: null,             suffix: '2hr'    },
    '30min':  { col2d: 'chart_30min_path',   col3d: null,             suffix: '30min'  },
  };
  const cols = columnMap[timeframe] || columnMap.daily;

  let pathMain = null;
  let path3d = null;

  try {
    if (chartData2d) {
      pathMain = await uploadImage(chartData2d, `${symbol}/${today}-${cols.suffix}.png`, chartsDir, `${symbol}-${today}-${cols.suffix}.png`);
    }
    if (chartData3d && cols.col3d) {
      path3d = await uploadImage(chartData3d, `${symbol}/${today}-3d.png`, chartsDir, `${symbol}-${today}-3d.png`);
    }

    const upsertData = { symbol, date: today, generated_at: new Date().toISOString(), [cols.col2d]: pathMain };
    if (cols.col3d && path3d) upsertData[cols.col3d] = path3d;

    const { data: inserted, error: chartErr } = await supabase
      .from('charts')
      .upsert(upsertData, { onConflict: 'symbol,date' })
      .select()
      .single();

    if (chartErr) throw chartErr;

    if (inserted && timeframe === 'daily') {
      await supabase.from('posts')
        .update({ status: 'chart_ready', chart_id: inserted.id })
        .eq('symbol', symbol).eq('date', today).eq('status', 'draft');
    }

    // On 2hr (primary) or daily chart upload, write PPL values from bayesain.html
    // back to ticker_data and regenerate tweet_text — the simulation bands are the source of truth.
    if (timeframe === '2hr' || timeframe === 'daily') {
      const tdUpdate = {};
      if (upPct !== undefined && upPct !== null) tdUpdate.up_pct = upPct;
      if (pplLow  != null) tdUpdate.ppl_low  = pplLow;
      if (pplMode != null) tdUpdate.ppl_mode = pplMode;
      if (pplHigh != null) tdUpdate.ppl_high = pplHigh;
      if (Object.keys(tdUpdate).length > 0) {
        await supabase.from('ticker_data').update(tdUpdate).eq('symbol', symbol).eq('date', today);
      }

      // Also regenerate the post's tweet_text so it always matches the chart.
      if (pplLow != null && pplHigh != null) {
        const { generateTweetText } = require('../services/tweetTemplates');
        const freshTweet = generateTweetText(symbol, {
          price:      pplMode,
          pplLow,
          pplMode,
          pplHigh,
          upPct:      upPct ?? null,
          ivCurrent:  null,
        });
        await supabase.from('posts')
          .update({ tweet_text: freshTweet })
          .eq('symbol', symbol).eq('date', today)
          .neq('status', 'posted');
      }
    }

    res.json({ symbol, timeframe, path2d: pathMain, path3d: path3d ?? null, upPct: upPct ?? null, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(`Chart upload failed for ${symbol} (${timeframe}):`, err);
    res.status(500).json({ error: err.message });
  }
});

// Serve locally stored charts (local dev only)
router.get('/file/:symbol/:date/:type', (req, res) => {
  const { symbol, date, type } = req.params;
  const filePath = path.resolve(__dirname, `../../public/charts/${symbol}-${date}-${type}.png`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Chart not found' });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  fs.createReadStream(filePath).pipe(res);
});

router.get('/latest/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('charts').select('*').eq('symbol', symbol).eq('date', today)
    .order('generated_at', { ascending: false }).limit(1);
  if (error) return res.status(500).json({ error: error.message });
  if (!data || !data.length) return res.status(404).json({ error: 'No chart for today' });
  const c = data[0];
  res.json({
    symbol,
    path2d:    c.chart_2d_path,
    path3d:    c.chart_3d_path,
    path2hr:   c.chart_2hr_path,
    path30min: c.chart_30min_path,
    generatedAt: c.generated_at,
  });
});

module.exports = router;
