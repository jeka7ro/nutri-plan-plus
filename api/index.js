// Vercel Serverless Function wrapper pentru Express backend
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pool from '../server/database-pg.js';
import { registerUser, loginUser, authMiddleware, requireSubscription } from '../server/auth-pg.js';
import { createBackup, listBackups, deleteBackup, cleanupOldBackups, startAutomaticBackups } from '../server/backup-manager.js';
import { config } from '../server/config.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

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
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'vercel-serverless' });
});

// ==================== AUTH ENDPOINTS ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, country_code, country, city, date_of_birth } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await registerUser(email, password, name, phone, country_code, country, city, date_of_birth);
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
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
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Update user profile
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Build dynamic SQL update query
    const allowedFields = [
      'name', 'full_name', 'weight', 'height', 'age', 'gender', 
      'activity_level', 'target_weight', 'start_date', 'current_weight',
      'allergies', 'favorite_foods', 'is_vegetarian', 'is_vegan',
      'profile_picture_url', 'country', 'city'
    ];
    
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${valueIndex}
      RETURNING id, email, name, full_name, weight, height, age, gender, 
                activity_level, target_weight, start_date, current_weight,
                allergies, favorite_foods, is_vegetarian, is_vegan,
                profile_picture_url, country, city, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==================== RECIPES ENDPOINTS ====================

// Get all recipes
app.get('/api/recipes', authMiddleware, async (req, res) => {
  try {
    const { phase, meal_type } = req.query;
    
    let query = 'SELECT * FROM recipes WHERE 1=1';
    const values = [];
    let valueIndex = 1;
    
    if (phase) {
      query += ` AND phase = $${valueIndex}`;
      values.push(parseInt(phase));
      valueIndex++;
    }
    
    if (meal_type) {
      query += ` AND meal_type = $${valueIndex}`;
      values.push(meal_type);
      valueIndex++;
    }
    
    query += ' ORDER BY name_ro';
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get recipe by ID
app.get('/api/recipes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// ==================== DAILY CHECK-INS ENDPOINTS ====================

// Get all check-ins for user
app.get('/api/checkins', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM daily_checkins WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});

// Get check-in by date
app.get('/api/checkins/:date', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM daily_checkins WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Check-in not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get check-in error:', error);
    res.status(500).json({ error: 'Failed to fetch check-in' });
  }
});

// Create or update check-in (upsert)
app.post('/api/checkins', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const checkInData = { ...req.body, user_id: userId };
    
    // Prepare fields for upsert
    const fields = [
      'user_id', 'date', 'day_number', 'phase',
      'breakfast_option', 'breakfast_quantity', 'breakfast_calories', 'breakfast_completed',
      'snack1_option', 'snack1_quantity', 'snack1_calories', 'snack1_completed',
      'lunch_option', 'lunch_quantity', 'lunch_calories', 'lunch_completed',
      'snack2_option', 'snack2_quantity', 'snack2_calories', 'snack2_completed',
      'dinner_option', 'dinner_quantity', 'dinner_calories', 'dinner_completed',
      'water_intake', 'exercise_type', 'exercise_duration', 'exercise_calories_burned',
      'total_calories', 'notes'
    ];
    
    const values = fields.map(field => checkInData[field] !== undefined ? checkInData[field] : null);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const updateSet = fields
      .filter(f => f !== 'user_id' && f !== 'date')
      .map(f => `${f} = EXCLUDED.${f}`)
      .join(', ');
    
    const query = `
      INSERT INTO daily_checkins (${fields.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (user_id, date) 
      DO UPDATE SET ${updateSet}, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Upsert check-in error:', error);
    res.status(500).json({ error: 'Failed to save check-in' });
  }
});

// ==================== WEIGHT TRACKING ENDPOINTS ====================

// Get all weight entries for user
app.get('/api/weight', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM weight_entries WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get weight entries error:', error);
    res.status(500).json({ error: 'Failed to fetch weight entries' });
  }
});

// Add weight entry
app.post('/api/weight', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight, date, notes } = req.body;
    
    if (!weight || !date) {
      return res.status(400).json({ error: 'Weight and date are required' });
    }
    
    const result = await pool.query(
      `INSERT INTO weight_entries (user_id, weight, date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, weight, date, notes || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add weight entry error:', error);
    res.status(500).json({ error: 'Failed to add weight entry' });
  }
});

// Delete weight entry
app.delete('/api/weight/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM weight_entries WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weight entry not found' });
    }
    
    res.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    console.error('Delete weight entry error:', error);
    res.status(500).json({ error: 'Failed to delete weight entry' });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all users (admin only)
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'jeka7ro@gmail.com' && !req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.name, u.full_name, u.weight, u.height, u.age, u.gender,
        u.activity_level, u.target_weight, u.start_date, u.current_weight,
        u.allergies, u.favorite_foods, u.is_vegetarian, u.is_vegan,
        u.profile_picture_url, u.country, u.city, u.subscription_tier, u.subscription_expires_at,
        u.created_at, u.updated_at, u.last_login_at,
        (SELECT COUNT(*) FROM daily_checkins WHERE user_id = u.id) as total_checkins,
        (SELECT COUNT(*) FROM weight_entries WHERE user_id = u.id) as total_weight_entries
      FROM users u
      ORDER BY u.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'jeka7ro@gmail.com' && !req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    // Delete user and all related data (cascading)
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, deleted_user: result.rows[0].email });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==================== BACKUP ENDPOINTS ====================

// Create backup (admin only)
app.post('/api/admin/backups', authMiddleware, async (req, res) => {
  try {
    if (req.user.email !== 'jeka7ro@gmail.com' && !req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const backup = await createBackup();
    res.json(backup);
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// List backups (admin only)
app.get('/api/admin/backups', authMiddleware, async (req, res) => {
  try {
    if (req.user.email !== 'jeka7ro@gmail.com' && !req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const backups = await listBackups();
    res.json(backups);
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Delete backup (admin only)
app.delete('/api/admin/backups/:filename', authMiddleware, async (req, res) => {
  try {
    if (req.user.email !== 'jeka7ro@gmail.com' && !req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { filename } = req.params;
    await deleteBackup(filename);
    res.json({ success: true, deleted: filename });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Export Express app as Vercel serverless function
export default app;

