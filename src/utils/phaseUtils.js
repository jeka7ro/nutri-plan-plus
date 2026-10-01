/**
 * Utility functions for Fast Metabolism Diet phase calculations
 * 
 * Phase cycle: 7 days
 * - Phase 1 (Unwind): Days 1-2 - Carbs and fruits, no fats
 * - Phase 2 (Unlock): Days 3-4 - Proteins and veggies, no carbs/fats  
 * - Phase 3 (Unleash): Days 5-7 - Healthy fats, balanced macros
 */

/**
 * Calculate the current phase based on day number in the 28-day cycle
 * @param {number} dayNumber - Day number (1-28)
 * @returns {number} Phase number (1, 2, or 3)
 */
export const getCurrentPhase = (dayNumber) => {
  const cycle = ((dayNumber - 1) % 7) + 1;
  if (cycle <= 2) return 1; // Days 1-2: Phase 1
  if (cycle <= 4) return 2; // Days 3-4: Phase 2
  return 3; // Days 5-7: Phase 3
};

/**
 * Get phase information for display
 * @param {number} phase - Phase number (1, 2, or 3)
 * @param {string} language - Language code ('ro' or 'en')
 * @returns {object} Phase info with name, description, colors, etc.
 */
export const getPhaseInfo = (phase, language = 'en') => {
  const phaseData = {
    1: {
      name: { 
        en: "Phase 1: Unwind", 
        ro: "Faza 1: Destresare" 
      },
      color: "from-red-400 to-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/10",
      textColor: "text-orange-700 dark:text-orange-400",
      description: {
        en: "Carbs and fruits - Calm the adrenal glands",
        ro: "Carbohidrați și fructe - Calmează glandele suprarenale"
      },
      guidelines: {
        en: [
          "Focus on healthy carbs and fruits",
          "Avoid fats in this phase",
          "Drink 8 glasses of water",
          "Exercise: light cardio (running, cycling) - 30 min"
        ],
        ro: [
          "Concentrează-te pe carbohidrați sănătoși și fructe",
          "Evită grăsimile în această fază",
          "Bea 8 pahare de apă",
          "Exercițiu: cardio ușor (alergare, ciclism) - 30 min"
        ]
      },
      allowedFoods: {
        en: {
          yes: ["Whole grains (oats, brown rice, quinoa)", "Fruits (all kinds)", "Lean proteins (chicken, turkey, white fish)", "Vegetables (except high-fat ones)", "Legumes"],
          no: ["All fats and oils", "Dairy products", "Refined sugar", "Avocados", "Nuts and seeds"]
        },
        ro: {
          yes: ["Cereale integrale (ovăz, orez brun, quinoa)", "Fructe (toate tipurile)", "Proteine slabe (pui, curcan, pește alb)", "Legume (exceptând cele grase)", "Leguminoase"],
          no: ["Toate grăsimile și uleiurile", "Produse lactate", "Zahăr rafinat", "Avocado", "Nuci și semințe"]
        }
      }
    },
    2: {
      name: { 
        en: "Phase 2: Unlock", 
        ro: "Faza 2: Deblocare" 
      },
      color: "from-emerald-400 to-green-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
      textColor: "text-emerald-700 dark:text-emerald-400",
      description: {
        en: "Proteins and veggies - Unlock stored fat",
        ro: "Proteine și legume - Deblochează grăsimea stocată"
      },
      guidelines: {
        en: [
          "High protein and vegetables",
          "No carbs or fats",
          "Drink 8 glasses of water",
          "Exercise: strength training - 30 min"
        ],
        ro: [
          "Accent pe proteine și legume",
          "Fără carbohidrați sau grăsimi",
          "Bea 8 pahare de apă",
          "Exercițiu: antrenament de forță - 30 min"
        ]
      },
      allowedFoods: {
        en: {
          yes: ["Lean proteins (chicken, turkey, white fish, lean beef)", "Vegetables (all kinds)", "Leafy greens", "Herbs and spices"],
          no: ["All carbs (grains, fruits)", "All fats and oils", "Dairy products", "Legumes", "Nuts and seeds"]
        },
        ro: {
          yes: ["Proteine slabe (pui, curcan, pește alb, vită slabă)", "Legume (toate tipurile)", "Verdeață", "Ierburi și condimente"],
          no: ["Toți carbohidrații (cereale, fructe)", "Toate grăsimile și uleiurile", "Produse lactate", "Leguminoase", "Nuci și semințe"]
        }
      }
    },
    3: {
      name: { 
        en: "Phase 3: Unleash", 
        ro: "Faza 3: Ardere" 
      },
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/10",
      textColor: "text-purple-700 dark:text-purple-400",
      description: {
        en: "Healthy fats - Transform into energy",
        ro: "Grăsimi sănătoase - Transformă în energie"
      },
      guidelines: {
        en: [
          "Healthy fats and balanced meals",
          "All macronutrients in normal amounts, quinoa/brown rice allowed",
          "Limited healthy carbs allowed",
          "Drink 8 glasses of water",
          "Exercise: stress-reducing activities (yoga, massage) - 30 min"
        ],
        ro: [
          "Grăsimi sănătoase și mese echilibrate",
          "Toți macronutrienții în cantități normale, quinoa/orez brun permise",
          "Carbohidrați sănătoși limitați permisi",
          "Bea 8 pahare de apă",
          "Exercițiu: activități de reducere a stresului (yoga, masaj) - 30 min"
        ]
      },
      allowedFoods: {
        en: {
          yes: ["Healthy fats (avocado, nuts, seeds, olive oil)", "Lean proteins", "Vegetables", "Plant-based milk (almond, coconut, oat)", "Berries (small amounts)", "Quinoa/brown rice (normal amounts)"],
          no: ["Refined sugar", "Processed foods", "Trans fats", "Sweet fruits (apples, bananas, etc.)", "Processed grains", "Cow dairy products"]
        },
        ro: {
          yes: ["Grăsimi sănătoase (avocado, nuci, semințe, ulei de măsline)", "Proteine slabe", "Legume", "Lapte vegetal (migdale, cocos, ovăz)", "Fructe de pădure (cantități mici)", "Quinoa/orez brun (cantități normale)"],
          no: ["Zahăr rafinat", "Alimente procesate", "Grăsimi trans", "Fructe dulci (mere, banane, etc.)", "Cereale procesate", "Lactate de vacă"]
        }
      }
    }
  };

  return phaseData[phase] || phaseData[1];
};

/**
 * Calculate current day number based on start date
 * @param {string|Date} startDate - User's diet start date
 * @returns {number} Current day number (1-28)
 */
export const getCurrentDay = (startDate) => {
  if (!startDate) return 1;
  
  const start = new Date(startDate);
  const today = new Date();
  
  // Calculate days passed since start
  const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Keep within 28-day cycle
  return Math.min(Math.max(daysPassed, 1), 28);
};

/**
 * Get the phase for a specific date
 * @param {string|Date} startDate - User's diet start date
 * @param {string|Date} targetDate - Date to get phase for (defaults to today)
 * @returns {number} Phase number for the target date
 */
export const getPhaseForDate = (startDate, targetDate = new Date()) => {
  if (!startDate) return 1;
  
  const start = new Date(startDate);
  const target = new Date(targetDate);
  
  const daysPassed = Math.floor((target - start) / (1000 * 60 * 60 * 24)) + 1;
  const dayNumber = Math.min(Math.max(daysPassed, 1), 28);
  
  return getCurrentPhase(dayNumber);
};

/**
 * Check if a recipe is suitable for a specific phase with strict Fast Metabolism Diet guardrails
 * @param {object} recipe - Recipe object
 * @param {number} phase - Phase number to check against
 * @returns {boolean} True if recipe is suitable for the phase
 */
export const isRecipeValidForPhase = (recipe, phase) => {
  if (!recipe || !phase) return false;
  
  // 1. Check phase compatibility
  let matchesPhase = false;
  if (recipe.phases && Array.isArray(recipe.phases) && recipe.phases.length > 0) {
    matchesPhase = recipe.phases.includes(phase);
  } else if (recipe.phase) {
    matchesPhase = recipe.phase === phase;
  } else {
    // If no phase specified, allow evaluation via ingredient and macro guards
    matchesPhase = true;
  }

  if (!matchesPhase) return false;

  // Prepare searchable text for allergen/forbidden words
  const fullText = [
    recipe.name,
    recipe.name_ro,
    recipe.name_en,
    recipe.description_ro,
    recipe.description_en,
    Array.isArray(recipe.ingredients_ro) ? recipe.ingredients_ro.join(' ') : recipe.ingredients_ro,
    Array.isArray(recipe.ingredients_en) ? recipe.ingredients_en.join(' ') : recipe.ingredients_en,
    Array.isArray(recipe.ingredients) ? recipe.ingredients.join(' ') : recipe.ingredients,
  ].filter(Boolean).join(' ').toLowerCase();

  const fats = typeof recipe.fats === 'number' ? recipe.fats : parseFloat(recipe.fats || 0);
  const carbs = typeof recipe.carbs === 'number' ? recipe.carbs : parseFloat(recipe.carbs || 0);

  // STRICT PHASE 1 GUARDRAILS (Days 1-2: Carbs & Fruits, Lean Protein, No Fats, No Pork, No Dairy)
  if (phase === 1) {
    // Hard ceiling on fats: max 8g
    if (fats > 8) return false;

    // Forbidden in Phase 1
    const p1Forbidden = [
      'unt', 'ulei', 'oil', 'butter', 'avocado', 'nuci', 'nuca', 'migdale', 'almond', 'caju', 'cashew',
      'fistic', 'seminte', 'semințe', 'seeds', 'chia', 'susan', 'tahini', 'arahide', 'peanut',
      'iaurt', 'yogurt', 'lapte', 'milk', 'smantana', 'smântână', 'cream', 'branza', 'brânză', 'cheese',
      'cascaval', 'cașcaval', 'parmezan', 'parmesan', 'mozzarella', 'ricotta', 'telemea',
      'porc', 'pork', 'bacon', 'costite', 'costițe', 'slanina', 'slănină', 'carnati', 'cârnați',
      'somon', 'salmon', 'macrou', 'sardine', 'hering',
      'banana', 'banane'
    ];

    for (const term of p1Forbidden) {
      const regex = new RegExp(`(\\b|[^a-zăîâșț])${term}(\\b|[^a-zăîâșț])`, 'i');
      if (regex.test(fullText)) {
        return false;
      }
    }
  }

  // STRICT PHASE 2 GUARDRAILS (Days 3-4: Lean Protein & Veggies, No Carbs/Grains/Fruits/Fats)
  if (phase === 2) {
    if (carbs > 16) return false;
    if (fats > 8) return false;

    const p2Forbidden = [
      'paine', 'pâine', 'bread', 'orez', 'rice', 'paste', 'pasta', 'ovaz', 'ovăz', 'oats', 'quinoa',
      'cartof', 'cartofi', 'potato', 'potatoes', 'linte', 'fasole', 'naut', 'năut', 'hrisca', 'hrișcă',
      'mar', 'măr', 'mere', 'apple', 'apples', 'para', 'pară', 'pere', 'portocale', 'orange', 'oranges',
      'capsuni', 'căpșuni', 'afine', 'zmeura', 'zmeură', 'ananas', 'mango', 'banana', 'banane', 'struguri',
      'iaurt', 'yogurt', 'lapte', 'milk', 'branza', 'brânză', 'cheese', 'unt', 'butter', 'ulei', 'oil',
      'avocado', 'nuci', 'seminte', 'semințe'
    ];

    for (const term of p2Forbidden) {
      const regex = new RegExp(`(\\b|[^a-zăîâșț])${term}(\\b|[^a-zăîâșț])`, 'i');
      if (regex.test(fullText)) {
        return false;
      }
    }
  }

  // STRICT PHASE 3 GUARDRAILS (Days 5-7: Healthy Fats + Protein, Low-Glycemic Carbs/Fruits)
  if (phase === 3) {
    const p3Forbidden = [
      'banana', 'banane', 'ananas', 'pineapple', 'mango', 'pepene', 'watermelon', 'melon', 'struguri', 'grapes',
      'curmale', 'dates', 'smochine', 'figs', 'porumb', 'corn', 'porc', 'pork', 'bacon', 'slanina',
      'iaurt de vaca', 'lapte de vaca', 'branza', 'brânză', 'cascaval', 'cașcaval', 'parmezan',
      'arahide', 'peanut'
    ];

    for (const term of p3Forbidden) {
      const regex = new RegExp(`(\\b|[^a-zăîâșț])${term}(\\b|[^a-zăîâșț])`, 'i');
      if (regex.test(fullText)) {
        return false;
      }
    }
  }

  return true;
};

