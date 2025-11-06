import pkg from 'pg';
const { Client } = pkg;

// ✅ NEON CONNECTION (din environment variables)
const connectionString = process.env.POSTGRES_URL || 'postgresql://nutriplan_owner:aTNFR2WXvYIH@ep-plain-leaf-a24e2k9r.eu-central-1.aws.neon.tech/nutriplan?sslmode=require';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    console.log('🔌 Conectăm la Neon...');
    await client.connect();
    console.log('✅ Conectat la Neon!');

    // 1️⃣ VERIFICĂM REȚETELE EXISTENTE
    console.log('\n📋 LISTĂM REȚETE EXISTENTE...\n');
    
    const { rows } = await client.query(`
      SELECT id, name_en, name_ro, meal_type, phase, image_url
      FROM recipes
      ORDER BY phase, meal_type, name_en
      LIMIT 100
    `);

    console.log(`✅ Găsite ${rows.length} rețete:\n`);
    
    rows.forEach((recipe, idx) => {
      console.log(`${idx + 1}. [Phase ${recipe.phase}] [${recipe.meal_type}] ${recipe.name_en}`);
      console.log(`   RO: ${recipe.name_ro}`);
      console.log(`   IMG: ${recipe.image_url || '❌ LIPSĂ'}`);
      console.log('');
    });

    // 2️⃣ FIXĂM IMAGINILE GREȘITE
    console.log('\n🔧 FIXĂM IMAGINILE GREȘITE...\n');
    
    const imageFixes = [
      // Ouă, nu morcovi!
      {
        name: 'Ouă Fierte',
        image: 'https://images.unsplash.com/photo-1587486937692-0197703ec0a0?w=400'
      },
      {
        name: 'Albuș de Ou Fiert',
        image: 'https://images.unsplash.com/photo-1587486937692-0197703ec0a0?w=400'
      },
      // Piept de pui
      {
        name: 'Piept de Pui',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'
      },
      // Creveți
      {
        name: 'Creveți la Grătar',
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400'
      },
      // Ton
      {
        name: 'Ton din Conservă',
        image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400'
      },
      // Somon
      {
        name: 'Somon la Grătar',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400'
      },
      // Curcan
      {
        name: 'Piept de Curcan',
        image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400'
      }
    ];

    for (const fix of imageFixes) {
      await client.query(`
        UPDATE recipes
        SET image_url = $1
        WHERE name_en ILIKE $2 OR name_ro ILIKE $2
      `, [fix.image, `%${fix.name}%`]);
      
      console.log(`✅ Fixat imagine pentru: ${fix.name}`);
    }

    console.log('\n✅ TOATE IMAGINILE FIXATE!');

  } catch (error) {
    console.error('❌ EROARE:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n🔌 Deconectat de la Neon.');
  }
}

main();

