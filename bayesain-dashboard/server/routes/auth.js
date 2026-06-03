const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const hash = process.env.DASHBOARD_PASSWORD_HASH;
  if (!hash) return res.status(500).json({ error: 'Server misconfigured — no password hash set' });

  const match = await bcrypt.compare(password, hash);
  if (!match) return res.status(401).json({ error: 'Incorrect password' });

  req.session.authenticated = true;
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (req.session && req.session.authenticated) return res.json({ ok: true });
  res.status(401).json({ error: 'Not authenticated' });
});

module.exports = router;
