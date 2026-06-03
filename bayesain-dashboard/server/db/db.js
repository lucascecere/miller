const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function initDb() {
  // Schema is managed via Supabase migrations — nothing to run at startup
  console.log('[DB] Supabase client ready');
}

module.exports = { supabase, initDb };
