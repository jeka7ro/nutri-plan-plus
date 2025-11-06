import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './database.js';

const JWT_SECRET = 'nutri-plan-local-dev-secret-key-2024';
const JWT_EXPIRES_IN = '30d';

export async function registerUser(email, password, name) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(email, hashedPassword, name || email.split('@')[0]);
    
    // Get created user
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return { user, token };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function loginUser(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }
  
  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, token };
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


