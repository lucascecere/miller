const RSSParser = require('rss-parser');
const parser = new RSSParser({ timeout: 5000 });

const FEEDS = [
  'https://feeds.finance.yahoo.com/rss/2.0/headline',
  'https://feeds.marketwatch.com/marketwatch/topstories',
  'https://www.reddit.com/r/investing/top.rss?t=day',
];

let cache = { items: [], lastFetched: null };
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function fetchNews() {
  const now = Date.now();
  if (cache.lastFetched && now - cache.lastFetched < CACHE_TTL) {
    return cache.items;
  }

  const results = [];
  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of (feed.items || []).slice(0, 5)) {
        results.push({
          title: item.title || '',
          link: item.link || '',
          source: feed.title || url,
          pubDate: item.pubDate || '',
        });
      }
    } catch (e) {
      // skip failed feeds silently
    }
  }

  // sort by pubDate descending, take top 15
  results.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  cache = { items: results.slice(0, 15), lastFetched: now };
  return cache.items;
}

module.exports = { fetchNews };
