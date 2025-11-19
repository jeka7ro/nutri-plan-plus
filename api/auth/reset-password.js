import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Verifică dacă există tabela password_resets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Găsește token-ul valid
    const tokenResult = await pool.query(
      `SELECT user_id, expires_at FROM password_resets 
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );
    
    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const { user_id } = tokenResult.rows[0];
    
    // Hash parola nouă
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizează parola
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, user_id]
    );
    
    // Șterge token-ul (folosit o singură dată)
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
    
    console.log(`✅ Password reset successfully for user ${user_id}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
    
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

