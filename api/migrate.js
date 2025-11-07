import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('🔄 Starting database migration...');
    
    // Add missing columns to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+40',
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
    `);
    
    console.log('✅ Migration completed successfully!');
    
    return res.status(200).json({ 
      success: true,
      message: 'Database migrated successfully - columns first_name, last_name, phone added!' 
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return res.status(500).json({ 
      error: error.message,
      details: 'Migration failed'
    });
  }
}

