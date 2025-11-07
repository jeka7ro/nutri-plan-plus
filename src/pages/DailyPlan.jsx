import React, { useState, useEffect, useMemo, useCallback } from "react";
import localApi from "@/api/localClient";
const base44 = localApi; // Pentru compatibilitate cu cod vechi
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Coffee, Apple, UtensilsCrossed, Cookie, Moon,
  Droplets, Dumbbell, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Settings, Leaf, Info, Star, Heart, Flame, ChefHat, Target, Activity, Pencil, X
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { ro, enUS } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "../components/LanguageContext";
import DietaryPreferencesModal from "../components/DietaryPreferencesModal";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


const phaseInfo = {
  1: {
    name: { en: "Phase 1: Unwind", ro: "Faza 1: Destresare" },
    color: "from-red-400 to-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
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
    name: { en: "Phase 2: Unlock", ro: "Faza 2: Deblocare" },
    color: "from-emerald-400 to-green-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    guidelines: {
      en: [
        "Focus on lean proteins and green veggies",
        "No carbs and fats",
        "Drink 8-10 glasses of water",
        "Exercise: strength training - 30 min"
      ],
      ro: [
        "Accent pe proteine slabe și legume verzi",
        "Zero carbohidrați și grăsimi",
        "Bea 8-10 pahare de apă",
        "Exercițiu: antrenament de forță - 30 min"
      ]
    },
    allowedFoods: {
      en: {
        yes: ["Lean proteins (chicken breast, turkey, white fish, egg whites)", "All vegetables (especially leafy greens)", "Lemons and limes only", "Herbs and spices"],
        no: ["All fruits", "All grains and carbs", "All fats and oils", "Dairy products", "Nuts and seeds"]
      },
      ro: {
        yes: ["Proteine slabe (piept de pui, curcan, pește alb, albuș)", "Toate legumele (în special cele verzi)", "Doar lămâi verzi și galbene", "Ierburi și condimente"],
        no: ["Toate fructele", "Toate cerealele și carbohidrații", "Toate grăsimile și uleiurile", "Produse lactate", "Nuci și semințe"]
      }
    }
  },
  3: {
    name: { en: "Phase 3: Unleash", ro: "Faza 3: Ardere" },
    color: "from-purple-400 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    guidelines: {
      en: [
        "Add plenty of healthy fats",
        "Moderate proteins and vegetables",
        "Drink 8 glasses of water",
        "Exercise: yoga or relaxing activity - 30 min"
      ],
      ro: [
        "Adaugă grăsimi sănătoase din abundență",
        "Proteine moderate și legume",
        "Bea 8 pahare de apă",
        "Exercițiu: yoga sau activitate relaxantă - 30 min"
      ]
    },
    allowedFoods: {
      en: {
        yes: ["Healthy fats (avocado, nuts, seeds, olive oil, coconut oil)", "Fatty fish (salmon, mackerel)", "Full-fat dairy", "Eggs (whole)", "All vegetables", "Moderate proteins"],
        no: ["All fruits", "All grains and cereals", "Refined carbs", "Sugar"]
      },
      ro: {
        yes: ["Grăsimi sănătoase (avocado, nuci, semințe, ulei măsline, ulei cocos)", "Pește gras (somon, macrou)", "Lactate întregi", "Ouă întregi", "Toate legumele", "Proteine moderate"],
        no: ["Toate fructele", "Toate cerealele", "Carbohidrați rafinați", "Zahăr"]
      }
    }
  }
};

export default function DailyPlan() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [selectedMealDetail, setSelectedMealDetail] = useState(null);
  const [exerciseType, setExerciseType] = useState("walking");
  const [exerciseDuration, setExerciseDuration] = useState(30);
  const [editingMeal, setEditingMeal] = useState(null); // Track which meal is being edited
  const [expandedMeals, setExpandedMeals] = useState({}); // Track which meals show all options
  const queryClient = useQueryClient();

  useEffect(() => {
    localApi.auth.me().then(userData => {
      setUser(userData);
      if (userData && userData.is_vegetarian === undefined && userData.allergies === undefined) {
        setShowPreferencesModal(true);
      }
    }).catch(() => {});
  }, []);

  const { data: checkIn } = useQuery({
    queryKey: ['checkIn', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      // FIXAT: folosește localApi.checkins.get() pentru PostgreSQL
      const result = await localApi.checkins.get(format(selectedDate, 'yyyy-MM-dd'));
      // Return empty object if no check-in exists to avoid undefined errors
      return result || {
        breakfast_completed: false,
        snack1_completed: false,
        lunch_completed: false,
        snack2_completed: false,
        dinner_completed: false,
        exercise_completed: false,
        water_intake: 0,
        date: format(selectedDate, 'yyyy-MM-dd')
      };
    },
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['allCheckIns'],
    queryFn: async () => {
      if (!user?.email || !user?.start_date) return [];
      // FIXAT: folosește localApi.checkins.list() pentru PostgreSQL
      return await localApi.checkins.list();
    },
    enabled: !!user?.email && !!user?.start_date,
    staleTime: 0, // NU cache - sincronizare instant cu Dashboard
    refetchOnMount: 'always', // Refetch mereu când componenta se montează
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => localApi.recipes.list(),
    staleTime: 30 * 60 * 1000, // Cache 30 minutes - recipes don't change often
  });

  useEffect(() => {
    if (checkIn) {
      if (checkIn.exercise_type) setExerciseType(checkIn.exercise_type);
      if (checkIn.exercise_duration) setExerciseDuration(checkIn.exercise_duration);
      setNotes(checkIn.notes || ""); // Prevent null value
    } else {
      setNotes("");
    }
  }, [checkIn]);

  const updateCheckInMutation = useMutation({
    mutationFn: async (data) => {
      // FIXAT: folosește localApi.checkins.upsert() pentru PostgreSQL
      console.log('📡 TRIMIT REQUEST LA BACKEND:', data);
      try {
        const result = await localApi.checkins.upsert(data);
        console.log('✅ BACKEND RĂSPUNS SUCCESS:', result);
        return result;
      } catch (error) {
        console.error('❌ BACKEND RĂSPUNS ERROR:', error);
        throw error;
      }
    },
    onSuccess: (newData) => {
      // Update the specific checkIn cache IMEDIAT
      queryClient.setQueryData(['checkIn', format(selectedDate, 'yyyy-MM-dd')], newData);

      // Actualizează și lista globală de check-ins (dashboard/Admin)
      queryClient.setQueryData(['allCheckIns'], (old = []) => {
        const dateKey = newData?.date ? format(new Date(newData.date), 'yyyy-MM-dd') : format(selectedDate, 'yyyy-MM-dd');
        const filtered = old.filter((item) => {
          const itemDate = item?.date ? format(new Date(item.date), 'yyyy-MM-dd') : null;
          return itemDate !== dateKey;
        });
        return [newData, ...filtered];
      });

      // Invalidează explicit cache-ul pentru a forța refresh pe Dashboard
      queryClient.invalidateQueries(['allCheckIns']);
      
      console.log('✅ CACHE ACTUALIZAT ȘI INVALIDAT:', newData);
    },
    onError: (error) => {
      console.error('❌ MUTATION ERROR:', error);
      toast({
        title: language === 'ro' ? "Eroare" : "Error",
        description: error.message || (language === 'ro' ? "Nu s-a putut salva modificarea" : "Could not save changes"),
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const getCurrentDay = useCallback(() => {
    if (!user?.start_date) return 1;
    const startDate = new Date(user.start_date);
    const daysPassed = differenceInDays(selectedDate, startDate) + 1;
    return Math.min(Math.max(daysPassed, 1), 28);
  }, [user?.start_date, selectedDate]);

  const getCurrentPhase = useCallback((day) => {
    const cycle = ((day - 1) % 7) + 1;
    if (cycle <= 2) return 1;
    if (cycle <= 4) return 2;
    return 3;
  }, []);

  // MEMOIZE expensive filtering operations
  const filterMealOptions = useCallback((options) => {
    if (!user) return options;

    // Parse dietary_preferences from string
    const isVegetarian = user.dietary_preferences?.includes('vegetarian') || false;
    const isVegan = user.dietary_preferences?.includes('vegan') || false;
    
    // Parse allergies from string to array
    const userAllergies = user.allergies ? user.allergies.split(',').map(a => a.trim()) : [];

    return options.filter(option => {
      // STRICT FILTERING: If user is vegetarian and recipe is NOT vegetarian, REJECT IT
      if (isVegetarian && !option.is_vegetarian) {
        return false;
      }
      
      // STRICT FILTERING: If user is vegan and recipe is NOT vegan, REJECT IT
      if (isVegan && !option.is_vegan) {
        return false;
      }
      
      // ALLERGEN CHECK
      if (userAllergies.length > 0) {
        const hasAllergen = option.allergens?.some(allergen =>
          userAllergies.includes(allergen)
        );
        if (hasAllergen) {
          return false;
        }
      }
      
      // Recipe passes all filters
      return true;
    });
  }, [user]);

  const scoreMealOption = useCallback((option) => {
    if (!user?.favorite_foods || user.favorite_foods.length === 0) return 0;

    let score = 0;
    user.favorite_foods.forEach(favorite => {
      const favLower = favorite.toLowerCase();
      const optionKeywords = option.keywords?.map(k => k.toLowerCase()) || [];
      const optionNameEn = option.name.toLowerCase();
      const optionNameRo = option.name_ro.toLowerCase();

      if (optionKeywords.some(keyword => keyword.includes(favLower) || favLower.includes(keyword))) {
        score += 2;
      } else if (optionNameEn.includes(favLower) || optionNameRo.includes(favLower)) {
        score += 1;
      }
    });
    return score;
  }, [user?.favorite_foods]);

  const sortMealOptionsByFavorites = useCallback((options) => {
    return [...options].sort((a, b) => scoreMealOption(b) - scoreMealOption(a));
  }, [scoreMealOption]);

  const calculateCaloriesBurned = useCallback((type, duration) => {
    const caloriesPerMinute = {
      walking: 3.5,
      running: 9,
      circuit: 8,
      body_pump: 7,
      basic_workout: 6
    };
    return Math.round((caloriesPerMinute[type] || 6) * duration);
  }, []);

  const currentDay = getCurrentDay();
  const currentPhase = getCurrentPhase(currentDay);
  const phase = phaseInfo[currentPhase];

  // Define meals FIRST (used in callbacks)
  const meals = useMemo(() => [
    { key: 'breakfast_completed', icon: Coffee, label: t('breakfast'), mealType: 'breakfast' },
    { key: 'snack1_completed', icon: Apple, label: t('snack1'), mealType: 'snack1' },
    { key: 'lunch_completed', icon: UtensilsCrossed, label: t('lunch'), mealType: 'lunch' },
    { key: 'snack2_completed', icon: Cookie, label: t('snack2'), mealType: 'snack2' },
    { key: 'dinner_completed', icon: Moon, label: t('dinner'), mealType: 'dinner' },
  ], [t]);

  // FIXAT: Nu mai face TOGGLE - doar marchează ca COMPLETAT
  // Pentru a demarca, user folosește butonul X (roșu)
  const handleMealCheck = useCallback((mealKey, mealType) => {
    const currentValue = checkIn?.[mealKey];
    
    // Dacă e deja completat → nu face nimic (sau demarchează explicit)
    // Pentru SIMPLITATE: TOGGLE păstrat, dar user trebuie să înțeleagă
    const updateData = {
      ...checkIn,
      [mealKey]: !currentValue,  // TOGGLE: false → true → false
      date: format(selectedDate, 'yyyy-MM-dd'),
      day_number: getCurrentDay(),
      phase: currentPhase
    };
    
    // Reset editing mode when marking as completed
    setEditingMeal(null);
    
    console.log('🔍 handleMealCheck:', { mealKey, currentValue, newValue: !currentValue, updateData });
    updateCheckInMutation.mutate(updateData);
  }, [checkIn, updateCheckInMutation, selectedDate, currentPhase]);

  // OPTIMIZED: Batch all updates together
  const handleMealSelection = useCallback((mealType, option) => {
    console.log('🍽️ CLICK SELECȚIE MASĂ!', { mealType, optionName: option.name_ro });
    
    const mealTypeMap = {
      'breakfast': { key: 'breakfast_option', imageKey: 'breakfast_image', caloriesKey: 'breakfast_calories', quantityKey: 'breakfast_quantity' },
      'snack1': { key: 'snack1_option', imageKey: 'snack1_image', caloriesKey: 'snack1_calories', quantityKey: 'snack1_quantity' },
      'lunch': { key: 'lunch_option', imageKey: 'lunch_image', caloriesKey: 'lunch_calories', quantityKey: 'lunch_quantity' },
      'snack2': { key: 'snack2_option', imageKey: 'snack2_image', caloriesKey: 'snack2_calories', quantityKey: 'snack2_quantity' },
      'dinner': { key: 'dinner_option', imageKey: 'dinner_image', caloriesKey: 'dinner_calories', quantityKey: 'dinner_quantity' }
    };

    const mapping = mealTypeMap[mealType];
    if (!mapping) {
      console.error('❌ Mapping NU GĂSIT pentru:', mealType);
      return;
    }

    const optionName = language === 'ro' ? option.name_ro : option.name_en;
    const quantity = checkIn?.[mapping.quantityKey] || 1;

    const updatedFields = {
      [mapping.key]: optionName,
      [mapping.imageKey]: option.image_url,
      [mapping.caloriesKey]: option.calories * quantity,
      [mapping.quantityKey]: quantity,
    };

    const tempCheckIn = { ...(checkIn || {}), ...updatedFields };

    const totalCalories = meals.reduce((sum, m) => {
      const currentMealMapping = mealTypeMap[m.mealType];
      const mealCalKey = currentMealMapping ? currentMealMapping.caloriesKey : null;
      return sum + (tempCheckIn[mealCalKey] || 0);
    }, 0);

    const dataToSend = {
      ...tempCheckIn,
      date: format(selectedDate, 'yyyy-MM-dd'),
      day_number: getCurrentDay(),
      phase: currentPhase,
      total_calories: totalCalories
    };
    
    console.log('📤 TRIMIT LA BACKEND:', dataToSend);
    updateCheckInMutation.mutate(dataToSend);
  }, [checkIn, language, updateCheckInMutation, meals, selectedDate, currentPhase]);

  // DESELECT meal - șterge selecția și permite alegerea altei opțiuni
  const handleMealDeselect = useCallback((mealType) => {
    const mealTypeMap = {
      'breakfast': { key: 'breakfast_option', imageKey: 'breakfast_image', caloriesKey: 'breakfast_calories', quantityKey: 'breakfast_quantity', completedKey: 'breakfast_completed' },
      'snack1': { key: 'snack1_option', imageKey: 'snack1_image', caloriesKey: 'snack1_calories', quantityKey: 'snack1_quantity', completedKey: 'snack1_completed' },
      'lunch': { key: 'lunch_option', imageKey: 'lunch_image', caloriesKey: 'lunch_calories', quantityKey: 'lunch_quantity', completedKey: 'lunch_completed' },
      'snack2': { key: 'snack2_option', imageKey: 'snack2_image', caloriesKey: 'snack2_calories', quantityKey: 'snack2_quantity', completedKey: 'snack2_completed' },
      'dinner': { key: 'dinner_option', imageKey: 'dinner_image', caloriesKey: 'dinner_calories', quantityKey: 'dinner_quantity', completedKey: 'dinner_completed' }
    };

    const mapping = mealTypeMap[mealType];
    if (!mapping) return;

    // Șterge toate datele asociate cu masa și marchează ca "necompletat"
    const updatedFields = {
      [mapping.key]: null,
      [mapping.imageKey]: null,
      [mapping.caloriesKey]: 0,
      [mapping.quantityKey]: 1,
      [mapping.completedKey]: false,
    };

    const tempCheckIn = { ...(checkIn || {}), ...updatedFields };

    const totalCalories = meals.reduce((sum, m) => {
      const currentMealMapping = mealTypeMap[m.mealType];
      const mealCalKey = currentMealMapping ? currentMealMapping.caloriesKey : null;
      return sum + (tempCheckIn[mealCalKey] || 0);
    }, 0);

    updateCheckInMutation.mutate({
      ...tempCheckIn,
      date: format(selectedDate, 'yyyy-MM-dd'),
      day_number: getCurrentDay(),
      phase: currentPhase,
      total_calories: totalCalories
    });
  }, [checkIn, updateCheckInMutation, meals, selectedDate, currentPhase]);

  const handleQuantityChange = useCallback((mealType, increment) => {
    const mealTypeMap = {
      'breakfast': { optionKey: 'breakfast_option', caloriesKey: 'breakfast_calories', quantityKey: 'breakfast_quantity' },
      'snack1': { optionKey: 'snack1_option', caloriesKey: 'snack1_calories', quantityKey: 'snack1_quantity' },
      'lunch': { optionKey: 'lunch_option', caloriesKey: 'lunch_calories', quantityKey: 'lunch_quantity' },
      'snack2': { optionKey: 'snack2_option', caloriesKey: 'snack2_calories', quantityKey: 'snack2_quantity' },
      'dinner': { optionKey: 'dinner_option', caloriesKey: 'dinner_calories', quantityKey: 'dinner_quantity' }
    };

    const mapping = mealTypeMap[mealType];
    if (!mapping) return;

    const currentQuantity = checkIn?.[mapping.quantityKey] || 1;
    const newQuantity = Math.max(0.5, Math.min(5, currentQuantity + increment));

    if (newQuantity === currentQuantity && increment !== 0) return;

    const selectedOptionName = checkIn?.[mapping.optionKey];
    const baseRecipe = recipes.find(r => 
      (language === 'ro' ? r.name_ro : r.name_en) === selectedOptionName
    );

    const baseCalories = baseRecipe?.calories || 0;
    const newCalories = baseCalories * newQuantity;

    const updatedFields = {
      [mapping.caloriesKey]: newCalories,
      [mapping.quantityKey]: newQuantity,
    };

    const tempCheckIn = { ...(checkIn || {}), ...updatedFields };

    const totalCalories = meals.reduce((sum, m) => {
      const currentMealMapping = mealTypeMap[m.mealType];
      const mealCalKey = currentMealMapping ? currentMealMapping.caloriesKey : null;
      return sum + (tempCheckIn[mealCalKey] || 0);
    }, 0);

    updateCheckInMutation.mutate({
      ...tempCheckIn,
      date: format(selectedDate, 'yyyy-MM-dd'),
      day_number: getCurrentDay(),
      phase: currentPhase,
      total_calories: totalCalories
    });
  }, [checkIn, recipes, language, updateCheckInMutation, meals, selectedDate, currentPhase]);

  const handleWaterUpdate = useCallback((increment) => {
    const current = checkIn?.water_intake || 0;
    const newValue = Math.max(0, Math.min(12, current + increment));
    
    const dataToSend = {
      ...(checkIn || {}),
      date: format(selectedDate, 'yyyy-MM-dd'),
      day_number: getCurrentDay(),
      phase: currentPhase,
      water_intake: newValue
    };
    
    console.log('💧 CLICK APĂ!', { current, newValue, dataToSend });
    updateCheckInMutation.mutate(dataToSend);
  }, [checkIn, updateCheckInMutation, selectedDate, currentPhase]);

  const handleExerciseUpdate = useCallback(() => {
    const caloriesBurned = calculateCaloriesBurned(exerciseType, exerciseDuration);
    
    const dataToSend = {
      ...(checkIn || {}),
      date: format(selectedDate, 'yyyy-MM-dd'),
      day_number: getCurrentDay(),
      phase: currentPhase,
      exercise_completed: true,
      exercise_type: exerciseType,
      exercise_duration: exerciseDuration,
      exercise_calories_burned: caloriesBurned
    };
    
    console.log('💪 CLICK EXERCIȚIU!', { exerciseType, exerciseDuration, caloriesBurned, dataToSend });
    updateCheckInMutation.mutate(dataToSend);
  }, [checkIn, exerciseType, exerciseDuration, calculateCaloriesBurned, updateCheckInMutation, selectedDate, currentPhase]);

  const completedMeals = useMemo(() => {
    if (!checkIn) return 0;
    
    // Numără CORECT câte mese sunt completate
    const count = [
      checkIn.breakfast_completed,
      checkIn.snack1_completed,
      checkIn.lunch_completed,
      checkIn.snack2_completed,
      checkIn.dinner_completed
    ].filter(Boolean).length;
    
    console.log('🔍 MESE COMPLETATE:', {
      breakfast: checkIn.breakfast_completed,
      snack1: checkIn.snack1_completed,
      lunch: checkIn.lunch_completed,
      snack2: checkIn.snack2_completed,
      dinner: checkIn.dinner_completed,
      total: count
    });
    
    return count;
  }, [checkIn]);

  // MEMOIZE exercise types to avoid recreating on every render
  const exerciseTypes = useMemo(() => ({
    walking: { name: { en: "Walking", ro: "Mers" }, calsPerMin: 3.5 },
    running: { name: { en: "Running", ro: "Alergat" }, calsPerMin: 9 },
    circuit: { name: { en: "Circuit Training", ro: "Antrenament pe Circuit" }, calsPerMin: 8 },
    body_pump: { name: { en: "Body Pump", ro: "Body Pump" }, calsPerMin: 7 },
    basic_workout: { name: { en: "Basic Workout", ro: "Antrenament de Bază" }, calsPerMin: 6 }
  }), []);

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Date Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">{language === 'ro' ? 'Planul Zilei' : 'Daily Plan'}</h1>
            <p className="text-[rgb(var(--ios-text-secondary))] mt-1">
              {format(selectedDate, "EEEE, d MMMM yyyy", { locale: language === 'ro' ? ro : enUS })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPreferencesModal(true)}
              title={language === 'ro' ? 'Preferințe alimentare' : 'Dietary preferences'}
              className="border-[rgb(var(--ios-border))]"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              disabled={user?.start_date && differenceInDays(selectedDate, new Date(user.start_date)) <= 0}
              className="border-[rgb(var(--ios-border))]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
              className="border-[rgb(var(--ios-border))]"
            >
              {t('today')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              disabled={differenceInDays(selectedDate, new Date()) >= 0}
              className="border-[rgb(var(--ios-border))]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dietary Preferences Badge */}
        {(user?.is_vegetarian || user?.is_vegan || (user?.allergies && user.allergies.length > 0) || (user?.favorite_foods && user.favorite_foods.length > 0)) && (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  {language === 'ro' ? 'Filtre active:' : 'Active filters:'}
                </span>
                {user.is_vegan && (
                  <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                    {language === 'ro' ? 'Vegan' : 'Vegan'}
                  </Badge>
                )}
                {user.is_vegetarian && !user.is_vegan && (
                  <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                    {language === 'ro' ? 'Vegetarian' : 'Vegetarian'}
                  </Badge>
                )}
                {user.allergies && user.allergies.map(allergy => (
                  <Badge key={allergy} className="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200">
                    {language === 'ro' ? 'Fără' : 'No'} {allergy}
                  </Badge>
                ))}
                {user.favorite_foods && user.favorite_foods.length > 0 && (
                  <Badge className="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200">
                    <Heart className="w-3 h-3 mr-1" />
                    {user.favorite_foods.length} {language === 'ro' ? 'favorite' : 'favorites'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phase Info */}
        <Card className="ios-card border-none ios-shadow-lg rounded-[24px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-bold ${phase.textColor}`}>{phase.name[language]}</h2>
                <p className="text-[rgb(var(--ios-text-secondary))] mt-1">{language === 'ro' ? 'Ziua' : 'Day'} {currentDay} {language === 'ro' ? 'din' : 'of'} 28</p>
              </div>
              <div className={`w-16 h-16 bg-gradient-to-br ${phase.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-3xl font-bold text-white">{currentPhase}</span>
              </div>
            </div>
            <Progress value={(currentDay / 28) * 100} className="h-2 mb-4 bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-500" />
            <div className="space-y-2">
              {phase.guidelines[language].map((guideline, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${phase.textColor} flex-shrink-0 mt-0.5`} />
                  <span className="text-sm text-[rgb(var(--ios-text-secondary))]">{guideline}</span>
                </div>
              ))}
            </div>

            {/* Alimente Permise / Interzise - 2 COLOANE */}
            <div className="mt-4 pt-4 border-t border-[rgb(var(--ios-border))]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Coloana 1: CE POȚI MÂNCA */}
                <div>
                  <h3 className="font-semibold text-sm text-[rgb(var(--ios-text-primary))] mb-3">
                    {language === 'ro' ? '✅ CE POȚI MÂNCA:' : '✅ WHAT YOU CAN EAT:'}
                  </h3>
                  <div className="space-y-1">
                    {phase.allowedFoods[language].yes.map((food, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span className="text-xs text-[rgb(var(--ios-text-secondary))]">{food}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Coloana 2: CE TREBUIE EVITAT */}
                <div>
                  <h3 className="font-semibold text-sm text-[rgb(var(--ios-text-primary))] mb-3">
                    {language === 'ro' ? '❌ CE TREBUIE EVITAT:' : '❌ WHAT TO AVOID:'}
                  </h3>
                  <div className="space-y-1">
                    {phase.allowedFoods[language].no.map((food, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span className="text-xs text-[rgb(var(--ios-text-secondary))]">{food}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Today */}
        <Card className="ios-card border-none ios-shadow-lg rounded-[20px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-[rgb(var(--ios-text-primary))]">{language === 'ro' ? 'Progresul de astăzi' : "Today's progress"}</span>
              <span className="text-lg font-normal text-[rgb(var(--ios-text-secondary))]">{completedMeals}/5 {language === 'ro' ? 'mese' : 'meals'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(completedMeals / 5) * 100} className="h-3 mb-4 bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-500" />
          </CardContent>
        </Card>

        {/* Calorie Tracker - DETAILED */}
        <Card className="ios-card border-none ios-shadow-lg rounded-[20px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[rgb(var(--ios-text-primary))]">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {language === 'ro' ? 'Bilanț Caloric' : 'Calorie Balance'}
              </div>
              <span className="text-sm font-normal text-[rgb(var(--ios-text-secondary))]">
                {format(selectedDate, 'dd MMM yyyy', { locale: language === 'ro' ? ro : enUS })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Calculate TDEE (Total Daily Energy Expenditure)
              const calculateTDEE = () => {
                if (!user?.current_weight || !user?.height || !user?.age || !user?.gender) return 2000;
                
                // BMR calculation using Mifflin-St Jeor Equation
                let bmr;
                if (user.gender === 'male' || user.gender === 'm') {
                  bmr = 10 * user.current_weight + 6.25 * user.height - 5 * user.age + 5;
                } else {
                  bmr = 10 * user.current_weight + 6.25 * user.height - 5 * user.age - 161;
                }
                
                // Activity level multipliers
                const activityMultipliers = {
                  sedentary: 1.2,
                  light: 1.375,
                  moderate: 1.55,
                  active: 1.725,
                  very_active: 1.9
                };
                
                const multiplier = activityMultipliers[user.activity_level] || 1.55;
                return Math.round(bmr * multiplier);
              };
              
              const tdee = calculateTDEE();
              
              // Calculate consumed calories from all meals
              const consumed = (
                (checkIn?.breakfast_calories || 0) +
                (checkIn?.snack1_calories || 0) +
                (checkIn?.lunch_calories || 0) +
                (checkIn?.snack2_calories || 0) +
                (checkIn?.dinner_calories || 0)
              );
              
              // Calculate burned calories from exercise
              const burned = checkIn?.exercise_calories_burned || 0;
              
              // Net balance
              const balance = consumed - burned;
              const remaining = tdee - balance;
              
              return (
                <div className="space-y-4">
                  {/* Calorie Bars */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Recommended */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-[14px] border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          {language === 'ro' ? 'Recomandate' : 'Recommended'}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tdee}</p>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70">cal/zi</p>
                    </div>
                    
                    {/* Consumed */}
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-[14px] border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-1">
                        <UtensilsCrossed className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                          {language === 'ro' ? 'Consumate' : 'Consumed'}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{consumed}</p>
                      <p className="text-xs text-orange-600/70 dark:text-orange-400/70">cal</p>
                    </div>
                    
                    {/* Burned */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-[14px] border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                          {language === 'ro' ? 'Arse' : 'Burned'}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{burned}</p>
                      <p className="text-xs text-purple-600/70 dark:text-purple-400/70">cal</p>
                    </div>
                    
                    {/* Balance */}
                    <div className={`p-4 rounded-[14px] border ${
                      remaining > 0 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className={`w-4 h-4 ${remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                        <span className={`text-xs font-medium ${remaining > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                          {language === 'ro' ? 'Balanță' : 'Balance'}
                        </span>
                      </div>
                      <p className={`text-2xl font-bold ${remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {remaining > 0 ? '+' : ''}{remaining}
                      </p>
                      <p className={`text-xs ${remaining > 0 ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-red-600/70 dark:text-red-400/70'}`}>
                        {language === 'ro' ? 'rămase' : 'remaining'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Formula */}
                  <div className="p-3 bg-[rgb(var(--ios-bg-tertiary))] rounded-[12px] border border-[rgb(var(--ios-border))]">
                    <div className="flex items-center justify-center gap-2 text-xs text-[rgb(var(--ios-text-secondary))]">
                      <span className="font-semibold text-blue-600">{tdee}</span>
                      <span>-</span>
                      <span className="font-semibold text-orange-600">{consumed}</span>
                      <span>+</span>
                      <span className="font-semibold text-purple-600">{burned}</span>
                      <span>=</span>
                      <span className={`font-bold ${remaining > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {remaining} cal {language === 'ro' ? 'rămase' : 'left'}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown detaliat - dacă sunt calorii consumate */}
                  {consumed > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-[12px] border border-orange-200 dark:border-orange-800">
                      <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-2">
                        {language === 'ro' ? '📊 Breakdown calorii consumate:' : '📊 Consumed calories breakdown:'}
                      </p>
                      <div className="space-y-1">
                        {checkIn?.breakfast_calories > 0 && (
                          <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400">
                            <span>{language === 'ro' ? 'Mic dejun' : 'Breakfast'}:</span>
                            <span className="font-semibold">{checkIn.breakfast_calories} cal</span>
                          </div>
                        )}
                        {checkIn?.snack1_calories > 0 && (
                          <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400">
                            <span>{language === 'ro' ? 'Gustare 1' : 'Snack 1'}:</span>
                            <span className="font-semibold">{checkIn.snack1_calories} cal</span>
                          </div>
                        )}
                        {checkIn?.lunch_calories > 0 && (
                          <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400">
                            <span>{language === 'ro' ? 'Prânz' : 'Lunch'}:</span>
                            <span className="font-semibold">{checkIn.lunch_calories} cal</span>
                          </div>
                        )}
                        {checkIn?.snack2_calories > 0 && (
                          <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400">
                            <span>{language === 'ro' ? 'Gustare 2' : 'Snack 2'}:</span>
                            <span className="font-semibold">{checkIn.snack2_calories} cal</span>
                          </div>
                        )}
                        {checkIn?.dinner_calories > 0 && (
                          <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400">
                            <span>{language === 'ro' ? 'Cină' : 'Dinner'}:</span>
                            <span className="font-semibold">{checkIn.dinner_calories} cal</span>
                          </div>
                        )}
                        <div className="pt-1 mt-1 border-t border-orange-300 dark:border-orange-700 flex justify-between text-xs font-bold text-orange-700 dark:text-orange-300">
                          <span>TOTAL:</span>
                          <span>{consumed} cal</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Meals with Database Options */}
        <div className="space-y-4">
          {meals.map((meal) => {
            const MealIcon = meal.icon;
            const isCompleted = checkIn?.[meal.key];
            
            // Filtrează rețete pe fază ȘI tip de masă
            const phaseRecipes = recipes.filter(r => r.phase === currentPhase && r.meal_type === meal.mealType);
            const filteredOptions = filterMealOptions(phaseRecipes);
            const options = sortMealOptionsByFavorites(filteredOptions);

            const mealTypeMap = {
              'breakfast': { optionKey: 'breakfast_option', imageKey: 'breakfast_image', quantityKey: 'breakfast_quantity', caloriesKey: 'breakfast_calories' },
              'snack1': { optionKey: 'snack1_option', imageKey: 'snack1_image', quantityKey: 'snack1_quantity', caloriesKey: 'snack1_calories' },
              'lunch': { optionKey: 'lunch_option', imageKey: 'lunch_image', quantityKey: 'lunch_quantity', caloriesKey: 'lunch_calories' },
              'snack2': { optionKey: 'snack2_option', imageKey: 'snack2_image', quantityKey: 'snack2_quantity', caloriesKey: 'snack2_calories' },
              'dinner': { optionKey: 'dinner_option', imageKey: 'dinner_image', quantityKey: 'dinner_quantity', caloriesKey: 'dinner_calories' }
            };

            const selectedOptionName = checkIn?.[mealTypeMap[meal.mealType].optionKey];
            const selectedOptionImage = checkIn?.[mealTypeMap[meal.mealType].imageKey];
            const selectedQuantity = checkIn?.[mealTypeMap[meal.mealType].quantityKey] || 1;
            const selectedCalories = checkIn?.[mealTypeMap[meal.mealType].caloriesKey] || 0;

            return (
              <Card
                key={meal.key}
                className={`border-2 transition-all duration-300 rounded-[20px] ${
                  isCompleted
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : 'border-[rgb(var(--ios-border))] ios-card'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-[rgb(var(--ios-bg-tertiary))]'
                    }`}>
                      <MealIcon className={`w-6 h-6 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[rgb(var(--ios-text-secondary))]'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-[rgb(var(--ios-text-primary))]">{meal.label}</h3>
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
                      </div>
                      {selectedOptionName ? (
                        <div className="mt-2">
                          {/* REȚETA SELECTATĂ - VIZIBILĂ */}
                          <div className="flex items-center gap-2 mb-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            {selectedOptionImage && (
                              <img 
                                src={selectedOptionImage} 
                                alt={selectedOptionName}
                                className="w-10 h-10 rounded-lg object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200 line-clamp-1">
                                ✓ {selectedOptionName}
                              </p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                {selectedQuantity}x · {Math.round(selectedCalories)} cal
                              </p>
                            </div>
                            {/* Dacă masa E completată ȘI NU e în modul edit → arată Edit icon */}
                            {isCompleted && editingMeal !== meal.mealType ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 hover:bg-red-100 dark:hover:bg-red-900/30"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleMealDeselect(meal.mealType);
                                  }}
                                >
                                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 hover:bg-emerald-100 dark:hover:bg-emerald-800"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setEditingMeal(meal.mealType);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                                </Button>
                              </div>
                            ) : (
                              /* Dacă masa NU e completată SAU e în modul edit → arată butoane +/- și X */
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleMealDeselect(meal.mealType);
                                  }}
                                >
                                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-800"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleQuantityChange(meal.mealType, -0.5); 
                                  }}
                                  disabled={selectedQuantity <= 0.5}
                                >
                                  -
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-800"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleQuantityChange(meal.mealType, 0.5); 
                                  }}
                                  disabled={selectedQuantity >= 5}
                                >
                                  +
                                </Button>
                                {/* Dacă e în modul edit, arată buton Done */}
                                {editingMeal === meal.mealType && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 ml-1 text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800"
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setEditingMeal(null);
                                    }}
                                  >
                                    {language === 'ro' ? 'Gata' : 'Done'}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-[rgb(var(--ios-text-tertiary))] mt-1">
                          {language === 'ro' ? 'Alege o opțiune' : 'Choose an option'}
                        </p>
                      )}
                    </div>
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleMealCheck(meal.key, meal.mealType)}
                      className={`min-w-[120px] whitespace-nowrap ${isCompleted ? 'border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' : ''}`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{t('completed')}</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{t('markCompleted')}</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Meal Options Grid - FROM DATABASE */}
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-3 gap-3">
                      {(expandedMeals[meal.mealType] ? options : options.slice(0, 3)).map((option, index) => {
                      const favoriteScore = scoreMealOption(option);
                      // FIXAT: Compară AMBELE nume pentru a evita false positive
                      const currentName = language === 'ro' ? option.name_ro : option.name_en;
                      const isSelected = selectedOptionName === currentName;

                      return (
                        <div
                          key={option.id || index}
                          className={`border-2 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer relative bg-[rgb(var(--ios-bg-primary))] ${
                            isSelected ? 'border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-200 dark:ring-emerald-800' : 'border-[rgb(var(--ios-border))]'
                          }`}
                          onClick={() => handleMealSelection(meal.mealType, option)}
                        >
                          {favoriteScore > 0 && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="bg-pink-500 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1 shadow-lg">
                                <Star className="w-3 h-3" fill="white" />
                                {language === 'ro' ? 'Favorit' : 'Favorite'}
                              </div>
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-2 left-2 z-10">
                              <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            </div>
                          )}
                          {/* IMAGE WITH PROPER ERROR HANDLING AND FALLBACK */}
                          {option.image_url ? (
                            <img
                              src={option.image_url}
                              alt={language === 'ro' ? option.name_ro : option.name_en}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                              }}
                            />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                              <ChefHat className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="p-3">
                            <p className="font-medium text-sm text-[rgb(var(--ios-text-primary))] line-clamp-2 mb-2">
                              {language === 'ro' ? option.name_ro : option.name_en}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[rgb(var(--ios-text-secondary))] mb-2">
                              <span className="font-semibold">{option.calories} cal</span>
                              <span>•</span>
                              <span>P: {option.protein}g</span>
                              <span>C: {option.carbs}g</span>
                              <span>F: {option.fat}g</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {option.is_vegetarian && (
                                <Badge variant="outline" className="text-xs border-[rgb(var(--ios-border))]">
                                  <Leaf className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
                                  {language === 'ro' ? 'Veg' : 'Veg'}
                                </Badge>
                              )}
                              {option.is_vegan && (
                                <Badge variant="outline" className="text-xs border-[rgb(var(--ios-border))]">
                                  <Leaf className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
                                  {language === 'ro' ? 'Vegan' : 'Vegan'}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                // PostgreSQL returnează deja JSONB ca array - nu mai parsăm
                                const parsedOption = {
                                  ...option,
                                  // Ingredients sunt deja array din PostgreSQL
                                  ingredients_ro: option.ingredients_ro || [],
                                  ingredients_en: option.ingredients_en || [],
                                  // Instructions - împarte pe propoziții
                                  instructions_ro: typeof option.instructions_ro === 'string' 
                                    ? option.instructions_ro.split('.').filter(s => s.trim()).map(s => s + '.') 
                                    : (option.instructions_ro || []),
                                  instructions_en: typeof option.instructions_en === 'string' 
                                    ? option.instructions_en.split('.').filter(s => s.trim()).map(s => s + '.')
                                    : (option.instructions_en || []),
                                };
                                setSelectedMealDetail(parsedOption);
                              }}
                            >
                              <Info className="w-3 h-3 mr-1" />
                              {language === 'ro' ? 'Detalii' : 'Details'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                    
                    {/* Buton "Vezi mai multe" dacă sunt mai mult de 3 opțiuni */}
                    {options.length > 3 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setExpandedMeals(prev => ({
                          ...prev,
                          [meal.mealType]: !prev[meal.mealType]
                        }))}
                      >
                        {expandedMeals[meal.mealType] 
                          ? (language === 'ro' ? 'Mai puține opțiuni' : 'Show less')
                          : (language === 'ro' ? `Vezi mai multe (${options.length - 3} rămase)` : `Show more (${options.length - 3} more)`)}
                      </Button>
                    )}
                  </div>

                  {options.length === 0 && (
                    <div className="text-center py-4 text-[rgb(var(--ios-text-tertiary))]">
                      <p className="text-sm">
                        {language === 'ro'
                          ? 'Nu există opțiuni disponibile pentru preferințele tale. Te rugăm să ajustezi filtrele.'
                          : 'No options available for your preferences. Please adjust your filters.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Water Tracking */}
        <Card className="ios-card border-none ios-shadow-lg rounded-[20px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-[rgb(var(--ios-text-primary))]">{language === 'ro' ? 'Hidratare' : 'Hydration'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Pahare de apă' : 'Water glasses'}</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {checkIn?.water_intake || 0}/8
              </span>
            </div>
            <div className="flex gap-2 mb-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-8 rounded-lg transition-colors ${
                    i < (checkIn?.water_intake || 0)
                      ? 'bg-blue-500'
                      : 'bg-[rgb(var(--ios-bg-tertiary))]'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleWaterUpdate(-1)}
                disabled={!checkIn?.water_intake}
                className="border-[rgb(var(--ios-border))]"
              >
                -
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleWaterUpdate(1)}
              >
                {language === 'ro' ? 'Adaugă un pahar' : 'Add a glass'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercise - Enhanced with types and duration */}
        <Card className="ios-card border-none ios-shadow-lg rounded-[20px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-[rgb(var(--ios-text-primary))]">{language === 'ro' ? 'Exercițiu fizic' : 'Exercise'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkIn?.exercise_completed ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                        {exerciseTypes[checkIn.exercise_type]?.name[language] || exerciseTypes.walking.name[language]}
                      </div>
                      <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                        {checkIn.exercise_duration || 30} {language === 'ro' ? 'minute' : 'minutes'} • {checkIn.exercise_calories_burned || 0} {language === 'ro' ? 'calorii arse' : 'calories burned'}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateCheckInMutation.mutate({ ...checkIn, exercise_completed: false, exercise_calories_burned: 0, exercise_duration: 0, exercise_type: null })}
                    className="text-purple-600 dark:text-purple-400"
                  >
                    {language === 'ro' ? 'Editează' : 'Edit'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-[rgb(var(--ios-text-primary))] mb-2 block">
                    {language === 'ro' ? 'Tip exercițiu' : 'Exercise type'}
                  </Label>
                  <Select value={exerciseType} onValueChange={setExerciseType}>
                    <SelectTrigger className="border-[rgb(var(--ios-border))]">
                      <SelectValue placeholder={language === 'ro' ? 'Selectează tipul' : 'Select a type'} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(exerciseTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.name[language]} ({value.calsPerMin} {language === 'ro' ? 'cal/min' : 'cal/min'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[rgb(var(--ios-text-primary))]">
                      {language === 'ro' ? 'Durată (minute)' : 'Duration (minutes)'}
                    </Label>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {exerciseDuration} min
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExerciseDuration(Math.max(5, exerciseDuration - 5))}
                      className="border-[rgb(var(--ios-border))]"
                    >
                      -5
                    </Button>
                    <Input
                      type="number"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(Math.max(5, Math.min(120, parseInt(e.target.value) || 30)))}
                      className="text-center border-[rgb(var(--ios-border))]"
                      min="5"
                      max="120"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExerciseDuration(Math.min(120, exerciseDuration + 5))}
                      className="border-[rgb(var(--ios-border))]"
                    >
                      +5
                    </Button>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-[rgb(var(--ios-text-secondary))]">
                      {language === 'ro' ? 'Estimare' : 'Estimated'}:
                    </span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400 ml-1">
                      ~{calculateCaloriesBurned(exerciseType, exerciseDuration)} {language === 'ro' ? 'calorii arse' : 'calories burned'}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 rounded-[12px]"
                  onClick={handleExerciseUpdate}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  {language === 'ro' ? 'Marchează ca efectuat' : 'Mark as completed'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="ios-card border-none ios-shadow-lg rounded-[20px]">
          <CardHeader>
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">{language === 'ro' ? 'Notițe zilnice' : 'Daily notes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={language === 'ro' ? "Cum te simți astăzi? Notează orice observații..." : "How do you feel today? Note any observations..."}
              value={checkIn?.notes || notes} // Use checkIn.notes if available, otherwise local state
              onChange={(e) => {
                setNotes(e.target.value); // Update local state for immediate feedback
                // Debounce or update immediately depending on desired UX
                updateCheckInMutation.mutate({ ...checkIn, notes: e.target.value });
              }}
              rows={4}
              className="border-[rgb(var(--ios-border))]"
            />
          </CardContent>
        </Card>

        {/* Calendar with 28 Days */}
        {user?.start_date && ( // Only render if user.start_date is available
          <Card className="ios-card border-none ios-shadow-lg rounded-[20px]">
            <CardHeader>
              <CardTitle className="text-[rgb(var(--ios-text-primary))]">
                {language === 'ro' ? 'Calendar Program (28 Zile)' : 'Program Calendar (28 Days)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 dark:border-emerald-600 rounded-lg"></div>
                    <span className="text-xs text-[rgb(var(--ios-text-secondary))]">
                      {language === 'ro' ? 'Complet (toate mesele și exercițiul)' : 'Complete (all meals & exercise)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-lg"></div>
                    <span className="text-xs text-[rgb(var(--ios-text-secondary))]">
                      {language === 'ro' ? 'Necomplet (zi trecută)' : 'Incomplete (past day)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white dark:bg-[rgb(var(--ios-bg-tertiary))] border-2 border-gray-300 dark:border-gray-600 rounded-lg"></div>
                    <span className="text-xs text-[rgb(var(--ios-text-secondary))]">
                      {language === 'ro' ? 'Zi viitoare' : 'Future day'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-600 rounded-lg"></div>
                    <span className="text-xs text-[rgb(var(--ios-text-secondary))]">
                      {language === 'ro' ? 'Ziua Selectată' : 'Selected Day'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {Array.from({ length: 28 }, (_, i) => {
                  const dayNumber = i + 1;
                  const startDateObj = new Date(user.start_date);
                  const dayDate = addDays(startDateObj, i);
                  const dateStr = format(dayDate, 'yyyy-MM-dd');
                  const dayCheckIn = checkIns.find(c => format(new Date(c.date), 'yyyy-MM-dd') === dateStr);
                  
                  // Use selectedDate for current (highlighted) day in calendar
                  const isSelectedDay = format(dayDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const isActualToday = format(dayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const isPast = differenceInDays(dayDate, new Date()) < 0; // Check relative to today
                  const isFuture = differenceInDays(dayDate, new Date()) > 0; // Check relative to today
                  
                  const mealKeys = ['breakfast_completed', 'snack1_completed', 'lunch_completed', 'snack2_completed', 'dinner_completed'];
                  // COMPLETE = TOATE cele 5 mese finalizate (exercițiul e opțional)
                  const mealsCompleted = dayCheckIn && mealKeys.every(key => dayCheckIn[key]);
                  const isComplete = mealsCompleted;
                  
                  const isIncomplete = isPast && dayCheckIn && !isComplete;

                  return (
                    <button
                      key={dayNumber}
                      onClick={() => {
                        if (!isFuture) {
                          setSelectedDate(dayDate);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      disabled={isFuture}
                      className={`
                        aspect-square rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-2
                        ${isSelectedDay
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 shadow-md' 
                          : isComplete 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-600' 
                            : isIncomplete
                              ? 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-600'
                              : isFuture
                                ? 'bg-white dark:bg-[rgb(var(--ios-bg-tertiary))] border-gray-200 dark:border-gray-700 opacity-50'
                                : 'bg-white dark:bg-[rgb(var(--ios-bg-tertiary))] border-gray-300 dark:border-gray-600'
                        }
                        ${!isFuture ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : 'cursor-not-allowed'}
                      `}
                    >
                      <div className={`text-[10px] ${
                        isSelectedDay ? 'text-blue-600 dark:text-blue-400' :
                        isComplete ? 'text-emerald-600 dark:text-emerald-400' :
                        isIncomplete ? 'text-red-600 dark:text-red-400' :
                        isFuture ? 'text-gray-400 dark:text-gray-600' :
                        'text-[rgb(var(--ios-text-tertiary))]'
                      }`}>
                        {format(dayDate, 'd MMM', { locale: language === 'ro' ? ro : enUS })}
                      </div>
                      <div className={`text-2xl font-bold ${
                        isSelectedDay ? 'text-blue-700 dark:text-blue-300' :
                        isComplete ? 'text-emerald-700 dark:text-emerald-300' :
                        isIncomplete ? 'text-red-700 dark:text-red-300' :
                        isFuture ? 'text-gray-400 dark:text-gray-600' :
                        'text-[rgb(var(--ios-text-primary))]'
                      }`}>
                        {dayNumber}
                      </div>
                      {isSelectedDay && (
                        <div className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase mt-0.5">
                          {language === 'ro' ? 'SELECTAT' : 'SELECTED'}
                        </div>
                      )}
                      {isActualToday && !isSelectedDay && ( // Only show TODAY if it's not the selected day
                          <div className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase mt-0.5">
                            {language === 'ro' ? 'AZI' : 'TODAY'}
                          </div>
                      )}
                      {isComplete && !isSelectedDay && (
                        <div className="mt-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                      {isIncomplete && (
                        <div className="text-[9px] text-red-600 dark:text-red-400 mt-0.5">!</div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-4 text-center">
                {language === 'ro' 
                  ? 'Calendarul afișează progresul pe întregul ciclu de 28 de zile. Click pe o zi pentru a o vizualiza.'
                  : 'The calendar shows progress across the entire 28-day cycle. Click on a day to view it.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dietary Preferences Modal */}
      <DietaryPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        user={user}
        onSave={() => {
          base44.auth.me().then(setUser);
        }}
      />

      {/* Meal Detail Modal */}
      <Dialog open={!!selectedMealDetail} onOpenChange={() => setSelectedMealDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[rgb(var(--ios-bg-primary))] border-[rgb(var(--ios-border))]">
          {selectedMealDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-[rgb(var(--ios-text-primary))]">
                  {language === 'ro' ? selectedMealDetail.name_ro : selectedMealDetail.name_en}
                </DialogTitle>
                <DialogDescription>
                  {language === 'ro' ? 'Detalii complete rețetă și valori nutriționale' : 'Complete recipe details and nutritional values'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={selectedMealDetail.image_url}
                  alt={language === 'ro' ? selectedMealDetail.name_ro : selectedMealDetail.name_en}
                  className="w-full h-64 object-cover rounded-xl"
                />

                {/* Macros */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-[rgb(var(--ios-border))]">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedMealDetail.calories}</div>
                        <div className="text-xs text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Calorii' : 'Calories'}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedMealDetail.protein}g</div>
                        <div className="text-xs text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Proteine' : 'Protein'}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedMealDetail.carbs}g</div>
                        <div className="text-xs text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Carbohidrați' : 'Carbs'}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedMealDetail.fat}g</div>
                        <div className="text-xs text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Grăsimi' : 'Fat'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ingredients */}
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                    <UtensilsCrossed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    {language === 'ro' ? 'Ingrediente & Gramaje' : 'Ingredients & Portions'}
                  </h3>
                  <ul className="space-y-1">
                    {selectedMealDetail[language === 'ro' ? 'ingredients_ro' : 'ingredients_en']?.map((ingredient, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span className="text-[rgb(var(--ios-text-secondary))]">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                    <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    {language === 'ro' ? 'Instrucțiuni' : 'Instructions'}
                  </h3>
                  <ol className="space-y-2">
                    {selectedMealDetail[language === 'ro' ? 'instructions_ro' : 'instructions_en']?.map((instruction, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          {i + 1}
                        </span>
                        <span className="text-[rgb(var(--ios-text-secondary))]">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Benefits */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <h3 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    {language === 'ro' ? 'Beneficii' : 'Benefits'}
                  </h3>
                  <p className="text-sm text-emerald-900 dark:text-emerald-100">
                    {selectedMealDetail[language === 'ro' ? 'benefits_ro' : 'benefits_en']}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap">
                  {selectedMealDetail.is_vegetarian && (
                    <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                      <Leaf className="w-3 h-3 mr-1" />
                      {language === 'ro' ? 'Vegetarian' : 'Vegetarian'}
                    </Badge>
                  )}
                  {selectedMealDetail.is_vegan && (
                    <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                      <Leaf className="w-3 h-3 mr-1" />
                      {language === 'ro' ? 'Vegan' : 'Vegan'}
                    </Badge>
                  )}
                  {selectedMealDetail.allergens && selectedMealDetail.allergens.length === 0 && (
                    <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                      {language === 'ro' ? 'Fără alergeni comuni' : 'No common allergens'}
                    </Badge>
                  )}
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setSelectedMealDetail(null)}
                >
                  {language === 'ro' ? 'Închide' : 'Close'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
