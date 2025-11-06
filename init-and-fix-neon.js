import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcryptjs';

const connectionString = 'postgresql://neondb_owner:npg_JVjFMtcGq4P2@ep-broad-snow-agxbmoif-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('🔌 Conectăm la Neon...');
    await client.connect();
    console.log('✅ Conectat!\n');

    // 1️⃣ CREĂM TOATE TABELELE
    console.log('📦 CREĂM TABELELE...\n');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        country_code VARCHAR(10),
        country VARCHAR(100),
        city VARCHAR(100),
        date_of_birth DATE,
        role VARCHAR(50) DEFAULT 'user',
        subscription_tier VARCHAR(50) DEFAULT 'free',
        subscription_code VARCHAR(100),
        subscription_expires_at TIMESTAMP,
        start_date DATE,
        birth_date DATE,
        profile_picture TEXT,
        current_weight DECIMAL(5,2),
        target_weight DECIMAL(5,2),
        height DECIMAL(5,2),
        age INTEGER,
        gender VARCHAR(20),
        activity_level VARCHAR(50),
        dietary_preferences TEXT,
        allergies TEXT,
        is_vegetarian BOOLEAN DEFAULT FALSE,
        is_vegan BOOLEAN DEFAULT FALSE,
        favorite_foods TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabel users creat');

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(255) NOT NULL,
        name_ro VARCHAR(255) NOT NULL,
        phase INTEGER NOT NULL,
        meal_type VARCHAR(50) NOT NULL,
        servings INTEGER DEFAULT 1,
        prep_time INTEGER DEFAULT 0,
        cook_time INTEGER DEFAULT 0,
        calories INTEGER DEFAULT 0,
        protein DECIMAL(5,2) DEFAULT 0,
        carbs DECIMAL(5,2) DEFAULT 0,
        fat DECIMAL(5,2) DEFAULT 0,
        ingredients_en TEXT,
        ingredients_ro TEXT,
        instructions_en TEXT,
        instructions_ro TEXT,
        benefits_en TEXT,
        benefits_ro TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabel recipes creat');

    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_check_ins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        breakfast VARCHAR(255),
        breakfast_completed BOOLEAN DEFAULT FALSE,
        snack1 VARCHAR(255),
        snack1_completed BOOLEAN DEFAULT FALSE,
        lunch VARCHAR(255),
        lunch_completed BOOLEAN DEFAULT FALSE,
        snack2 VARCHAR(255),
        snack2_completed BOOLEAN DEFAULT FALSE,
        dinner VARCHAR(255),
        dinner_completed BOOLEAN DEFAULT FALSE,
        water_glasses INTEGER DEFAULT 0,
        exercise_type VARCHAR(100),
        exercise_duration INTEGER DEFAULT 0,
        exercise_calories_burned INTEGER DEFAULT 0,
        total_calories INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `);
    console.log('✅ Tabel daily_check_ins creat');

    await client.query(`
      CREATE TABLE IF NOT EXISTS weight_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        weight DECIMAL(5,2) NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabel weight_entries creat\n');

    // 2️⃣ CREĂM ADMIN USER
    console.log('👤 CREĂM ADMIN USER...\n');
    
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', ['jeka7ro@gmail.com']);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123777', 10);
      await client.query(`
        INSERT INTO users (email, password, name, role, subscription_tier)
        VALUES ($1, $2, $3, $4, $5)
      `, ['jeka7ro@gmail.com', hashedPassword, 'Admin', 'admin', 'premium']);
      console.log('✅ Admin user creat!\n');
    } else {
      console.log('⚠️  Admin user există deja!\n');
    }

    // 3️⃣ ȘTERGEM REȚETE VECHI
    console.log('🗑️  ȘTERGEM rețete vechi...');
    await client.query('DELETE FROM recipes');
    console.log('✅ Curățat!\n');

    // 4️⃣ ADĂUGĂM GUSTĂRI CORECTE
    console.log('📚 ADĂUGĂM gustări din cartea oficială Haylie Pomroy...\n');

    const phase1Snacks = [
      ['Apple Slices', 'Felii de Măr', 1, 'snack1', 1, 2, 0, 95, 0.5, 25, 0.3, '1 medium apple', '1 măr mediu', 'Wash and slice apple into wedges.', 'Spălați și tăiați mărul în felii.', 'Rich in fiber and vitamin C, perfect Phase 1 snack.', 'Bogat în fibre și vitamina C, gustare perfectă pentru Faza 1.', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400'],
      ['Fresh Mango', 'Mango Proaspăt', 1, 'snack2', 1, 3, 0, 135, 1, 35, 0.6, '1 cup fresh mango chunks', '1 cană cuburi de mango proaspăt', 'Peel and cut fresh mango into chunks.', 'Curățați și tăiați mango în cuburi.', 'High in vitamins A and C, natural energy boost.', 'Bogat în vitamine A și C, energie naturală.', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'],
      ['Fresh Strawberries', 'Căpșuni Proaspete', 1, 'snack1', 1, 2, 0, 50, 1, 12, 0.5, '1 cup fresh strawberries', '1 cană căpșuni proaspete', 'Wash strawberries and remove stems.', 'Spălați căpșunile și îndepărtați cozile.', 'Packed with antioxidants and vitamin C.', 'Plin de antioxidanți și vitamina C.', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'],
      ['Pear', 'Pară', 1, 'snack2', 1, 1, 0, 100, 0.6, 27, 0.2, '1 medium pear', '1 pară medie', 'Wash and eat whole or slice.', 'Spălați și consumați întreagă sau felii.', 'High fiber fruit, aids digestion.', 'Fruct bogat în fibre, ajută digestia.', 'https://images.unsplash.com/photo-1568607689150-17e625c1586e?w=400'],
      ['Watermelon Cubes', 'Cuburi de Pepene', 1, 'snack1', 1, 5, 0, 85, 1.7, 21, 0.4, '2 cups watermelon cubes', '2 căni cuburi de pepene', 'Cut watermelon into bite-sized cubes.', 'Tăiați pepenele în cuburi mici.', 'Hydrating and refreshing, low in calories.', 'Hidratant și răcoritor, puține calorii.', 'https://images.unsplash.com/photo-1589984662646-e7b2e00b3e23?w=400']
    ];

    const phase2Snacks = [
      ['Hard-Boiled Egg Whites', 'Albuș de Ou Fiert', 2, 'snack1', 1, 2, 10, 68, 14, 1, 0.2, '4 hard-boiled egg whites', '4 albușuri de ou fiert', 'Boil eggs for 10 minutes, peel and remove yolks.', 'Fierbeți ouăle 10 minute, curățați și scoateți gălbenușurile.', 'Pure protein, fat-free, perfect for Phase 2.', 'Proteină pură, fără grăsimi, perfectă pentru Faza 2.', 'https://images.unsplash.com/photo-1587486937692-0197703ec0a0?w=400'],
      ['Sliced Turkey Breast', 'Piept de Curcan Felii', 2, 'snack2', 1, 2, 0, 110, 24, 0, 1, '3 oz nitrate-free turkey breast slices', '85g felii piept de curcan fără nitrați', 'Roll up turkey slices and enjoy.', 'Rulați feliile de curcan și consumați.', 'Lean protein, supports muscle building.', 'Proteină slabă, susține creșterea musculară.', 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400'],
      ['Tuna from Can', 'Ton din Conservă', 2, 'snack1', 1, 2, 0, 100, 22, 0, 1, '3 oz tuna packed in water', '85g ton conservat în apă', 'Drain and eat straight from the can.', 'Scurgeți și consumați direct din conservă.', 'High protein, omega-3 fatty acids.', 'Bogat în proteine, acizi grași omega-3.', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400'],
      ['Grilled Chicken Strips', 'Fâșii de Pui la Grătar', 2, 'snack2', 1, 5, 10, 120, 26, 0, 1.5, '3 oz grilled chicken breast strips', '85g fâșii piept de pui la grătar', 'Grill chicken breast and slice into strips.', 'Grătarul pieptul de pui și tăiați în fâșii.', 'Lean protein for muscle repair.', 'Proteină slabă pentru repararea mușchilor.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'],
      ['Beef Jerky (Nitrate-Free)', 'Jerky de Vită (Fără Nitrați)', 2, 'snack1', 1, 0, 0, 115, 20, 3, 2, '1 oz nitrate-free beef jerky', '30g jerky de vită fără nitrați', 'Enjoy as a portable protein snack.', 'Consumați ca gustare portabilă cu proteine.', 'Convenient protein source, no preparation needed.', 'Sursă convenabilă de proteine, fără pregătire.', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400']
    ];

    const allSnacks = [...phase1Snacks, ...phase2Snacks];
    
    for (const recipe of allSnacks) {
      await client.query(`
        INSERT INTO recipes (
          name_en, name_ro, phase, meal_type, servings, prep_time, cook_time,
          calories, protein, carbs, fat, ingredients_en, ingredients_ro,
          instructions_en, instructions_ro, benefits_en, benefits_ro, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, recipe);
      
      console.log(`✅ [Phase ${recipe[2]}] [${recipe[3]}] ${recipe[0]}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TOTUL GATA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 Total: ${allSnacks.length} gustări adăugate`);
    console.log('📚 Sursă: Fast Metabolism Diet - Haylie Pomroy (official)\n');
    console.log('🎯 Phase 1 Snacks: DOAR FRUCTE (5 rețete)');
    console.log('🎯 Phase 2 Snacks: DOAR PROTEINE (5 rețete)\n');

  } catch (error) {
    console.error('❌ EROARE:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('🔌 Deconectat de la Neon.');
  }
}

main();

