const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const result = {};
  rows.forEach(r => {
    try { result[r.key] = JSON.parse(r.value); }
    catch { result[r.key] = r.value; }
  });
  res.json(result);
});

router.put('/', (req, res) => {
  const updates = req.body;
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const txn = db.transaction(obj => {
    for (const [k, v] of Object.entries(obj)) {
      upsert.run(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
  });
  txn(updates);
  res.json({ ok: true });
});

module.exports = router;
