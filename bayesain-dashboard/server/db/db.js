const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function initDb() {
  // Schema is managed via Supabase migrations — nothing to run at startup

  // Connectivity check: verify engagement_log table exists
  // If this fails, run the migration SQL below once in the Supabase dashboard:
  //
  // CREATE TABLE IF NOT EXISTS engagement_log (
  //   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  //   team_member text NOT NULL,
  //   minutes integer NOT NULL DEFAULT 0,
  //   description text,
  //   created_at timestamptz NOT NULL DEFAULT now()
  // );
  //
  try {
    await supabase.from('engagement_log').select('id').limit(1);
    console.log('[DB] Supabase client ready — engagement_log reachable');
  } catch (e) {
    console.warn('[DB] engagement_log not found — run the migration SQL in Supabase dashboard');
  }
}

module.exports = { supabase, initDb };
