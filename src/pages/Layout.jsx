

import React from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Calendar, TrendingDown, BookOpen, User, LogOut, Users, MessageCircle, HelpCircle, Shield, Settings, ChefHat, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import localApi from "@/api/localClient";
import { LanguageProvider, useLanguage } from "../components/LanguageContext";
import { ThemeProvider, useTheme } from "../components/ThemeContext";
import LanguageSelector from "../components/LanguageSelector";
import ThemeSelector from "../components/ThemeSelector";
import AIFoodAssistant from "../components/AIFoodAssistant";
import NotificationBell from "../components/NotificationBell";
import { differenceInDays } from "date-fns";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Component intern care folosește useSidebar - TREBUIE să fie sub SidebarProvider
function SidebarNav({ user, t, language, theme, handleLogout }) {
  const { setOpenMobile } = useSidebar();
  const location = useLocation();

  const handleNavClick = () => {
    // Închide sidebar-ul pe mobile după click
    setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-[rgb(var(--ios-border))] ios-glass">
      <div className="h-16 min-h-[64px] max-h-[64px] flex items-center px-4 border-b border-[rgb(var(--ios-border))] bg-white dark:bg-[rgb(var(--ios-bg-primary))] flex-shrink-0 box-border">
        <Link to={createPageUrl("DailyPlan")} className="flex items-center gap-2 transition-opacity hover:opacity-85">
          <img
            src={theme === 'dark' ? '/logodark.png' : '/logolight.png'}
            alt="EatnFit"
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>
      
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("DailyPlan")}
                >
                  <Link to={createPageUrl("DailyPlan")} onClick={handleNavClick}>
                    <Calendar className="w-5 h-5" />
                    <span>{t('dailyPlan')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("Calendar")}
                >
                  <Link to={createPageUrl("Calendar")} onClick={handleNavClick}>
                    <Calendar className="w-5 h-5" />
                    <span>{language === 'ro' ? 'Calendar 28 zile' : 'Calendar 28 days'}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("Dashboard")}
                >
                  <Link to={createPageUrl("Dashboard")} onClick={handleNavClick}>
                    <Home className="w-5 h-5" />
                    <span>{t('dashboard')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("WeightTracking")}
                >
                  <Link to={createPageUrl("WeightTracking")} onClick={handleNavClick}>
                    <TrendingDown className="w-5 h-5" />
                    <span>{t('weightTracking')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("Recipes")}
                >
                  <Link to={createPageUrl("Recipes")} onClick={handleNavClick}>
                    <BookOpen className="w-5 h-5" />
                    <span>{t('recipes')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("MyRecipes")}
                >
                  <Link to={createPageUrl("MyRecipes")} onClick={handleNavClick}>
                    <ChefHat className="w-5 h-5" />
                    <span>{language === 'ro' ? 'Rețetele Mele' : 'My Recipes'}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("Friends")}
                >
                  <Link to={createPageUrl("Friends")} onClick={handleNavClick}>
                    <Users className="w-5 h-5" />
                    <span>{language === 'ro' ? 'Prieteni' : 'Friends'}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("Profile")}
                >
                  <Link to={createPageUrl("Profile")} onClick={handleNavClick}>
                    <User className="w-5 h-5" />
                    <span>{t('profile')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("Settings")}
                >
                  <Link to={createPageUrl("Settings")} onClick={handleNavClick}>
                    <Settings className="w-5 h-5" />
                    <span>{language === 'ro' ? 'Setări Alimentare' : 'Dietary Settings'}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {user?.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === createPageUrl("Admin")}
                  >
                    <Link to={createPageUrl("Admin")} onClick={handleNavClick}>
                      <Shield className="w-5 h-5" />
                      <span>{t('admin')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === createPageUrl("Support")}
                >
                  <Link to={createPageUrl("Support")} onClick={handleNavClick}>
                    <HelpCircle className="w-5 h-5" />
                    <span>{t('support')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-[rgb(var(--ios-border))] p-3">
        {user && (
          <div className="flex items-center gap-3 px-2 mb-3">
            {user.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt={user.first_name || 'User'}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {user.first_name?.[0]?.toUpperCase() || user.last_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-[rgb(var(--ios-text-primary))] text-sm truncate">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.name || 'User')}
                </p>
                {user.subscription_plan === 'free' ? (
                  <Badge className="bg-gray-500 text-white text-[10px] px-1.5 py-0">FREE</Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-1.5 py-0 font-bold">
                    <Crown className="w-2.5 h-2.5 mr-0.5" />
                    PRO
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[rgb(var(--ios-text-tertiary))] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

function LayoutContent() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Verificăm dacă user-ul e autentificat
    localApi.auth.me()
      .then(userData => {
        setUser(userData);
        console.log('User autentificat:', userData.email);
      })
      .catch(error => {
        console.log('User NEAUTENTIFICAT - redirectare la login');
        setUser(null);
        // Redirectare la pagina de login
        navigate('/');
      });
  }, [navigate]);

  const hasActiveProgram = !!user?.start_date && user?.program_status !== 'abandoned';
  
  const getProgramDaysPassed = () => {
    if (!hasActiveProgram) return 0;
    const startDate = new Date(user.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(today, startDate) + 1;
  };

  const programDaysPassed = getProgramDaysPassed();
  const isProgramExpired = hasActiveProgram && programDaysPassed > 28;
  const currentDay = Math.min(Math.max(programDaysPassed, 1), 28);

  const baseNavigationItems = [
    {
      title: t('home'),
      url: createPageUrl("Dashboard"),
      icon: Home,
    },
    {
      title: t('dailyPlan'),
      url: createPageUrl("DailyPlan"),
      icon: Calendar,
    },
    {
      title: t('progress'),
      url: createPageUrl("Progress"),
      icon: TrendingDown,
    },
    {
      title: t('weight'),
      url: createPageUrl("WeightTracking"),
      icon: TrendingDown,
    },
    {
      title: t('recipes'),
      url: createPageUrl("Recipes"),
      icon: BookOpen,
    },
    {
      title: language === 'ro' ? 'Recomandări' : 'Recommendations',
      url: createPageUrl("Recommendations"),
      icon: BookOpen,
    },
    {
      title: t('friends'),
      url: createPageUrl("Friends"),
      icon: Users,
    },
    {
      title: t('messages'),
      url: createPageUrl("Messages"),
      icon: MessageCircle,
    },
    {
      title: t('support'),
      url: createPageUrl("Support"),
      icon: HelpCircle,
    },
    {
      title: t('profile'),
      url: createPageUrl("Profile"),
      icon: User,
    },
  ];

  const navigationItems = user?.role === 'admin'
    ? [
        ...baseNavigationItems,
        {
          title: t('admin'),
          url: createPageUrl("Admin"),
          icon: Shield,
        }
      ]
    : baseNavigationItems;

  const handleLogout = () => {
    console.log('LOGOUT - Șterg toate datele...');
    
    // Logout folosind API-ul local
    localApi.auth.logout();
    
    // Șterge TOATE credențialele salvate
    localStorage.removeItem('remembered_email');
    localStorage.removeItem('remembered_password');
    localStorage.removeItem('remember_me');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.clear(); // Pentru siguranță, șterge tot!
    
    console.log('Date șterse! Redirectare la login...');
    
    // Redirectare FORȚATĂ cu page reload complet
    window.location.href = '/';
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --ios-bg-primary: 255, 255, 255;
          --ios-bg-secondary: 242, 242, 247;
          --ios-bg-tertiary: 255, 255, 255;
          --ios-text-primary: 0, 0, 0;
          --ios-text-secondary: 60, 60, 67;
          --ios-text-tertiary: 142, 142, 147;
          --ios-border: 209, 213, 219;
          --ios-shadow: 0, 0, 0;
        }
        
        .dark {
          --ios-bg-primary: 18, 18, 18;
          --ios-bg-secondary: 0, 0, 0;
          --ios-bg-tertiary: 28, 28, 30;
          --ios-text-primary: 255, 255, 255;
          --ios-text-secondary: 152, 152, 157;
          --ios-text-tertiary: 99, 99, 102;
          --ios-border: 38, 38, 40;
          --ios-shadow: 0, 0, 0;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', sans-serif;
          background: rgb(var(--ios-bg-secondary));
          color: rgb(var(--ios-text-primary));
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        html, body {
          max-width: 100vw;
          overflow-x: hidden;
        }

        .ios-card {
          background: rgb(var(--ios-bg-primary));
          border: 1px solid rgb(var(--ios-border));
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dark .ios-card {
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 24px;
        }

        /* Pill button defaults matching Screen 1 */
        .btn-pill, button.ios-btn {
          border-radius: 9999px !important;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .ios-glass {
          background: rgba(var(--ios-bg-primary), 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        .dark .ios-glass {
          background: rgba(var(--ios-bg-primary), 0.9);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ios-shadow-sm {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        .dark .ios-shadow-sm {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .ios-shadow-lg {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 12px 28px rgba(0, 0, 0, 0.02);
        }

        .dark .ios-shadow-lg {
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6), 0 12px 30px rgba(0, 0, 0, 0.4);
        }

        * {
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .dark .recharts-cartesian-grid line {
          stroke: rgba(255, 255, 255, 0.05);
        }

        .dark .recharts-text {
          fill: rgb(152, 152, 157);
        }

        .dark ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .dark ::-webkit-scrollbar-track {
          background: rgb(18, 18, 18);
        }

        .dark ::-webkit-scrollbar-thumb {
          background: rgb(58, 58, 60);
          border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgb(78, 78, 80);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full max-w-full overflow-x-hidden bg-[rgb(var(--ios-bg-secondary))]">
        <SidebarNav 
          user={user} 
          t={t} 
          language={language} 
          theme={theme} 
          handleLogout={handleLogout} 
        />

        <main className="flex-1 flex flex-col relative max-w-full overflow-x-hidden">
          {/* HEADER MOBIL (ascuns pe desktop) */}
          <header className="h-16 min-h-[64px] max-h-[64px] box-border flex-shrink-0 bg-white dark:bg-[rgb(var(--ios-bg-primary))] border-b border-[rgb(var(--ios-border))] px-4 md:hidden sticky top-0 z-10 ios-shadow-sm flex items-center justify-between">
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-white/5 p-3 rounded-2xl border border-gray-200 dark:border-white/15 transition-colors duration-200 text-xl w-11 h-11 flex items-center justify-center active:scale-[0.97]" />
                {user && (
                  <div className="flex items-center gap-2">
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.full_name || 'User profile picture'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {user.full_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Progress Bar - Centered (responsive) */}
              {user?.program_status === 'abandoned' ? (
                <div className="hidden min-[380px]:block text-center">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                    {language === 'ro' ? 'Fără program activ' : 'No active program'}
                  </span>
                </div>
              ) : isProgramExpired ? (
                <div className="hidden min-[380px]:block text-center">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {language === 'ro' ? 'Program încheiat' : 'Program ended'}
                  </span>
                </div>
              ) : hasActiveProgram && (
                <div className="hidden min-[380px]:block flex-1 max-w-[120px] sm:max-w-[160px] mx-1">
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
                      style={{ width: `${(currentDay / 28) * 100}%` }}
                    />
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400">
                    {language === 'ro' ? 'Ziua' : 'Day'} {currentDay}/28
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3">
                <NotificationBell />
                <ThemeSelector />
              </div>
            </div>
          </header>

          {/* HEADER DESKTOP (ascuns pe mobil, vizibil pe desktop) */}
          <header className="hidden md:flex h-16 min-h-[64px] max-h-[64px] box-border flex-shrink-0 bg-white dark:bg-[rgb(var(--ios-bg-primary))] border-b border-[rgb(var(--ios-border))] px-6 sticky top-0 z-10 ios-shadow-sm items-center justify-between">
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2">
                  {user.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt={user.full_name || 'User profile picture'}
                      className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.first_name?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                    {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.full_name || user.email}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar - Desktop */}
            {user?.program_status === 'abandoned' ? (
              <div className="text-center mx-6">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                  {language === 'ro' ? 'Fără program activ (abandonat)' : 'No active program (abandoned)'}
                </span>
              </div>
            ) : isProgramExpired ? (
              <div className="text-center mx-6">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {language === 'ro' ? 'Program încheiat / neterminat' : 'Program ended / unfinished'}
                </span>
              </div>
            ) : hasActiveProgram && (
              <div className="flex-1 max-w-[200px] mx-6">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
                    style={{ width: `${(currentDay / 28) * 100}%` }}
                  />
                </div>
                <div className="mt-1 text-xs font-semibold text-center text-emerald-600 dark:text-emerald-400">
                  {language === 'ro' ? 'Ziua' : 'Day'} {currentDay}/28
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <NotificationBell />
              <ThemeSelector />
            </div>
          </header>

          {/* MAIN CONTENT OUTLET cu padding generos pe mobil pentru bara inferioară */}
          <div className="flex-1 overflow-auto max-w-full pb-24 md:pb-6">
            <Outlet />
          </div>

          {/* MOBILE BOTTOM TAB BAR - Nativ iOS / Android */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[rgb(var(--ios-bg-primary))]/95 backdrop-blur-xl border-t border-[rgb(var(--ios-border))] px-1.5 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
            <Link
              to={createPageUrl("DailyPlan")}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                location.pathname === createPageUrl("DailyPlan")
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${location.pathname === createPageUrl("DailyPlan") ? "bg-emerald-500/15" : ""}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate">
                {language === 'ro' ? 'Plan' : 'Daily'}
              </span>
            </Link>

            <Link
              to={createPageUrl("Calendar")}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                location.pathname === createPageUrl("Calendar")
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${location.pathname === createPageUrl("Calendar") ? "bg-emerald-500/15" : ""}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate">
                {language === 'ro' ? '28 Zile' : '28 Days'}
              </span>
            </Link>

            <Link
              to={createPageUrl("Recipes")}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                location.pathname === createPageUrl("Recipes")
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${location.pathname === createPageUrl("Recipes") ? "bg-emerald-500/15" : ""}`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate">
                {language === 'ro' ? 'Rețete' : 'Recipes'}
              </span>
            </Link>

            <Link
              to={createPageUrl("WeightTracking")}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                location.pathname === createPageUrl("WeightTracking")
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${location.pathname === createPageUrl("WeightTracking") ? "bg-emerald-500/15" : ""}`}>
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate">
                {language === 'ro' ? 'Greutate' : 'Weight'}
              </span>
            </Link>

            {user?.role === 'admin' ? (
              <Link
                to={createPageUrl("Admin")}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                  location.pathname === createPageUrl("Admin")
                    ? "text-purple-600 dark:text-purple-400 font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${location.pathname === createPageUrl("Admin") ? "bg-purple-500/15" : ""}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate">
                  Admin
                </span>
              </Link>
            ) : (
              <Link
                to={createPageUrl("Profile")}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
                  location.pathname === createPageUrl("Profile")
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${location.pathname === createPageUrl("Profile") ? "bg-emerald-500/15" : ""}`}>
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate">
                  {language === 'ro' ? 'Profil' : 'Profile'}
                </span>
              </Link>
            )}
          </nav>

          <AIFoodAssistant />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function Layout() {
  return <LayoutContent />;
}

