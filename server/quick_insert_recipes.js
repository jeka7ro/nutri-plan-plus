import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nutriplan',
  user: process.env.USER,
  password: '',
});

const recipes_json = JSON.parse(fs.readFileSync('/tmp/recipes_final.json', 'utf-8'));

const translations = {
  'MANGO CONGELAT': 'Frozen Mango Smoothie',
  'FRUCTE.*OVAZ': 'Fruit Oatmeal Smoothie',
  'TERCI.*OVAZ': 'Oatmeal Porridge',
  'FRIGANELE.*CAPSUNE': 'Strawberry French Toast',
  'SALATA.*TON.*MAR': 'Tuna Apple Spinach Salad',
  'TARTINA.*CURCAN': 'Turkey Toast',
  'CURCAN.*LIPIE': 'Turkey Wrap',
  'CHILI.*CURCAN': 'Turkey Chili',
  'SUPA.*CURCAN': 'Turkey Bean Kale Soup',
  'PUI.*BROCCOLI': 'Chicken Broccoli',
  'CARNATI.*PUI': 'Chicken Sausage Pasta',
  'PUI.*ITALIAN': 'Italian Chicken Wild Rice',
  'FILE.*MIGNON': 'Filet Mignon Brown Rice',
  'PORC.*BROCCOLI': 'Pork Tenderloin Broccoli',
  'GREPFRUT': 'Baked Grapefruit',
  'PARA.*CACAO': 'Pear Cocoa',
  'PEPENE': 'Watermelon',
  'OMLETA.*SPANIOLA': 'Spanish Omelet',
  'OMLETA.*CIUPERCI': 'Mushroom Spinach Omelet',
  'BACON.*CURCAN': 'Turkey Bacon Celery',
  'GOGOSARI.*TON': 'Bell Peppers Tuna Salad',
};

function translateName(nameRo) {
  for (const [pattern, enName] of Object.entries(translations)) {
    if (new RegExp(pattern, 'i').test(nameRo)) {
      return enName;
    }
  }
  return nameRo.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

async function insertRecipes() {
  const client = await pool.connect();
  
  try {
    let inserted = 0;
    
    for (const recipe of recipes_json) {
      const name_en = translateName(recipe.name_ro);
      const ingredients_ro = recipe.ingredients_ro || [];
      const instructions_ro = recipe.instructions_ro || 'Preparare conform cărții';
      
      // Estimate calories based on phase
      const calories = recipe.phase === 1 ? 300 : (recipe.phase === 2 ? 250 : 400);
      
      await client.query(`
        INSERT INTO recipes (
          name, name_ro, name_en,
          ingredients_ro, ingredients_en,
          instructions_ro, instructions_en,
          phase, meal_type,
          calories, protein, carbs, fats,
          servings, prep_time, cook_time,
          image_url, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        name_en, recipe.name_ro, name_en,
        JSON.stringify(ingredients_ro), JSON.stringify(ingredients_ro),
        instructions_ro, instructions_ro,
        recipe.phase, recipe.meal_type,
        calories, 25, 40, 5,
        1, 15, 20,
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        true
      ]);
      
      inserted++;
      if (inserted % 10 == 0) console.log(`✅ ${inserted} rețete...`);
    }
    
    console.log(`\n✅ TOTAL: ${inserted} rețete adăugate!\n`);
    
  } finally {
    client.release();
    pool.end();
  }
}

insertRecipes();
