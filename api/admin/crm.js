// ADMIN CRM - Lead Management System
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
  
  // Verifică autentificarea + admin
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
    
    // Verifică admin
    const adminCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (adminCheck.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Ensure tables exist
  try {
    // Leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_leads (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        source VARCHAR(100), -- 'website' | 'facebook' | 'google' | 'referral' | 'manual'
        stage VARCHAR(50) DEFAULT 'new', -- 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
        score INTEGER DEFAULT 0, -- Lead scoring 0-100
        notes TEXT,
        assigned_to INTEGER REFERENCES users(id),
        converted_to_user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_contact_at TIMESTAMP,
        conversion_date TIMESTAMP
      )
    `);
    
    // Lead activities (interactions)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_lead_activities (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES crm_leads(id) ON DELETE CASCADE,
        activity_type VARCHAR(50), -- 'email_sent' | 'call' | 'note' | 'stage_change' | 'converted'
        description TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Promo codes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255),
        discount_type VARCHAR(20), -- 'percent' | 'fixed' | 'free_month'
        discount_value DECIMAL(10,2),
        max_uses INTEGER,
        current_uses INTEGER DEFAULT 0,
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Email campaigns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500),
        template_id INTEGER,
        recipient_segment VARCHAR(50), -- 'all' | 'free' | 'premium' | 'inactive' | 'custom'
        status VARCHAR(50) DEFAULT 'draft', -- 'draft' | 'scheduled' | 'sending' | 'sent'
        sent_count INTEGER DEFAULT 0,
        opened_count INTEGER DEFAULT 0,
        clicked_count INTEGER DEFAULT 0,
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage)`);
  } catch (error) {
    console.error('❌ Error creating CRM tables:', error);
  }
  
  // GET /api/admin/crm - Lista leads
  if (req.method === 'GET') {
    const { stage, source, search } = req.query;
    
    try {
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
        paramCount++;
      }
      
      query += ' ORDER BY l.created_at DESC LIMIT 500';
      
      const result = await pool.query(query, params);
      
      // Get pipeline stats
      const stats = await pool.query(`
        SELECT 
          stage,
          COUNT(*) as count,
          AVG(score) as avg_score
        FROM crm_leads
        GROUP BY stage
      `);
      
      return res.status(200).json({
        leads: result.rows,
        stats: stats.rows
      });
    } catch (error) {
      console.error('❌ CRM GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // POST - Create lead
  if (req.method === 'POST') {
    const { email, first_name, last_name, phone, source, notes } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    try {
      const result = await pool.query(`
        INSERT INTO crm_leads (email, first_name, last_name, phone, source, notes, stage, score)
        VALUES ($1, $2, $3, $4, $5, $6, 'new', 50)
        RETURNING *
      `, [email, first_name, last_name, phone, source || 'manual', notes]);
      
      // Log activity
      await pool.query(`
        INSERT INTO crm_lead_activities (lead_id, activity_type, description, created_by)
        VALUES ($1, 'lead_created', 'Lead adăugat manual în CRM', $2)
      `, [result.rows[0].id, userId]);
      
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ CRM POST error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT - Update lead
  if (req.method === 'PUT') {
    const { leadId, stage, score, notes, assigned_to } = req.body;
    
    try {
      const result = await pool.query(`
        UPDATE crm_leads SET
          stage = COALESCE($1, stage),
          score = COALESCE($2, score),
          notes = COALESCE($3, notes),
          assigned_to = COALESCE($4, assigned_to),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `, [stage, score, notes, assigned_to, leadId]);
      
      // Log activity
      if (stage) {
        await pool.query(`
          INSERT INTO crm_lead_activities (lead_id, activity_type, description, created_by)
          VALUES ($1, 'stage_change', $2, $3)
        `, [leadId, `Schimbat în: ${stage}`, userId]);
      }
      
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ CRM PUT error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

