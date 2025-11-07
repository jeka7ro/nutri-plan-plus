// Mock endpoint pentru mesajele de suport (nu există încă tabelul în DB)
export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Returnează array gol - tabelul support_messages nu există încă
  return res.status(200).json([]);
}

