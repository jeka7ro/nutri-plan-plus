-- Fix chocolate recipes in Phase 3
-- Move chocolate recipes from Phase 3 to Phase 1 (where chocolate is allowed)

UPDATE recipes 
SET phase = 1 
WHERE (name ILIKE '%chocolate%' OR name_ro ILIKE '%ciocolat%') 
AND phase = 3;

-- Alternative: Replace chocolate recipes with healthy Phase 3 alternatives
-- Delete chocolate recipes from Phase 3
DELETE FROM recipes 
WHERE (name ILIKE '%chocolate%' OR name_ro ILIKE '%ciocolat%') 
AND phase = 3;

-- Add healthy Phase 3 snack alternatives
INSERT INTO recipes (name, name_ro, phase, meal_type, calories, protein, carbs, fat, ingredients_en, ingredients_ro, instructions_en, instructions_ro, image_url, is_vegetarian, is_vegan) VALUES
('Mixed Nuts', 'Mix de Nuci', 3, 'snack1', 200, 6, 8, 18, ARRAY['almonds', 'walnuts', 'cashews'], ARRAY['migdale', 'nuci', 'caju'], ARRAY['Portion and enjoy'], ARRAY['Porționează și savurează'], 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800', true, true),
('Avocado Toast', 'Toast cu Avocado', 3, 'snack1', 220, 6, 20, 15, ARRAY['avocado', 'whole grain bread', 'olive oil'], ARRAY['avocado', 'pâine integrală', 'ulei măsline'], ARRAY['Mash avocado', 'Spread on toast'], ARRAY['Pisează avocado', 'Întinde pe pâine'], 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800', true, true);
