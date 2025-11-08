// REAL ENDPOINT - Rețete personalizate utilizatori
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

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
  
  // Creează tabela dacă nu există
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
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_recipes_user ON user_recipes(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_recipes_public ON user_recipes(is_public_to_friends)`);
  } catch (error) {
    console.error('❌ Error creating user_recipes table:', error);
  }
  
  // GET ?friends=true - Rețete publice ale prietenilor
  if (req.method === 'GET' && req.query.friends === 'true') {
    try {
      const result = await pool.query(`
        SELECT 
          ur.*,
          u.first_name as author_first_name,
          u.last_name as author_last_name,
          u.email as author_email
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
  
  // GET - Rețetele MELE
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
  
  // POST - Creează rețetă nouă
  if (req.method === 'POST') {
    const { name, name_ro, description, image_url, meal_type, phase, calories, protein, carbs, fat, is_public_to_friends } = req.body;
    
    if (!name || !meal_type) {
      return res.status(400).json({ error: 'Name and meal_type required' });
    }
    
    try {
      const result = await pool.query(`
        INSERT INTO user_recipes (
          user_id, name, name_ro, description, image_url, meal_type, phase,
          calories, protein, carbs, fat, is_public_to_friends
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        userId,
        name,
        name_ro || name,
        description || '',
        image_url || null,
        meal_type,
        phase || null,
        calories || 0,
        protein || 0,
        carbs || 0,
        fat || 0,
        is_public_to_friends || false
      ]);
      
      console.log('✅ User recipe created:', result.rows[0]);
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ User recipe POST error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT - Editează rețetă
  if (req.method === 'PUT') {
    const { id, name, name_ro, description, image_url, meal_type, phase, calories, protein, carbs, fat, is_public_to_friends } = req.body;
    
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
          calories = COALESCE($7, calories),
          protein = COALESCE($8, protein),
          carbs = COALESCE($9, carbs),
          fat = COALESCE($10, fat),
          is_public_to_friends = COALESCE($11, is_public_to_friends),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12 AND user_id = $13
        RETURNING *
      `, [name, name_ro, description, image_url, meal_type, phase, calories, protein, carbs, fat, is_public_to_friends, id, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Recipe not found or not owned by you' });
      }
      
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ User recipe PUT error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // DELETE - Șterge rețetă
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

