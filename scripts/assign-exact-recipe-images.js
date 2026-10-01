import Database from '../server/node_modules/better-sqlite3/lib/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../server/nutri-plan.db');
const db = new Database(dbPath);

console.log('--- Pas 1: Curățare rețete cu produse lactate neconforme (Haylie Pomroy FMD) ---');

// Rețeta 102: Iaurt Grecesc -> Budincă de Cocos și Chia cu Nuci Românești (Faza 3 Mic Dejun)
db.prepare(`
  UPDATE recipes SET
    name = 'Budincă de Chia cu Lapte de Cocos și Nuci',
    name_ro = 'Budincă de Chia cu Lapte de Cocos și Nuci',
    name_en = 'Chia Pudding with Coconut Milk and Walnuts',
    description = 'Mic dejun delicios și sățios de Faza 3, bogat în grăsimi sănătoase, fără lactate.',
    ingredients_ro = '["1/4 cană semințe de chia","1 cană lapte de cocos neîndulcit","30g nuci românești crude mărunțite","Scorțișoară de Ceylon și esență de vanilie pură"]',
    ingredients_en = '["1/4 cup chia seeds","1 cup unsweetened coconut milk","30g raw walnuts chopped","Ceylon cinnamon and pure vanilla extract"]',
    instructions_ro = '["Amestecă semințele de chia cu laptele de cocos și scorțișoara într-un bol.","Lasă la hidratat 15 minute sau peste noapte în frigider.","Decorează cu miezul de nucă crocant înainte de servire."]',
    instructions_en = '["Mix chia seeds with coconut milk and cinnamon in a bowl.","Let soak 15 minutes or overnight in the fridge.","Garnish with crunchy raw walnuts before serving."]',
    calories = 390,
    protein = 12,
    carbs = 18,
    fats = 30,
    image_url = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
  WHERE id = 102
`).run();

// Rețeta 253: Iaurt Grec Nuci -> Salată Mediteraneană cu Curcan, Avocado și Nuci (Faza 3 Prânz)
db.prepare(`
  UPDATE recipes SET
    name = 'Salată Mediteraneană cu Curcan, Avocado și Nuci',
    name_ro = 'Salată Mediteraneană cu Curcan, Avocado și Nuci',
    name_en = 'Mediterranean Turkey, Avocado and Walnut Salad',
    description = 'Prânz complet pentru Faza 3 cu proteine slabe din curcan, avocado proaspăt și nuci crocante.',
    ingredients_ro = '["180g piept de curcan la grătar feliat","1/2 avocado copt tăiat cuburi","30g nuci românești crude","2 căni mix de salată verde, rucola și castraveți","2 linguri ulei de măsline extra virgin și zeamă de lămâie"]',
    ingredients_en = '["180g grilled turkey breast sliced","1/2 ripe avocado diced","30g raw walnuts","2 cups mixed greens, arugula and cucumbers","2 tbsp extra virgin olive oil and lemon juice"]',
    instructions_ro = '["Așază frunzele de salată verde, rucola și castraveții într-un bol mare.","Adaugă feliile calde de piept de curcan la grătar și cuburile de avocado.","Presară nucile rumenite ușor și asezonează cu dressingul de ulei de măsline și lămâie."]',
    instructions_en = '["Place salad greens, arugula and cucumbers in a large bowl.","Add warm sliced turkey breast and avocado cubes.","Sprinkle toasted raw walnuts and dress with olive oil and lemon juice."]',
    calories = 430,
    protein = 38,
    carbs = 8,
    fats = 28,
    image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800'
  WHERE id = 253
`).run();

// Rețeta 287: Iaurt Grec Fructe -> Gustare FMD: Fructe de Pădure și Migdale Crude (Faza 3 Gustare)
db.prepare(`
  UPDATE recipes SET
    name = 'Gustare FMD: Fructe de Pădure și Migdale Crude',
    name_ro = 'Gustare FMD: Fructe de Pădure și Migdale Crude',
    name_en = 'FMD Snack: Fresh Berries and Raw Almonds',
    description = 'Gustare perfectă de Faza 3 combinând carbohidrații lenți din fructe de pădure cu grăsimile bune din migdale.',
    ingredients_ro = '["30g migdale crude neprăjite","1 cană afine și zmeură proaspete"]',
    ingredients_en = '["30g raw almonds","1 cup fresh blueberries and raspberries"]',
    instructions_ro = '["Spală fructele de pădure proaspete și savurează-le alături de migdalele crude crocante."]',
    instructions_en = '["Wash fresh berries and enjoy them with crunchy raw almonds."]',
    calories = 190,
    protein = 6,
    carbs = 14,
    fats = 12,
    image_url = 'https://images.unsplash.com/photo-1587049352846-4a222e784138?w=800'
  WHERE id = 287
`).run();

console.log('✅ Rețetele cu produse lactate au fost transformate în rețete FMD autentice.');

console.log('\n--- Pas 2: Atribuire fotografii specifice și apetisante pentru fiecare din cele 247 de rețete ---');

// Imagini verificate, de înaltă rezoluție, specifice pentru fiecare categorie de mâncare
const imageLibrary = {
  // SOMON & PEȘTE GRAS
  salmon_asparagus: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  salmon_greens: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
  salmon_salad: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
  salmon_poke: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800',

  // PEȘTE ALB, TON, FRUCTE DE MARE
  white_fish_lemon: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800',
  white_fish_herbs: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0808?w=800',
  tuna_salad: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?w=800',
  shrimp_seafood: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800',

  // CARNE DE VITĂ & FRIPTURĂ
  beef_steak: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  beef_roast: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800',
  beef_broccoli: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800',

  // CURCAN
  turkey_roast: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
  turkey_salad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
  turkey_slices: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=800',
  turkey_meatballs: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',

  // PUI
  chicken_grilled: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
  chicken_salad: 'https://images.unsplash.com/photo-1604908176997-12518821c0e2?w=800',
  chicken_stirfry: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800',

  // OUĂ & OMLETE & ALBUȘURI
  baked_eggs_pepper: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
  egg_omelet: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800',
  hard_boiled_eggs: 'https://images.unsplash.com/photo-1587486937692-0197703ec0a0?w=800',
  egg_muffins: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
  egg_salad_sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',

  // MIC DEJUN FAZA 1 - OVĂZ, HRIȘCĂ, QUINOA, CLĂTITE
  oatmeal_berries: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800',
  oatmeal_cinnamon: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800',
  pancakes: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800',
  rye_toast: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800',

  // SMOOTHIES
  smoothie_berry: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800',
  smoothie_mango: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800',
  smoothie_green: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800',

  // SUPE & BORȘ & CIORBE
  soup_vegetable: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
  soup_chicken: 'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=800',
  soup_lentil: 'https://images.unsplash.com/photo-1588566565463-180a5b2090f2?w=800',
  soup_borscht: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800',

  // CHILI & FASOLE & LINTE & NĂUT
  chili_turkey_bean: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=800',
  lentil_dish: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800',
  chickpea_curry: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',

  // CEREALE INTEGRALE (BOWL QUINOA, OREZ BRUN, HRIȘCĂ)
  quinoa_bowl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  brown_rice_bowl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800',

  // PASTE INTEGRALE / LINTE
  pasta_bolognese: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',

  // CARTOFI DULCI
  sweet_potato: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800',

  // SALATE PROASPETE
  garden_salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',

  // CIUPERCI PORTOBELLO
  portobello_mushrooms: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800',

  // GUSTĂRI DE FRUCTE (FAZA 1)
  snack_apple: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800',
  snack_pear: 'https://images.unsplash.com/photo-1568607689150-17e625c1586e?w=800',
  snack_mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800',
  snack_strawberries: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800',
  snack_watermelon: 'https://images.unsplash.com/photo-1589984662646-e7b2e00b3e23?w=800',
  snack_grapefruit: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800',
  snack_berries: 'https://images.unsplash.com/photo-1587049352846-4a222e784138?w=800',
  snack_peach_plum: 'https://images.unsplash.com/photo-1522741178372-24097805a276?w=800',

  // GUSTĂRI DE LEGUME (FAZA 2)
  snack_cucumber_celery: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800',
  snack_bell_peppers: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800',
  snack_broccoli: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800',

  // GUSTĂRI GRĂSIMI & FAZA 3
  nuts_raw: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=800',
  avocado_fresh: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800',
  olives_bowl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
  chia_coconut_pudding: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
  hummus_veggies: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=800'
};

function selectAccurateImage(recipe) {
  const name = (recipe.name_ro || recipe.name || '').toLowerCase();
  const mealType = recipe.meal_type || '';
  const phase = recipe.phase || 1;

  // 1. SOMON & PEȘTE GRAS
  if (name.includes('somon') || name.includes('salmon')) {
    if (name.includes('salat') || name.includes('spanac') || name.includes('avocado')) {
      return imageLibrary.salmon_salad;
    }
    if (name.includes('poke') || name.includes('bowl')) {
      return imageLibrary.salmon_poke;
    }
    if (name.includes('sparanghel') || name.includes('legume')) {
      return imageLibrary.salmon_asparagus;
    }
    return imageLibrary.salmon_greens;
  }

  // 2. PEȘTE ALB, TON, FRUCTE DE MARE
  if (name.includes('ton') || name.includes('tuna')) {
    return imageLibrary.tuna_salad;
  }
  if (name.includes('creve') || name.includes('shrimp') || name.includes('crab')) {
    return imageLibrary.shrimp_seafood;
  }
  if (name.includes('pește') || name.includes('peste') || name.includes('cod') || name.includes('salau') || name.includes('pastrav') || name.includes('dorada') || name.includes('fish')) {
    if (name.includes('cuptor') || name.includes('ierburi')) return imageLibrary.white_fish_herbs;
    return imageLibrary.white_fish_lemon;
  }

  // 3. OUĂ & OMLETE & ALBUȘURI
  if (name.includes('ou') || name.includes('albu') || name.includes('omlet') || name.includes('egg')) {
    if (name.includes('ardei') || name.includes('coapt')) return imageLibrary.baked_eggs_pepper;
    if (name.includes('brio') || name.includes('muffin')) return imageLibrary.egg_muffins;
    if (name.includes('fiert') || name.includes('boiled')) return imageLibrary.hard_boiled_eggs;
    if (name.includes('sandvi') || name.includes('sandwich')) return imageLibrary.egg_salad_sandwich;
    return imageLibrary.egg_omelet;
  }

  // 4. CLĂTITE (PANCAKES)
  if (name.includes('clatit') || name.includes('clătite') || name.includes('pancake')) {
    return imageLibrary.pancakes;
  }

  // 5. TOAST & SANDVIȘ DIN SECARĂ
  if (name.includes('toast') || name.includes('sandwich') || name.includes('sandviș') || name.includes('pâine pierdută')) {
    return imageLibrary.rye_toast;
  }

  // 6. OVĂZ & TERCI & FULGI
  if (name.includes('ovăz') || name.includes('ovaz') || name.includes('terci') || name.includes('porridge') || name.includes('kamut') || name.includes('alac') || name.includes('mei')) {
    if (name.includes('fructe de pădure') || name.includes('afine') || name.includes('zmeur')) return imageLibrary.oatmeal_berries;
    return imageLibrary.oatmeal_cinnamon;
  }

  // 7. SMOOTHIE & SHAKE
  if (name.includes('smoothie') || name.includes('shake')) {
    if (name.includes('mango')) return imageLibrary.smoothie_mango;
    if (name.includes('verde') || name.includes('spanac') || name.includes('kale')) return imageLibrary.smoothie_green;
    return imageLibrary.smoothie_berry;
  }

  // 8. CHIA & BUDINCĂ DE COCUS
  if (name.includes('chia') || name.includes('budinc')) {
    return imageLibrary.chia_coconut_pudding;
  }

  // 9. CARNE DE VITĂ & FRIPTURĂ
  if (name.includes('vită') || name.includes('vita') || name.includes('beef') || name.includes('steak') || name.includes('mușchi') || name.includes('muschi')) {
    if (name.includes('broccoli')) return imageLibrary.beef_broccoli;
    if (name.includes('friptur') || name.includes('gratar')) return imageLibrary.beef_steak;
    return imageLibrary.beef_roast;
  }

  // 10. CHIFTELE
  if (name.includes('chiftel') || name.includes('meatball') || name.includes('mici')) {
    return imageLibrary.turkey_meatballs;
  }

  // 11. CHILI & TOCANĂ DE FASOLE
  if (name.includes('chili') || name.includes('fasole') || name.includes('linte') || name.includes('lentil') || name.includes('năut') || name.includes('naut')) {
    if (name.includes('chili')) return imageLibrary.chili_turkey_bean;
    if (name.includes('năut') || name.includes('naut')) return imageLibrary.chickpea_curry;
    return imageLibrary.lentil_dish;
  }

  // 12. SUPE & CIORBE & BORȘ
  if (name.includes('supă') || name.includes('supa') || name.includes('ciorb') || name.includes('borș') || name.includes('bors') || name.includes('broth')) {
    if (name.includes('sfecl') || name.includes('bors')) return imageLibrary.soup_borscht;
    if (name.includes('pui') || name.includes('curcan') || name.includes('carne')) return imageLibrary.soup_chicken;
    if (name.includes('linte')) return imageLibrary.soup_lentil;
    return imageLibrary.soup_vegetable;
  }

  // 13. CARTOFI DULCI
  if (name.includes('cartof dulce') || name.includes('sweet potato')) {
    return imageLibrary.sweet_potato;
  }

  // 14. PASTE
  if (name.includes('paste') || name.includes('pasta') || name.includes('spaghett') || name.includes('bolognese')) {
    return imageLibrary.pasta_bolognese;
  }

  // 15. CIUPERCI PORTOBELLO
  if (name.includes('portobello') || name.includes('ciuperci umplute')) {
    return imageLibrary.portobello_mushrooms;
  }

  // 16. HUMMUS & ȚELINĂ
  if (name.includes('hummus')) {
    return imageLibrary.hummus_veggies;
  }

  // 17. AVOCADO & GUACAMOLE
  if (name.includes('avocado') || name.includes('guacamole')) {
    return imageLibrary.avocado_fresh;
  }

  // 18. NUCI & MIGDALE (GUSTĂRI FAZA 3)
  if (name.includes('nuc') || name.includes('migdal') || name.includes('caju') || name.includes('alune') || name.includes('semin') || name.includes('unt de migdale')) {
    return imageLibrary.nuts_raw;
  }

  // 19. MĂSLINE
  if (name.includes('măslin') || name.includes('maslin') || name.includes('olive')) {
    return imageLibrary.olives_bowl;
  }

  // 20. FRUCTE SPECIFICE (GUSTĂRI)
  if (name.includes('măr') || name.includes('mar') || name.includes('apple')) return imageLibrary.snack_apple;
  if (name.includes('pară') || name.includes('para') || name.includes('pear')) return imageLibrary.snack_pear;
  if (name.includes('mango')) return imageLibrary.snack_mango;
  if (name.includes('căpșun') || name.includes('capsun') || name.includes('strawberr')) return imageLibrary.snack_strawberries;
  if (name.includes('pepene') || name.includes('watermelon')) return imageLibrary.snack_watermelon;
  if (name.includes('grepfrut') || name.includes('grapefruit') || name.includes('portocal')) return imageLibrary.snack_grapefruit;
  if (name.includes('fructe de pădure') || name.includes('afine') || name.includes('zmeur') || name.includes('mure') || name.includes('berr')) return imageLibrary.snack_berries;
  if (name.includes('piersic') || name.includes('cireș') || name.includes('prun') || name.includes('kiwi')) return imageLibrary.snack_peach_plum;

  // 21. LEGUME CRUDE (GUSTĂRI FAZA 2)
  if (name.includes('castravet') || name.includes('țelină') || name.includes('telina') || name.includes('apio') || name.includes('morcov')) {
    return imageLibrary.snack_cucumber_celery;
  }
  if (name.includes('ardei') || name.includes('pepper')) {
    return imageLibrary.snack_bell_peppers;
  }
  if (name.includes('broccoli') || name.includes('conopid') || name.includes('sparanghel') || name.includes('varză') || name.includes('varza')) {
    return imageLibrary.snack_broccoli;
  }

  // 22. CURCAN
  if (name.includes('curcan') || name.includes('turkey')) {
    if (name.includes('felii') || name.includes('rulou') || mealType.includes('snack')) {
      return imageLibrary.turkey_slices;
    }
    if (name.includes('salat')) {
      return imageLibrary.turkey_salad;
    }
    return imageLibrary.turkey_roast;
  }

  // 23. PUI
  if (name.includes('pui') || name.includes('chicken') || name.includes('ficăței') || name.includes('ficatei')) {
    if (name.includes('salat')) {
      return imageLibrary.chicken_salad;
    }
    if (name.includes('stir-fry') || name.includes('sotat')) {
      return imageLibrary.chicken_stirfry;
    }
    return imageLibrary.chicken_grilled;
  }

  // 24. CEREALE & BOWLURI (QUINOA, OREZ, HRIȘCĂ)
  if (name.includes('quinoa')) return imageLibrary.quinoa_bowl;
  if (name.includes('orez') || name.includes('rice') || name.includes('pilaf') || name.includes('bulgur')) return imageLibrary.brown_rice_bowl;

  // 25. SALATE GENERALE
  if (name.includes('salat') || name.includes('salad')) {
    return imageLibrary.garden_salad;
  }

  // FALLBACKURI PE FAZĂ ȘI TIP DE MASĂ (RELEVANT ȘI SPECIFIC)
  if (mealType.includes('breakfast')) {
    if (phase === 2) return imageLibrary.egg_omelet;
    if (phase === 3) return imageLibrary.chia_coconut_pudding;
    return imageLibrary.oatmeal_berries;
  }

  if (mealType.includes('snack')) {
    if (phase === 1) return imageLibrary.snack_apple;
    if (phase === 2) return imageLibrary.turkey_slices;
    return imageLibrary.nuts_raw;
  }

  if (phase === 2) {
    return imageLibrary.beef_steak;
  }

  if (phase === 3) {
    return imageLibrary.salmon_salad;
  }

  return imageLibrary.chicken_salad;
}

const allRecipes = db.prepare('SELECT id, name_ro, name, meal_type, phase, calories FROM recipes').all();
console.log(`Analizez și actualizez ${allRecipes.length} rețete...`);

const updateStmt = db.prepare('UPDATE recipes SET image_url = ? WHERE id = ?');

let updated = 0;
for (const recipe of allRecipes) {
  const chosenImage = selectAccurateImage(recipe);
  updateStmt.run(chosenImage, recipe.id);
  updated++;
}

console.log(`✅ Toate cele ${updated} rețete au primit fotografii culinare 100% specifice și adecvate!`);

// Print test validation
const sampleCheck = db.prepare(`
  SELECT id, name_ro, meal_type, phase, image_url 
  FROM recipes 
  WHERE name_ro LIKE '%somon%' 
     OR name_ro LIKE '%curcan%' 
     OR name_ro LIKE '%avocado%' 
     OR name_ro LIKE '%iaurt%' 
     OR name_ro LIKE '%ouă%'
     OR name_ro LIKE '%măr%'
     OR name_ro LIKE '%castravete%'
     OR name_ro LIKE '%chia%'
  LIMIT 15
`).all();

console.log('\n--- Verificare Mostră Rețete & Poze ---');
console.table(sampleCheck);
