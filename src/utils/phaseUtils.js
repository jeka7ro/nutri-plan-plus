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
          "Proteine și legume",
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
          "Include all macronutrients",
          "Limited healthy carbs allowed",
          "Drink 8 glasses of water",
          "Exercise: stress-reducing activities (yoga, massage) - 30 min"
        ],
        ro: [
          "Grăsimi sănătoase și mese echilibrate",
          "Include toate macronutrienții",
          "Carbohidrați sănătoși limitați permisi",
          "Bea 8 pahare de apă",
          "Exercițiu: activități de reducere a stresului (yoga, masaj) - 30 min"
        ]
      },
      allowedFoods: {
        en: {
          yes: ["Healthy fats (avocado, nuts, seeds, olive oil)", "Lean proteins", "Vegetables", "Plant-based milk (almond, coconut, oat)", "Berries (small amounts)", "Quinoa/brown rice (very small amounts)"],
          no: ["Refined sugar", "Processed foods", "Trans fats", "Sweet fruits (apples, bananas, etc.)", "Processed grains", "Cow dairy products"]
        },
        ro: {
          yes: ["Grăsimi sănătoase (avocado, nuci, semințe, ulei de măsline)", "Proteine slabe", "Legume", "Lapte vegetal (migdale, cocos, ovăz)", "Fructe de pădure (cantități mici)", "Quinoa/orez brun (cantități foarte mici)"],
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
 * Check if a recipe is suitable for a specific phase
 * @param {object} recipe - Recipe object
 * @param {number} phase - Phase number to check against
 * @returns {boolean} True if recipe is suitable for the phase
 */
export const isRecipeValidForPhase = (recipe, phase) => {
  if (!recipe || !phase) return false;
  
  // Support both new format (phases array) and old format (phase integer)
  if (recipe.phases && Array.isArray(recipe.phases)) {
    return recipe.phases.includes(phase);
  }
  
  if (recipe.phase) {
    return recipe.phase === phase;
  }
  
  // If no phase specified, assume it's valid for all phases
  return true;
};
