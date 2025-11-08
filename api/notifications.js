// REAL ENDPOINT - Sistem notificări
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verifică autentificarea
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
  
  // Creează tabela dacă nu există
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        related_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        related_recipe_id INTEGER,
        message TEXT NOT NULL,
        action_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read)`);
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
  }
  
  // GET ?unread=true - Număr notificări necitite
  if (req.method === 'GET' && req.query.unread === 'true') {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
        [userId]
      );
      
      return res.status(200).json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
      console.error('❌ Notifications unread count error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET - Lista notificări
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          n.*,
          u.first_name as related_user_first_name,
          u.last_name as related_user_last_name,
          u.email as related_user_email,
          u.profile_picture as related_user_picture
        FROM notifications n
        LEFT JOIN users u ON n.related_user_id = u.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT 50
      `, [userId]);
      
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Notifications GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT ?readAll=true - Marchează toate ca citite
  if (req.method === 'PUT' && req.query.readAll === 'true') {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
        [userId]
      );
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Notifications mark all read error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT ?id=X - Marchează una ca citită
  if (req.method === 'PUT' && req.query.id) {
    const { id } = req.query;
    
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Notification mark read error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

