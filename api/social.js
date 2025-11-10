// COMBINED ENDPOINT - Friends + User Recipes + Notifications
// To stay within Vercel's 12 function limit
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verifică autentificarea
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { type } = req.query; // type = 'friends' | 'recipes' | 'notifications' | 'food'
  
  // ========== FRIENDS ==========
  if (type === 'friends') {
    return handleFriends(req, res, pool, userId);
  }
  
  // ========== USER RECIPES ==========
  if (type === 'recipes') {
    return handleUserRecipes(req, res, pool, userId);
  }
  
  // ========== NOTIFICATIONS ==========
  if (type === 'notifications') {
    return handleNotifications(req, res, pool, userId);
  }
  
  // ========== FOOD DATABASE ==========
  if (type === 'food') {
    return handleFoodDatabase(req, res, pool, userId);
  }
  
  return res.status(400).json({ error: 'Missing or invalid type parameter. Use ?type=friends|recipes|notifications|food' });
}

// ==================== FRIENDS HANDLER ====================
async function handleFriends(req, res, pool, userId) {
  // Ensure tables exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sender_id, receiver_id)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id_1 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_id_2 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id_1, user_id_2),
        CHECK (user_id_1 < user_id_2)
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friends_users ON friends(user_id_1, user_id_2)`);
  } catch (error) {
    console.error('❌ Error creating friend tables:', error);
  }
  
  // GET ?search=email
  if (req.method === 'GET' && req.query.search) {
    const { search } = req.query;
    
    try {
      const result = await pool.query(`
        SELECT id, first_name, last_name, email, profile_picture
        FROM users
        WHERE email ILIKE $1 AND id != $2
        LIMIT 20
      `, [`%${search}%`, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No users found' });
      }
      
      const usersWithStatus = await Promise.all(result.rows.map(async (user) => {
        const friendCheck = await pool.query(`
          SELECT id FROM friends 
          WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)
        `, [Math.min(userId, user.id), Math.max(userId, user.id)]);
        
        if (friendCheck.rows.length > 0) {
          return { ...user, status: 'friends' };
        }
        
        const requestCheck = await pool.query(`
          SELECT id, sender_id FROM friend_requests 
          WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)) AND status = 'pending'
        `, [userId, user.id]);
        
        if (requestCheck.rows.length > 0) {
          const isSentByMe = requestCheck.rows[0].sender_id === userId;
          return { ...user, status: isSentByMe ? 'pending_sent' : 'pending_received' };
        }
        
        return { ...user, status: 'none' };
      }));
      
      return res.status(200).json(usersWithStatus);
    } catch (error) {
      console.error('❌ Search users error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET ?requests=true
  if (req.method === 'GET' && req.query.requests === 'true') {
    try {
      const received = await pool.query(`
        SELECT fr.id, fr.status, fr.created_at, u.id as user_id, u.first_name, u.last_name, u.email, u.profile_picture, 'received' as type
        FROM friend_requests fr
        JOIN users u ON fr.sender_id = u.id
        WHERE fr.receiver_id = $1 AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
      `, [userId]);
      
      const sent = await pool.query(`
        SELECT fr.id, fr.status, fr.created_at, u.id as user_id, u.first_name, u.last_name, u.email, u.profile_picture, 'sent' as type
        FROM friend_requests fr
        JOIN users u ON fr.receiver_id = u.id
        WHERE fr.sender_id = $1 AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
      `, [userId]);
      
      return res.status(200).json({ received: received.rows, sent: sent.rows });
    } catch (error) {
      console.error('❌ Friend requests GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET ?progress=true - Friends progress (PRIVACY: doar % weight loss!)
  if (req.method === 'GET' && req.query.progress === 'true') {
    try {
      // Get friends list with profile pictures
      const friendsResult = await pool.query(`
        SELECT 
          CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END as friend_id,
          CASE WHEN f.user_id_1 = $1 THEN u2.first_name ELSE u1.first_name END as first_name,
          CASE WHEN f.user_id_1 = $1 THEN u2.last_name ELSE u1.last_name END as last_name,
          CASE WHEN f.user_id_1 = $1 THEN u2.email ELSE u1.email END as email,
          CASE WHEN f.user_id_1 = $1 THEN u2.profile_picture ELSE u1.profile_picture END as profile_picture
        FROM friends f
        LEFT JOIN users u1 ON f.user_id_1 = u1.id
        LEFT JOIN users u2 ON f.user_id_2 = u2.id
        WHERE f.user_id_1 = $1 OR f.user_id_2 = $1
      `, [userId]);
      
      const friendsProgress = await Promise.all(friendsResult.rows.map(async (friend) => {
        // Calculate weight loss % (PRIVACY: doar %, NU kg absolute!)
        const weightResult = await pool.query(`
          SELECT weight FROM weight_entries 
          WHERE user_id = $1 
          ORDER BY date DESC 
          LIMIT 7
        `, [friend.friend_id]);
        
        let weight_loss_percent = null;
        if (weightResult.rows.length >= 2) {
          const latest = parseFloat(weightResult.rows[0].weight);
          const oldest = parseFloat(weightResult.rows[weightResult.rows.length - 1].weight);
          weight_loss_percent = ((oldest - latest) / oldest) * 100; // Pozitiv = pierdere
        }
        
        // Count meals completed (last 7 days)
        const mealsResult = await pool.query(`
          SELECT 
            COALESCE(SUM(
              CAST(breakfast_completed AS INTEGER) +
              CAST(snack1_completed AS INTEGER) +
              CAST(lunch_completed AS INTEGER) +
              CAST(snack2_completed AS INTEGER) +
              CAST(dinner_completed AS INTEGER)
            ), 0) as meals_completed
          FROM daily_checkins
          WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'
        `, [friend.friend_id]);
        
        // Sum calories burned (last 7 days)
        const caloriesResult = await pool.query(`
          SELECT COALESCE(SUM(exercise_calories_burned), 0) as calories_burned
          FROM daily_checkins
          WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'
        `, [friend.friend_id]);
        
        // Get recent recipes (last 3)
        const recipesResult = await pool.query(`
          SELECT DISTINCT 
            COALESCE(breakfast_option, snack1_option, lunch_option, snack2_option, dinner_option) as recipe_id
          FROM daily_checkins
          WHERE user_id = $1 
            AND (breakfast_option IS NOT NULL OR snack1_option IS NOT NULL OR lunch_option IS NOT NULL OR snack2_option IS NOT NULL OR dinner_option IS NOT NULL)
          ORDER BY date DESC
          LIMIT 3
        `, [friend.friend_id]);
        
        // Fetch recipe details (from user_recipes or standard recipes)
        const recentRecipes = [];
        for (const row of recipesResult.rows) {
          if (row.recipe_id) {
            const userRecipe = await pool.query(`
              SELECT name, name_ro FROM user_recipes WHERE id = $1
            `, [row.recipe_id]);
            
            if (userRecipe.rows.length > 0) {
              recentRecipes.push(userRecipe.rows[0]);
            }
          }
        }
        
        return {
          id: friend.friend_id,
          first_name: friend.first_name,
          last_name: friend.last_name,
          email: friend.email,
          profile_picture: friend.profile_picture,
          weight_loss_percent: weight_loss_percent,
          meals_completed: mealsResult.rows[0]?.meals_completed || 0,
          calories_burned: caloriesResult.rows[0]?.calories_burned || 0,
          recent_recipes: recentRecipes,
        };
      }));
      
      return res.status(200).json(friendsProgress);
    } catch (error) {
      console.error('❌ Friends progress GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET - List friends
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT f.id,
          CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END as friend_id,
          CASE WHEN f.user_id_1 = $1 THEN u2.first_name ELSE u1.first_name END as first_name,
          CASE WHEN f.user_id_1 = $1 THEN u2.last_name ELSE u1.last_name END as last_name,
          CASE WHEN f.user_id_1 = $1 THEN u2.email ELSE u1.email END as email,
          CASE WHEN f.user_id_1 = $1 THEN u2.profile_picture ELSE u1.profile_picture END as profile_picture,
          f.created_at
        FROM friends f
        LEFT JOIN users u1 ON f.user_id_1 = u1.id
        LEFT JOIN users u2 ON f.user_id_2 = u2.id
        WHERE f.user_id_1 = $1 OR f.user_id_2 = $1
        ORDER BY f.created_at DESC
      `, [userId]);
      
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Friends GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT - Accept/Reject request
  if (req.method === 'PUT') {
    const { requestId, action } = req.body;
    
    if (!requestId || !action) {
      return res.status(400).json({ error: 'Request ID and action required' });
    }
    
    try {
      const requestResult = await pool.query(
        'SELECT * FROM friend_requests WHERE id = $1 AND receiver_id = $2',
        [requestId, userId]
      );
      
      if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      
      const request = requestResult.rows[0];
      
      if (action === 'accept') {
        await pool.query(
          'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['accepted', requestId]
        );
        
        const userId1 = Math.min(request.sender_id, request.receiver_id);
        const userId2 = Math.max(request.sender_id, request.receiver_id);
        
        await pool.query(`
          INSERT INTO friends (user_id_1, user_id_2)
          VALUES ($1, $2)
          ON CONFLICT (user_id_1, user_id_2) DO NOTHING
        `, [userId1, userId2]);
        
        // Create notification
        const receiverData = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
        const receiverName = receiverData.rows[0]?.first_name && receiverData.rows[0]?.last_name 
          ? `${receiverData.rows[0].first_name} ${receiverData.rows[0].last_name}` 
          : 'Cineva';
        
        await pool.query(`
          INSERT INTO notifications (user_id, type, related_user_id, message, action_url)
          VALUES ($1, $2, $3, $4, $5)
        `, [request.sender_id, 'friend_accepted', userId, `${receiverName} a acceptat cererea ta de prietenie`, '/friends']);
        
        return res.status(200).json({ success: true, action: 'accepted' });
        
      } else if (action === 'reject') {
        await pool.query(
          'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['rejected', requestId]
        );
        
        return res.status(200).json({ success: true, action: 'rejected' });
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('❌ Friend request PUT error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // POST - Send friend request
  if (req.method === 'POST') {
    const { friendEmail } = req.body;
    
    if (!friendEmail) {
      return res.status(400).json({ error: 'Friend email required' });
    }
    
    try {
      const friendResult = await pool.query(
        'SELECT id, first_name, last_name, email FROM users WHERE email = $1',
        [friendEmail]
      );
      
      if (friendResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const friendId = friendResult.rows[0].id;
      
      if (friendId === userId) {
        return res.status(400).json({ error: 'Cannot add yourself as friend' });
      }
      
      const existingRequest = await pool.query(
        'SELECT id, status FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)',
        [userId, friendId]
      );
      
      if (existingRequest.rows.length > 0) {
        return res.status(400).json({ error: 'Request already exists' });
      }
      
      const result = await pool.query(`
        INSERT INTO friend_requests (sender_id, receiver_id, status)
        VALUES ($1, $2, 'pending')
        RETURNING *
      `, [userId, friendId]);
      
      // Create notification
      const senderData = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
      const senderName = senderData.rows[0]?.first_name && senderData.rows[0]?.last_name 
        ? `${senderData.rows[0].first_name} ${senderData.rows[0].last_name}` 
        : 'Cineva';
      
      await pool.query(`
        INSERT INTO notifications (user_id, type, related_user_id, message, action_url)
        VALUES ($1, $2, $3, $4, $5)
      `, [friendId, 'friend_request', userId, `${senderName} ți-a trimis o cerere de prietenie`, '/friends']);
      
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ Friend request POST error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // DELETE - Remove friend
  if (req.method === 'DELETE') {
    const friendshipId = req.query.id;
    
    try {
      await pool.query(
        'DELETE FROM friends WHERE id = $1 AND (user_id_1 = $2 OR user_id_2 = $2)',
        [friendshipId, userId]
      );
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Friend DELETE error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// ==================== USER RECIPES HANDLER ====================
async function handleUserRecipes(req, res, pool, userId) {
  // Ensure table exists
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_recipes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        name_ro VARCHAR(255),
        description TEXT,
        image_url TEXT,
        meal_type VARCHAR(50) NOT NULL,
        phase INTEGER,
        calories INTEGER DEFAULT 0,
        protein INTEGER DEFAULT 0,
        carbs INTEGER DEFAULT 0,
        fat INTEGER DEFAULT 0,
        is_public_to_friends BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Adaugă coloana phases (array) dacă nu există
    try {
      await pool.query(`ALTER TABLE user_recipes ADD COLUMN IF NOT EXISTS phases INTEGER[]`);
      
      // Migrează valorile existente din phase la phases
      await pool.query(`
        UPDATE user_recipes 
        SET phases = ARRAY[phase] 
        WHERE phase IS NOT NULL AND (phases IS NULL OR phases = '{}')
      `);
    } catch (error) {
      console.log('⚠️ Phases column might already exist or migration already done');
    }
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_recipes_user ON user_recipes(user_id)`);
  } catch (error) {
    console.error('❌ Error creating user_recipes table:', error);
  }
  
  // GET ?friends=true
  if (req.method === 'GET' && req.query.friends === 'true') {
    try {
      const result = await pool.query(`
        SELECT ur.*, u.first_name as author_first_name, u.last_name as author_last_name, u.email as author_email
        FROM user_recipes ur
        JOIN users u ON ur.user_id = u.id
        JOIN friends f ON (
          (f.user_id_1 = $1 AND f.user_id_2 = ur.user_id) OR
          (f.user_id_2 = $1 AND f.user_id_1 = ur.user_id)
        )
        WHERE ur.is_public_to_friends = TRUE
        ORDER BY ur.created_at DESC
      `, [userId]);
      
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Friend recipes GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET - My recipes
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT * FROM user_recipes 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId]);
      
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ User recipes GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // POST - Create recipe
  if (req.method === 'POST') {
    const { name, name_ro, description, image_url, meal_type, phase, phases, calories, protein, carbs, fat, is_public_to_friends } = req.body;
    
    if (!name || !meal_type) {
      return res.status(400).json({ error: 'Name and meal_type required' });
    }
    
    try {
      const result = await pool.query(`
        INSERT INTO user_recipes (
          user_id, name, name_ro, description, image_url, meal_type, phase, phases,
          calories, protein, carbs, fat, is_public_to_friends
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        userId, name, name_ro || name, description || '', image_url || null, meal_type, 
        phase || null, phases || null,
        calories || 0, protein || 0, carbs || 0, fat || 0, is_public_to_friends || false
      ]);
      
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ User recipe POST error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT - Update recipe
  if (req.method === 'PUT') {
    const { id, name, name_ro, description, image_url, meal_type, phase, phases, calories, protein, carbs, fat, is_public_to_friends } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Recipe ID required' });
    }
    
    try {
      const result = await pool.query(`
        UPDATE user_recipes SET
          name = COALESCE($1, name),
          name_ro = COALESCE($2, name_ro),
          description = COALESCE($3, description),
          image_url = COALESCE($4, image_url),
          meal_type = COALESCE($5, meal_type),
          phase = COALESCE($6, phase),
          phases = COALESCE($7, phases),
          calories = COALESCE($8, calories),
          protein = COALESCE($9, protein),
          carbs = COALESCE($10, carbs),
          fat = COALESCE($11, fat),
          is_public_to_friends = COALESCE($12, is_public_to_friends),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $13 AND user_id = $14
        RETURNING *
      `, [name, name_ro, description, image_url, meal_type, phase, phases, calories, protein, carbs, fat, is_public_to_friends, id, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Recipe not found or not owned by you' });
      }
      
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ User recipe PUT error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // DELETE - Delete recipe
  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    try {
      await pool.query(
        'DELETE FROM user_recipes WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ User recipe DELETE error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// ==================== NOTIFICATIONS HANDLER ====================
async function handleNotifications(req, res, pool, userId) {
  // Ensure table exists
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        related_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        related_recipe_id INTEGER,
        message TEXT NOT NULL,
        action_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read)`);
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
  }
  
  // GET ?unread=true
  if (req.method === 'GET' && req.query.unread === 'true') {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
        [userId]
      );
      
      return res.status(200).json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
      console.error('❌ Notifications unread count error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET - List notifications
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT n.*, u.first_name as related_user_first_name, u.last_name as related_user_last_name,
               u.email as related_user_email, u.profile_picture as related_user_picture
        FROM notifications n
        LEFT JOIN users u ON n.related_user_id = u.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT 50
      `, [userId]);
      
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Notifications GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT ?readAll=true
  if (req.method === 'PUT' && req.query.readAll === 'true') {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
        [userId]
      );
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Notifications mark all read error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT ?id=X
  if (req.method === 'PUT' && req.query.id) {
    const { id } = req.query;
    
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Notification mark read error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

