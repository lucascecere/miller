const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { supabase } = require('../db/db');

const IS_VERCEL = !!process.env.VERCEL;
const SUPABASE_URL = process.env.SUPABASE_URL;

// Upload chart PNGs (base64) from browser, store in Supabase Storage or local disk
router.post('/upload/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { chartData2d, chartData3d } = req.body;
  const today = new Date().toISOString().split('T')[0];

  let path2d = null;
  let path3d = null;

  try {
    if (IS_VERCEL) {
      // Upload to Supabase Storage, get public URL
      if (chartData2d) {
        const buf2d = Buffer.from(chartData2d.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const storePath2d = `${symbol}/${today}-2d.png`;
        const { error } = await supabase.storage.from('charts').upload(storePath2d, buf2d, { contentType: 'image/png', upsert: true });
        if (error) throw error;
        path2d = `${SUPABASE_URL}/storage/v1/object/public/charts/${storePath2d}`;
      }
      if (chartData3d) {
        const buf3d = Buffer.from(chartData3d.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const storePath3d = `${symbol}/${today}-3d.png`;
        const { error } = await supabase.storage.from('charts').upload(storePath3d, buf3d, { contentType: 'image/png', upsert: true });
        if (error) throw error;
        path3d = `${SUPABASE_URL}/storage/v1/object/public/charts/${storePath3d}`;
      }
    } else {
      // Local: write to public/charts/
      const chartsDir = path.resolve(__dirname, '../../public/charts');
      fs.mkdirSync(chartsDir, { recursive: true });
      if (chartData2d) {
        const buf = Buffer.from(chartData2d.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        fs.writeFileSync(path.join(chartsDir, `${symbol}-${today}-2d.png`), buf);
        path2d = `charts/${symbol}-${today}-2d.png`;
      }
      if (chartData3d) {
        const buf = Buffer.from(chartData3d.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        fs.writeFileSync(path.join(chartsDir, `${symbol}-${today}-3d.png`), buf);
        path3d = `charts/${symbol}-${today}-3d.png`;
      }
    }

    const { data: inserted, error: chartErr } = await supabase
      .from('charts')
      .upsert({ symbol, date: today, chart_2d_path: path2d, chart_3d_path: path3d, generated_at: new Date().toISOString() }, { onConflict: 'symbol,date' })
      .select()
      .single();

    if (chartErr) throw chartErr;

    if (inserted) {
      await supabase.from('posts')
        .update({ status: 'chart_ready', chart_id: inserted.id })
        .eq('symbol', symbol).eq('date', today).eq('status', 'draft');
    }

    res.json({ symbol, path2d, path3d, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(`Chart upload failed for ${symbol}:`, err);
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
  res.json({ symbol, path2d: c.chart_2d_path, path3d: c.chart_3d_path, generatedAt: c.generated_at });
});

module.exports = router;
