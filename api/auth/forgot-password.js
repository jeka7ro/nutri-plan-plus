import pkg from 'pg';
const { Pool } = pkg;
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// Import email service (pentru Vercel, folosim ES modules)
async function sendEmail({ to, subject, html }) {
  // SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sgMail = (await import('@sendgrid/mail')).default;
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@eatnfit.app',
        subject,
        html
      });
      
      console.log(`✅ Email sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('❌ SendGrid error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      
      await transporter.sendMail({
        from: `"EatnFit" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
      });
      
      console.log(`✅ Email sent via Gmail to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Gmail SMTP error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // DEV MODE - log only
  console.log(`📧 [DEV MODE] Would send email to ${to}:`);
  console.log(`Subject: ${subject}`);
  const linkMatch = html.match(/https?:\/\/[^\s"<>]+/);
  if (linkMatch) {
    console.log(`🔗 Reset link: ${linkMatch[0]}`);
  }
  return { success: true, dev_mode: true };
}

function getPasswordResetEmailHTML(token, language = 'ro') {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://www.eatnfit.app';
  const link = `${baseUrl}/reset-password?token=${token}`;
  
  if (language === 'ro') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, sans-serif; background: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 40px; text-align: center; }
          .content { padding: 40px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Resetare Parolă</h1>
          </div>
          <div class="content">
            <p style="color: #4b5563; line-height: 1.6;">
              Am primit o cerere de resetare a parolei pentru contul tău EatnFit.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Dacă ai făcut tu această cerere, click pe butonul de mai jos pentru a-ți seta o parolă nouă:
            </p>
            <div style="text-align: center;">
              <a href="${link}" class="button">
                🔄 Resetează Parola
              </a>
            </div>
            <p style="color: #ef4444; font-size: 14px; margin-top: 24px; font-weight: bold;">
              ⚠️ Link-ul expiră în 1 oră.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
              Dacă nu ai solicitat resetarea parolei, poți ignora acest email în siguranță. 
              Parola ta rămâne neschimbată.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 EatnFit</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  return `
    <h2>Password Reset</h2>
    <p>Click to reset: <a href="${link}">Reset Password</a></p>
    <p><strong>Link expires in 1 hour.</strong></p>
  `;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Verifică dacă user-ul există
    const userResult = await pool.query('SELECT id, email, first_name FROM users WHERE email = $1', [email]);
    
    // Pentru securitate, nu dezvăluim dacă email-ul există sau nu
    if (userResult.rows.length === 0) {
      console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
      // Returnăm success chiar dacă email-ul nu există (pentru securitate)
      return res.status(200).json({ 
        success: true, 
        message: 'If this email exists, you will receive a password reset link.' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Generează token de resetare
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 oră
    
    // Salvează token-ul în baza de date
    // Verifică dacă există tabela password_resets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Șterge token-urile expirate
    await pool.query('DELETE FROM password_resets WHERE expires_at < NOW()');
    
    // Șterge token-urile existente pentru acest user
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);
    
    // Inserează noul token
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );
    
    // Trimite email
    const emailResult = await sendEmail({
      to: user.email,
      subject: '🔑 Resetare Parolă - EatnFit',
      html: getPasswordResetEmailHTML(resetToken, 'ro')
    });
    
    if (!emailResult.success && !emailResult.dev_mode) {
      console.error('❌ Failed to send reset email:', emailResult.error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    
    console.log(`✅ Password reset email sent to ${user.email}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'If this email exists, you will receive a password reset link.' 
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

