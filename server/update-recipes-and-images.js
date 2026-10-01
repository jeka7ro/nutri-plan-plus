import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = '/Users/eugeniucazmal/.gemini/antigravity-ide/brain/050e1ac0-b533-40cd-9d91-2fd11c85b243';
const targetDir = path.join(__dirname, 'public', 'images');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Map of image types to their filenames
const images = {
  breakfast: 'healthy_breakfast_logo_1781096035679.png',
  lunch: 'healthy_lunch_logo_1781096053709.png',
  dinner: 'healthy_dinner_logo_1781096064298.png',
  snack: 'healthy_lunch_logo_1781096053709.png' // fallback pt snack
};

// Copy images skipped due to EPERM. User will copy them manually.

const dbPath = path.join(__dirname, 'nutri-plan.db');
if (fs.existsSync(dbPath)) {
  const db = new Database(dbPath);
  
  // Clean invalid recipes first
  console.log('Cleaning invalid recipes...');
  const idsToDelete = [4, 2, 3, 13, 9, 16, 15, 17, 12, 7, 78, 14, 5, 11, 10, 8, 6, 19, 21, 35, 31, 26, 29, 87, 118, 88, 119, 53, 134, 156, 178, 80, 71, 61, 55, 57, 72, 52, 176, 154, 132, 51, 76, 77, 133, 177, 155, 74, 73, 79];
  
  const deleteStmt = db.prepare(`DELETE FROM recipes WHERE id IN (${idsToDelete.join(',')})`);
  const delResult = deleteStmt.run();
  console.log(`Deleted ${delResult.changes} invalid recipes.`);

  // Update images
  console.log('Updating images...');
  let updateCount = 0;
  
  // Get all recipes with unsplash images
  const recipes = db.prepare("SELECT id, meal_type FROM recipes WHERE image_url LIKE '%unsplash%'").all();
  
  const updateStmt = db.prepare("UPDATE recipes SET image_url = ? WHERE id = ?");
  
  for (const recipe of recipes) {
    let newImage = '/images/' + images.lunch; // default
    if (recipe.meal_type.includes('breakfast')) {
      newImage = '/images/' + images.breakfast;
    } else if (recipe.meal_type.includes('dinner')) {
      newImage = '/images/' + images.dinner;
    } else if (recipe.meal_type.includes('snack')) {
      newImage = '/images/' + images.snack;
    }
    
    updateStmt.run(newImage, recipe.id);
    updateCount++;
  }
  
  console.log(`Updated images for ${updateCount} recipes.`);
  db.close();
} else {
  console.log('Database not found at ' + dbPath);
}
