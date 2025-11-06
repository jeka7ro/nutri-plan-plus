-- 🔥 FIXEAZĂ GUSTĂRI DIN CARTEA OFICIALĂ HAYLIE POMROY
-- Sursă: https://templaterepublic.com/wp-content/uploads/Fast-Metabolism-Diet-Meal-Plan-02.pdf

-- 1️⃣ ȘTERGE TOATE REȚETELE GREȘITE
DELETE FROM recipes;

-- 2️⃣ ADAUGĂ GUSTĂRI PHASE 1 - DOAR FRUCTE! (carte pag. 2)
INSERT INTO recipes (name_en, name_ro, phase, meal_type, servings, prep_time, cook_time, calories, protein, carbs, fat, ingredients_en, ingredients_ro, instructions_en, instructions_ro, benefits_en, benefits_ro, image_url)
VALUES 
('Apple Slices', 'Felii de Măr', 1, 'snack1', 1, 2, 0, 95, 0.5, 25, 0.3, '1 medium apple', '1 măr mediu', 'Wash and slice apple into wedges.', 'Spălați și tăiați mărul în felii.', 'Rich in fiber and vitamin C, perfect Phase 1 snack.', 'Bogat în fibre și vitamina C, gustare perfectă pentru Faza 1.', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400'),

('Fresh Mango', 'Mango Proaspăt', 1, 'snack2', 1, 3, 0, 135, 1, 35, 0.6, '1 cup fresh mango chunks', '1 cană cuburi de mango proaspăt', 'Peel and cut fresh mango into chunks.', 'Curățați și tăiați mango în cuburi.', 'High in vitamins A and C, natural energy boost.', 'Bogat în vitamine A și C, energie naturală.', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'),

('Fresh Strawberries', 'Căpșuni Proaspete', 1, 'snack1', 1, 2, 0, 50, 1, 12, 0.5, '1 cup fresh strawberries', '1 cană căpșuni proaspete', 'Wash strawberries and remove stems.', 'Spălați căpșunile și îndepărtați cozile.', 'Packed with antioxidants and vitamin C.', 'Plin de antioxidanți și vitamina C.', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'),

('Pear', 'Pară', 1, 'snack2', 1, 1, 0, 100, 0.6, 27, 0.2, '1 medium pear', '1 pară medie', 'Wash and eat whole or slice.', 'Spălați și consumați întreagă sau felii.', 'High fiber fruit, aids digestion.', 'Fruct bogat în fibre, ajută digestia.', 'https://images.unsplash.com/photo-1568607689150-17e625c1586e?w=400'),

('Watermelon Cubes', 'Cuburi de Pepene', 1, 'snack1', 1, 5, 0, 85, 1.7, 21, 0.4, '2 cups watermelon cubes', '2 căni cuburi de pepene', 'Cut watermelon into bite-sized cubes.', 'Tăiați pepenele în cuburi mici.', 'Hydrating and refreshing, low in calories.', 'Hidratant și răcoritor, puține calorii.', 'https://images.unsplash.com/photo-1589984662646-e7b2e00b3e23?w=400');

-- 3️⃣ ADAUGĂ GUSTĂRI PHASE 2 - DOAR PROTEINE! (carte pag. 4)
INSERT INTO recipes (name_en, name_ro, phase, meal_type, servings, prep_time, cook_time, calories, protein, carbs, fat, ingredients_en, ingredients_ro, instructions_en, instructions_ro, benefits_en, benefits_ro, image_url)
VALUES 
('Hard-Boiled Egg Whites', 'Albuș de Ou Fiert', 2, 'snack1', 1, 2, 10, 68, 14, 1, 0.2, '4 hard-boiled egg whites', '4 albușuri de ou fiert', 'Boil eggs for 10 minutes, peel and remove yolks.', 'Fierbeți ouăle 10 minute, curățați și scoateți gălbenușurile.', 'Pure protein, fat-free, perfect for Phase 2.', 'Proteină pură, fără grăsimi, perfectă pentru Faza 2.', 'https://images.unsplash.com/photo-1587486937692-0197703ec0a0?w=400'),

('Sliced Turkey Breast', 'Piept de Curcan Felii', 2, 'snack2', 1, 2, 0, 110, 24, 0, 1, '3 oz nitrate-free turkey breast slices', '85g felii piept de curcan fără nitrați', 'Roll up turkey slices and enjoy.', 'Rulați feliile de curcan și consumați.', 'Lean protein, supports muscle building.', 'Proteină slabă, susține creșterea musculară.', 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400'),

('Tuna from Can', 'Ton din Conservă', 2, 'snack1', 1, 2, 0, 100, 22, 0, 1, '3 oz tuna packed in water', '85g ton conservat în apă', 'Drain and eat straight from the can.', 'Scurgeți și consumați direct din conservă.', 'High protein, omega-3 fatty acids.', 'Bogat în proteine, acizi grași omega-3.', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400'),

('Grilled Chicken Strips', 'Fâșii de Pui la Grătar', 2, 'snack2', 1, 5, 10, 120, 26, 0, 1.5, '3 oz grilled chicken breast strips', '85g fâșii piept de pui la grătar', 'Grill chicken breast and slice into strips.', 'Grătarul pieptul de pui și tăiați în fâșii.', 'Lean protein for muscle repair.', 'Proteină slabă pentru repararea mușchilor.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'),

('Beef Jerky (Nitrate-Free)', 'Jerky de Vită (Fără Nitrați)', 2, 'snack1', 1, 0, 0, 115, 20, 3, 2, '1 oz nitrate-free beef jerky', '30g jerky de vită fără nitrați', 'Enjoy as a portable protein snack.', 'Consumați ca gustare portabilă cu proteine.', 'Convenient protein source, no preparation needed.', 'Sursă convenabilă de proteine, fără pregătire.', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400');

-- ✅ VERIFICARE
SELECT 
  phase,
  meal_type,
  COUNT(*) as total,
  STRING_AGG(name_en, ', ') as recipes
FROM recipes
WHERE meal_type IN ('snack1', 'snack2')
GROUP BY phase, meal_type
ORDER BY phase, meal_type;

