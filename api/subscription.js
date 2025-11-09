// COMBINED ENDPOINT - Subscription management (to stay within 12 function limit)
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
  
  // Asigură-te că tabelele și coloanele există
  try {
    // Adaugă coloane subscription în users
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active'`);
    
    // Creează tabel subscriptions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(20) NOT NULL,
        price_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_provider_id VARCHAR(255),
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_first_month BOOLEAN DEFAULT FALSE,
        created_by_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Marchează userii EXISTENȚI (înainte de 2025-11-09 17:00) ca PREMIUM GRATIS permanent
    await pool.query(`
      UPDATE users 
      SET subscription_plan = 'premium', subscription_status = 'active'
      WHERE created_at < '2025-11-09 17:00:00' AND subscription_plan = 'free'
    `);
    
    console.log('✅ Subscription tables and columns created/verified');
  } catch (error) {
    console.error('❌ Error in subscription setup:', error);
  }
  
  // GET /api/subscription - Status abonament user curent
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT subscription_plan, subscription_status FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = result.rows[0];
      
      // Verifică dacă e primul abonament
      const subscriptionHistory = await pool.query(
        'SELECT COUNT(*) as count FROM subscriptions WHERE user_id = $1 AND payment_status = $2',
        [userId, 'paid']
      );
      
      const isFirstPayment = subscriptionHistory.rows[0].count === '0';
      
      return res.status(200).json({
        plan: user.subscription_plan,
        status: user.subscription_status,
        isFirstPayment,
        firstMonthPrice: 200,
        monthlyPrice: 20
      });
    } catch (error) {
      console.error('❌ Subscription GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // POST ?check-limits=true - Verifică limite FREE
  if (req.method === 'POST' && req.query['check-limits'] === 'true') {
    const { feature } = req.body; // feature = 'recipes' | 'friends' | 'calendar' | 'food-db'
    
    try {
      const userResult = await pool.query(
        'SELECT subscription_plan FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows[0].subscription_plan === 'premium') {
        return res.status(200).json({ allowed: true, isPremium: true });
      }
      
      // FREE user - verifică limite
      if (feature === 'recipes') {
        const count = await pool.query(
          'SELECT COUNT(*) as count FROM user_recipes WHERE user_id = $1',
          [userId]
        );
        const allowed = parseInt(count.rows[0].count) < 1;
        return res.status(200).json({ 
          allowed, 
          isPremium: false,
          limit: 1,
          current: parseInt(count.rows[0].count),
          message: allowed ? 'OK' : 'Limită FREE atinsă (1 rețetă). Upgrade la Premium pentru nelimitat.'
        });
      }
      
      if (feature === 'friends') {
        return res.status(200).json({ 
          allowed: false, 
          isPremium: false,
          message: 'Prieteni disponibili doar în Premium. Upgrade pentru a te conecta cu prietenii.'
        });
      }
      
      if (feature === 'food-db') {
        return res.status(200).json({ 
          allowed: false, 
          isPremium: false,
          message: 'Food Database disponibil doar în Premium. Upgrade pentru acces la 200+ ingrediente.'
        });
      }
      
      if (feature === 'calendar') {
        return res.status(200).json({ 
          allowed: false, 
          isPremium: false,
          message: 'Calendar complet (28 zile) disponibil doar în Premium.'
        });
      }
      
      return res.status(200).json({ allowed: true });
    } catch (error) {
      console.error('❌ Check limits error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // POST ?grant=true - Admin activează Premium gratis (admin only!)
  if (req.method === 'POST' && req.query.grant === 'true') {
    const { targetUserId, durationMonths } = req.body;
    
    try {
      // Verifică că user-ul curent e admin
      const adminCheck = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
      );
      
      if (adminCheck.rows[0]?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
      }
      
      // Activează Premium
      const expiresAt = durationMonths === 'lifetime' 
        ? null 
        : new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000);
      
      await pool.query(
        'UPDATE users SET subscription_plan = $1, subscription_status = $2 WHERE id = $3',
        ['premium', 'active', targetUserId]
      );
      
      // Salvează în istoric
      await pool.query(`
        INSERT INTO subscriptions (user_id, plan_type, price_amount, payment_method, payment_status, expires_at, created_by_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [targetUserId, 'premium', 0, 'admin_grant', 'paid', expiresAt, true]);
      
      console.log(`✅ Admin granted premium to user ${targetUserId} for ${durationMonths} months`);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Grant premium error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

