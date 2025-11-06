import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'nutri-plan.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'user',
      start_date TEXT,
      birth_date TEXT,
      current_weight REAL,
      target_weight REAL,
      height REAL,
      age INTEGER,
      gender TEXT,
      activity_level TEXT,
      dietary_preferences TEXT,
      allergies TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Weight tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS weight_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Daily meals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      name TEXT NOT NULL,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fats REAL,
      completed BOOLEAN DEFAULT 0,
      date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Recipes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      ingredients TEXT,
      instructions TEXT,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fats REAL,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      image_url TEXT,
      is_public BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
  `);

  // Progress notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      mood TEXT,
      energy_level INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Friendships table
  db.exec(`
    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Daily check-ins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      day_number INTEGER,
      phase INTEGER,
      breakfast_completed BOOLEAN DEFAULT 0,
      breakfast_option TEXT,
      breakfast_image TEXT,
      breakfast_calories INTEGER,
      breakfast_quantity REAL DEFAULT 1,
      snack1_completed BOOLEAN DEFAULT 0,
      snack1_option TEXT,
      snack1_image TEXT,
      snack1_calories INTEGER,
      snack1_quantity REAL DEFAULT 1,
      lunch_completed BOOLEAN DEFAULT 0,
      lunch_option TEXT,
      lunch_image TEXT,
      lunch_calories INTEGER,
      lunch_quantity REAL DEFAULT 1,
      snack2_completed BOOLEAN DEFAULT 0,
      snack2_option TEXT,
      snack2_image TEXT,
      snack2_calories INTEGER,
      snack2_quantity REAL DEFAULT 1,
      dinner_completed BOOLEAN DEFAULT 0,
      dinner_option TEXT,
      dinner_image TEXT,
      dinner_calories INTEGER,
      dinner_quantity REAL DEFAULT 1,
      exercise_completed BOOLEAN DEFAULT 0,
      exercise_type TEXT,
      exercise_duration INTEGER,
      exercise_calories_burned INTEGER,
      water_intake INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )
  `);

  console.log('✅ Database initialized successfully');
}

export default db;

