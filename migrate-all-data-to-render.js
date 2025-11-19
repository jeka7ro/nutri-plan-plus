import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connection strings
// SOURCE = baza de date existentă (de unde migrăm)
// TARGET = Render PostgreSQL (unde migrăm)
const SOURCE_URL = process.env.SOURCE_POSTGRES_URL || process.env.SOURCE_DATABASE_URL || process.env.POSTGRES_URL;
const TARGET_URL = process.env.TARGET_POSTGRES_URL || process.env.TARGET_DATABASE_URL || process.env.RENDER_POSTGRES_URL;

if (!SOURCE_URL || !TARGET_URL) {
  console.error('❌ Error: Missing connection strings!');
  console.error('\nSet environment variables:');
  console.error('  SOURCE_POSTGRES_URL = [connection string de la baza de date existentă]');
  console.error('  TARGET_POSTGRES_URL = [connection string de la Render PostgreSQL]');
  console.error('\nSAU:');
  console.error('  POSTGRES_URL = [sursa]');
  console.error('  RENDER_POSTGRES_URL = [destinația Render]');
  process.exit(1);
}

const sourcePool = new Pool({
  connectionString: SOURCE_URL,
  ssl: { rejectUnauthorized: false }
});

const targetPool = new Pool({
  connectionString: TARGET_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateTable(tableName, transformFn = null) {
  console.log(`\n🔄 Migrating ${tableName}...`);
  
  const sourceClient = await sourcePool.connect();
  const targetClient = await targetPool.connect();
  
  try {
    // Get all data from source database
    const result = await sourceClient.query(`SELECT * FROM ${tableName} ORDER BY id`);
    const rows = result.rows;
    
    console.log(`   📊 Found ${rows.length} records in source database`);
    
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
        const exists = await targetClient.query(
          `SELECT id FROM ${tableName} WHERE id = $1`,
          [row.id]
        );
        
        if (exists.rows.length > 0) {
          // Update existing record
          const setClause = columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ');
          const updateValues = columns.map(col => {
            // Handle JSON fields
            if (typeof row[col] === 'object' && row[col] !== null && !Array.isArray(row[col])) {
              return JSON.stringify(row[col]);
            }
            // Handle arrays (already JSON in PostgreSQL)
            if (Array.isArray(row[col])) {
              return JSON.stringify(row[col]);
            }
            return row[col];
          });
          updateValues.push(row.id);
          
          await targetClient.query(
            `UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${updateValues.length}`,
            updateValues
          );
          skipped++;
        } else {
          // Insert new record
          const insertValues = columns.map(col => {
            // Handle JSON fields
            if (typeof row[col] === 'object' && row[col] !== null && !Array.isArray(row[col])) {
              return JSON.stringify(row[col]);
            }
            // Handle arrays (already JSON in PostgreSQL)
            if (Array.isArray(row[col])) {
              return JSON.stringify(row[col]);
            }
            return row[col];
          });
          
          await targetClient.query(
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
    sourceClient.release();
    targetClient.release();
  }
}

async function main() {
  console.log('🚀 Starting migration to Render PostgreSQL...\n');
  console.log('📋 This will migrate TOATE datele:');
  console.log('   - Users (toți userii - cu poze, profile_picture, etc.)');
  console.log('   - Recipes (toate rețetele - admin și user - cu poze)');
  console.log('   - Daily Check-ins (toate check-in-urile)');
  console.log('   - Weight Entries (toate măsurătorile de greutate)');
  console.log('   - Progress Notes (toate notele)');
  console.log('   - Friendships (toate relațiile de prietenie)');
  console.log('   - Messages (toate mesajele)');
  console.log('   - Subscription Codes (toate codurile)');
  console.log('   - Backups (toate backup-urile)');
  console.log('   - Payment Processors (toate procesatoarele)\n');
  
  try {
    // Test connections
    console.log('🔌 Testing connections...');
    await sourcePool.query('SELECT 1');
    console.log('   ✅ Connected to SOURCE database');
    await targetPool.query('SELECT 1');
    console.log('   ✅ Connected to RENDER PostgreSQL (TARGET)');
    
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
    console.log('   1. Update Render environment variables to use Render PostgreSQL connection string');
    console.log('   2. Test login with existing users');
    console.log('   3. Verify all data is accessible (poze, prietenii, greutate, etc.)');
    console.log('   4. Verifică că toate rețetele (admin și user) sunt migrate');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

main();

