// Add more FMD recipes based on book + hayliepomroy.com blog

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nutriplan',
  user: process.env.USER,
  password: '',
});

const recipes = [
  // ============================================================
  // PHASE 1 - Additional recipes
  // ============================================================
  {
    name_en: 'Chicken and Brown Rice Stir-Fry',
    name_ro: 'Pui cu Orez Brun la Wok',
    phase: 1,
    meal_type: 'lunch',
    ingredients_en: ['6 oz chicken breast', '1 cup cooked brown rice', '2 cups mixed vegetables', '2 cloves garlic', 'ginger', 'low-sodium tamari'],
    ingredients_ro: ['170g piept de pui', '1 cană orez brun gătit', '2 căni legume mixte', '2 căței usturoi', 'ghimbir', 'tamari cu sodiu redus'],
    instructions_en: 'Dice chicken and cook in non-stick pan. Add vegetables, garlic, ginger. Stir-fry until tender. Serve over brown rice.',
    instructions_ro: 'Taie puiul cubulețe și gătește în tigaie antiaderentă. Adaugă legume, usturoi, ghimbir. Sotează până se înmoaie. Servește peste orez brun.',
    calories: 420,
    protein: 38,
    carbs: 52,
    fats: 4,
    prep_time: 15,
    cook_time: 20,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    benefits_en: 'Lean chicken repairs tissues while brown rice provides sustained energy. Vegetables add fiber and nutrients for Phase 1 metabolic healing.',
    benefits_ro: 'Puiul slab repară țesuturile, iar orezul brun oferă energie susținută. Legumele adaugă fibre și nutrienți pentru vindecarea metabolică din Faza 1.'
  },

  // ============================================================
  // PHASE 2: High Protein, High Veg, Low Carb/Fat
  // From hayliepomroy.com blog
  // ============================================================
  {
    name_en: 'Best Baked Eggs in Pepper Cups',
    name_ro: 'Cele Mai Bune Ouă Coapte în Ardei',
    phase: 2,
    meal_type: 'breakfast',
    ingredients_en: ['2 bell peppers halved', '4 egg whites', '2 cups spinach', '1 tomato diced', 'sea salt', 'black pepper', 'fresh herbs'],
    ingredients_ro: ['2 ardei grași tăiați jumătate', '4 albușuri', '2 căni spanac', '1 roșie cubulețe', 'sare de mare', 'piper negru', 'ierburi proaspete'],
    instructions_en: 'Preheat oven to 375°F. Place pepper halves in baking dish. Fill with spinach and tomato. Pour egg whites over. Bake 25 minutes.',
    instructions_ro: 'Preîncălzește cuptorul la 190°C. Așază jumătățile de ardei în tava de copt. Umple cu spanac și roșie. Toarnă albușurile peste. Coace 25 minute.',
    calories: 180,
    protein: 22,
    carbs: 18,
    fats: 1,
    prep_time: 10,
    cook_time: 25,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&q=80',
    benefits_en: 'Egg whites provide pure protein for muscle preservation. Bell peppers add vitamin C and volume without fat during Phase 2 fat burning.',
    benefits_ro: 'Albușurile oferă proteine pure pentru păstrarea musculară. Ardeii adaugă vitamina C și volum fără grăsimi în timpul arderii grăsimilor din Faza 2.'
  },
  {
    name_en: 'Grilled Turkey Breast with Steamed Vegetables',
    name_ro: 'Piept de Curcan la Grătar cu Legume la Abur',
    phase: 2,
    meal_type: 'lunch',
    ingredients_en: ['6 oz turkey breast', '2 cups broccoli', '1 cup cauliflower', '1 cup green beans', 'lemon juice', 'sea salt', 'herbs'],
    ingredients_ro: ['170g piept de curcan', '2 căni broccoli', '1 cană conopidă', '1 cană fasole verde', 'suc de lămâie', 'sare de mare', 'ierburi'],
    instructions_en: 'Grill turkey breast with herbs and lemon. Steam vegetables until tender. Serve together.',
    instructions_ro: 'Gătește pieptul de curcan la grătar cu ierburi și lămâie. Fierbe legumele la abur până se înmoaie. Servește împreună.',
    calories: 280,
    protein: 45,
    carbs: 20,
    fats: 2,
    prep_time: 10,
    cook_time: 20,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
    benefits_en: 'Ultra-lean turkey maximizes protein intake. Cruciferous vegetables support detox and estrogen metabolism during Phase 2.',
    benefits_ro: 'Curcanu ultra-slab maximizează aportul de proteine. Legumele crucifere susțin detoxifierea și metabolismul estrogenilor în Faza 2.'
  },
  {
    name_en: 'Grilled White Fish with Asparagus',
    name_ro: 'Pește Alb la Grătar cu Sparanghel',
    phase: 2,
    meal_type: 'dinner',
    ingredients_en: ['6 oz cod or tilapia', '2 cups asparagus', '1 lemon', 'fresh dill', 'sea salt', 'black pepper'],
    ingredients_ro: ['170g cod sau tilapia', '2 căni sparanghel', '1 lămâie', 'mărar proaspăt', 'sare de mare', 'piper negru'],
    instructions_en: 'Season fish with lemon, dill, salt and pepper. Grill 4-5 min per side. Steam asparagus until tender.',
    instructions_ro: 'Asezonează peștele cu lămâie, mărar, sare și piper. Gătește la grătar 4-5 min pe fiecare parte. Fierbe sparanghelul la abur până se înmoaie.',
    calories: 220,
    protein: 40,
    carbs: 10,
    fats: 2,
    prep_time: 10,
    cook_time: 15,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1567337327099-a08949d3b9d0?w=800&q=80',
    benefits_en: 'Lean white fish provides easily digestible protein. Asparagus supports liver detox during Phase 2 fat mobilization.',
    benefits_ro: 'Peștele alb slab oferă proteine ușor digestibile. Sparanghelul susține detoxifierea ficatului în timpul mobilizării grăsimilor din Faza 2.'
  },

  // SNACKS
  {
    name_en: 'Sliced Turkey Breast',
    name_ro: 'Felii de Piept de Curcan',
    phase: 2,
    meal_type: 'snack1',
    ingredients_en: ['3 oz nitrate-free turkey breast slices'],
    ingredients_ro: ['85g felii piept de curcan fără nitrați'],
    instructions_en: 'Slice and serve cold.',
    instructions_ro: 'Taie felii și servește rece.',
    calories: 90,
    protein: 20,
    carbs: 0,
    fats: 1,
    prep_time: 2,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1628773822990-202d3a77c4c5?w=800&q=80',
    benefits_en: 'Pure protein snack that maintains muscle mass during Phase 2 fat burning without adding carbs or fat.',
    benefits_ro: 'Gustare cu proteine pure care menține masa musculară în timpul arderii grăsimilor din Faza 2 fără a adăuga carbohidrați sau grăsimi.'
  },
  {
    name_en: 'Cucumber Slices',
    name_ro: 'Felii de Castravete',
    phase: 2,
    meal_type: 'snack2',
    ingredients_en: ['1 large cucumber', 'sea salt', 'lemon juice'],
    ingredients_ro: ['1 castravete mare', 'sare de mare', 'suc de lămâie'],
    instructions_en: 'Slice cucumber, sprinkle with sea salt and lemon juice.',
    instructions_ro: 'Taie castravetele felii, presară cu sare de mare și suc de lămâie.',
    calories: 45,
    protein: 2,
    carbs: 10,
    fats: 0,
    prep_time: 3,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&q=80',
    benefits_en: 'Hydrating and low-calorie. Provides volume and crunch without disrupting Phase 2 protein focus.',
    benefits_ro: 'Hidratant și sărac în calorii. Oferă volum și crunch fără a perturba focusul pe proteine din Faza 2.'
  },

  // ============================================================
  // PHASE 3: Healthy Fats, Moderate Carbs - Unleash
  // From hayliepomroy.com blog
  // ============================================================
  {
    name_en: 'Chicken Piccata',
    name_ro: 'Chicken Piccata cu Lămâie',
    phase: 3,
    meal_type: 'dinner',
    ingredients_en: ['6 oz chicken breast', '2 tbsp butter', '2 tbsp olive oil', '1/4 cup capers', '1 lemon', '1/2 cup chicken broth', 'fresh parsley'],
    ingredients_ro: ['170g piept de pui', '2 linguri unt', '2 linguri ulei de măsline', '1/4 cană capere', '1 lămâie', '1/2 cană bulion de pui', 'pătrunjel proaspăt'],
    instructions_en: 'Pound chicken thin. Cook in butter and olive oil 3-4 min per side. Add capers, lemon juice, and broth. Simmer 5 min.',
    instructions_ro: 'Bate puiul subțire. Gătește în unt și ulei de măsline 3-4 min pe fiecare parte. Adaugă capere, suc de lămâie și bulion. Fierbe 5 min.',
    calories: 420,
    protein: 38,
    carbs: 8,
    fats: 28,
    prep_time: 10,
    cook_time: 15,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&q=80',
    benefits_en: 'Combines lean protein with healthy fats from butter and olive oil. Supports hormone synthesis in Phase 3.',
    benefits_ro: 'Combină proteine slabe cu grăsimi sănătoase din unt și ulei de măsline. Susține sinteza hormonală în Faza 3.'
  },
  {
    name_en: 'Poblano Pork Chili Verde',
    name_ro: 'Chili Verde cu Porc și Ardei Poblano',
    phase: 3,
    meal_type: 'dinner',
    ingredients_en: ['6 oz pork loin', '2 poblano peppers', '1 cup tomatillos', '1/2 avocado', '1 onion', 'cumin', 'garlic', 'cilantro'],
    ingredients_ro: ['170g mușchi de porc', '2 ardei poblano', '1 cană tomatillos', '1/2 avocado', '1 ceapă', 'chimion', 'usturoi', 'coriandru'],
    instructions_en: 'Roast peppers and tomatillos. Blend into sauce. Brown pork, add sauce and simmer 30 min. Top with avocado.',
    instructions_ro: 'Coace ardeii și tomatillos. Amestecă până devine sos. Rumenește porcul, adaugă sosul și fierbe 30 min. Pune avocado deasupra.',
    calories: 480,
    protein: 40,
    carbs: 22,
    fats: 28,
    prep_time: 20,
    cook_time: 40,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&q=80',
    benefits_en: 'Pork provides protein while poblano peppers add metabolism-boosting capsaicin. Avocado delivers healthy monounsaturated fats for Phase 3 hormone balance.',
    benefits_ro: 'Porcul oferă proteine, iar ardeii poblano adaugă capsaicină care stimulează metabolismul. Avocado furnizează grăsimi mononesaturate sănătoase pentru echilibrul hormonal din Faza 3.'
  },
  {
    name_en: 'Crab-Stuffed Bell Peppers',
    name_ro: 'Ardei Umpluți cu Crab',
    phase: 3,
    meal_type: 'lunch',
    ingredients_en: ['6 oz lump crab meat', '2 bell peppers halved', '1/4 cup almond flour', '2 tbsp olive oil', '1 lemon', 'fresh herbs', 'garlic'],
    ingredients_ro: ['170g carne de crab', '2 ardei grași tăiați jumătate', '1/4 cană făină de migdale', '2 linguri ulei de măsline', '1 lămâie', 'ierburi proaspete', 'usturoi'],
    instructions_en: 'Mix crab with almond flour, herbs, lemon and olive oil. Stuff peppers. Bake at 375°F for 25 minutes.',
    instructions_ro: 'Amestecă crabul cu făină de migdale, ierburi, lămâie și ulei de măsline. Umple ardeii. Coace la 190°C timp de 25 minute.',
    calories: 380,
    protein: 35,
    carbs: 18,
    fats: 20,
    prep_time: 15,
    cook_time: 25,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1616485740077-c0b30e4c89e2?w=800&q=80',
    benefits_en: 'Crab is lean protein rich in zinc and selenium. Olive oil and almond flour provide healthy fats for Phase 3 hormonal support.',
    benefits_ro: 'Crabul este proteină slabă bogată în zinc și seleniu. Uleiul de măsline și făina de migdale oferă grăsimi sănătoase pentru suportul hormonal din Faza 3.'
  },
  {
    name_en: 'Avocado with Hard-Boiled Eggs',
    name_ro: 'Avocado cu Ouă Fierte',
    phase: 3,
    meal_type: 'breakfast',
    ingredients_en: ['1/2 avocado', '2 hard-boiled eggs', 'sea salt', 'black pepper', 'lemon juice'],
    ingredients_ro: ['1/2 avocado', '2 ouă fierte', 'sare de mare', 'piper negru', 'suc de lămâie'],
    instructions_en: 'Slice avocado and eggs. Season with salt, pepper, and lemon juice.',
    instructions_ro: 'Taie avocado și ouăle felii. Asezonează cu sare, piper și suc de lămâie.',
    calories: 340,
    protein: 14,
    carbs: 12,
    fats: 28,
    prep_time: 5,
    cook_time: 10,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80',
    benefits_en: 'Avocado provides monounsaturated fats while eggs deliver cholesterol needed for hormone production in Phase 3.',
    benefits_ro: 'Avocado furnizează grăsimi mononesaturate, iar ouăle oferă colesterol necesar producției de hormoni în Faza 3.'
  },
  {
    name_en: 'Raw Almonds',
    name_ro: 'Migdale Crude',
    phase: 3,
    meal_type: 'snack1',
    ingredients_en: ['1/4 cup raw almonds'],
    ingredients_ro: ['1/4 cană migdale crude'],
    instructions_en: 'Measure and enjoy as snack.',
    instructions_ro: 'Măsoară și savurează ca gustare.',
    calories: 170,
    protein: 6,
    carbs: 6,
    fats: 15,
    prep_time: 1,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&q=80',
    benefits_en: 'Almonds provide vitamin E, magnesium, and healthy fats essential for Phase 3 hormone balance and brain health.',
    benefits_ro: 'Migdalele oferă vitamina E, magneziu și grăsimi sănătoase esențiale pentru echilibrul hormonal și sănătatea creierului din Faza 3.'
  },
  {
    name_en: 'Hummus with Celery Sticks',
    name_ro: 'Hummus cu Țelină',
    phase: 3,
    meal_type: 'snack2',
    ingredients_en: ['1/2 cup hummus (with tahini)', '2 cups celery sticks'],
    ingredients_ro: ['1/2 cană hummus (cu tahini)', '2 căni bățoane țelină'],
    instructions_en: 'Serve hummus with fresh celery sticks for dipping.',
    instructions_ro: 'Servește hummus cu bățoane de țelină proaspătă pentru dipping.',
    calories: 210,
    protein: 8,
    carbs: 18,
    fats: 14,
    prep_time: 5,
    cook_time: 0,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80',
    benefits_en: 'Hummus provides plant protein and healthy fats from tahini and olive oil. Perfect Phase 3 snack for hormone support.',
    benefits_ro: 'Hummus oferă proteine vegetale și grăsimi sănătoase din tahini și ulei de măsline. Gustare perfectă pentru Faza 3 și suportul hormonal.'
  },
  {
    name_en: 'Grilled Salmon with Quinoa and Vegetables',
    name_ro: 'Somon la Grătar cu Quinoa și Legume',
    phase: 3,
    meal_type: 'dinner',
    ingredients_en: ['6 oz wild salmon', '1/2 cup cooked quinoa', '2 cups mixed vegetables', '2 tbsp olive oil', 'lemon', 'fresh dill'],
    ingredients_ro: ['170g somon sălbatic', '1/2 cană quinoa gătită', '2 căni legume mixte', '2 linguri ulei de măsline', 'lămâie', 'mărar proaspăt'],
    instructions_en: 'Grill salmon with lemon and dill. Sauté vegetables in olive oil. Serve with quinoa.',
    instructions_ro: 'Gătește somonul la grătar cu lămâie și mărar. Sotează legumele în ulei de măsline. Servește cu quinoa.',
    calories: 520,
    protein: 42,
    carbs: 28,
    fats: 28,
    prep_time: 10,
    cook_time: 20,
    servings: 1,
    image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80',
    benefits_en: 'Salmon provides omega-3 EPA and DHA for brain health. Quinoa offers complete protein while olive oil supports hormone production.',
    benefits_ro: 'Somonul furnizează omega-3 EPA și DHA pentru sănătatea creierului. Quinoa oferă proteine complete, iar uleiul de măsline susține producția de hormoni.'
  },
];

async function seedRecipes() {
  const client = await pool.connect();
  
  try {
    console.log(`\n🌱 Adding ${recipes.length} more recipes from FMD book...\n`);
    
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
        recipe.description_en || '', recipe.description_ro || '', recipe.description_en || '',
        JSON.stringify(recipe.ingredients_en), JSON.stringify(recipe.ingredients_ro), JSON.stringify(recipe.ingredients_en),
        recipe.instructions_en, recipe.instructions_ro, recipe.instructions_en,
        recipe.calories, recipe.protein, recipe.carbs, recipe.fats,
        recipe.prep_time, recipe.cook_time, recipe.servings,
        recipe.phase, recipe.meal_type, recipe.image_url,
        recipe.benefits_en, recipe.benefits_ro
      ]);
      
      console.log(`✅ ${recipe.name_en} (Phase ${recipe.phase} - ${recipe.meal_type})`);
    }
    
    console.log(`\n✅ Successfully added ${recipes.length} recipes!\n`);
    
    // Show totals
    const result = await client.query(`
      SELECT phase, meal_type, COUNT(*) 
      FROM recipes 
      GROUP BY phase, meal_type 
      ORDER BY phase, meal_type
    `);
    
    console.log('\n📊 Current recipe distribution:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedRecipes();

