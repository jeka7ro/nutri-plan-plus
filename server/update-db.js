import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'nutri-plan.db');
const db = new Database(dbPath);

console.log('Updating images to healthy alternatives...');

const updates = [
  { match: 'breakfast', url: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=800&q=80' },
  { match: 'lunch', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
  { match: 'dinner', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80' },
  { match: 'snack1', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
  { match: 'snack2', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' }
];

for (const update of updates) {
  const result = db.prepare(`
    UPDATE recipes 
    SET image_url = ? 
    WHERE meal_type = ? 
    AND (
      image_url LIKE '%unsplash%' OR 
      image_url IS NULL OR 
      image_url = ''
    )
  `).run(update.url, update.match);
  console.log(`Updated ${result.changes} recipes for ${update.match}`);
}

db.close();
console.log('Done.');
