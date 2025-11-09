import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Link } from "react-router-dom";

export default function Paywall({ title, description, feature }) {
  const { language } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-2xl w-full border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 shadow-2xl">
        <CardContent className="p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Crown className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-[rgb(var(--ios-text-primary))] mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            {title || (language === 'ro' ? 'Premium Necesar' : 'Premium Required')}
          </h2>

          {/* Description */}
          <p className="text-lg text-[rgb(var(--ios-text-secondary))] mb-8">
            {description || (language === 'ro' 
              ? 'Această funcție este disponibilă doar pentru utilizatorii Premium.' 
              : 'This feature is available only for Premium users.')}
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
                  {language === 'ro' ? 'Rețete Nelimitate' : 'Unlimited Recipes'}
                </p>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Creează cât vrei' : 'Create as many as you want'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
                  {language === 'ro' ? 'Prieteni Nelimitați' : 'Unlimited Friends'}
                </p>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Conectează-te cu toți' : 'Connect with everyone'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
                  {language === 'ro' ? 'Food Database' : 'Food Database'}
                </p>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? '200+ ingrediente' : '200+ ingredients'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
                  {language === 'ro' ? 'AI Analyzer' : 'AI Analyzer'}
                </p>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Scor & feedback' : 'Score & feedback'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-900 rounded-[20px] p-6 mb-8 border-2 border-yellow-400 shadow-lg">
            <p className="text-sm text-[rgb(var(--ios-text-tertiary))] mb-2">
              {language === 'ro' ? 'OFERTĂ SPECIALĂ' : 'SPECIAL OFFER'}
            </p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">200 RON</span>
              <span className="text-lg text-[rgb(var(--ios-text-secondary))]">
                {language === 'ro' ? '/ prima lună' : '/ first month'}
              </span>
            </div>
            <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
              {language === 'ro' ? 'Apoi doar 20 RON/lună' : 'Then only 20 RON/month'}
            </p>
          </div>

          {/* CTA Button */}
          <Button
            asChild
            className="w-full h-14 text-lg bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold shadow-2xl"
          >
            <Link to="/upgrade">
              <Zap className="w-5 h-5 mr-2" />
              {language === 'ro' ? '🚀 Upgrade la Premium' : '🚀 Upgrade to Premium'}
            </Link>
          </Button>

          <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-4">
            {language === 'ro' 
              ? '⚡ Activare instant • Anulare oricând • Suport prioritar' 
              : '⚡ Instant activation • Cancel anytime • Priority support'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

