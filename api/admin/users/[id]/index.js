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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🗑️ [API /admin/users/[id]] Delete user request received');
    
    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    // Get current user to check if admin
    const currentUserResult = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    
    if (currentUserResult.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    if (currentUserResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get user ID from URL
    const { id: userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Prevent admin from deleting themselves
    if (parseInt(userId) === decoded.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Check if target user exists
    const targetUserResult = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
    
    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'Target user not found' });
    }
    
    const targetUser = targetUserResult.rows[0];
    
    // Start transaction for complete deletion
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete all related data (CASCADE should handle most, but let's be explicit)
      console.log(`🗑️ Deleting all data for user ${targetUser.email}...`);
      
      // Delete user recipes
      await client.query('DELETE FROM user_recipes WHERE user_id = $1', [userId]);
      console.log('✅ Deleted user recipes');
      
      // Delete weight entries
      await client.query('DELETE FROM weight_entries WHERE user_id = $1', [userId]);
      console.log('✅ Deleted weight entries');
      
      // Delete daily checkins
      await client.query('DELETE FROM daily_checkins WHERE user_id = $1', [userId]);
      console.log('✅ Deleted daily checkins');
      
      // Delete friendships (both directions)
      await client.query('DELETE FROM friends WHERE user_id_1 = $1 OR user_id_2 = $1', [userId]);
      console.log('✅ Deleted friendships');
      
      // Delete messages (both sent and received)
      await client.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [userId]);
      console.log('✅ Deleted messages');
      
      // Delete subscriptions
      await client.query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);
      console.log('✅ Deleted subscriptions');
      
      // Delete email verification tokens
      await client.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [userId]);
      console.log('✅ Deleted email verification tokens');
      
      // Delete password reset tokens
      await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
      console.log('✅ Deleted password reset tokens');
      
      // Finally, delete the user
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      console.log('✅ Deleted user account');
      
      await client.query('COMMIT');
      
      console.log(`✅ User ${targetUser.email} completely deleted by admin ${decoded.id}`);
      
      return res.status(200).json({ 
        success: true, 
        message: `User ${targetUser.email} and all associated data deleted successfully` 
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Delete user error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
}
