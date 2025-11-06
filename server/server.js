import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db, { initDatabase } from './database.js';
import { registerUser, loginUser, authMiddleware } from './auth.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Cresc limita pentru poze
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
initDatabase();

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
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare(`
    SELECT id, email, name, role, start_date, birth_date, current_weight, target_weight, 
           height, age, gender, activity_level, dietary_preferences, allergies, profile_picture
    FROM users WHERE id = ?
  `).get(req.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// Update user profile
app.put('/api/auth/me', authMiddleware, (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = ['name', 'start_date', 'birth_date', 'current_weight', 'target_weight', 
                          'height', 'age', 'gender', 'activity_level', 
                          'dietary_preferences', 'allergies', 'profile_picture'];
    
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(...values, req.userId);
    
    // Return updated user
    const user = db.prepare(`
      SELECT id, email, name, role, start_date, birth_date, current_weight, target_weight, 
             height, age, gender, activity_level, dietary_preferences, allergies
      FROM users WHERE id = ?
    `).get(req.userId);
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEIGHT TRACKING ENDPOINTS ====================

// Get weight entries
app.get('/api/weight', authMiddleware, (req, res) => {
  const entries = db.prepare(`
    SELECT * FROM weight_entries 
    WHERE user_id = ? 
    ORDER BY date DESC
  `).all(req.userId);
  
  res.json(entries);
});

// Add weight entry
app.post('/api/weight', authMiddleware, (req, res) => {
  const { weight, date, notes } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO weight_entries (user_id, weight, date, notes)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(req.userId, weight, date || new Date().toISOString(), notes);
  const entry = db.prepare('SELECT * FROM weight_entries WHERE id = ?').get(result.lastInsertRowid);
  
  res.json(entry);
});

// Delete weight entry
app.delete('/api/weight/:id', authMiddleware, (req, res) => {
  const stmt = db.prepare('DELETE FROM weight_entries WHERE id = ? AND user_id = ?');
  stmt.run(req.params.id, req.userId);
  res.json({ success: true });
});

// ==================== DAILY MEALS ENDPOINTS ====================

// Get meals for a specific day
app.get('/api/meals/day/:day', authMiddleware, (req, res) => {
  const meals = db.prepare(`
    SELECT * FROM daily_meals 
    WHERE user_id = ? AND day = ?
    ORDER BY meal_type
  `).all(req.userId, req.params.day);
  
  res.json(meals);
});

// Get all meals for user
app.get('/api/meals', authMiddleware, (req, res) => {
  const meals = db.prepare(`
    SELECT * FROM daily_meals 
    WHERE user_id = ?
    ORDER BY day, meal_type
  `).all(req.userId);
  
  res.json(meals);
});

// Add/Update meal
app.post('/api/meals', authMiddleware, (req, res) => {
  const { day, meal_type, name, calories, protein, carbs, fats, completed, date } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO daily_meals (user_id, day, meal_type, name, calories, protein, carbs, fats, completed, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(req.userId, day, meal_type, name, calories, protein, carbs, fats, completed ? 1 : 0, date);
  const meal = db.prepare('SELECT * FROM daily_meals WHERE id = ?').get(result.lastInsertRowid);
  
  res.json(meal);
});

// Update meal completion
app.put('/api/meals/:id', authMiddleware, (req, res) => {
  const { completed } = req.body;
  
  const stmt = db.prepare(`
    UPDATE daily_meals 
    SET completed = ?
    WHERE id = ? AND user_id = ?
  `);
  
  stmt.run(completed ? 1 : 0, req.params.id, req.userId);
  const meal = db.prepare('SELECT * FROM daily_meals WHERE id = ?').get(req.params.id);
  
  res.json(meal);
});

// Delete meal
app.delete('/api/meals/:id', authMiddleware, (req, res) => {
  const stmt = db.prepare('DELETE FROM daily_meals WHERE id = ? AND user_id = ?');
  stmt.run(req.params.id, req.userId);
  res.json({ success: true });
});

// ==================== RECIPES ENDPOINTS ====================

// Get all recipes (public + user's own)
app.get('/api/recipes', authMiddleware, (req, res) => {
  const recipes = db.prepare(`
    SELECT * FROM recipes 
    WHERE is_public = 1 OR user_id = ?
    ORDER BY created_at DESC
  `).all(req.userId);
  
  // Parse JSON fields
  const parsedRecipes = recipes.map(recipe => ({
    ...recipe,
    ingredients_ro: recipe.ingredients_ro ? JSON.parse(recipe.ingredients_ro) : [],
    ingredients_en: recipe.ingredients_en ? JSON.parse(recipe.ingredients_en) : [],
    tags: recipe.tags ? JSON.parse(recipe.tags) : [],
    allergens: recipe.allergens ? JSON.parse(recipe.allergens) : []
  }));
  
  res.json(parsedRecipes);
});

// Get single recipe
app.get('/api/recipes/:id', authMiddleware, (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  
  res.json(recipe);
});

// Create recipe
app.post('/api/recipes', authMiddleware, (req, res) => {
  const { name, description, ingredients, instructions, calories, protein, carbs, fats, 
          prep_time, cook_time, servings, image_url, is_public } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO recipes (user_id, name, description, ingredients, instructions, 
                        calories, protein, carbs, fats, prep_time, cook_time, 
                        servings, image_url, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(req.userId, name, description, ingredients, instructions,
                         calories, protein, carbs, fats, prep_time, cook_time,
                         servings, image_url, is_public ? 1 : 0);
  
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(result.lastInsertRowid);
  res.json(recipe);
});

// Update recipe
app.put('/api/recipes/:id', authMiddleware, (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  
  if (!recipe || recipe.user_id !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const updates = req.body;
  const allowedFields = ['name', 'description', 'ingredients', 'instructions', 
                        'calories', 'protein', 'carbs', 'fats', 'prep_time', 
                        'cook_time', 'servings', 'image_url', 'is_public'];
  
  const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updates[field]);
  
  const stmt = db.prepare(`UPDATE recipes SET ${setClause} WHERE id = ?`);
  stmt.run(...values, req.params.id);
  
  const updatedRecipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  res.json(updatedRecipe);
});

// Delete recipe
app.delete('/api/recipes/:id', authMiddleware, (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  
  if (!recipe || recipe.user_id !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ==================== DAILY CHECK-INS ENDPOINTS ====================

// Get check-in for specific date
app.get('/api/checkins/:date', authMiddleware, (req, res) => {
  const checkIn = db.prepare(`
    SELECT * FROM daily_checkins 
    WHERE user_id = ? AND date = ?
  `).get(req.userId, req.params.date);
  
  res.json(checkIn || null);
});

// Get all check-ins for user
app.get('/api/checkins', authMiddleware, (req, res) => {
  const checkIns = db.prepare(`
    SELECT * FROM daily_checkins 
    WHERE user_id = ?
    ORDER BY date DESC
  `).all(req.userId);
  
  res.json(checkIns);
});

// Helper to convert boolean to SQLite integer
const boolToInt = (val) => val === true ? 1 : (val === false ? 0 : (val || 0));

// Create or update check-in
app.post('/api/checkins', authMiddleware, (req, res) => {
  try {
    const data = req.body;
    const date = data.date || new Date().toISOString().split('T')[0];
    
    // Check if check-in already exists
    const existing = db.prepare(`
      SELECT * FROM daily_checkins WHERE user_id = ? AND date = ?
    `).get(req.userId, date);
    
    if (existing) {
      // Update existing check-in - CONVERT BOOLEANS TO INTEGERS
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
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      // Convert booleans to integers
      const values = fields.map(field => {
        const value = data[field];
        if (field.endsWith('_completed')) {
          return boolToInt(value);
        }
        return value === null ? null : value;
      });
      
      if (fields.length > 0) {
        const stmt = db.prepare(`
          UPDATE daily_checkins 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        stmt.run(...values, existing.id);
      }
      
      const updated = db.prepare('SELECT * FROM daily_checkins WHERE id = ?').get(existing.id);
      res.json(updated);
    } else {
      // Create new check-in - CONVERT BOOLEANS TO INTEGERS
      const stmt = db.prepare(`
        INSERT INTO daily_checkins (
          user_id, date, day_number, phase,
          breakfast_completed, breakfast_option, breakfast_image, breakfast_calories, breakfast_quantity,
          snack1_completed, snack1_option, snack1_image, snack1_calories, snack1_quantity,
          lunch_completed, lunch_option, lunch_image, lunch_calories, lunch_quantity,
          snack2_completed, snack2_option, snack2_image, snack2_calories, snack2_quantity,
          dinner_completed, dinner_option, dinner_image, dinner_calories, dinner_quantity,
          exercise_completed, exercise_type, exercise_duration, exercise_calories_burned,
          water_intake, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        req.userId, date, data.day_number || null, data.phase || null,
        boolToInt(data.breakfast_completed), data.breakfast_option || null, data.breakfast_image || null, 
        data.breakfast_calories || null, data.breakfast_quantity || 1,
        boolToInt(data.snack1_completed), data.snack1_option || null, data.snack1_image || null,
        data.snack1_calories || null, data.snack1_quantity || 1,
        boolToInt(data.lunch_completed), data.lunch_option || null, data.lunch_image || null,
        data.lunch_calories || null, data.lunch_quantity || 1,
        boolToInt(data.snack2_completed), data.snack2_option || null, data.snack2_image || null,
        data.snack2_calories || null, data.snack2_quantity || 1,
        boolToInt(data.dinner_completed), data.dinner_option || null, data.dinner_image || null,
        data.dinner_calories || null, data.dinner_quantity || 1,
        boolToInt(data.exercise_completed), data.exercise_type || null, data.exercise_duration || null,
        data.exercise_calories_burned || null,
        data.water_intake || 0, data.notes || null
      );
      
      const newCheckIn = db.prepare('SELECT * FROM daily_checkins WHERE id = ?').get(result.lastInsertRowid);
      res.json(newCheckIn);
    }
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROGRESS NOTES ENDPOINTS ====================

// Get progress notes
app.get('/api/progress', authMiddleware, (req, res) => {
  const notes = db.prepare(`
    SELECT * FROM progress_notes 
    WHERE user_id = ?
    ORDER BY date DESC
  `).all(req.userId);
  
  res.json(notes);
});

// Add progress note
app.post('/api/progress', authMiddleware, (req, res) => {
  const { date, note, mood, energy_level } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO progress_notes (user_id, date, note, mood, energy_level)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(req.userId, date, note, mood, energy_level);
  const entry = db.prepare('SELECT * FROM progress_notes WHERE id = ?').get(result.lastInsertRowid);
  
  res.json(entry);
});

// ==================== FRIENDS ENDPOINTS ====================

// Get all users (for finding friends)
app.get('/api/users', authMiddleware, (req, res) => {
  const users = db.prepare(`
    SELECT id, email, name, role
    FROM users 
    WHERE id != ?
    ORDER BY name
  `).all(req.userId);
  
  res.json(users);
});

// Get friends
app.get('/api/friends', authMiddleware, (req, res) => {
  const friends = db.prepare(`
    SELECT u.id, u.email, u.name, f.status
    FROM friendships f
    JOIN users u ON (f.friend_id = u.id)
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(req.userId);
  
  res.json(friends);
});

// Send friend request
app.post('/api/friends', authMiddleware, (req, res) => {
  const { friend_id } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO friendships (user_id, friend_id, status)
    VALUES (?, ?, 'pending')
  `);
  
  const result = stmt.run(req.userId, friend_id);
  res.json({ success: true, id: result.lastInsertRowid });
});

// ==================== MESSAGES ENDPOINTS ====================

// Get messages
app.get('/api/messages', authMiddleware, (req, res) => {
  const messages = db.prepare(`
    SELECT m.*, 
           u1.name as from_name, u1.email as from_email,
           u2.name as to_name, u2.email as to_email
    FROM messages m
    JOIN users u1 ON m.from_user_id = u1.id
    JOIN users u2 ON m.to_user_id = u2.id
    WHERE m.to_user_id = ? OR m.from_user_id = ?
    ORDER BY m.created_at DESC
  `).all(req.userId, req.userId);
  
  res.json(messages);
});

// Send message
app.post('/api/messages', authMiddleware, (req, res) => {
  const { to_user_id, message } = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO messages (from_user_id, to_user_id, message)
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(req.userId, to_user_id, message);
  const newMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  
  res.json(newMessage);
});

// Mark message as read
app.put('/api/messages/:id/read', authMiddleware, (req, res) => {
  db.prepare('UPDATE messages SET read = 1 WHERE id = ? AND to_user_id = ?')
    .run(req.params.id, req.userId);
  
  res.json({ success: true });
});

// ==================== ADMIN ENDPOINTS ====================

// Get all users (admin only)
app.get('/api/admin/users', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId);
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const users = db.prepare(`
    SELECT id, email, name, role, start_date, current_weight, target_weight, created_at
    FROM users
    ORDER BY created_at DESC
  `).all();
  
  res.json(users);
});

// Update user role (admin only)
app.put('/api/admin/users/:id/role', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId);
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { role } = req.body;
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  
  res.json({ success: true });
});

// ==================== SEED DATA ====================

// Endpoint pentru a popula date de test
app.post('/api/seed', async (req, res) => {
  try {
    // Check if data already exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    if (userCount.count > 0) {
      return res.json({ message: 'Database already has data' });
    }
    
    // Create admin user
    const adminResult = await registerUser('admin@nutriplan.com', 'admin123', 'Admin User');
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', adminResult.user.id);
    
    // Create test users
    await registerUser('test@nutriplan.com', 'test123', 'Test User');
    await registerUser('maria@nutriplan.com', 'maria123', 'Maria Popescu');
    
    // Add some sample recipes
    const sampleRecipes = [
      {
        name: 'Salată Caesar cu Pui',
        description: 'Salată clasică Caesar cu piept de pui la grătar',
        ingredients: JSON.stringify(['Piept de pui', 'Salată verde', 'Parmezan', 'Crutoane', 'Sos Caesar']),
        instructions: 'Gătește pieptul de pui la grătar. Amestecă salata cu sosul Caesar. Adaugă parmezanul și crutoanele.',
        calories: 350,
        protein: 35,
        carbs: 20,
        fats: 15,
        prep_time: 15,
        cook_time: 20,
        servings: 2,
        image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
        is_public: 1
      },
      {
        name: 'Smoothie Verde Detox',
        description: 'Smoothie nutritiv cu spanac și fructe',
        ingredients: JSON.stringify(['Spanac proaspăt', 'Banană', 'Măr verde', 'Ghimbir', 'Apă de cocos']),
        instructions: 'Pune toate ingredientele în blender și mixează până obții o consistență omogenă.',
        calories: 180,
        protein: 5,
        carbs: 35,
        fats: 3,
        prep_time: 5,
        cook_time: 0,
        servings: 1,
        image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800',
        is_public: 1
      }
    ];
    
    for (const recipe of sampleRecipes) {
      const stmt = db.prepare(`
        INSERT INTO recipes (user_id, name, description, ingredients, instructions,
                           calories, protein, carbs, fats, prep_time, cook_time,
                           servings, image_url, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(null, recipe.name, recipe.description, recipe.ingredients, recipe.instructions,
               recipe.calories, recipe.protein, recipe.carbs, recipe.fats,
               recipe.prep_time, recipe.cook_time, recipe.servings, recipe.image_url, recipe.is_public);
    }
    
    res.json({ 
      message: 'Database seeded successfully',
      users: {
        admin: { email: 'admin@nutriplan.com', password: 'admin123' },
        test: { email: 'test@nutriplan.com', password: 'test123' },
        maria: { email: 'maria@nutriplan.com', password: 'maria123' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 Nutri Plan Plus Server                           ║
║                                                        ║
║   Server running on: http://localhost:${PORT}            ║
║                                                        ║
║   Endpoints:                                           ║
║   - POST /api/auth/register                            ║
║   - POST /api/auth/login                               ║
║   - GET  /api/auth/me                                  ║
║   - POST /api/seed (populate test data)                ║
║                                                        ║
║   Test Users:                                          ║
║   • admin@nutriplan.com / admin123                     ║
║   • test@nutriplan.com / test123                       ║
║   • maria@nutriplan.com / maria123                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

export default app;

