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
  
  // PHASE 2
  { id: 8, name: "Egg Scramble", name_ro: "Omletă", phase: 2, meal_type: "breakfast", calories: 180, protein: 25, carbs: 10, fat: 3, ingredients_en: ["4 egg whites", "vegetables"], ingredients_ro: ["4 albușuri", "legume"], instructions_en: ["Cook"], instructions_ro: ["Gătește"], image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800", is_vegetarian: true },
  
  { id: 9, name: "Grilled Chicken", name_ro: "Pui Grătar", phase: 2, meal_type: "lunch", calories: 320, protein: 45, carbs: 8, fat: 12, ingredients_en: ["chicken", "asparagus"], ingredients_ro: ["pui", "sparanghel"], instructions_en: ["Grill"], instructions_ro: ["La grătar"], image_url: "https://images.unsplash.com/photo-1612057888294-9c11a7178022?w=800", is_vegetarian: false },
  
  { id: 10, name: "Celery Hummus", name_ro: "Țelină Hummus", phase: 2, meal_type: "snack1", calories: 120, protein: 4, carbs: 12, fat: 6, ingredients_en: ["celery", "hummus"], ingredients_ro: ["țelină", "hummus"], instructions_en: ["Dip"], instructions_ro: ["Înmoaie"], image_url: "https://images.unsplash.com/photo-1529288475508-c303ace43d0f?w=800", is_vegetarian: true },
  
  // PHASE 3
  { id: 11, name: "Avocado Toast", name_ro: "Toast Avocado", phase: 3, meal_type: "breakfast", calories: 420, protein: 20, carbs: 35, fat: 24, ingredients_en: ["bread", "avocado", "eggs"], ingredients_ro: ["pâine", "avocado", "ouă"], instructions_en: ["Toast and top"], instructions_ro: ["Prăjește și garnisește"], image_url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800", is_vegetarian: true },
  
  { id: 12, name: "Salmon", name_ro: "Somon", phase: 3, meal_type: "lunch", calories: 480, protein: 40, carbs: 25, fat: 25, ingredients_en: ["salmon", "vegetables"], ingredients_ro: ["somon", "legume"], instructions_en: ["Bake"], instructions_ro: ["La cuptor"], image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800", is_vegetarian: false },
  
  { id: 13, name: "Almonds", name_ro: "Migdale", phase: 3, meal_type: "snack1", calories: 200, protein: 6, carbs: 15, fat: 14, ingredients_en: ["almonds", "chocolate"], ingredients_ro: ["migdale", "ciocolată"], instructions_en: ["Portion"], instructions_ro: ["Porționează"], image_url: "https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800", is_vegetarian: true }
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

