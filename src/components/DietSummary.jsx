import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Flame, Droplet, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DietSummary({ language = 'ro' }) {
  const content = {
    ro: {
      title: "Bine ai venit în Dieta Fast Metabolism!",
      subtitle: "Programul este împărțit pe 3 etape care se repetă săptămânal:",
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
      title: "Welcome to the Fast Metabolism Diet!",
      subtitle: "The program is divided into 3 phases that repeat weekly:",
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
          note: "❌ NO carbs and NO oils!"
        },
        {
          title: "Phase 3 (3 days)",
          color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
          meals: [
            "All meals: Everything allowed + healthy fats"
          ],
          note: "✅ You can add: avocado, hummus, nuts, oils, nut butter, coconut"
        }
      ],
      allowedCarbs: {
        title: "Allowed Carbs",
        items: ["Wild/brown rice", "Lentil/chickpea pasta", "Rye bread only", "Lentils", "Beans", "Buckwheat", "Quinoa", "Sweet potato"]
      },
      forbidden: {
        title: "FORBIDDEN foods for entire program",
        items: ["Wheat", "Dairy", "Soy", "Corn", "Potato", "Bananas", "Grapes", "Sugars", "Juices", "Alcohol", "Coffee"]
      }
    }
  };

  const t = content[language] || content.ro;

  return (
    <Card className="ios-card border-none shadow-xl mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
          <Info className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          {t.title}
        </CardTitle>
        <p className="text-[rgb(var(--ios-text-secondary))] mt-2">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* FAZE */}
        {t.phases.map((phase, index) => (
          <div key={index} className="space-y-2">
            <Badge className={`${phase.color} text-base px-4 py-2`}>
              {phase.title}
            </Badge>
            <ul className="space-y-1 ml-4">
              {phase.meals.map((meal, idx) => (
                <li key={idx} className="text-[rgb(var(--ios-text-primary))] text-sm">
                  • {meal}
                </li>
              ))}
            </ul>
            <p className="text-sm font-medium text-[rgb(var(--ios-text-secondary))] ml-4 mt-2">
              {phase.note}
            </p>
          </div>
        ))}

        {/* CARBOHIDRAȚI PERMISI */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-emerald-800 dark:text-emerald-200">{t.allowedCarbs.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {t.allowedCarbs.items.map((item, idx) => (
              <Badge key={idx} variant="outline" className="bg-white dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* PRODUSE INTERZISE */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-bold text-red-800 dark:text-red-200">{t.forbidden.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {t.forbidden.items.map((item, idx) => (
              <Badge key={idx} variant="outline" className="bg-white dark:bg-red-950 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300">
                ❌ {item}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong className="flex items-center gap-2 mb-2">
              <Droplet className="w-4 h-4" />
              {language === 'ro' ? 'Important:' : 'Important:'}
            </strong>
            {language === 'ro' 
              ? 'Bea 2-3 litri de apă pe zi și respectă strict regulile fiecărei etape pentru rezultate optime!' 
              : 'Drink 2-3 liters of water per day and strictly follow each phase rules for optimal results!'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

