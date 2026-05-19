const { Pool } = require('pg');
const dns = require('dns');
const { URL } = require('url');

let pool = null;

/**
 * Resolves the DATABASE_URL hostname to an IPv4 address.
 * This fixes ETIMEDOUT errors caused by Node.js trying IPv6 first on Supabase's
 * direct connection (db.[ref].supabase.co:5432).
 */
const resolveIPv4Url = (connectionString) => {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(connectionString);
      const hostname = parsed.hostname;

      dns.lookup(hostname, { family: 4 }, (err, address) => {
        if (err || !address) {
          // DNS failed — return original string and let pg try on its own
          console.warn(`⚠️  IPv4 DNS resolution failed for ${hostname}: ${err?.message}. Using original URL.`);
          resolve(connectionString);
        } else {
          // Replace hostname with resolved IPv4 address
          parsed.hostname = address;
          resolve(parsed.toString());
        }
      });
    } catch {
      resolve(connectionString); // Not a valid URL — return as-is
    }
  });
};

/**
 * Returns a singleton pg Pool connected to Supabase via DATABASE_URL.
 * Returns null if DATABASE_URL is not configured.
 */
const getPool = () => {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) return null;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected Supabase pool error:', err.message);
  });

  return pool;
};

/**
 * Creates all required tables in Supabase using CREATE TABLE IF NOT EXISTS.
 * Safe to call on every server start — idempotent and NON-FATAL.
 * If the connection fails the server continues in JSON-only mode.
 */
const initializeTables = async () => {
  if (!process.env.DATABASE_URL) {
    console.log('ℹ️  DATABASE_URL not set — running in JSON-only mode.');
    return;
  }

  // Resolve hostname to IPv4 BEFORE creating the pool (fixes ETIMEDOUT)
  const resolvedUrl = await resolveIPv4Url(process.env.DATABASE_URL);

  // Create a one-off pool with the resolved IPv4 URL for the DDL queries
  const initPool = new Pool({
    connectionString: resolvedUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    max: 1,
  });

  let client;
  try {
    client = await initPool.connect();
  } catch (err) {
    console.warn(`⚠️  Supabase connection failed: ${err.message}`);
    console.warn('   Server will run in JSON-only mode until the DB is reachable.');
    await initPool.end().catch(() => {});
    return;
  }

  try {
    // Also recreate the main pool with the resolved IPv4 URL
    if (pool) { await pool.end().catch(() => {}); pool = null; }
    pool = new Pool({
      connectionString: resolvedUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
    });
    pool.on('error', (err) => {
      console.error('Supabase pool error:', err.message);
    });

    // --- VOLUNTEERS ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id              TEXT PRIMARY KEY,
        email           TEXT UNIQUE NOT NULL,
        password        TEXT NOT NULL,
        roll_no         TEXT,
        phone_no        TEXT,
        role            TEXT        DEFAULT 'volunteer',
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        skills          JSONB       DEFAULT '[]'::jsonb,
        interests       JSONB       DEFAULT '[]'::jsonb,
        social_handles  JSONB       DEFAULT '{}'::jsonb,
        badges          JSONB       DEFAULT '[]'::jsonb,
        activities      JSONB       DEFAULT '[]'::jsonb,
        certifications  JSONB       DEFAULT '[]'::jsonb,
        points          INTEGER     DEFAULT 0
      );
    `);

    // --- ORGANIZERS ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizers (
        id              TEXT PRIMARY KEY,
        email           TEXT UNIQUE NOT NULL,
        password        TEXT NOT NULL,
        role            TEXT        DEFAULT 'organizer',
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        events_created  JSONB       DEFAULT '[]'::jsonb
      );
    `);

    // --- ACTIVITIES ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id                TEXT PRIMARY KEY,
        title             TEXT NOT NULL,
        description       TEXT,
        date              TEXT,
        location          TEXT,
        volunteers_needed INTEGER     DEFAULT 0,
        leader_email      TEXT,
        organizer_id      TEXT,
        volunteers        JSONB       DEFAULT '[]'::jsonb,
        status            TEXT        DEFAULT 'upcoming',
        created_at        TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // --- TASKS ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id                    TEXT PRIMARY KEY,
        title                 TEXT NOT NULL,
        description           TEXT,
        deadline              TEXT,
        priority              TEXT     DEFAULT 'medium',
        organizer_id          TEXT,
        assigned_to           TEXT,
        assigned_volunteer_id TEXT,
        status                TEXT     DEFAULT 'unassigned',
        completed             BOOLEAN  DEFAULT false,
        created_at            TIMESTAMPTZ DEFAULT NOW(),
        activity_id           TEXT
      );
    `);

    // --- MESSAGES ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id           TEXT PRIMARY KEY,
        activity_id  TEXT,
        sender_email TEXT,
        sender_role  TEXT,
        message      TEXT,
        timestamp    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('✅ Supabase: All tables verified / created successfully.');
  } catch (err) {
    console.error('❌ Supabase table init error:', err.message);
  } finally {
    client.release();
    await initPool.end().catch(() => {});
  }
};

module.exports = { getPool, initializeTables };
