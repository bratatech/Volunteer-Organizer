const fs = require('fs').promises;
const path = require('path');

// Use /tmp for Vercel serverless, otherwise use local data directory
const isVercel = process.env.VERCEL === '1';
const seedDir = path.join(__dirname, '../data');          // always in the repo
const dataDir = isVercel ? '/tmp/data' : seedDir;         // runtime writes go here

const SEED_FILES = [
  'activities.json',
  'organizers.json',
  'tasks.json',
  'volunteers.json',
];

// Ensure data directory exists and seed missing files from the repo copy
const ensureDataDir = async () => {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // On Vercel /tmp is empty on cold start — copy seed files if they don't exist yet
  if (isVercel) {
    for (const file of SEED_FILES) {
      const dest = path.join(dataDir, file);
      try {
        await fs.access(dest);
      } catch {
        // File doesn't exist in /tmp, copy from seed
        try {
          const src = path.join(seedDir, file);
          await fs.copyFile(src, dest);
        } catch {
          // Seed file doesn't exist either — create an empty array
          await fs.writeFile(dest, '[]');
        }
      }
    }
  }
};

const readData = async (filename) => {
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeData = async (filename, data) => {
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw error;
  }
};

module.exports = { readData, writeData };
