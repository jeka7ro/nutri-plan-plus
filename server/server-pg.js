import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pool from './database-pg.js';
import { registerUser, loginUser, authMiddleware, requireSubscription } from './auth-pg.js';
import { createBackup, listBackups, deleteBackup, cleanupOldBackups, startAutomaticBackups } from './backup-manager.js';
import { config } from './config.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = config.port;

// Middleware - CORS configurabil pentru acces global
const corsOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'] 
  : (config.nodeEnv === 'production' 
      ? ['https://nutri-plan-plus.vercel.app', 'https://nutri-plan-plus.onrender.com']
      : '*'); // Development: permite toate originile

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== AUTH ENDPOINTS ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await registerUser(email, password, name);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT id, email, name, first_name, last_name, phone, role, subscription_tier, subscription_expires_at, 
             start_date, birth_date, current_weight, target_weight,
             height, age, gender, activity_level, dietary_preferences, allergies, profile_picture,
             country, city
      FROM users WHERE id = $1
    `, [req.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Parse JSON fields
    const user = result.rows[0];
    if (user.dietary_preferences) {
      user.dietary_preferences = user.dietary_preferences.split(',');
    }
    if (user.allergies) {
      user.allergies = user.allergies.split(',');
    }
    
    res.json(user);
  } finally {
    client.release();
  }
});

// Update user profile
app.put('/api/auth/me', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const updates = req.body;
    const allowedFields = [
      'name', 'start_date', 'birth_date', 'current_weight', 'target_weight',
      'height', 'age', 'gender', 'activity_level',
      'dietary_preferences', 'allergies', 'profile_picture',
      'country', 'city'
    ];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(req.userId); // Add userId for WHERE clause
    
    await client.query(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length}
    `, values);
    
    // Get updated user
    const result = await client.query(`
      SELECT id, email, name, role, subscription_tier, start_date, birth_date,
             current_weight, target_weight, height, age, gender, activity_level,
             dietary_preferences, allergies, profile_picture, country, city
      FROM users WHERE id = $1
    `, [req.userId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ==================== WEIGHT TRACKING ENDPOINTS ====================

// Get weight entries
app.get('/api/weight', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM weight_entries 
      WHERE user_id = $1 
      ORDER BY date DESC
    `, [req.userId]);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// Add weight entry
app.post('/api/weight', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { weight, date, notes } = req.body;
    
    const result = await client.query(`
      INSERT INTO weight_entries (user_id, weight, date, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.userId, weight, date || new Date().toISOString().split('T')[0], notes]);
    
    res.json(result.rows[0]);
  } finally {
    client.release();
  }
});

// Delete weight entry
app.delete('/api/weight/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query(
      'DELETE FROM weight_entries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    res.json({ success: true });
  } finally {
    client.release();
  }
});

// ==================== RECIPES ENDPOINTS ====================

// Get all recipes
app.get('/api/recipes', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Get user's subscription tier
    const userResult = await client.query(
      'SELECT subscription_tier FROM users WHERE id = $1',
      [req.userId]
    );
    
    const userTier = userResult.rows[0]?.subscription_tier || 'free';
    
    // Free users: only phase 1 recipes
    // Premium users: all recipes
    const query = userTier === 'free'
      ? 'SELECT * FROM recipes WHERE is_public = TRUE AND phase = 1 ORDER BY created_at DESC'
      : 'SELECT * FROM recipes WHERE is_public = TRUE OR user_id = $1 ORDER BY created_at DESC';
    
    const params = userTier === 'free' ? [] : [req.userId];
    const result = await client.query(query, params);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// Get single recipe
app.get('/api/recipes/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM recipes WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(result.rows[0]);
  } finally {
    client.release();
  }
});

// Create recipe (premium only)
app.post('/api/recipes', authMiddleware, requireSubscription('premium'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, name_ro, name_en, description, description_ro, description_en,
            ingredients_ro, ingredients_en, instructions_ro, instructions_en,
            calories, protein, carbs, fats, prep_time, cook_time, servings,
            phase, meal_type, image_url, tags, is_vegetarian, is_vegan, allergens, is_public } = req.body;
    
    const result = await client.query(`
      INSERT INTO recipes (
        user_id, name, name_ro, name_en, description, description_ro, description_en,
        ingredients_ro, ingredients_en, instructions_ro, instructions_en,
        calories, protein, carbs, fats, prep_time, cook_time, servings,
        phase, meal_type, image_url, tags, is_vegetarian, is_vegan, allergens, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *
    `, [
      req.userId, name, name_ro, name_en, description, description_ro, description_en,
      JSON.stringify(ingredients_ro), JSON.stringify(ingredients_en), instructions_ro, instructions_en,
      calories, protein, carbs, fats, prep_time, cook_time, servings,
      phase, meal_type, image_url, JSON.stringify(tags), is_vegetarian, is_vegan, JSON.stringify(allergens), is_public
    ]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ==================== DAILY CHECK-INS ENDPOINTS ====================

// Get check-in for specific date
app.get('/api/checkins/:date', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM daily_checkins 
      WHERE user_id = $1 AND date = $2
    `, [req.userId, req.params.date]);
    
    res.json(result.rows[0] || null);
  } finally {
    client.release();
  }
});

// Get all check-ins for user
app.get('/api/checkins', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM daily_checkins 
      WHERE user_id = $1
      ORDER BY date DESC
    `, [req.userId]);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// Create or update check-in
app.post('/api/checkins', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const data = req.body;
    const date = data.date || new Date().toISOString().split('T')[0];
    
    console.log('📥 Check-in request:', { userId: req.userId, date, data });
    
    // Check if check-in exists
    const existing = await client.query(
      'SELECT * FROM daily_checkins WHERE user_id = $1 AND date = $2',
      [req.userId, date]
    );
    
    if (existing.rows.length > 0) {
      // Update existing check-in
      const allowedFields = [
        'day_number', 'phase',
        'breakfast_completed', 'breakfast_option', 'breakfast_image', 'breakfast_calories', 'breakfast_quantity',
        'snack1_completed', 'snack1_option', 'snack1_image', 'snack1_calories', 'snack1_quantity',
        'lunch_completed', 'lunch_option', 'lunch_image', 'lunch_calories', 'lunch_quantity',
        'snack2_completed', 'snack2_option', 'snack2_image', 'snack2_calories', 'snack2_quantity',
        'dinner_completed', 'dinner_option', 'dinner_image', 'dinner_calories', 'dinner_quantity',
        'exercise_completed', 'exercise_type', 'exercise_duration', 'exercise_calories_burned',
        'water_intake', 'notes'
      ];
      
      const fields = Object.keys(data).filter(key => allowedFields.includes(key));
      
      if (fields.length > 0) {
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = fields.map(field => data[field]);
        values.push(existing.rows[0].id); // Add ID for WHERE clause
        
        await client.query(`
          UPDATE daily_checkins 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $${values.length}
        `, values);
      }
      
      // Get updated check-in and calculate total_calories
      const updated = await client.query(
        'SELECT * FROM daily_checkins WHERE id = $1',
        [existing.rows[0].id]
      );
      
      const checkIn = updated.rows[0];
      
      // Calculate total_calories
      const totalCalories = (
        (checkIn.breakfast_calories || 0) +
        (checkIn.snack1_calories || 0) +
        (checkIn.lunch_calories || 0) +
        (checkIn.snack2_calories || 0) +
        (checkIn.dinner_calories || 0)
      );
      
      // Update total_calories
      await client.query(
        'UPDATE daily_checkins SET total_calories = $1 WHERE id = $2',
        [totalCalories, existing.rows[0].id]
      );
      
      // Return updated data
      const final = await client.query(
        'SELECT * FROM daily_checkins WHERE id = $1',
        [existing.rows[0].id]
      );
      
      res.json(final.rows[0]);
    } else {
      // Create new check-in
      const result = await client.query(`
        INSERT INTO daily_checkins (
          user_id, date, day_number, phase,
          breakfast_completed, breakfast_option, breakfast_image, breakfast_calories, breakfast_quantity,
          snack1_completed, snack1_option, snack1_image, snack1_calories, snack1_quantity,
          lunch_completed, lunch_option, lunch_image, lunch_calories, lunch_quantity,
          snack2_completed, snack2_option, snack2_image, snack2_calories, snack2_quantity,
          dinner_completed, dinner_option, dinner_image, dinner_calories, dinner_quantity,
          exercise_completed, exercise_type, exercise_duration, exercise_calories_burned,
          water_intake, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
        RETURNING *
      `, [
        req.userId, date, data.day_number || null, data.phase || null,
        data.breakfast_completed || false, data.breakfast_option || null, data.breakfast_image || null, 
        data.breakfast_calories || null, data.breakfast_quantity || 1,
        data.snack1_completed || false, data.snack1_option || null, data.snack1_image || null,
        data.snack1_calories || null, data.snack1_quantity || 1,
        data.lunch_completed || false, data.lunch_option || null, data.lunch_image || null,
        data.lunch_calories || null, data.lunch_quantity || 1,
        data.snack2_completed || false, data.snack2_option || null, data.snack2_image || null,
        data.snack2_calories || null, data.snack2_quantity || 1,
        data.dinner_completed || false, data.dinner_option || null, data.dinner_image || null,
        data.dinner_calories || null, data.dinner_quantity || 1,
        data.exercise_completed || false, data.exercise_type || null, data.exercise_duration || null,
        data.exercise_calories_burned || null,
        data.water_intake || 0, data.notes || null
      ]);
      
      const checkIn = result.rows[0];
      
      // Calculate and update total_calories
      const totalCalories = (
        (checkIn.breakfast_calories || 0) +
        (checkIn.snack1_calories || 0) +
        (checkIn.lunch_calories || 0) +
        (checkIn.snack2_calories || 0) +
        (checkIn.dinner_calories || 0)
      );
      
      await client.query(
        'UPDATE daily_checkins SET total_calories = $1 WHERE id = $2',
        [totalCalories, checkIn.id]
      );
      
      // Return final data with total_calories
      const final = await client.query(
        'SELECT * FROM daily_checkins WHERE id = $1',
        [checkIn.id]
      );
      
      res.json(final.rows[0]);
    }
  } catch (error) {
    console.error('❌ Check-in error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ==================== PROGRESS NOTES ENDPOINTS ====================

app.get('/api/progress', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM progress_notes 
      WHERE user_id = $1 
      ORDER BY date DESC
    `, [req.userId]);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

app.post('/api/progress', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { note, mood, energy_level, date } = req.body;
    
    const result = await client.query(`
      INSERT INTO progress_notes (user_id, date, note, mood, energy_level)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.userId, date || new Date().toISOString().split('T')[0], note, mood, energy_level]);
    
    res.json(result.rows[0]);
  } finally {
    client.release();
  }
});

// ==================== USERS & FRIENDS ENDPOINTS ====================

app.get('/api/users', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Pentru Admin Dashboard, returnează TOȚI utilizatorii cu TOATE datele
    const result = await client.query(`
      SELECT 
        id, email, name, role, profile_picture,
        subscription_tier, subscription_code, subscription_expires_at,
        start_date, birth_date, 
        current_weight, target_weight, height, age, gender, activity_level,
        dietary_preferences, allergies, country, city,
        created_at, updated_at, last_login
      FROM users 
      ORDER BY id
    `);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

app.get('/api/friends', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT u.id, u.email, u.name, f.status
      FROM friendships f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = $1 AND f.status = 'accepted'
    `, [req.userId]);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

app.post('/api/friends', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { friend_id } = req.body;
    
    const result = await client.query(`
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES ($1, $2, 'accepted')
      ON CONFLICT (user_id, friend_id) DO NOTHING
      RETURNING *
    `, [req.userId, friend_id]);
    
    res.json(result.rows[0] || { message: 'Friendship already exists' });
  } finally {
    client.release();
  }
});

// ==================== MESSAGES ENDPOINTS ====================

app.get('/api/messages', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT m.*, u.name as from_name, u.email as from_email
      FROM messages m
      JOIN users u ON u.id = m.from_user_id
      WHERE m.to_user_id = $1 OR m.from_user_id = $1
      ORDER BY m.created_at DESC
    `, [req.userId]);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

app.post('/api/messages', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { to_user_id, message } = req.body;
    
    const result = await client.query(`
      INSERT INTO messages (from_user_id, to_user_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [req.userId, to_user_id, message]);
    
    res.json(result.rows[0]);
  } finally {
    client.release();
  }
});

app.put('/api/messages/:id/read', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query(
      'UPDATE messages SET read = TRUE WHERE id = $1 AND to_user_id = $2',
      [req.params.id, req.userId]
    );
    
    res.json({ success: true });
  } finally {
    client.release();
  }
});

// ==================== SUBSCRIPTION & ADMIN ENDPOINTS ====================

// Redeem subscription code
app.post('/api/subscription/redeem', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { code } = req.body;
    
    // Get code info
    const codeResult = await client.query(`
      SELECT * FROM subscription_codes 
      WHERE code = $1 AND is_active = TRUE
    `, [code]);
    
    if (codeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invalid or expired code' });
    }
    
    const subscriptionCode = codeResult.rows[0];
    
    // Check if code is still valid
    if (subscriptionCode.current_uses >= subscriptionCode.max_uses) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Code has reached maximum uses' });
    }
    
    if (subscriptionCode.expires_at && new Date(subscriptionCode.expires_at) < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Code has expired' });
    }
    
    // Update user subscription
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now
    
    await client.query(`
      UPDATE users 
      SET subscription_tier = $1, subscription_code = $2, subscription_expires_at = $3
      WHERE id = $4
    `, [subscriptionCode.tier, code, expiresAt, req.userId]);
    
    // Increment code uses
    await client.query(`
      UPDATE subscription_codes 
      SET current_uses = current_uses + 1
      WHERE id = $1
    `, [subscriptionCode.id]);
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      tier: subscriptionCode.tier,
      expires_at: expiresAt
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Admin: Get all users
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if admin
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await client.query(`
      SELECT id, email, name, first_name, last_name, phone, role, subscription_tier, subscription_expires_at, created_at,
             country, city, current_weight, target_weight, height, age, gender, start_date, last_login
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// Admin - toate check-ins-urile pentru TOȚI utilizatorii
app.get('/api/admin/checkins', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if admin
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get all check-ins with user info
    const result = await client.query(`
      SELECT dc.*, u.email as user_email, u.name as user_name
      FROM daily_checkins dc
      LEFT JOIN users u ON dc.user_id = u.id
      ORDER BY dc.date DESC
    `);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// Admin - toate mesajele de suport
app.get('/api/admin/support', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if admin
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Check if support_messages table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'support_messages'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Tabelul nu există, returnează array gol
      return res.json([]);
    }
    
    // Get all support messages
    const result = await client.query(`
      SELECT sm.*, u.email as user_email, u.name as user_name
      FROM support_messages sm
      LEFT JOIN users u ON sm.user_id = u.id
      ORDER BY sm.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching support messages:', error);
    // Returnează array gol dacă există erori (ex: tabelul nu există)
    res.json([]);
  } finally {
    client.release();
  }
});

// Admin - update support message
app.put('/api/admin/support/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if admin
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { admin_response, status } = req.body;
    
    const result = await client.query(`
      UPDATE support_messages 
      SET admin_response = $1, status = $2, responded_at = NOW(), responded_by = $3
      WHERE id = $4
      RETURNING *
    `, [admin_response, status, req.userId, req.params.id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating support message:', error);
    res.status(500).json({ error: 'Failed to update support message' });
  } finally {
    client.release();
  }
});

// Admin - toate înregistrările de greutate pentru TOȚI utilizatorii
app.get('/api/admin/weight-entries', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if admin
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await client.query(`
      SELECT * FROM weight_entries 
      ORDER BY user_id, date DESC
    `);
    
    res.json(result.rows);
  } finally {
    client.release();
  }
});

// Admin - șterge utilizator
app.delete('/api/admin/users/:userId', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if admin
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const targetUserId = parseInt(req.params.userId);
    
    // Nu permite ștergerea propriului cont
    if (targetUserId === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Șterge utilizatorul (CASCADE va șterge automat toate datele asociate)
    await client.query('DELETE FROM users WHERE id = $1', [targetUserId]);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } finally {
    client.release();
  }
});

// Admin: Create subscription code
app.post('/api/admin/codes', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if admin
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { code, tier, max_uses, expires_days } = req.body;
    
    const expiresAt = expires_days ? new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000) : null;
    
    const result = await client.query(`
      INSERT INTO subscription_codes (code, tier, max_uses, expires_at, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [code, tier, max_uses || 1, expiresAt, req.userId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Admin: Update user role
app.put('/api/admin/users/:id/role', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if admin
    const userResult = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { role } = req.body;
    
    await client.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, req.params.id]
    );
    
    res.json({ success: true });
  } finally {
    client.release();
  }
});

// ==================== BACKUP ENDPOINTS ====================

// Get countries list
app.get('/api/countries', async (req, res) => {
  try {
    const countriesPath = path.join(__dirname, 'countries.json');
    const data = await fs.readFile(countriesPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load countries' });
  }
});

// Create backup (manual)
app.post('/api/admin/backup', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userResult = await client.query('SELECT role FROM users WHERE id = $1', [req.userId]);
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const backup = await createBackup(req.userId, false);
    res.json(backup);
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// List all backups
app.get('/api/admin/backups', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userResult = await client.query('SELECT role FROM users WHERE id = $1', [req.userId]);
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const backups = await listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Delete backup
app.delete('/api/admin/backup/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userResult = await client.query('SELECT role FROM users WHERE id = $1', [req.userId]);
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await deleteBackup(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Start server - permite acces extern
const HOST = process.env.HOST || '0.0.0.0'; // Ascultă pe toate interfețele

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔐 CORS Origins: ${JSON.stringify(corsOrigins)}`);
  console.log(`💾 Backup automat: activat\n`);
  
  // Pornește sistemul de backup automat
  startAutomaticBackups();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n👋 SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n👋 SIGINT received, closing server...');
  await pool.end();
  process.exit(0);
});

