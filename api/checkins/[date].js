// Shared storage între /api/checkins și /api/checkins/[date]
// În producție ar fi baza de date, acum e în memorie
const checkins = global.checkins || (global.checkins = {});

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.query;
  
  // Mock user ID (în producție ar veni din token)
  const userId = 'user-1';
  const key = `${userId}-${date}`;
  
  // Returnează check-in pentru această dată sau null
  const checkin = checkins[key] || null;
  
  console.log(`✅ GET /api/checkins/${date}:`, checkin ? 'FOUND' : 'NULL');
  
  return res.status(200).json(checkin);
}

