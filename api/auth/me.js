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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const { password, ...userData } = user;
    
    // GET - return user data
    if (req.method === 'GET') {
      return res.status(200).json(userData);
    }
    
    // PUT - update user profile
    if (req.method === 'PUT') {
      const updates = req.body;
      const allowedFields = [
        'name', 'first_name', 'last_name', 'phone', 'birth_date', 'current_weight', 'target_weight',
        'height', 'age', 'gender', 'activity_level', 'start_date',
        'dietary_preferences', 'allergies', 'profile_picture',
        'country', 'city'
      ];
      
      const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      const values = fields.map(field => updates[field]);
      values.push(decoded.id);
      
      const updateResult = await pool.query(`
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${values.length}
        RETURNING *
      `, values);
      
      const { password: _, ...updatedUserData } = updateResult.rows[0];
      return res.status(200).json(updatedUserData);
    }
    
    // POST - change password
    if (req.method === 'POST') {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await pool.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, decoded.id]
      );
      
      return res.status(200).json({ 
        success: true,
        message: 'Password changed successfully' 
      });
    }
    
  } catch (error) {
    console.error('❌ Auth error in /api/auth/me:', error);
    console.error('Method:', req.method);
    console.error('Headers:', req.headers);
    console.error('Body:', req.body);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}

