const express = require('express');
const router = express.Router();
const { sql } = require('../db/db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await sql`SELECT key, value FROM settings`;
    const result = {};
    rows.forEach(r => {
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
      await sql`INSERT INTO settings (key, value) VALUES (${k}, ${val}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
