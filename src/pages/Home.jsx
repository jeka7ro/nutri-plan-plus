import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Încearcă să obții user-ul curent
        const user = await base44.auth.me();
        
        // Verifică dacă user-ul are datele complete
        if (!user.start_date || !user.current_weight || !user.target_weight) {
          // User autentificat dar nu a completat onboarding
          navigate(createPageUrl("Onboarding"));
        } else {
          // User autentificat și cu date complete
          navigate(createPageUrl("Dashboard"));
        }
      } catch (error) {
        // User NEAUTENTIFICAT - redirectează la login Base44
        console.log("User not authenticated - redirecting to login");
        base44.auth.redirectToLogin(window.location.href);
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // Loading screen în timp ce se verifică autentificarea
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Metabolism Rapid
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Se încarcă aplicația...
        </p>
      </div>
    </div>
  );
}