// REAL ENDPOINT - Sistem prieteni în PostgreSQL
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
  
  // Verifică autentificarea
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Asigură-te că tabelele există
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sender_id, receiver_id)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id_1 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_id_2 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id_1, user_id_2),
        CHECK (user_id_1 < user_id_2)
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_friends_users ON friends(user_id_1, user_id_2)`);
  } catch (error) {
    console.error('❌ Error creating friend tables:', error);
  }
  
  // GET /api/friends?search=email - Căutare utilizatori
  if (req.method === 'GET' && req.query.search) {
    const { search } = req.query;
    
    try {
      // Caută user după email
      const result = await pool.query(`
        SELECT 
          id,
          first_name,
          last_name,
          email,
          profile_picture
        FROM users
        WHERE email ILIKE $1 AND id != $2
        LIMIT 20
      `, [`%${search}%`, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No users found' });
      }
      
      // Pentru fiecare user, verifică status-ul
      const usersWithStatus = await Promise.all(result.rows.map(async (user) => {
        const friendCheck = await pool.query(`
          SELECT id FROM friends 
          WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)
        `, [Math.min(userId, user.id), Math.max(userId, user.id)]);
        
        if (friendCheck.rows.length > 0) {
          return { ...user, status: 'friends' };
        }
        
        const requestCheck = await pool.query(`
          SELECT id, sender_id FROM friend_requests 
          WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)) AND status = 'pending'
        `, [userId, user.id]);
        
        if (requestCheck.rows.length > 0) {
          const isSentByMe = requestCheck.rows[0].sender_id === userId;
          return { ...user, status: isSentByMe ? 'pending_sent' : 'pending_received' };
        }
        
        return { ...user, status: 'none' };
      }));
      
      return res.status(200).json(usersWithStatus);
    } catch (error) {
      console.error('❌ Search users error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET /api/friends?requests=true - Cereri de prietenie
  if (req.method === 'GET' && req.query.requests === 'true') {
    try {
      // Cereri PRIMITE
      const received = await pool.query(`
        SELECT 
          fr.id,
          fr.status,
          fr.created_at,
          u.id as user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.profile_picture,
          'received' as type
        FROM friend_requests fr
        JOIN users u ON fr.sender_id = u.id
        WHERE fr.receiver_id = $1 AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
      `, [userId]);
      
      // Cereri TRIMISE
      const sent = await pool.query(`
        SELECT 
          fr.id,
          fr.status,
          fr.created_at,
          u.id as user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.profile_picture,
          'sent' as type
        FROM friend_requests fr
        JOIN users u ON fr.receiver_id = u.id
        WHERE fr.sender_id = $1 AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
      `, [userId]);
      
      return res.status(200).json({
        received: received.rows,
        sent: sent.rows
      });
    } catch (error) {
      console.error('❌ Friend requests GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // GET /api/friends - Listă prieteni
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT 
          f.id,
          CASE 
            WHEN f.user_id_1 = $1 THEN f.user_id_2
            ELSE f.user_id_1
          END as friend_id,
          CASE 
            WHEN f.user_id_1 = $1 THEN u2.first_name
            ELSE u1.first_name
          END as first_name,
          CASE 
            WHEN f.user_id_1 = $1 THEN u2.last_name
            ELSE u1.last_name
          END as last_name,
          CASE 
            WHEN f.user_id_1 = $1 THEN u2.email
            ELSE u1.email
          END as email,
          CASE 
            WHEN f.user_id_1 = $1 THEN u2.profile_picture
            ELSE u1.profile_picture
          END as profile_picture,
          f.created_at
        FROM friends f
        LEFT JOIN users u1 ON f.user_id_1 = u1.id
        LEFT JOIN users u2 ON f.user_id_2 = u2.id
        WHERE f.user_id_1 = $1 OR f.user_id_2 = $1
        ORDER BY f.created_at DESC
      `, [userId]);
      
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Friends GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // PUT /api/friends - Accept/Refuză cerere de prietenie
  if (req.method === 'PUT') {
    const { requestId, action } = req.body;
    
    if (!requestId || !action) {
      return res.status(400).json({ error: 'Request ID and action required' });
    }
    
    try {
      // Verifică că cererea e pentru user-ul curent
      const requestResult = await pool.query(
        'SELECT * FROM friend_requests WHERE id = $1 AND receiver_id = $2',
        [requestId, userId]
      );
      
      if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      
      const request = requestResult.rows[0];
      
      if (action === 'accept') {
        // Actualizează status-ul
        await pool.query(
          'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['accepted', requestId]
        );
        
        // Adaugă în friends (user_id_1 < user_id_2)
        const userId1 = Math.min(request.sender_id, request.receiver_id);
        const userId2 = Math.max(request.sender_id, request.receiver_id);
        
        await pool.query(`
          INSERT INTO friends (user_id_1, user_id_2)
          VALUES ($1, $2)
          ON CONFLICT (user_id_1, user_id_2) DO NOTHING
        `, [userId1, userId2]);
        
        // Creează notificare pentru sender că cererea a fost acceptată
        const receiverData = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
        const receiverName = receiverData.rows[0]?.first_name && receiverData.rows[0]?.last_name 
          ? `${receiverData.rows[0].first_name} ${receiverData.rows[0].last_name}` 
          : 'Cineva';
        
        await pool.query(`
          INSERT INTO notifications (user_id, type, related_user_id, message, action_url)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          request.sender_id,
          'friend_accepted',
          userId,
          `${receiverName} a acceptat cererea ta de prietenie`,
          '/friends'
        ]);
        
        console.log('✅ Friend request accepted:', requestId);
        return res.status(200).json({ success: true, action: 'accepted' });
        
      } else if (action === 'reject') {
        await pool.query(
          'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['rejected', requestId]
        );
        
        console.log('✅ Friend request rejected:', requestId);
        return res.status(200).json({ success: true, action: 'rejected' });
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('❌ Friend request PUT error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // POST /api/friends - Trimite cerere de prietenie
  if (req.method === 'POST') {
    const { friendEmail } = req.body;
    
    if (!friendEmail) {
      return res.status(400).json({ error: 'Friend email required' });
    }
    
    try {
      // Găsește user-ul după email
      const friendResult = await pool.query(
        'SELECT id, first_name, last_name, email FROM users WHERE email = $1',
        [friendEmail]
      );
      
      if (friendResult.rows.length === 0) {
        return res.status(404).json({ error: language === 'ro' ? 'Utilizator negăsit' : 'User not found' });
      }
      
      const friendId = friendResult.rows[0].id;
      
      if (friendId === userId) {
        return res.status(400).json({ error: language === 'ro' ? 'Nu te poți adăuga pe tine ca prieten' : 'Cannot add yourself as friend' });
      }
      
      // Verifică dacă există deja o cerere sau prietenie
      const existingRequest = await pool.query(
        'SELECT id, status FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)',
        [userId, friendId]
      );
      
      if (existingRequest.rows.length > 0) {
        return res.status(400).json({ error: language === 'ro' ? 'Cerere existentă deja' : 'Request already exists' });
      }
      
      // Creează cerere nouă
      const result = await pool.query(`
        INSERT INTO friend_requests (sender_id, receiver_id, status)
        VALUES ($1, $2, 'pending')
        RETURNING *
      `, [userId, friendId]);
      
      // Creează notificare pentru receiver
      const senderData = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
      const senderName = senderData.rows[0]?.first_name && senderData.rows[0]?.last_name 
        ? `${senderData.rows[0].first_name} ${senderData.rows[0].last_name}` 
        : 'Cineva';
      
      await pool.query(`
        INSERT INTO notifications (user_id, type, related_user_id, message, action_url)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        friendId,
        'friend_request',
        userId,
        `${senderName} ți-a trimis o cerere de prietenie`,
        '/friends'
      ]);
      
      console.log('✅ Friend request created:', result.rows[0]);
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('❌ Friend request POST error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  // DELETE /api/friends/:id - Șterge prieten
  if (req.method === 'DELETE') {
    const friendshipId = req.query.id;
    
    try {
      await pool.query(
        'DELETE FROM friends WHERE id = $1 AND (user_id_1 = $2 OR user_id_2 = $2)',
        [friendshipId, userId]
      );
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Friend DELETE error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

