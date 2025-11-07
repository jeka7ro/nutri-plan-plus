

import React from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Calendar, TrendingDown, BookOpen, User, LogOut, Users, MessageCircle, HelpCircle, Shield } from "lucide-react";
import localApi from "@/api/localClient";
import { LanguageProvider, useLanguage } from "../components/LanguageContext";
import { ThemeProvider, useTheme } from "../components/ThemeContext";
import LanguageSelector from "../components/LanguageSelector";
import ThemeSelector from "../components/ThemeSelector";
import AIFoodAssistant from "../components/AIFoodAssistant";
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
} from "@/components/ui/sidebar";

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
        console.log('✅ User autentificat:', userData.email);
      })
      .catch(error => {
        console.log('❌ User NEAUTENTIFICAT - redirectare la login');
        setUser(null);
        // Redirectare la pagina de login
        navigate('/');
      });
  }, [navigate]);

  const getCurrentDay = () => {
    if (!user?.start_date) return 1;
    const startDate = new Date(user.start_date);
    const today = new Date();
    const daysPassed = differenceInDays(today, startDate) + 1;
    return Math.min(Math.max(daysPassed, 1), 28);
  };

  const currentDay = getCurrentDay();

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
    console.log('🚪 LOGOUT - Șterg toate datele...');
    
    // Logout folosind API-ul local
    localApi.auth.logout();
    
    // Șterge TOATE credențialele salvate
    localStorage.removeItem('remembered_email');
    localStorage.removeItem('remembered_password');
    localStorage.removeItem('remember_me');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.clear(); // Pentru siguranță, șterge tot!
    
    console.log('✅ Date șterse! Redirectare la login...');
    
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
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .dark .ios-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
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
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .dark .ios-shadow-sm {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .ios-shadow-lg {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03);
        }

        .dark .ios-shadow-lg {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7), 0 10px 25px rgba(0, 0, 0, 0.5);
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
        <Sidebar className="border-r border-[rgb(var(--ios-border))] ios-glass">
          <SidebarHeader className="border-b border-[rgb(var(--ios-border))] p-6">
            <div className="flex flex-col items-center mb-4">
              <img 
                src={theme === 'dark' ? '/logodark.png' : '/logolight.png'}
                alt="EatnFit Logo" 
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeSelector />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 rounded-[14px] mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm dark:shadow-emerald-500/20' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-[rgb(var(--ios-border))] p-4">
            <div className="space-y-3">
              {user && (
                <div className="flex items-center gap-3 px-2">
                  {user.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt={user.full_name || 'User profile picture'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[rgb(var(--ios-text-primary))] text-sm truncate">{user.full_name || 'User'}</p>
                    <p className="text-xs text-[rgb(var(--ios-text-tertiary))] truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[rgb(var(--ios-text-secondary))] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[12px] transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col relative max-w-full overflow-x-hidden">
          <header className="bg-white dark:bg-[rgb(var(--ios-bg-primary))] border-b border-gray-200 dark:border-[rgb(var(--ios-border))] px-6 py-3 md:hidden sticky top-0 z-10 ios-shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-white/5 p-2 rounded-[12px] transition-colors duration-200" />
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
              
              {/* Progress Bar - Centered */}
              {user?.start_date && (
                <div className="flex-1 max-w-[140px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {language === 'ro' ? 'Ziua' : 'Day'} {currentDay}/28
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${(currentDay / 28) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <ThemeSelector />
            </div>
          </header>

          <div className="flex-1 overflow-auto max-w-full">
            <Outlet />
          </div>

          <AIFoodAssistant />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function Layout() {
  return <LayoutContent />;
}

