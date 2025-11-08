import React, { useState, useEffect } from "react";
import localApi from "@/api/localClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import DietaryPreferencesModal from "../components/DietaryPreferencesModal";

export default function Settings() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {language === 'ro' ? 'Setări Alimentare' : 'Dietary Settings'}
          </h1>
          <p className="text-[rgb(var(--ios-text-secondary))] mt-1">
            {language === 'ro' 
              ? 'Configurează preferințele tale alimentare, alergii și restricții' 
              : 'Configure your dietary preferences, allergies and restrictions'}
          </p>
        </div>

        {/* Info Card */}
        <Card className="ios-card ios-shadow-lg rounded-[20px] border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {language === 'ro' ? 'De ce sunt importante aceste setări?' : 'Why are these settings important?'}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {language === 'ro' 
                    ? 'Preferințele tale alimentare ne ajută să-ți recomandăm rețete potrivite și să filtrăm mâncările care conțin alergeni sau ingrediente pe care vrei să le eviți. Actualizează-le oricând se schimbă nevoile tale.' 
                    : 'Your dietary preferences help us recommend suitable recipes and filter out foods containing allergens or ingredients you want to avoid. Update them whenever your needs change.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences Modal - Always Visible */}
        <DietaryPreferencesModal
          isOpen={true}
          onClose={() => {}}
          user={user}
          onSave={() => {
            localApi.auth.me().then(setUser);
          }}
        />

        {/* Tips */}
        <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
          <CardHeader>
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">
              💡 {language === 'ro' ? 'Sfaturi' : 'Tips'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[rgb(var(--ios-text-secondary))]">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                <span>
                  {language === 'ro' 
                    ? 'Bifează "Vegetarian" sau "Vegan" pentru a filtra rețetele cu carne/produse animale' 
                    : 'Check "Vegetarian" or "Vegan" to filter out meat/animal product recipes'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                <span>
                  {language === 'ro' 
                    ? 'Adaugă toate alergiile tale pentru siguranța ta' 
                    : 'Add all your allergies for your safety'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                <span>
                  {language === 'ro' 
                    ? 'Lista de mâncăruri preferate ne ajută să-ți sugerăm rețete similare' 
                    : 'Your favorite foods list helps us suggest similar recipes'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

