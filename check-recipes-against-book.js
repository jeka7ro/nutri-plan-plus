// Script pentru verificarea rețetelor față de cartea oficială Fast Metabolism Diet
// Nu modifică rețetele, doar verifică și generează un raport

import pkg from 'pg';
const { Pool } = pkg;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

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

// Reguli din cartea Fast Metabolism Diet
const RULES = {
  phases: [1, 2, 3],
  mealTypes: ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'],
  
  // Calorii maxime per tip de masă (conform cărții)
  maxCalories: {
    breakfast: 400,
    snack1: 150,  // Faza 1: doar fructe, Faza 2: proteine + legume, Faza 3: grăsimi sănătoase
    lunch: 500,
    snack2: 150,  // Similar cu snack1
    dinner: 500
  },
  
  // Ingrediente permise per fază
  allowedIngredients: {
    1: {
      // Faza 1: Carbohidrați complecși, fructe, proteine magre, fără grăsimi
      forbidden: ['butter', 'oil', 'avocado', 'nuts', 'seeds', 'unt', 'ulei', 'avocado', 'nuci', 'semințe'],
      required: ['carb', 'fruit', 'protein']
    },
    2: {
      // Faza 2: Proteine, legume, fără carbohidrați, fără grăsimi
      forbidden: ['rice', 'pasta', 'bread', 'fruit', 'oats', 'orez', 'paste', 'pâine', 'fructe', 'ovăz'],
      required: ['protein', 'vegetable']
    },
    3: {
      // Faza 3: Grăsimi sănătoase, proteine, legume, fructe cu grăsimi
      required: ['fat', 'protein']
    }
  }
};

async function checkRecipes() {
  const client = await pool.connect();
  const issues = [];
  
  try {
    console.log('🔍 Verific rețetele din baza de date...\n');
    
    // Verifică dacă coloana is_admin_recipe există
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'recipes' AND column_name = 'is_admin_recipe'
    `);
    
    const hasAdminRecipeColumn = columnCheck.rows.length > 0;
    
    // Obține toate rețetele (doar cele publice, nu cele admin)
    // Dacă is_admin_recipe există, folosim-o; altfel folosim user_id IS NULL ca indicator
    const whereClause = hasAdminRecipeColumn 
      ? 'WHERE is_admin_recipe = FALSE'
      : 'WHERE user_id IS NULL OR is_public = TRUE';
    
    const result = await client.query(`
      SELECT 
        id,
        name,
        name_ro,
        name_en,
        phase,
        meal_type,
        calories,
        protein,
        carbs,
        fats,
        ingredients,
        ingredients_ro,
        ingredients_en,
        instructions,
        instructions_ro,
        instructions_en,
        user_id
      FROM recipes
      ${whereClause}
      ORDER BY phase, meal_type, name_ro
    `);
    
    const recipes = result.rows;
    console.log(`📊 Total rețete de verificat: ${recipes.length}\n`);
    
    for (const recipe of recipes) {
      const recipeIssues = [];
      
      // 1. Verifică faza
      if (!recipe.phase || !RULES.phases.includes(recipe.phase)) {
        recipeIssues.push({
          type: 'Fază invalidă',
          message: `Faza ${recipe.phase || 'lipsă'} nu este validă. Trebuie să fie 1, 2 sau 3.`
        });
      }
      
      // 2. Verifică tipul de masă
      if (!recipe.meal_type || !RULES.mealTypes.includes(recipe.meal_type)) {
        recipeIssues.push({
          type: 'Tip masă invalid',
          message: `Tipul de masă "${recipe.meal_type || 'lipsă'}" nu este valid.`
        });
      }
      
      // 3. Verifică caloriile
      if (recipe.calories) {
        const maxCal = RULES.maxCalories[recipe.meal_type];
        if (maxCal && recipe.calories > maxCal) {
          recipeIssues.push({
            type: 'Calorii prea multe',
            message: `${recipe.calories} cal > ${maxCal} cal max pentru ${recipe.meal_type}`
          });
        }
      } else {
        recipeIssues.push({
          type: 'Calorii lipsă',
          message: 'Rețeta nu are calorii specificate.'
        });
      }
      
      // 4. Verifică ingredientele
      let ingredientsText = '';
      if (recipe.ingredients_ro) {
        ingredientsText = Array.isArray(recipe.ingredients_ro) 
          ? recipe.ingredients_ro.join(' ').toLowerCase()
          : recipe.ingredients_ro.toLowerCase();
      } else if (recipe.ingredients_en) {
        ingredientsText = Array.isArray(recipe.ingredients_en)
          ? recipe.ingredients_en.join(' ').toLowerCase()
          : recipe.ingredients_en.toLowerCase();
      }
      
      if (recipe.phase && RULES.allowedIngredients[recipe.phase]) {
        const rules = RULES.allowedIngredients[recipe.phase];
        
        // Verifică ingrediente interzise
        if (rules.forbidden) {
          for (const forbidden of rules.forbidden) {
            // Verifică dacă ingredientul interzis apare ca cuvânt întreg, nu doar ca parte dintr-un alt cuvânt
            const regex = new RegExp(`\\b${forbidden}\\b`, 'i');
            if (regex.test(ingredientsText)) {
              recipeIssues.push({
                type: 'Ingredient interzis',
                message: `Conține "${forbidden}" care nu este permis în Faza ${recipe.phase}`
              });
            }
          }
        }
      }
      
      // 5. Verifică dacă are ingrediente
      if (!ingredientsText || ingredientsText.trim().length < 10) {
        recipeIssues.push({
          type: 'Ingrediente incomplete',
          message: 'Ingredientele sunt incomplete sau lipsă.'
        });
      }
      
      // 6. Verifică instrucțiunile
      const instructions = recipe.instructions_ro || recipe.instructions_en || recipe.instructions;
      if (!instructions || (typeof instructions === 'string' && instructions.trim().length < 20)) {
        recipeIssues.push({
          type: 'Instrucțiuni incomplete',
          message: 'Instrucțiunile sunt incomplete sau lipsă.'
        });
      }
      
      // 7. Verifică macros
      if (recipe.phase === 1) {
        // Faza 1: carbohidrați mari, grăsimi mici (max 5g grăsimi)
        if (recipe.fats && recipe.fats > 5) {
          recipeIssues.push({
            type: 'Grăsimi prea multe (Faza 1)',
            message: `${recipe.fats}g grăsimi > 5g max pentru Faza 1`
          });
        }
      } else if (recipe.phase === 2) {
        // Faza 2: proteine mari, carbohidrați mici
        // NOTĂ: Legumele au carbohidrați naturali, deci verificăm doar dacă sunt carbohidrați din surse interzise
        // Limita de 10g se aplică doar pentru carbohidrați din surse interzise (orez, paste, pâine, fructe)
        // Nu verificăm carbohidrații din legume (broccoli, spanac, etc.)
        // Această verificare va fi făcută prin verificarea ingredientelor interzise
      } else if (recipe.phase === 3) {
        // Faza 3: grăsimi sănătoase (min 10g grăsimi)
        if (recipe.fats && recipe.fats < 10) {
          recipeIssues.push({
            type: 'Grăsimi prea puține (Faza 3)',
            message: `${recipe.fats}g grăsimi < 10g min pentru Faza 3`
          });
        }
      }
      
      // 8. Verifică numele
      if (!recipe.name_ro && !recipe.name_en) {
        recipeIssues.push({
          type: 'Nume lipsă',
          message: 'Rețeta nu are nume în română sau engleză.'
        });
      }
      
      if (recipeIssues.length > 0) {
        issues.push({
          id: recipe.id,
          name: recipe.name_ro || recipe.name_en || recipe.name || 'Fără nume',
          phase: recipe.phase,
          meal_type: recipe.meal_type,
          calories: recipe.calories,
          issues: recipeIssues
        });
      }
    }
    
    // Generează raportul
    console.log('\n' + '='.repeat(80));
    console.log('📋 RAPORT VERIFICARE REȚETE');
    console.log('='.repeat(80) + '\n');
    
    if (issues.length === 0) {
      console.log('✅ Toate rețetele sunt conforme cu cartea!\n');
    } else {
      console.log(`⚠️  Găsite ${issues.length} rețete cu probleme:\n`);
      
      // Grupează după tip de problemă
      const issuesByType = {};
      issues.forEach(recipe => {
        recipe.issues.forEach(issue => {
          if (!issuesByType[issue.type]) {
            issuesByType[issue.type] = [];
          }
          issuesByType[issue.type].push({
            id: recipe.id,
            name: recipe.name,
            phase: recipe.phase,
            meal_type: recipe.meal_type,
            message: issue.message
          });
        });
      });
      
      // Afișează problemele grupate
      Object.keys(issuesByType).sort().forEach(type => {
        console.log(`\n🔴 ${type} (${issuesByType[type].length} rețete):`);
        console.log('-'.repeat(80));
        issuesByType[type].forEach(item => {
          console.log(`  • ID ${item.id}: ${item.name}`);
          console.log(`    Faza ${item.phase}, ${item.meal_type}, ${item.message}`);
        });
      });
      
      // Listă completă de rețete cu probleme
      console.log('\n\n' + '='.repeat(80));
      console.log('📝 LISTĂ COMPLETĂ REȚETE CU PROBLEME');
      console.log('='.repeat(80) + '\n');
      
      issues.forEach(recipe => {
        console.log(`\nID: ${recipe.id} | ${recipe.name}`);
        console.log(`Faza: ${recipe.phase} | Tip: ${recipe.meal_type} | Calorii: ${recipe.calories || 'N/A'}`);
        console.log(`Probleme:`);
        recipe.issues.forEach(issue => {
          console.log(`  - ${issue.type}: ${issue.message}`);
        });
      });
      
      // Export JSON pentru analiză ulterioară
      if (issues.length > 0) {
        try {
          const fs = await import('fs');
          const reportPath = join(__dirname, 'recipe-issues-report.json');
          fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2), 'utf8');
          console.log(`\n💾 Raport salvat în: ${reportPath}`);
        } catch (err) {
          console.log('\n⚠️  Nu s-a putut salva raportul JSON:', err.message);
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ Verificare completă: ${recipes.length} rețete verificate`);
    console.log(`⚠️  Rețete cu probleme: ${issues.length}`);
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Eroare la verificare:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRecipes();

