const app = require('../server/index');
const { initDb } = require('../server/db/db');

// Init DB on cold start
let dbReady = false;
const dbInit = initDb().then(() => { dbReady = true; }).catch(console.error);

module.exports = async (req, res) => {
  if (!dbReady) await dbInit;
  return app(req, res);
};
