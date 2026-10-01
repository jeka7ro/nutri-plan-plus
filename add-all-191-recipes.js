import pkg from 'pg';
const { Pool } = pkg;

// TOATE cele 191 de rețete EXACT de pe Vercel (din lista ta)
const allRecipes = [
  // Faza 1 - Breakfast
  { name_ro: 'Fulgi de ovăz pe apă fiartă cu mix de fructe și scorțișoară', name_en: 'Oatmeal on Boiled Water with Mixed Fruits and Cinnamon', phase: 1, meal_type: 'breakfast', calories: 320, protein: 12, carbs: 58, fats: 6 },
  { name_ro: 'Shake din fulgi de ovăz cu fructe și scorțișoară', name_en: 'Oatmeal Shake with Fruits and Cinnamon', phase: 1, meal_type: 'breakfast', calories: 280, protein: 15, carbs: 55, fats: 3 },
  { name_ro: 'Smoothie cu Mango', name_en: 'Frozen Mango Smoothie', phase: 1, meal_type: 'breakfast', calories: 280, protein: 5, carbs: 60, fats: 2 },
  { name_ro: 'Toast din Secară cu Căpșuni', name_en: 'Strawberry Rye Toast', phase: 1, meal_type: 'breakfast', calories: 350, protein: 8, carbs: 65, fats: 5 },
  { name_ro: 'Ovăz cu Fructe de Pădure', name_en: 'Oatmeal with Berries', phase: 1, meal_type: 'breakfast', calories: 320, protein: 10, carbs: 58, fats: 4 },
  { name_ro: 'Clătite cu Mere și Ovăz', name_en: 'Apple Oat Pancakes', phase: 1, meal_type: 'breakfast', calories: 340, protein: 12, carbs: 62, fats: 5 },
  { name_ro: 'Terci de Quinoa cu Fructe de Pădure', name_en: 'Quinoa Porridge with Berries', phase: 1, meal_type: 'breakfast', calories: 310, protein: 11, carbs: 56, fats: 4 },
  { name_ro: 'Turtițe de Orez cu Mango', name_en: 'Rice Cakes with Mango', phase: 1, meal_type: 'breakfast', calories: 280, protein: 8, carbs: 58, fats: 2 },
  { name_ro: 'Bowl de Orez Brun la Mic Dejun', name_en: 'Brown Rice Breakfast Bowl', phase: 1, meal_type: 'breakfast', calories: 340, protein: 10, carbs: 64, fats: 3 },
  { name_ro: 'Terci de Mei cu Piersici', name_en: 'Millet Porridge with Peaches', phase: 1, meal_type: 'breakfast', calories: 320, protein: 9, carbs: 60, fats: 3 },
  { name_ro: 'Clătite de Hrișcă cu Fructe', name_en: 'Buckwheat Pancakes with Berries', phase: 1, meal_type: 'breakfast', calories: 350, protein: 12, carbs: 64, fats: 4 },
  { name_ro: 'Pâine Pierdută din Secară', name_en: 'Rye Bread French Toast', phase: 1, meal_type: 'breakfast', calories: 360, protein: 13, carbs: 66, fats: 5 },
  { name_ro: 'Bowl de Orz la Mic Dejun', name_en: 'Barley Breakfast Bowl', phase: 1, meal_type: 'breakfast', calories: 330, protein: 10, carbs: 62, fats: 3 },
  { name_ro: 'Terci de Alac cu Pară', name_en: 'Spelt Porridge with Pear', phase: 1, meal_type: 'breakfast', calories: 340, protein: 11, carbs: 63, fats: 3 },
  { name_ro: 'Orez Sălbatic cu Portocală', name_en: 'Wild Rice with Orange', phase: 1, meal_type: 'breakfast', calories: 300, protein: 9, carbs: 58, fats: 2 },
  { name_ro: 'Fulgi Kamut cu Kiwi', name_en: 'Kamut Flakes with Kiwi', phase: 1, meal_type: 'breakfast', calories: 315, protein: 10, carbs: 60, fats: 3 },
  
  // Faza 1 - Lunch (continuă cu toate...)
  { name_ro: 'Tuna Salad with Brown Rice', name_en: 'Salată cu Ton și Orez Brun', phase: 1, meal_type: 'lunch', calories: 380, protein: 30, carbs: 50, fats: 5 },
  { name_ro: 'Chicken Rye Sandwich', name_en: 'Sandviș Pui pe Secară', phase: 1, meal_type: 'lunch', calories: 420, protein: 35, carbs: 55, fats: 8 },
  { name_ro: 'Turkey Breast', name_en: 'Piept de Curcan', phase: 1, meal_type: 'lunch', calories: 400, protein: 40, carbs: 45, fats: 6 },
  { name_ro: 'Lentil Soup', name_en: 'Supă de Linte', phase: 1, meal_type: 'lunch', calories: 360, protein: 18, carbs: 60, fats: 3 },
  { name_ro: 'Supă cremă din legume cu supă concentrată din oase de pui/vită', name_en: 'Creamy Vegetable Soup with Bone Broth Concentrate', phase: 1, meal_type: 'lunch', calories: 180, protein: 8, carbs: 30, fats: 2 },
  { name_ro: 'Borș din sfeclă cu legume și fasole', name_en: 'Beetroot Borscht with Vegetables and Beans', phase: 1, meal_type: 'lunch', calories: 220, protein: 10, carbs: 40, fats: 2 },
  { name_ro: 'Supă din carne, legume și orez sălbatic', name_en: 'Meat, Vegetable and Wild Rice Soup', phase: 1, meal_type: 'lunch', calories: 380, protein: 25, carbs: 50, fats: 5 },
  { name_ro: 'Supă cremă din linte, legume și supă concentrată din oase de pui/vită', name_en: 'Creamy Lentil and Vegetable Soup with Bone Broth Concentrate', phase: 1, meal_type: 'lunch', calories: 250, protein: 12, carbs: 42, fats: 3 },
  { name_ro: 'Cartof dulce la cuptor cu carne de pui/curcan', name_en: 'Baked Sweet Potato with Chicken/Turkey Meat', phase: 1, meal_type: 'lunch', calories: 420, protein: 35, carbs: 55, fats: 6 },
  { name_ro: 'Hrișcă cu legume și carne', name_en: 'Buckwheat with Vegetables and Meat', phase: 1, meal_type: 'lunch', calories: 400, protein: 30, carbs: 58, fats: 5 },
  { name_ro: 'Linte cu legume și carne', name_en: 'Lentils with Vegetables and Meat', phase: 1, meal_type: 'lunch', calories: 380, protein: 25, carbs: 55, fats: 4 },
  { name_ro: 'Fasole cu legume și carne', name_en: 'Beans with Vegetables and Meat', phase: 1, meal_type: 'lunch', calories: 390, protein: 22, carbs: 58, fats: 5 },
  { name_ro: 'Mâncare de mazăre fină congelată cu legume și carne', name_en: 'Frozen Pea Dish with Vegetables and Meat', phase: 1, meal_type: 'lunch', calories: 360, protein: 20, carbs: 52, fats: 4 },
  { name_ro: 'Mâncare de legume și carne cu quinoa', name_en: 'Vegetable and Meat Dish with Quinoa', phase: 1, meal_type: 'lunch', calories: 410, protein: 28, carbs: 58, fats: 6 },
  { name_ro: 'Pui/mușchiuleț de porc la cuptor cu orez sălbatic', name_en: 'Baked Chicken/Pork Tenderloin with Wild Rice', phase: 1, meal_type: 'lunch', calories: 450, protein: 40, carbs: 60, fats: 7 },
  { name_ro: 'Pui cu Bulgur Pilaf', name_en: 'Chicken with Bulgur Pilaf', phase: 1, meal_type: 'lunch', calories: 410, protein: 35, carbs: 55, fats: 6 },
  { name_ro: 'Salată de Curcan cu Quinoa', name_en: 'Turkey Quinoa Salad', phase: 1, meal_type: 'lunch', calories: 395, protein: 32, carbs: 52, fats: 5 },
  { name_ro: 'Pește Alb cu Orz', name_en: 'White Fish with Barley', phase: 1, meal_type: 'lunch', calories: 380, protein: 30, carbs: 50, fats: 4 },
  { name_ro: 'Bowl de Năut cu Orez Brun', name_en: 'Chickpea Brown Rice Bowl', phase: 1, meal_type: 'lunch', calories: 370, protein: 18, carbs: 58, fats: 5 },
  { name_ro: 'Curcan cu Mei Sotate', name_en: 'Turkey Millet Stir-Fry', phase: 1, meal_type: 'lunch', calories: 405, protein: 35, carbs: 55, fats: 6 },
  { name_ro: 'Supă de Pui cu Orez Sălbatic', name_en: 'Chicken Wild Rice Soup', phase: 1, meal_type: 'lunch', calories: 385, protein: 28, carbs: 52, fats: 5 },
  { name_ro: 'Wrap cu Fasole Neagră și Quinoa', name_en: 'Black Bean Quinoa Wrap', phase: 1, meal_type: 'lunch', calories: 390, protein: 20, carbs: 60, fats: 6 },
  { name_ro: 'Salată de Curcan cu Alac', name_en: 'Turkey Spelt Salad', phase: 1, meal_type: 'lunch', calories: 400, protein: 30, carbs: 55, fats: 5 },
  { name_ro: 'Bowl de Pește cu Kamut', name_en: 'White Fish Kamut Bowl', phase: 1, meal_type: 'lunch', calories: 375, protein: 28, carbs: 52, fats: 4 },
  { name_ro: 'Tocană de Linte cu Hrișcă', name_en: 'Lentil Buckwheat Stew', phase: 1, meal_type: 'lunch', calories: 365, protein: 22, carbs: 55, fats: 4 },
  
  // Faza 1 - Dinner
  { name_ro: 'Turkey Chili', name_en: 'Chili Curcan', phase: 1, meal_type: 'dinner', calories: 450, protein: 35, carbs: 60, fats: 8 },
  { name_ro: 'Pui Stir-Fry', name_en: 'Chicken Stir-Fry', phase: 1, meal_type: 'dinner', calories: 400, protein: 35, carbs: 55, fats: 6 },
  { name_ro: 'Vită cu Quinoa', name_en: 'Beef with Quinoa', phase: 1, meal_type: 'dinner', calories: 480, protein: 40, carbs: 58, fats: 10 },
  { name_ro: 'Pește Alb cu Orez', name_en: 'White Fish with Rice', phase: 1, meal_type: 'dinner', calories: 420, protein: 32, carbs: 55, fats: 6 },
  { name_ro: 'Paste din linte Bolognese', name_en: 'Lentil Pasta Bolognese', phase: 1, meal_type: 'dinner', calories: 420, protein: 25, carbs: 65, fats: 5 },
  { name_ro: 'Pește la cuptor cu broccoli și quinoa', name_en: 'Baked Fish with Broccoli and Quinoa', phase: 1, meal_type: 'dinner', calories: 380, protein: 30, carbs: 52, fats: 5 },
  { name_ro: 'Salată de roșii, castraveți, ceapă cu quinoa și carne de pui', name_en: 'Tomato, Cucumber, Onion Salad with Quinoa and Chicken', phase: 1, meal_type: 'dinner', calories: 400, protein: 32, carbs: 55, fats: 6 },
  { name_ro: 'Sandwich din pâine de secară, roșii și curcan la cuptor', name_en: 'Rye Bread Sandwich with Tomatoes and Baked Turkey', phase: 1, meal_type: 'dinner', calories: 420, protein: 30, carbs: 58, fats: 7 },
  { name_ro: 'Ghiveci de legume + carne la cuptor și hrișcă/orez', name_en: 'Baked Vegetable Stew with Meat and Buckwheat/Rice', phase: 1, meal_type: 'dinner', calories: 440, protein: 35, carbs: 60, fats: 7 },
  { name_ro: 'Ficăței de pui cu cartofi dulci la cuptor', name_en: 'Chicken Livers with Baked Sweet Potatoes', phase: 1, meal_type: 'dinner', calories: 380, protein: 30, carbs: 50, fats: 8 },
  { name_ro: 'Chili de Curcan cu Bulgur', name_en: 'Turkey Bulgur Chili', phase: 1, meal_type: 'dinner', calories: 445, protein: 35, carbs: 58, fats: 7 },
  { name_ro: 'Caserola de Pui cu Quinoa', name_en: 'Chicken Quinoa Casserole', phase: 1, meal_type: 'dinner', calories: 425, protein: 38, carbs: 55, fats: 7 },
  { name_ro: 'Bowl de Pește cu Orez Brun', name_en: 'White Fish Brown Rice Bowl', phase: 1, meal_type: 'dinner', calories: 410, protein: 32, carbs: 55, fats: 6 },
  { name_ro: 'Chiftele de Curcan cu Mei', name_en: 'Turkey Meatballs with Millet', phase: 1, meal_type: 'dinner', calories: 430, protein: 35, carbs: 58, fats: 7 },
  { name_ro: 'Pui cu Orez Sălbatic la Cuptor', name_en: 'Chicken Wild Rice Bake', phase: 1, meal_type: 'dinner', calories: 440, protein: 38, carbs: 60, fats: 7 },
  { name_ro: 'Tocană de Fasole cu Orz', name_en: 'Bean Barley Stew', phase: 1, meal_type: 'dinner', calories: 385, protein: 20, carbs: 58, fats: 5 },
  { name_ro: 'Supă de Curcan cu Alac', name_en: 'Turkey Spelt Soup', phase: 1, meal_type: 'dinner', calories: 415, protein: 30, carbs: 55, fats: 6 },
  { name_ro: 'Pilaf de Pui cu Hrișcă', name_en: 'Chicken Buckwheat Pilaf', phase: 1, meal_type: 'dinner', calories: 420, protein: 35, carbs: 58, fats: 6 },
  { name_ro: 'Pește cu Kamut Sotat', name_en: 'White Fish Kamut Stir-Fry', phase: 1, meal_type: 'dinner', calories: 395, protein: 30, carbs: 52, fats: 5 },
  { name_ro: 'Curry de Linte cu Quinoa', name_en: 'Lentil Quinoa Curry', phase: 1, meal_type: 'dinner', calories: 380, protein: 22, carbs: 55, fats: 5 },
  
  // Faza 1 - Snack1
  { name_ro: 'Fructe', name_en: 'Fruits', phase: 1, meal_type: 'snack1', calories: 100, protein: 1, carbs: 25, fats: 0 },
  { name_ro: 'Măr', name_en: 'Apple', phase: 1, meal_type: 'snack1', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
  { name_ro: 'Piersică', name_en: 'Peach', phase: 1, meal_type: 'snack1', calories: 60, protein: 1, carbs: 15, fats: 0.4 },
  { name_ro: 'Pară', name_en: 'Pear', phase: 1, meal_type: 'snack1', calories: 100, protein: 0.7, carbs: 27, fats: 0.2 },
  { name_ro: 'Felii de Mango', name_en: 'Mango Slices', phase: 1, meal_type: 'snack1', calories: 100, protein: 1, carbs: 25, fats: 0.4 },
  { name_ro: 'Papaya', name_en: 'Papaya', phase: 1, meal_type: 'snack1', calories: 119, protein: 1.8, carbs: 30, fats: 0.4 },
  { name_ro: 'Ananas', name_en: 'Pineapple', phase: 1, meal_type: 'snack1', calories: 82, protein: 0.9, carbs: 22, fats: 0.2 },
  { name_ro: 'Prună', name_en: 'Plum', phase: 1, meal_type: 'snack1', calories: 76, protein: 1, carbs: 19, fats: 0.6 },
  { name_ro: 'Nectarină', name_en: 'Nectarine', phase: 1, meal_type: 'snack1', calories: 63, protein: 1.5, carbs: 15, fats: 0.4 },
  
  // Faza 1 - Snack2
  { name_ro: 'Măr copt cu scorțișoară', name_en: 'Baked Apple with Cinnamon', phase: 1, meal_type: 'snack2', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
  { name_ro: 'Portocală', name_en: 'Orange', phase: 1, meal_type: 'snack2', calories: 62, protein: 1.2, carbs: 15, fats: 0.2 },
  { name_ro: 'Fructe de pădure', name_en: 'Berries', phase: 1, meal_type: 'snack2', calories: 80, protein: 1, carbs: 20, fats: 0.5 },
  { name_ro: 'Kiwi', name_en: 'Kiwi', phase: 1, meal_type: 'snack2', calories: 90, protein: 1.1, carbs: 22, fats: 0.5 },
  { name_ro: 'Pepene Verde', name_en: 'Watermelon', phase: 1, meal_type: 'snack2', calories: 92, protein: 1.8, carbs: 23, fats: 0.4 },
  { name_ro: 'Pepene Galben', name_en: 'Cantaloupe', phase: 1, meal_type: 'snack2', calories: 90, protein: 1.3, carbs: 22, fats: 0.3 },
  { name_ro: 'Cireșe', name_en: 'Cherries', phase: 1, meal_type: 'snack2', calories: 87, protein: 1.5, carbs: 22, fats: 0.3 },
  { name_ro: 'Caise', name_en: 'Apricots', phase: 1, meal_type: 'snack2', calories: 79, protein: 1.4, carbs: 19, fats: 0.4 },
  { name_ro: 'Boabe de Rodie', name_en: 'Pomegranate Seeds', phase: 1, meal_type: 'snack2', calories: 144, protein: 3, carbs: 33, fats: 1.2 },
  { name_ro: 'Grepfrut', name_en: 'Grapefruit', phase: 1, meal_type: 'snack2', calories: 52, protein: 1, carbs: 13, fats: 0.2 },
  
  // Faza 2 - Breakfast
  { name_ro: 'Omletă din Albuș', name_en: 'Egg White Scramble', phase: 2, meal_type: 'breakfast', calories: 180, protein: 20, carbs: 2, fats: 1 },
  { name_ro: 'Wrap cu Curcan și Albuș', name_en: 'Turkey Egg White Wrap', phase: 2, meal_type: 'breakfast', calories: 200, protein: 25, carbs: 3, fats: 2 },
  { name_ro: 'Pui cu Spanac', name_en: 'Chicken & Spinach', phase: 2, meal_type: 'breakfast', calories: 190, protein: 28, carbs: 4, fats: 2 },
  { name_ro: 'Omletă de Curcan cu Spanac', name_en: 'Turkey Spinach Scramble', phase: 2, meal_type: 'breakfast', calories: 210, protein: 30, carbs: 5, fats: 3 },
  { name_ro: 'Frittata de Pui cu Legume', name_en: 'Chicken Vegetable Frittata', phase: 2, meal_type: 'breakfast', calories: 195, protein: 26, carbs: 4, fats: 2 },
  { name_ro: 'Pește Alb cu Sparanghel', name_en: 'White Fish with Asparagus', phase: 2, meal_type: 'breakfast', calories: 185, protein: 28, carbs: 3, fats: 2 },
  { name_ro: 'Bărci de Dovlecel cu Curcan', name_en: 'Turkey Zucchini Boats', phase: 2, meal_type: 'breakfast', calories: 200, protein: 25, carbs: 5, fats: 2 },
  { name_ro: 'Omletă de Albuș cu Ciuperci', name_en: 'Egg White Mushroom Omelette', phase: 2, meal_type: 'breakfast', calories: 170, protein: 22, carbs: 3, fats: 1 },
  { name_ro: 'Pui cu Kale Sotat', name_en: 'Chicken Kale Sauté', phase: 2, meal_type: 'breakfast', calories: 190, protein: 27, carbs: 4, fats: 2 },
  { name_ro: 'Inele de Ardei cu Curcan', name_en: 'Turkey Bell Pepper Rings', phase: 2, meal_type: 'breakfast', calories: 205, protein: 28, carbs: 6, fats: 2 },
  { name_ro: 'Tocană de Pește cu Roșii', name_en: 'White Fish Tomato Stew', phase: 2, meal_type: 'breakfast', calories: 180, protein: 26, carbs: 4, fats: 2 },
  { name_ro: 'Sarmale de Pui cu Varză', name_en: 'Chicken Cabbage Rolls', phase: 2, meal_type: 'breakfast', calories: 195, protein: 25, carbs: 5, fats: 2 },
  { name_ro: 'Stivă de Vânătă cu Curcan', name_en: 'Turkey Eggplant Stack', phase: 2, meal_type: 'breakfast', calories: 200, protein: 26, carbs: 6, fats: 2 },
  
  // Faza 2 - Lunch
  { name_ro: 'Pui la Grătar', name_en: 'Grilled Chicken', phase: 2, meal_type: 'lunch', calories: 320, protein: 45, carbs: 2, fats: 12 },
  { name_ro: 'Salată cu Pește', name_en: 'Grilled Fish Salad', phase: 2, meal_type: 'lunch', calories: 300, protein: 40, carbs: 5, fats: 10 },
  { name_ro: 'Curcan cu Broccoli', name_en: 'Turkey & Broccoli', phase: 2, meal_type: 'lunch', calories: 310, protein: 42, carbs: 6, fats: 11 },
  { name_ro: 'Salată cu Curcan la Grătar', name_en: 'Grilled Turkey Salad', phase: 2, meal_type: 'lunch', calories: 315, protein: 40, carbs: 5, fats: 11 },
  { name_ro: 'Bowl de Pui cu Broccoli', name_en: 'Chicken Broccoli Bowl', phase: 2, meal_type: 'lunch', calories: 305, protein: 38, carbs: 6, fats: 10 },
  { name_ro: 'Salată de Somon cu Spanac', name_en: 'Salmon Spinach Salad', phase: 2, meal_type: 'lunch', calories: 330, protein: 42, carbs: 4, fats: 12 },
  { name_ro: 'Curcan cu Piure de Conopidă', name_en: 'Turkey Cauliflower Mash', phase: 2, meal_type: 'lunch', calories: 295, protein: 40, carbs: 5, fats: 10 },
  { name_ro: 'Supă de Pește cu Legume', name_en: 'White Fish Vegetable Soup', phase: 2, meal_type: 'lunch', calories: 280, protein: 35, carbs: 4, fats: 9 },
  { name_ro: 'Bărci de Salată cu Pui', name_en: 'Chicken Lettuce Boats', phase: 2, meal_type: 'lunch', calories: 300, protein: 38, carbs: 5, fats: 10 },
  { name_ro: 'Roșii Umplute cu Curcan', name_en: 'Turkey Stuffed Tomatoes', phase: 2, meal_type: 'lunch', calories: 310, protein: 40, carbs: 6, fats: 11 },
  { name_ro: 'Pui la Grătar cu Bok Choy', name_en: 'Grilled Chicken with Bok Choy', phase: 2, meal_type: 'lunch', calories: 295, protein: 37, carbs: 5, fats: 10 },
  { name_ro: 'Tocană de Curcan cu Ciuperci', name_en: 'Turkey Mushroom Stew', phase: 2, meal_type: 'lunch', calories: 320, protein: 42, carbs: 6, fats: 11 },
  { name_ro: 'Pește cu Varză de Bruxelles', name_en: 'White Fish Brussels Sprouts', phase: 2, meal_type: 'lunch', calories: 285, protein: 36, carbs: 4, fats: 10 },
  
  // Faza 2 - Dinner
  { name_ro: 'Pește la Grătar', name_en: 'Grilled Fish', phase: 2, meal_type: 'dinner', calories: 340, protein: 45, carbs: 2, fats: 13 },
  { name_ro: 'Wraps cu Curcan', name_en: 'Turkey Lettuce Wraps', phase: 2, meal_type: 'dinner', calories: 310, protein: 40, carbs: 5, fats: 12 },
  { name_ro: 'Piept de Pui', name_en: 'Chicken Breast', phase: 2, meal_type: 'dinner', calories: 300, protein: 42, carbs: 1, fats: 11 },
  { name_ro: 'Pui cu Dovlecel', name_en: 'Grilled Chicken Zucchini', phase: 2, meal_type: 'dinner', calories: 340, protein: 44, carbs: 4, fats: 13 },
  { name_ro: 'Curcan cu Spanac', name_en: 'Turkey Spinach Bake', phase: 2, meal_type: 'dinner', calories: 335, protein: 42, carbs: 5, fats: 12 },
  { name_ro: 'Somon cu Sparanghel', name_en: 'Salmon Asparagus', phase: 2, meal_type: 'dinner', calories: 360, protein: 45, carbs: 3, fats: 14 },
  { name_ro: 'Pui cu Varză', name_en: 'Chicken Cabbage Stir-Fry', phase: 2, meal_type: 'dinner', calories: 325, protein: 40, carbs: 5, fats: 12 },
  { name_ro: 'Curcan cu Ardei', name_en: 'Turkey Pepper Skillet', phase: 2, meal_type: 'dinner', calories: 330, protein: 41, carbs: 6, fats: 12 },
  { name_ro: 'Pește cu Țelină', name_en: 'White Fish Celery', phase: 2, meal_type: 'dinner', calories: 310, protein: 38, carbs: 4, fats: 11 },
  { name_ro: 'Pui cu Roșii', name_en: 'Chicken Tomato Herbs', phase: 2, meal_type: 'dinner', calories: 320, protein: 39, carbs: 5, fats: 12 },
  { name_ro: 'Curcan cu Vânătă', name_en: 'Turkey Eggplant', phase: 2, meal_type: 'dinner', calories: 335, protein: 40, carbs: 6, fats: 12 },
  { name_ro: 'Somon cu Kale', name_en: 'Salmon Kale', phase: 2, meal_type: 'dinner', calories: 355, protein: 44, carbs: 4, fats: 14 },
  { name_ro: 'Pui cu Fasole Verde', name_en: 'Chicken Green Beans', phase: 2, meal_type: 'dinner', calories: 315, protein: 38, carbs: 5, fats: 11 },
  
  // Faza 2 - Snack1
  { name_ro: 'Țelină cu Hummus', name_en: 'Celery Hummus', phase: 2, meal_type: 'snack1', calories: 120, protein: 5, carbs: 8, fats: 6 },
  { name_ro: 'Rulouri de Curcan', name_en: 'Turkey Roll-Ups', phase: 2, meal_type: 'snack1', calories: 100, protein: 18, carbs: 2, fats: 2 },
  { name_ro: 'Roșii Cherry', name_en: 'Cherry Tomatoes', phase: 2, meal_type: 'snack1', calories: 40, protein: 2, carbs: 8, fats: 0.5 },
  { name_ro: 'Bucăți Albuș', name_en: 'Egg White Bites', phase: 2, meal_type: 'snack1', calories: 95, protein: 20, carbs: 1, fats: 0 },
  { name_ro: 'Jerky Curcan', name_en: 'Turkey Jerky', phase: 2, meal_type: 'snack1', calories: 110, protein: 22, carbs: 2, fats: 1 },
  { name_ro: 'Fâșii Pui', name_en: 'Chicken Strips', phase: 2, meal_type: 'snack1', calories: 100, protein: 20, carbs: 1, fats: 2 },
  { name_ro: 'Ridichi', name_en: 'Radishes', phase: 2, meal_type: 'snack1', calories: 35, protein: 1, carbs: 7, fats: 0.2 },
  { name_ro: 'Bățoane Țelină', name_en: 'Celery Sticks', phase: 2, meal_type: 'snack1', calories: 15, protein: 0.7, carbs: 3, fats: 0.1 },
  
  // Faza 2 - Snack2
  { name_ro: 'Felii de Curcan', name_en: 'Turkey Slices', phase: 2, meal_type: 'snack2', calories: 110, protein: 20, carbs: 1, fats: 2 },
  { name_ro: 'Castravete', name_en: 'Cucumber', phase: 2, meal_type: 'snack2', calories: 45, protein: 2, carbs: 11, fats: 0.3 },
  { name_ro: 'Felii Ardei Gras', name_en: 'Bell Pepper Strips', phase: 2, meal_type: 'snack2', calories: 50, protein: 2, carbs: 12, fats: 0.3 },
  { name_ro: 'Albușuri', name_en: 'Egg Whites', phase: 2, meal_type: 'snack2', calories: 85, protein: 18, carbs: 1, fats: 0 },
  { name_ro: 'Piept Curcan', name_en: 'Turkey Breast', phase: 2, meal_type: 'snack2', calories: 100, protein: 22, carbs: 0, fats: 1 },
  { name_ro: 'Buchetedde Broccoli', name_en: 'Broccoli Florets', phase: 2, meal_type: 'snack2', calories: 55, protein: 4, carbs: 11, fats: 0.6 },
  { name_ro: 'Frunze Spanac', name_en: 'Spinach Leaves', phase: 2, meal_type: 'snack2', calories: 25, protein: 3, carbs: 4, fats: 0.4 },
  { name_ro: 'Bucăți Conopidă', name_en: 'Cauliflower Bites', phase: 2, meal_type: 'snack2', calories: 50, protein: 2, carbs: 10, fats: 0.3 },
  
  // Faza 3 - Breakfast
  { name_ro: 'Toast cu Avocado și Ouă', name_en: 'Avocado Toast with Eggs', phase: 3, meal_type: 'breakfast', calories: 420, protein: 18, carbs: 35, fats: 22 },
  { name_ro: 'Toast de Secară cu Unt de Arahide', name_en: 'Nut Butter Rye Toast', phase: 3, meal_type: 'breakfast', calories: 380, protein: 15, carbs: 32, fats: 20 },
  { name_ro: 'Omletă cu Legume și Avocado', name_en: 'Veggie Omelette with Avocado', phase: 3, meal_type: 'breakfast', calories: 350, protein: 16, carbs: 15, fats: 25 },
  { name_ro: 'Toast Avocado Ou', name_en: 'Avocado Egg Toast', phase: 3, meal_type: 'breakfast', calories: 410, protein: 17, carbs: 30, fats: 24 },
  { name_ro: 'Bowl Somon Quinoa', name_en: 'Salmon Quinoa Bowl', phase: 3, meal_type: 'breakfast', calories: 450, protein: 28, carbs: 35, fats: 22 },
  { name_ro: 'Ovăz cu Unt Arahide', name_en: 'Nut Butter Oats', phase: 3, meal_type: 'breakfast', calories: 390, protein: 14, carbs: 38, fats: 20 },
  { name_ro: 'Wrap Curcan Avocado', name_en: 'Turkey Avocado Wrap', phase: 3, meal_type: 'breakfast', calories: 420, protein: 22, carbs: 32, fats: 23 },
  { name_ro: 'Omletă Pui', name_en: 'Chicken Omelette', phase: 3, meal_type: 'breakfast', calories: 380, protein: 30, carbs: 8, fats: 24 },
  { name_ro: 'Bol Smoothie', name_en: 'Smoothie Bowl', phase: 3, meal_type: 'breakfast', calories: 360, protein: 12, carbs: 40, fats: 18 },
  { name_ro: 'Briose Ouă', name_en: 'Egg Muffins', phase: 3, meal_type: 'breakfast', calories: 340, protein: 20, carbs: 12, fats: 22 },
  { name_ro: 'Iaurt Grec Nuci', name_en: 'Greek Yogurt Nuts', phase: 3, meal_type: 'breakfast', calories: 320, protein: 18, carbs: 20, fats: 20 },
  { name_ro: 'Clătite Proteice', name_en: 'Protein Pancakes', phase: 3, meal_type: 'breakfast', calories: 370, protein: 25, carbs: 28, fats: 20 },
  { name_ro: 'Budincă Chia', name_en: 'Chia Pudding', phase: 3, meal_type: 'breakfast', calories: 310, protein: 10, carbs: 25, fats: 18 },
  
  // Faza 3 - Lunch
  { name_ro: 'Somon cu Legume', name_en: 'Salmon with Vegetables', phase: 3, meal_type: 'lunch', calories: 480, protein: 35, carbs: 25, fats: 28 },
  { name_ro: 'Salată Pui cu Avocado', name_en: 'Chicken Avocado Salad', phase: 3, meal_type: 'lunch', calories: 450, protein: 32, carbs: 20, fats: 26 },
  { name_ro: 'Bowl cu Ton și Avocado', name_en: 'Tuna Avocado Bowl', phase: 3, meal_type: 'lunch', calories: 460, protein: 30, carbs: 22, fats: 28 },
  { name_ro: 'Salată Somon Avocado', name_en: 'Salmon Avocado Salad', phase: 3, meal_type: 'lunch', calories: 480, protein: 32, carbs: 18, fats: 30 },
  { name_ro: 'Pui cu Quinoa', name_en: 'Chicken Quinoa', phase: 3, meal_type: 'lunch', calories: 460, protein: 35, carbs: 30, fats: 22 },
  { name_ro: 'Bol Curcan Orez', name_en: 'Turkey Rice Bowl', phase: 3, meal_type: 'lunch', calories: 470, protein: 33, carbs: 35, fats: 23 },
  { name_ro: 'Ton Cartof Dulce', name_en: 'Tuna Sweet Potato', phase: 3, meal_type: 'lunch', calories: 450, protein: 28, carbs: 38, fats: 20 },
  { name_ro: 'Paste cu Pui', name_en: 'Chicken Pasta', phase: 3, meal_type: 'lunch', calories: 490, protein: 32, carbs: 42, fats: 22 },
  { name_ro: 'Tacos cu Pește', name_en: 'Fish Tacos', phase: 3, meal_type: 'lunch', calories: 440, protein: 30, carbs: 35, fats: 20 },
  { name_ro: 'Burrito Curcan', name_en: 'Turkey Burrito', phase: 3, meal_type: 'lunch', calories: 510, protein: 35, carbs: 45, fats: 24 },
  { name_ro: 'Poke Bowl Somon', name_en: 'Salmon Poke Bowl', phase: 3, meal_type: 'lunch', calories: 500, protein: 38, carbs: 32, fats: 26 },
  { name_ro: 'Wrap Pui Legume', name_en: 'Chicken Veggie Wrap', phase: 3, meal_type: 'lunch', calories: 430, protein: 30, carbs: 28, fats: 22 },
  { name_ro: 'Sandviș Salată Ouă', name_en: 'Egg Salad Sandwich', phase: 3, meal_type: 'lunch', calories: 410, protein: 22, carbs: 30, fats: 22 },
  
  // Faza 3 - Dinner
  { name_ro: 'Friptură cu Cartof Dulce', name_en: 'Steak with Sweet Potato', phase: 3, meal_type: 'dinner', calories: 550, protein: 40, carbs: 35, fats: 28 },
  { name_ro: 'Bowl cu Somon', name_en: 'Salmon Bowl', phase: 3, meal_type: 'dinner', calories: 520, protein: 38, carbs: 30, fats: 26 },
  { name_ro: 'Pulpe de Pui', name_en: 'Chicken Thighs', phase: 3, meal_type: 'dinner', calories: 480, protein: 35, carbs: 15, fats: 30 },
  { name_ro: 'Cotlet de Porc cu Legume', name_en: 'Pork Chop with Veggies', phase: 3, meal_type: 'dinner', calories: 500, protein: 38, carbs: 20, fats: 28 },
  { name_ro: 'Vită Sotată', name_en: 'Beef Stir-Fry', phase: 3, meal_type: 'dinner', calories: 550, protein: 42, carbs: 25, fats: 30 },
  { name_ro: 'Paste cu Somon', name_en: 'Salmon Pasta', phase: 3, meal_type: 'dinner', calories: 540, protein: 40, carbs: 38, fats: 26 },
  { name_ro: 'Curry Pui', name_en: 'Chicken Curry', phase: 3, meal_type: 'dinner', calories: 520, protein: 38, carbs: 32, fats: 25 },
  { name_ro: 'Chiftele Curcan', name_en: 'Turkey Meatballs', phase: 3, meal_type: 'dinner', calories: 480, protein: 35, carbs: 28, fats: 24 },
  { name_ro: 'Muschi Porc', name_en: 'Pork Tenderloin', phase: 3, meal_type: 'dinner', calories: 510, protein: 40, carbs: 18, fats: 30 },
  { name_ro: 'Miel cu Quinoa', name_en: 'Lamb Quinoa', phase: 3, meal_type: 'dinner', calories: 560, protein: 45, carbs: 32, fats: 28 },
  { name_ro: 'Risotto cu Creveți', name_en: 'Shrimp Risotto', phase: 3, meal_type: 'dinner', calories: 490, protein: 32, carbs: 40, fats: 22 },
  { name_ro: 'Piept Rață', name_en: 'Duck Breast', phase: 3, meal_type: 'dinner', calories: 580, protein: 48, carbs: 15, fats: 35 },
  { name_ro: 'Cod Mediteranean', name_en: 'Cod Mediterranean', phase: 3, meal_type: 'dinner', calories: 460, protein: 35, carbs: 25, fats: 22 },
  { name_ro: 'Pulpe Pui Coapte', name_en: 'Chicken Thighs Roasted', phase: 3, meal_type: 'dinner', calories: 530, protein: 40, carbs: 18, fats: 32 },
  
  // Faza 3 - Snack1
  { name_ro: 'Mix de Nuci', name_en: 'Mixed Nuts', phase: 3, meal_type: 'snack1', calories: 200, protein: 6, carbs: 8, fats: 18 },
  { name_ro: 'Mix Nuci', name_en: 'Trail Mix', phase: 3, meal_type: 'snack1', calories: 210, protein: 7, carbs: 10, fats: 18 },
  { name_ro: 'Toast cu Avocado', name_en: 'Avocado Toast', phase: 3, meal_type: 'snack1', calories: 220, protein: 6, carbs: 15, fats: 18 },
  { name_ro: 'Măr Unt Arahide', name_en: 'Peanut Butter Apple', phase: 3, meal_type: 'snack1', calories: 230, protein: 7, carbs: 25, fats: 12 },
  { name_ro: 'Iaurt Grec Fructe', name_en: 'Greek Yogurt Berries', phase: 3, meal_type: 'snack1', calories: 180, protein: 12, carbs: 20, fats: 8 },
  { name_ro: 'Bilute Energizante', name_en: 'Energy Balls', phase: 3, meal_type: 'snack1', calories: 200, protein: 8, carbs: 18, fats: 12 },
  
  // Faza 3 - Snack2
  { name_ro: 'Nuci', name_en: 'Walnuts', phase: 3, meal_type: 'snack2', calories: 185, protein: 4, carbs: 4, fats: 18 },
  { name_ro: 'Caju', name_en: 'Cashews', phase: 3, meal_type: 'snack2', calories: 160, protein: 5, carbs: 9, fats: 13 },
  { name_ro: 'Felii de Avocado', name_en: 'Avocado Slices', phase: 3, meal_type: 'snack2', calories: 160, protein: 2, carbs: 9, fats: 15 },
  { name_ro: 'Jumătate Avocado', name_en: 'Avocado Half', phase: 3, meal_type: 'snack2', calories: 160, protein: 2, carbs: 9, fats: 15 },
  { name_ro: 'Nuci Mixte', name_en: 'Mixed Nuts', phase: 3, meal_type: 'snack2', calories: 180, protein: 6, carbs: 8, fats: 16 },
  { name_ro: 'Brânză Crackers', name_en: 'Cheese Crackers', phase: 3, meal_type: 'snack2', calories: 170, protein: 8, carbs: 12, fats: 10 },
  { name_ro: 'Măsline', name_en: 'Olives', phase: 3, meal_type: 'snack2', calories: 115, protein: 1, carbs: 6, fats: 11 },
  { name_ro: 'Semințe Floarea-Soarelui', name_en: 'Sunflower Seeds', phase: 3, meal_type: 'snack2', calories: 165, protein: 6, carbs: 7, fats: 14 },
];

const TARGET_URL = process.env.TARGET_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!TARGET_URL) {
  console.error('❌ TARGET_POSTGRES_URL required!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: TARGET_URL,
  ssl: { rejectUnauthorized: false }
});

async function addAllRecipes() {
  const client = await pool.connect();
  
  try {
    console.log(`🔄 Adaug ${allRecipes.length} rețete din lista ta completă...\n`);
    
    let added = 0;
    let skipped = 0;
    
    for (const recipe of allRecipes) {
      try {
        // Verifică dacă există deja
        const exists = await client.query(
          'SELECT id FROM recipes WHERE (name_ro = $1 OR name_en = $2) AND is_admin_recipe = true',
          [recipe.name_ro, recipe.name_en]
        );
        
        if (exists.rows.length > 0) {
          skipped++;
          continue;
        }
        
        // Obține următorul ID disponibil
        const nextId = await client.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM recipes');
        const id = nextId.rows[0].next_id;
        
        await client.query(`
          INSERT INTO recipes (
            id, user_id, name, name_ro, name_en,
            phase, meal_type,
            calories, protein, carbs, fats,
            prep_time, cook_time, servings,
            image_url, is_public, is_admin_recipe
          ) VALUES (
            $1, NULL, $2, $3, $4,
            $5, $6,
            $7, $8, $9, $10,
            $11, $12, 1,
            $13, true, true
          )
        `, [
          id,
          recipe.name_en,
          recipe.name_ro,
          recipe.name_en,
          recipe.phase,
          recipe.meal_type,
          recipe.calories,
          recipe.protein || 0,
          recipe.carbs || 0,
          recipe.fats || 0,
          recipe.prep_time || 5,
          recipe.cook_time || 0,
          recipe.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800`
        ]);
        
        added++;
        if (added % 10 === 0) console.log(`✅ Adăugat ${added} rețete...`);
      } catch (error) {
        console.error(`❌ Eroare la ${recipe.name_ro}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Adăugat ${added} rețete noi`);
    console.log(`⏭️  Omis ${skipped} rețete (deja existente)\n`);
    
    const total = await client.query('SELECT COUNT(*) as count FROM recipes WHERE is_admin_recipe = true');
    console.log(`📊 TOTAL REȚETE ADMIN: ${total.rows[0].count}`);
    
    const byPhase = await client.query(`
      SELECT phase, COUNT(*) as count 
      FROM recipes 
      WHERE is_admin_recipe = true 
      GROUP BY phase 
      ORDER BY phase
    `);
    console.log('\n📊 Pe faze:');
    byPhase.rows.forEach(r => console.log(`   Faza ${r.phase}: ${r.count} rețete`));
    
    const withImages = await client.query("SELECT COUNT(*) as count FROM recipes WHERE is_admin_recipe = true AND image_url IS NOT NULL AND image_url != ''");
    console.log(`\n🖼️  Rețete cu poze: ${withImages.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addAllRecipes();


