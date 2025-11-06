import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'nutriplan',
  user: process.env.USER,
  password: '',
});

// Calorii bazate pe ingrediente și tip de rețetă
const calculateCalories = (name, phase) => {
  const nameLower = name.toLowerCase();
  
  // Smoothies și băuturi = calorii mici
  if (nameLower.includes('smoothie') || nameLower.includes('blender') || nameLower.includes('shake')) {
    return 120 + Math.floor(Math.random() * 80); // 120-200
  }
  
  // Gustări = calorii medii mici
  if (nameLower.includes('snack') || nameLower.includes('pepene') || nameLower.includes('grepfrut') || nameLower.includes('para')) {
    return 80 + Math.floor(Math.random() * 70); // 80-150
  }
  
  // Salate = calorii medii
  if (nameLower.includes('salat')) {
    return 200 + Math.floor(Math.random() * 150); // 200-350
  }
  
  // Supe = calorii medii
  if (nameLower.includes('supa') || nameLower.includes('soup')) {
    return 180 + Math.floor(Math.random() * 120); // 180-300
  }
  
  // Pui = calorii medii-mari
  if (nameLower.includes('pui') || nameLower.includes('chicken')) {
    return 300 + Math.floor(Math.random() * 200); // 300-500
  }
  
  // Carne roșie = calorii mari
  if (nameLower.includes('file') || nameLower.includes('mignon') || nameLower.includes('muschiulet') || nameLower.includes('beef')) {
    return 350 + Math.floor(Math.random() * 250); // 350-600
  }
  
  // Pește = calorii medii
  if (nameLower.includes('peste') || nameLower.includes('ton') || nameLower.includes('somon') || nameLower.includes('fish') || nameLower.includes('halibut')) {
    return 250 + Math.floor(Math.random() * 200); // 250-450
  }
  
  // Omleta = calorii mici-medii
  if (nameLower.includes('omleta') || nameLower.includes('ou') || nameLower.includes('egg')) {
    return 200 + Math.floor(Math.random() * 150); // 200-350
  }
  
  // Curry și preparate indiene = calorii mari
  if (nameLower.includes('curry')) {
    return 400 + Math.floor(Math.random() * 200); // 400-600
  }
  
  // Chili = calorii medii-mari
  if (nameLower.includes('chili')) {
    return 320 + Math.floor(Math.random() * 180); // 320-500
  }
  
  // Terci și ovăz = calorii mici-medii
  if (nameLower.includes('terci') || nameLower.includes('ovaz') || nameLower.includes('oat')) {
    return 180 + Math.floor(Math.random() * 120); // 180-300
  }
  
  // Frigănele și pâine = calorii medii
  if (nameLower.includes('friganel') || nameLower.includes('paine') || nameLower.includes('toast')) {
    return 250 + Math.floor(Math.random() * 150); // 250-400
  }
  
  // Default bazat pe fază
  if (phase === 1) return 280 + Math.floor(Math.random() * 120); // 280-400
  if (phase === 2) return 220 + Math.floor(Math.random() * 100); // 220-320
  if (phase === 3) return 350 + Math.floor(Math.random() * 200); // 350-550
  
  return 300;
};

// Poze specifice pentru fiecare tip de rețetă
const getImageUrl = (name) => {
  const nameLower = name.toLowerCase();
  
  const imageMap = {
    'mango': 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800',
    'smoothie': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800',
    'ovaz': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800',
    'terci': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800',
    'oat': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800',
    'friganel': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800',
    'toast': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
    'salat': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    'ton': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    'tuna': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    'tartina': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    'wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
    'supa': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    'chili': 'https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?w=800',
    'pui': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
    'chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
    'file mignon': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800',
    'muschiulet': 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800',
    'grepfrut': 'https://images.unsplash.com/photo-1570055861428-0ad6f51d0b32?w=800',
    'para': 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800',
    'pepene': 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=800',
    'watermelon': 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=800',
    'omleta': 'https://images.unsplash.com/photo-1612240498155-8e6cf8f39c61?w=800',
    'omelet': 'https://images.unsplash.com/photo-1612240498155-8e6cf8f39c61?w=800',
    'bacon': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800',
    'gogosari': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800',
    'pepper': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800',
    'castravete': 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=800',
    'cucumber': 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=800',
    'curry': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
    'somon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
    'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
    'halibut': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
    'rice': 'https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?w=800',
    'orez': 'https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?w=800',
    'pilaf': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800',
  };
  
  for (const [keyword, url] of Object.entries(imageMap)) {
    if (nameLower.includes(keyword)) return url;
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
};

async function updateRecipes() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Actualizez toate rețetele cu calorii și poze corecte...\n');
    
    const result = await client.query('SELECT id, name_ro, phase FROM recipes ORDER BY id');
    const recipes = result.rows;
    
    let updated = 0;
    for (const recipe of recipes) {
      const calories = calculateCalories(recipe.name_ro, recipe.phase);
      const imageUrl = getImageUrl(recipe.name_ro);
      
      // Calculez macros bazat pe calorii
      const protein = Math.round(calories * 0.25 / 4); // 25% proteină
      const carbs = Math.round(calories * 0.45 / 4);   // 45% carbohidrați
      const fats = Math.round(calories * 0.30 / 9);    // 30% grăsimi
      
      await client.query(`
        UPDATE recipes 
        SET calories = $1, protein = $2, carbs = $3, fats = $4, image_url = $5
        WHERE id = $6
      `, [calories, protein, carbs, fats, imageUrl, recipe.id]);
      
      updated++;
      if (updated % 10 === 0) {
        console.log(`✅ ${updated}/${recipes.length} rețete actualizate...`);
      }
    }
    
    console.log(`\n✅ TOTAL: ${updated} rețete actualizate cu calorii și poze corecte!\n`);
    
  } finally {
    client.release();
    pool.end();
  }
}

updateRecipes();
