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
  
  // SPECIAL ENDPOINT: Run migration if ?migrate=true (no auth required)
  if (req.query.migrate === 'true' && req.method === 'GET') {
    console.log('🔧 RUNNING DATABASE MIGRATION...');
    try {
      // Check if columns exist
      const checkColumns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('first_name', 'last_name', 'phone')
      `);
      
      const existingColumns = checkColumns.rows.map(c => c.column_name);
      console.log('✅ Existing columns:', existingColumns);
      
      const migrations = [];
      
      const needsFirstName = !existingColumns.includes('first_name');
      const needsLastName = !existingColumns.includes('last_name');
      const needsPhone = !existingColumns.includes('phone');
      
      if (needsFirstName) {
        console.log('➕ Adding first_name...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)');
        migrations.push('first_name');
      }
      
      if (needsLastName) {
        console.log('➕ Adding last_name...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)');
        migrations.push('last_name');
      }
      
      if (needsPhone) {
        console.log('➕ Adding phone...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
        migrations.push('phone');
      }
      
      // Creează tabela backups dacă nu există
      console.log('📦 Checking backups table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS backups (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          backup_data TEXT,
          size_mb DECIMAL(10,2),
          created_by INTEGER REFERENCES users(id),
          auto_generated BOOLEAN DEFAULT false,
          tables_included TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      migrations.push('backups_table');
      
      // Adaugă coloana last_login dacă nu există
      console.log('🕐 Checking last_login column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
      `);
      migrations.push('last_login_column');
      
      console.log('✅ MIGRATION COMPLETE!');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Migration completed successfully!',
        added: migrations,
        existing: existingColumns
      });
      
    } catch (error) {
      console.error('❌ MIGRATION ERROR:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: error.stack
      });
    }
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

