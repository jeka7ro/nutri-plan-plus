-- Adaugă rețete SNACK2 pentru Phase 1 și Phase 2
-- Phase 1 = High carbs, fructe
-- Phase 2 = High protein, low carbs

-- PHASE 1 SNACKS (Fructe)
INSERT INTO recipes (
  name, name_ro, name_en,
  description_ro, description_en,
  ingredients_ro, ingredients_en,
  instructions_ro, instructions_en,
  calories, protein, carbs, fats,
  prep_time, cook_time, servings,
  phase, meal_type,
  image_url,
  is_vegetarian, is_vegan,
  allergens,
  benefits_ro, benefits_en
) VALUES
-- 1. MĂR VERDE CU SCORȚIȘOARĂ
('Măr Verde cu Scorțișoară', 'Măr Verde cu Scorțișoară', 'Green Apple with Cinnamon',
 'Un snack simplu și sănătos - măr verde proaspăt presărat cu scorțișoară.',
 'A simple and healthy snack - fresh green apple sprinkled with cinnamon.',
 '["1 măr verde", "½ linguriță scorțișoară"]'::jsonb,
 '["1 green apple", "½ tsp cinnamon"]'::jsonb,
 'Spală mărul, taie-l în felii și presară scorțișoară deasupra.',
 'Wash the apple, slice it and sprinkle cinnamon on top.',
 95, 0.5, 25, 0.3,
 5, 0, 1,
 1, 'snack2',
 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800',
 true, true,
 NULL,
 'Mărul conține fibre și antioxidanți, iar scorțișoara ajută la reglarea glicemiei.',
 'Apple contains fiber and antioxidants, cinnamon helps regulate blood sugar.'
),

-- 2. PORTOCALĂ FELII
('Portocală Felii', 'Portocală Felii', 'Orange Slices',
 'Portocală proaspătă tăiată în felii - perfectă pentru un snack rapid.',
 'Fresh orange sliced - perfect for a quick snack.',
 '["1 portocală mare"]'::jsonb,
 '["1 large orange"]'::jsonb,
 'Curăță portocala și taie-o în felii sau sferturi.',
 'Peel the orange and slice it into wedges or rounds.',
 62, 1.2, 15, 0.2,
 3, 0, 1,
 1, 'snack2',
 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800',
 true, true,
 NULL,
 'Bogată în vitamina C și antioxidanți, susține sistemul imunitar.',
 'Rich in vitamin C and antioxidants, supports immune system.'
),

-- 3. CĂPȘUNI PROASPETE
('Căpșuni Proaspete', 'Căpșuni Proaspete', 'Fresh Strawberries',
 'O ceașcă de căpșuni proaspete și aromate.',
 'A cup of fresh and fragrant strawberries.',
 '["1 ceașcă căpșuni"]'::jsonb,
 '["1 cup strawberries"]'::jsonb,
 'Spală căpșunile bine și servește-le proaspete.',
 'Wash the strawberries well and serve fresh.',
 49, 1, 12, 0.5,
 3, 0, 1,
 1, 'snack2',
 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800',
 true, true,
 NULL,
 'Căpșunile sunt bogate în vitamina C și ajută la reducerea inflamației.',
 'Strawberries are rich in vitamin C and help reduce inflammation.'
),

-- 4. PEPENE GALBEN
('Pepene Galben', 'Pepene Galben', 'Cantaloupe',
 'Felii suculente de pepene galben aromat.',
 'Juicy slices of fragrant cantaloupe.',
 '["1 ceașcă pepene galben cuburi"]'::jsonb,
 '["1 cup cantaloupe cubes"]'::jsonb,
 'Taie pepenele în cuburi și servește rece.',
 'Cut the cantaloupe into cubes and serve chilled.',
 54, 1.3, 13, 0.3,
 5, 0, 1,
 1, 'snack2',
 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=800',
 true, true,
 NULL,
 'Bogat în vitamina A și C, hidratant și ușor de digerat.',
 'Rich in vitamins A and C, hydrating and easy to digest.'
),

-- 5. MANGO FELII
('Mango Felii', 'Mango Felii', 'Mango Slices',
 'Mango tropical proaspăt tăiat în felii.',
 'Fresh tropical mango sliced.',
 '["½ mango mare"]'::jsonb,
 '["½ large mango"]'::jsonb,
 'Curăță mangoul și taie-l în felii sau cuburi.',
 'Peel the mango and slice it into wedges or cubes.',
 99, 1.4, 25, 0.6,
 5, 0, 1,
 1, 'snack2',
 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800',
 true, true,
 NULL,
 'Mango conține enzime digestive și este bogat în fibre.',
 'Mango contains digestive enzymes and is rich in fiber.'
),

-- PHASE 2 SNACKS (Proteine)
-- 6. ȘUNCĂ DE CURCAN FELII
('Șuncă de Curcan Felii', 'Șuncă de Curcan Felii', 'Turkey Breast Slices',
 '3-4 felii de șuncă de curcan slabă fără nitrați.',
 '3-4 slices of lean nitrate-free turkey breast.',
 '["100g șuncă de curcan fără nitrați"]'::jsonb,
 '["100g nitrate-free turkey breast"]'::jsonb,
 'Servește feliile de șuncă direct sau rulează-le.',
 'Serve the turkey slices directly or roll them up.',
 110, 22, 2, 2,
 2, 0, 1,
 2, 'snack2',
 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800',
 false, false,
 '["soia"]'::jsonb,
 'Sursă excelentă de proteine slabe, ideală pentru construcția musculară.',
 'Excellent source of lean protein, ideal for muscle building.'
),

-- 7. OUĂ FIERTE
('Ouă Fierte', 'Ouă Fierte', 'Hard Boiled Eggs',
 '2 ouă fierte tari - snack bogat în proteine.',
 '2 hard boiled eggs - protein-rich snack.',
 '["2 ouă"]'::jsonb,
 '["2 eggs"]'::jsonb,
 'Fierbe ouăle 10 minute, răcește-le sub apă rece și curăță-le.',
 'Boil eggs for 10 minutes, cool under cold water and peel.',
 140, 12, 2, 10,
 2, 10, 1,
 2, 'snack2',
 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800',
 true, false,
 '["ouă"]'::jsonb,
 'Ouăle conțin proteine complete și vitamine esențiale.',
 'Eggs contain complete proteins and essential vitamins.'
),

-- 8. PIEPT DE PUI LA GRĂTAR
('Piept de Pui la Grătar', 'Piept de Pui la Grătar', 'Grilled Chicken Breast',
 '100g piept de pui gătit la grătar cu condimente.',
 '100g chicken breast grilled with spices.',
 '["100g piept de pui", "sare", "piper", "usturoi pudră"]'::jsonb,
 '["100g chicken breast", "salt", "pepper", "garlic powder"]'::jsonb,
 'Condimentează puiul și gătește-l la grătar 6-8 minute pe fiecare parte.',
 'Season the chicken and grill for 6-8 minutes per side.',
 165, 31, 0, 3.6,
 5, 15, 1,
 2, 'snack2',
 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800',
 false, false,
 NULL,
 'Proteine slabe de înaltă calitate, susțin metabolismul și sațietatea.',
 'High-quality lean protein, supports metabolism and satiety.'
),

-- 9. TON DIN CONSERVĂ
('Ton din Conservă', 'Ton din Conservă', 'Canned Tuna',
 '½ cutie de ton în apă - simplu și rapid.',
 '½ can of tuna in water - simple and quick.',
 '["½ cutie ton în apă (80g)"]'::jsonb,
 '["½ can tuna in water (80g)"]'::jsonb,
 'Scurge apa din conservă și servește tonul.',
 'Drain the water from the can and serve the tuna.',
 90, 20, 0, 1,
 2, 0, 1,
 2, 'snack2',
 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800',
 false, false,
 '["pește"]'::jsonb,
 'Bogat în proteine și acizi grași Omega-3, bun pentru inimă.',
 'Rich in protein and Omega-3 fatty acids, good for heart health.'
),

-- 10. ROAST BEEF FELII
('Roast Beef Felii', 'Roast Beef Felii', 'Roast Beef Slices',
 '3-4 felii de roast beef slab.',
 '3-4 slices of lean roast beef.',
 '["100g roast beef slab"]'::jsonb,
 '["100g lean roast beef"]'::jsonb,
 'Servește feliile de roast beef direct.',
 'Serve the roast beef slices directly.',
 150, 25, 0, 5,
 2, 0, 1,
 2, 'snack2',
 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800',
 false, false,
 NULL,
 'Proteine de calitate superioară, bogat în fier și vitamina B12.',
 'Superior quality protein, rich in iron and vitamin B12.'
);

-- Verificare
SELECT 
  name_ro, 
  phase, 
  meal_type, 
  calories
FROM recipes 
WHERE meal_type = 'snack2'
ORDER BY phase, name_ro;
