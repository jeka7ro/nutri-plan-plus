-- Adaugă "gustări" mai ușoare pentru Phase 2
-- Pentru user-ii care vor ceva mai "snack-like" decât doar carne

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
-- CEAI DE PROTEINE / SHAKE PROTEIC
('Shake Proteic Simplu', 'Shake Proteic Simplu', 'Simple Protein Shake',
 'Apă + pudră proteică (zer sau plant-based).',
 'Water + protein powder (whey or plant-based).',
 '["1 măsură pudră proteică", "200ml apă"]'::jsonb,
 '["1 scoop protein powder", "200ml water"]'::jsonb,
 'Amestecă pudra cu apa în shaker.',
 'Mix powder with water in shaker.',
 100, 20, 2, 1,
 2, 0, 1,
 2, 'snack1',
 'https://images.unsplash.com/photo-1622484211574-b87f5a93d7ce?w=800',
 true, true,
 '["soia (dacă e din zer)"]'::jsonb,
 'Proteină rapidă, ușor de digerat, convenabil.',
 'Fast protein, easy to digest, convenient.'
),

-- IAURT GRECESC FĂRĂ GRĂSIME
('Iaurt Grecesc 0% Grăsime', 'Iaurt Grecesc 0% Grăsime', 'Fat-Free Greek Yogurt',
 '½ ceașcă iaurt grecesc fără grăsime.',
 '½ cup fat-free Greek yogurt.',
 '["120ml iaurt grecesc 0% grăsime"]'::jsonb,
 '["120ml fat-free Greek yogurt"]'::jsonb,
 'Servește direct sau adaugă scorțișoară.',
 'Serve plain or add cinnamon.',
 80, 14, 6, 0,
 1, 0, 1,
 2, 'snack1',
 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
 true, false,
 '["lactate"]'::jsonb,
 'Probiotice, proteină de calitate, calciul.',
 'Probiotics, quality protein, calcium.'
);

-- Verificare
SELECT phase, meal_type, name_ro, calories, protein
FROM recipes
WHERE phase = 2 AND meal_type = 'snack1'
ORDER BY calories;

