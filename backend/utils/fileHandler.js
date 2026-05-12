const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../data');

const readData = async (filename) => {
  try {
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
    const filePath = path.join(dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw error;
  }
};

module.exports = { readData, writeData };
