const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new Database('database.db');

// Create the loadouts table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS loadouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_mode TEXT NOT NULL,
    active_skill TEXT NOT NULL,
    passive_1 TEXT NOT NULL,
    passive_2 TEXT NOT NULL,
    passive_3 TEXT NOT NULL
  )
`);

// 0. Health Check Route (Required for Render deployment)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 1. CREATE: Add a new loadout (POST)
app.post('/loadouts', (req, res) => {
  const { game_mode, active_skill, passive_1, passive_2, passive_3 } = req.body;
  const stmt = db.prepare(`
    INSERT INTO loadouts (game_mode, active_skill, passive_1, passive_2, passive_3) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  try {
    const info = stmt.run(game_mode, active_skill, passive_1, passive_2, passive_3);
    res.status(201).json({ id: info.lastInsertRowid, message: 'Loadout created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create loadout' });
  }
});

// 2. READ: Get all loadouts (GET)
app.get('/loadouts', (req, res) => {
  const stmt = db.prepare('SELECT * FROM loadouts ORDER BY id DESC');
  try {
    const loadouts = stmt.all();
    res.json(loadouts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch loadouts' });
  }
});

// 3. UPDATE: Edit an existing loadout (PUT)
app.put('/loadouts/:id', (req, res) => {
  const { id } = req.params;
  const { game_mode, active_skill, passive_1, passive_2, passive_3 } = req.body;
  
  const stmt = db.prepare(`
    UPDATE loadouts 
    SET game_mode = ?, active_skill = ?, passive_1 = ?, passive_2 = ?, passive_3 = ? 
    WHERE id = ?
  `);
  
  try {
    const info = stmt.run(game_mode, active_skill, passive_1, passive_2, passive_3, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Loadout not found' });
    res.json({ message: 'Loadout updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update loadout' });
  }
});

// 4. DELETE: Remove a loadout (DELETE)
app.delete('/loadouts/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM loadouts WHERE id = ?');
  
  try {
    const info = stmt.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Loadout not found' });
    res.json({ message: 'Loadout deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete loadout' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});