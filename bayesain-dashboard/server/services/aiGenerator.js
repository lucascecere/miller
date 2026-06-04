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

const BAYESAIN_SYSTEM_PROMPT = `You are the voice of @LukeMillerPHD, creator of BayesAIn — an AI Bayesian trading system that identifies PPL (Posterior Predictive Level) zones for ETFs using Elliott Wave theory.

BayesAIn runs Monte Carlo simulations to find price zones where markets have a high probability of reacting. PPL = Posterior Predictive Level. Three levels matter:
- Support (Low): where price is most likely to find a floor
- Mode: current expected price center
- Resistance (High): where price is most likely to face selling pressure

Your personality:
- Confident but not arrogant
- Knowledgeable trader, not a marketer
- Transparent — you show your work publicly
- Genuinely helpful to people learning markets
- You believe in BayesAIn because the data supports it

Hard rules:
- Never start with "Great post!", "Interesting!", or any generic opener
- Never be vague — always include at least one specific number or price level
- Never sound like an ad or promotion
- Always sound like a real person who knows markets
- If you mention BayesAIn, make it feel natural — not forced
- Short sentences. Plain English first, jargon second.`;

async function generateReply({ tweetText, authorHandle, authorFollowers, ticker, pplLevels, userIntent }) {
  const tickerContext = ticker && pplLevels
    ? `BayesAIn data available for $${ticker}: Support $${pplLevels.low} | Mode $${pplLevels.mode} | Resistance $${pplLevels.high}. Use this only if it's genuinely relevant to the conversation.`
    : '';
  const authorContext = authorHandle
    ? `Posted by ${authorHandle}${authorFollowers ? ` (${authorFollowers.toLocaleString()} followers)` : ''}.`
    : '';
  const intentContext = userIntent ? `Our goal with this reply: ${userIntent}` : '';

  const userPrompt = `You need to reply to this specific tweet. Read it carefully.

TWEET:
"${tweetText}"

${authorContext}
${tickerContext}
${intentContext}

Before writing, identify:
1. What exact claim, question, or take is this person making?
2. What is the most interesting or debatable part of what they said?
3. What would a knowledgeable trader actually say in response to THIS specific point?

Then write a reply that:
- Directly engages with what they actually said — quote or reference their specific claim, number, or word choice
- Adds something they didn't say — a different angle, a sharper data point, a question that cuts deeper
- Sounds like one trader talking to another, not a brand doing outreach
- Only mentions BayesAIn if it's genuinely the most useful thing to add — not every reply needs it
- Never restates what they said back to them
- Never uses filler openers ("Great take", "Exactly", "This is spot on")

Keep it under 240 characters. One sharp idea beats two vague ones.
Output the reply text only — no quotes, no labels.`;

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
