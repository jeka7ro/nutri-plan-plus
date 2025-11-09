import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import localApi from "@/api/localClient"; // Direct client pentru auth
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/LanguageContext";
import { useTheme } from "@/components/ThemeContext";
import LanguageSelector from "@/components/LanguageSelector";

export default function IndexPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { theme } = useTheme() || { theme: 'light' };
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    country_code: '+40',
    country: '',
    city: '',
    date_of_birth: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
        // User NEAUTENTIFICAT - verifică credențiale salvate pentru AUTO-LOGIN
        console.log("User not authenticated - checking saved credentials");
        
        const savedEmail = localStorage.getItem('remembered_email');
        const savedPassword = localStorage.getItem('remembered_password');
        const savedRemember = localStorage.getItem('remember_me') === 'true';
        
        console.log('🔍 Remember me check:', { savedEmail, hasSavedPassword: !!savedPassword, savedRemember });
        
        if (savedEmail && savedPassword && savedRemember) {
          // ✨ AUTO-LOGIN INSTANT - PĂSTRĂM LOADING ACTIV!
          console.log('🔐 AUTO-LOGIN cu credențiale salvate... (LOADING rămâne activ)');
          
          try {
            const loginResult = await localApi.auth.login(savedEmail, savedPassword);
            console.log('✅ AUTO-LOGIN SUCCESS! Navigare automată...');
            
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
              // Navighează la DailyPlan (ziua curentă)
              navigate(createPageUrl("DailyPlan"));
            } else {
              navigate(createPageUrl("Onboarding"));
            }
            // NU setăm isLoading(false) aici - navigarea se va face automat
          } catch (autoLoginError) {
            console.error('❌ AUTO-LOGIN FAILED:', autoLoginError);
            // Șterge credențialele invalide
            localStorage.removeItem('remembered_email');
            localStorage.removeItem('remembered_password');
            localStorage.removeItem('remember_me');
            // Acum DA, arătăm login form-ul
            setIsLoading(false);
          }
        } else {
          // Nu avem credențiale salvate - arătăm login form-ul
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
          formData.first_name,
          formData.last_name,
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
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--ios-bg-primary))] py-8 px-4">
      <div className="w-full max-w-lg">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <div className="bg-[rgb(var(--ios-bg-secondary))] rounded-[28px] shadow-2xl p-8 space-y-6 border border-[rgb(var(--ios-border))]">
          {/* Logo MARE și Tagline */}
          <div className="text-center mb-2">
            <img 
              src={theme === 'dark' ? '/logodark.png' : '/logolight.png'}
              alt="EatnFit Logo" 
              className="w-48 h-48 object-contain mx-auto mb-2"
            />
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 -mt-3 mb-6 tracking-wide">
              Eat Smart. Stay Fit
            </p>
            <p className="text-[rgb(var(--ios-text-secondary))] text-base font-medium">
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
                {/* 2 COLOANE: Prenume și Nume */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-[rgb(var(--ios-text-primary))] font-semibold">
                      {language === 'ro' ? 'Prenume' : 'First Name'}
                  </Label>
                    <Input
                        id="first_name"
                        name="first_name"
                      type="text"
                        placeholder={language === 'ro' ? 'Ion' : 'John'}
                        value={formData.first_name}
                      onChange={handleChange}
                      className="h-12 rounded-[12px] text-base"
                      required={!isLogin}
                    />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-[rgb(var(--ios-text-primary))] font-semibold">
                      {language === 'ro' ? 'Nume' : 'Last Name'}
                    </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        type="text"
                        placeholder={language === 'ro' ? 'Popescu' : 'Doe'}
                        value={formData.last_name}
                        onChange={handleChange}
                        className="h-12 rounded-[12px] text-base"
                        required={!isLogin}
                      />
                  </div>
                </div>

                {/* Telefon - pe toată lățimea */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[rgb(var(--ios-text-primary))] font-semibold">
                    {language === 'ro' ? 'Număr Telefon' : 'Phone Number'}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                        id="country_code"
                        name="country_code"
                        type="text"
                        placeholder="Cod"
                        value={formData.country_code}
                        onChange={handleChange}
                        className="h-12 rounded-[12px] text-base w-20"
                        required={!isLogin}
                      />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={language === 'ro' ? '712345678' : '712345678'}
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-12 rounded-[12px] text-base flex-1"
                        required={!isLogin}
                      />
                  </div>
                </div>

                {/* 2 COLOANE: Țara și Orașul */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-[rgb(var(--ios-text-primary))] font-semibold">
                    {language === 'ro' ? 'Țara' : 'Country'}
                  </Label>
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      placeholder={language === 'ro' ? 'România' : 'Romania'}
                      value={formData.country}
                      onChange={handleChange}
                      className="h-12 rounded-[12px] text-base"
                      required={!isLogin}
                    />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[rgb(var(--ios-text-primary))] font-semibold">
                    {language === 'ro' ? 'Orașul' : 'City'}
                  </Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder={language === 'ro' ? 'București' : 'Bucharest'}
                      value={formData.city}
                      onChange={handleChange}
                      className="h-12 rounded-[12px] text-base"
                      required={!isLogin}
                    />
                  </div>
                </div>

                {/* Data Nașterii - pe toată lățimea */}
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-[rgb(var(--ios-text-primary))] font-semibold">
                    {language === 'ro' ? 'Data Nașterii' : 'Date of Birth'}
                  </Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="h-12 rounded-[12px] text-base"
                      required={!isLogin}
                      max={new Date().toISOString().split('T')[0]}
                    />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[rgb(var(--ios-text-primary))] font-semibold">
                Email
              </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={language === 'ro' ? 'email@exemplu.com' : 'email@example.com'}
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 rounded-[12px] text-base"
                  required
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[rgb(var(--ios-text-primary))] font-semibold">
                {language === 'ro' ? 'Parolă' : 'Password'}
              </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 rounded-[12px] text-base"
                  required
                  minLength={6}
                />
            </div>

            {/* Remember Me Checkbox - doar la login */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="border-[rgb(var(--ios-border))]"
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm text-[rgb(var(--ios-text-secondary))] cursor-pointer font-medium"
                  >
                    {language === 'ro' ? 'Ține-mă minte' : 'Remember me'}
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  {language === 'ro' ? 'Ai uitat parola?' : 'Forgot password?'}
                </button>
              </div>
            )}

            <Button 
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white h-14 text-lg font-bold rounded-[14px] shadow-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === 'ro' ? 'Se procesează...' : 'Processing...'}
                </>
              ) : (
                isLogin 
                  ? (language === 'ro' ? 'Intră în cont' : 'Sign In')
                  : (language === 'ro' ? 'Creează cont' : 'Create Account')
              )}
            </Button>
          </form>

          {/* Modal Recuperare Parolă */}
          <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === 'ro' ? 'Recuperare Parolă' : 'Password Recovery'}
                </DialogTitle>
                <DialogDescription className="space-y-4 pt-4">
                  <p className="text-base">
                    {language === 'ro' 
                      ? 'Pentru a reseta parola, te rugăm să contactezi administratorul aplicației:'
                      : 'To reset your password, please contact the application administrator:'}
                  </p>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                      📧 Email: jeka7ro@gmail.com
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ro'
                      ? 'Administratorul îți va reseta parola și îți va trimite noua parolă pe email.'
                      : 'The administrator will reset your password and send you the new password via email.'}
                  </p>
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => setShowForgotPassword(false)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {language === 'ro' ? 'Am înțeles' : 'Got it'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Toggle Login/Register */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', first_name: '', last_name: '' });
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              {isLogin 
                ? (language === 'ro' ? 'Nu ai cont? Creează unul aici' : "Don't have an account? Create one here")
                : (language === 'ro' ? 'Ai deja cont? Autentifică-te' : 'Already have an account? Sign in')
              }
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}