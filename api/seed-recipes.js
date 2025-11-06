import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

const recipes = [
  // PHASE 1 - BREAKFAST
  {
    name: "Frozen Mango Fat-Burning Smoothie",
    name_ro: "Smoothie cu Mango Congelat",
    phase: 1,
    meal_type: "breakfast",
    calories: 280,
    protein: 25,
    carbs: 45,
    fats: 1,
    ingredients_en: ["2 cups frozen mango chunks", "1 cup unsweetened almond milk", "1 scoop vanilla protein powder", "1 cup spinach", "Ice cubes"],
    ingredients_ro: ["2 căni bucăți de mango congelat", "1 cană lapte de migdale nedulcit", "1 măsură pudră proteică vanilie", "1 cană spanac", "Cuburi de gheață"],
    instructions_en: ["Blend all ingredients until smooth", "Add ice if needed", "Serve immediately"],
    instructions_ro: ["Mixează toate ingredientele până devine omogen", "Adaugă gheață dacă e nevoie", "Servește imediat"],
    image_url: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800",
    is_vegetarian: true,
    is_vegan: true
  },
  {
    name: "Oatmeal Fruit Smoothie",
    name_ro: "Smoothie cu Ovăz și Fructe",
    phase: 1,
    meal_type: "breakfast",
    calories: 320,
    protein: 15,
    carbs: 58,
    fats: 3,
    ingredients_en: ["1/2 cup rolled oats", "1 banana", "1 cup strawberries", "1 cup almond milk", "1 tsp honey"],
    ingredients_ro: ["1/2 cană fulgi de ovăz", "1 banană", "1 cană căpșuni", "1 cană lapte de migdale", "1 linguriță miere"],
    instructions_en: ["Combine all ingredients in blender", "Blend until smooth", "Serve cold"],
    instructions_ro: ["Combină toate ingredientele în blender", "Mixează până devine omogen", "Servește rece"],
    image_url: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800",
    is_vegetarian: true
  },
  {
    name: "Strawberry French Toast",
    name_ro: "Toast Franțuzesc cu Căpșuni",
    phase: 1,
    meal_type: "breakfast",
    calories: 350,
    protein: 20,
    carbs: 55,
    fats: 2,
    ingredients_en: ["2 slices whole grain bread", "2 egg whites", "1/2 cup almond milk", "1 cup fresh strawberries", "1 tsp cinnamon"],
    ingredients_ro: ["2 felii pâine integrală", "2 albușuri", "1/2 cană lapte de migdale", "1 cană căpșuni proaspete", "1 linguriță scorțișoară"],
    instructions_en: ["Whisk egg whites and milk", "Dip bread in mixture", "Cook on non-stick pan", "Top with strawberries"],
    instructions_ro: ["Bate albușurile cu laptele", "Înmoaie pâinea în amestec", "Gătește în tigaie antiaderentă", "Pune căpșuni deasupra"],
    image_url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800",
    is_vegetarian: true
  },

  // PHASE 1 - LUNCH
  {
    name: "Tuna, Green Apple, and Spinach Salad",
    name_ro: "Salată cu Ton, Măr Verde și Spanac",
    phase: 1,
    meal_type: "lunch",
    calories: 380,
    protein: 35,
    carbs: 40,
    fats: 5,
    ingredients_en: ["150g canned tuna in water", "2 cups fresh spinach", "1 green apple, diced", "1/2 cup cherry tomatoes", "Lemon juice", "Black pepper"],
    ingredients_ro: ["150g ton conservă în apă", "2 căni spanac proaspăt", "1 măr verde, tăiat cubulețe", "1/2 cană roșii cherry", "Suc de lămâie", "Piper negru"],
    instructions_en: ["Combine all ingredients in bowl", "Toss with lemon juice", "Season with pepper", "Serve fresh"],
    instructions_ro: ["Combină toate ingredientele într-un bol", "Amestecă cu suc de lămâie", "Condimentează cu piper", "Servește proaspăt"],
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    is_vegetarian: false
  },
  {
    name: "Open-Faced Chicken Sandwich",
    name_ro: "Sandviș Deschis cu Pui",
    phase: 1,
    meal_type: "lunch",
    calories: 420,
    protein: 40,
    carbs: 48,
    fats: 4,
    ingredients_en: ["150g grilled chicken breast", "2 slices whole grain bread", "Lettuce", "Tomato slices", "Mustard"],
    ingredients_ro: ["150g piept de pui la grătar", "2 felii pâine integrală", "Salată verde", "Felii de roșii", "Muștar"],
    instructions_en: ["Toast bread lightly", "Place chicken on bread", "Add vegetables", "Top with mustard"],
    instructions_ro: ["Prăjește ușor pâinea", "Pune puiul pe pâine", "Adaugă legumele", "Pune muștar deasupra"],
    image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
    is_vegetarian: false
  },
  {
    name: "Turkey Chili",
    name_ro: "Chili cu Curcan",
    phase: 1,
    meal_type: "dinner",
    calories: 450,
    protein: 45,
    carbs: 50,
    fats: 6,
    ingredients_en: ["200g ground turkey", "1 can kidney beans", "1 can diced tomatoes", "1 onion, chopped", "2 cloves garlic", "Chili powder", "Cumin"],
    ingredients_ro: ["200g carne tocată de curcan", "1 cutie fasole roșie", "1 cutie roșii tăiate", "1 ceapă, tocată", "2 căței usturoi", "Ardei iute", "Chimion"],
    instructions_en: ["Brown turkey in pot", "Add onion and garlic", "Add tomatoes and beans", "Season and simmer 20 min"],
    instructions_ro: ["Rumenește curcanu în oală", "Adaugă ceapa și usturoiul", "Adaugă roșiile și fasolea", "Condimentează și fierbe 20 min"],
    image_url: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800",
    is_vegetarian: false
  },

  // PHASE 1 - SNACKS
  {
    name: "Fresh Apple",
    name_ro: "Măr Proaspăt",
    phase: 1,
    meal_type: "snack1",
    calories: 95,
    protein: 0,
    carbs: 25,
    fats: 0,
    ingredients_en: ["1 medium apple"],
    ingredients_ro: ["1 măr mediu"],
    instructions_en: ["Wash and eat fresh"],
    instructions_ro: ["Spală și mănâncă proaspăt"],
    image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800",
    is_vegetarian: true,
    is_vegan: true
  },
  {
    name: "Fresh Orange",
    name_ro: "Portocală Proaspătă",
    phase: 1,
    meal_type: "snack2",
    calories: 62,
    protein: 1,
    carbs: 15,
    fats: 0,
    ingredients_en: ["1 medium orange"],
    ingredients_ro: ["1 portocală medie"],
    instructions_en: ["Peel and eat fresh"],
    instructions_ro: ["Curăță și mănâncă proaspătă"],
    image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=800",
    is_vegetarian: true,
    is_vegan: true
  },
  {
    name: "Frozen Mango Chunks",
    name_ro: "Bucăți de Mango Congelat",
    phase: 1,
    meal_type: "snack1",
    calories: 90,
    protein: 1,
    carbs: 23,
    fats: 0,
    ingredients_en: ["1 cup frozen mango chunks"],
    ingredients_ro: ["1 cană bucăți mango congelat"],
    instructions_en: ["Serve frozen as a refreshing snack"],
    instructions_ro: ["Servește congelat ca gustare răcoritoare"],
    image_url: "https://images.unsplash.com/photo-1605027990121-cbae9fc60500?w=800",
    is_vegetarian: true,
    is_vegan: true
  },

  // PHASE 2 - BREAKFAST
  {
    name: "Veggie Egg White Scramble",
    name_ro: "Omletă din Albuș cu Legume",
    phase: 2,
    meal_type: "breakfast",
    calories: 180,
    protein: 25,
    carbs: 10,
    fats: 3,
    ingredients_en: ["4 egg whites", "1 cup spinach", "1/2 cup mushrooms", "1/2 cup bell peppers", "Salt and pepper"],
    ingredients_ro: ["4 albușuri", "1 cană spanac", "1/2 cană ciuperci", "1/2 cană ardei gras", "Sare și piper"],
    instructions_en: ["Whisk egg whites", "Sauté vegetables", "Add eggs and scramble", "Season to taste"],
    instructions_ro: ["Bate albușurile", "Călește legumele", "Adaugă ouăle și amestecă", "Condimentează după gust"],
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800",
    is_vegetarian: true
  },

  // PHASE 2 - LUNCH  
  {
    name: "Grilled Chicken with Asparagus",
    name_ro: "Pui la Grătar cu Sparanghel",
    phase: 2,
    meal_type: "lunch",
    calories: 320,
    protein: 45,
    carbs: 8,
    fats: 12,
    ingredients_en: ["200g chicken breast", "200g asparagus", "1 tbsp olive oil", "Lemon", "Garlic", "Herbs"],
    ingredients_ro: ["200g piept de pui", "200g sparanghel", "1 lingură ulei de măsline", "Lămâie", "Usturoi", "Ierburi"],
    instructions_en: ["Season chicken with herbs", "Grill chicken until done", "Roast asparagus with oil", "Serve with lemon"],
    instructions_ro: ["Condimentează puiul cu ierburi", "Gătește puiul la grătar", "Coace sparanghelul cu ulei", "Servește cu lămâie"],
    image_url: "https://images.unsplash.com/photo-1612057888294-9c11a7178022?w=800",
    is_vegetarian: false
  },

  // PHASE 2 - SNACKS
  {
    name: "Celery with Hummus",
    name_ro: "Țelină cu Hummus",
    phase: 2,
    meal_type: "snack1",
    calories: 120,
    protein: 4,
    carbs: 12,
    fats: 6,
    ingredients_en: ["4 celery sticks", "1/4 cup hummus"],
    ingredients_ro: ["4 tulpini țelină", "1/4 cană hummus"],
    instructions_en: ["Wash celery", "Cut into sticks", "Serve with hummus"],
    instructions_ro: ["Spală țelina", "Taie în bețișoare", "Servește cu hummus"],
    image_url: "https://images.unsplash.com/photo-1529288475508-c303ace43d0f?w=800",
    is_vegetarian: true,
    is_vegan: true
  },

  // PHASE 3 - BREAKFAST
  {
    name: "Avocado Toast with Eggs",
    name_ro: "Toast cu Avocado și Ouă",
    phase: 3,
    meal_type: "breakfast",
    calories: 420,
    protein: 20,
    carbs: 35,
    fats: 24,
    ingredients_en: ["2 slices whole grain bread", "1 avocado", "2 eggs", "Salt", "Pepper", "Chili flakes"],
    ingredients_ro: ["2 felii pâine integrală", "1 avocado", "2 ouă", "Sare", "Piper", "Fulgi de chili"],
    instructions_en: ["Toast bread", "Mash avocado", "Fry eggs", "Assemble and season"],
    instructions_ro: ["Prăjește pâinea", "Pasează avocado", "Prăjește ouăle", "Asamblează și condimentează"],
    image_url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800",
    is_vegetarian: true
  },

  // PHASE 3 - LUNCH
  {
    name: "Salmon with Roasted Vegetables",
    name_ro: "Somon cu Legume la Cuptor",
    phase: 3,
    meal_type: "lunch",
    calories: 480,
    protein: 40,
    carbs: 25,
    fats: 25,
    ingredients_en: ["200g salmon fillet", "2 cups mixed vegetables", "2 tbsp olive oil", "Lemon", "Herbs"],
    ingredients_ro: ["200g file de somon", "2 căni legume mixte", "2 linguri ulei de măsline", "Lămâie", "Ierburi"],
    instructions_en: ["Season salmon", "Roast vegetables with oil", "Bake salmon at 180°C for 15 min", "Serve together"],
    instructions_ro: ["Condimentează somonul", "Coace legumele cu ulei", "Coace somonul la 180°C timp de 15 min", "Servește împreună"],
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
    is_vegetarian: false
  },

  // PHASE 3 - SNACKS
  {
    name: "Almonds and Dark Chocolate",
    name_ro: "Migdale și Ciocolată Neagră",
    phase: 3,
    meal_type: "snack1",
    calories: 200,
    protein: 6,
    carbs: 15,
    fats: 14,
    ingredients_en: ["20 almonds", "2 squares dark chocolate (70%+)"],
    ingredients_ro: ["20 migdale", "2 pătrățele ciocolată neagră (70%+)"],
    instructions_en: ["Portion almonds and chocolate", "Enjoy slowly"],
    instructions_ro: ["Porționează migdalele și ciocolata", "Savurează încet"],
    image_url: "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800",
    is_vegetarian: true
  }
];

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if recipes already exist
    const checkResult = await pool.query('SELECT COUNT(*) FROM recipes');
    const existingCount = parseInt(checkResult.rows[0].count);
    
    if (existingCount > 0) {
      return res.status(200).json({ 
        message: `Database already has ${existingCount} recipes. Skipping seed.`,
        count: existingCount
      });
    }

    // Insert recipes
    let inserted = 0;
    for (const recipe of recipes) {
      await pool.query(`
        INSERT INTO recipes (
          name, name_ro, phase, meal_type, calories, protein, carbs, fats,
          ingredients_en, ingredients_ro, instructions_en, instructions_ro,
          image_url, is_vegetarian, is_vegan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        recipe.name,
        recipe.name_ro,
        recipe.phase,
        recipe.meal_type,
        recipe.calories,
        recipe.protein,
        recipe.carbs,
        recipe.fats,
        JSON.stringify(recipe.ingredients_en),
        JSON.stringify(recipe.ingredients_ro),
        JSON.stringify(recipe.instructions_en),
        JSON.stringify(recipe.instructions_ro),
        recipe.image_url,
        recipe.is_vegetarian,
        recipe.is_vegan
      ]);
      inserted++;
    }

    return res.status(200).json({ 
      message: `Successfully seeded ${inserted} recipes!`,
      count: inserted
    });

  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ 
      error: 'Failed to seed recipes',
      details: error.message 
    });
  }
}

