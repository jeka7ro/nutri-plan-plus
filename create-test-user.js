import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const TARGET_URL = process.env.TARGET_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!TARGET_URL) {
  console.error('❌ Error: Missing TARGET_POSTGRES_URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: TARGET_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTestUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating test user...\n');
    
    const email = 'jeka7ro@gmail.com';
    const password = 'test123'; // Parolă temporară - schimbă-o după login!
    const name = 'Eugeniu';
    
    // Check if user exists
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existing.rows.length > 0) {
      console.log(`⚠️  User ${email} already exists!`);
      console.log('   Updating password...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await client.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, email]
      );
      
      console.log(`✅ Password updated for ${email}`);
      console.log(`\n📋 Login credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`\n⚠️  IMPORTANT: Change password after first login!`);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await client.query(`
      INSERT INTO users (email, password, name, role, subscription_tier)
      VALUES ($1, $2, $3, 'admin', 'premium')
      RETURNING id, email, name, role
    `, [email, hashedPassword, name]);
    
    const user = result.rows[0];
    
    console.log(`✅ User created successfully!`);
    console.log(`\n📋 Login credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log(`\n⚠️  IMPORTANT: Change password after first login!`);
    console.log(`\n🚀 Now you can login at: https://eatnfit.onrender.com/app`);
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

createTestUser().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}).finally(() => {
  pool.end();
});

