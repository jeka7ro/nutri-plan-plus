import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS weight_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      weight NUMERIC(6,2) NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      notes TEXT,
      mood VARCHAR(50),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date DESC, created_at DESC)`);
  tableEnsured = true;
}

const mapRow = (row) => ({
  id: row.id,
  weight: row.weight !== null ? parseFloat(row.weight) : null,
  date: row.date ? row.date.toISOString().split('T')[0] : null,
  notes: row.notes || '',
  mood: row.mood || 'normal',
  created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  let userId;
  try {
    const decoded = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
    userId = decoded.id;
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    await ensureTable();
  } catch (error) {
    console.error('❌ Error ensuring weight_entries table:', error);
    return res.status(500).json({ error: 'Database initialization failed' });
  }

  if (req.query.admin === 'true') {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { rows: userRows } = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (userRows.length === 0 || userRows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { rows } = await pool.query(
        `SELECT we.id, we.user_id, we.weight, we.date, we.notes, we.mood, we.created_at,
                u.email, u.first_name, u.last_name
         FROM weight_entries we
         JOIN users u ON u.id = we.user_id
         ORDER BY we.created_at DESC`,
        []
      );

      return res.status(200).json(
        rows.map((row) => ({
          ...mapRow(row),
          user_id: row.user_id,
          user_email: row.email,
          user_name: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : row.email,
        }))
      );
    } catch (error) {
      console.error('❌ Admin weight GET error:', error);
      return res.status(500).json({ error: 'Failed to load admin weight entries' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(
        `SELECT id, weight, date, notes, mood, created_at
         FROM weight_entries
         WHERE user_id = $1
         ORDER BY date DESC, created_at DESC`,
        [userId]
      );
      return res.status(200).json(rows.map(mapRow));
    } catch (error) {
      console.error('❌ Weight GET error:', error);
      return res.status(500).json({ error: 'Failed to load weight history' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { weight, date, notes, mood } = req.body || {};

      const parsedWeight = parseFloat(weight);
      if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
        return res.status(400).json({ error: 'Weight must be a positive number' });
      }

      let entryDate = new Date();
      if (date) {
        const candidate = new Date(date);
        if (Number.isNaN(candidate.getTime())) {
          return res.status(400).json({ error: 'Invalid date format' });
        }
        entryDate = candidate;
      }

      const { rows } = await pool.query(
        `INSERT INTO weight_entries (user_id, weight, date, notes, mood)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, weight, date, notes, mood, created_at`,
        [userId, parsedWeight, entryDate.toISOString().split('T')[0], notes || '', mood || 'normal']
      );

      return res.status(201).json(mapRow(rows[0]));
    } catch (error) {
      console.error('❌ Weight POST error:', error);
      return res.status(500).json({ error: 'Failed to save weight entry' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Weight entry ID is required' });
    }

    try {
      const { rows } = await pool.query(
        `DELETE FROM weight_entries
         WHERE id = $1 AND user_id = $2
         RETURNING id, weight, date, notes, mood, created_at`,
        [id, userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Weight entry not found' });
      }

      return res.status(200).json(mapRow(rows[0]));
    } catch (error) {
      console.error('❌ Weight DELETE error:', error);
      return res.status(500).json({ error: 'Failed to delete weight entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
