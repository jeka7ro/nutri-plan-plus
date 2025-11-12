import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔑 [API /admin/users/[id]/reset-password] Request received');
    
    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    // Get current user to check if admin
    const currentUserResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    
    if (currentUserResult.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    if (currentUserResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get user ID from URL and new password from body
    const { id: userId } = req.query;
    const { newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if target user exists
    const targetUserResult = await pool.query('SELECT id, email FROM users WHERE id = $1', [userId]);
    
    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'Target user not found' });
    }
    
    const targetUser = targetUserResult.rows[0];
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );
    
    console.log(`✅ Password reset for user ${targetUser.email} by admin ${decoded.id}`);
    
    return res.status(200).json({ 
      success: true, 
      message: `Password reset successfully for ${targetUser.email}` 
    });
    
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
}
