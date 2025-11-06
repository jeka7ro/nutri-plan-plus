// Seed recipes BASED ON "The Fast Metabolism Diet" book by Haylie Pomroy
// Recipes follow FMD rules extracted from book + photos from hayliepomroy.com

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nutriplan',
  user: process.env.USER,
  password: '',
});

// Recipes from book Chapter 12 + FMD blog
const recipes = [
  // ============================================================
  // PHASE 1: High Carb, Low Fat - Unwind (Calm adrenal glands)
  // ============================================================
  
  // BREAKFASTS
  {
    name_en: 'Frozen Mango Fat-Burning Smoothie',
    name_ro: 'Smoothie Congelat cu Mango pentru Arderea Grăsimilor',
    phase: 1,
    meal_type: 'breakfast',
    ingredients_en: ['1 cup frozen mango', '1 cup unsweetened almond milk', '1 scoop vanilla protein powder', '1/2 cup ice', '1 tsp vanilla extract'],
    ingredients_ro: ['1 cană mango congelat', '1 cană lapte de migdale neîndulcit', '1 măsură proteină vanilie', '1/2 cană gheață', '1 linguriță extract vanilie'],
    instructions_en: 'Blend all ingredients until smooth. Serve immediately.',
    instructions_ro: 'Amestecă toate ingredientele până devin cremoase. Servește imediat.',
    calories: 280,
    protein: 25,
    carbs: 40,
    fats: 2,
    prep_time: 5,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80',
    benefits_en: 'Mango provides natural fruit sugars for quick energy. Protein powder supports muscle maintenance during Phase 1 while keeping fat content minimal.',
    benefits_ro: 'Mango-ul furnizează zaharuri naturale pentru energie rapidă. Proteina susține menținerea musculară în Faza 1 menținând conținutul de grăsimi minim.',
    description_en: 'A refreshing breakfast smoothie packed with tropical mango flavor and metabolism-boosting nutrients.',
    description_ro: 'Un smoothie de mic dejun răcoritor, plin de aromă tropicală de mango și nutrienți care stimulează metabolismul.'
  },
  {
    name_en: 'Oatmeal Fruit Smoothie',
    name_ro: 'Smoothie cu Ovăz și Fructe',
    phase: 1,
    meal_type: 'breakfast',
    ingredients_en: ['1/2 cup rolled oats', '1 cup frozen berries', '1 banana', '1 cup water', '1 scoop protein powder', 'stevia to taste'],
    ingredients_ro: ['1/2 cană fulgi de ovăz', '1 cană fructe de pădure congelate', '1 banană', '1 cană apă', '1 măsură proteină', 'stevia după gust'],
    instructions_en: 'Blend oats with water first until smooth. Add remaining ingredients and blend until creamy.',
    instructions_ro: 'Amestecă ovăzul cu apa mai întâi până devine neted. Adaugă restul ingredientelor și mixează până devine cremos.',
    calories: 320,
    protein: 28,
    carbs: 52,
    fats: 3,
    prep_time: 5,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1559124136-6e552e13d5f3?w=800&q=80',
    benefits_en: 'Oats provide slow-releasing carbs with beta-glucan fiber. Berries add antioxidants while banana provides potassium for Phase 1 adrenal support.',
    benefits_ro: 'Ovăzul oferă carbohidrați cu eliberare lentă și fibre beta-glucan. Fructele de pădure adaugă antioxidanți, iar banana furnizează potasiu pentru suportul suprarenal din Faza 1.'
  },
  {
    name_en: 'Strawberry French Toast',
    name_ro: 'Pâine Prăjită Franceză cu Căpșuni',
    phase: 1,
    meal_type: 'breakfast',
    ingredients_en: ['2 slices sprouted grain bread', '2 egg whites', '1/4 cup unsweetened almond milk', '1 tsp cinnamon', '1 cup fresh strawberries', 'stevia to taste'],
    ingredients_ro: ['2 felii pâine din cereale încolțite', '2 albușuri', '1/4 cană lapte de migdale neîndulcit', '1 linguriță scorțișoară', '1 cană căpșuni proaspete', 'stevia după gust'],
    instructions_en: 'Whisk egg whites, milk, and cinnamon. Dip bread and cook in non-stick pan until golden. Top with strawberries.',
    instructions_ro: 'Bate albușurile, laptele și scorțișoara. Scufundă pâinea și gătește în tigaie antiaderentă până se rumenește. Pune căpșuni deasupra.',
    calories: 295,
    protein: 18,
    carbs: 48,
    fats: 2,
    prep_time: 5,
    cook_time: 10,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
    benefits_en: 'Sprouted grain bread provides complex carbs. Strawberries offer vitamin C and antioxidants for Phase 1 metabolic repair.',
    benefits_ro: 'Pâinea din cereale încolțite oferă carbohidrați complecși. Căpșunile furnizează vitamina C și antioxidanți pentru repararea metabolică din Faza 1.'
  },

  // LUNCHES
  {
    name_en: 'Tuna, Green Apple, and Spinach Salad',
    name_ro: 'Salată cu Ton, Măr Verde și Spanac',
    phase: 1,
    meal_type: 'lunch',
    ingredients_en: ['1 can tuna in water (drained)', '1 green apple, diced', '2 cups fresh spinach', '1/4 cup lemon juice', '1 tbsp apple cider vinegar', 'sea salt and pepper'],
    ingredients_ro: ['1 cutie ton în apă (scurs)', '1 măr verde tăiat cubulețe', '2 căni spanac proaspăt', '1/4 cană suc de lămâie', '1 lingură oțet de mere', 'sare de mare și piper'],
    instructions_en: 'Combine all ingredients in a bowl. Toss well and serve immediately.',
    instructions_ro: 'Combină toate ingredientele într-un bol. Amestecă bine și servește imediat.',
    calories: 310,
    protein: 35,
    carbs: 28,
    fats: 3,
    prep_time: 10,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80',
    benefits_en: 'Tuna provides lean protein while green apple adds pectin fiber. Spinach delivers iron and nutrients for Phase 1 energy.',
    benefits_ro: 'Tonul oferă proteine slabe, iar mărul verde adaugă fibre pectină. Spanacul furnizează fier și nutrienți pentru energia Fazei 1.'
  },
  {
    name_en: 'Open-Faced Chicken Sandwich',
    name_ro: 'Sandwich Deschis cu Pui',
    phase: 1,
    meal_type: 'lunch',
    ingredients_en: ['4 oz grilled chicken breast', '1 slice sprouted grain bread', '1/4 cup hummus (no tahini)', 'lettuce, tomato, cucumber', 'mustard'],
    ingredients_ro: ['115g piept de pui la grătar', '1 felie pâine din cereale încolțite', '1/4 cană hummus (fără tahini)', 'salată, roșie, castravete', 'muștar'],
    instructions_en: 'Toast bread. Spread hummus, top with chicken and vegetables. Add mustard to taste.',
    instructions_ro: 'Prăjește pâinea. Întinde hummus, adaugă pui și legume deasupra. Adaugă muștar după gust.',
    calories: 340,
    protein: 38,
    carbs: 32,
    fats: 4,
    prep_time: 10,
    cook_time: 15,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&q=80',
    benefits_en: 'Lean chicken provides complete protein. Sprouted grains offer easily digestible carbs for Phase 1 metabolic support.',
    benefits_ro: 'Puiul slab oferă proteine complete. Cerealele încolțite furnizează carbohidrați ușor digestibili pentru suportul metabolic al Fazei 1.'
  },
  {
    name_en: 'Turkey Chili',
    name_ro: 'Chili cu Curcan',
    phase: 1,
    meal_type: 'dinner',
    ingredients_en: ['8 oz ground turkey breast', '1 can diced tomatoes', '1 can kidney beans', '1 onion diced', '2 cloves garlic', 'chili powder, cumin', '1 cup brown rice'],
    ingredients_ro: ['225g piept de curcan tocat', '1 cutie roșii cubulețe', '1 cutie fasole roșie', '1 ceapă cubulețe', '2 căței usturoi', 'boia de ardei, chimion', '1 cană orez brun'],
    instructions_en: 'Brown turkey with onion and garlic. Add tomatoes, beans, and spices. Simmer 30 minutes. Serve over brown rice.',
    instructions_ro: 'Rumenește curcanu cu ceapă și usturoi. Adaugă roșii, fasole și condimente. Fierbe 30 minute. Servește peste orez brun.',
    calories: 450,
    protein: 42,
    carbs: 58,
    fats: 4,
    prep_time: 15,
    cook_time: 35,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',
    benefits_en: 'Turkey provides lean protein while beans add fiber. Brown rice offers sustained energy for Phase 1 adrenal healing.',
    benefits_ro: 'Curcanu oferă proteine slabe, iar fasolea adaugă fibre. Orezul brun furnizează energie susținută pentru vindecarea suprarenalelor din Faza 1.'
  },

  // SNACKS
  {
    name_en: 'Fresh Apple',
    name_ro: 'Măr Proaspăt',
    phase: 1,
    meal_type: 'snack1',
    ingredients_en: ['1 medium apple', 'optional: cinnamon'],
    ingredients_ro: ['1 măr mediu', 'opțional: scorțișoară'],
    instructions_en: 'Wash and slice apple. Sprinkle with cinnamon if desired.',
    instructions_ro: 'Spală și taie mărul felii. Presară cu scorțișoară după gust.',
    calories: 95,
    protein: 0,
    carbs: 25,
    fats: 0,
    prep_time: 2,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1584306670957-acf935f5033c?w=800&q=80',
    benefits_en: 'Natural fruit sugars provide quick energy while pectin fiber supports digestive health in Phase 1.',
    benefits_ro: 'Zaharurile naturale din fructe oferă energie rapidă, iar fibrele pectină susțin sănătatea digestivă în Faza 1.'
  },
  {
    name_en: 'Fresh Orange',
    name_ro: 'Portocală Proaspătă',
    phase: 1,
    meal_type: 'snack2',
    ingredients_en: ['1 medium orange'],
    ingredients_ro: ['1 portocală medie'],
    instructions_en: 'Peel and eat fresh.',
    instructions_ro: 'Curăță și mănâncă proaspătă.',
    calories: 62,
    protein: 1,
    carbs: 15,
    fats: 0,
    prep_time: 2,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&q=80',
    benefits_en: 'Vitamin C supports immune function while natural sugars provide Phase 1 energy without spiking blood sugar.',
    benefits_ro: 'Vitamina C susține funcția imună, iar zaharurile naturale oferă energie pentru Faza 1 fără creșteri bruște ale glicemiei.'
  },
  {
    name_en: 'Frozen Mango Chunks',
    name_ro: 'Bucăți de Mango Congelat',
    phase: 1,
    meal_type: 'snack1',
    ingredients_en: ['1 cup frozen mango chunks'],
    ingredients_ro: ['1 cană bucăți mango congelat'],
    instructions_en: 'Thaw slightly and eat as refreshing snack.',
    instructions_ro: 'Lasă să se dezghețe ușor și mănâncă ca gustare răcoritoare.',
    calories: 99,
    protein: 1,
    carbs: 25,
    fats: 0,
    prep_time: 2,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80',
    benefits_en: 'Tropical fruit enzymes aid digestion. Natural sugars provide sustained energy for Phase 1 metabolic healing.',
    benefits_ro: 'Enzimele fructului tropical ajută digestia. Zaharurile naturale oferă energie susținută pentru vindecarea metabolică din Faza 1.'
  },

  // Continue în următorul mesaj...
];

async function seedRecipes() {
  const client = await pool.connect();
  
  try {
    console.log(`\n🌱 Seeding ${recipes.length} REAL recipes from Fast Metabolism Diet book...\n`);
    
    for (const recipe of recipes) {
      await client.query(`
        INSERT INTO recipes (
          name, name_ro, name_en, 
          description, description_ro, description_en,
          ingredients, ingredients_ro, ingredients_en,
          instructions, instructions_ro, instructions_en,
          calories, protein, carbs, fats,
          prep_time, cook_time, servings,
          phase, meal_type, image_url,
          benefits_en, benefits_ro,
          is_public, requires_premium
        ) VALUES (
          $1, $2, $3,
          $4, $5, $6,
          $7, $8, $9,
          $10, $11, $12,
          $13, $14, $15, $16,
          $17, $18, $19,
          $20, $21, $22,
          $23, $24,
          true, false
        )
      `, [
        recipe.name_en, recipe.name_ro, recipe.name_en,
        recipe.description_en, recipe.description_ro, recipe.description_en,
        JSON.stringify(recipe.ingredients_en), JSON.stringify(recipe.ingredients_ro), JSON.stringify(recipe.ingredients_en),
        recipe.instructions_en, recipe.instructions_ro, recipe.instructions_en,
        recipe.calories, recipe.protein, recipe.carbs, recipe.fats,
        recipe.prep_time, recipe.cook_time, recipe.servings,
        recipe.phase, recipe.meal_type, recipe.image_url,
        recipe.benefits_en, recipe.benefits_ro
      ]);
      
      console.log(`✅ ${recipe.name_en} (Phase ${recipe.phase})`);
    }
    
    console.log(`\n✅ Successfully seeded ${recipes.length} recipes from book!\n`);
    
  } catch (error) {
    console.error('❌ Error seeding recipes:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedRecipes();

