const express = require('express');
const router = express.Router();
const { supabase } = require('../db/db');

router.get('/', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('settings').select('key, value');
    if (error) throw error;
    const result = {};
    (rows || []).forEach(r => {
      try { result[r.key] = JSON.parse(r.value); }
      catch { result[r.key] = r.value; }
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    for (const [k, v] of Object.entries(updates)) {
      const val = typeof v === 'string' ? v : JSON.stringify(v);
      const { error } = await supabase.from('settings').upsert({ key: k, value: val }, { onConflict: 'key' });
      if (error) throw error;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
