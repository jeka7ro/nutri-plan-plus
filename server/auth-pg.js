import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database-pg.js';
import { config } from './config.js';

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = '30d';

export async function registerUser(email, password, name, phone, country_code, country, city, date_of_birth) {
  const client = await pool.connect();
  
  try {
    // Check if user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('Email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user and return created user
    const result = await client.query(`
      INSERT INTO users (email, password, name, phone, country_code, country, city, date_of_birth, subscription_tier)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'free')
      RETURNING id, email, name, phone, country_code, country, city, date_of_birth, role, subscription_tier
    `, [
      email, 
      hashedPassword, 
      name || email.split('@')[0],
      phone || null,
      country_code || null,
      country || null,
      city || null,
      date_of_birth || null
    ]);
    
    const user = result.rows[0];
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return { user, token };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export async function loginUser(email, password) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    // Actualizează last_login
    await client.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  } finally {
    client.release();
  }
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware to check subscription tier
export function requireSubscription(requiredTier = 'premium') {
  return async (req, res, next) => {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT subscription_tier, subscription_expires_at FROM users WHERE id = $1',
        [req.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const user = result.rows[0];
      
      // Check if subscription is valid
      if (user.subscription_tier === 'free' && requiredTier !== 'free') {
        return res.status(403).json({ 
          error: 'Premium subscription required',
          message: 'Upgrade to premium to access this feature'
        });
      }
      
      // Check if subscription expired (for premium users)
      if (user.subscription_tier === 'premium' && user.subscription_expires_at) {
        const expiresAt = new Date(user.subscription_expires_at);
        if (expiresAt < new Date()) {
          return res.status(403).json({ 
            error: 'Subscription expired',
            message: 'Please renew your subscription'
          });
        }
      }
      
      req.userSubscription = user.subscription_tier;
      next();
    } finally {
      client.release();
    }
  };
}

