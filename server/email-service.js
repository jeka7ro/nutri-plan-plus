// Email Service using SendGrid (Free tier: 100 emails/day)
// Alternative: Nodemailer + Gmail SMTP (also free)

const crypto = require('crypto');

// Generate secure token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send email via SendGrid
async function sendEmail({ to, subject, html }) {
  // If SendGrid is configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      const sgMail = require('@sendgrid/mail');
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
  
  // Fallback: Nodemailer with Gmail SMTP (free)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
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
  
  // No email service configured - log only (for development)
  console.log(`📧 [DEV MODE] Would send email to ${to}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Link: ${html.match(/https?:\/\/[^\s"]+/)?.[0]}`);
  return { success: true, dev_mode: true };
}

// Email Templates
function getVerificationEmailHTML(token, language = 'ro') {
  const link = `https://www.eatnfit.app/verify-email?token=${token}`;
  
  if (language === 'ro') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, sans-serif; background: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981, #06b6d4); padding: 40px; text-align: center; }
          .logo { width: 80px; height: 80px; margin: 0 auto 16px; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px; }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bun venit la EatnFit!</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Eat Smart. Stay Fit</p>
          </div>
          <div class="content">
            <h2 style="color: #111827; margin-bottom: 16px;">Confirmă-ți adresa de email</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Bună! Suntem încântați că te-ai alăturat comunității EatnFit. 
              Pentru a-ți activa contul și a începe transformarea metabolismului, 
              te rugăm să confirmi adresa de email făcând click pe butonul de mai jos:
            </p>
            <div style="text-align: center;">
              <a href="${link}" class="button">
                ✅ Activează Contul
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              <strong>Link-ul expiră în 24 de ore.</strong><br>
              Dacă nu ai creat acest cont, poți ignora acest email.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 EatnFit - Bazat pe Fast Metabolism Diet by Haylie Pomroy</p>
            <p style="margin-top: 8px;">
              <a href="https://www.eatnfit.app/support" style="color: #10b981; text-decoration: none;">Suport</a> •
              <a href="https://www.eatnfit.app/privacy" style="color: #10b981; text-decoration: none;">Privacy</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  return `
    <h2>Welcome to EatnFit!</h2>
    <p>Click to verify your email:</p>
    <a href="${link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
      Verify Email
    </a>
  `;
}

function getPasswordResetEmailHTML(token, language = 'ro') {
  const link = `https://www.eatnfit.app/reset-password?token=${token}`;
  
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
            <h1>🔑 Resetare Parolă</h1>
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
  
  return `<h2>Password Reset</h2><p>Click to reset: <a href="${link}">Reset Password</a></p>`;
}

module.exports = {
  generateToken,
  sendEmail,
  getVerificationEmailHTML,
  getPasswordResetEmailHTML
};

