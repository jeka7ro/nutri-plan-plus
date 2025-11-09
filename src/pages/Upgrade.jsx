import React, { useState } from "react";
import localApi from "@/api/localClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  X,
  Zap,
  ChefHat,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Database,
  Sparkles
} from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function Upgrade() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  // Dacă e deja Premium, redirect
  if (user && user.subscription_plan === 'premium') {
    return (
      <div className="p-4 md:p-8 min-h-screen flex items-center justify-center">
        <Card className="max-w-2xl w-full bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-500">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] mb-4">
              ⭐ {language === 'ro' ? 'Ești deja Premium!' : 'You are already Premium!'}
            </h2>
            <p className="text-[rgb(var(--ios-text-secondary))] mb-6">
              {language === 'ro' 
                ? 'Profilul tău are acces complet la toate funcțiile EatnFit.' 
                : 'Your profile has full access to all EatnFit features.'}
            </p>
            <Button onClick={() => navigate('/dashboard')} className="bg-emerald-600">
              {language === 'ro' ? 'Înapoi la Dashboard' : 'Back to Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = [
    {
      icon: ChefHat,
      title: language === 'ro' ? 'Rețete Nelimitate' : 'Unlimited Recipes',
      free: '1 rețetă',
      premium: 'Nelimitat',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Users,
      title: language === 'ro' ? 'Prieteni' : 'Friends',
      free: '❌ Blocat',
      premium: 'Nelimitați',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Database,
      title: language === 'ro' ? 'Food Database' : 'Food Database',
      free: '❌ Blocat',
      premium: '200+ ingrediente',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Sparkles,
      title: language === 'ro' ? 'AI Analyzer' : 'AI Analyzer',
      free: '❌ Blocat',
      premium: 'Scor & Feedback',
      color: 'text-pink-600 dark:text-pink-400'
    },
    {
      icon: Calendar,
      title: language === 'ro' ? 'Calendar' : 'Calendar',
      free: 'Doar ziua curentă',
      premium: '28 zile complet',
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      icon: Bell,
      title: language === 'ro' ? 'Notificări' : 'Notifications',
      free: '❌ Blocat',
      premium: 'Notificări instant',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: BarChart3,
      title: language === 'ro' ? 'Statistici' : 'Statistics',
      free: '7 zile',
      premium: 'Istoric complet',
      color: 'text-cyan-600 dark:text-cyan-400'
    },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--ios-text-primary))]">
              {language === 'ro' ? 'Upgrade la Premium' : 'Upgrade to Premium'}
            </h1>
          </div>
          <p className="text-xl text-[rgb(var(--ios-text-secondary))] max-w-2xl mx-auto">
            {language === 'ro' 
              ? 'Deblochează toate funcțiile și accelerează-ți metabolismul!' 
              : 'Unlock all features and boost your metabolism!'}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* FREE Card */}
          <Card className="border-2 border-gray-300 dark:border-gray-700">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-2">
                <Badge className="bg-gray-500 text-white text-sm px-3 py-1">FREE</Badge>
              </div>
              <CardTitle className="text-2xl">{language === 'ro' ? 'Gratis' : 'Free'}</CardTitle>
              <p className="text-sm text-[rgb(var(--ios-text-tertiary))]">
                {language === 'ro' ? 'Plan de bază' : 'Basic plan'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <feature.icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="text-sm text-[rgb(var(--ios-text-secondary))]">{feature.title}</span>
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--ios-text-tertiary))]">
                      {feature.free}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PREMIUM Card */}
          <Card className="border-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="mx-auto mb-2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm px-3 py-1 font-bold">
                  <Crown className="w-3 h-3 mr-1" />
                  PREMIUM
                </Badge>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-2 mb-1">
                  <span className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">200</span>
                  <span className="text-xl text-[rgb(var(--ios-text-secondary))]">RON</span>
                </div>
                <p className="text-sm text-[rgb(var(--ios-text-tertiary))] mb-1">
                  {language === 'ro' ? 'Prima lună' : 'First month'}
                </p>
                <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                  {language === 'ro' ? 'Apoi 20 RON/lună' : 'Then 20 RON/month'}
                </p>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3 mb-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <feature.icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="text-sm font-medium text-[rgb(var(--ios-text-primary))]">{feature.title}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {feature.premium}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full h-14 text-lg bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold shadow-2xl"
                onClick={() => {
                  // TODO: Integrate Netopia Payments
                  alert(language === 'ro' 
                    ? 'Integrare plată în curând! Contactează admin pentru activare Premium.' 
                    : 'Payment integration coming soon! Contact admin to activate Premium.');
                }}
              >
                <Zap className="w-5 h-5 mr-2" />
                {language === 'ro' ? '🚀 Activează Premium Acum!' : '🚀 Activate Premium Now!'}
              </Button>

              <p className="text-xs text-center text-[rgb(var(--ios-text-tertiary))] mt-4">
                {language === 'ro' 
                  ? '⚡ Activare instant • Anulare oricând • Suport prioritar' 
                  : '⚡ Instant activation • Cancel anytime • Priority support'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20 border-emerald-300 dark:border-emerald-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[rgb(var(--ios-text-primary))] mb-2">
                  {language === 'ro' ? 'De ce Premium?' : 'Why Premium?'}
                </h3>
                <p className="text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' 
                    ? 'Premium îți oferă acces complet la toate instrumentele necesare pentru a-ți accelera metabolismul: rețete personalizate nelimitate, conectare cu prieteni, food database cu 200+ ingrediente, AI analyzer pentru feedback instant, și multe altele!' 
                    : 'Premium gives you full access to all the tools you need to boost your metabolism: unlimited custom recipes, friend connections, food database with 200+ ingredients, AI analyzer for instant feedback, and much more!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

