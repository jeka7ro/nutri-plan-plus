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
    console.log('🔍 [API /admin/users] Request received');
    
    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    console.log('✅ Token decoded:', decoded);
    
    // Get current user to check if admin
    const currentUserResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    console.log('👤 Current user query result:', currentUserResult.rows);
    
    if (currentUserResult.rows.length === 0) {
      console.log('❌ User not found with id:', decoded.id);
      return res.status(403).json({ error: 'User not found' });
    }
    
    if (currentUserResult.rows[0].role !== 'admin') {
      console.log('❌ User is not admin, role:', currentUserResult.rows[0].role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log('✅ User is admin, fetching all users...');
    
    // Get all users
    const result = await pool.query(`
      SELECT id, email, name, first_name, last_name, phone, role, subscription_tier, subscription_expires_at,
             start_date, birth_date, current_weight, target_weight,
             height, age, gender, activity_level, dietary_preferences, allergies,
             profile_picture, country, city, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);
    
    console.log('📊 Found', result.rows.length, 'users');
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Admin users error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
}

