import pkg from 'pg';
const { Pool } = pkg;

// Neon connection - folosește POSTGRES_URL sau DATABASE_URL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://localhost/nutriplan';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

console.log('🔗 Conectare la Neon...', connectionString.substring(0, 30) + '...');

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('\n🌱 SEED-ARE ÎN CURS...\n');
    
    // 1. Verifică dacă tabela users există
    const tablesCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'recipes', 'daily_checkins')
    `);
    
    console.log('✅ Tabele găsite:', tablesCheck.rows.map(r => r.table_name).join(', '));
    
    if (tablesCheck.rows.length === 0) {
      console.log('❌ TABELE NU EXISTĂ! Rulează migration mai întâi!');
      return;
    }
    
    // 2. Verifică users
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`👤 Users în DB: ${usersCount.rows[0].count}`);
    
    // 3. Verifică recipes
    const recipesCount = await client.query('SELECT COUNT(*) FROM recipes');
    console.log(`🍽️ Recipes în DB: ${recipesCount.rows[0].count}`);
    
    if (parseInt(recipesCount.rows[0].count) > 0) {
      console.log('\n✅ DATABASE DEJA ARE RECIPES! Nu mai seedez.');
    } else {
      console.log('\n⚠️ DATABASE GOL - ar trebui să seedez, dar nu am rețetele aici.');
      console.log('   Rulează seed-ul local cu conexiune la Neon.');
    }
    
    console.log('\n✅ VERIFICARE COMPLETĂ!');
    
  } catch (error) {
    console.error('❌ EROARE:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
