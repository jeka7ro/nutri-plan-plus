import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  console.log('🔧 MIGRAȚIE VERCEL START');

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL lipsește!');
    }

    const sql = neon(databaseUrl);

    // Verificăm dacă coloanele există
    const checkColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('first_name', 'last_name', 'phone')
    `;

    console.log('✅ Coloane existente:', checkColumns);

    const existingColumns = checkColumns.map(c => c.column_name);
    const needsFirstName = !existingColumns.includes('first_name');
    const needsLastName = !existingColumns.includes('last_name');
    const needsPhone = !existingColumns.includes('phone');

    if (!needsFirstName && !needsLastName && !needsPhone) {
      console.log('✅ Toate coloanele există deja!');
      return res.json({ 
        success: true, 
        message: 'Toate coloanele există deja!',
        columns: existingColumns
      });
    }

    // Adăugăm coloanele lipsă
    const migrations = [];
    
    if (needsFirstName) {
      console.log('➕ Adăugăm first_name...');
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)`;
      migrations.push('first_name');
    }
    
    if (needsLastName) {
      console.log('➕ Adăugăm last_name...');
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`;
      migrations.push('last_name');
    }
    
    if (needsPhone) {
      console.log('➕ Adăugăm phone...');
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`;
      migrations.push('phone');
    }

    console.log('✅ MIGRAȚIE COMPLETĂ!');
    
    return res.json({ 
      success: true, 
      message: 'Migrație completă!',
      added: migrations,
      existing: existingColumns
    });

  } catch (error) {
    console.error('❌ EROARE MIGRAȚIE:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
}
