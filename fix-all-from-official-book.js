import pkg from 'pg';
const { Client } = pkg;

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

    // 1️⃣ ȘTERGEM TOATE REȚETELE GREȘITE
    console.log('🗑️  ȘTERGEM rețete greșite...');
    await client.query('DELETE FROM recipes');
    console.log('✅ Curățat!\n');

    // 2️⃣ ADĂUGĂM REȚETE DIN CARTEA OFICIALĂ
    console.log('📚 ADĂUGĂM rețete din cartea oficială Haylie Pomroy...\n');

    // ═══════════════════════════════════════════════════════════
    // PHASE 1 SNACKS - DOAR FRUCTE!
    // ═══════════════════════════════════════════════════════════
    const phase1Snacks = [
      {
        name_en: 'Apple Slices',
        name_ro: 'Felii de Măr',
        phase: 1,
        meal_type: 'snack1',
        servings: 1,
        prep_time: 2,
        cook_time: 0,
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        ingredients_en: '1 medium apple',
        ingredients_ro: '1 măr mediu',
        instructions_en: 'Wash and slice apple into wedges.',
        instructions_ro: 'Spălați și tăiați mărul în felii.',
        benefits_en: 'Rich in fiber and vitamin C, perfect Phase 1 snack.',
        benefits_ro: 'Bogat în fibre și vitamina C, gustare perfectă pentru Faza 1.',
        image_url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400'
      },
      {
        name_en: 'Fresh Mango',
        name_ro: 'Mango Proaspăt',
        phase: 1,
        meal_type: 'snack2',
        servings: 1,
        prep_time: 3,
        cook_time: 0,
        calories: 135,
        protein: 1,
        carbs: 35,
        fat: 0.6,
        ingredients_en: '1 cup fresh mango chunks',
        ingredients_ro: '1 cană cuburi de mango proaspăt',
        instructions_en: 'Peel and cut fresh mango into chunks.',
        instructions_ro: 'Curățați și tăiați mango în cuburi.',
        benefits_en: 'High in vitamins A and C, natural energy boost.',
        benefits_ro: 'Bogat în vitamine A și C, energie naturală.',
        image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'
      },
      {
        name_en: 'Fresh Strawberries',
        name_ro: 'Căpșuni Proaspete',
        phase: 1,
        meal_type: 'snack1',
        servings: 1,
        prep_time: 2,
        cook_time: 0,
        calories: 50,
        protein: 1,
        carbs: 12,
        fat: 0.5,
        ingredients_en: '1 cup fresh strawberries',
        ingredients_ro: '1 cană căpșuni proaspete',
        instructions_en: 'Wash strawberries and remove stems.',
        instructions_ro: 'Spălați căpșunile și îndepărtați cozile.',
        benefits_en: 'Packed with antioxidants and vitamin C.',
        benefits_ro: 'Plin de antioxidanți și vitamina C.',
        image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'
      },
      {
        name_en: 'Pear',
        name_ro: 'Pară',
        phase: 1,
        meal_type: 'snack2',
        servings: 1,
        prep_time: 1,
        cook_time: 0,
        calories: 100,
        protein: 0.6,
        carbs: 27,
        fat: 0.2,
        ingredients_en: '1 medium pear',
        ingredients_ro: '1 pară medie',
        instructions_en: 'Wash and eat whole or slice.',
        instructions_ro: 'Spălați și consumați întreagă sau felii.',
        benefits_en: 'High fiber fruit, aids digestion.',
        benefits_ro: 'Fruct bogat în fibre, ajută digestia.',
        image_url: 'https://images.unsplash.com/photo-1568607689150-17e625c1586e?w=400'
      },
      {
        name_en: 'Watermelon Cubes',
        name_ro: 'Cuburi de Pepene',
        phase: 1,
        meal_type: 'snack1',
        servings: 1,
        prep_time: 5,
        cook_time: 0,
        calories: 85,
        protein: 1.7,
        carbs: 21,
        fat: 0.4,
        ingredients_en: '2 cups watermelon cubes',
        ingredients_ro: '2 căni cuburi de pepene',
        instructions_en: 'Cut watermelon into bite-sized cubes.',
        instructions_ro: 'Tăiați pepenele în cuburi mici.',
        benefits_en: 'Hydrating and refreshing, low in calories.',
        benefits_ro: 'Hidratant și răcoritor, puține calorii.',
        image_url: 'https://images.unsplash.com/photo-1589984662646-e7b2e00b3e23?w=400'
      }
    ];

    // ═══════════════════════════════════════════════════════════
    // PHASE 2 SNACKS - DOAR PROTEINE!
    // ═══════════════════════════════════════════════════════════
    const phase2Snacks = [
      {
        name_en: 'Hard-Boiled Egg Whites',
        name_ro: 'Albuș de Ou Fiert',
        phase: 2,
        meal_type: 'snack1',
        servings: 1,
        prep_time: 2,
        cook_time: 10,
        calories: 68,
        protein: 14,
        carbs: 1,
        fat: 0.2,
        ingredients_en: '4 hard-boiled egg whites',
        ingredients_ro: '4 albușuri de ou fiert',
        instructions_en: 'Boil eggs for 10 minutes, peel and remove yolks.',
        instructions_ro: 'Fierbeți ouăle 10 minute, curățați și scoateți gălbenușurile.',
        benefits_en: 'Pure protein, fat-free, perfect for Phase 2.',
        benefits_ro: 'Proteină pură, fără grăsimi, perfectă pentru Faza 2.',
        image_url: 'https://images.unsplash.com/photo-1587486937692-0197703ec0a0?w=400'
      },
      {
        name_en: 'Sliced Turkey Breast',
        name_ro: 'Piept de Curcan Felii',
        phase: 2,
        meal_type: 'snack2',
        servings: 1,
        prep_time: 2,
        cook_time: 0,
        calories: 110,
        protein: 24,
        carbs: 0,
        fat: 1,
        ingredients_en: '3 oz nitrate-free turkey breast slices',
        ingredients_ro: '85g felii piept de curcan fără nitrați',
        instructions_en: 'Roll up turkey slices and enjoy.',
        instructions_ro: 'Rulați feliile de curcan și consumați.',
        benefits_en: 'Lean protein, supports muscle building.',
        benefits_ro: 'Proteină slabă, susține creșterea musculară.',
        image_url: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400'
      },
      {
        name_en: 'Tuna from Can',
        name_ro: 'Ton din Conservă',
        phase: 2,
        meal_type: 'snack1',
        servings: 1,
        prep_time: 2,
        cook_time: 0,
        calories: 100,
        protein: 22,
        carbs: 0,
        fat: 1,
        ingredients_en: '3 oz tuna packed in water',
        ingredients_ro: '85g ton conservat în apă',
        instructions_en: 'Drain and eat straight from the can.',
        instructions_ro: 'Scurgeți și consumați direct din conservă.',
        benefits_en: 'High protein, omega-3 fatty acids.',
        benefits_ro: 'Bogat în proteine, acizi grași omega-3.',
        image_url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400'
      },
      {
        name_en: 'Grilled Chicken Strips',
        name_ro: 'Fâșii de Pui la Grătar',
        phase: 2,
        meal_type: 'snack2',
        servings: 1,
        prep_time: 5,
        cook_time: 10,
        calories: 120,
        protein: 26,
        carbs: 0,
        fat: 1.5,
        ingredients_en: '3 oz grilled chicken breast strips',
        ingredients_ro: '85g fâșii piept de pui la grătar',
        instructions_en: 'Grill chicken breast and slice into strips.',
        instructions_ro: 'Grătarul pieptul de pui și tăiați în fâșii.',
        benefits_en: 'Lean protein for muscle repair.',
        benefits_ro: 'Proteină slabă pentru repararea mușchilor.',
        image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'
      },
      {
        name_en: 'Beef Jerky (Nitrate-Free)',
        name_ro: 'Jerky de Vită (Fără Nitrați)',
        phase: 2,
        meal_type: 'snack1',
        servings: 1,
        prep_time: 0,
        cook_time: 0,
        calories: 115,
        protein: 20,
        carbs: 3,
        fat: 2,
        ingredients_en: '1 oz nitrate-free beef jerky',
        ingredients_ro: '30g jerky de vită fără nitrați',
        instructions_en: 'Enjoy as a portable protein snack.',
        instructions_ro: 'Consumați ca gustare portabilă cu proteine.',
        benefits_en: 'Convenient protein source, no preparation needed.',
        benefits_ro: 'Sursă convenabilă de proteine, fără pregătire.',
        image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400'
      }
    ];

    // INSERT SNACKS
    const allSnacks = [...phase1Snacks, ...phase2Snacks];
    
    for (const recipe of allSnacks) {
      await client.query(`
        INSERT INTO recipes (
          name_en, name_ro, phase, meal_type, servings, prep_time, cook_time,
          calories, protein, carbs, fat, ingredients_en, ingredients_ro,
          instructions_en, instructions_ro, benefits_en, benefits_ro, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        recipe.name_en, recipe.name_ro, recipe.phase, recipe.meal_type,
        recipe.servings, recipe.prep_time, recipe.cook_time,
        recipe.calories, recipe.protein, recipe.carbs, recipe.fat,
        recipe.ingredients_en, recipe.ingredients_ro,
        recipe.instructions_en, recipe.instructions_ro,
        recipe.benefits_en, recipe.benefits_ro, recipe.image_url
      ]);
      
      console.log(`✅ [Phase ${recipe.phase}] [${recipe.meal_type}] ${recipe.name_en}`);
    }

    console.log('\n✅ TOATE GUSTĂRILE CORECTE ADĂUGATE DIN CARTEA OFICIALĂ!');
    console.log('\n📊 TOTAL: ' + allSnacks.length + ' rețete snack');

  } catch (error) {
    console.error('❌ EROARE:', error.message);
  } finally {
    await client.end();
  }
}

main();

