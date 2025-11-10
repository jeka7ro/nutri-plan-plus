// HARDCODED RECIPES - funcționează IMEDIAT fără bază de date!
// Minim 3 opțiuni pentru fiecare meal_type x phase
const recipes = [
  // =============== PHASE 1 ===============
  // BREAKFAST (4 opțiuni)
  { id: 1, name: "Frozen Mango Smoothie", name_ro: "Smoothie cu Mango", phase: 1, meal_type: "breakfast", calories: 280, protein: 25, carbs: 45, fat: 1, ingredients_en: ["2 cups mango", "1 cup almond milk", "protein powder"], ingredients_ro: ["2 căni mango", "1 cană lapte migdale", "proteină"], instructions_en: ["Blend all"], instructions_ro: ["Mixează tot"], image_url: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800", is_vegetarian: true, is_vegan: true },
  { id: 2, name: "Strawberry Rye Toast", name_ro: "Toast din Secară cu Căpșuni", phase: 1, meal_type: "breakfast", calories: 350, protein: 20, carbs: 55, fat: 2, ingredients_en: ["2 slices rye bread", "2 egg whites", "strawberries"], ingredients_ro: ["2 felii pâine de secară", "2 albușuri", "căpșuni"], instructions_en: ["Cook and top"], instructions_ro: ["Gătește și garnisește"], image_url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800", is_vegetarian: true },
  { id: 3, name: "Oatmeal with Berries", name_ro: "Ovăz cu Fructe de Pădure", phase: 1, meal_type: "breakfast", calories: 320, protein: 15, carbs: 58, fat: 3, ingredients_en: ["1 cup oats", "berries", "water"], ingredients_ro: ["1 cană ovăz", "fructe de pădure", "apă"], instructions_en: ["Cook oats with water", "Top with berries"], instructions_ro: ["Fierbe ovăz pe apă", "Adaugă fructe"], image_url: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800", is_vegetarian: true },
  { id: 4, name: "Apple Oat Pancakes", name_ro: "Clătite cu Mere și Ovăz", phase: 1, meal_type: "breakfast", calories: 340, protein: 18, carbs: 60, fat: 2, ingredients_en: ["1 apple", "2 eggs", "oats"], ingredients_ro: ["1 măr", "2 ouă", "ovăz"], instructions_en: ["Grate apple and cook"], instructions_ro: ["Rade mărul și gătește"], image_url: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800", is_vegetarian: true },
  
  // LUNCH (4 opțiuni)
  { id: 5, name: "Tuna Salad with Brown Rice", name_ro: "Salată cu Ton și Orez Brun", phase: 1, meal_type: "lunch", calories: 380, protein: 35, carbs: 40, fat: 5, ingredients_en: ["150g tuna", "1 cup brown rice", "spinach", "cucumber", "tomatoes"], ingredients_ro: ["150g ton", "1 cană orez brun", "spanac", "castravete", "roșii"], instructions_en: ["Cook brown rice", "Mix with tuna and vegetables"], instructions_ro: ["Fierbe orez brun", "Amestecă cu ton și legume"], image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", is_vegetarian: false },
  { id: 6, name: "Chicken Rye Sandwich", name_ro: "Sandviș Pui pe Secară", phase: 1, meal_type: "lunch", calories: 420, protein: 40, carbs: 48, fat: 4, ingredients_en: ["chicken", "rye bread", "lettuce"], ingredients_ro: ["pui", "pâine de secară", "salată"], instructions_en: ["Grill and assemble"], instructions_ro: ["Gătește și asamblează"], image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", is_vegetarian: false },
  { id: 7, name: "Turkey Breast", name_ro: "Piept de Curcan", phase: 1, meal_type: "lunch", calories: 400, protein: 42, carbs: 42, fat: 4, ingredients_en: ["180g turkey", "brown rice", "vegetables"], ingredients_ro: ["180g curcan", "orez brun", "legume"], instructions_en: ["Grill turkey"], instructions_ro: ["Gătește curcanul"], image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800", is_vegetarian: false },
  { id: 8, name: "Lentil Soup", name_ro: "Supă de Linte", phase: 1, meal_type: "lunch", calories: 360, protein: 20, carbs: 55, fat: 3, ingredients_en: ["lentils", "vegetables"], ingredients_ro: ["linte", "legume"], instructions_en: ["Boil"], instructions_ro: ["Fierbe"], image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800", is_vegetarian: true, is_vegan: true },
  
  // DINNER (4 opțiuni)
  { id: 9, name: "Turkey Chili", name_ro: "Chili Curcan", phase: 1, meal_type: "dinner", calories: 450, protein: 45, carbs: 50, fat: 6, ingredients_en: ["turkey", "beans", "tomatoes"], ingredients_ro: ["curcan", "fasole", "roșii"], instructions_en: ["Simmer 20min"], instructions_ro: ["Fierbe 20min"], image_url: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800", is_vegetarian: false },
  { id: 10, name: "Chicken Stir-Fry", name_ro: "Pui Stir-Fry", phase: 1, meal_type: "dinner", calories: 400, protein: 42, carbs: 45, fat: 5, ingredients_en: ["chicken", "vegetables", "rice"], ingredients_ro: ["pui", "legume", "orez"], instructions_en: ["Stir-fry"], instructions_ro: ["Sotează"], image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800", is_vegetarian: false },
  { id: 11, name: "Beef with Quinoa", name_ro: "Vită cu Quinoa", phase: 1, meal_type: "dinner", calories: 480, protein: 48, carbs: 52, fat: 6, ingredients_en: ["lean beef", "quinoa", "vegetables"], ingredients_ro: ["carne slabă", "quinoa", "legume"], instructions_en: ["Grill and combine"], instructions_ro: ["Gătește și combină"], image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", is_vegetarian: false },
  { id: 12, name: "White Fish with Rice", name_ro: "Pește Alb cu Orez", phase: 1, meal_type: "dinner", calories: 420, protein: 40, carbs: 50, fat: 4, ingredients_en: ["white fish", "brown rice"], ingredients_ro: ["pește alb", "orez brun"], instructions_en: ["Bake fish"], instructions_ro: ["Coace peștele"], image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800", is_vegetarian: false },
  
  // SNACK1 (3 opțiuni)
  { id: 13, name: "Apple", name_ro: "Măr", phase: 1, meal_type: "snack1", calories: 95, protein: 0, carbs: 25, fat: 0, ingredients_en: ["1 apple"], ingredients_ro: ["1 măr"], instructions_en: ["Eat fresh"], instructions_ro: ["Mănâncă proaspăt"], image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800", is_vegetarian: true, is_vegan: true },
  { id: 14, name: "Peach", name_ro: "Piersică", phase: 1, meal_type: "snack1", calories: 60, protein: 1, carbs: 15, fat: 0, ingredients_en: ["1 peach"], ingredients_ro: ["1 piersică"], instructions_en: ["Wash and eat"], instructions_ro: ["Spală și mănâncă"], image_url: "https://images.unsplash.com/photo-1629828874514-944dd0d9c48b?w=800", is_vegetarian: true, is_vegan: true },
  { id: 15, name: "Pear", name_ro: "Pară", phase: 1, meal_type: "snack1", calories: 100, protein: 1, carbs: 27, fat: 0, ingredients_en: ["1 pear"], ingredients_ro: ["1 pară"], instructions_en: ["Wash and eat"], instructions_ro: ["Spală și mănâncă"], image_url: "https://images.unsplash.com/photo-1585059895524-72359e9ab3f0?w=800", is_vegetarian: true, is_vegan: true },
  
  // SNACK2 (4 opțiuni)
  { id: 16, name: "Orange", name_ro: "Portocală", phase: 1, meal_type: "snack2", calories: 62, protein: 1, carbs: 15, fat: 0, ingredients_en: ["1 orange"], ingredients_ro: ["1 portocală"], instructions_en: ["Peel and eat"], instructions_ro: ["Curăță și mănâncă"], image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=800", is_vegetarian: true, is_vegan: true },
  { id: 17, name: "Berries", name_ro: "Fructe de pădure", phase: 1, meal_type: "snack2", calories: 80, protein: 1, carbs: 18, fat: 0, ingredients_en: ["1 cup berries"], ingredients_ro: ["1 cană fructe"], instructions_en: ["Wash and eat"], instructions_ro: ["Spală și mănâncă"], image_url: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800", is_vegetarian: true, is_vegan: true },
  { id: 18, name: "Kiwi", name_ro: "Kiwi", phase: 1, meal_type: "snack2", calories: 90, protein: 2, carbs: 22, fat: 0, ingredients_en: ["2 kiwis"], ingredients_ro: ["2 kiwi"], instructions_en: ["Peel and eat"], instructions_ro: ["Curăță și mănâncă"], image_url: "https://images.unsplash.com/photo-1585059895524-72359e9ab3f0?w=800", is_vegetarian: true, is_vegan: true },
  { id: 19, name: "Watermelon", name_ro: "Pepene Verde", phase: 1, meal_type: "snack2", calories: 92, protein: 2, carbs: 23, fat: 0, ingredients_en: ["2 cups watermelon"], ingredients_ro: ["2 căni pepene"], instructions_en: ["Cut and serve"], instructions_ro: ["Taie și servește"], image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784210?w=800", is_vegetarian: true, is_vegan: true },
  
  // =============== PHASE 2 ===============
  // BREAKFAST (3 opțiuni)
  { id: 20, name: "Egg White Scramble", name_ro: "Omletă din Albuș", phase: 2, meal_type: "breakfast", calories: 180, protein: 25, carbs: 10, fat: 3, ingredients_en: ["4 egg whites", "vegetables"], ingredients_ro: ["4 albușuri", "legume"], instructions_en: ["Cook"], instructions_ro: ["Gătește"], image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800", is_vegetarian: true },
  { id: 21, name: "Turkey Egg White Wrap", name_ro: "Wrap cu Curcan și Albuș", phase: 2, meal_type: "breakfast", calories: 200, protein: 28, carbs: 8, fat: 5, ingredients_en: ["turkey slices", "egg whites", "lettuce"], ingredients_ro: ["felii curcan", "albușuri", "salată"], instructions_en: ["Wrap and eat"], instructions_ro: ["Înfășoară și mănâncă"], image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800", is_vegetarian: false },
  { id: 22, name: "Chicken & Spinach", name_ro: "Pui cu Spanac", phase: 2, meal_type: "breakfast", calories: 190, protein: 30, carbs: 6, fat: 4, ingredients_en: ["chicken breast", "spinach"], ingredients_ro: ["piept pui", "spanac"], instructions_en: ["Cook"], instructions_ro: ["Gătește"], image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800", is_vegetarian: false },
  
  // LUNCH (3 opțiuni)
  { id: 23, name: "Grilled Chicken", name_ro: "Pui la Grătar", phase: 2, meal_type: "lunch", calories: 320, protein: 45, carbs: 8, fat: 12, ingredients_en: ["chicken", "asparagus"], ingredients_ro: ["pui", "sparanghel"], instructions_en: ["Grill"], instructions_ro: ["La grătar"], image_url: "https://images.unsplash.com/photo-1612057888294-9c11a7178022?w=800", is_vegetarian: false },
  { id: 24, name: "Grilled Fish Salad", name_ro: "Salată cu Pește", phase: 2, meal_type: "lunch", calories: 300, protein: 42, carbs: 6, fat: 12, ingredients_en: ["white fish", "leafy greens"], ingredients_ro: ["pește alb", "salată verde"], instructions_en: ["Grill fish"], instructions_ro: ["Gătește peștele"], image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", is_vegetarian: false },
  { id: 25, name: "Turkey & Broccoli", name_ro: "Curcan cu Broccoli", phase: 2, meal_type: "lunch", calories: 310, protein: 44, carbs: 10, fat: 10, ingredients_en: ["turkey", "broccoli"], ingredients_ro: ["curcan", "broccoli"], instructions_en: ["Steam and serve"], instructions_ro: ["Gătește la abur"], image_url: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=800", is_vegetarian: false },
  
  // DINNER (3 opțiuni)
  { id: 26, name: "Grilled Fish", name_ro: "Pește la Grătar", phase: 2, meal_type: "dinner", calories: 340, protein: 50, carbs: 5, fat: 14, ingredients_en: ["white fish", "lemon"], ingredients_ro: ["pește alb", "lămâie"], instructions_en: ["Season and grill"], instructions_ro: ["Condimentează și gătește"], image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800", is_vegetarian: false },
  { id: 27, name: "Turkey Lettuce Wraps", name_ro: "Wraps cu Curcan", phase: 2, meal_type: "dinner", calories: 310, protein: 44, carbs: 8, fat: 12, ingredients_en: ["ground turkey", "lettuce"], ingredients_ro: ["curcan tocat", "salată"], instructions_en: ["Cook and wrap"], instructions_ro: ["Gătește și înfășoară"], image_url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800", is_vegetarian: false },
  { id: 28, name: "Chicken Breast", name_ro: "Piept de Pui", phase: 2, meal_type: "dinner", calories: 300, protein: 48, carbs: 4, fat: 10, ingredients_en: ["chicken breast", "green beans"], ingredients_ro: ["piept pui", "fasole verde"], instructions_en: ["Bake"], instructions_ro: ["Coace"], image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800", is_vegetarian: false },
  
  // SNACK1 (3 opțiuni)
  { id: 29, name: "Celery Hummus", name_ro: "Țelină cu Hummus", phase: 2, meal_type: "snack1", calories: 120, protein: 4, carbs: 12, fat: 6, ingredients_en: ["celery", "hummus"], ingredients_ro: ["țelină", "hummus"], instructions_en: ["Dip"], instructions_ro: ["Înmoaie"], image_url: "https://images.unsplash.com/photo-1529288475508-c303ace43d0f?w=800", is_vegetarian: true },
  { id: 30, name: "Turkey Roll-Ups", name_ro: "Rulouri de Curcan", phase: 2, meal_type: "snack1", calories: 100, protein: 20, carbs: 2, fat: 2, ingredients_en: ["turkey slices"], ingredients_ro: ["felii curcan"], instructions_en: ["Roll and eat"], instructions_ro: ["Rulează și mănâncă"], image_url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800", is_vegetarian: false },
  { id: 31, name: "Cherry Tomatoes", name_ro: "Roșii Cherry", phase: 2, meal_type: "snack1", calories: 40, protein: 2, carbs: 8, fat: 0, ingredients_en: ["1 cup cherry tomatoes"], ingredients_ro: ["1 cană roșii cherry"], instructions_en: ["Wash and eat"], instructions_ro: ["Spală și mănâncă"], image_url: "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800", is_vegetarian: true, is_vegan: true },
  
  // SNACK2 (3 opțiuni)
  { id: 32, name: "Turkey Slices", name_ro: "Felii de Curcan", phase: 2, meal_type: "snack2", calories: 110, protein: 22, carbs: 2, fat: 2, ingredients_en: ["turkey slices"], ingredients_ro: ["felii curcan"], instructions_en: ["Serve cold"], instructions_ro: ["Servește rece"], image_url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800", is_vegetarian: false },
  { id: 33, name: "Cucumber", name_ro: "Castravete", phase: 2, meal_type: "snack2", calories: 45, protein: 2, carbs: 10, fat: 0, ingredients_en: ["1 cucumber"], ingredients_ro: ["1 castravete"], instructions_en: ["Slice"], instructions_ro: ["Taie"], image_url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800", is_vegetarian: true, is_vegan: true },
  { id: 34, name: "Bell Pepper Strips", name_ro: "Felii Ardei Gras", phase: 2, meal_type: "snack2", calories: 50, protein: 2, carbs: 12, fat: 0, ingredients_en: ["1 bell pepper"], ingredients_ro: ["1 ardei gras"], instructions_en: ["Slice"], instructions_ro: ["Taie"], image_url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800", is_vegetarian: true, is_vegan: true },
  
  // =============== PHASE 3 ===============
  // BREAKFAST (3 opțiuni)
  { id: 35, name: "Avocado Toast with Eggs", name_ro: "Toast cu Avocado și Ouă", phase: 3, meal_type: "breakfast", calories: 420, protein: 20, carbs: 35, fat: 24, ingredients_en: ["rye bread", "avocado", "eggs"], ingredients_ro: ["pâine de secară", "avocado", "ouă"], instructions_en: ["Toast rye bread and top"], instructions_ro: ["Prăjește pâinea de secară și garnisește"], image_url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800", is_vegetarian: true },
  { id: 36, name: "Nut Butter Rye Toast", name_ro: "Toast de Secară cu Unt de Arahide", phase: 3, meal_type: "breakfast", calories: 380, protein: 18, carbs: 38, fat: 20, ingredients_en: ["rye bread", "almond butter", "berries"], ingredients_ro: ["pâine de secară", "unt migdale", "fructe"], instructions_en: ["Toast rye bread, spread and top"], instructions_ro: ["Prăjește pâinea de secară, întinde și garnisește"], image_url: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=800", is_vegetarian: true },
  { id: 37, name: "Veggie Omelette with Avocado", name_ro: "Omletă cu Legume și Avocado", phase: 3, meal_type: "breakfast", calories: 350, protein: 22, carbs: 25, fat: 18, ingredients_en: ["3 eggs", "vegetables", "avocado"], ingredients_ro: ["3 ouă", "legume", "avocado"], instructions_en: ["Cook omelette with veggies"], instructions_ro: ["Gătește omleta cu legume"], image_url: "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=800", is_vegetarian: true },
  
  // LUNCH (3 opțiuni)
  { id: 38, name: "Salmon with Vegetables", name_ro: "Somon cu Legume", phase: 3, meal_type: "lunch", calories: 480, protein: 40, carbs: 25, fat: 25, ingredients_en: ["salmon", "vegetables"], ingredients_ro: ["somon", "legume"], instructions_en: ["Bake"], instructions_ro: ["Coace"], image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800", is_vegetarian: false },
  { id: 39, name: "Chicken Avocado Salad", name_ro: "Salată Pui cu Avocado", phase: 3, meal_type: "lunch", calories: 450, protein: 38, carbs: 28, fat: 22, ingredients_en: ["chicken", "avocado", "greens"], ingredients_ro: ["pui", "avocado", "salată"], instructions_en: ["Mix all"], instructions_ro: ["Amestecă"], image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800", is_vegetarian: false },
  { id: 40, name: "Tuna Avocado Bowl", name_ro: "Bowl cu Ton și Avocado", phase: 3, meal_type: "lunch", calories: 460, protein: 35, carbs: 30, fat: 24, ingredients_en: ["tuna", "avocado", "quinoa"], ingredients_ro: ["ton", "avocado", "quinoa"], instructions_en: ["Mix"], instructions_ro: ["Amestecă"], image_url: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800", is_vegetarian: false },
  
  // DINNER (4 opțiuni)
  { id: 41, name: "Steak with Sweet Potato", name_ro: "Friptură cu Cartof Dulce", phase: 3, meal_type: "dinner", calories: 550, protein: 48, carbs: 42, fat: 22, ingredients_en: ["steak", "sweet potato"], ingredients_ro: ["friptură", "cartof dulce"], instructions_en: ["Grill and roast"], instructions_ro: ["Gătește"], image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800", is_vegetarian: false },
  { id: 42, name: "Salmon Bowl", name_ro: "Bowl cu Somon", phase: 3, meal_type: "dinner", calories: 520, protein: 45, carbs: 38, fat: 24, ingredients_en: ["salmon", "quinoa", "avocado"], ingredients_ro: ["somon", "quinoa", "avocado"], instructions_en: ["Bake and assemble"], instructions_ro: ["Coace și asamblează"], image_url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800", is_vegetarian: false },
  { id: 43, name: "Chicken Thighs", name_ro: "Pulpe de Pui", phase: 3, meal_type: "dinner", calories: 480, protein: 42, carbs: 28, fat: 24, ingredients_en: ["chicken thighs", "vegetables"], ingredients_ro: ["pulpe pui", "legume"], instructions_en: ["Bake"], instructions_ro: ["Coace"], image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800", is_vegetarian: false },
  { id: 44, name: "Pork Chop with Veggies", name_ro: "Cotlet de Porc cu Legume", phase: 3, meal_type: "dinner", calories: 500, protein: 44, carbs: 32, fat: 26, ingredients_en: ["pork chop", "vegetables", "olive oil"], ingredients_ro: ["cotlet porc", "legume", "ulei măsline"], instructions_en: ["Grill and serve"], instructions_ro: ["Gătește și servește"], image_url: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800", is_vegetarian: false },
  
  // SNACK1 (3 opțiuni)
  { id: 45, name: "Almonds & Dark Chocolate", name_ro: "Migdale și Ciocolată", phase: 3, meal_type: "snack1", calories: 200, protein: 6, carbs: 15, fat: 14, ingredients_en: ["almonds", "chocolate"], ingredients_ro: ["migdale", "ciocolată"], instructions_en: ["Portion"], instructions_ro: ["Porționează"], image_url: "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800", is_vegetarian: true },
  { id: 46, name: "Hummus with Veggies", name_ro: "Hummus cu Legume", phase: 3, meal_type: "snack1", calories: 180, protein: 6, carbs: 18, fat: 10, ingredients_en: ["hummus", "carrots", "celery"], ingredients_ro: ["hummus", "morcovi", "țelină"], instructions_en: ["Dip"], instructions_ro: ["Înmoaie"], image_url: "https://images.unsplash.com/photo-1529288475508-c303ace43d0f?w=800", is_vegetarian: true, is_vegan: true },
  { id: 47, name: "Apple with Nut Butter", name_ro: "Măr cu Unt de Migdale", phase: 3, meal_type: "snack1", calories: 220, protein: 5, carbs: 28, fat: 12, ingredients_en: ["1 apple", "almond butter"], ingredients_ro: ["1 măr", "unt migdale"], instructions_en: ["Slice and spread"], instructions_ro: ["Taie și întinde"], image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800", is_vegetarian: true },
  
  // SNACK2 (3 opțiuni)
  { id: 48, name: "Walnuts", name_ro: "Nuci", phase: 3, meal_type: "snack2", calories: 185, protein: 4, carbs: 4, fat: 18, ingredients_en: ["10 walnuts"], ingredients_ro: ["10 nuci"], instructions_en: ["Portion"], instructions_ro: ["Porționează"], image_url: "https://images.unsplash.com/photo-1622484211043-e6d2f7d5a5eb?w=800", is_vegetarian: true, is_vegan: true },
  { id: 49, name: "Cashews", name_ro: "Caju", phase: 3, meal_type: "snack2", calories: 160, protein: 5, carbs: 9, fat: 13, ingredients_en: ["15 cashews"], ingredients_ro: ["15 caju"], instructions_en: ["Portion"], instructions_ro: ["Porționează"], image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800", is_vegetarian: true, is_vegan: true },
  { id: 50, name: "Avocado Slices", name_ro: "Felii de Avocado", phase: 3, meal_type: "snack2", calories: 160, protein: 2, carbs: 9, fat: 15, ingredients_en: ["1/2 avocado"], ingredients_ro: ["1/2 avocado"], instructions_en: ["Slice"], instructions_ro: ["Taie"], image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800", is_vegetarian: true, is_vegan: true }
];

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle food ingredients request (Food Database)
  if (req.query.food === 'list' || req.query.food === 'search') {
    try {
      // Ensure food_ingredients table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS food_ingredients (
          id SERIAL PRIMARY KEY,
          name_en VARCHAR(255) NOT NULL,
          name_ro VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          calories_per_100g DECIMAL(6,2),
          protein_per_100g DECIMAL(6,2),
          carbs_per_100g DECIMAL(6,2),
          fat_per_100g DECIMAL(6,2),
          fiber_per_100g DECIMAL(6,2),
          is_approved BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_food_name_ro ON food_ingredients(name_ro)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_food_category ON food_ingredients(category)`);
      
      // Check if table is empty (seed needed)
      const countResult = await pool.query('SELECT COUNT(*) FROM food_ingredients');
      const count = parseInt(countResult.rows[0].count);
      
      if (count === 0) {
        console.log('📦 Seeding food database - run seed script manually or via migration');
        // Note: Seeding se face manual sau prin script separat
        // Pentru a evita timeout-uri la deployment
      }
      
      // Search or list
      if (req.query.food === 'search') {
        const { q } = req.query;
        const result = await pool.query(`
          SELECT * FROM food_ingredients
          WHERE name_ro ILIKE $1 OR name_en ILIKE $1
          ORDER BY name_ro
          LIMIT 50
        `, [`%${q}%`]);
        return res.status(200).json(result.rows);
      }
      
      // List all
      const result = await pool.query(`
        SELECT * FROM food_ingredients
        ORDER BY category, name_ro
        LIMIT 500
      `);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Food database error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Handle countries request (combined to stay within Vercel 12 function limit)
  if (req.query.countries === 'true') {
    const countries = [
      { id: 1, name: 'România', code: 'RO', cities: ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea'] },
      { id: 2, name: 'Moldova', code: 'MD', cities: ['Chișinău', 'Tiraspol', 'Bălți', 'Bender', 'Rîbnița'] },
      { id: 3, name: 'United States', code: 'US', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'] },
      { id: 4, name: 'United Kingdom', code: 'GB', cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh'] },
      { id: 5, name: 'Germany', code: 'DE', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'] },
      { id: 6, name: 'France', code: 'FR', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'] },
      { id: 7, name: 'Italy', code: 'IT', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'] },
      { id: 8, name: 'Spain', code: 'ES', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'] },
      { id: 9, name: 'Canada', code: 'CA', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'] },
      { id: 10, name: 'Australia', code: 'AU', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Logan City'] }
    ];
    return res.status(200).json(countries);
  }
  
  // Returnează rețetele HARDCODED
  return res.status(200).json(recipes);
}
