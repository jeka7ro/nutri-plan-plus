-- Corectează meal_type pentru rețetele care sunt GREȘIT marcate ca snack1/snack2
-- Regulă: 
--   snack1/snack2 < 200 cal = OK
--   snack1/snack2 > 200 cal = mutăm la lunch sau dinner

-- PHASE 1 snack1 - MUTĂM mesele principale la lunch/dinner
UPDATE recipes SET meal_type = 'lunch' 
WHERE name_ro IN (
  'PUL ITALIAN CU OREZ SALBATIC',
  'CURCAN INVELIT IN LIPIE DE GRAU GERMINAT'
) AND phase = 1;

-- PHASE 2 snack1 - MUTĂM mesele principale (>200 cal) la lunch/dinner
UPDATE recipes SET meal_type = 'lunch'
WHERE meal_type = 'snack1' 
  AND phase = 2 
  AND calories > 200;

-- PHASE 3 snack1 - MUTĂM mesele principale (>250 cal) la lunch/dinner  
UPDATE recipes SET meal_type = 'lunch'
WHERE meal_type = 'snack1' 
  AND phase = 3 
  AND calories > 300;

-- Verificare finală
SELECT 
  phase,
  meal_type,
  COUNT(*) as total,
  MIN(calories) as min_cal,
  MAX(calories) as max_cal,
  ROUND(AVG(calories)) as avg_cal
FROM recipes
WHERE meal_type IN ('snack1', 'snack2')
GROUP BY phase, meal_type
ORDER BY phase, meal_type;

-- Afișează snack-urile rămase
SELECT phase, meal_type, name_ro, calories
FROM recipes  
WHERE meal_type IN ('snack1', 'snack2')
ORDER BY phase, meal_type, calories;

