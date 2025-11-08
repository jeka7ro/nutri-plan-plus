// REAL ENDPOINT - GET check-in by date din PostgreSQL
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

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

  // Verifică autentificarea
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('🔍 CHECKINS[DATE] - Token received:', !!token, token?.substring(0, 20) + '...');
  
  if (!token) {
    console.log('❌ CHECKINS[DATE] - No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
    console.log('✅ CHECKINS[DATE] - Token valid, userId:', userId);
  } catch (error) {
    console.log('❌ CHECKINS[DATE] - Invalid token:', error.message);
    return res.status(401).json({ error: 'Invalid token', details: error.message });
  }

  const { date } = req.query;
  
  try {
    const result = await pool.query(
      'SELECT * FROM daily_checkins WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    
    const checkin = result.rows[0] || null;
    console.log(`✅ GET /api/checkins/${date}:`, checkin ? 'FOUND' : 'NULL');
    
    return res.status(200).json(checkin);
  } catch (error) {
    console.error(`❌ GET /api/checkins/${date} error:`, error);
    return res.status(500).json({ error: error.message });
  }
}

