import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import api from "@/api/apiAdapter";
const localApi = api;
import { createPageUrl } from "@/utils";

export default function Landing() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Verifică dacă utilizatorul este autentificat și redirecționează
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const user = await localApi.auth.me();
        
        // Utilizator autentificat - redirecționează direct la aplicație
        if (user.role === 'admin') {
          navigate(createPageUrl("DailyPlan"));
          return;
        }
        
        const hasCompletedProfile = user.start_date && user.current_weight && user.target_weight;
        const hasBasicInfo = user.profile_picture || (user.name && user.name !== user.email.split('@')[0]);
        
        if (hasCompletedProfile || hasBasicInfo) {
          navigate(createPageUrl("DailyPlan"));
        } else {
          navigate(createPageUrl("Onboarding"));
        }
      } catch (error) {
        // Utilizator neautentificat - lasă-l să vadă landing page-ul
        console.log("User not authenticated - showing landing page");
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // Afișează loading în timpul verificării
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{language === 'ro' ? 'Se încarcă...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }
  
  const t = {
    hero: {
      title1: language === 'ro' ? 'Accelerează-ți' : 'Accelerate Your',
      title2: language === 'ro' ? 'Metabolismul' : 'Metabolism',
      subtitle: language === 'ro' 
        ? 'Transformă-ți metabolismul în **28 de zile**. Program științific, rezultate reale, meniu personalizat.'
        : 'Transform your metabolism in **28 days**. Scientific program, real results, personalized menu.',
      days28: language === 'ro' ? '28 de zile' : '28 days',
      btnDashboard: language === 'ro' ? 'Mergi la Dashboard' : 'Go to Dashboard',
      feature2: language === 'ro' ? 'Rețete noi zilnic' : 'New recipes daily',
      feature3: language === 'ro' ? 'Program personalizat' : 'Personalized program',
    },
    programNumbers: {
      title1: language === 'ro' ? 'Programul în' : 'Program in',
      title2: language === 'ro' ? 'Cifre' : 'Numbers',
      phase1: language === 'ro' ? 'Rețete Faza 1' : 'Phase 1 Recipes',
      phase2: language === 'ro' ? 'Rețete Faza 2' : 'Phase 2 Recipes',
      phase3: language === 'ro' ? 'Rețete Faza 3' : 'Phase 3 Recipes',
      dailyUpdate: language === 'ro' ? 'Actualizare zilnică' : 'Daily updates',
      phase1Desc: language === 'ro' ? 'Destresare & Energie' : 'Destress & Energy',
      phase2Desc: language === 'ro' ? 'Deblocare Grăsimi' : 'Unlock Fat',
      phase3Desc: language === 'ro' ? 'Accelerare Metabolică' : 'Metabolic Boost',
    },
    recipes: {
      title1: language === 'ro' ? 'Rețete' : 'Recipes',
      title2: language === 'ro' ? 'Recomandate' : 'Recommended',
      subtitle: language === 'ro' 
        ? 'Descoperă cele mai populare rețete din programul Fast Metabolism Diet'
        : 'Discover the most popular recipes from the Fast Metabolism Diet program',
      recipe1: language === 'ro' ? 'Clătite din hrișcă cu fructe de pădure' : 'Buckwheat pancakes with berries',
      recipe2: language === 'ro' ? 'Terci de quinoa fierbinte' : 'Hot quinoa porridge',
      recipe3: language === 'ro' ? 'Bol cu pui la grătar și orez brun' : 'Grilled chicken and brown rice bowl',
      vegetarian: language === 'ro' ? 'Vegetarian' : 'Vegetarian',
      phase: language === 'ro' ? 'Faza' : 'Phase',
    },
    everyone: {
      title1: language === 'ro' ? 'Pentru' : 'For',
      title2: language === 'ro' ? 'Toată Lumea' : 'Everyone',
      subtitle: language === 'ro' 
        ? 'Rețete adaptate pentru diferite preferințe alimentare'
        : 'Recipes adapted for different dietary preferences',
      vegetarianRecipes: language === 'ro' ? 'Rețete Vegetariene' : 'Vegetarian Recipes',
      veganRecipes: language === 'ro' ? 'Rețete Vegane' : 'Vegan Recipes',
      totalRecipes: language === 'ro' ? 'Total Rețete' : 'Total Recipes',
      noMeatFish: language === 'ro' ? 'Fără carne, pește sau pasăre' : 'No meat, fish or poultry',
      plantBased: language === 'ro' ? '100% pe bază de plante' : '100% plant-based',
      allPhases: language === 'ro' ? 'Pentru toate fazele programului' : 'For all program phases',
      updatesDaily: language === 'ro' ? 'Se actualizează zilnic' : 'Updated daily',
    },
    cta: {
      title: language === 'ro' ? 'Începe Transformarea Astăzi' : 'Start Your Transformation Today',
      subtitle: language === 'ro' 
        ? 'Primești 30 de zile gratuit să testezi programul complet. Rețete personalizate, actualizate zilnic!'
        : 'Get 30 days free to test the complete program. Personalized recipes, updated daily!',
      btn: language === 'ro' ? 'Mergi la Dashboard' : 'Go to Dashboard',
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      {/* Language Selector - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo TĂU - FOARTE MARE */}
          <div className="mb-0">
            <img 
              src="/logodark.png"
              alt="EatnFit" 
              className="w-56 h-56 md:w-72 md:h-72 mx-auto object-contain"
            />
          </div>

          {/* Sloganul TĂU - SUPER LIPIT */}
          <p className="text-xl md:text-2xl font-bold mb-12 text-white -mt-20">
            Eat Smart. Stay Fit
          </p>

          {/* Titlu cu gradient */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">{t.hero.title1} </span>
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            {t.hero.subtitle.split('**')[0]}<strong className="text-emerald-500">{t.hero.days28}</strong>{t.hero.subtitle.split('**')[2]}
          </p>

          {/* Buton verde cu iconițe */}
          <Button 
            asChild
            size="lg"
            className="h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-2xl mb-8"
          >
            <Link to="/app" className="flex items-center gap-2">
              <span>✨</span>
              {t.hero.btnDashboard}
              <span>→</span>
            </Link>
          </Button>

          {/* Features */}
          <div className="flex flex-col md:flex-row justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">📅</span>
              {language === 'ro' ? 'Program 28 zile' : '28-day program'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">👨‍🍳</span>
              {t.hero.feature2}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">⭐</span>
              {t.hero.feature3}
            </div>
          </div>
        </div>
      </section>

      {/* Programul în Cifre */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            <span className="text-white">{t.programNumbers.title1} </span>
            <span className="text-emerald-500">{t.programNumbers.title2}</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Faza 1 - GLASS EFFECT */}
            <Card className="bg-[#1A1F2E] border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="text-5xl mb-4">🔥</div>
                <div className="text-3xl font-bold text-orange-500 mb-2">{t.programNumbers.phase1}</div>
                <div className="text-white font-semibold mb-2">{t.programNumbers.dailyUpdate}</div>
                <div className="text-orange-500 text-sm">{t.programNumbers.phase1Desc}</div>
              </CardContent>
            </Card>

            {/* Faza 2 - GLASS EFFECT */}
            <Card className="bg-[#1A1F2E] border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="text-5xl mb-4">💚</div>
                <div className="text-3xl font-bold text-emerald-500 mb-2">{t.programNumbers.phase2}</div>
                <div className="text-white font-semibold mb-2">{t.programNumbers.dailyUpdate}</div>
                <div className="text-emerald-500 text-sm">{t.programNumbers.phase2Desc}</div>
              </CardContent>
            </Card>

            {/* Faza 3 - GLASS EFFECT */}
            <Card className="bg-[#1A1F2E] border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="text-5xl mb-4">✨</div>
                <div className="text-3xl font-bold text-purple-500 mb-2">{t.programNumbers.phase3}</div>
                <div className="text-white font-semibold mb-2">{t.programNumbers.dailyUpdate}</div>
                <div className="text-purple-500 text-sm">{t.programNumbers.phase3Desc}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rețete Recomandate */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="text-white">{t.recipes.title1} </span>
            <span className="text-emerald-500">{t.recipes.title2}</span>
          </h2>
          <p className="text-center text-gray-400 mb-12">
            {t.recipes.subtitle}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 - Pancakes cu GLASS EFFECT */}
            <Card className="bg-[#1A1F2E] border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/15 rounded-full blur-2xl -mr-20 -mt-20"></div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80"
                  alt="Pancakes cu fructe"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {t.recipes.phase} 1
                  </span>
                </div>
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-white font-bold mb-3">{t.recipes.recipe1}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    🔥 280 cal
                  </span>
                  <span className="flex items-center gap-1">
                    💪 10g protein
                  </span>
                </div>
                <span className="inline-block bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-3 py-1 rounded-full">
                  🌱 {t.recipes.vegetarian}
                </span>
              </CardContent>
            </Card>

            {/* Card 2 - Terci cu GLASS EFFECT */}
            <Card className="bg-[#1A1F2E] border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl -mr-20 -mt-20"></div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&q=80"
                  alt="Terci cu quinoa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {t.recipes.phase} 1
                  </span>
                </div>
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-white font-bold mb-3">{t.recipes.recipe2}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    🔥 320 cal
                  </span>
                  <span className="flex items-center gap-1">
                    💪 12g protein
                  </span>
                </div>
                <span className="inline-block bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-3 py-1 rounded-full">
                  🌱 {t.recipes.vegetarian}
                </span>
              </CardContent>
            </Card>

            {/* Card 3 - Pui cu GLASS EFFECT */}
            <Card className="bg-[#1A1F2E] border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/15 rounded-full blur-2xl -mr-20 -mt-20"></div>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80"
                  alt="Pui la grătar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {t.recipes.phase} 1
                  </span>
                </div>
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-white font-bold mb-3">{t.recipes.recipe3}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    🔥 395 cal
                  </span>
                  <span className="flex items-center gap-1">
                    💪 35g protein
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PREȚURI - ABONAMENTE */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="text-white">{language === 'ro' ? 'Prețuri' : 'Pricing'} </span>
            <span className="text-emerald-500">{language === 'ro' ? 'Simple' : 'Simple'}</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            {language === 'ro' ? 'Începe gratis, upgrade când ești gata' : 'Start free, upgrade when ready'}
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* FREE - GLASS EFFECT */}
            <Card className="bg-[#1A1F2E] border-gray-700 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gray-600/10 rounded-full blur-2xl -mr-24 -mt-24"></div>
              <CardContent className="p-10 relative z-10">
                <div className="inline-block bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-6">
                  FREE
                </div>
                <div className="mb-8">
                  <div className="text-6xl font-bold text-white mb-2">0 RON</div>
                  <p className="text-gray-400 text-lg">{language === 'ro' ? 'Pentru totdeauna' : 'Forever'}</p>
                </div>
                <ul className="space-y-4 mb-8 text-lg">
                  <li className="text-white">✓ {language === 'ro' ? 'Plan de bază' : 'Basic plan'}</li>
                  <li className="text-white">✓ {language === 'ro' ? '1 rețetă personalizată' : '1 custom recipe'}</li>
                  <li className="text-gray-600">✗ {language === 'ro' ? 'Features limitate' : 'Limited features'}</li>
                </ul>
                <Button asChild variant="outline" size="lg" className="w-full h-14 text-lg border-gray-700 hover:bg-gray-800 text-white rounded-xl font-bold">
                  <Link to="/app">{language === 'ro' ? 'Începe Gratuit' : 'Start Free'}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* PREMIUM - GLASS EFFECT */}
            <Card className="bg-gradient-to-br from-emerald-600 to-cyan-600 border-emerald-500 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-24 -mt-24"></div>
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-white text-emerald-600 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  POPULAR
                </span>
              </div>
              <CardContent className="p-10 relative z-10">
                <div className="inline-block bg-white text-emerald-600 text-xs font-bold px-3 py-1 rounded-full mb-6">
                  PREMIUM
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-bold text-white">200</span>
                    <span className="text-3xl text-white/90">RON</span>
                  </div>
                  <p className="text-white/90 text-base mb-1">{language === 'ro' ? 'Prima lună' : 'First month'}</p>
                  <p className="text-sm text-white/70">{language === 'ro' ? 'Apoi 20 RON/lună' : 'Then 20 RON/month'}</p>
                </div>
                <ul className="space-y-4 mb-8 text-lg font-semibold text-white">
                  <li>✓ {language === 'ro' ? 'Rețete nelimitate' : 'Unlimited recipes'}</li>
                  <li>✓ {language === 'ro' ? 'Food Database (200+ ingrediente)' : 'Food Database (200+ ingredients)'}</li>
                  <li>✓ {language === 'ro' ? 'AI Assistant inteligent' : 'Smart AI Assistant'}</li>
                  <li>✓ {language === 'ro' ? 'Prieteni & Sharing' : 'Friends & Sharing'}</li>
                  <li>✓ {language === 'ro' ? 'Statistici complete' : 'Complete stats'}</li>
                </ul>
                <Button asChild size="lg" className="w-full h-16 text-xl bg-white text-emerald-600 hover:bg-gray-100 font-bold rounded-xl shadow-2xl">
                  <Link to="/upgrade">{language === 'ro' ? 'Activează Premium' : 'Activate Premium'}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#1A1F2E] border-gray-800 rounded-3xl relative overflow-hidden">
            <CardContent className="p-12 text-center relative z-10">
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t.cta.title}
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                {language === 'ro' 
                  ? 'Înregistrează-te acum și începe transformarea! Rețete personalizate, actualizate zilnic!'
                  : 'Sign up now and start your transformation! Personalized recipes, updated daily!'}
              </p>
              <Button 
                asChild
                size="lg"
                className="h-14 px-8 text-lg bg-white text-emerald-600 hover:bg-gray-100 font-bold rounded-xl"
              >
                <Link to="/app" className="flex items-center gap-2">
                  <span className="text-emerald-500">✨</span>
                  {t.cta.btn}
                  <span className="text-emerald-600">→</span>
                </Link>
              </Button>
            </CardContent>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full -ml-32 -mb-32"></div>
          </Card>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          asChild
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-2xl"
        >
          <Link to="/app">
            <span className="text-2xl">✨</span>
          </Link>
        </Button>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-[#0A0E1A] border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500 mb-4">© 2025 EatnFit. {language === 'ro' ? 'Toate drepturile rezervate.' : 'All rights reserved.'}</p>
          <div className="flex justify-center gap-8">
            <Link to="/support" className="text-gray-400 hover:text-emerald-500">{language === 'ro' ? 'Contact' : 'Contact'}</Link>
            <Link to="/app" className="text-gray-400 hover:text-emerald-500">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
