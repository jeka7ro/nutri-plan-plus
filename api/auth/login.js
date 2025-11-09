import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// RATE LIMITING - în memorie (pentru Vercel)
const loginAttempts = new Map(); // email -> { count, lastAttempt }
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minute

function checkRateLimit(email) {
  const now = Date.now();
  const attempt = loginAttempts.get(email);
  
  if (!attempt) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // Dacă a trecut timpul de lockout, resetează
  if (now - attempt.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // Dacă a depășit limita
  if (attempt.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_TIME - (now - attempt.lastAttempt)) / 60000);
    return { 
      allowed: false, 
      message: `Prea multe încercări. Încearcă din nou în ${remainingTime} minute.` 
    };
  }
  
  // Incrementează
  attempt.count++;
  attempt.lastAttempt = now;
  loginAttempts.set(email, attempt);
  
  return { allowed: true };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, password, first_name, last_name, phone, country_code, country, city, date_of_birth, isRegister } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // REGISTER
    if (isRegister) {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user
      const result = await pool.query(`
        INSERT INTO users (email, password, first_name, last_name, phone, country_code, country, city, birth_date, subscription_tier, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'free', 'user')
        RETURNING id, email, first_name, last_name, phone, country_code, country, city, birth_date, role, subscription_tier
      `, [
        email,
        hashedPassword,
        first_name || null,
        last_name || null,
        phone || null,
        country_code || '+40',
        country || null,
        city || null,
        date_of_birth || null
      ]);
      
      const user = result.rows[0];
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      );
      
      return res.status(200).json({
        token,
        user
      });
    }
    
    // LOGIN
    // Check rate limit ÎNAINTE de query
    const rateCheck = checkRateLimit(email);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.message });
    }
    
    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // ACTUALIZEAZĂ last_login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    console.log('✅ Last login updated for user:', user.id, user.email);
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    // Return user data
    const { password: _, ...userData } = user;
    
    return res.status(200).json({
      token,
      user: userData
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

