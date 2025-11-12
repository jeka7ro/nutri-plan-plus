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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ========== SUPPORT MESSAGES HANDLER ==========
  if (req.query.type === 'support') {
    // Mock endpoint pentru mesajele de suport (nu există încă tabelul în DB)
    return res.status(200).json([]);
  }

  try {
    // ========== VERCEL CRON REQUEST ==========
    // Rulează la 3 AM zilnic, fără autentificare (verifică Vercel header)
    if (req.query.cron === 'true') {
      console.log('⏰ CRON JOB: Daily backup triggered');
      
      // Verifică că vine de la Vercel Cron (security)
      const cronSecret = req.headers['x-vercel-cron-secret'];
      if (process.env.NODE_ENV === 'production' && cronSecret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Invalid cron secret' });
      }
      
      try {
        // Creează backup automat
        const tables = ['users', 'daily_checkins', 'weight_entries', 'user_recipes', 'friends', 'subscriptions'];
        const backupData = {};
        
        for (const table of tables) {
          const result = await pool.query(`SELECT * FROM ${table}`);
          backupData[table] = result.rows;
        }
        
        const backupJson = JSON.stringify(backupData);
        const sizeMB = (Buffer.byteLength(backupJson, 'utf8') / (1024 * 1024)).toFixed(2);
        const filename = `auto_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        // Salvează în DB
        await pool.query(`
          INSERT INTO backups (filename, backup_data, size_mb, created_by, auto_generated, tables_included)
          VALUES ($1, $2, $3, NULL, TRUE, $4)
        `, [filename, backupJson, sizeMB, tables]);
        
        console.log(`✅ CRON: Backup created - ${filename} (${sizeMB} MB)`);
        
        // Cleanup: șterge backup-uri auto mai vechi de 30 zile
        await pool.query(`
          DELETE FROM backups 
          WHERE auto_generated = TRUE 
          AND created_at < NOW() - INTERVAL '30 days'
        `);
        
        return res.status(200).json({ success: true, filename, size_mb: sizeMB });
      } catch (error) {
        console.error('❌ CRON backup error:', error);
        return res.status(500).json({ error: error.message });
      }
    }
    
    // ========== NORMAL REQUESTS (require auth) ==========
    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    // Check if admin
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // GET - List all backups
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT 
          b.id, 
          b.filename, 
          b.size_mb, 
          b.created_at, 
          b.auto_generated,
          b.tables_included,
          u.first_name || ' ' || u.last_name as created_by_name,
          u.email as created_by_email
        FROM backups b
        LEFT JOIN users u ON b.created_by = u.id
        ORDER BY b.created_at DESC
      `);
      
      return res.status(200).json(result.rows);
    }

    // POST - Create new backup
    if (req.method === 'POST') {
      console.log('🔄 Creating backup...');
      
      // Export toate datele importante ca JSON
      const tables = ['users', 'daily_checkins', 'weight_entries', 'recipes'];
      const backupData = {};
      
      for (const table of tables) {
        const result = await pool.query(`SELECT * FROM ${table}`);
        backupData[table] = result.rows;
      }
      
      const jsonData = JSON.stringify(backupData, null, 2);
      const sizeMB = (new Blob([jsonData]).size / (1024 * 1024)).toFixed(2);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `backup_${timestamp}.json`;
      
      // Salvează backup în DB cu datele JSON
      const insertResult = await pool.query(`
        INSERT INTO backups (
          filename, 
          backup_data, 
          size_mb, 
          created_by, 
          auto_generated,
          tables_included
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, filename, size_mb, created_at
      `, [
        filename,
        jsonData,
        sizeMB,
        decoded.id,
        false,
        tables
      ]);
      
      console.log('✅ Backup created:', insertResult.rows[0]);
      return res.status(200).json(insertResult.rows[0]);
    }

    // PUT - RESTORE backup (⚠️ DESTRUCTIVE!)
    if (req.method === 'PUT') {
      const { backupId } = req.body;
      
      if (!backupId) {
        return res.status(400).json({ error: 'Backup ID required' });
      }
      
      console.log('⚠️ RESTORE: Getting backup data...');
      const backupResult = await pool.query('SELECT backup_data FROM backups WHERE id = $1', [backupId]);
      
      if (backupResult.rows.length === 0) {
        return res.status(404).json({ error: 'Backup not found' });
      }
      
      const backupData = JSON.parse(backupResult.rows[0].backup_data);
      const restored = [];
      
      // RESTORE fiecare tabel
      for (const [tableName, rows] of Object.entries(backupData)) {
        if (!rows || rows.length === 0) continue;
        
        try {
          console.log(`📥 Restoring ${tableName} (${rows.length} rows)...`);
          
          // Truncate + restart ID sequence
          await pool.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
          
          // Insert rows
          for (const row of rows) {
            const columns = Object.keys(row);
            const values = Object.values(row);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            
            await pool.query(
              `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
              values
            );
          }
          
          restored.push(tableName);
        } catch (error) {
          console.error(`❌ Error restoring ${tableName}:`, error);
        }
      }
      
      console.log('✅ RESTORE: Complete!');
      return res.status(200).json({ success: true, restored_tables: restored });
    }

    // DELETE - Delete backup
    if (req.method === 'DELETE') {
      const backupId = req.query.id || req.body?.id;
      
      if (!backupId) {
        return res.status(400).json({ error: 'Backup ID required' });
      }
      
      await pool.query('DELETE FROM backups WHERE id = $1', [backupId]);
      
      console.log('✅ Backup deleted:', backupId);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Backup error:', error);
    return res.status(500).json({ error: error.message });
  }
}

