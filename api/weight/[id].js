const weightEntries = global.weightEntries || (global.weightEntries = []);

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const index = weightEntries.findIndex((entry) => String(entry.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Weight entry not found' });
  }

  const [removed] = weightEntries.splice(index, 1);
  return res.status(200).json(removed);
}
