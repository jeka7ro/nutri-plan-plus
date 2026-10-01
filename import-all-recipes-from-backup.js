import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const TARGET_URL = process.env.TARGET_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!TARGET_URL) {
  console.error('❌ TARGET_POSTGRES_URL required!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: TARGET_URL,
  ssl: { rejectUnauthorized: false }
});

async function importFromBackup() {
  const client = await pool.connect();
  
  try {
    console.log('📖 Citesc backup-ul...');
    const backupContent = fs.readFileSync('server/backups/nutriplan_backup_2025-11-09T01-17-09.sql', 'utf8');
    
    // Găsește secțiunea COPY recipes folosind regex
    const copyMatch = backupContent.match(/COPY public\.recipes[^]*?\\\./);
    
    if (!copyMatch) {
      console.log('❌ Nu am găsit secțiunea COPY recipes în backup');
      process.exit(1);
    }
    
    const copySection = copyMatch[0];
    const lines = copySection.split('\n').slice(1, -1).filter(line => line.trim());
    
    console.log(`📊 Găsit ${lines.length} linii de rețete în backup\n`);
    
    // Șterge toate rețetele existente
    await client.query('DELETE FROM recipes');
    await client.query('ALTER SEQUENCE recipes_id_seq RESTART WITH 1');
    console.log('🗑️  Șterse toate rețetele existente\n');
    
    // Parsează și inserează fiecare rețetă
    let imported = 0;
    let errors = 0;
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const parts = line.split('\t');
      if (parts.length < 20) {
        errors++;
        continue;
      }
      
      try {
        const id = parseInt(parts[0]);
        if (isNaN(id)) {
          errors++;
          continue;
        }
        
        const user_id = parts[1] === '\\N' || parts[1] === '' ? null : parseInt(parts[1]);
        const name = (parts[2] || parts[3] || parts[4] || 'Untitled').replace(/\\N/g, '');
        const name_ro = (parts[3] || name).replace(/\\N/g, '');
        const name_en = (parts[4] || name).replace(/\\N/g, '');
        const calories = parts[14] && parts[14] !== '\\N' ? parseInt(parts[14]) : 300;
        const protein = parts[15] && parts[15] !== '\\N' ? parseFloat(parts[15]) : 0;
        const carbs = parts[16] && parts[16] !== '\\N' ? parseFloat(parts[16]) : 0;
        const fats = parts[17] && parts[17] !== '\\N' ? parseFloat(parts[17]) : 0;
        const prep_time = parts[18] && parts[18] !== '\\N' ? parseInt(parts[18]) : 5;
        const cook_time = parts[19] && parts[19] !== '\\N' ? parseInt(parts[19]) : 0;
        const phase = parts[21] && parts[21] !== '\\N' ? parseInt(parts[21]) : 1;
        const meal_type = (parts[22] || 'breakfast').replace(/\\N/g, '');
        const image_url = parts[23] && parts[23] !== '\\N' ? parts[23] : null;
        const is_admin_recipe = user_id === null;
        
        await client.query(`
          INSERT INTO recipes (
            id, user_id, name, name_ro, name_en,
            calories, protein, carbs, fats,
            prep_time, cook_time, servings,
            phase, meal_type, image_url,
            is_public, is_admin_recipe
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1, $12, $13, $14, true, $15)
        `, [id, user_id, name, name_ro, name_en, calories, protein, carbs, fats, prep_time, cook_time, phase, meal_type, image_url, is_admin_recipe]);
        
        imported++;
        if (imported % 20 === 0) console.log(`✅ Importat ${imported} rețete...`);
      } catch (error) {
        errors++;
        if (errors <= 5) {
          console.error(`❌ Eroare la linia ${imported + errors}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Importat ${imported} rețete din backup`);
    if (errors > 0) console.log(`⚠️  ${errors} erori`);
    
    const total = await client.query('SELECT COUNT(*) as count FROM recipes');
    console.log(`\n📊 TOTAL REȚETE ÎN RENDER: ${total.rows[0].count}`);
    
    const admin = await client.query('SELECT COUNT(*) as count FROM recipes WHERE is_admin_recipe = true');
    console.log(`👨‍💼 Rețete admin: ${admin.rows[0].count}`);
    
    const withImages = await client.query("SELECT COUNT(*) as count FROM recipes WHERE image_url IS NOT NULL AND image_url != ''");
    console.log(`🖼️  Rețete cu poze: ${withImages.rows[0].count}`);
    
    // Verifică distribuția pe faze
    const byPhase = await client.query(`
      SELECT phase, COUNT(*) as count 
      FROM recipes 
      WHERE is_admin_recipe = true 
      GROUP BY phase 
      ORDER BY phase
    `);
    console.log('\n📊 Distribuție pe faze:');
    byPhase.rows.forEach(r => {
      console.log(`   Faza ${r.phase}: ${r.count} rețete`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

importFromBackup();

