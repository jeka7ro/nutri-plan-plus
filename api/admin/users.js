import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 [API /admin/users] Request received');
    
    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    console.log('✅ Token decoded:', decoded);
    
    // Get current user to check if admin
    const currentUserResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    console.log('👤 Current user query result:', currentUserResult.rows);
    
    if (currentUserResult.rows.length === 0) {
      console.log('❌ User not found with id:', decoded.id);
      return res.status(403).json({ error: 'User not found' });
    }
    
    if (currentUserResult.rows[0].role !== 'admin') {
      console.log('❌ User is not admin, role:', currentUserResult.rows[0].role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log('✅ User is admin');
    
    const userId = decoded.id;
    const { type } = req.query; // 'crm' | 'sales' | 'promos' | undefined (default users)
    
    // ========== CRM LEADS ==========
    if (type === 'crm') {
      return handleCRM(req, res, pool, userId);
    }
    
    // ========== SALES & REVENUE ==========
    if (type === 'sales') {
      return handleSales(req, res, pool, userId);
    }
    
    // ========== PROMOTIONS ==========
    if (type === 'promos') {
      return handlePromos(req, res, pool, userId);
    }
    
    // ========== EMAIL MANAGEMENT ==========
    if (type === 'email') {
      return handleEmail(req, res, pool, userId);
    }
    
    // ========== DEFAULT: USERS ==========
    
    // PUT - Change user role
    if (req.method === 'PUT') {
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        return res.status(400).json({ error: 'User ID and role required' });
      }
      
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      const updateResult = await pool.query(
        'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, role',
        [role, userId]
      );
      
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log('✅ Role updated:', updateResult.rows[0]);
      return res.status(200).json({ success: true, user: updateResult.rows[0] });
    }
    
    // GET - Fetch all users
    console.log('Fetching all users...');
    
    const result = await pool.query(`
      SELECT id, email, name, first_name, last_name, phone, role, subscription_tier, subscription_expires_at,
             start_date, birth_date, current_weight, target_weight,
             height, age, gender, activity_level, dietary_preferences, allergies,
             profile_picture, country, city, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);
    
    console.log('📊 Found', result.rows.length, 'users');
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Admin users error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
}

// ==================== CRM HANDLER ====================
async function handleCRM(req, res, pool, adminId) {
  // Ensure CRM tables exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_leads (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        source VARCHAR(100) DEFAULT 'manual',
        stage VARCHAR(50) DEFAULT 'new',
        score INTEGER DEFAULT 50,
        notes TEXT,
        assigned_to INTEGER REFERENCES users(id),
        converted_to_user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_contact_at TIMESTAMP,
        conversion_date TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_lead_activities (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES crm_leads(id) ON DELETE CASCADE,
        activity_type VARCHAR(50),
        description TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage)`);
  } catch (error) {
    console.error('⚠️ CRM table creation warning:', error);
  }
  
  // GET - Lista leads
  if (req.method === 'GET') {
    const { stage, source, search } = req.query;
    
    let query = `
      SELECT l.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name
      FROM crm_leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (stage) {
      query += ` AND l.stage = $${paramCount}`;
      params.push(stage);
      paramCount++;
    }
    
    if (source) {
      query += ` AND l.source = $${paramCount}`;
      params.push(source);
      paramCount++;
    }
    
    if (search) {
      query += ` AND (l.email ILIKE $${paramCount} OR l.first_name ILIKE $${paramCount} OR l.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY l.created_at DESC LIMIT 500';
    
    const result = await pool.query(query, params);
    
    // Pipeline stats
    const stats = await pool.query(`
      SELECT stage, COUNT(*) as count, AVG(score) as avg_score
      FROM crm_leads
      GROUP BY stage
    `);
    
    return res.status(200).json({ leads: result.rows, stats: stats.rows });
  }
  
  // POST - Create lead
  if (req.method === 'POST') {
    const { email, first_name, last_name, phone, source, notes } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const result = await pool.query(`
      INSERT INTO crm_leads (email, first_name, last_name, phone, source, notes, stage, score)
      VALUES ($1, $2, $3, $4, $5, $6, 'new', 50)
      RETURNING *
    `, [email, first_name, last_name, phone, source || 'manual', notes]);
    
    await pool.query(`
      INSERT INTO crm_lead_activities (lead_id, activity_type, description, created_by)
      VALUES ($1, 'lead_created', 'Lead adăugat în CRM', $2)
    `, [result.rows[0].id, adminId]);
    
    return res.status(200).json(result.rows[0]);
  }
  
  // PUT - Update lead
  if (req.method === 'PUT') {
    const { leadId, stage, score, notes, assigned_to } = req.body;
    
    const result = await pool.query(`
      UPDATE crm_leads SET
        stage = COALESCE($1, stage),
        score = COALESCE($2, score),
        notes = COALESCE($3, notes),
        assigned_to = COALESCE($4, assigned_to),
        updated_at = CURRENT_TIMESTAMP,
        last_contact_at = CASE WHEN $1 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE last_contact_at END
      WHERE id = $5
      RETURNING *
    `, [stage, score, notes, assigned_to, leadId]);
    
    if (stage) {
      await pool.query(`
        INSERT INTO crm_lead_activities (lead_id, activity_type, description, created_by)
        VALUES ($1, 'stage_change', $2, $3)
      `, [leadId, `Schimbat în: ${stage}`, adminId]);
    }
    
    return res.status(200).json(result.rows[0]);
  }
  
  // DELETE - Remove lead
  if (req.method === 'DELETE') {
    const { leadId } = req.body;
    await pool.query('DELETE FROM crm_leads WHERE id = $1', [leadId]);
    return res.status(200).json({ success: true });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// ==================== SALES HANDLER ====================
async function handleSales(req, res, pool, adminId) {
  // Ensure sales tables exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'RON',
        transaction_type VARCHAR(50) DEFAULT 'subscription',
        payment_method VARCHAR(50),
        payment_provider VARCHAR(50),
        promo_code_id INTEGER,
        status VARCHAR(50) DEFAULT 'completed',
        stripe_payment_id VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_user ON sales_transactions(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_transactions(created_at)`);
  } catch (error) {
    console.error('⚠️ Sales table creation warning:', error);
  }
  
  // GET - Revenue stats
  if (req.method === 'GET') {
    const { period } = req.query;
    
    let dateFilter = '';
    if (period === '7days') dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
    else if (period === '30days') dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
    else if (period === 'year') dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '1 year'";
    
    const revenueResult = await pool.query(`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_transactions,
        AVG(amount) as avg_transaction
      FROM sales_transactions
      WHERE status = 'completed' ${dateFilter}
    `);
    
    const dailyRevenue = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM sales_transactions
      WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    const transactions = await pool.query(`
      SELECT st.*, u.email, u.first_name, u.last_name
      FROM sales_transactions st
      LEFT JOIN users u ON st.user_id = u.id
      WHERE st.status = 'completed' ${dateFilter}
      ORDER BY st.created_at DESC
      LIMIT 100
    `);
    
    return res.status(200).json({
      revenue: revenueResult.rows[0],
      daily: dailyRevenue.rows,
      transactions: transactions.rows
    });
  }
  
  // POST - Add transaction
  if (req.method === 'POST') {
    const { user_id, amount, transaction_type, payment_method, notes } = req.body;
    
    const result = await pool.query(`
      INSERT INTO sales_transactions (user_id, amount, transaction_type, payment_method, status, metadata)
      VALUES ($1, $2, $3, $4, 'completed', $5)
      RETURNING *
    `, [user_id, amount, transaction_type || 'manual', payment_method || 'cash', { notes, added_by: adminId }]);
    
    return res.status(200).json(result.rows[0]);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// ==================== PROMOTIONS HANDLER ====================
async function handlePromos(req, res, pool, adminId) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255),
        discount_type VARCHAR(20) DEFAULT 'percent',
        discount_value DECIMAL(10,2),
        max_uses INTEGER,
        current_uses INTEGER DEFAULT 0,
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('⚠️ Promo table warning:', error);
  }
  
  // GET - List promos
  if (req.method === 'GET') {
    const result = await pool.query(`
      SELECT pc.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM promo_codes pc
      LEFT JOIN users u ON pc.created_by = u.id
      ORDER BY pc.created_at DESC
    `);
    
    return res.status(200).json(result.rows);
  }
  
  // POST - Create promo
  if (req.method === 'POST') {
    const { code, name, discount_type, discount_value, max_uses, valid_until } = req.body;
    
    if (!code || !discount_value) {
      return res.status(400).json({ error: 'Code and discount_value required' });
    }
    
    const result = await pool.query(`
      INSERT INTO promo_codes (code, name, discount_type, discount_value, max_uses, valid_until, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [code.toUpperCase(), name, discount_type || 'percent', discount_value, max_uses, valid_until, adminId]);
    
    return res.status(200).json(result.rows[0]);
  }
  
  // PUT - Update promo
  if (req.method === 'PUT') {
    const { promoId, is_active, max_uses } = req.body;
    
    const result = await pool.query(`
      UPDATE promo_codes SET
        is_active = COALESCE($1, is_active),
        max_uses = COALESCE($2, max_uses)
      WHERE id = $3
      RETURNING *
    `, [is_active, max_uses, promoId]);
    
    return res.status(200).json(result.rows[0]);
  }
  
  // DELETE
  if (req.method === 'DELETE') {
    const { promoId } = req.body;
    await pool.query('DELETE FROM promo_codes WHERE id = $1', [promoId]);
    return res.status(200).json({ success: true });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// ==================== EMAIL MANAGEMENT HANDLER ====================
async function handleEmail(req, res, pool, adminId) {
  const { action } = req.query; // 'templates' | 'campaigns' | 'analytics'
  
  try {
    // Ensure email tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body_html TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'marketing',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        template_id INTEGER REFERENCES email_templates(id) ON DELETE CASCADE,
        target_audience VARCHAR(50) DEFAULT 'all',
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        sent_count INTEGER DEFAULT 0,
        open_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // ========== TEMPLATES ==========
    if (action === 'templates') {
      // GET - List templates
      if (req.method === 'GET') {
        const result = await pool.query(`
          SELECT * FROM email_templates ORDER BY created_at DESC
        `);
        return res.status(200).json({ templates: result.rows });
      }
      
      // POST - Create template
      if (req.method === 'POST') {
        const { name, subject, body_html, category } = req.body;
        const result = await pool.query(`
          INSERT INTO email_templates (name, subject, body_html, category, created_by)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [name, subject, body_html, category || 'marketing', adminId]);
        return res.status(200).json(result.rows[0]);
      }
      
      // PUT - Update template
      if (req.method === 'PUT') {
        const { templateId, name, subject, body_html } = req.body;
        const result = await pool.query(`
          UPDATE email_templates SET
            name = COALESCE($1, name),
            subject = COALESCE($2, subject),
            body_html = COALESCE($3, body_html)
          WHERE id = $4
          RETURNING *
        `, [name, subject, body_html, templateId]);
        return res.status(200).json(result.rows[0]);
      }
      
      // DELETE
      if (req.method === 'DELETE') {
        const { templateId } = req.body;
        await pool.query('DELETE FROM email_templates WHERE id = $1', [templateId]);
        return res.status(200).json({ success: true });
      }
    }
    
    // ========== CAMPAIGNS ==========
    if (action === 'campaigns') {
      // GET - List campaigns
      if (req.method === 'GET') {
        const result = await pool.query(`
          SELECT 
            c.*,
            t.name as template_name
          FROM email_campaigns c
          LEFT JOIN email_templates t ON c.template_id = t.id
          ORDER BY c.created_at DESC
        `);
        return res.status(200).json({ campaigns: result.rows });
      }
      
      // POST - Create campaign
      if (req.method === 'POST') {
        const { name, template_id, target_audience, scheduled_at } = req.body;
        
        const status = scheduled_at ? 'scheduled' : 'draft';
        
        const result = await pool.query(`
          INSERT INTO email_campaigns (name, template_id, target_audience, status, scheduled_at, created_by)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [name, template_id, target_audience || 'all', status, scheduled_at || null, adminId]);
        
        return res.status(200).json(result.rows[0]);
      }
      
      // PUT - Update campaign
      if (req.method === 'PUT') {
        const { campaignId, status, sent_count, open_count, click_count } = req.body;
        const result = await pool.query(`
          UPDATE email_campaigns SET
            status = COALESCE($1, status),
            sent_count = COALESCE($2, sent_count),
            open_count = COALESCE($3, open_count),
            click_count = COALESCE($4, click_count),
            sent_at = CASE WHEN $1 = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END
          WHERE id = $5
          RETURNING *
        `, [status, sent_count, open_count, click_count, campaignId]);
        return res.status(200).json(result.rows[0]);
      }
    }
    
    // ========== ANALYTICS ==========
    if (action === 'analytics') {
      // GET - Analytics stats
      if (req.method === 'GET') {
        const statsResult = await pool.query(`
          SELECT 
            COALESCE(SUM(sent_count), 0) as sent,
            COALESCE(SUM(open_count), 0) as opened,
            COALESCE(SUM(click_count), 0) as clicked
          FROM email_campaigns
          WHERE status = 'sent'
        `);
        
        const stats = statsResult.rows[0];
        const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : 0;
        const clickRate = stats.sent > 0 ? ((stats.clicked / stats.sent) * 100).toFixed(1) : 0;
        
        const historyResult = await pool.query(`
          SELECT 
            name as campaign_name,
            sent_count as sent,
            open_count as opened,
            click_count as clicked,
            sent_at
          FROM email_campaigns
          WHERE status = 'sent' AND sent_at IS NOT NULL
          ORDER BY sent_at DESC
          LIMIT 20
        `);
        
        return res.status(200).json({
          stats: {
            ...stats,
            openRate: parseFloat(openRate),
            clickRate: parseFloat(clickRate)
          },
          history: historyResult.rows
        });
      }
    }
    
    return res.status(400).json({ error: 'Invalid action or method' });
    
  } catch (error) {
    console.error('❌ Email handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}

