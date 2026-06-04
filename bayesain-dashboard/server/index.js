require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const { initDb } = require('./db/db');

const authRoutes     = require('./routes/auth');
const tickerRoutes   = require('./routes/tickers');
const chartRoutes    = require('./routes/charts');
const postRoutes     = require('./routes/posts');
const settingsRoutes = require('./routes/settings');
const resultsRoutes  = require('./routes/results');
const engageRoutes   = require('./routes/engage');
const threadRoutes   = require('./routes/thread');

const app = express();
const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'bayesain-dev-secret';
const COOKIE_NAME = 'bayesain_token';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes (no middleware)
app.use('/api', authRoutes);

// Public result stats — no auth required
app.get('/api/results/public', (req, res, next) => {
  req.url = '/public';
  resultsRoutes(req, res, next);
});

// Protected API routes
app.use('/api/tickers',  requireAuth, tickerRoutes);
app.use('/api/charts',   requireAuth, chartRoutes);
app.use('/api/posts',    requireAuth, postRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);
app.use('/api/results',  requireAuth, resultsRoutes);
app.use('/api/engage',   requireAuth, engageRoutes);
app.use('/api/thread',   requireAuth, threadRoutes);

// Static: public/ (bayesain.html, generated charts)
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback
app.get('*', (req, res) => {
  const index = path.join(__dirname, '../public/index.html');
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    res.send('<h1>BayesAIn Dashboard</h1><p>Run <code>npm run build</code> to build the client.</p>');
  }
});

// Init DB then start server (only when running directly, not when imported by Vercel)
if (require.main === module) {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`BayesAIn Dashboard running at http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('DB init failed:', err);
    process.exit(1);
  });
}

module.exports = app;
