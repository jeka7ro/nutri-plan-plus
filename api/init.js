// Vercel Serverless Function pentru INIT + SEED DATABASE
import pool from '../server/database-pg.js';
import { initDatabase } from '../server/database-pg.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('🚀 INIT DATABASE START...');
    
    // 1. Creează toate tabelele
    await initDatabase();
    
    // 2. Verifică dacă există admin user
    const adminCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['jeka7ro@gmail.com']
    );
    
    if (adminCheck.rows.length === 0) {
      // 3. Creează admin user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123777', 10);
      
      await pool.query(`
        INSERT INTO users (email, password, name, role, subscription_tier)
        VALUES ($1, $2, $3, $4, $5)
      `, ['jeka7ro@gmail.com', hashedPassword, 'Admin', 'admin', 'premium']);
      
      console.log('✅ Admin user creat!');
    }
    
    // 4. Seed CORRECT snacks from official Haylie Pomroy book
    console.log('📚 Seeding snacks from official book...');
    
    // Clear existing recipes
    await pool.query('DELETE FROM recipes');
    
    // PHASE 1 SNACKS - DOAR FRUCTE! (carte pag. 2)
    const phase1Snacks = [
      ['Apple Slices', 'Felii de Măr', 1, 'snack1', 1, 2, 0, 95, 0.5, 25, 0.3, '1 medium apple', '1 măr mediu', 'Wash and slice apple.', 'Spălați și tăiați mărul.', 'Rich in fiber and vitamin C.', 'Bogat în fibre și vitamina C.', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400'],
      ['Fresh Mango', 'Mango Proaspăt', 1, 'snack2', 1, 3, 0, 135, 1, 35, 0.6, '1 cup mango chunks', '1 cană cuburi mango', 'Peel and cut mango.', 'Curățați și tăiați mango.', 'High in vitamins A and C.', 'Bogat în vitamine A și C.', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'],
      ['Fresh Strawberries', 'Căpșuni Proaspete', 1, 'snack1', 1, 2, 0, 50, 1, 12, 0.5, '1 cup strawberries', '1 cană căpșuni', 'Wash and remove stems.', 'Spălați și îndepărtați cozile.', 'Packed with antioxidants.', 'Plin de antioxidanți.', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'],
      ['Pear', 'Pară', 1, 'snack2', 1, 1, 0, 100, 0.6, 27, 0.2, '1 medium pear', '1 pară medie', 'Wash and eat.', 'Spălați și consumați.', 'High fiber fruit.', 'Fruct bogat în fibre.', 'https://images.unsplash.com/photo-1568607689150-17e625c1586e?w=400'],
      ['Watermelon Cubes', 'Cuburi de Pepene', 1, 'snack1', 1, 5, 0, 85, 1.7, 21, 0.4, '2 cups watermelon', '2 căni pepene', 'Cut into cubes.', 'Tăiați în cuburi.', 'Hydrating and refreshing.', 'Hidratant și răcoritor.', 'https://images.unsplash.com/photo-1589984662646-e7b2e00b3e23?w=400']
    ];

    // PHASE 2 SNACKS - DOAR PROTEINE! (carte pag. 4)
    const phase2Snacks = [
      ['Hard-Boiled Egg Whites', 'Albuș de Ou Fiert', 2, 'snack1', 1, 2, 10, 68, 14, 1, 0.2, '4 egg whites', '4 albușuri', 'Boil eggs, remove yolks.', 'Fierbeți ouăle, scoateți gălbenușurile.', 'Pure protein, fat-free.', 'Proteină pură, fără grăsimi.', 'https://images.unsplash.com/photo-1587486937692-0197703ec0a0?w=400'],
      ['Sliced Turkey Breast', 'Piept de Curcan Felii', 2, 'snack2', 1, 2, 0, 110, 24, 0, 1, '3 oz turkey breast', '85g piept curcan', 'Roll up turkey slices.', 'Rulați feliile de curcan.', 'Lean protein source.', 'Sursă de proteină slabă.', 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400'],
      ['Tuna from Can', 'Ton din Conservă', 2, 'snack1', 1, 2, 0, 100, 22, 0, 1, '3 oz tuna in water', '85g ton în apă', 'Drain and eat.', 'Scurgeți și consumați.', 'High protein, omega-3.', 'Bogat în proteine, omega-3.', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400'],
      ['Grilled Chicken Strips', 'Fâșii de Pui la Grătar', 2, 'snack2', 1, 5, 10, 120, 26, 0, 1.5, '3 oz chicken breast', '85g piept de pui', 'Grill and slice chicken.', 'Grătarul și tăiați puiul.', 'Lean protein for muscles.', 'Proteină slabă pentru mușchi.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'],
      ['Beef Jerky', 'Jerky de Vită', 2, 'snack1', 1, 0, 0, 115, 20, 3, 2, '1 oz nitrate-free jerky', '30g jerky fără nitrați', 'Enjoy as portable snack.', 'Consumați ca gustare portabilă.', 'Convenient protein.', 'Proteină convenabilă.', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400']
    ];

    const allSnacks = [...phase1Snacks, ...phase2Snacks];
    
    for (const snack of allSnacks) {
      await pool.query(`
        INSERT INTO recipes (
          name_en, name_ro, phase, meal_type, servings, prep_time, cook_time,
          calories, protein, carbs, fat, ingredients_en, ingredients_ro,
          instructions_en, instructions_ro, benefits_en, benefits_ro, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, snack);
    }
    
    console.log(`✅ Seeded ${allSnacks.length} snacks from official book!`);
    
    const recipesCount = allSnacks.length;
    
    res.status(200).json({
      success: true,
      message: 'Database initialized with CORRECT snacks from official Haylie Pomroy book!',
      source: 'Fast Metabolism Diet - Haylie Pomroy (official)',
      tables_created: true,
      admin_user_exists: true,
      recipes_count: recipesCount,
      phase1_snacks: 'FRUITS ONLY (5 recipes)',
      phase2_snacks: 'PROTEIN ONLY (5 recipes)',
      next_step: 'Ready to use!'
    });
    
  } catch (error) {
    console.error('❌ INIT ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}

