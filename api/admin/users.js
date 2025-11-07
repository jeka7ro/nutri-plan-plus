import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    // Get current user to check if admin
    const currentUserResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    if (currentUserResult.rows.length === 0 || currentUserResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get all users
    const result = await pool.query(`
      SELECT id, email, name, role, subscription_tier, subscription_expires_at,
             start_date, birth_date, current_weight, target_weight,
             height, age, gender, activity_level, dietary_preferences, allergies,
             profile_picture, country, city, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

