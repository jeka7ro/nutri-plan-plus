import React, { useState, useEffect } from 'react';
import localApi from "@/api/localClient";
const base44 = localApi;
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Loader2, Apple, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { getPhaseInfo, getCurrentPhase } from "../utils/phaseUtils";
import { differenceInDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AIFoodAssistant() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // Array de {question, response, timestamp}
  const [showGroceryGenerator, setShowGroceryGenerator] = useState(false);

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  // FREE users: show Premium overlay
  if (user && user.subscription_plan === 'free') {
    return (
      <Button
        onClick={() => window.location.href = '/upgrade'}
        className="fixed bottom-6 right-6 z-50 h-14 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-2xl rounded-full"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        {language === 'ro' ? '🤖 AI Assistant - Premium' : '🤖 AI Assistant - Premium'}
      </Button>
    );
  }

  const getCurrentDay = () => {
    if (!user?.start_date) return 1;
    const startDate = new Date(user.start_date);
    const today = new Date();
    const daysPassed = differenceInDays(today, startDate) + 1;
    return Math.min(Math.max(daysPassed, 1), 28);
  };

  // Using centralized getCurrentPhase from utils

  // ========== AI ANALYZER: Scor 0-10 pentru mese ==========
  const analyzeMeal = (meal, phase) => {
    let score = 10;
    const feedback = [];
    
    const mealLower = meal.toLowerCase();
    
    // REGULI FAZA 1: Carbohidrați + Proteine, FĂRĂ grăsimi
    if (phase === 1) {
      // Interzise: grăsimi, ulei, nuci, avocado, lactate
      if (/ulei|oil|unt|butter|nuci|nuts|avocado|smântână|cream|brânză|cheese|bacon/.test(mealLower)) {
        score -= 4;
        feedback.push(language === 'ro' ? '❌ Faza 1: FĂRĂ grăsimi!' : '❌ Phase 1: NO fats!');
      }
      // Banane interzise
      if (/banan|banana/.test(mealLower)) {
        score -= 3;
        feedback.push(language === 'ro' ? '❌ Bananele sunt interzise!' : '❌ Bananas forbidden!');
      }
      // Trebuie carbohidrați
      if (!/orez|rice|quinoa|ovăz|oat|pâine|bread|paste|pasta/.test(mealLower)) {
        score -= 2;
        feedback.push(language === 'ro' ? '⚠️ Adaugă carbohidrați (orez, quinoa, ovăz)' : '⚠️ Add carbs (rice, quinoa, oats)');
      }
    }
    
    // REGULI FAZA 2: Proteine + Legume, FĂRĂ carbohidrați și grăsimi
    if (phase === 2) {
      if (/orez|rice|pâine|bread|paste|pasta|cartofi|potato|quinoa|ovăz|oat/.test(mealLower)) {
        score -= 4;
        feedback.push(language === 'ro' ? '❌ Faza 2: FĂRĂ carbohidrați!' : '❌ Phase 2: NO carbs!');
      }
      if (/ulei|oil|unt|butter|nuci|nuts|avocado/.test(mealLower)) {
        score -= 3;
        feedback.push(language === 'ro' ? '❌ Fază 2: FĂRĂ grăsimi!' : '❌ Phase 2: NO fats!');
      }
      // Trebuie proteine
      if (!/pui|chicken|pește|fish|curcan|turkey|carne|meat|ou|egg/.test(mealLower)) {
        score -= 2;
        feedback.push(language === 'ro' ? '⚠️ Adaugă proteine (pui, pește, ou)' : '⚠️ Add protein (chicken, fish, eggs)');
      }
    }
    
    // REGULI FAZA 3: Grăsimi sănătoase + proteine + legume, carbohidrați limitați
    if (phase === 3) {
      // Verifică echilibru
      const hasProtein = /pui|chicken|pește|fish|carne|meat|ou|egg/.test(mealLower);
      const hasFats = /ulei|oil|avocado|nuci|nuts|somon|salmon|semințe|seeds/.test(mealLower);
      
      // Interzise: zahăr, ciocolată, alimente procesate
      if (/zahăr|sugar|ciocolată|chocolate|dulciuri|candy|prăjituri|cake/.test(mealLower)) {
        score -= 4;
        feedback.push(language === 'ro' ? '❌ Faza 3: FĂRĂ zahăr și ciocolată!' : '❌ Phase 3: NO sugar and chocolate!');
      }
      
      // Carbohidrați rafinați interzisi
      if (/pâine albă|white bread|orez alb|white rice|paste albe|white pasta/.test(mealLower)) {
        score -= 3;
        feedback.push(language === 'ro' ? '❌ Faza 3: FĂRĂ carbohidrați rafinați!' : '❌ Phase 3: NO refined carbs!');
      }
      
      if (!hasProtein) {
        score -= 2;
        feedback.push(language === 'ro' ? '⚠️ Adaugă proteine' : '⚠️ Add protein');
      }
      if (!hasFats) {
        score -= 1;
        feedback.push(language === 'ro' ? 'ℹ️ Adaugă grăsimi sănătoase (avocado, nuci, ulei măsline)' : 'ℹ️ Add healthy fats (avocado, nuts, olive oil)');
      }
    }
    
    // Bonus pentru legume
    if (/salată|salad|broccoli|spanac|spinach|legume|vegetable/.test(mealLower)) {
      feedback.push(language === 'ro' ? '✅ Perfect! Legume incluse' : '✅ Great! Veggies included');
    }
    
    score = Math.max(0, Math.min(10, score));
    
    return {
      score,
      feedback: feedback.length > 0 ? feedback : [language === 'ro' ? '✅ Excellent! Mâncare perfectă pentru faza ta!' : '✅ Excellent! Perfect meal for your phase!'],
      badge: score >= 8 ? '🟢' : score >= 6 ? '🟡' : '🔴'
    };
  };

  // ========== MEAL TIMELINE - Grafic vizual pentru mese ==========
  const getMealTimeline = () => {
    const meals = [
      { time: '08:00', name: language === 'ro' ? 'Mic Dejun' : 'Breakfast', key: 'breakfast_completed', icon: '☕' },
      { time: '10:00', name: language === 'ro' ? 'Gustare 1' : 'Snack 1', key: 'snack1_completed', icon: '🍎' },
      { time: '13:00', name: language === 'ro' ? 'Prânz' : 'Lunch', key: 'lunch_completed', icon: '🍽️' },
      { time: '16:00', name: language === 'ro' ? 'Gustare 2' : 'Snack 2', key: 'snack2_completed', icon: '🥗' },
      { time: '19:00', name: language === 'ro' ? 'Cină' : 'Dinner', key: 'dinner_completed', icon: '🌙' },
    ];

    const currentHour = new Date().getHours();
    
    return meals.map(meal => {
      const mealHour = parseInt(meal.time.split(':')[0]);
      const isPast = currentHour > mealHour;
      const isNow = currentHour === mealHour;
      const isCompleted = checkIn?.[meal.key];
      
      return {
        ...meal,
        isPast,
        isNow,
        isCompleted,
        status: isCompleted ? 'done' : isPast ? 'missed' : isNow ? 'current' : 'upcoming'
      };
    });
  };

  // ========== SMART REMINDERS ==========
  const getSmartReminders = () => {
    const reminders = [];
    const hour = new Date().getHours();
    const timeline = getMealTimeline();
    const currentMeal = timeline.find(m => m.isNow);
    const nextMeal = timeline.find(m => m.status === 'upcoming');
    
    // Reminder pentru masa curentă
    if (currentMeal && !currentMeal.isCompleted) {
      reminders.push({
        type: 'urgent',
        message: language === 'ro' 
          ? `⏰ Este ora pentru ${currentMeal.name}! Nu uita să mănânci!`
          : `⏰ Time for ${currentMeal.name}! Don't forget to eat!`
      });
    }
    
    // Reminder pentru apă
    const waterGlasses = checkIn?.water_glasses || 0;
    if (waterGlasses < 8) {
      reminders.push({
        type: 'water',
        message: language === 'ro'
          ? `💧 Ai băut doar ${waterGlasses}/8 pahare de apă azi. Bea mai multă apă!`
          : `💧 You've had only ${waterGlasses}/8 glasses of water today. Drink more!`
      });
    }
    
    // Reminder pentru următoarea masă
    if (nextMeal) {
      reminders.push({
        type: 'info',
        message: language === 'ro'
          ? `📅 Următoarea masă: ${nextMeal.name} la ${nextMeal.time}`
          : `📅 Next meal: ${nextMeal.name} at ${nextMeal.time}`
      });
    }
    
    // Reminder pentru exerciții
    if (hour > 17 && (!checkIn?.exercise_calories_burned || checkIn.exercise_calories_burned === 0)) {
      reminders.push({
        type: 'exercise',
        message: language === 'ro'
          ? `🏃 Nu ai făcut exerciții fizice azi! 30 min de cardio te ajută să arzi grăsime!'`
          : `🏃 No exercise today! 30 min of cardio helps burn fat!`
      });
    }
    
    return reminders;
  };

  const getNextMeal = () => {
    const hour = new Date().getHours();
    if (!checkIn) {
      if (hour < 9) return language === 'ro' ? 'micul dejun' : 'breakfast';
      if (hour < 11) return language === 'ro' ? 'gustarea de dimineață' : 'morning snack';
      if (hour < 14) return language === 'ro' ? 'prânzul' : 'lunch';
      if (hour < 17) return language === 'ro' ? 'gustarea de după-amiază' : 'afternoon snack';
      return language === 'ro' ? 'cina' : 'dinner';
    }

    if (!checkIn.breakfast_completed) return language === 'ro' ? 'micul dejun' : 'breakfast';
    if (!checkIn.snack1_completed && hour < 11) return language === 'ro' ? 'gustarea de dimineață' : 'morning snack';
    if (!checkIn.lunch_completed && hour < 14) return language === 'ro' ? 'prânzul' : 'lunch';
    if (!checkIn.snack2_completed && hour < 17) return language === 'ro' ? 'gustarea de după-amiază' : 'afternoon snack';
    if (!checkIn.dinner_completed) return language === 'ro' ? 'cina' : 'dinner';
    
    return language === 'ro' ? 'următoarea masă' : 'next meal';
  };

  // ========== GROCERY LIST GENERATOR (cu GRAMAJE!) ==========
  const generateGroceryList = (days) => {
    const currentDay = getCurrentDay();
    const mealsPerDay = 5; // breakfast, snack1, lunch, snack2, dinner
    const totalMeals = days * mealsPerDay;
    
    const groceryItems = {
      1: { // Faza 1: HIGH carbs, LOW fat
        ro: [
          { name: 'Ovăz', qty: `${days * 100}g`, cat: 'Cereale' },
          { name: 'Orez brun/sălbatic', qty: `${days * 200}g`, cat: 'Cereale' },
          { name: 'Quinoa', qty: `${days * 150}g`, cat: 'Cereale' },
          { name: 'Pâine de secară', qty: `${days * 4} felii`, cat: 'Cereale' },
          { name: 'Hrișcă', qty: `${days * 100}g`, cat: 'Cereale' },
          { name: 'Mei', qty: `${days * 100}g`, cat: 'Cereale' },
          { name: 'Linte', qty: `${days * 150}g`, cat: 'Leguminoase' },
          { name: 'Fasole', qty: `${days * 150}g`, cat: 'Leguminoase' },
          { name: 'Mazărea', qty: `${days * 100}g`, cat: 'Leguminoase' },
          { name: 'Pui (piept)', qty: `${days * 200}g`, cat: 'Proteine' },
          { name: 'Curcan (piept)', qty: `${days * 180}g`, cat: 'Proteine' },
          { name: 'Pește alb (cod/tilapia)', qty: `${days * 200}g`, cat: 'Proteine' },
          { name: 'Mere', qty: `${days * 2} buc`, cat: 'Fructe' },
          { name: 'Pere', qty: `${days * 2} buc`, cat: 'Fructe' },
          { name: 'Portocale', qty: `${days * 2} buc`, cat: 'Fructe' },
          { name: 'Piersici', qty: `${days * 3} buc`, cat: 'Fructe' },
          { name: 'Kiwi', qty: `${days * 4} buc`, cat: 'Fructe' },
          { name: 'Pepene verde', qty: `${Math.ceil(days / 2)} bucată`, cat: 'Fructe' },
          { name: 'Fructe de pădure', qty: `${days * 200}g`, cat: 'Fructe' },
          { name: 'Broccoli', qty: `${days * 300}g`, cat: 'Legume' },
          { name: 'Spanac', qty: `${days * 200}g`, cat: 'Legume' },
          { name: 'Salată verde', qty: `${days} buc`, cat: 'Legume' },
          { name: 'Roșii', qty: `${days * 4} buc`, cat: 'Legume' },
          { name: 'Castraveți', qty: `${days * 2} buc`, cat: 'Legume' }
        ],
        en: [
          { name: 'Oats', qty: `${days * 100}g`, cat: 'Grains' },
          { name: 'Brown/wild rice', qty: `${days * 200}g`, cat: 'Grains' },
          { name: 'Quinoa', qty: `${days * 150}g`, cat: 'Grains' },
          { name: 'Rye bread', qty: `${days * 4} slices`, cat: 'Grains' },
          { name: 'Buckwheat', qty: `${days * 100}g`, cat: 'Grains' },
          { name: 'Millet', qty: `${days * 100}g`, cat: 'Grains' },
          { name: 'Lentils', qty: `${days * 150}g`, cat: 'Legumes' },
          { name: 'Beans', qty: `${days * 150}g`, cat: 'Legumes' },
          { name: 'Peas', qty: `${days * 100}g`, cat: 'Legumes' },
          { name: 'Chicken breast', qty: `${days * 200}g`, cat: 'Protein' },
          { name: 'Turkey breast', qty: `${days * 180}g`, cat: 'Protein' },
          { name: 'White fish (cod/tilapia)', qty: `${days * 200}g`, cat: 'Protein' },
          { name: 'Apples', qty: `${days * 2} pcs`, cat: 'Fruits' },
          { name: 'Pears', qty: `${days * 2} pcs`, cat: 'Fruits' },
          { name: 'Oranges', qty: `${days * 2} pcs`, cat: 'Fruits' },
          { name: 'Peaches', qty: `${days * 3} pcs`, cat: 'Fruits' },
          { name: 'Kiwi', qty: `${days * 4} pcs`, cat: 'Fruits' },
          { name: 'Watermelon', qty: `${Math.ceil(days / 2)} piece`, cat: 'Fruits' },
          { name: 'Berries', qty: `${days * 200}g`, cat: 'Fruits' },
          { name: 'Broccoli', qty: `${days * 300}g`, cat: 'Vegetables' },
          { name: 'Spinach', qty: `${days * 200}g`, cat: 'Vegetables' },
          { name: 'Lettuce', qty: `${days} head`, cat: 'Vegetables' },
          { name: 'Tomatoes', qty: `${days * 4} pcs`, cat: 'Vegetables' },
          { name: 'Cucumbers', qty: `${days * 2} pcs`, cat: 'Vegetables' }
        ]
      },
      2: { // Faza 2: HIGH protein, NO carbs/fats
        ro: [
          { name: 'Pui (piept)', qty: `${days * 400}g`, cat: 'Proteine' },
          { name: 'Curcan (piept)', qty: `${days * 350}g`, cat: 'Proteine' },
          { name: 'Pește alb', qty: `${days * 300}g`, cat: 'Proteine' },
          { name: 'Ton', qty: `${days * 200}g`, cat: 'Proteine' },
          { name: 'Somon', qty: `${days * 200}g`, cat: 'Proteine' },
          { name: 'Creveți', qty: `${days * 150}g`, cat: 'Proteine' },
          { name: 'Ouă (doar albuș)', qty: `${days * 10} ouă`, cat: 'Proteine' },
          { name: 'Broccoli', qty: `${days * 400}g`, cat: 'Legume' },
          { name: 'Spanac', qty: `${days * 300}g`, cat: 'Legume' },
          { name: 'Salată verde', qty: `${days * 2} buc`, cat: 'Legume' },
          { name: 'Varză kale', qty: `${days * 200}g`, cat: 'Legume' },
          { name: 'Castraveți', qty: `${days * 3} buc`, cat: 'Legume' },
          { name: 'Țelină', qty: `${days} legătură`, cat: 'Legume' },
          { name: 'Sparanghel', qty: `${days * 200}g`, cat: 'Legume' },
          { name: 'Ardei gras', qty: `${days * 3} buc`, cat: 'Legume' },
          { name: 'Roșii cherry', qty: `${days * 250}g`, cat: 'Legume' },
          { name: 'Fasole verde', qty: `${days * 200}g`, cat: 'Legume' }
        ],
        en: [
          { name: 'Chicken breast', qty: `${days * 400}g`, cat: 'Protein' },
          { name: 'Turkey breast', qty: `${days * 350}g`, cat: 'Protein' },
          { name: 'White fish', qty: `${days * 300}g`, cat: 'Protein' },
          { name: 'Tuna', qty: `${days * 200}g`, cat: 'Protein' },
          { name: 'Salmon', qty: `${days * 200}g`, cat: 'Protein' },
          { name: 'Shrimp', qty: `${days * 150}g`, cat: 'Protein' },
          { name: 'Eggs (whites only)', qty: `${days * 10} eggs`, cat: 'Protein' },
          { name: 'Broccoli', qty: `${days * 400}g`, cat: 'Vegetables' },
          { name: 'Spinach', qty: `${days * 300}g`, cat: 'Vegetables' },
          { name: 'Lettuce', qty: `${days * 2} heads`, cat: 'Vegetables' },
          { name: 'Kale', qty: `${days * 200}g`, cat: 'Vegetables' },
          { name: 'Cucumbers', qty: `${days * 3} pcs`, cat: 'Vegetables' },
          { name: 'Celery', qty: `${days} bunch`, cat: 'Vegetables' },
          { name: 'Asparagus', qty: `${days * 200}g`, cat: 'Vegetables' },
          { name: 'Bell peppers', qty: `${days * 3} pcs`, cat: 'Vegetables' },
          { name: 'Cherry tomatoes', qty: `${days * 250}g`, cat: 'Vegetables' },
          { name: 'Green beans', qty: `${days * 200}g`, cat: 'Vegetables' }
        ]
      },
      3: { // Faza 3: Healthy fats + balanced
        ro: [
          { name: 'Avocado', qty: `${days * 2} buc`, cat: 'Grăsimi' },
          { name: 'Nuci', qty: `${days * 100}g`, cat: 'Grăsimi' },
          { name: 'Migdale', qty: `${days * 100}g`, cat: 'Grăsimi' },
          { name: 'Caju', qty: `${days * 80}g`, cat: 'Grăsimi' },
          { name: 'Semințe chia', qty: `${days * 30}g`, cat: 'Grăsimi' },
          { name: 'Ulei măsline extravirgin', qty: `${days * 50}ml`, cat: 'Grăsimi' },
          { name: 'Ulei cocos', qty: `${days * 30}ml`, cat: 'Grăsimi' },
          { name: 'Somon', qty: `${days * 250}g`, cat: 'Proteine' },
          { name: 'Sardine', qty: `${days * 150}g`, cat: 'Proteine' },
          { name: 'Ouă întregi', qty: `${days * 8} ouă`, cat: 'Proteine' },
          { name: 'Pui (cu piele)', qty: `${days * 300}g`, cat: 'Proteine' },
          { name: 'Carne slabă (vită/porc)', qty: `${days * 250}g`, cat: 'Proteine' },
          { name: 'Broccoli/Spanac', qty: `${days * 300}g`, cat: 'Legume' },
          { name: 'Mere/Pere', qty: `${days * 3} buc`, cat: 'Fructe' }
        ],
        en: [
          { name: 'Avocado', qty: `${days * 2} pcs`, cat: 'Fats' },
          { name: 'Walnuts', qty: `${days * 100}g`, cat: 'Fats' },
          { name: 'Almonds', qty: `${days * 100}g`, cat: 'Fats' },
          { name: 'Cashews', qty: `${days * 80}g`, cat: 'Fats' },
          { name: 'Chia seeds', qty: `${days * 30}g`, cat: 'Fats' },
          { name: 'Extra virgin olive oil', qty: `${days * 50}ml`, cat: 'Fats' },
          { name: 'Coconut oil', qty: `${days * 30}ml`, cat: 'Fats' },
          { name: 'Salmon', qty: `${days * 250}g`, cat: 'Protein' },
          { name: 'Sardines', qty: `${days * 150}g`, cat: 'Protein' },
          { name: 'Whole eggs', qty: `${days * 8} eggs`, cat: 'Protein' },
          { name: 'Chicken (with skin)', qty: `${days * 300}g`, cat: 'Protein' },
          { name: 'Lean meat (beef/pork)', qty: `${days * 250}g`, cat: 'Protein' },
          { name: 'Broccoli/Spinach', qty: `${days * 300}g`, cat: 'Vegetables' },
          { name: 'Apples/Pears', qty: `${days * 3} pcs`, cat: 'Fruits' }
        ]
      }
    };

    // Determină fazele pentru următoarele X zile
    const phasesNeeded = new Set();
    for (let i = 0; i < days; i++) {
      const futureDay = currentDay + i;
      const phase = getCurrentPhase(futureDay);
      phasesNeeded.add(phase);
    }

    // Combină liste pentru toate fazele necesare, grupate pe categorii
    const allItemsByCategory = {};
    phasesNeeded.forEach(phase => {
      groceryItems[phase][language].forEach(item => {
        if (!allItemsByCategory[item.cat]) {
          allItemsByCategory[item.cat] = [];
        }
        // Check dacă item deja există (pentru duplicate merge)
        const existing = allItemsByCategory[item.cat].find(i => i.name === item.name);
        if (!existing) {
          allItemsByCategory[item.cat].push(item);
        }
      });
    });

    // Formatează în listă sortată pe categorii
    const formattedItems = [];
    Object.keys(allItemsByCategory).sort().forEach(category => {
      formattedItems.push(`\n**${category}:**`);
      allItemsByCategory[category].forEach(item => {
        formattedItems.push(`  • ${item.name} - ${item.qty}`);
      });
    });

    return {
      days,
      phases: Array.from(phasesNeeded).sort(),
      items: formattedItems,
      totalItems: Object.values(allItemsByCategory).flat().length
    };
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    const userQuestion = question.trim();
    setIsLoading(true);
    setResponse("");

    const currentDay = getCurrentDay();
    const currentPhase = getCurrentPhase(currentDay);
    const currentHour = new Date().getHours();
    const nextMeal = getNextMeal();

    // Get centralized phase info
    const currentPhaseInfo = getPhaseInfo(currentPhase, language);
    const allowedFoods = currentPhaseInfo.allowedFoods[language];
    
    const phaseInfo = {
      [currentPhase]: {
        allowed: allowedFoods.yes.join(', '),
        avoid: allowedFoods.no.join(', ')
      }
    };

    const completedMeals = checkIn ? (language === 'ro' ? [
      checkIn.breakfast_completed ? 'micul dejun' : null,
      checkIn.snack1_completed ? 'gustarea de dimineață' : null,
      checkIn.lunch_completed ? 'prânzul' : null,
      checkIn.snack2_completed ? 'gustarea de după-amiază' : null,
      checkIn.dinner_completed ? 'cina' : null,
    ] : [
      checkIn.breakfast_completed ? 'breakfast' : null,
      checkIn.snack1_completed ? 'morning snack' : null,
      checkIn.lunch_completed ? 'lunch' : null,
      checkIn.snack2_completed ? 'afternoon snack' : null,
      checkIn.dinner_completed ? 'dinner' : null,
    ]).filter(Boolean) : [];

    try {
      // Simulate AI response - analyze question
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Food database - forbidden items by phase
      const forbiddenFoods = {
        1: {
          // Phase 1: No fats, dairy, refined sugar, bananas
          keywords: ['cappuccino', 'capucino', 'cafea cu lapte', 'latte', 'bomboane', 'bomboana', 'ciocolata', 'ciocolată', 
                     'inghetata', 'înghețată', 'dulciuri', 'prăjituri', 'tort', 'biscuiți', 'biscuiti',
                     'nuci', 'migdale', 'alune', 'avocado', 'ulei', 'unt', 'smântână', 'smantana', 'brânză', 'branza',
                     'lapte', 'iaurt', 'cheese', 'milk', 'butter', 'cream', 'nuts', 'oil', 'chocolate', 'candy', 'ice cream',
                     'banane', 'banana', 'bananas', 'struguri', 'grapes', 'porumb', 'corn', 'cartof', 'cartof alb', 'potato', 'potatoes'],
          reason_ro: 'conține grăsimi, lactate, zahăr rafinat sau este interzis (banane, struguri, porumb, cartofi albi) - NU este permis în Faza 1. Concentrează-te pe carbohidrați sănătoși și alte fructe permise.',
          reason_en: 'contains fats, dairy, refined sugar or is forbidden (bananas, grapes, corn, white potatoes) - NOT allowed in Phase 1. Focus on healthy carbs and other allowed fruits.'
        },
        2: {
          // Phase 2: No carbs, fruits, fats
          keywords: ['pâine', 'paine', 'orez', 'paste', 'cartofi', 'mere', 'portocale', 'fructe', 'banane', 'banana', 'struguri', 'grapes',
                     'cappuccino', 'capucino', 'bomboane', 'bomboana', 'dulciuri', 'ciocolată', 'ciocolata',
                     'bread', 'rice', 'pasta', 'potatoes', 'apple', 'orange', 'fruits', 'grains', 'bananas'],
          reason_ro: 'conține carbohidrați sau fructe (inclusiv banane!) - interzise în Faza 2. Concentrează-te pe proteine slabe și legume verzi.',
          reason_en: 'contains carbs or fruits (including bananas!) - forbidden in Phase 2. Focus on lean proteins and green vegetables.'
        },
        3: {
          // Phase 3: No grains, high-carb foods
          keywords: ['pâine', 'paine', 'orez', 'paste', 'cartofi', 'cereale', 'bomboane', 'bomboana', 'dulciuri',
                     'bread', 'rice', 'pasta', 'potatoes', 'grains', 'cereals', 'candy'],
          reason_ro: 'conține cereale sau carbohidrați - interzise în Faza 3. Concentrează-te pe grăsimi sănătoase și proteine.',
          reason_en: 'contains grains or carbs - forbidden in Phase 3. Focus on healthy fats and proteins.'
        }
      };

      // Allowed foods by phase
      const allowedFoods = {
        1: {
          keywords: ['ovaz', 'oatmeal', 'orez brun', 'brown rice', 'quinoa', 'mei', 'millet', 'hrisca', 'buckwheat',
                     'linte', 'lentils', 'fasole', 'beans', 'mazare', 'mazarea', 'peas',
                     'pui', 'chicken', 'curcan', 'turkey', 
                     'pește', 'peste', 'fish', 'mere', 'apple', 'portocale', 'orange', 'fructe', 'fruit',
                     'legume', 'vegetables', 'broccoli', 'spanac', 'spinach'],
          reason_ro: 'este permis în Faza 1! Continuă să mănânci carbohidrați sănătoși și fructe.',
          reason_en: 'is allowed in Phase 1! Keep eating healthy carbs and fruits.'
        },
        2: {
          keywords: ['pui', 'chicken', 'curcan', 'turkey', 'pește', 'peste', 'fish', 'ton', 'tuna', 'somon', 'salmon',
                     'creveți', 'creveti', 'shrimp', 'garnele', 'prawn', 'fructe de mare', 'seafood',
                     'albus', 'albuș', 'egg white', 'ou', 'egg', 'oua', 'ouă',
                     'broccoli', 'spanac', 'spinach', 'salată', 'salata', 'lettuce', 'castraveți', 'castraveti', 'cucumber',
                     'varză', 'varza', 'kale', 'cabbage', 'ardei', 'pepper', 'roșii', 'rosii', 'tomato',
                     'legume verzi', 'green vegetables', 'legume', 'vegetables'],
          reason_ro: 'este permis în Faza 2! Continuă cu proteine slabe și legume verzi.',
          reason_en: 'is allowed in Phase 2! Keep eating lean proteins and green vegetables.'
        },
        3: {
          keywords: ['avocado', 'nuci', 'nuts', 'migdale', 'almonds', 'semințe', 'seminte', 'seeds', 
                     'ulei măsline', 'olive oil', 'ulei cocos', 'coconut oil', 'somon', 'salmon', 'ou întreg', 'whole egg',
                     'pui', 'chicken', 'legume', 'vegetables'],
          reason_ro: 'este permis în Faza 3! Continuă să consumi grăsimi sănătoase.',
          reason_en: 'is allowed in Phase 3! Keep eating healthy fats.'
        }
      };

      const questionLower = userQuestion.toLowerCase();
      
      // ========== GROCERY LIST REQUEST ==========
      if (/cumpăr|cumpar|shopping|grocery|listă|lista|market|magazin|supermarket/i.test(questionLower)) {
        const days = /mâine|maine|tomorrow/.test(questionLower) ? 1 :
                     /2 zile|două zile|two days/.test(questionLower) ? 2 :
                     /3 zile|trei zile|three days/.test(questionLower) ? 3 :
                     /4 zile|patru zile|four days/.test(questionLower) ? 4 :
                     /săptămână|saptamana|week|7 zile|șapte zile/.test(questionLower) ? 7 : 3;
        
        const grocery = generateGroceryList(days);
        const answer = language === 'ro'
          ? `🛒 **Listă Cumpărături pentru ${days} ${days === 1 ? 'zi' : 'zile'}**\n\n📍 Ziua ${currentDay}, ${days === 1 ? 'Fază' : 'Faze'}: ${grocery.phases.join(', ')}\n✅ **${grocery.totalItems} alimente** organizate pe categorii:\n${grocery.items.join('\n')}\n\n💡 Cantități ajustate pentru ${days} ${days === 1 ? 'zi' : 'zile'} (${days * 5} mese)!`
          : `🛒 **Grocery List for ${days} ${days === 1 ? 'day' : 'days'}**\n\n📍 Day ${currentDay}, ${days === 1 ? 'Phase' : 'Phases'}: ${grocery.phases.join(', ')}\n✅ **${grocery.totalItems} items** organized by category:\n${grocery.items.join('\n')}\n\n💡 Quantities adjusted for ${days} ${days === 1 ? 'day' : 'days'} (${days * 5} meals)!`;
        
        setChatHistory(prev => [...prev, { question: userQuestion, response: answer, timestamp: new Date() }]);
        setResponse(answer);
        setQuestion(""); // CLEAR INPUT!
        setIsLoading(false);
        return;
      }
      
      // Check if it's a yes/no question about food
      const isCanIEat = /pot|posibil|voie|allow|can i|may i|este ok|e ok|okay/i.test(userQuestion);
      
      if (isCanIEat) {
        // Check forbidden foods first
        const forbidden = forbiddenFoods[currentPhase];
        const foundForbidden = forbidden.keywords.find(keyword => questionLower.includes(keyword));
        
        if (foundForbidden) {
          const answer = language === 'ro'
            ? `❌ NU\n\n"${foundForbidden}" ${forbidden.reason_ro}\n\n📍 Ești în Ziua ${currentDay}, Faza ${currentPhase}`
            : `❌ NO\n\n"${foundForbidden}" ${forbidden.reason_en}\n\n📍 You're on Day ${currentDay}, Phase ${currentPhase}`;
          setChatHistory(prev => [...prev, { question: userQuestion, response: answer, timestamp: new Date() }]);
          setResponse(answer);
          setQuestion(""); // CLEAR INPUT!
          setIsLoading(false);
          return;
        }
        
        // Check allowed foods
        const allowed = allowedFoods[currentPhase];
        const foundAllowed = allowed.keywords.find(keyword => questionLower.includes(keyword));
        
        if (foundAllowed) {
          const answer = language === 'ro'
            ? `✅ DA\n\n"${foundAllowed}" ${allowed.reason_ro}\n\n📍 Ești în Ziua ${currentDay}, Faza ${currentPhase}`
            : `✅ YES\n\n"${foundAllowed}" ${allowed.reason_en}\n\n📍 You're on Day ${currentDay}, Phase ${currentPhase}`;
          setChatHistory(prev => [...prev, { question: userQuestion, response: answer, timestamp: new Date() }]);
          setResponse(answer);
          setQuestion(""); // CLEAR INPUT!
          setIsLoading(false);
          return;
        }
      }
      
      // Default: show context info
      const contextMessage = language === 'ro' 
        ? `📍 Ziua ${currentDay}, Faza ${currentPhase}\n\n🕐 Următoarea masă: ${nextMeal}\n✅ Mese completate: ${completedMeals.join(', ') || 'niciuna încă'}\n\n📋 Faza ${currentPhase}:\n✓ Permise: ${phaseInfo[currentPhase].allowed}\n✗ Evită: ${phaseInfo[currentPhase].avoid}\n\n💡 Întreabă-mă: "Pot să mănânc X astăzi?" SAU "Ce să cumpăr pentru mâine?"`
        : `📍 Day ${currentDay}, Phase ${currentPhase}\n\n🕐 Next meal: ${nextMeal}\n✅ Completed: ${completedMeals.join(', ') || 'none yet'}\n\n📋 Phase ${currentPhase}:\n✓ Allowed: ${phaseInfo[currentPhase].allowed}\n✗ Avoid: ${phaseInfo[currentPhase].avoid}\n\n💡 Ask me: "Can I eat X today?" OR "What should I buy for tomorrow?"`;
      
      setChatHistory(prev => [...prev, { question: userQuestion, response: contextMessage, timestamp: new Date() }]);
      setResponse(contextMessage);
      setQuestion(""); // CLEAR INPUT!
    } catch (error) {
      console.error('Error asking AI:', error);
      const errorMsg = language === 'ro' 
        ? "Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou." 
        : "Sorry, an error occurred. Please try again.";
      setResponse(errorMsg);
      setQuestion(""); // CLEAR INPUT chiar și la eroare!
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-50 group"
      >
        <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
      </button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span>
                {language === 'ro' ? 'Asistent Nutriție AI' : 'AI Nutrition Assistant'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {language === 'ro' ? 'Întreabă orice despre dieta ta Fast Metabolism' : 'Ask anything about your Fast Metabolism diet'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-2 text-sm">
                <Apple className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700 dark:text-gray-300">
                  {language === 'ro' ? (
                    <>
                      <div className="font-medium mb-1">Întreabă despre orice aliment!</div>
                      <div className="text-xs">
                        Ziua {getCurrentDay()} • Faza {getCurrentPhase(getCurrentDay())} • Ora {new Date().getHours()}:00
                      </div>
                      <div className="text-xs mt-1">
                        Următoarea masă: {getNextMeal()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium mb-1">Ask about any food!</div>
                      <div className="text-xs">
                        Day {getCurrentDay()} • Phase {getCurrentPhase(getCurrentDay())} • Time {new Date().getHours()}:00
                      </div>
                      <div className="text-xs mt-1">
                        Next meal: {getNextMeal()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* GROCERY LIST QUICK BUTTONS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[rgb(var(--ios-text-primary))]">
                  {language === 'ro' ? '🛒 Listă Cumpărături Rapidă:' : '🛒 Quick Grocery List:'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuestion(language === 'ro' ? 'Ce să cumpăr pentru mâine?' : 'What should I buy for tomorrow?');
                    setTimeout(() => handleAsk(), 100);
                  }}
                  className="text-xs"
                >
                  1 zi
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuestion(language === 'ro' ? 'Listă cumpărături 2 zile' : 'Grocery list 2 days');
                    setTimeout(() => handleAsk(), 100);
                  }}
                  className="text-xs"
                >
                  2 zile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuestion(language === 'ro' ? 'Listă cumpărături 4 zile' : 'Grocery list 4 days');
                    setTimeout(() => handleAsk(), 100);
                  }}
                  className="text-xs"
                >
                  4 zile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuestion(language === 'ro' ? 'Listă cumpărături săptămână' : 'Grocery list week');
                    setTimeout(() => handleAsk(), 100);
                  }}
                  className="text-xs"
                >
                  7 zile
                </Button>
              </div>
            </div>

            {/* CHAT INPUT */}
            <div className="space-y-2">
              <Textarea
                placeholder={language === 'ro' 
                  ? "Ex: Pot mânca avocado acum? Ce să cumpăr pentru mâine?" 
                  : "Ex: Can I eat avocado now? What to buy for tomorrow?"}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                rows={2}
                className="resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={handleAsk}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
                disabled={isLoading || !question.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ro' ? 'Se analizează...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {language === 'ro' ? 'Întreabă AI' : 'Ask AI'}
                  </>
                )}
              </Button>
            </div>

            {/* CHAT HISTORY (scroll) - iOS STYLE SUBTIL */}
            {chatHistory.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-3 py-4">
                <div className="text-xs font-semibold text-[rgb(var(--ios-text-secondary))] mb-2 px-2">
                  {language === 'ro' ? '💬 Istoric:' : '💬 History:'}
                </div>
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className="space-y-2 px-2">
                    {/* User Question - iOS Blue */}
                    <div className="flex justify-end">
                      <div className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                        <div className="text-sm">{chat.question}</div>
                        <div className="text-[10px] opacity-70 mt-1">
                          {format(chat.timestamp, 'HH:mm')}
                        </div>
                      </div>
                    </div>
                    {/* AI Response - iOS Gray Bubble */}
                    <div className="flex justify-start">
                      <div className="bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))] text-[rgb(var(--ios-text-primary))] px-4 py-2 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm">
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{chat.response}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-center text-gray-500">
              {language === 'ro' 
                ? 'Răspunsurile sunt generate de AI bazat pe regulile dietei tale actuale' 
                : 'Responses are AI-generated based on your current diet phase rules'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}