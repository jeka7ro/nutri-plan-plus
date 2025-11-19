import pkg from 'pg';
const { Pool } = pkg;
import { config } from './server/config.js';

// Connection string de la Render
const RENDER_URL = process.env.RENDER_POSTGRES_URL || process.env.TARGET_POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!RENDER_URL) {
  console.error('❌ Error: Missing Render PostgreSQL connection string!');
  console.error('\nSet environment variable:');
  console.error('  RENDER_POSTGRES_URL = [connection string de la Render PostgreSQL]');
  console.error('\nSAU:');
  console.error('  DATABASE_URL = [connection string]');
  console.error('  POSTGRES_URL = [connection string]');
  process.exit(1);
}

const pool = new Pool({
  connectionString: RENDER_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  console.log('🔍 Checking Render PostgreSQL Database...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Test connection
    console.log('1️⃣ Testing connection...');
    await client.query('SELECT 1');
    console.log('   ✅ Connected to Render PostgreSQL\n');
    
    // 2. Check if tables exist
    console.log('2️⃣ Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`   📊 Found ${tables.length} tables:`, tables.join(', '));
    
    if (!tables.includes('users')) {
      console.log('   ❌ ERROR: "users" table does not exist!');
      console.log('   💡 Solution: Run database initialization');
      return;
    }
    console.log('   ✅ "users" table exists\n');
    
    // 3. Check users count
    console.log('3️⃣ Checking users...');
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    const usersCount = parseInt(usersResult.rows[0].count);
    console.log(`   📊 Total users: ${usersCount}`);
    
    if (usersCount === 0) {
      console.log('   ⚠️  WARNING: No users in database!');
      console.log('   💡 Solution: Run migration script (migrate-all-data-to-render.js)');
    } else {
      // Check specific user
      const testUser = await client.query(
        "SELECT id, email, name, role FROM users WHERE email = $1",
        ['jeka7ro@gmail.com']
      );
      
      if (testUser.rows.length > 0) {
        console.log(`   ✅ Found user: ${testUser.rows[0].email} (ID: ${testUser.rows[0].id}, Role: ${testUser.rows[0].role})`);
      } else {
        console.log('   ⚠️  User "jeka7ro@gmail.com" not found');
        console.log('   💡 Solution: Run migration script');
      }
    }
    console.log('');
    
    // 4. Check recipes
    if (tables.includes('recipes')) {
      console.log('4️⃣ Checking recipes...');
      const recipesResult = await client.query('SELECT COUNT(*) as count FROM recipes');
      const recipesCount = parseInt(recipesResult.rows[0].count);
      console.log(`   📊 Total recipes: ${recipesCount}`);
      
      const recipesWithImages = await client.query(
        "SELECT COUNT(*) as count FROM recipes WHERE image_url IS NOT NULL AND image_url != ''"
      );
      const imagesCount = parseInt(recipesWithImages.rows[0].count);
      console.log(`   🖼️  Recipes with images: ${imagesCount}`);
      console.log('');
    }
    
    // 5. Check JWT_SECRET
    console.log('5️⃣ Checking JWT_SECRET...');
    const jwtSecret = config.jwtSecret;
    if (jwtSecret && jwtSecret !== 'nutri-plan-plus-super-secret-key-2024') {
      console.log('   ✅ JWT_SECRET is set (custom value)');
    } else if (jwtSecret) {
      console.log('   ⚠️  WARNING: JWT_SECRET is using default value!');
      console.log('   💡 Solution: Set JWT_SECRET environment variable on Render');
    } else {
      console.log('   ❌ ERROR: JWT_SECRET is not set!');
      console.log('   💡 Solution: Set JWT_SECRET environment variable on Render');
    }
    console.log('');
    
    // 6. Summary
    console.log('📋 SUMMARY:');
    console.log('   - Database connection: ✅');
    console.log(`   - Tables exist: ${tables.length > 0 ? '✅' : '❌'}`);
    console.log(`   - Users in database: ${usersCount > 0 ? `✅ (${usersCount})` : '❌ (0)'}`);
    console.log(`   - JWT_SECRET configured: ${jwtSecret && jwtSecret !== 'nutri-plan-plus-super-secret-key-2024' ? '✅' : '⚠️'}`);
    console.log('');
    
    if (usersCount === 0) {
      console.log('🚨 ACTION REQUIRED:');
      console.log('   1. Run migration script: node migrate-all-data-to-render.js');
      console.log('   2. Or create a test user manually');
    }
    
    if (!jwtSecret || jwtSecret === 'nutri-plan-plus-super-secret-key-2024') {
      console.log('🚨 ACTION REQUIRED:');
      console.log('   1. Go to Render Dashboard → nutriplan-app → Environment');
      console.log('   2. Add/Update JWT_SECRET environment variable');
      console.log('   3. Use a strong random string (e.g., generate with: openssl rand -hex 32)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Possible solutions:');
    console.error('   1. Check connection string is correct');
    console.error('   2. Check database is accessible');
    console.error('   3. Check network/firewall settings');
  } finally {
    client.release();
    await pool.end();
  }
}

checkDatabase();

