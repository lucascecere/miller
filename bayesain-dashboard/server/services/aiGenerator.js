const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateTweet(systemPrompt, userPrompt, maxTokens = 300, model = 'claude-haiku-4-5-20251001') {
  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });
  return message.content[0].text.trim();
}

const BAYESAIN_SYSTEM_PROMPT = `You are @LukeMillerPHD — a quantitative analyst and trader who uses Bayesian probability to map key price levels on ETFs. You post charts and levels publicly every day. You have a track record people can verify.

Background you can draw on when genuinely relevant:
- BayesAIn runs Monte Carlo simulations on ETFs to find PPL (Posterior Predictive Level) zones — price areas where markets have a high probability of reacting
- Three levels: Support (floor), Mode (center), Resistance (ceiling)
- You blend Elliott Wave theory with Bayesian probability — the math tells you WHERE to watch, the wave structure tells you WHY

What makes you different from other traders on Twitter:
- You back everything with numbers, not vibes
- You post levels BEFORE they hit, not after
- You're genuinely interested in markets, not just growing a brand

How you actually talk:
- Direct. You say the thing. No windup.
- You disagree when you disagree. You add when you have something to add.
- You ask real questions when you're curious about someone's thinking
- You don't explain BayesAIn unless it's actually relevant — you're not always pitching
- Short sentences. You write like someone who thinks fast.

WHAT NEVER TO DO:
- Never open with "Great post", "Love this", "Exactly right", "This is spot on", "Interesting take"
- Never write a generic reply that could apply to any tweet — it must reference something SPECIFIC they said
- Never turn every reply into a BayesAIn ad
- Never be vague when you could be specific
- Never write "The Bayesian model is tracking it" or "watching for confirmation" or "Following your read" — these are dead phrases

EXAMPLES OF BAD REPLIES (do not produce these):
Tweet: "$SPY breaking out above 530, targeting 560"
BAD: "BayesAIn flagged this level earlier. The Bayesian model is tracking it — watching for confirmation. Following your read too."
BAD: "Interesting. Our model has key levels mapped on $SPY. Watching closely."

EXAMPLES OF GOOD REPLIES (this is the standard):
Tweet: "$SPY breaking out above 530, targeting 560"
GOOD: "530 was the exact PPL resistance we had mapped. If it holds as support now, 560 is very much in play — that's where the next cluster of simulated paths converges. You watching the retest or already in?"

Tweet: "Bubbles generally last about a year to 18 months. We're 14 months into this one."
GOOD: "14 months tracks. But the wave structure matters more than the calendar — wave 5 extensions can run another 6-9 months past where everyone expects the top. The euphoria phase is real but it doesn't end on a schedule."

Tweet: "AI in trading is mostly hype. Show me edge, not buzzwords."
GOOD: "Reasonable prior. Most AI trading tools are curve-fitted garbage. The test is whether the levels were posted before they hit. We publish everything publicly. Worth checking the track record before writing it off entirely."`;



async function generateReply({ tweetText, authorHandle, authorFollowers, ticker, pplLevels, userIntent }) {
  const tickerContext = ticker && pplLevels
    ? `BayesAIn data available for $${ticker}: Support $${pplLevels.low} | Mode $${pplLevels.mode} | Resistance $${pplLevels.high}. Use this only if it's genuinely relevant to the conversation.`
    : '';
  const authorContext = authorHandle
    ? `Posted by ${authorHandle}${authorFollowers ? ` (${authorFollowers.toLocaleString()} followers)` : ''}.`
    : '';
  const intentContext = userIntent ? `Our goal with this reply: ${userIntent}` : '';

  const userPrompt = `Reply to this tweet as @LukeMillerPHD.

TWEET:
"${tweetText}"

${authorContext}
${tickerContext}
${intentContext}

Step 1 — Find the most specific, interesting, or contestable thing they said. It might be a specific price target, a timeframe, a claim about market structure, a method they're using, or a strong opinion. That's your entry point.

Step 2 — Write a reply that responds to THAT specific thing. Not to the general topic. To that exact claim or number or idea.

Step 3 — Add something they didn't say. A sharper number. A different variable they're not accounting for. A question about their reasoning. Something that makes the conversation more interesting.

Rules:
- Start in the middle of the thought — no openers
- Must reference something specific from their tweet (a word, number, or claim they made)
- Under 240 characters
- Only bring in BayesAIn data if you have it AND it's the most useful thing to add (${tickerContext ? 'data provided above' : 'no data provided — skip BayesAIn unless it flows naturally'})
- Output the reply only — no labels, no quotes around it`;

  return generateTweet(BAYESAIN_SYSTEM_PROMPT, userPrompt, 300, 'claude-sonnet-4-6');
}

async function generateThread({ topic, tickers, audience, tweetCount, newsContext }) {
  const tickerData = tickers && tickers.length > 0
    ? tickers.map(t => `$${t.symbol}: Support $${t.pplLevels.low} | Mode $${t.pplLevels.mode} | Resistance $${t.pplLevels.high}`).join('\n')
    : '';
  const audienceMap = {
    'beginner': 'complete beginners with no trading knowledge — use zero jargon, pure plain English',
    'casual': 'casual traders who know basics like support/resistance but not technical analysis',
    'active': 'active traders who know Elliott Wave, technical analysis, and options'
  };
  const count = tweetCount || 5;

  const userPrompt = `Write a Twitter thread of ${count} tweets on this topic: "${topic}"

Target audience: ${audienceMap[audience] || audienceMap['casual']}

${tickerData ? `Live BayesAIn data to use:\n${tickerData}` : ''}
${newsContext ? `Relevant news context: ${newsContext}` : ''}

Format your response as:
TWEET 1: [hook — must make someone stop scrolling]
TWEET 2: [body]
...
TWEET ${count}: [CTA — invite follow, link to track record]

Rules:
- Tweet 1 must be so good it works as a standalone tweet
- Every tweet must have at least one specific number
- No tweet should feel like filler
- End CTA: "Follow @LukeMillerPHD to track these calls."
- Each tweet must be under 240 characters`;

  return generateTweet(BAYESAIN_SYSTEM_PROMPT, userPrompt, 1000);
}

async function generateInformational({ topic, category, format, audience, newsContext, ticker, pplLevels }) {
  const tickerContext = ticker && pplLevels
    ? `Use this real data as an example: $${ticker} — Support $${pplLevels.low} | Mode $${pplLevels.mode} | Resistance $${pplLevels.high}`
    : '';
  const formatMap = {
    'single': 'a single tweet under 240 characters',
    'thread': 'a 3-tweet mini thread',
    'list': 'a numbered list format (1/ 2/ 3/) that works in one tweet'
  };

  const userPrompt = `Write ${formatMap[format] || formatMap['single']} about: "${topic}"

Category: ${category || 'general'}
Audience: ${audience === 'beginner' ? 'Complete beginners — no jargon whatsoever' : 'Intermediate traders'}

${tickerContext}
${newsContext ? `Tie it to this current news: ${newsContext}` : ''}

This should genuinely teach something useful. Not promotional — educational.
Make it specific. If you mention a concept, explain it immediately in plain English.
Use a real example with real numbers wherever possible.`;

  return generateTweet(BAYESAIN_SYSTEM_PROMPT, userPrompt, 500);
}

async function generateWeCalledIt({ ticker, postDate, calledLevel, actualPrice, daysElapsed, originalPostUrl, bounceStrength, newsContext }) {
  const pctDiff = Math.abs(((actualPrice - calledLevel) / calledLevel) * 100).toFixed(2);
  const direction = actualPrice >= calledLevel ? 'hit resistance' : 'hit support';

  const userPrompt = `Write a "We Called It" post. Proof that BayesAIn predicted a key price level that was then hit by the market.

Facts:
- Ticker: $${ticker}
- Original call date: ${postDate}
- Level we called: $${calledLevel}
- Actual price it hit: $${actualPrice} (${pctDiff}% ${actualPrice >= calledLevel ? 'above' : 'below'} our call)
- Days between call and hit: ${daysElapsed} days
- What happened: price ${direction}
${bounceStrength ? `- Bounce strength: ${bounceStrength}` : ''}
${originalPostUrl ? `- Link to original post: ${originalPostUrl}` : ''}
${newsContext ? `- News context at time of hit: ${newsContext}` : ''}

This tweet must:
1. Lead with the RESULT, not the promotion
2. State the exact date of the original call
3. State the exact price called vs actual
4. Feel like a receipt, not an ad
5. Include the original post link if provided
6. Be under 280 characters

Tone: matter-of-fact confidence. Not bragging. Just showing the work.`;

  return generateTweet(BAYESAIN_SYSTEM_PROMPT, userPrompt, 400);
}

module.exports = { generateReply, generateThread, generateInformational, generateWeCalledIt };
