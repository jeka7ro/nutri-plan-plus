import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, XCircle, Info, BookOpen } from "lucide-react";
import { useLanguage } from '../components/LanguageContext';

export default function Recommendations() {
  const { language } = useLanguage();

  const summary = {
    ro: {
      title: "Ghid Dieta Fast Metabolism",
      intro: "Bun venit în program! Iată un ghid complet al regulilor dietei:",
      phases: [
        {
          title: "Prima Etapă (2 zile)",
          color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
          meals: [
            "Dimineață: Terci de ovăz pe apă cu fruct",
            "Gustare: Fruct",
            "Prânz: Carne + Carbohidrați + Legume + Fruct",
            "Gustare: Fruct",
            "Cină: Carne + Carbohidrați + Legume"
          ],
          note: "⚠️ Gătește totul pe apă, FĂRĂ ulei!"
        },
        {
          title: "A Doua Etapă (2 zile)",
          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
          meals: [
            "Toate mesele: Carne + Legume"
          ],
          note: "❌ FĂRĂ carbohidrați și uleiuri!"
        },
        {
          title: "A Treia Etapă (3 zile)",
          color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
          meals: [
            "Toate mesele: Carne + Carbohidrați + Legume + Grăsimi sănătoase și fructe"
          ],
          note: "✅ Poți adăuga: avocado, humus, nuci, uleiuri, unt de arahide, cocos"
        }
      ],
      allowedCarbs: {
        title: "Carbohidrați Permisi",
        items: ["Orez sălbatic/brun", "Paste din linte/năut", "Pâine doar din secară", "Linte", "Fasole", "Hrișcă", "Quinoa", "Cartof dulce", "Mazărea", "Mei"]
      },
      forbidden: {
        title: "Produse INTERZISE pe toată perioada",
        items: ["Grâu", "Lactate", "Soia", "Porumb", "Cartof (normal)", "Banane", "Struguri", "Zaharuri", "Sucuri", "Alcool", "Cafea"]
      }
    },
    en: {
      title: "Fast Metabolism Diet Guide",
      intro: "Welcome to the program! Here's a complete guide to the diet rules:",
      phases: [
        {
          title: "Phase 1 (2 days)",
          color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
          meals: [
            "Morning: Oatmeal with fruit",
            "Snack: Fruit",
            "Lunch: Meat + Carbs + Vegetables + Fruit",
            "Snack: Fruit",
            "Dinner: Meat + Carbs + Vegetables"
          ],
          note: "⚠️ Cook everything with water, NO oil!"
        },
        {
          title: "Phase 2 (2 days)",
          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
          meals: [
            "All meals: Meat + Vegetables"
          ],
          note: "❌ NO carbs or oils!"
        },
        {
          title: "Phase 3 (3 days)",
          color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
          meals: [
            "All meals: Meat + Carbs + Vegetables + Healthy fats and fruits"
          ],
          note: "✅ You can add: avocado, hummus, nuts, oils, peanut butter, coconut"
        }
      ],
      allowedCarbs: {
        title: "Allowed Carbohydrates",
        items: ["Wild/brown rice", "Lentil/chickpea pasta", "Rye bread only", "Lentils", "Beans", "Buckwheat", "Quinoa", "Sweet potato", "Peas", "Millet"]
      },
      forbidden: {
        title: "FORBIDDEN products for the entire period",
        items: ["Wheat", "Dairy", "Soy", "Corn", "Potato (regular)", "Bananas", "Grapes", "Sugars", "Juices", "Alcohol", "Coffee"]
      }
    }
  };

  const currentLang = summary[language];

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {currentLang.title}
          </h1>
          <p className="text-[rgb(var(--ios-text-secondary))] mt-2 text-lg">
            {currentLang.intro}
          </p>
        </div>

        {/* Phases */}
        <div className="space-y-4">
          {currentLang.phases.map((phase, index) => (
            <Card key={index} className="ios-card border-none ios-shadow-lg">
              <CardHeader className={`${phase.color} rounded-t-[20px]`}>
                <CardTitle className="text-lg">{phase.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {phase.meals.map((meal, mealIndex) => (
                    <li key={mealIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[rgb(var(--ios-text-secondary))]">{meal}</span>
                    </li>
                  ))}
                </ul>
                {phase.note && (
                  <p className="mt-4 p-3 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))] rounded-lg text-sm italic">
                    {phase.note}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Allowed Carbs */}
        <Card className="ios-card border-none ios-shadow-lg border-emerald-200 dark:border-emerald-700">
          <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20 rounded-t-[20px]">
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Check className="w-5 h-5" />
              {currentLang.allowedCarbs.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {currentLang.allowedCarbs.items.map((item, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forbidden Products */}
        <Card className="ios-card border-none ios-shadow-lg border-red-200 dark:border-red-700">
          <CardHeader className="bg-red-50 dark:bg-red-900/20 rounded-t-[20px]">
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <XCircle className="w-5 h-5" />
              {currentLang.forbidden.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {currentLang.forbidden.items.map((item, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm font-medium"
                >
                  ❌ {item}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="ios-card border-none ios-shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div className="space-y-2 text-sm text-[rgb(var(--ios-text-secondary))]">
                <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
                  {language === 'ro' ? '📌 Notă Importantă:' : '📌 Important Note:'}
                </p>
                <p>
                  {language === 'ro' 
                    ? 'Acest program se repetă săptămânal: 2 zile Faza 1 → 2 zile Faza 2 → 3 zile Faza 3, și din nou!'
                    : 'This program repeats weekly: 2 days Phase 1 → 2 days Phase 2 → 3 days Phase 3, and repeat!'}
                </p>
                <p>
                  {language === 'ro'
                    ? '💧 Bea 8 pahare de apă zilnic, indiferent de fază!'
                    : '💧 Drink 8 glasses of water daily, regardless of phase!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

