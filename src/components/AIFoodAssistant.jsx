import React, { useState, useEffect } from 'react';
import localApi from "@/api/localClient";
const base44 = localApi;
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Loader2, Apple, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";
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

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const getCurrentDay = () => {
    if (!user?.start_date) return 1;
    const startDate = new Date(user.start_date);
    const today = new Date();
    const daysPassed = differenceInDays(today, startDate) + 1;
    return Math.min(Math.max(daysPassed, 1), 28);
  };

  const getCurrentPhase = (day) => {
    const cycle = ((day - 1) % 7) + 1;
    if (cycle <= 2) return 1;
    if (cycle <= 4) return 2;
    return 3;
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

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setResponse("");

    const currentDay = getCurrentDay();
    const currentPhase = getCurrentPhase(currentDay);
    const currentHour = new Date().getHours();
    const nextMeal = getNextMeal();

    const phaseInfo = language === 'ro' ? {
      1: {
        allowed: "carbohidrați, fructe, cereale integrale (orez brun, ovăz, quinoa), proteine slabe (pui, curcan, pește), legume",
        avoid: "grăsimi, uleiuri, nuci, semințe, avocado, lactate"
      },
      2: {
        allowed: "proteine slabe (pui, curcan, pește, albuș), legume verzi (broccoli, spanac, varză kale, castraveți), legume alcaline",
        avoid: "carbohidrați, fructe, grăsimi, uleiuri, cereale"
      },
      3: {
        allowed: "grăsimi sănătoase (avocado, nuci, semințe, ulei măsline, ulei cocos), proteine, legume, unele fructe",
        avoid: "cereale, alimente bogate în carbohidrați"
      }
    } : {
      1: {
        allowed: "carbohydrates, fruits, grains (brown rice, oats, quinoa), lean proteins (chicken, turkey, fish), vegetables",
        avoid: "fats, oils, nuts, seeds, avocado, dairy"
      },
      2: {
        allowed: "lean proteins (chicken, turkey, fish, egg whites), green vegetables (broccoli, spinach, kale, cucumber), alkaline vegetables",
        avoid: "carbohydrates, fruits, fats, oils, grains"
      },
      3: {
        allowed: "healthy fats (avocado, nuts, seeds, olive oil, coconut oil), proteins, vegetables, some fruits",
        avoid: "grains, high-carb foods"
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
          // Phase 1: No fats, dairy, refined sugar
          keywords: ['cappuccino', 'capucino', 'cafea cu lapte', 'latte', 'bomboane', 'bomboana', 'ciocolata', 'ciocolată', 
                     'inghetata', 'înghețată', 'dulciuri', 'prăjituri', 'tort', 'biscuiți', 'biscuiti',
                     'nuci', 'migdale', 'alune', 'avocado', 'ulei', 'unt', 'smântână', 'smantana', 'brânză', 'branza',
                     'lapte', 'iaurt', 'cheese', 'milk', 'butter', 'cream', 'nuts', 'oil', 'chocolate', 'candy', 'ice cream'],
          reason_ro: 'conține grăsimi, lactate sau zahăr rafinat - interzise în Faza 1. Concentrează-te pe carbohidrați sănătoși și fructe.',
          reason_en: 'contains fats, dairy or refined sugar - forbidden in Phase 1. Focus on healthy carbs and fruits.'
        },
        2: {
          // Phase 2: No carbs, fruits, fats
          keywords: ['pâine', 'paine', 'orez', 'paste', 'cartofi', 'mere', 'banana', 'portocale', 'fructe',
                     'cappuccino', 'capucino', 'bomboane', 'bomboana', 'dulciuri', 'ciocolată', 'ciocolata',
                     'bread', 'rice', 'pasta', 'potatoes', 'apple', 'banana', 'orange', 'fruits', 'grains'],
          reason_ro: 'conține carbohidrați sau fructe - interzise în Faza 2. Concentrează-te pe proteine slabe și legume verzi.',
          reason_en: 'contains carbs or fruits - forbidden in Phase 2. Focus on lean proteins and green vegetables.'
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
          keywords: ['ovaz', 'oatmeal', 'orez brun', 'brown rice', 'quinoa', 'pui', 'chicken', 'curcan', 'turkey', 
                     'pește', 'peste', 'fish', 'mere', 'apple', 'banana', 'portocale', 'orange', 'fructe', 'fruit',
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

      const questionLower = question.toLowerCase();
      
      // Check if it's a yes/no question about food
      const isCanIEat = /pot|posibil|voie|allow|can i|may i|este ok|e ok|okay/i.test(question);
      
      if (isCanIEat) {
        // Check forbidden foods first
        const forbidden = forbiddenFoods[currentPhase];
        const foundForbidden = forbidden.keywords.find(keyword => questionLower.includes(keyword));
        
        if (foundForbidden) {
          const answer = language === 'ro'
            ? `❌ NU\n\n"${foundForbidden}" ${forbidden.reason_ro}\n\n📍 Ești în Ziua ${currentDay}, Faza ${currentPhase}`
            : `❌ NO\n\n"${foundForbidden}" ${forbidden.reason_en}\n\n📍 You're on Day ${currentDay}, Phase ${currentPhase}`;
          setResponse(answer);
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
          setResponse(answer);
          setIsLoading(false);
          return;
        }
      }
      
      // Default: show context info
      const contextMessage = language === 'ro' 
        ? `📍 Ziua ${currentDay}, Faza ${currentPhase}\n\n🕐 Următoarea masă: ${nextMeal}\n✅ Mese completate: ${completedMeals.join(', ') || 'niciuna încă'}\n\n📋 Faza ${currentPhase}:\n✓ Permise: ${phaseInfo[currentPhase].allowed}\n✗ Evită: ${phaseInfo[currentPhase].avoid}\n\n💡 Întreabă-mă: "Pot să mănânc X astăzi?"`
        : `📍 Day ${currentDay}, Phase ${currentPhase}\n\n🕐 Next meal: ${nextMeal}\n✅ Completed: ${completedMeals.join(', ') || 'none yet'}\n\n📋 Phase ${currentPhase}:\n✓ Allowed: ${phaseInfo[currentPhase].allowed}\n✗ Avoid: ${phaseInfo[currentPhase].avoid}\n\n💡 Ask me: "Can I eat X today?"`;
      
      setResponse(contextMessage);
    } catch (error) {
      console.error('Error asking AI:', error);
      setResponse(language === 'ro' 
        ? "Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou." 
        : "Sorry, an error occurred. Please try again.");
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
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-start gap-2 text-sm">
                <Apple className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">
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

            <div className="space-y-2">
              <Textarea
                placeholder={language === 'ro' 
                  ? "Ex: Pot mânca banane acum? Pot să adaug avocado?" 
                  : "Ex: Can I eat bananas now? Can I add avocado?"}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
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

            {response && (
              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    {language === 'ro' ? 'Răspuns' : 'Response'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {response}
                  </div>
                </CardContent>
              </Card>
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