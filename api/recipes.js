// HARDCODED RECIPES - funcționează IMEDIAT fără bază de date!
const recipes = [
  // PHASE 1 - BREAKFAST
  { id: 1, name: "Frozen Mango Smoothie", name_ro: "Smoothie cu Mango", phase: 1, meal_type: "breakfast", calories: 280, protein: 25, carbs: 45, fat: 1, ingredients_en: ["2 cups mango", "1 cup almond milk", "protein powder"], ingredients_ro: ["2 căni mango", "1 cană lapte migdale", "proteină"], instructions_en: ["Blend all"], instructions_ro: ["Mixează tot"], image_url: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 2, name: "Strawberry French Toast", name_ro: "Toast cu Căpșuni", phase: 1, meal_type: "breakfast", calories: 350, protein: 20, carbs: 55, fat: 2, ingredients_en: ["2 slices bread", "2 egg whites", "strawberries"], ingredients_ro: ["2 felii pâine", "2 albușuri", "căpșuni"], instructions_en: ["Cook and top"], instructions_ro: ["Gătește și garnisește"], image_url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800", is_vegetarian: true },
  
  // PHASE 1 - LUNCH
  { id: 3, name: "Tuna Salad", name_ro: "Salată cu Ton", phase: 1, meal_type: "lunch", calories: 380, protein: 35, carbs: 40, fat: 5, ingredients_en: ["150g tuna", "spinach", "apple"], ingredients_ro: ["150g ton", "spanac", "măr"], instructions_en: ["Mix all"], instructions_ro: ["Amestecă"], image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", is_vegetarian: false },
  
  { id: 4, name: "Chicken Sandwich", name_ro: "Sandviș Pui", phase: 1, meal_type: "lunch", calories: 420, protein: 40, carbs: 48, fat: 4, ingredients_en: ["chicken", "bread", "lettuce"], ingredients_ro: ["pui", "pâine", "salată"], instructions_en: ["Grill and assemble"], instructions_ro: ["Gătește și asamblează"], image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800", is_vegetarian: false },
  
  { id: 5, name: "Turkey Chili", name_ro: "Chili Curcan", phase: 1, meal_type: "dinner", calories: 450, protein: 45, carbs: 50, fat: 6, ingredients_en: ["turkey", "beans", "tomatoes"], ingredients_ro: ["curcan", "fasole", "roșii"], instructions_en: ["Simmer 20min"], instructions_ro: ["Fierbe 20min"], image_url: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800", is_vegetarian: false },
  
  // SNACKS
  { id: 6, name: "Apple", name_ro: "Măr", phase: 1, meal_type: "snack1", calories: 95, protein: 0, carbs: 25, fat: 0, ingredients_en: ["1 apple"], ingredients_ro: ["1 măr"], instructions_en: ["Eat fresh"], instructions_ro: ["Mănâncă proaspăt"], image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 7, name: "Orange", name_ro: "Portocală", phase: 1, meal_type: "snack2", calories: 62, protein: 1, carbs: 15, fat: 0, ingredients_en: ["1 orange"], ingredients_ro: ["1 portocală"], instructions_en: ["Peel and eat"], instructions_ro: ["Curăță și mănâncă"], image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 14, name: "Berries", name_ro: "Fructe de pădure", phase: 1, meal_type: "snack2", calories: 80, protein: 1, carbs: 18, fat: 0, ingredients_en: ["1 cup mixed berries"], ingredients_ro: ["1 cană fructe de pădure"], instructions_en: ["Wash and eat"], instructions_ro: ["Spală și mănâncă"], image_url: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 15, name: "Grapes", name_ro: "Struguri", phase: 1, meal_type: "snack2", calories: 104, protein: 1, carbs: 27, fat: 0, ingredients_en: ["1 cup grapes"], ingredients_ro: ["1 cană struguri"], instructions_en: ["Wash and eat"], instructions_ro: ["Spală și mănâncă"], image_url: "https://images.unsplash.com/photo-1599819177338-d0da4b28e5d3?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 16, name: "Watermelon", name_ro: "Pepene Verde", phase: 1, meal_type: "snack2", calories: 92, protein: 2, carbs: 23, fat: 0, ingredients_en: ["2 cups watermelon"], ingredients_ro: ["2 căni pepene verde"], instructions_en: ["Cut and serve"], instructions_ro: ["Taie și servește"], image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784210?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 17, name: "Chicken Stir-Fry", name_ro: "Pui Stir-Fry", phase: 1, meal_type: "dinner", calories: 400, protein: 42, carbs: 45, fat: 5, ingredients_en: ["200g chicken", "2 cups vegetables", "brown rice"], ingredients_ro: ["200g pui", "2 căni legume", "orez brun"], instructions_en: ["Stir-fry chicken", "Add vegetables", "Serve with rice"], instructions_ro: ["Sotează puiul", "Adaugă legume", "Servește cu orez"], image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800", is_vegetarian: false },
  
  { id: 18, name: "Beef with Quinoa", name_ro: "Vită cu Quinoa", phase: 1, meal_type: "dinner", calories: 480, protein: 48, carbs: 52, fat: 6, ingredients_en: ["180g lean beef", "1 cup quinoa", "vegetables"], ingredients_ro: ["180g carne slabă vită", "1 cană quinoa", "legume"], instructions_en: ["Grill beef", "Cook quinoa", "Combine"], instructions_ro: ["Gătește vita", "Fierbe quinoa", "Combină"], image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", is_vegetarian: false },
  
  // PHASE 2
  { id: 8, name: "Egg Scramble", name_ro: "Omletă", phase: 2, meal_type: "breakfast", calories: 180, protein: 25, carbs: 10, fat: 3, ingredients_en: ["4 egg whites", "vegetables"], ingredients_ro: ["4 albușuri", "legume"], instructions_en: ["Cook"], instructions_ro: ["Gătește"], image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800", is_vegetarian: true },
  
  { id: 9, name: "Grilled Chicken", name_ro: "Pui Grătar", phase: 2, meal_type: "lunch", calories: 320, protein: 45, carbs: 8, fat: 12, ingredients_en: ["chicken", "asparagus"], ingredients_ro: ["pui", "sparanghel"], instructions_en: ["Grill"], instructions_ro: ["La grătar"], image_url: "https://images.unsplash.com/photo-1612057888294-9c11a7178022?w=800", is_vegetarian: false },
  
  { id: 10, name: "Celery Hummus", name_ro: "Țelină Hummus", phase: 2, meal_type: "snack1", calories: 120, protein: 4, carbs: 12, fat: 6, ingredients_en: ["celery", "hummus"], ingredients_ro: ["țelină", "hummus"], instructions_en: ["Dip"], instructions_ro: ["Înmoaie"], image_url: "https://images.unsplash.com/photo-1529288475508-c303ace43d0f?w=800", is_vegetarian: true },
  
  { id: 19, name: "Turkey Slices", name_ro: "Felii de Curcan", phase: 2, meal_type: "snack2", calories: 110, protein: 22, carbs: 2, fat: 2, ingredients_en: ["100g turkey breast slices"], ingredients_ro: ["100g felii piept curcan"], instructions_en: ["Serve cold"], instructions_ro: ["Servește rece"], image_url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800", is_vegetarian: false },
  
  { id: 20, name: "Cucumber Slices", name_ro: "Felii Castravete", phase: 2, meal_type: "snack2", calories: 45, protein: 2, carbs: 10, fat: 0, ingredients_en: ["1 large cucumber"], ingredients_ro: ["1 castravete mare"], instructions_en: ["Slice and serve"], instructions_ro: ["Taie și servește"], image_url: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 21, name: "Grilled Fish", name_ro: "Pește la Grătar", phase: 2, meal_type: "dinner", calories: 340, protein: 50, carbs: 5, fat: 14, ingredients_en: ["200g white fish", "lemon", "herbs"], ingredients_ro: ["200g pește alb", "lămâie", "ierburi"], instructions_en: ["Season and grill"], instructions_ro: ["Condimentează și gătește"], image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800", is_vegetarian: false },
  
  { id: 22, name: "Turkey Lettuce Wraps", name_ro: "Wraps cu Curcan", phase: 2, meal_type: "dinner", calories: 310, protein: 44, carbs: 8, fat: 12, ingredients_en: ["180g ground turkey", "lettuce leaves", "vegetables"], ingredients_ro: ["180g curcan tocat", "frunze salată", "legume"], instructions_en: ["Cook turkey", "Wrap in lettuce"], instructions_ro: ["Gătește curcanul", "Înfășoară în salată"], image_url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800", is_vegetarian: false },
  
  // PHASE 3
  { id: 11, name: "Avocado Toast", name_ro: "Toast Avocado", phase: 3, meal_type: "breakfast", calories: 420, protein: 20, carbs: 35, fat: 24, ingredients_en: ["bread", "avocado", "eggs"], ingredients_ro: ["pâine", "avocado", "ouă"], instructions_en: ["Toast and top"], instructions_ro: ["Prăjește și garnisește"], image_url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800", is_vegetarian: true },
  
  { id: 12, name: "Salmon", name_ro: "Somon", phase: 3, meal_type: "lunch", calories: 480, protein: 40, carbs: 25, fat: 25, ingredients_en: ["salmon", "vegetables"], ingredients_ro: ["somon", "legume"], instructions_en: ["Bake"], instructions_ro: ["La cuptor"], image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800", is_vegetarian: false },
  
  { id: 13, name: "Almonds", name_ro: "Migdale", phase: 3, meal_type: "snack1", calories: 200, protein: 6, carbs: 15, fat: 14, ingredients_en: ["almonds", "chocolate"], ingredients_ro: ["migdale", "ciocolată"], instructions_en: ["Portion"], instructions_ro: ["Porționează"], image_url: "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800", is_vegetarian: true },
  
  { id: 23, name: "Walnuts", name_ro: "Nuci", phase: 3, meal_type: "snack2", calories: 185, protein: 4, carbs: 4, fat: 18, ingredients_en: ["10 walnut halves"], ingredients_ro: ["10 jumătăți nuci"], instructions_en: ["Portion and eat"], instructions_ro: ["Porționează și mănâncă"], image_url: "https://images.unsplash.com/photo-1622484211043-e6d2f7d5a5eb?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 24, name: "Cashews", name_ro: "Caju", phase: 3, meal_type: "snack2", calories: 160, protein: 5, carbs: 9, fat: 13, ingredients_en: ["15 cashews"], ingredients_ro: ["15 caju"], instructions_en: ["Portion"], instructions_ro: ["Porționează"], image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800", is_vegetarian: true, is_vegan: true },
  
  { id: 25, name: "Steak with Sweet Potato", name_ro: "Friptură cu Cartof Dulce", phase: 3, meal_type: "dinner", calories: 550, protein: 48, carbs: 42, fat: 22, ingredients_en: ["200g steak", "1 sweet potato", "olive oil", "vegetables"], ingredients_ro: ["200g friptură", "1 cartof dulce", "ulei măsline", "legume"], instructions_en: ["Grill steak", "Roast sweet potato", "Serve together"], instructions_ro: ["Gătește friptura", "Coace cartoful", "Servește împreună"], image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800", is_vegetarian: false },
  
  { id: 26, name: "Salmon Bowl", name_ro: "Bowl cu Somon", phase: 3, meal_type: "dinner", calories: 520, protein: 45, carbs: 38, fat: 24, ingredients_en: ["180g salmon", "quinoa", "avocado", "vegetables"], ingredients_ro: ["180g somon", "quinoa", "avocado", "legume"], instructions_en: ["Bake salmon", "Cook quinoa", "Assemble bowl"], instructions_ro: ["Coace somonul", "Fierbe quinoa", "Asamblează bowl-ul"], image_url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800", is_vegetarian: false },
  
  { id: 27, name: "Chicken Thighs with Veggies", name_ro: "Pulpe Pui cu Legume", phase: 3, meal_type: "dinner", calories: 480, protein: 42, carbs: 28, fat: 24, ingredients_en: ["2 chicken thighs", "mixed vegetables", "olive oil"], ingredients_ro: ["2 pulpe pui", "legume mixte", "ulei măsline"], instructions_en: ["Bake chicken", "Roast vegetables"], instructions_ro: ["Coace puiul", "Coace legumele"], image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800", is_vegetarian: false }
];

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Returnează rețetele HARDCODED
  return res.status(200).json(recipes);
}

