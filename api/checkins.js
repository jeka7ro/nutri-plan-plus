// REAL ENDPOINT - salvează în PostgreSQL
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verifică autentificarea
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('🔍 CHECKINS - Token received:', !!token, token?.substring(0, 20) + '...');
  
  if (!token) {
    console.log('❌ CHECKINS - No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
    console.log('✅ CHECKINS - Token valid, userId:', userId);
  } catch (error) {
    console.log('❌ CHECKINS - Invalid token:', error.message);
    return res.status(401).json({ error: 'Invalid token', details: error.message });
  }
  
  if (req.method === 'POST') {
    // UPSERT check-in (INSERT sau UPDATE dacă există deja)
    const data = req.body;
    const date = data.date || new Date().toISOString().split('T')[0];
    
    try {
      // Adaugă coloana exercises dacă nu există
      try {
        await pool.query(`
          ALTER TABLE daily_checkins 
          ADD COLUMN IF NOT EXISTS exercises JSONB DEFAULT '[]'::jsonb
        `);
      } catch (err) {
        // Coloana există deja
      }
      
      const result = await pool.query(`
        INSERT INTO daily_checkins (
          user_id, date, day_number, phase,
          breakfast_completed, breakfast_option, breakfast_image, breakfast_calories, breakfast_quantity,
          snack1_completed, snack1_option, snack1_image, snack1_calories, snack1_quantity,
          lunch_completed, lunch_option, lunch_image, lunch_calories, lunch_quantity,
          snack2_completed, snack2_option, snack2_image, snack2_calories, snack2_quantity,
          dinner_completed, dinner_option, dinner_image, dinner_calories, dinner_quantity,
          exercise_completed, exercise_type, exercise_duration, exercise_calories_burned, exercises,
          water_intake, total_calories, notes, updated_at
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24,
          $25, $26, $27, $28, $29,
          $30, $31, $32, $33, $34, $35, $36, CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, date) DO UPDATE SET
          day_number = EXCLUDED.day_number,
          phase = EXCLUDED.phase,
          breakfast_completed = EXCLUDED.breakfast_completed,
          breakfast_option = EXCLUDED.breakfast_option,
          breakfast_image = EXCLUDED.breakfast_image,
          breakfast_calories = EXCLUDED.breakfast_calories,
          breakfast_quantity = EXCLUDED.breakfast_quantity,
          snack1_completed = EXCLUDED.snack1_completed,
          snack1_option = EXCLUDED.snack1_option,
          snack1_image = EXCLUDED.snack1_image,
          snack1_calories = EXCLUDED.snack1_calories,
          snack1_quantity = EXCLUDED.snack1_quantity,
          lunch_completed = EXCLUDED.lunch_completed,
          lunch_option = EXCLUDED.lunch_option,
          lunch_image = EXCLUDED.lunch_image,
          lunch_calories = EXCLUDED.lunch_calories,
          lunch_quantity = EXCLUDED.lunch_quantity,
          snack2_completed = EXCLUDED.snack2_completed,
          snack2_option = EXCLUDED.snack2_option,
          snack2_image = EXCLUDED.snack2_image,
          snack2_calories = EXCLUDED.snack2_calories,
          snack2_quantity = EXCLUDED.snack2_quantity,
          dinner_completed = EXCLUDED.dinner_completed,
          dinner_option = EXCLUDED.dinner_option,
          dinner_image = EXCLUDED.dinner_image,
          dinner_calories = EXCLUDED.dinner_calories,
          dinner_quantity = EXCLUDED.dinner_quantity,
          exercise_completed = EXCLUDED.exercise_completed,
          exercise_type = EXCLUDED.exercise_type,
          exercise_duration = EXCLUDED.exercise_duration,
          exercise_calories_burned = EXCLUDED.exercise_calories_burned,
          exercises = EXCLUDED.exercises,
          water_intake = EXCLUDED.water_intake,
          total_calories = EXCLUDED.total_calories,
          notes = EXCLUDED.notes,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        userId, date, data.day_number, data.phase,
        data.breakfast_completed || false, data.breakfast_option, data.breakfast_image, data.breakfast_calories || 0, data.breakfast_quantity || 1,
        data.snack1_completed || false, data.snack1_option, data.snack1_image, data.snack1_calories || 0, data.snack1_quantity || 1,
        data.lunch_completed || false, data.lunch_option, data.lunch_image, data.lunch_calories || 0, data.lunch_quantity || 1,
        data.snack2_completed || false, data.snack2_option, data.snack2_image, data.snack2_calories || 0, data.snack2_quantity || 1,
        data.dinner_completed || false, data.dinner_option, data.dinner_image, data.dinner_calories || 0, data.dinner_quantity || 1,
        data.exercise_completed || false, data.exercise_type, data.exercise_duration || 0, data.exercise_calories_burned || 0, JSON.stringify(data.exercises || []),
        data.water_intake || 0, data.total_calories || 0, data.notes || ''
      ]);
    
      console.log('✅ Check-in UPSERT success:', result.rows[0]);
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ Check-in UPSERT error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'GET') {
    // RETURNARE listă check-ins pentru user-ul autentificat
    try {
      const result = await pool.query(
        'SELECT * FROM daily_checkins WHERE user_id = $1 ORDER BY date DESC',
        [userId]
      );
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Check-ins GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

