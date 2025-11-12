import pkg from 'pg';
const { Pool } = pkg;

// Connection string pentru Neon (PostgreSQL online)
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_9W0B49fI96rZ@ep-white-haze-a8w5mggk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const recipes = [
  // PHASE 1 - BREAKFAST
  { name: "Frozen Mango Fat-Burning Smoothie", name_ro: "Smoothie cu Mango Congelat", phase: 1, meal_type: "breakfast", calories: 280, protein: 25, carbs: 45, fats: 1, ingredients_en: ["2 cups frozen mango", "1 cup almond milk", "1 scoop protein powder", "1 cup spinach"], ingredients_ro: ["2 căni mango congelat", "1 cană lapte migdale", "1 măsură proteină", "1 cană spanac"], instructions_en: ["Blend all ingredients", "Serve cold"], instructions_ro: ["Mixează tot", "Servește rece"], image_url: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800", is_vegetarian: true, is_vegan: true },
  
  { name: "Strawberry French Toast", name_ro: "Toast Franțuzesc cu Căpșuni", phase: 1, meal_type: "breakfast", calories: 350, protein: 20, carbs: 55, fats: 2, ingredients_en: ["2 slices whole grain bread", "2 egg whites", "1 cup strawberries"], ingredients_ro: ["2 felii pâine integrală", "2 albușuri", "1 cană căpșuni"], instructions_en: ["Whisk eggs", "Dip bread", "Cook and top with berries"], instructions_ro: ["Bate ouăle", "Înmoaie pâinea", "Gătește și pune căpșuni"], image_url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800", is_vegetarian: true },
  
  // PHASE 1 - LUNCH
  { name: "Tuna Salad", name_ro: "Salată cu Ton", phase: 1, meal_type: "lunch", calories: 380, protein: 35, carbs: 40, fats: 5, ingredients_en: ["150g tuna", "2 cups spinach", "1 green apple", "Cherry tomatoes"], ingredients_ro: ["150g ton", "2 căni spanac", "1 măr verde", "Roșii cherry"], instructions_en: ["Mix all ingredients", "Add lemon juice"], instructions_ro: ["Amestecă totul", "Adaugă lămâie"], image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", is_vegetarian: false },
  
  { name: "Chicken Sandwich", name_ro: "Sandviș cu Pui", phase: 1, meal_type: "lunch", calories: 420, protein: 40, carbs: 48, fats: 4, ingredients_en: ["150g chicken breast", "2 slices bread", "Lettuce", "Tomato"], ingredients_ro: ["150g piept pui", "2 felii pâine", "Salată", "Roșii"], instructions_en: ["Grill chicken", "Assemble sandwich"], instructions_ro: ["Gătește puiul", "Asamblează sandvișul"], image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", is_vegetarian: false },
  
  { name: "Turkey Chili", name_ro: "Chili cu Curcan", phase: 1, meal_type: "dinner", calories: 450, protein: 45, carbs: 50, fats: 6, ingredients_en: ["200g ground turkey", "Kidney beans", "Tomatoes", "Onion"], ingredients_ro: ["200g curcan tocat", "Fasole roșie", "Roșii", "Ceapă"], instructions_en: ["Brown turkey", "Add beans and tomatoes", "Simmer 20 min"], instructions_ro: ["Rumenește curcanul", "Adaugă fasole și roșii", "Fierbe 20 min"], image_url: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800", is_vegetarian: false },
  
  // PHASE 1 - SNACKS
  { name: "Fresh Apple", name_ro: "Măr Proaspăt", phase: 1, meal_type: "snack1", calories: 95, protein: 0, carbs: 25, fats: 0, ingredients_en: ["1 medium apple"], ingredients_ro: ["1 măr mediu"], instructions_en: ["Wash and eat"], instructions_ro: ["Spală și mănâncă"], image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800", is_vegetarian: true, is_vegan: true },
  
  { name: "Orange", name_ro: "Portocală", phase: 1, meal_type: "snack2", calories: 62, protein: 1, carbs: 15, fats: 0, ingredients_en: ["1 orange"], ingredients_ro: ["1 portocală"], instructions_en: ["Peel and eat"], instructions_ro: ["Curăță și mănâncă"], image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=800", is_vegetarian: true, is_vegan: true },
  
  { name: "Mango Chunks", name_ro: "Bucăți Mango", phase: 1, meal_type: "snack1", calories: 90, protein: 1, carbs: 23, fats: 0, ingredients_en: ["1 cup mango"], ingredients_ro: ["1 cană mango"], instructions_en: ["Serve frozen"], instructions_ro: ["Servește congelat"], image_url: "https://images.unsplash.com/photo-1605027990121-cbae9fc60500?w=800", is_vegetarian: true, is_vegan: true },
  
  // PHASE 2
  { name: "Egg White Scramble", name_ro: "Omletă Albuș", phase: 2, meal_type: "breakfast", calories: 180, protein: 25, carbs: 10, fats: 3, ingredients_en: ["4 egg whites", "Spinach", "Mushrooms"], ingredients_ro: ["4 albușuri", "Spanac", "Ciuperci"], instructions_en: ["Whisk eggs", "Cook with veggies"], instructions_ro: ["Bate ouăle", "Gătește cu legume"], image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800", is_vegetarian: true },
  
  { name: "Grilled Chicken", name_ro: "Pui la Grătar", phase: 2, meal_type: "lunch", calories: 320, protein: 45, carbs: 8, fats: 12, ingredients_en: ["200g chicken", "Asparagus", "Olive oil"], ingredients_ro: ["200g pui", "Sparanghel", "Ulei măsline"], instructions_en: ["Season and grill"], instructions_ro: ["Condimentează și gătește"], image_url: "https://images.unsplash.com/photo-1612057888294-9c11a7178022?w=800", is_vegetarian: false },
  
  { name: "Celery Hummus", name_ro: "Țelină cu Hummus", phase: 2, meal_type: "snack1", calories: 120, protein: 4, carbs: 12, fats: 6, ingredients_en: ["4 celery sticks", "1/4 cup hummus"], ingredients_ro: ["4 tulpini țelină", "1/4 cană hummus"], instructions_en: ["Cut celery", "Serve with hummus"], instructions_ro: ["Taie țelina", "Servește cu hummus"], image_url: "https://images.unsplash.com/photo-1529288475508-c303ace43d0f?w=800", is_vegetarian: true, is_vegan: true },
  
  // PHASE 3
  { name: "Avocado Toast", name_ro: "Toast cu Avocado", phase: 3, meal_type: "breakfast", calories: 420, protein: 20, carbs: 35, fats: 24, ingredients_en: ["2 bread slices", "1 avocado", "2 eggs"], ingredients_ro: ["2 felii pâine", "1 avocado", "2 ouă"], instructions_en: ["Toast bread", "Mash avocado", "Add eggs"], instructions_ro: ["Prăjește pâinea", "Pasează avocado", "Adaugă ouă"], image_url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800", is_vegetarian: true },
  
  { name: "Salmon & Veggies", name_ro: "Somon cu Legume", phase: 3, meal_type: "lunch", calories: 480, protein: 40, carbs: 25, fats: 25, ingredients_en: ["200g salmon", "Mixed vegetables", "Olive oil"], ingredients_ro: ["200g somon", "Legume mixte", "Ulei măsline"], instructions_en: ["Season salmon", "Roast vegetables", "Bake together"], instructions_ro: ["Condimentează somonul", "Coace legumele", "Gătește împreună"], image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800", is_vegetarian: false },
  
  { name: "Mixed Nuts", name_ro: "Mix de Nuci", phase: 3, meal_type: "snack1", calories: 200, protein: 6, carbs: 8, fats: 18, ingredients_en: ["20 almonds", "10 walnuts", "15 cashews"], ingredients_ro: ["20 migdale", "10 nuci", "15 caju"], instructions_en: ["Portion and enjoy"], instructions_ro: ["Porționează și savurează"], image_url: "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800", is_vegetarian: true }
];

async function populateDatabase() {
  try {
    console.log('🔄 Conectare la Neon PostgreSQL...');
    
    // Check if recipes exist
    const check = await pool.query('SELECT COUNT(*) FROM recipes');
    console.log(`📊 Rețete existente: ${check.rows[0].count}`);
    
    if (parseInt(check.rows[0].count) > 0) {
      console.log('⚠️  Baza de date deja are rețete. Șterg și re-populez...');
      await pool.query('DELETE FROM recipes');
    }
    
    console.log('🌱 Inserez rețete...');
    
    for (const recipe of recipes) {
      await pool.query(`
        INSERT INTO recipes (
          name, name_ro, phase, meal_type, calories, protein, carbs, fats,
          ingredients_en, ingredients_ro, instructions_en, instructions_ro,
          image_url, is_vegetarian, is_vegan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        recipe.name, recipe.name_ro, recipe.phase, recipe.meal_type,
        recipe.calories, recipe.protein, recipe.carbs, recipe.fats,
        JSON.stringify(recipe.ingredients_en), JSON.stringify(recipe.ingredients_ro),
        JSON.stringify(recipe.instructions_en), JSON.stringify(recipe.instructions_ro),
        recipe.image_url, recipe.is_vegetarian || false, recipe.is_vegan || false
      ]);
    }
    
    const final = await pool.query('SELECT COUNT(*) FROM recipes');
    console.log(`✅ SUCCESS! ${final.rows[0].count} rețete în baza de date!`);
    
    pool.end();
  } catch (error) {
    console.error('❌ EROARE:', error.message);
    pool.end();
  }
}

populateDatabase();


