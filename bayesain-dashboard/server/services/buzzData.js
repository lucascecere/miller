async function fetchBuzzScore(symbol) {
  // Phase 1 stub — Adanos API in Phase 2
  const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (hash * 7 + Date.now() % 100) % 101;
}

module.exports = { fetchBuzzScore };
