-- Adaugă snack1 pentru Phase 2 (proteine simple, ușoare)
-- Phase 2 = High protein, low carbs
-- Snack-uri = mici, simple, 80-150 cal

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
-- 1. ALBUȘ DE OU FIERT
('Albuș de Ou Fiert', 'Albuș de Ou Fiert', 'Hard Boiled Egg White',
 '2 albușuri de ou fierte - snack proteic ultra-slab.',
 '2 hard boiled egg whites - ultra-lean protein snack.',
 '["2 ouă (doar albușul)"]'::jsonb,
 '["2 eggs (whites only)"]'::jsonb,
 'Fierbe ouăle, curăță-le și scoate doar albușurile.',
 'Boil eggs, peel and use only the whites.',
 34, 7, 0.5, 0,
 2, 10, 1,
 2, 'snack1',
 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800',
 true, false,
 '["ouă"]'::jsonb,
 'Proteină pură, zero grăsimi, ideal pentru Phase 2.',
 'Pure protein, zero fat, ideal for Phase 2.'
),

-- 2. PIEPT DE CURCAN FELII
('Piept de Curcan Felii', 'Piept de Curcan Felii', 'Turkey Breast Slices',
 '2-3 felii subțiri de piept de curcan.',
 '2-3 thin slices of turkey breast.',
 '["60g piept de curcan fără piele"]'::jsonb,
 '["60g skinless turkey breast"]'::jsonb,
 'Servește feliile de curcan direct.',
 'Serve turkey slices directly.',
 66, 13, 0, 1,
 2, 0, 1,
 2, 'snack1',
 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800',
 false, false,
 NULL,
 'Proteină slabă, ușor de digerat.',
 'Lean protein, easy to digest.'
),

-- 3. TON DIN CONSERVĂ MIC
('Ton din Conservă', 'Ton din Conservă', 'Canned Tuna',
 '¼ cutie de ton în apă.',
 '¼ can of tuna in water.',
 '["40g ton în apă"]'::jsonb,
 '["40g tuna in water"]'::jsonb,
 'Scurge apa și servește.',
 'Drain water and serve.',
 45, 10, 0, 0.5,
 1, 0, 1,
 2, 'snack1',
 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800',
 false, false,
 '["pește"]'::jsonb,
 'Proteine de calitate, Omega-3.',
 'Quality protein, Omega-3.'
),

-- 4. PIEPT DE PUI BUCĂȚI
('Piept de Pui Bucăți', 'Piept de Pui Bucăți', 'Chicken Breast Pieces',
 'Câteva bucăți de piept de pui fiert sau la grătar.',
 'A few pieces of boiled or grilled chicken breast.',
 '["60g piept de pui"]'::jsonb,
 '["60g chicken breast"]'::jsonb,
 'Fierbe sau gătește la grătar 8-10 minute.',
 'Boil or grill for 8-10 minutes.',
 99, 19, 0, 2,
 3, 10, 1,
 2, 'snack1',
 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800',
 false, false,
 NULL,
 'Proteine slabe, sărac în calorii.',
 'Lean protein, low calorie.'
),

-- 5. CREVEȚI FIERȚI
('Creveți Fierți', 'Creveți Fierți', 'Boiled Shrimp',
 '4-5 creveți fierți - snack proteic din fructe de mare.',
 '4-5 boiled shrimp - seafood protein snack.',
 '["60g creveți"]'::jsonb,
 '["60g shrimp"]'::jsonb,
 'Fierbe crevețiiîn apă cu sare 3-4 minute.',
 'Boil shrimp in salted water for 3-4 minutes.',
 72, 15, 0, 1,
 3, 5, 1,
 2, 'snack1',
 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800',
 false, false,
 '["fructe de mare"]'::jsonb,
 'Proteine din fructe de mare, sărac în grăsimi.',
 'Seafood protein, low fat.'
);

-- Verificare
SELECT phase, meal_type, name_ro, calories
FROM recipes
WHERE phase = 2 AND meal_type IN ('snack1', 'snack2')
ORDER BY meal_type, calories;

