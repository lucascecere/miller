const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  // Split on semicolons and run each statement
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (e) {
      // Ignore "already exists" errors on CREATE TABLE IF NOT EXISTS
      if (!e.message.includes('already exists')) {
        console.warn('Schema statement warning:', e.message);
      }
    }
  }
  console.log('[DB] Schema initialized');
}

module.exports = { sql, initDb };
