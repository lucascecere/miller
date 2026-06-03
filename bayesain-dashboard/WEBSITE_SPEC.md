# BayesAIn Twitter Content Dashboard — Website Specification
**For developer handoff | Node.js / Express**

---

## Overview

A private web dashboard for a team of 4 that automates Twitter content generation for @LukeMillerPHD. The core product is BayesAIn — an AI Bayesian trading system using Elliott Wave theory and PPL (Posterior Predictive Level) signals on ETFs.

**Goal:** A complete Twitter command center. The team never opens Terminal, never runs scripts, never touches a spreadsheet. Everything — chart generation, tweet writing, engagement tracking, post history — happens inside this website with buttons and clicks.

**No Python required.** All logic from `bayesain_twitter_engine.py` is ported to Node.js services running on the server. The website IS the engine.

### The complete daily workflow (website replaces everything):

| Old way (Terminal) | New way (Website) |
|---|---|
| `python3 bayesain_twitter_engine.py` | Click "Generate Today's Queue" button |
| Open `today_posts.txt` | See ranked cards on dashboard |
| Open `charts/` folder | Charts shown inline on each card |
| Copy tweet text manually | Click "Copy Tweet" button |
| Remember what was posted | "Mark as Posted" tracked automatically |
| Wait for Cowork notifications | Engagement feed tab, always live |

---

## Tech Stack (recommended)

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express | Developer familiar, fast to build |
| Chart generation | Puppeteer (headless Chrome) | Runs the existing BayesAIn HTML tool exactly — pixel-perfect output |
| Frontend | React + Tailwind CSS | Component-based, easy to extend |
| Database | SQLite (via better-sqlite3) | Zero-config, file-based, easy to migrate later |
| Job scheduler | node-cron | Built-in scheduling for hourly refresh |
| Auth | Simple shared password (bcrypt) | Team of 4, no OAuth needed yet |
| Deployment | Railway or Render | Free tier, easy Node deploys |
| Real-time | Socket.io (optional v2) | Live chart generation progress |

---

## Pages

### 1. Dashboard (`/`)
The main view. Shows today's post queue ranked by priority.

**Layout:**
- Top bar: date, "Refresh Tickers" button, "Generate All Charts" button
- Priority queue: ranked list of ETFs, each card showing:
  - Ticker symbol + company name
  - Current price + % change today
  - IV vs Historical (from Google Sheets)
  - Twitter buzz score (from Adanos API)
  - Priority score (calculated — see Priority Logic below)
  - Status badge: Draft / Chart Ready / Posted
  - "Generate Chart" button (single ticker)
  - "Copy Tweet" button

**Priority queue is sorted highest to lowest** so the team always knows what to post first.

---

### 2. Post View (`/post/:ticker`)
Full view for a single ticker's post.

**Layout:**
- Left panel: generated chart image (2D + 3D if enabled)
- Right panel:
  - Tweet text (editable textarea, character counter)
  - 4 template variations to choose from (rotate styles)
  - PPL levels: Low / Mode / High with prices
  - "Copy Tweet" button
  - "Mark as Posted" button (logs timestamp + which team member)
  - Post history: when this ticker was last posted

---

### 3. Engagement Feed (`/engage`)
Hourly-refreshed feed of Twitter engagement opportunities.

Two tabs:
- **Reply to us:** people who mentioned/replied to @LukeMillerPHD, with drafted responses
- **Engage out:** top finance Twitter posts to reply to, ranked by opportunity score

Each item shows:
- Original post text + author
- Follower count
- Drafted reply (editable)
- Priority: High / Medium / Low
- "Copy Reply" button
- "Skip" button (hides it)

---

### 4. Content Calendar (`/calendar`)
Weekly grid view showing:
- What was posted each day
- Which tickers were covered
- View count / engagement (manual entry for now)
- Gaps where nothing was posted

---

### 5. Settings (`/settings`)
- Ticker watchlist management (add/remove core ETFs)
- API key storage (Adanos, future additions)
- Google Sheets URL for IV data
- Team member names (for "posted by" tracking)
- Posting schedule preferences (how many per day, spacing)

---

## Priority Scoring Logic

Each ticker gets a priority score (0–100) calculated from:

| Signal | Weight | How |
|---|---|---|
| Twitter buzz score (Adanos) | 30% | Normalized from API |
| IV elevated above historical | 25% | (current IV - historical IV) / historical IV |
| Price move today (% change) | 20% | abs(daily % change), normalized |
| Core watchlist membership | 15% | SPY/QQQ/SMH always get bonus |
| Days since last posted | 10% | Penalize recently posted tickers |

Score recalculated every time "Refresh" is clicked or on the hourly cron job.

---

## Chart Generation (CRITICAL)

**Use Puppeteer to run the existing BayesAIn HTML file.** Do NOT rewrite the chart logic.

The HTML file lives at `public/bayesain.html`. Puppeteer loads it via `file://` protocol.

```javascript
// server/chartGenerator.js
const puppeteer = require('puppeteer');
const path = require('path');

async function generateChart({ ticker, s0, sigma, low, mode, high, steps = 252, paths = 120 }) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 800 });

  const htmlPath = path.resolve(__dirname, '../public/bayesain.html');
  await page.goto(`file://${htmlPath}`);
  await page.waitForSelector('#c');

  await page.$eval('#s0',      el => el.value = s0);
  await page.$eval('#sigma',   el => el.value = sigma);
  await page.$eval('#triLow',  el => el.value = low);
  await page.$eval('#triMode', el => el.value = mode);
  await page.$eval('#triHigh', el => el.value = high);
  await page.$eval('#nPaths',  el => el.value = paths);
  await page.$eval('#nSteps',  el => el.value = steps);

  await page.click('#runBtn');
  await page.waitForTimeout(8000);

  const canvas = await page.$('#c');
  const chartBuffer = await canvas.screenshot({ type: 'png' });

  let chart3dBuffer = null;
  const c3d = await page.$('#c3d');
  if (c3d) chart3dBuffer = await c3d.screenshot({ type: 'png' });

  await browser.close();
  return { chart2d: chartBuffer, chart3d: chart3dBuffer };
}
```

Save outputs to `public/charts/{ticker}-{date}-2d.png` and `public/charts/{ticker}-{date}-3d.png`.

---

## Data Model (SQLite)

```sql
CREATE TABLE tickers (
  id INTEGER PRIMARY KEY,
  symbol TEXT UNIQUE,
  company_name TEXT,
  is_core BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticker_data (
  id INTEGER PRIMARY KEY,
  symbol TEXT,
  date TEXT,
  price REAL,
  daily_change_pct REAL,
  iv_current REAL,
  iv_historical REAL,
  buzz_score REAL,
  priority_score REAL,
  ppl_low REAL,
  ppl_mode REAL,
  ppl_high REAL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE charts (
  id INTEGER PRIMARY KEY,
  symbol TEXT,
  date TEXT,
  chart_2d_path TEXT,
  chart_3d_path TEXT,
  sigma REAL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  symbol TEXT,
  date TEXT,
  tweet_text TEXT,
  chart_id INTEGER,
  status TEXT DEFAULT 'draft',
  posted_by TEXT,
  posted_at DATETIME,
  FOREIGN KEY (chart_id) REFERENCES charts(id)
);

CREATE TABLE engagement (
  id INTEGER PRIMARY KEY,
  type TEXT,
  source_account TEXT,
  source_post_url TEXT,
  source_text TEXT,
  drafted_reply TEXT,
  priority TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Routes

```
GET  /api/tickers                    - list all tickers with today's data + priority scores
POST /api/tickers/refresh            - re-fetch prices, IV, buzz scores; recalculate priority
POST /api/charts/generate/:symbol    - trigger Puppeteer chart generation for one ticker
POST /api/charts/generate-all        - generate charts for top N tickers
GET  /api/posts/:symbol              - get post draft for a ticker
PUT  /api/posts/:symbol              - update tweet text
POST /api/posts/:symbol/mark-posted  - mark as posted, log who + when
GET  /api/engagement                 - get current engagement feed
POST /api/engagement/refresh         - re-fetch from Twitter search
PUT  /api/engagement/:id             - update drafted reply
POST /api/engagement/:id/skip        - mark as skipped
GET  /api/settings                   - get config
PUT  /api/settings                   - save config
```

---

## External API Integrations

### Adanos (Twitter buzz scores)
```javascript
// GET https://api.adanos.org/x/stocks/v1/trending
// Header: x-api-key: YOUR_KEY
// Params: limit=50, days=1, type=etf
```
Free tier: 250 requests/month. Call once per hour via cron.

### Yahoo Finance (price + historical volatility)
```javascript
const yahooFinance = require('yahoo-finance2').default;
const quote = await yahooFinance.quote('SPY');
const hist  = await yahooFinance.historical('SPY', { period1: '6mo' });
```

### Google Sheets (IV data)
```javascript
// GET https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/Sheet1
// Auth: service account or API key
```

---

## Scheduled Jobs (node-cron)

```javascript
// Every weekday at 8:00 AM — morning refresh
cron.schedule('0 8 * * 1-5', async () => {
  await refreshAllTickers();
  await generateTopCharts(10);
});

// Every weekday 9 AM - 5 PM, hourly — engagement refresh
cron.schedule('0 9-17 * * 1-5', async () => {
  await refreshEngagementFeed();
});
```

---

## Authentication

Simple shared password, session stored in SQLite:
```javascript
app.use('/api', requireAuth);
app.use('/', requireAuth);
// Login page at /login
// Single password stored as bcrypt hash in .env
```

---

## File Structure

```
bayesain-dashboard/
├── server/
│   ├── index.js
│   ├── routes/
│   │   ├── tickers.js
│   │   ├── charts.js
│   │   ├── posts.js
│   │   ├── engagement.js
│   │   └── settings.js
│   ├── services/
│   │   ├── chartGenerator.js  ← Puppeteer logic
│   │   ├── priceData.js       ← Yahoo Finance
│   │   ├── buzzData.js        ← Adanos API
│   │   ├── sheetsData.js      ← Google Sheets IV
│   │   └── priorityScorer.js  ← Priority calculation
│   ├── db/
│   │   ├── schema.sql
│   │   └── db.js
│   └── jobs/
│       └── scheduler.js
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── PostView.jsx
│       │   ├── EngagementFeed.jsx
│       │   ├── Calendar.jsx
│       │   └── Settings.jsx
│       └── components/
│           ├── TickerCard.jsx
│           ├── TweetEditor.jsx
│           ├── ChartViewer.jsx
│           └── EngagementItem.jsx
├── public/
│   ├── bayesain.html          ← THE EXISTING CHART TOOL (already saved here)
│   └── charts/                ← generated PNG outputs
├── .env
└── package.json
```

---

## Phase Roadmap

### Phase 1 — MVP (build first)
- Dashboard with priority queue
- Chart generation via Puppeteer
- Tweet drafts with copy button
- Mark as posted
- Simple shared-password auth

### Phase 2 — Engagement
- Engagement feed (reply to us + engage out)
- Twitter search integration

### Phase 3 — Analytics
- Post history + view tracking
- Best posting times

### Phase 4 — Automation
- Direct Twitter API posting
- Auto-schedule posting queue

### Phase 5 — Intelligence
- AI-generated commentary based on Luke's EWT analysis

---

## Core ETF Watchlist

Tier 1 (always post): SPY, QQQ, SMH, GLD, SLV, UNG, TLT, XLE, SOXL, TQQQ, IWM, XLF, GDX, MSTR, ARKK

Tier 2: trending ETFs from Adanos API daily

## Tweet Templates

```
$[TICKER] PPL levels mapped by BayesAIn.
Support: $[LOW]
Mode: $[MODE]
Resistance: $[HIGH]
IV at [IV]% — compressed, breakout incoming.
Follow for daily signals. 📊
```

```
Running BayesAIn on $[TICKER] right now.
PPL range: $[LOW] — $[HIGH]
Current: $[PRICE]
IV: [IV]%
Drop your $[TICKER] target below 👇 — let's compare notes.
```

## Deploy Notes

- Railway or Render (free tier works)
- Set `PUPPETEER_EXECUTABLE_PATH` env var on server
- Run `npx puppeteer browsers install chrome` during build
- All times in US Eastern
- Start with SQLite; migrate to Postgres if team grows
