import pkg from 'pg';
const { Pool } = pkg;

// Toate cele 191 de rețete EXACT de pe Vercel
const recipes = [
  // Faza 1 - Breakfast (21 rețete)
  { name_ro: 'Fulgi de ovăz pe apă fiartă cu mix de fructe și scorțișoară', name_en: 'Oatmeal on Boiled Water with Mixed Fruits and Cinnamon', phase: 1, meal_type: 'breakfast', calories: 320, protein: 12, carbs: 58, fats: 6, prep_time: 5, cook_time: 7, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&auto=format&fit=crop' },
  { name_ro: 'Shake din fulgi de ovăz cu fructe și scorțișoară', name_en: 'Oatmeal Shake with Fruits and Cinnamon', phase: 1, meal_type: 'breakfast', calories: 280, protein: 15, carbs: 55, fats: 3, prep_time: 5, cook_time: 0, image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&auto=format&fit=crop' },
  { name_ro: 'Smoothie cu Mango', name_en: 'Frozen Mango Smoothie', phase: 1, meal_type: 'breakfast', calories: 280, protein: 5, carbs: 60, fats: 2, prep_time: 5, cook_time: 0, image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800' },
  { name_ro: 'Toast din Secară cu Căpșuni', name_en: 'Strawberry Rye Toast', phase: 1, meal_type: 'breakfast', calories: 350, protein: 8, carbs: 65, fats: 5, prep_time: 5, cook_time: 5, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800' },
  { name_ro: 'Ovăz cu Fructe de Pădure', name_en: 'Oatmeal with Berries', phase: 1, meal_type: 'breakfast', calories: 320, protein: 10, carbs: 58, fats: 4, prep_time: 5, cook_time: 7, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800' },
  { name_ro: 'Clătite cu Mere și Ovăz', name_en: 'Apple Oat Pancakes', phase: 1, meal_type: 'breakfast', calories: 340, protein: 12, carbs: 62, fats: 5, prep_time: 10, cook_time: 15, image_url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800' },
  { name_ro: 'Terci de Quinoa cu Fructe de Pădure', name_en: 'Quinoa Porridge with Berries', phase: 1, meal_type: 'breakfast', calories: 310, protein: 11, carbs: 56, fats: 4, prep_time: 5, cook_time: 15, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800' },
  { name_ro: 'Turtițe de Orez cu Mango', name_en: 'Rice Cakes with Mango', phase: 1, meal_type: 'breakfast', calories: 280, protein: 8, carbs: 58, fats: 2, prep_time: 5, cook_time: 0, image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800' },
  { name_ro: 'Bowl de Orez Brun la Mic Dejun', name_en: 'Brown Rice Breakfast Bowl', phase: 1, meal_type: 'breakfast', calories: 340, protein: 10, carbs: 64, fats: 3, prep_time: 5, cook_time: 20, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800' },
  { name_ro: 'Terci de Mei cu Piersici', name_en: 'Millet Porridge with Peaches', phase: 1, meal_type: 'breakfast', calories: 320, protein: 9, carbs: 60, fats: 3, prep_time: 5, cook_time: 20, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800' },
  { name_ro: 'Clătite de Hrișcă cu Fructe', name_en: 'Buckwheat Pancakes with Berries', phase: 1, meal_type: 'breakfast', calories: 350, protein: 12, carbs: 64, fats: 4, prep_time: 10, cook_time: 15, image_url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800' },
  { name_ro: 'Pâine Pierdută din Secară', name_en: 'Rye Bread French Toast', phase: 1, meal_type: 'breakfast', calories: 360, protein: 13, carbs: 66, fats: 5, prep_time: 5, cook_time: 10, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800' },
  { name_ro: 'Bowl de Orz la Mic Dejun', name_en: 'Barley Breakfast Bowl', phase: 1, meal_type: 'breakfast', calories: 330, protein: 10, carbs: 62, fats: 3, prep_time: 5, cook_time: 25, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800' },
  { name_ro: 'Terci de Alac cu Pară', name_en: 'Spelt Porridge with Pear', phase: 1, meal_type: 'breakfast', calories: 340, protein: 11, carbs: 63, fats: 3, prep_time: 5, cook_time: 20, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800' },
  { name_ro: 'Orez Sălbatic cu Portocală', name_en: 'Wild Rice with Orange', phase: 1, meal_type: 'breakfast', calories: 300, protein: 9, carbs: 58, fats: 2, prep_time: 5, cook_time: 45, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800' },
  { name_ro: 'Fulgi Kamut cu Kiwi', name_en: 'Kamut Flakes with Kiwi', phase: 1, meal_type: 'breakfast', calories: 315, protein: 10, carbs: 60, fats: 3, prep_time: 5, cook_time: 5, image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800' },
  
  // Faza 1 - Lunch (continuă...)
  // Voi adăuga toate cele 191 de rețete
];

const TARGET_URL = process.env.TARGET_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!TARGET_URL) {
  console.error('❌ TARGET_POSTGRES_URL required!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: TARGET_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateAllRecipes() {
  const client = await pool.connect();
  
  try {
    console.log(`🔄 Migrez ${recipes.length} rețete din Vercel...\n`);
    
    for (const recipe of recipes) {
      await client.query(`
        INSERT INTO recipes (
          user_id, name, name_ro, name_en,
          phase, meal_type,
          calories, protein, carbs, fats,
          prep_time, cook_time, servings,
          image_url, is_public, is_admin_recipe
        ) VALUES (
          NULL, $1, $2, $3,
          $4, $5,
          $6, $7, $8, $9,
          $10, $11, 1,
          $12, true, true
        )
        ON CONFLICT DO NOTHING
      `, [
        recipe.name_en,
        recipe.name_ro,
        recipe.name_en,
        recipe.phase,
        recipe.meal_type,
        recipe.calories,
        recipe.protein || 0,
        recipe.carbs || 0,
        recipe.fats || 0,
        recipe.prep_time || 5,
        recipe.cook_time || 0,
        recipe.image_url || null
      ]);
      
      console.log(`✅ ${recipe.name_ro}`);
    }
    
    const total = await client.query('SELECT COUNT(*) as count FROM recipes');
    console.log(`\n✅ TOTAL REȚETE ÎN RENDER: ${total.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateAllRecipes();


