const fs = require('fs').promises;
const path = require('path');
const { getPool } = require('./db');

// ---------------------------------------------------------------------------
// Directory setup (same as before — JSON remains the local backup/cache)
// ---------------------------------------------------------------------------
const isVercel = process.env.VERCEL === '1';
const seedDir = path.join(__dirname, '../data');
const dataDir = isVercel ? '/tmp/data' : seedDir;

const SEED_FILES = ['activities.json', 'organizers.json', 'tasks.json', 'volunteers.json'];

// Map JSON filename → PostgreSQL table name
const TABLE_MAP = {
  'volunteers.json': 'volunteers',
  'organizers.json': 'organizers',
  'activities.json': 'activities',
  'tasks.json': 'tasks',
  'messages.json': 'messages',
};

// ---------------------------------------------------------------------------
// Data-shape transformers  (JS camelCase  ↔  DB snake_case)
// ---------------------------------------------------------------------------

const toDbRow = (table, obj) => {
  switch (table) {
    case 'volunteers': return {
      id: obj.id,
      email: obj.email,
      password: obj.password,
      roll_no: obj.rollNo ?? null,
      phone_no: obj.phoneNo ?? null,
      role: obj.role || 'volunteer',
      created_at: obj.createdAt ?? null,
      skills: JSON.stringify(obj.skills || []),
      interests: JSON.stringify(obj.interests || []),
      social_handles: JSON.stringify(obj.socialHandles || {}),
      badges: JSON.stringify(obj.badges || []),
      activities: JSON.stringify(obj.activities || []),
      certifications: JSON.stringify(obj.certifications || []),
      points: obj.points || 0,
    };
    case 'organizers': return {
      id: obj.id,
      email: obj.email,
      password: obj.password,
      role: obj.role || 'organizer',
      created_at: obj.createdAt ?? null,
      events_created: JSON.stringify(obj.eventsCreated || []),
    };
    case 'activities': return {
      id: obj.id,
      title: obj.title,
      description: obj.description ?? null,
      date: obj.date ?? null,
      location: obj.location ?? null,
      volunteers_needed: obj.volunteersNeeded || 0,
      leader_email: obj.leaderEmail ?? null,
      organizer_id: obj.organizerId ?? null,
      volunteers: JSON.stringify(obj.volunteers || []),
      status: obj.status || 'upcoming',
      created_at: obj.createdAt ?? null,
    };
    case 'tasks': return {
      id: obj.id,
      title: obj.title,
      description: obj.description ?? null,
      deadline: obj.deadline ?? null,
      priority: obj.priority || 'medium',
      organizer_id: obj.organizerId ?? null,
      assigned_to: obj.assignedTo ?? null,
      assigned_volunteer_id: obj.assignedVolunteerId ?? null,
      status: obj.status || 'unassigned',
      completed: obj.completed || false,
      created_at: obj.createdAt ?? null,
      activity_id: obj.activityId ?? null,
    };
    case 'messages': return {
      id: obj.id,
      activity_id: obj.activityId ?? null,
      sender_email: obj.senderEmail ?? null,
      sender_role: obj.senderRole ?? null,
      message: obj.message ?? null,
      timestamp: obj.timestamp ?? null,
    };
    default: return obj;
  }
};

const fromDbRow = (table, row) => {
  switch (table) {
    case 'volunteers': return {
      id: row.id,
      email: row.email,
      password: row.password,
      rollNo: row.roll_no,
      phoneNo: row.phone_no,
      role: row.role,
      createdAt: row.created_at,
      skills: row.skills || [],
      interests: row.interests || [],
      socialHandles: row.social_handles || {},
      badges: row.badges || [],
      activities: row.activities || [],
      certifications: row.certifications || [],
      points: row.points || 0,
    };
    case 'organizers': return {
      id: row.id,
      email: row.email,
      password: row.password,
      role: row.role,
      createdAt: row.created_at,
      eventsCreated: row.events_created || [],
    };
    case 'activities': return {
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      location: row.location,
      volunteersNeeded: row.volunteers_needed,
      leaderEmail: row.leader_email,
      organizerId: row.organizer_id,
      volunteers: row.volunteers || [],
      status: row.status,
      createdAt: row.created_at,
    };
    case 'tasks': return {
      id: row.id,
      title: row.title,
      description: row.description,
      deadline: row.deadline,
      priority: row.priority,
      organizerId: row.organizer_id,
      assignedTo: row.assigned_to,
      assignedVolunteerId: row.assigned_volunteer_id,
      status: row.status,
      completed: row.completed,
      createdAt: row.created_at,
      activityId: row.activity_id,
    };
    case 'messages': return {
      id: row.id,
      activityId: row.activity_id,
      senderEmail: row.sender_email,
      senderRole: row.sender_role,
      message: row.message,
      timestamp: row.timestamp,
    };
    default: return row;
  }
};

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

const isSupabaseEnabled = () => !!process.env.DATABASE_URL;

/** Read all rows from a Supabase table. Returns null on error/disabled. */
const readFromSupabase = async (table) => {
  const pool = getPool();
  if (!pool) return null;
  try {
    const orderCol = table === 'messages' ? 'timestamp' : 'created_at';
    const result = await pool.query(
      `SELECT * FROM ${table} ORDER BY ${orderCol} ASC NULLS LAST`
    );
    return result.rows.map(row => fromDbRow(table, row));
  } catch (err) {
    console.warn(`⚠️  Supabase read failed [${table}]: ${err.message} — falling back to JSON.`);
    return null;
  }
};

/**
 * Sync the full dataArray to Supabase using upsert + delete-orphans.
 * Wrapped in a transaction so it's atomic.
 */
const writeToSupabase = async (table, dataArray) => {
  const pool = getPool();
  if (!pool) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (dataArray.length === 0) {
      await client.query(`DELETE FROM ${table}`);
    } else {
      // 1. Remove rows whose IDs are no longer in the array
      const ids = dataArray.map(item => item.id);
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
      await client.query(
        `DELETE FROM ${table} WHERE id NOT IN (${placeholders})`,
        ids
      );

      // 2. Upsert every current item
      for (const item of dataArray) {
        const row = toDbRow(table, item);
        const cols = Object.keys(row);
        const vals = Object.values(row);
        const colSql = cols.map(c => `"${c}"`).join(', ');
        const valSql = vals.map((_, i) => `$${i + 1}`).join(', ');
        const updSql = cols
          .filter(c => c !== 'id')
          .map(c => `"${c}" = EXCLUDED."${c}"`)
          .join(', ');

        await client.query(
          `INSERT INTO ${table} (${colSql})
           VALUES (${valSql})
           ON CONFLICT (id) DO UPDATE SET ${updSql}`,
          vals
        );
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ Supabase write failed [${table}]:`, err.message);
  } finally {
    client.release();
  }
};

// ---------------------------------------------------------------------------
// Local JSON helpers (unchanged from original)
// ---------------------------------------------------------------------------

const ensureDataDir = async () => {
  try { await fs.mkdir(dataDir, { recursive: true }); } catch (_) { }

  if (isVercel) {
    for (const file of SEED_FILES) {
      const dest = path.join(dataDir, file);
      try {
        await fs.access(dest);
      } catch {
        try {
          await fs.copyFile(path.join(seedDir, file), dest);
        } catch {
          await fs.writeFile(dest, '[]');
        }
      }
    }
  }
};

// ---------------------------------------------------------------------------
// Public API  (drop-in replacement — all route files stay untouched)
// ---------------------------------------------------------------------------

/**
 * readData(filename)
 * Tries Supabase first; falls back to local JSON file.
 */
const readData = async (filename) => {
  const table = TABLE_MAP[filename];

  // 1. Try Supabase first
  if (table && isSupabaseEnabled()) {
    const rows = await readFromSupabase(table);
    // Only trust Supabase result if it returned something (not null = error)
    // AND either it has data OR the JSON file is also empty (to avoid stale-read bugs)
    if (rows !== null && rows.length > 0) return rows;
    // If Supabase returned empty, check JSON before trusting it
    if (rows !== null && rows.length === 0) {
      try {
        const filePath = path.join(dataDir, filename);
        const raw = await fs.readFile(filePath, 'utf8').catch(() => '');
        const jsonData = raw && raw.trim() ? JSON.parse(raw) : [];
        // If JSON has data that Supabase doesn't, use JSON (and re-sync)
        if (jsonData.length > 0) {
          console.log(`ℹ️  Supabase [${table}] is empty but JSON has ${jsonData.length} rows — using JSON and re-syncing.`);
          writeToSupabase(table, jsonData).catch(() => {});
          return jsonData;
        }
      } catch { /* JSON also empty, return [] */ }
      return [];
    }
  }

  // 2. Fallback: local JSON file
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, filename);
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw || raw.trim() === '') return [];
    try { return JSON.parse(raw); }
    catch { return []; }
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
};

/**
 * writeData(filename, data)
 * Writes to local JSON file AND syncs to Supabase asynchronously.
 */
const writeData = async (filename, data) => {
  // 1. Always persist locally first (fast, synchronous)
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  // 2. Sync to Supabase — AWAITED so reads immediately after writes see the data
  const table = TABLE_MAP[filename];
  if (table && isSupabaseEnabled()) {
    try {
      await writeToSupabase(table, data);
    } catch (err) {
      console.error(`❌ Supabase sync failed [${table}]:`, err.message);
      // Non-fatal: data is safe in JSON, continue
    }
  }
};

/**
 * verifyAndInitializeDatabases()
 * Ensures all local JSON files exist and are valid.
 */
const verifyAndInitializeDatabases = async () => {
  await ensureDataDir();
  const dbFiles = ['volunteers.json', 'activities.json', 'tasks.json', 'messages.json', 'organizers.json'];

  for (const file of dbFiles) {
    const filePath = path.join(dataDir, file);
    let needsInit = false;
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      if (!raw || raw.trim() === '') needsInit = true;
      else JSON.parse(raw);
    } catch {
      needsInit = true;
    }
    if (needsInit) {
      await fs.writeFile(filePath, '[]');
      console.log(`📄 JSON file initialized: ${file}`);
    }
  }
  console.log('✅ JSON database files verified.');
};

module.exports = { readData, writeData, verifyAndInitializeDatabases };
