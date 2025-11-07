import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import localApi from "@/api/localClient"; // Direct client pentru auth
import { createPageUrl } from "@/utils";
import { Loader2, Apple, Dumbbell, TrendingDown, Heart, Mail, Lock, User, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import LanguageSelector from "@/components/LanguageSelector";

export default function IndexPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    country_code: '+40',
    country: '',
    city: '',
    date_of_birth: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Verifică dacă user-ul este autentificat
        const user = await localApi.auth.me();
        
        // ADMINS bypass onboarding complet
        if (user.role === 'admin') {
          console.log('✅ Admin detectat - SKIP onboarding');
          navigate(createPageUrl("DailyPlan"));
          return;
        }
        
        // Verifică dacă user-ul are datele complete SAU a completat deja onboarding
        // Dacă are profile_picture sau name completat, considerăm că a trecut deja prin onboarding
        const hasCompletedProfile = user.start_date && user.current_weight && user.target_weight;
        const hasBasicInfo = user.profile_picture || (user.name && user.name !== user.email.split('@')[0]);
        
              if (hasCompletedProfile || hasBasicInfo) {
                console.log('✅ Profil deja completat - SKIP onboarding');
                // Navighează la DailyPlan (ziua curentă) în loc de Dashboard
                navigate(createPageUrl("DailyPlan"));
              } else {
                console.log('→ Profil incomplet - navigare la Onboarding');
                navigate(createPageUrl("Onboarding"));
              }
      } catch (error) {
        // User NEAUTENTIFICAT - afișează pagina de login
        console.log("User not authenticated - showing login page");
        
        // Încarcă credențialele salvate dacă există
        const savedEmail = localStorage.getItem('remembered_email');
        const savedPassword = localStorage.getItem('remembered_password');
        const savedRemember = localStorage.getItem('remember_me') === 'true';
        
        console.log('🔍 Remember me check:', { savedEmail, hasSavedPassword: !!savedPassword, savedRemember });
        
        if (savedEmail && savedPassword && savedRemember) {
          // AUTO-LOGIN dacă avem email + parolă + remember me
          console.log('🔐 AUTO-LOGIN cu credențiale salvate...');
          setFormData({ email: savedEmail, password: savedPassword, name: '' });
          setRememberMe(true);
          
          // Trimite form automat (IMEDIAT, nu mai așteptăm)
          (async () => {
            try {
              const loginResult = await localApi.auth.login(savedEmail, savedPassword);
              console.log('✅ AUTO-LOGIN SUCCESS!');
              
              const user = await localApi.auth.me();
              
              // ADMINS bypass onboarding complet
              if (user.role === 'admin') {
                console.log('✅ Admin detectat - SKIP onboarding');
                navigate(createPageUrl("DailyPlan"));
                return;
              }
              
              const hasCompletedProfile = user.start_date && user.current_weight && user.target_weight;
              const hasBasicInfo = user.profile_picture || (user.name && user.name !== user.email.split('@')[0]);
              
              if (hasCompletedProfile || hasBasicInfo) {
                // Navighează la DailyPlan (ziua curentă) în loc de Dashboard
                navigate(createPageUrl("DailyPlan"));
              } else {
                navigate(createPageUrl("Onboarding"));
              }
            } catch (error) {
              console.error('❌ AUTO-LOGIN FAILED:', error);
              // Șterge credențialele invalide
              localStorage.removeItem('remembered_email');
              localStorage.removeItem('remembered_password');
              localStorage.removeItem('remember_me');
              setIsLoading(false);
            }
          })();
        } else {
          // Nu avem credențiale salvate sau auto-login
          if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(savedRemember);
          }
          setIsLoading(false);
        }
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        // Login
        console.log('🔍 LOGIN START:', formData.email);
        const loginResult = await localApi.auth.login(formData.email, formData.password);
        console.log('✅ LOGIN SUCCESS! Token saved:', !!loginResult.token);
        
        // Salvează credențialele și PAROLA dacă "Remember me" este bifat
        if (rememberMe) {
          localStorage.setItem('remembered_email', formData.email);
          localStorage.setItem('remembered_password', formData.password); // SALVĂM ȘI PAROLA!
          localStorage.setItem('remember_me', 'true');
          console.log('✅ Credențiale SALVATE în localStorage');
        } else {
          localStorage.removeItem('remembered_email');
          localStorage.removeItem('remembered_password');
          localStorage.removeItem('remember_me');
          console.log('🗑️ Credențiale ȘTERSE din localStorage');
        }
        
        toast({
          title: language === 'ro' ? "Bine ai revenit!" : "Welcome back!",
          description: language === 'ro' ? "Te-ai autentificat cu succes." : "You have successfully logged in.",
          duration: 3000,
        });
        
        // Check if user has completed onboarding
        console.log('🔍 Verificăm datele user...');
        const user = await localApi.auth.me();
        console.log('✅ User data:', user);
        
        // ADMINS bypass onboarding complet
        if (user.role === 'admin') {
          console.log('✅ Admin detectat - SKIP onboarding');
          navigate(createPageUrl("DailyPlan"));
          return;
        }
        
        const hasCompletedProfile = user.start_date && user.current_weight && user.target_weight;
        const hasBasicInfo = user.profile_picture || (user.name && user.name !== user.email.split('@')[0]);
        
        if (hasCompletedProfile || hasBasicInfo) {
          console.log('→ Navigăm la DailyPlan (ziua Today)');
          navigate(createPageUrl("DailyPlan"));
        } else {
          console.log('→ Navigăm la Onboarding');
          navigate(createPageUrl("Onboarding"));
        }
      } else {
        // Register
        await localApi.auth.register(
          formData.email, 
          formData.password, 
          formData.name,
          formData.phone,
          formData.country_code,
          formData.country,
          formData.city,
          formData.date_of_birth
        );
        toast({
          title: language === 'ro' ? "Cont creat cu succes!" : "Account created successfully!",
          description: language === 'ro' ? "Bine ai venit! Te rugăm să completezi datele tale." : "Welcome! Please complete your profile.",
          duration: 3000,
        });
        navigate(createPageUrl("Onboarding"));
      }
    } catch (error) {
      toast({
        title: language === 'ro' ? "Eroare" : "Error",
        description: error.message || (language === 'ro' ? "A apărut o eroare. Te rugăm să încerci din nou." : "An error occurred. Please try again."),
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
        <div className="text-center">
          <img 
            src={theme === 'dark' ? '/logodark.png' : '/logolight.png'}
            alt="EatnFit Logo" 
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            EatnFit
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ro' ? 'Se încarcă aplicația...' : 'Loading application...'}
          </p>
        </div>
      </div>
    );
  }

  // Pagina de Login/Register
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20 py-4 px-4">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 space-y-4">
          {/* Logo */}
          <div className="text-center">
            <img 
              src={theme === 'dark' ? '/logodark.png' : '/logolight.png'}
              alt="EatnFit Logo" 
              className="w-56 h-56 object-contain mx-auto mb-3"
            />
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {isLogin 
                ? (language === 'ro' ? 'Autentifică-te pentru a continua' : 'Sign in to continue')
                : (language === 'ro' ? 'Creează un cont nou' : 'Create a new account')
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Nume Complet - pe toată lățimea */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                    {language === 'ro' ? 'Nume Complet' : 'Full Name'}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder={language === 'ro' ? 'Ion Popescu' : 'John Doe'}
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 py-6 rounded-xl"
                      required={!isLogin}
                    />
                  </div>
                </div>

                {/* Telefon - pe toată lățimea */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                    {language === 'ro' ? 'Număr Telefon' : 'Phone Number'}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative w-24">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="country_code"
                        name="country_code"
                        type="text"
                        placeholder="+40"
                        value={formData.country_code}
                        onChange={handleChange}
                        className="pl-10 py-6 rounded-xl"
                        required={!isLogin}
                      />
                    </div>
                    <div className="relative flex-1">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={language === 'ro' ? '712345678' : '712345678'}
                        value={formData.phone}
                        onChange={handleChange}
                        className="py-6 rounded-xl"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>

                {/* 2 COLOANE: Țara și Orașul */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">
                      {language === 'ro' ? 'Țara' : 'Country'}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        placeholder={language === 'ro' ? 'România' : 'Romania'}
                        value={formData.country}
                        onChange={handleChange}
                        className="pl-10 py-6 rounded-xl"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">
                      {language === 'ro' ? 'Orașul' : 'City'}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder={language === 'ro' ? 'București' : 'Bucharest'}
                        value={formData.city}
                        onChange={handleChange}
                        className="pl-10 py-6 rounded-xl"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </div>

                {/* Data Nașterii - pe toată lățimea */}
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-gray-700 dark:text-gray-300">
                    {language === 'ro' ? 'Data Nașterii' : 'Date of Birth'}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="pl-10 py-6 rounded-xl"
                      required={!isLogin}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={language === 'ro' ? 'email@exemplu.com' : 'email@example.com'}
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 py-6 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                {language === 'ro' ? 'Parolă' : 'Password'}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 py-6 rounded-xl"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Remember Me Checkbox - doar la login */}
            {isLogin && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label 
                  htmlFor="rememberMe" 
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  {language === 'ro' ? 'Ține-mă minte' : 'Remember me'}
                </Label>
              </div>
            )}

            <Button 
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === 'ro' ? 'Se procesează...' : 'Processing...'}
                </>
              ) : (
                isLogin 
                  ? (language === 'ro' ? 'Autentifică-te' : 'Sign In')
                  : (language === 'ro' ? 'Creează cont' : 'Create Account')
              )}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', name: '' });
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              {isLogin 
                ? (language === 'ro' ? 'Nu ai cont? Creează unul aici' : "Don't have an account? Create one here")
                : (language === 'ro' ? 'Ai deja cont? Autentifică-te' : 'Already have an account? Sign in')
              }
            </button>
          </div>

          {/* Features Info */}
          {isLogin && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {language === 'ro' ? 'Ce vei obține:' : 'What you will get:'}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Dumbbell className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ro' ? 'Plan personalizat de exerciții' : 'Personalized exercise plan'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ro' ? 'Rețete sănătoase zilnice' : 'Daily healthy recipes'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ro' ? 'Monitorizare progres' : 'Progress tracking'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}