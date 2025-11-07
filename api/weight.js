const weightEntries = global.weightEntries || (global.weightEntries = []);
const nextWeightId = () => {
  global.weightCounter = (global.weightCounter || 0) + 1;
  return global.weightCounter;
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(weightEntries);
  }

  if (req.method === 'POST') {
    try {
      const { weight, date, notes, mood } = req.body || {};

      if (typeof weight !== 'number' || Number.isNaN(weight)) {
        return res.status(400).json({ error: 'Weight (number) is required' });
      }

      const entry = {
        id: nextWeightId(),
        weight,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || '',
        mood: mood || 'normal',
        created_at: new Date().toISOString(),
      };

      weightEntries.unshift(entry);
      return res.status(201).json(entry);
    } catch (error) {
      console.error('Weight POST error:', error);
      return res.status(500).json({ error: 'Failed to save weight entry' });
    }
  }

  if (req.method === 'DELETE') {
    // Handle DELETE with ID from query parameter
    const { id } = req.query;
    const index = weightEntries.findIndex((entry) => String(entry.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Weight entry not found' });
    }

    const [removed] = weightEntries.splice(index, 1);
    return res.status(200).json(removed);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
