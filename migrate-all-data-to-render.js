import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connection strings
const NEON_URL = process.env.NEON_POSTGRES_URL || process.env.NEON_DATABASE_URL;
const RENDER_URL = process.env.RENDER_POSTGRES_URL || process.env.RENDER_DATABASE_URL;

if (!NEON_URL || !RENDER_URL) {
  console.error('❌ Error: Missing connection strings!');
  console.error('Set NEON_POSTGRES_URL and RENDER_POSTGRES_URL environment variables');
  process.exit(1);
}

const neonPool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
});

const renderPool = new Pool({
  connectionString: RENDER_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateTable(tableName, transformFn = null) {
  console.log(`\n🔄 Migrating ${tableName}...`);
  
  const neonClient = await neonPool.connect();
  const renderClient = await renderPool.connect();
  
  try {
    // Get all data from Neon
    const result = await neonClient.query(`SELECT * FROM ${tableName} ORDER BY id`);
    const rows = result.rows;
    
    console.log(`   📊 Found ${rows.length} records in Neon`);
    
    if (rows.length === 0) {
      console.log(`   ⏭️  Skipping ${tableName} (no data)`);
      return;
    }
    
    // Transform data if needed
    const dataToInsert = transformFn ? rows.map(transformFn) : rows;
    
    // Insert into Render
    let inserted = 0;
    let skipped = 0;
    
    for (const row of dataToInsert) {
      try {
        // Build INSERT query dynamically
        const columns = Object.keys(row).filter(key => row[key] !== undefined);
        const values = columns.map((_, index) => `$${index + 1}`);
        const columnNames = columns.join(', ');
        const placeholders = values.join(', ');
        
        // Check if record already exists (by id)
        const exists = await renderClient.query(
          `SELECT id FROM ${tableName} WHERE id = $1`,
          [row.id]
        );
        
        if (exists.rows.length > 0) {
          // Update existing record
          const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ');
          const updateValues = columns.map(col => {
            // Handle JSON fields
            if (typeof row[col] === 'object' && row[col] !== null) {
              return JSON.stringify(row[col]);
            }
            return row[col];
          });
          updateValues.push(row.id);
          
          await renderClient.query(
            `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${updateValues.length}`,
            updateValues
          );
          skipped++;
        } else {
          // Insert new record
          const insertValues = columns.map(col => {
            // Handle JSON fields
            if (typeof row[col] === 'object' && row[col] !== null) {
              return JSON.stringify(row[col]);
            }
            return row[col];
          });
          
          await renderClient.query(
            `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
            insertValues
          );
          inserted++;
        }
      } catch (error) {
        console.error(`   ❌ Error inserting record ${row.id}:`, error.message);
      }
    }
    
    console.log(`   ✅ Migrated ${tableName}: ${inserted} inserted, ${skipped} updated`);
    
  } catch (error) {
    console.error(`   ❌ Error migrating ${tableName}:`, error.message);
    throw error;
  } finally {
    neonClient.release();
    renderClient.release();
  }
}

async function main() {
  console.log('🚀 Starting migration from Neon to Render PostgreSQL...\n');
  console.log('📋 This will migrate:');
  console.log('   - Users (toți userii)');
  console.log('   - Recipes (toate rețetele - admin și user)');
  console.log('   - Daily Check-ins');
  console.log('   - Weight Entries');
  console.log('   - Progress Notes');
  console.log('   - Friendships');
  console.log('   - Messages');
  console.log('   - Subscription Codes');
  console.log('   - Backups');
  console.log('   - Payment Processors\n');
  
  try {
    // Test connections
    console.log('🔌 Testing connections...');
    await neonPool.query('SELECT 1');
    console.log('   ✅ Connected to Neon');
    await renderPool.query('SELECT 1');
    console.log('   ✅ Connected to Render PostgreSQL');
    
    // Migrate tables in order (respecting foreign keys)
    await migrateTable('users');
    await migrateTable('recipes');
    await migrateTable('daily_checkins');
    await migrateTable('weight_entries');
    await migrateTable('progress_notes');
    await migrateTable('friendships');
    await migrateTable('messages');
    await migrateTable('subscription_codes');
    await migrateTable('backups');
    await migrateTable('payment_processors');
    
    // Migrate password_resets if exists
    try {
      await migrateTable('password_resets');
    } catch (e) {
      console.log('   ⏭️  password_resets table doesn\'t exist, skipping');
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update Render environment variables to use Render PostgreSQL');
    console.log('   2. Test login with existing users');
    console.log('   3. Verify all data is accessible');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await neonPool.end();
    await renderPool.end();
  }
}

main();

