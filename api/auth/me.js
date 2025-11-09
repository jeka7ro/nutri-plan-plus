import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// Email service helper (inline pentru Vercel)
async function sendEmail({ to, subject, html }) {
  // DEV MODE - doar log
  console.log(`📧 [EMAIL] To: ${to}, Subject: ${subject}`);
  const link = html.match(/https?:\/\/[^\s"<>]+/)?.[0];
  if (link) console.log(`🔗 Link: ${link}`);
  return { success: true, dev_mode: true };
  
  // TODO: Activează SendGrid sau Gmail SMTP în production
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({ to, from: 'noreply@eatnfit.app', subject, html });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // SPECIAL ENDPOINT: Run migration if ?migrate=true (no auth required)
  if (req.query.migrate === 'true' && req.method === 'GET') {
    console.log('🔧 RUNNING DATABASE MIGRATION...');
    try {
      // Check if columns exist
      const checkColumns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('first_name', 'last_name', 'phone')
      `);
      
      const existingColumns = checkColumns.rows.map(c => c.column_name);
      console.log('✅ Existing columns:', existingColumns);
      
      const migrations = [];
      
      const needsFirstName = !existingColumns.includes('first_name');
      const needsLastName = !existingColumns.includes('last_name');
      const needsPhone = !existingColumns.includes('phone');
      
      if (needsFirstName) {
        console.log('➕ Adding first_name...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)');
        migrations.push('first_name');
      }
      
      if (needsLastName) {
        console.log('➕ Adding last_name...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)');
        migrations.push('last_name');
      }
      
      if (needsPhone) {
        console.log('➕ Adding phone...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
        migrations.push('phone');
      }
      
      // Creează tabela backups dacă nu există
      console.log('📦 Checking backups table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS backups (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          backup_data TEXT,
          size_mb DECIMAL(10,2),
          created_by INTEGER REFERENCES users(id),
          auto_generated BOOLEAN DEFAULT false,
          tables_included TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      migrations.push('backups_table');
      
      // Adaugă coloana last_login dacă nu există
      console.log('🕐 Checking last_login column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
      `);
      migrations.push('last_login_column');
      
      // Adaugă coloane subscription
      console.log('💳 Checking subscription columns...');
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free'`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active'`);
      migrations.push('subscription_columns');
      
      // Creează tabel subscriptions
      console.log('📊 Creating subscriptions table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          plan_type VARCHAR(20) NOT NULL,
          price_amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(50),
          payment_status VARCHAR(20) DEFAULT 'pending',
          payment_provider_id VARCHAR(255),
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP,
          is_first_month BOOLEAN DEFAULT FALSE,
          created_by_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      migrations.push('subscriptions_table');
      
      // Marchează useri existenți ca PREMIUM gratis
      console.log('⭐ Marking existing users as PREMIUM...');
      const premiumResult = await pool.query(`
        UPDATE users 
        SET subscription_plan = 'premium', subscription_status = 'active'
        WHERE created_at < '2025-11-09 17:00:00' AND subscription_plan = 'free'
        RETURNING id, email
      `);
      console.log(`✅ ${premiumResult.rowCount} users marked as PREMIUM`);
      migrations.push(`premium_users_${premiumResult.rowCount}`);
      
      console.log('✅ MIGRATION COMPLETE!');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Migration completed successfully!',
        added: migrations,
        existing: existingColumns
      });
      
    } catch (error) {
      console.error('❌ MIGRATION ERROR:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: error.stack
      });
    }
  }
  
  // ========== EMAIL VERIFICATION ==========
  // POST /api/auth/me?verify=send - Trimite email de verificare
  if (req.method === 'POST' && req.query.verify === 'send') {
    const { email } = req.body;
    
    try {
      // Creează tabel pentru tokens
      await pool.query(`
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Găsește user-ul
      const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = userResult.rows[0];
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore
      
      // Salvează token
      await pool.query(`
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, token, expiresAt]);
      
      // Trimite email
      const link = `https://www.eatnfit.app/verify-email?token=${token}`;
      const html = `
        <h2>🎉 Bine ai venit la EatnFit!</h2>
        <p>Click pentru a-ți verifica email-ul:</p>
        <a href="${link}" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
          ✅ Activează Contul
        </a>
        <p style="color: #6b7280; margin-top: 20px;">Link-ul expiră în 24 ore.</p>
      `;
      
      await sendEmail({ to: user.email, subject: 'Verifică-ți emailul - EatnFit', html });
      
      return res.status(200).json({ success: true, message: 'Email de verificare trimis!' });
    } catch (error) {
      console.error('❌ Email verification send error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET /api/auth/me?verify=<token> - Verifică token-ul
  if (req.method === 'GET' && req.query.verify) {
    const token = req.query.verify;
    
    try {
      const result = await pool.query(`
        SELECT evt.*, u.id as user_id, u.email
        FROM email_verification_tokens evt
        JOIN users u ON evt.user_id = u.id
        WHERE evt.token = $1 AND evt.expires_at > NOW()
      `, [token]);
      
      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Token invalid sau expirat' });
      }
      
      const { user_id, email } = result.rows[0];
      
      // Marchează user-ul ca verificat
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`);
      await pool.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [user_id]);
      
      // Șterge token-ul
      await pool.query('DELETE FROM email_verification_tokens WHERE token = $1', [token]);
      
      return res.status(200).json({ success: true, message: 'Email verificat cu succes!', email });
    } catch (error) {
      console.error('❌ Email verification error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // ========== PASSWORD RESET ==========
  // POST /api/auth/me?reset=request - Cere resetare parolă
  if (req.method === 'POST' && req.query.reset === 'request') {
    const { email } = req.body;
    
    try {
      // Creează tabel pentru reset tokens
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Găsește user-ul
      const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        // Nu dezvăluim dacă email-ul există (security)
        return res.status(200).json({ success: true, message: 'Dacă email-ul există, vei primi link de resetare.' });
      }
      
      const user = userResult.rows[0];
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 oră
      
      // Șterge token-uri vechi pentru acest user
      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
      
      // Salvează token nou
      await pool.query(`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, token, expiresAt]);
      
      // Trimite email
      const link = `https://www.eatnfit.app/reset-password?token=${token}`;
      const html = `
        <h2>🔑 Resetare Parolă</h2>
        <p>Click pentru a-ți reseta parola:</p>
        <a href="${link}" style="display: inline-block; background: #f59e0b; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
          🔄 Resetează Parola
        </a>
        <p style="color: #ef4444; margin-top: 20px;"><strong>⚠️ Link-ul expiră în 1 oră.</strong></p>
        <p style="color: #6b7280;">Dacă nu ai solicitat resetarea, poți ignora acest email.</p>
      `;
      
      await sendEmail({ to: user.email, subject: 'Resetare Parolă - EatnFit', html });
      
      return res.status(200).json({ success: true, message: 'Dacă email-ul există, vei primi link de resetare.' });
    } catch (error) {
      console.error('❌ Password reset request error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // POST /api/auth/me?reset=<token> - Resetează parola cu token-ul
  if (req.method === 'POST' && req.query.reset && req.query.reset !== 'request') {
    const token = req.query.reset;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Parola trebuie să aibă minim 6 caractere' });
    }
    
    try {
      const result = await pool.query(`
        SELECT prt.*, u.id as user_id, u.email
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = $1 AND prt.expires_at > NOW()
      `, [token]);
      
      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Token invalid sau expirat' });
      }
      
      const { user_id } = result.rows[0];
      
      // Hash parola nouă
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizează parola
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user_id]);
      
      // Șterge toate token-urile de reset pentru acest user
      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user_id]);
      
      return res.status(200).json({ success: true, message: 'Parolă resetată cu succes!' });
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const { password, ...userData } = user;
    
    // GET - return user data
    if (req.method === 'GET') {
      return res.status(200).json(userData);
    }
    
    // PUT - update user profile
    if (req.method === 'PUT') {
      const updates = req.body;
      const allowedFields = [
        'name', 'first_name', 'last_name', 'phone', 'birth_date', 'current_weight', 'target_weight',
        'height', 'age', 'gender', 'activity_level', 'start_date',
        'dietary_preferences', 'allergies', 'profile_picture',
        'country', 'city'
      ];
      
      const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      const values = fields.map(field => updates[field]);
      values.push(decoded.id);
      
      const updateResult = await pool.query(`
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $${values.length}
        RETURNING *
      `, values);
      
      const { password: _, ...updatedUserData } = updateResult.rows[0];
      return res.status(200).json(updatedUserData);
    }
    
    // POST - change password
    if (req.method === 'POST') {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await pool.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, decoded.id]
      );
      
      return res.status(200).json({ 
        success: true,
        message: 'Password changed successfully' 
      });
    }
    
    // POST ?subscription=status - Get subscription info (combined to stay within 12 functions)
    if (req.method === 'GET' && req.query.subscription === 'status') {
      const result = await pool.query(
        'SELECT subscription_plan, subscription_status FROM users WHERE id = $1',
        [decoded.id]
      );
      
      const subscriptionHistory = await pool.query(
        'SELECT COUNT(*) as count FROM subscriptions WHERE user_id = $1 AND payment_status = $2',
        [decoded.id, 'paid']
      );
      
      const isFirstPayment = subscriptionHistory.rows[0].count === '0';
      
      return res.status(200).json({
        plan: result.rows[0].subscription_plan || 'free',
        status: result.rows[0].subscription_status || 'active',
        isFirstPayment,
        firstMonthPrice: 200,
        monthlyPrice: 20
      });
    }
    
    // POST ?subscription=check-limits - Check FREE limits (combined)
    if (req.method === 'POST' && req.query.subscription === 'check-limits') {
      const { feature } = req.body;
      
      const userResult = await pool.query(
        'SELECT subscription_plan FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (userResult.rows[0].subscription_plan === 'premium') {
        return res.status(200).json({ allowed: true, isPremium: true });
      }
      
      // FREE limits
      if (feature === 'recipes') {
        const count = await pool.query('SELECT COUNT(*) as count FROM user_recipes WHERE user_id = $1', [decoded.id]);
        const allowed = parseInt(count.rows[0].count) < 1;
        return res.status(200).json({ 
          allowed, 
          isPremium: false,
          limit: 1,
          current: parseInt(count.rows[0].count),
          message: allowed ? 'OK' : 'Limită FREE atinsă (1 rețetă). Upgrade la Premium.'
        });
      }
      
      if (feature === 'friends') {
        return res.status(200).json({ 
          allowed: false, 
          isPremium: false,
          message: 'Prieteni disponibili doar în Premium.'
        });
      }
      
      if (feature === 'food-db') {
        return res.status(200).json({ 
          allowed: false, 
          isPremium: false,
          message: 'Food Database disponibil doar în Premium.'
        });
      }
      
      return res.status(200).json({ allowed: true });
    }
    
    // POST ?subscription=grant - Admin grants premium (combined)
    if (req.method === 'POST' && req.query.subscription === 'grant') {
      const { targetUserId, durationMonths } = req.body;
      
      // Check if admin
      const adminCheck = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
      
      if (adminCheck.rows[0]?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
      }
      
      // Grant Premium
      const expiresAt = durationMonths === 'lifetime' 
        ? null 
        : new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000);
      
      await pool.query(
        'UPDATE users SET subscription_plan = $1, subscription_status = $2 WHERE id = $3',
        ['premium', 'active', targetUserId]
      );
      
      await pool.query(`
        INSERT INTO subscriptions (user_id, plan_type, price_amount, payment_method, payment_status, expires_at, created_by_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [targetUserId, 'premium', 0, 'admin_grant', 'paid', expiresAt, true]);
      
      return res.status(200).json({ success: true });
    }
    
  } catch (error) {
    console.error('❌ Auth error in /api/auth/me:', error);
    console.error('Method:', req.method);
    console.error('Headers:', req.headers);
    console.error('Body:', req.body);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}

