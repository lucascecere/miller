require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const SQLiteStore = require('connect-sqlite3')(session);
const db = require('./db/db');

const authRoutes     = require('./routes/auth');
const tickerRoutes   = require('./routes/tickers');
const chartRoutes    = require('./routes/charts');
const postRoutes     = require('./routes/posts');
const settingsRoutes = require('./routes/settings');
const { initScheduler } = require('./jobs/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: './data' }),
  secret: process.env.SESSION_SECRET || 'bayesain-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' }
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}

app.use('/api', authRoutes);
app.use('/api/tickers',  requireAuth, tickerRoutes);
app.use('/api/charts',   requireAuth, chartRoutes);
app.use('/api/posts',    requireAuth, postRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  const clientBuild = path.join(__dirname, '../client/dist/index.html');
  if (fs.existsSync(clientBuild)) {
    res.sendFile(clientBuild);
  } else {
    res.send('<h1>BayesAIn Dashboard</h1><p>Build the client: <code>npm run build:client</code></p>');
  }
});

initScheduler({ db });

app.listen(PORT, () => {
  console.log(`BayesAIn Dashboard running at http://localhost:${PORT}`);
});
