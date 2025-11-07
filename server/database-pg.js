import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config.js';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.database.url || undefined,
  host: config.database.url ? undefined : config.database.host,
  port: config.database.url ? undefined : config.database.port,
  database: config.database.url ? undefined : config.database.database,
  user: config.database.url ? undefined : config.database.user,
  password: config.database.url ? undefined : config.database.password,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
  process.exit(-1);
});

// Initialize database schema
export async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing PostgreSQL database schema...\n');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        subscription_tier VARCHAR(50) DEFAULT 'free',
        subscription_code VARCHAR(100),
        subscription_expires_at TIMESTAMP,
        start_date DATE,
        birth_date DATE,
        profile_picture TEXT,
        current_weight DECIMAL(5,2),
        target_weight DECIMAL(5,2),
        height DECIMAL(5,2),
        age INTEGER,
        gender VARCHAR(20),
        activity_level VARCHAR(50),
        dietary_preferences TEXT,
        allergies TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Weight tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS weight_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        weight DECIMAL(5,2) NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Weight entries table created');

    // Recipes table with bilingual support
    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        name_ro VARCHAR(255),
        name_en VARCHAR(255),
        description TEXT,
        description_ro TEXT,
        description_en TEXT,
        ingredients JSONB,
        ingredients_ro JSONB,
        ingredients_en JSONB,
        instructions TEXT,
        instructions_ro TEXT,
        instructions_en TEXT,
        calories INTEGER,
        protein DECIMAL(5,1),
        carbs DECIMAL(5,1),
        fats DECIMAL(5,1),
        prep_time INTEGER,
        cook_time INTEGER,
        servings INTEGER DEFAULT 1,
        phase INTEGER,
        meal_type VARCHAR(50),
        image_url TEXT,
        tags JSONB,
        is_vegetarian BOOLEAN DEFAULT FALSE,
        is_vegan BOOLEAN DEFAULT FALSE,
        allergens JSONB,
        is_public BOOLEAN DEFAULT TRUE,
        requires_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Recipes table created');

    // Daily check-ins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        day_number INTEGER,
        phase INTEGER,
        breakfast_completed BOOLEAN DEFAULT FALSE,
        breakfast_option VARCHAR(255),
        breakfast_image TEXT,
        breakfast_calories INTEGER,
        breakfast_quantity DECIMAL(3,1) DEFAULT 1,
        snack1_completed BOOLEAN DEFAULT FALSE,
        snack1_option VARCHAR(255),
        snack1_image TEXT,
        snack1_calories INTEGER,
        snack1_quantity DECIMAL(3,1) DEFAULT 1,
        lunch_completed BOOLEAN DEFAULT FALSE,
        lunch_option VARCHAR(255),
        lunch_image TEXT,
        lunch_calories INTEGER,
        lunch_quantity DECIMAL(3,1) DEFAULT 1,
        snack2_completed BOOLEAN DEFAULT FALSE,
        snack2_option VARCHAR(255),
        snack2_image TEXT,
        snack2_calories INTEGER,
        snack2_quantity DECIMAL(3,1) DEFAULT 1,
        dinner_completed BOOLEAN DEFAULT FALSE,
        dinner_option VARCHAR(255),
        dinner_image TEXT,
        dinner_calories INTEGER,
        dinner_quantity DECIMAL(3,1) DEFAULT 1,
        exercise_completed BOOLEAN DEFAULT FALSE,
        exercise_type VARCHAR(100),
        exercise_duration INTEGER,
        exercise_calories_burned INTEGER,
        water_intake INTEGER DEFAULT 0,
        total_calories INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `);
    console.log('✅ Daily check-ins table created');

    // Progress notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS progress_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        note TEXT,
        mood VARCHAR(50),
        energy_level INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Progress notes table created');

    // Friendships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `);
    console.log('✅ Friendships table created');

    // Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Messages table created');

    // Subscription codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        tier VARCHAR(50) NOT NULL,
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('✅ Subscription codes table created');

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_recipes_phase ON recipes(phase)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON daily_checkins(user_id, date)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_weight_entries_user ON weight_entries(user_id)');
    console.log('✅ Indexes created');

    console.log('\n✅ PostgreSQL database initialized successfully!\n');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;



// Migration: Add new registration fields
export async function addRegistrationFields() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding registration fields to users table...\n');
    
    // Add new columns if they don't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+40',
      ADD COLUMN IF NOT EXISTS country VARCHAR(100),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
      ADD COLUMN IF NOT EXISTS favorite_foods TEXT,
      ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_vegan BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP
    `);
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_country ON users(country)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_city ON users(city)');
    
    console.log('✅ Registration fields added successfully!\n');
  } catch (error) {
    console.error('❌ Error adding registration fields:', error);
    throw error;
  } finally {
    client.release();
  }
}
