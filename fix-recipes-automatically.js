// Script pentru corectarea automată a problemelor găsite în rețete
// NU modifică rețetele admin (is_admin_recipe = true)

import pkg from 'pg';
const { Pool } = pkg;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Încarcă variabilele de mediu din .env dacă există
try {
  const envFile = readFileSync(join(__dirname, '.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
} catch (err) {
  // .env nu există, folosește variabilele de mediu existente
}

// Configurare conexiune baza de date
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = connectionString 
  ? new Pool({
      connectionString,
      ssl: connectionString.includes('render.com') || connectionString.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'nutriplan',
      user: process.env.DB_USER || process.env.USER,
      password: process.env.DB_PASSWORD || ''
    });

// Limite conform cărții
const LIMITS = {
  calories: {
    breakfast: 400,
    snack1: 150,
    lunch: 500,
    snack2: 150,
    dinner: 500
  },
  macros: {
    1: { fats: 5 },      // Faza 1: max 5g grăsimi
    2: { carbs: 10 },    // Faza 2: max 10g carbohidrați
    3: { fats: 10 }       // Faza 3: min 10g grăsimi
  }
};

// Ingrediente interzise și înlocuitori
const FORBIDDEN_INGREDIENTS = {
  1: {
    'unt': 'elimină', // Faza 1: elimină untul
    'ulei': 'elimină',
    'butter': 'elimină',
    'oil': 'elimină',
    'avocado': 'elimină',
    'nuci': 'elimină',
    'nuts': 'elimină'
  },
  2: {
    'pasta': 'elimină', // Faza 2: elimină pastele
    'orez': 'elimină',
    'rice': 'elimină',
    'pâine': 'elimină',
    'bread': 'elimină',
    'fructe': 'elimină',
    'fruit': 'elimină'
  }
};

async function fixRecipes() {
  const client = await pool.connect();
  const fixes = [];
  const needsManualReview = [];
  
  try {
    // Încarcă raportul cu probleme
    const issuesReportPath = join(__dirname, 'recipe-issues-report.json');
    let issues;
    try {
      issues = JSON.parse(readFileSync(issuesReportPath, 'utf8'));
    } catch (err) {
      console.error('❌ Nu pot citi raportul. Rulează mai întâi: npm run check-recipes');
      return;
    }
    
    console.log('🔧 Corectez automat problemele găsite...\n');
    
    // Verifică dacă coloana is_admin_recipe există
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'recipes' AND column_name = 'is_admin_recipe'
    `);
    const hasAdminRecipeColumn = columnCheck.rows.length > 0;
    
    for (const recipeIssue of issues) {
      const recipeId = recipeIssue.id;
      
      // Verifică dacă e rețetă admin (nu o modificăm)
      // Rețetele admin sunt doar cele cu is_admin_recipe = true
      // Rețetele cu user_id = NULL sunt rețete publice, NU admin
      let isAdmin = false;
      if (hasAdminRecipeColumn) {
        const recipeCheck = await client.query(`
          SELECT is_admin_recipe FROM recipes WHERE id = $1
        `, [recipeId]);
        if (recipeCheck.rows.length === 0) continue;
        isAdmin = recipeCheck.rows[0].is_admin_recipe === true;
      }
      // Dacă nu există coloana is_admin_recipe, nu considerăm nicio rețetă ca admin
      // (toate rețetele pot fi corectate)
      
      if (isAdmin) {
        console.log(`⏭️  Skip rețetă admin: ${recipeIssue.name} (ID: ${recipeId})`);
        continue;
      }
      
      // Obține rețeta completă
      const recipeResult = await client.query(`
        SELECT * FROM recipes WHERE id = $1
      `, [recipeId]);
      
      if (recipeResult.rows.length === 0) continue;
      
      const recipe = recipeResult.rows[0];
      const updates = {};
      const recipeFixes = [];
      
      // Procesează fiecare problemă
      for (const issue of recipeIssue.issues) {
        if (issue.type === 'Calorii prea multe') {
          const maxCal = LIMITS.calories[recipe.meal_type];
          if (maxCal && recipe.calories > maxCal) {
            // Reduce calorii proporțional cu macros
            const ratio = maxCal / recipe.calories;
            updates.calories = maxCal;
            if (recipe.protein) updates.protein = Math.round(recipe.protein * ratio * 10) / 10;
            if (recipe.carbs) updates.carbs = Math.round(recipe.carbs * ratio * 10) / 10;
            if (recipe.fats) updates.fats = Math.round(recipe.fats * ratio * 10) / 10;
            recipeFixes.push(`Calorii: ${recipe.calories} → ${maxCal}`);
          }
        }
        
        else if (issue.type === 'Grăsimi prea multe (Faza 1)') {
          if (recipe.phase === 1 && recipe.fats > 5) {
            // Reduce grăsimile la maxim 5g și ajustează calorii
            updates.fats = 5;
            // Ajustează calorii doar dacă nu depășește deja limita pentru tipul de masă
            if (recipe.calories) {
              const fatCalories = recipe.fats * 9;
              const newFatCalories = 5 * 9;
              const calorieReduction = fatCalories - newFatCalories;
              const newCalories = Math.round(recipe.calories - calorieReduction);
              const maxCal = LIMITS.calories[recipe.meal_type];
              // Nu reduce caloriile sub limita maximă dacă deja erau corecte
              if (newCalories >= maxCal || recipe.calories <= maxCal) {
                updates.calories = Math.max(maxCal || 100, newCalories);
              } else {
                updates.calories = newCalories;
              }
            }
            recipeFixes.push(`Grăsimi: ${recipe.fats}g → 5g`);
          }
        }
        
        // NOTĂ: Nu corectăm automat carbohidrații în Faza 2 pentru că legumele au carbohidrați naturali
        // Verificarea se face prin ingrediente interzise, nu prin limita de carbohidrați
        
        else if (issue.type === 'Grăsimi prea puține (Faza 3)') {
          if (recipe.phase === 3 && recipe.fats < 10) {
            // Mărește grăsimile la minim 10g și ajustează proporțional
            updates.fats = 10;
            // Ajustează calorii proporțional
            if (recipe.calories) {
              const fatCalories = recipe.fats * 9;
              const newFatCalories = 10 * 9;
              const calorieIncrease = newFatCalories - fatCalories;
              updates.calories = Math.round(recipe.calories + calorieIncrease);
            }
            recipeFixes.push(`Grăsimi: ${recipe.fats}g → 10g`);
          }
        }
        
        else if (issue.type === 'Ingredient interzis') {
          // Extrage ingredientul interzis din mesaj
          const match = issue.message.match(/Conține "([^"]+)" care nu este permis/);
          if (match && FORBIDDEN_INGREDIENTS[recipe.phase]) {
            const forbiddenWord = match[1].toLowerCase();
            if (FORBIDDEN_INGREDIENTS[recipe.phase][forbiddenWord] === 'elimină') {
              // Elimină ingredientul din lista de ingrediente
              let ingredientsRo = recipe.ingredients_ro;
              let ingredientsEn = recipe.ingredients_en;
              
              if (ingredientsRo) {
                const ingArray = Array.isArray(ingredientsRo) ? ingredientsRo : JSON.parse(ingredientsRo);
                const regex = new RegExp(`\\b${forbiddenWord}\\b`, 'i');
                const filtered = ingArray.filter(ing => !regex.test(ing.toLowerCase()));
                updates.ingredients_ro = JSON.stringify(filtered);
              }
              
              if (ingredientsEn) {
                const ingArray = Array.isArray(ingredientsEn) ? ingredientsEn : JSON.parse(ingredientsEn);
                const regex = new RegExp(`\\b${forbiddenWord}\\b`, 'i');
                const filtered = ingArray.filter(ing => !regex.test(ing.toLowerCase()));
                updates.ingredients_en = JSON.stringify(filtered);
              }
              
              // Ajustează macros/calorii dacă ingredientul eliminat afectează valorile
              // De exemplu, dacă eliminăm "unt" sau "ulei", reducem grăsimile
              if (['unt', 'ulei', 'butter', 'oil'].includes(forbiddenWord) && recipe.phase === 1) {
                // Deja am ajustat grăsimile în problema "Grăsimi prea multe"
                // Dar dacă nu era marcată, ajustăm acum
                if (!updates.fats && recipe.fats > 5) {
                  updates.fats = 5;
                  if (recipe.calories) {
                    const fatCalories = recipe.fats * 9;
                    const newFatCalories = 5 * 9;
                    const calorieReduction = fatCalories - newFatCalories;
                    updates.calories = Math.max(100, Math.round(recipe.calories - calorieReduction));
                  }
                }
              }
              
              recipeFixes.push(`Eliminat ingredient interzis: "${forbiddenWord}"`);
            }
          }
        }
        
        else if (issue.type === 'Ingrediente incomplete') {
          // Nu corectăm automat, doar marchem pentru revizuire manuală
          needsManualReview.push({
            id: recipeId,
            name: recipeIssue.name,
            phase: recipe.phase,
            meal_type: recipe.meal_type,
            issue: issue.message
          });
        }
      }
      
      // Aplică update-urile dacă există
      if (Object.keys(updates).length > 0) {
        const keys = Object.keys(updates);
        const setClause = keys
          .map((key, idx) => `${key} = $${idx + 1}`)
          .join(', ');
        
        const values = keys.map(key => updates[key]);
        values.push(recipeId);
        
        await client.query(`
          UPDATE recipes 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${values.length}
        `, values);
        
        fixes.push({
          id: recipeId,
          name: recipeIssue.name,
          phase: recipe.phase,
          meal_type: recipe.meal_type,
          fixes: recipeFixes
        });
        
        console.log(`✅ ${recipeIssue.name} (ID: ${recipeId}): ${recipeFixes.join(', ')}`);
      }
    }
    
    // Generează raportul final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPORT CORECTARE AUTOMATĂ');
    console.log('='.repeat(80) + '\n');
    
    console.log(`✅ Rețete corectate: ${fixes.length}`);
    console.log(`⚠️  Rețete care necesită revizuire manuală: ${needsManualReview.length}\n`);
    
    if (needsManualReview.length > 0) {
      console.log('📝 Rețete care necesită intervenție manuală:\n');
      needsManualReview.forEach(item => {
        console.log(`  • ID ${item.id}: ${item.name}`);
        console.log(`    Faza ${item.phase}, ${item.meal_type}`);
        console.log(`    Problema: ${item.issue}\n`);
      });
    }
    
    // Salvează raportul
    const report = {
      timestamp: new Date().toISOString(),
      fixed: fixes,
      needsManualReview: needsManualReview,
      summary: {
        totalFixed: fixes.length,
        totalNeedsReview: needsManualReview.length
      }
    };
    
    const reportPath = join(__dirname, 'recipe-fixes-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`💾 Raport salvat în: ${reportPath}\n`);
    
    console.log('='.repeat(80));
    console.log('✅ Corectare automată finalizată!');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Eroare la corectare:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixRecipes();

