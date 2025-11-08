// REAL ENDPOINT - Admin checkins din PostgreSQL
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verifică autentificarea și rol admin
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Verifică dacă user-ul este admin
  try {
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Database error' });
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          dc.*,
          u.first_name,
          u.last_name,
          u.email
        FROM daily_checkins dc
        JOIN users u ON dc.user_id = u.id
        ORDER BY dc.date DESC, dc.user_id
        LIMIT 100
      `);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Admin checkins GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
