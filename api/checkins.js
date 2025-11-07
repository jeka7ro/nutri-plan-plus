// MOCK ENDPOINT - salvează în memory (fără bază de date)
// Folosim global.checkins pentru a persista între request-uri
const checkins = global.checkins || (global.checkins = {});
const nextCheckInId = () => {
  global.checkinsCounter = (global.checkinsCounter || 0) + 1;
  return global.checkinsCounter;
};

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    // SALVARE check-in
    const data = req.body;
    const date = data.date || new Date().toISOString().split('T')[0];
    
    // Mock user ID (în producție ar veni din token)
    const userId = 'user-1';
    const key = `${userId}-${date}`;
    
    // Salvează în memory
    checkins[key] = {
      ...checkins[key],
      ...data,
      user_id: userId,
      date: date,
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Check-in saved:', checkins[key]);
    
    return res.status(200).json(checkins[key]);
  }
  
  if (req.method === 'GET') {
    // RETURNARE listă check-ins
    return res.status(200).json(Object.values(checkins));
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

