import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  CheckCircle, 
  Zap,
  ChefHat,
  Users,
  Calendar,
  BarChart3,
  Sparkles,
  Apple,
  TrendingDown,
  BookOpen
} from "lucide-react";
import { useTheme } from "../components/ThemeContext";

export default function Landing() {
  const { theme } = useTheme();

  const features = [
    { icon: Calendar, title: 'Plan 28 Zile', desc: 'Program complet pas cu pas' },
    { icon: ChefHat, title: '100+ Rețete', desc: 'Verificate din carte' },
    { icon: Sparkles, title: 'AI Assistant', desc: 'Asistent inteligent 24/7' },
    { icon: BarChart3, title: 'Tracking', desc: 'Urmărește progresul' },
  ];

  const benefits = [
    'Slăbești până la 10kg în 28 zile',
    'Accelerezi metabolismul natural',
    'Mănânci 5 ori pe zi (nu te înfometezi!)',
    'Rețete delicioase și variate',
    'Fără numărare calorii obsesivă',
    'Program bazat pe știință (Haylie Pomroy)',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            {/* Logo */}
            <img 
              src={theme === 'dark' ? '/logodark.png' : '/logolight.png'}
              alt="EatnFit" 
              className="w-40 h-40 mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-6">
              Eat Smart. Stay Fit
            </h2>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              🔥 Accelerează-ți<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                Metabolismul
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Plan personalizat bazat pe <strong>Fast Metabolism Diet</strong> by Haylie Pomroy.
              Slăbește sănătos în 28 zile!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                asChild
                className="h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-2xl"
              >
                <Link to="/app">
                  🚀 Înregistrare Gratuită
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              >
                <Link to="/app">
                  🔑 Login
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Bazat pe carte bestseller</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>100% natural</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Fără foame</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            ✨ Ce Oferă EatnFit
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-none shadow-xl hover:shadow-2xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            🌟 De Ce Funcționează
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            💰 Prețuri Simple
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Începe gratis, upgrade când ești gata
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* FREE */}
            <Card className="border-2 border-gray-300">
              <CardContent className="p-8">
                <Badge className="bg-gray-500 text-white mb-4">FREE</Badge>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">0 RON</div>
                  <p className="text-gray-600 dark:text-gray-400">Pentru totdeauna</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Plan zilnic de bază
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    1 rețetă personalizată
                  </li>
                  <li className="flex items-center gap-2 text-gray-500">
                    <CheckCircle className="w-5 h-5 text-gray-300" />
                    Statistici limitate
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full h-12">
                  <Link to="/app">Începe Gratuit</Link>
                </Button>
              </CardContent>
            </Card>

            {/* PREMIUM */}
            <Card className="border-4 border-yellow-500 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                  <Crown className="w-3 h-3 mr-1" />
                  POPULAR
                </Badge>
              </div>
              <CardContent className="p-8">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white mb-4">
                  <Crown className="w-3 h-3 mr-1" />
                  PREMIUM
                </Badge>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">200</span>
                    <span className="text-xl text-gray-600 dark:text-gray-400">RON</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Prima lună</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Apoi 20 RON/lună</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Rețete nelimitate
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Food Database (200+ ingrediente)
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    AI Assistant mega smart
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Prieteni & Sharing
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    Statistici & Grafice complete
                  </li>
                </ul>
                <Button 
                  asChild
                  className="w-full h-14 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
                >
                  <Link to="/upgrade">
                    <Zap className="w-5 h-5 mr-2" />
                    🚀 Activează Premium
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Gata să-ți transformi metabolismul?
          </h2>
          <p className="text-xl mb-8 text-emerald-50">
            Alătură-te miilor de utilizatori care și-au accelerat metabolismul!
          </p>
          <Button 
            asChild
            className="h-14 px-12 text-lg bg-white text-emerald-600 hover:bg-emerald-50 shadow-2xl"
          >
            <Link to="/app">
              🚀 Începe Acum - Gratuit
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center">
        <p className="text-sm">
          © 2025 EatnFit. Bazat pe <strong className="text-white">Fast Metabolism Diet</strong> by Haylie Pomroy.
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <Link to="/support" className="hover:text-white transition-colors">Contact</Link>
          <Link to="/app" className="hover:text-white transition-colors">Login</Link>
        </div>
      </footer>
    </div>
  );
}

