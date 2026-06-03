CREATE TABLE IF NOT EXISTS tickers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT UNIQUE NOT NULL,
  company_name TEXT,
  is_core INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticker_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  price REAL,
  daily_change_pct REAL,
  iv_current REAL DEFAULT 0.20,
  iv_historical REAL DEFAULT 0.20,
  buzz_score REAL DEFAULT 0,
  priority_score REAL DEFAULT 0,
  ppl_low REAL,
  ppl_mode REAL,
  ppl_high REAL,
  sigma REAL DEFAULT 0.018,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE TABLE IF NOT EXISTS charts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  chart_2d_path TEXT,
  chart_3d_path TEXT,
  sigma REAL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  tweet_text TEXT,
  chart_id INTEGER,
  status TEXT DEFAULT 'draft',
  posted_by TEXT,
  posted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date),
  FOREIGN KEY (chart_id) REFERENCES charts(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT OR IGNORE INTO tickers (symbol, company_name, is_core) VALUES
  ('SPY',  'SPDR S&P 500 ETF Trust', 1),
  ('QQQ',  'Invesco QQQ Trust (Nasdaq-100)', 1),
  ('SMH',  'VanEck Semiconductor ETF', 1),
  ('GLD',  'SPDR Gold Shares', 1),
  ('SLV',  'iShares Silver Trust', 1),
  ('UNG',  'United States Natural Gas Fund', 1),
  ('TLT',  'iShares 20+ Year Treasury Bond ETF', 1),
  ('XLE',  'Energy Select Sector SPDR Fund', 1),
  ('SOXL', 'Direxion Daily Semiconductor 3x Bull', 1),
  ('TQQQ', 'ProShares UltraPro QQQ', 1),
  ('IWM',  'iShares Russell 2000 ETF', 1),
  ('XLF',  'Financial Select Sector SPDR Fund', 1),
  ('GDX',  'VanEck Gold Miners ETF', 1),
  ('MSTR', 'MicroStrategy Incorporated', 1),
  ('ARKK', 'ARK Innovation ETF', 1);

INSERT OR IGNORE INTO settings VALUES
  ('team_members', '["Luke","Lucas","Team Member 3","Team Member 4"]'),
  ('posts_per_day', '3'),
  ('adanos_api_key', ''),
  ('google_sheets_id', '');
