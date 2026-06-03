function calculatePriority({ buzzScore, ivCurrent, ivHistorical, dailyChangePct, isCore, daysSincePosted }) {
  const buzzComponent = (buzzScore || 0) * 0.30;

  let ivComponent = 0;
  if (ivHistorical > 0) {
    const elevation = (ivCurrent - ivHistorical) / ivHistorical;
    ivComponent = Math.max(0, Math.min(1, elevation)) * 25;
  }

  const priceComponent = Math.min(Math.abs(dailyChangePct || 0) / 5, 1) * 20;
  const coreBonus = isCore ? 15 : 0;
  const days = (daysSincePosted === null || daysSincePosted === undefined) ? 7 : daysSincePosted;
  const recencyBonus = Math.min(days / 7, 1) * 10;

  return Math.round(buzzComponent + ivComponent + priceComponent + coreBonus + recencyBonus);
}

module.exports = { calculatePriority };
