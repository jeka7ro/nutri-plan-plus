import pkg from 'pg';
const { Pool } = pkg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors pentru output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Connection strings
const SOURCE_URL = process.env.SOURCE_POSTGRES_URL || process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.TARGET_POSTGRES_URL || process.env.RENDER_POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!TARGET_URL) {
  log('\n❌ ERROR: Missing Render PostgreSQL connection string!', 'red');
  log('\n📋 Setează environment variable:', 'yellow');
  log('   export TARGET_POSTGRES_URL="[connection string de la Render PostgreSQL]"', 'cyan');
  log('\n📖 Unde găsești connection string:', 'yellow');
  log('   1. Render Dashboard → nutriplan-db → Info', 'cyan');
  log('   2. Copiază "Internal Database URL"', 'cyan');
  log('\n💡 Exemplu:', 'yellow');
  log('   export TARGET_POSTGRES_URL="postgresql://nutriplan:xxx@dpg-xxx.frankfurt-postgres.render.com/nutriplan"', 'cyan');
  process.exit(1);
}

const targetPool = new Pool({
  connectionString: TARGET_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRenderDatabase() {
  log('\n🔍 PASUL 1: Verificare Render Database...', 'bright');
  
  const client = await targetPool.connect();
  
  try {
    // Test connection
    await client.query('SELECT 1');
    log('   ✅ Conectat la Render PostgreSQL', 'green');
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    log(`   📊 Tabele găsite: ${tables.length}`, 'cyan');
    
    if (!tables.includes('users')) {
      log('   ❌ ERROR: Tabela "users" nu există!', 'red');
      log('   💡 Soluție: Rulează inițializarea bazei de date', 'yellow');
      log('      node server/database-pg.js', 'cyan');
      return { needsInit: true, hasUsers: false, userCount: 0 };
    }
    
    // Check users
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(usersResult.rows[0].count);
    log(`   👥 Useri în database: ${userCount}`, 'cyan');
    
    // Check specific user
    const testUser = await client.query(
      "SELECT id, email, name, role FROM users WHERE email = $1",
      ['jeka7ro@gmail.com']
    );
    
    const hasTestUser = testUser.rows.length > 0;
    
    if (hasTestUser) {
      log(`   ✅ User "jeka7ro@gmail.com" găsit (ID: ${testUser.rows[0].id})`, 'green');
    } else {
      log('   ⚠️  User "jeka7ro@gmail.com" NU este în database', 'yellow');
    }
    
    // Check recipes
    let recipeCount = 0;
    if (tables.includes('recipes')) {
      const recipesResult = await client.query('SELECT COUNT(*) as count FROM recipes');
      recipeCount = parseInt(recipesResult.rows[0].count);
      log(`   📝 Rețete în database: ${recipeCount}`, 'cyan');
    }
    
    return {
      needsInit: false,
      hasUsers: userCount > 0,
      userCount,
      hasTestUser,
      recipeCount,
      tables: tables.length
    };
    
  } catch (error) {
    log(`   ❌ Eroare: ${error.message}`, 'red');
    throw error;
  } finally {
    client.release();
  }
}

async function checkSourceDatabase() {
  if (!SOURCE_URL) {
    log('\n⚠️  PASUL 2: Nu există SOURCE connection string', 'yellow');
    log('   💡 Dacă vrei să migrezi date, setează:', 'yellow');
    log('      export SOURCE_POSTGRES_URL="[connection string sursă]"', 'cyan');
    return null;
  }
  
  log('\n🔍 PASUL 2: Verificare baza de date sursă...', 'bright');
  
  const sourcePool = new Pool({
    connectionString: SOURCE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await sourcePool.connect();
  
  try {
    await client.query('SELECT 1');
    log('   ✅ Conectat la baza de date sursă', 'green');
    
    // Check users
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(usersResult.rows[0].count);
    log(`   👥 Useri în sursă: ${userCount}`, 'cyan');
    
    // Check test user
    const testUser = await client.query(
      "SELECT id, email, name FROM users WHERE email = $1",
      ['jeka7ro@gmail.com']
    );
    
    const hasTestUser = testUser.rows.length > 0;
    if (hasTestUser) {
      log(`   ✅ User "jeka7ro@gmail.com" găsit în sursă`, 'green');
    }
    
    // Check recipes
    const recipesResult = await client.query('SELECT COUNT(*) as count FROM recipes');
    const recipeCount = parseInt(recipesResult.rows[0].count);
    log(`   📝 Rețete în sursă: ${recipeCount}`, 'cyan');
    
    return {
      userCount,
      hasTestUser,
      recipeCount
    };
    
  } catch (error) {
    log(`   ❌ Eroare: ${error.message}`, 'red');
    return null;
  } finally {
    client.release();
    await sourcePool.end();
  }
}

function printMigrationInstructions() {
  log('\n🚀 INSTRUCȚIUNI PENTRU MIGRARE:', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');
  log('\nRulează manual migrarea:', 'yellow');
  log('   export SOURCE_POSTGRES_URL="[connection string sursă]"', 'cyan');
  log('   export TARGET_POSTGRES_URL="[connection string Render]"', 'cyan');
  log('   node migrate-all-data-to-render.js', 'cyan');
  log('\n═══════════════════════════════════════════════════', 'cyan');
}

function printRenderInstructions(needsMigration, needsJWT) {
  log('\n📋 INSTRUCȚIUNI PENTRU RENDER DASHBOARD:', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');
  
  log('\n1️⃣ Deschide: https://dashboard.render.com', 'yellow');
  log('   → Click pe serviciul tău: nutriplan-app', 'cyan');
  log('   → Click pe tab-ul "Environment"', 'cyan');
  
  if (needsJWT) {
    log('\n2️⃣ SETEAZĂ JWT_SECRET:', 'yellow');
    log('   → Click "Add Environment Variable"', 'cyan');
    log('   → Key: JWT_SECRET', 'cyan');
    log('   → Value: nutri-plan-2024-production-secret-jeka7ro', 'cyan');
    log('   → Click "Save Changes"', 'cyan');
  }
  
  log('\n3️⃣ VERIFICĂ CONNECTION STRINGS:', 'yellow');
  log('   → DATABASE_URL = [connection string de la Render PostgreSQL]', 'cyan');
  log('   → POSTGRES_URL = [connection string de la Render PostgreSQL]', 'cyan');
  log('   → Ambele trebuie să fie setate cu același connection string!', 'yellow');
  
  if (needsMigration) {
    log('\n4️⃣ DUPĂ MIGRARE:', 'yellow');
    log('   → Render va face automat redeploy', 'cyan');
    log('   → Așteaptă 2-3 minute', 'cyan');
    log('   → Testează login pe https://eatnfit.onrender.com/app', 'cyan');
  }
  
  log('\n═══════════════════════════════════════════════════', 'cyan');
}

async function main() {
  log('\n🚀 FIX RENDER - Verificare și Rezolvare Automată', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');
  
  try {
    // Step 1: Check Render database
    const renderStatus = await checkRenderDatabase();
    
    if (renderStatus.needsInit) {
      log('\n❌ Baza de date nu este inițializată!', 'red');
      log('   Rulează: node server/database-pg.js', 'yellow');
      process.exit(1);
    }
    
    // Step 2: Check source database
    const sourceStatus = await checkSourceDatabase();
    
    // Step 3: Determine what needs to be done
    const needsMigration = !renderStatus.hasUsers && sourceStatus && sourceStatus.userCount > 0;
    const needsJWT = true; // Always check JWT_SECRET
    
    log('\n📊 REZUMAT:', 'bright');
    log(`   - Render Database: ${renderStatus.hasUsers ? '✅ Are useri' : '❌ Fără useri'}`, renderStatus.hasUsers ? 'green' : 'red');
    log(`   - Source Database: ${sourceStatus ? '✅ Conectat' : '⚠️  Nu este setat'}`, sourceStatus ? 'green' : 'yellow');
    log(`   - Migrare necesară: ${needsMigration ? '✅ DA' : '❌ NU'}`, needsMigration ? 'yellow' : 'green');
    
    if (needsMigration && sourceStatus) {
      printMigrationInstructions();
    }
    
    // Print instructions
    printRenderInstructions(needsMigration, needsJWT);
    
    log('\n✅ Verificare completă!', 'green');
    log('\n💡 Următorii pași:', 'yellow');
    
    if (needsMigration) {
      log('   1. Rulează migrarea: node migrate-all-data-to-render.js', 'cyan');
    }
    
    log('   2. Actualizează JWT_SECRET pe Render Dashboard', 'cyan');
    log('   3. Așteaptă redeploy (2-3 minute)', 'cyan');
    log('   4. Testează login pe https://eatnfit.onrender.com/app', 'cyan');
    
  } catch (error) {
    log(`\n❌ Eroare: ${error.message}`, 'red');
    log('\n💡 Verifică:', 'yellow');
    log('   - Connection string-ul este corect?', 'cyan');
    log('   - Baza de date este accesibilă?', 'cyan');
    log('   - Network/firewall settings?', 'cyan');
    process.exit(1);
  } finally {
    await targetPool.end();
  }
}

main();

