
import React, { useState, useEffect } from "react";
import api from "@/api/apiAdapter";
const localApi = api; // Compatibilitate
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Apple, 
  Flame, 
  Droplets, 
  TrendingUp,
  Award, 
  Calendar,
  ChevronRight,
  Target,
  Activity,
  Heart,
  UtensilsCrossed,
  Dumbbell
} from "lucide-react";
import { format, differenceInDays, subDays } from "date-fns";
import { ro, enUS } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "../components/LanguageContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const { data: weightEntries = [] } = useQuery({
    queryKey: ['weightEntries'],
    queryFn: () => localApi.weight.list(),
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['allCheckIns'],
    queryFn: () => localApi.checkins.list(),
    staleTime: 0, // NU cache - refresh imediat după orice modificare
    refetchOnMount: 'always', // Refetch mereu când componenta se montează
    refetchOnWindowFocus: true, // Refetch când window-ul devine focus
  });

  useEffect(() => {
    localApi.auth.me().then(userData => {
      setUser(userData);
      if (!userData.start_date || !userData.current_weight || !userData.target_weight) {
        navigate(createPageUrl("Onboarding"));
      }
    }).catch(() => {});
  }, [navigate]);

  const calculateTDEE = () => {
    if (!user?.current_weight || !user?.height || !user?.age || !user?.gender) return 0;

    let bmr;
    if (user.gender === 'male') {
      bmr = 10 * user.current_weight + 6.25 * user.height - 5 * user.age + 5;
    } else {
      bmr = 10 * user.current_weight + 6.25 * user.height - 5 * user.age - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const multiplier = activityMultipliers[user.activity_level || 'moderate'];
    return Math.round(bmr * multiplier);
  };

  const getCurrentDay = () => {
    if (!user?.start_date) return 1;
    const startDate = new Date(user.start_date);
    const today = new Date();
    const daysPassed = differenceInDays(today, startDate) + 1;
    return Math.min(Math.max(daysPassed, 1), 28);
  };

  const getCurrentPhase = (day) => {
    const cycle = ((day - 1) % 7) + 1;
    if (cycle <= 2) return 1;
    if (cycle <= 4) return 2;
    return 3;
  };

  const currentDay = getCurrentDay();
  const currentPhase = getCurrentPhase(currentDay);
  const latestWeight = weightEntries[0];
  const weightLost = user?.current_weight && latestWeight?.weight 
    ? (user.current_weight - latestWeight.weight).toFixed(1)
    : 0;

  // FIXAT: Comparație de date cu conversie la timezone local
  const today = new Date();
  const todayDateStr = format(today, 'yyyy-MM-dd');
  
  const todayCheckIn = checkIns.find(c => {
    if (!c.date) return false;
    
    // PostgreSQL returnează date ca ISO string în UTC (ex: "2025-11-04T22:00:00.000Z")
    // Convertim la timezone local pentru comparație corectă
    const checkInDate = new Date(c.date);
    const checkInDateStr = format(checkInDate, 'yyyy-MM-dd');
    
    console.log('🔍 DASHBOARD DATE COMPARE:', {
      today: todayDateStr,
      checkInDate: c.date,
      checkInLocal: checkInDateStr,
      match: checkInDateStr === todayDateStr
    });
    
    return checkInDateStr === todayDateStr;
  });

  const checkIn = todayCheckIn;
  
  console.log('📊 DASHBOARD DATA:', {
    totalCheckIns: checkIns.length,
    todayCheckIn: todayCheckIn ? 'FOUND' : 'NOT FOUND',
    todayDate: todayDateStr,
    checkInData: todayCheckIn
  });

  // DEBUG: Log data pentru a vedea de ce arată zero
  console.log('🔍 DASHBOARD DEBUG:', {
    totalCheckIns: checkIns.length,
    todayDate: todayDateStr,
    todayCheckIn: todayCheckIn,
    checkInsFirst3: checkIns.slice(0, 3).map(c => ({
      date_raw: c.date,
      date_substring: c.date?.substring(0, 10),
      total_calories: c.total_calories
    })),
  });

  const completedMeals = todayCheckIn 
    ? [
        todayCheckIn.breakfast_completed,
        todayCheckIn.snack1_completed,
        todayCheckIn.lunch_completed,
        todayCheckIn.snack2_completed,
        todayCheckIn.dinner_completed
      ].filter(Boolean).length
    : 0;
  
  console.log('🍽️ MESE COMPLETATE DASHBOARD:', {
    breakfast: todayCheckIn?.breakfast_completed,
    snack1: todayCheckIn?.snack1_completed,
    lunch: todayCheckIn?.lunch_completed,
    snack2: todayCheckIn?.snack2_completed,
    dinner: todayCheckIn?.dinner_completed,
    total: completedMeals
  });

  const caloriesConsumed = todayCheckIn?.total_calories || 0;
  const caloriesBurned = todayCheckIn?.exercise_calories_burned || 0;
  
  console.log('💯 CALORII DASHBOARD:', {
    total_calories: todayCheckIn?.total_calories,
    exercise_calories_burned: todayCheckIn?.exercise_calories_burned,
    water_glasses: todayCheckIn?.water_glasses,
    caloriesConsumed,
    caloriesBurned
  });
  const netCalories = caloriesConsumed - caloriesBurned;
  const tdee = calculateTDEE();
  const caloriesRemaining = tdee - netCalories;

  const phaseInfo = {
    1: {
      name: t('phase1Name'),
      color: "from-red-400 to-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/10",
      textColor: "text-orange-700 dark:text-orange-400",
      description: t('phase1Desc')
    },
    2: {
      name: t('phase2Name'),
      color: "from-emerald-400 to-green-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
      textColor: "text-emerald-700 dark:text-emerald-400",
      description: t('phase2Desc')
    },
    3: {
      name: t('phase3Name'),
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/10",
      textColor: "text-purple-700 dark:text-purple-400",
      description: t('phase3Desc')
    }
  };

  const phase = phaseInfo[currentPhase];

  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // FIXAT: Comparație consistentă de date (convert PostgreSQL ISO la yyyy-MM-dd)
    const checkIn = checkIns.find(c => {
      if (!c.date) return false;
      const checkInDateStr = format(new Date(c.date), 'yyyy-MM-dd');
      return checkInDateStr === dateStr;
    });
    
    return {
      date: format(date, 'MMM dd', { locale: language === 'ro' ? ro : enUS }),
      calories: checkIn?.total_calories || 0,
      caloriesBurned: checkIn?.exercise_calories_burned || 0,
      water: checkIn?.water_intake || 0,
      meals: [
        checkIn?.breakfast_completed,
        checkIn?.snack1_completed,
        checkIn?.lunch_completed,
        checkIn?.snack2_completed,
        checkIn?.dinner_completed
      ].filter(Boolean).length
    };
  });

  const weightChartData = weightEntries
    .slice(0, 14)
    .reverse()
    .map(entry => ({
      date: format(new Date(entry.date), 'MMM dd', { locale: language === 'ro' ? ro : enUS }),
      weight: entry.weight
    }));

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER CARD - MAI MIC, INFO MAI COMPACTĂ */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[24px] p-6 text-white ios-shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              {/* STÂNGA: Poză + Nume */}
              <div className="flex items-center gap-4">
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt={user.full_name || 'User'}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white/30 shadow-xl"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl">
                    <span className="text-2xl font-bold text-white">
                      {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {t('welcomeBack')}, {user?.first_name || user?.full_name?.split(' ')[0] || user?.name || 'User'}
                  </h1>
                  <p className="text-emerald-100 text-sm md:text-base">
                    {t('dayOfProgram')} {currentDay} {t('of28Days')}
                  </p>
                </div>
              </div>

              {/* DREAPTA: Progress & kg lost MARI */}
              <div className="flex gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-[16px] px-4 py-2.5 text-center min-w-[80px]">
                  <div className="text-emerald-100 text-xs font-medium mb-0.5">{t('progress')}</div>
                  <div className="text-2xl font-bold">{Math.round((currentDay / 28) * 100)}%</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-[16px] px-4 py-2.5 text-center min-w-[80px]">
                  <div className="text-emerald-100 text-xs font-medium mb-0.5">{t('kgLost')}</div>
                  <div className="text-2xl font-bold">{weightLost} {t('kg')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="ios-card ios-shadow-lg rounded-[20px] overflow-hidden relative border-[rgb(var(--ios-border))]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full -mr-16 -mt-16" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-[14px] flex items-center justify-center shadow-lg">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  {caloriesRemaining > 0 ? `+${caloriesRemaining}` : Math.abs(caloriesRemaining)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">{netCalories}</div>
                <div className="text-xs text-[rgb(var(--ios-text-secondary))] font-medium">
                  {language === 'ro' ? 'Calorii nete' : 'Net calories'}
                </div>
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Consumate' : 'Consumed'}</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{caloriesConsumed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Arse' : 'Burned'}</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{caloriesBurned}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[rgb(var(--ios-border))]">
                    <span className="text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Țintă' : 'Target'}</span>
                    <span className="font-bold text-[rgb(var(--ios-text-primary))]">{tdee}</span>
                  </div>
                </div>
                <div className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-3">
                  {caloriesRemaining > 0 
                    ? (language === 'ro' ? `${caloriesRemaining} cal mai rămân` : `${caloriesRemaining} cal to go`)
                    : (language === 'ro' ? `${Math.abs(caloriesRemaining)} cal peste limită` : `${Math.abs(caloriesRemaining)} cal over`)
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card border-none ios-shadow-lg rounded-[20px] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full -mr-16 -mt-16" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-[14px] flex items-center justify-center shadow-lg">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {Math.round((completedMeals / 5) * 100)}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">{completedMeals}/5</div>
                <div className="text-xs text-[rgb(var(--ios-text-secondary))] font-medium">
                  {language === 'ro' ? 'Mese completate' : 'Meals completed'}
                </div>
                <div className="flex gap-1.5 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                        i < completedMeals
                          ? 'bg-emerald-500 dark:bg-emerald-400'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-3">
                  {language === 'ro' ? 'Următoarea masă: ' : 'Next meal: '}
                  <span className="font-bold text-[rgb(var(--ios-text-secondary))]">
                    {!checkIn?.breakfast_completed ? t('breakfast') :
                     !checkIn?.snack1_completed ? t('snack1') :
                     !checkIn?.lunch_completed ? t('lunch') :
                     !checkIn?.snack2_completed ? t('snack2') :
                     !checkIn?.dinner_completed ? t('dinner') :
                     (language === 'ro' ? 'Toate completate!' : 'All done!')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card border-none ios-shadow-lg rounded-[20px] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full -mr-16 -mt-16" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-[14px] flex items-center justify-center shadow-lg">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                  {todayCheckIn?.water_intake || 0}/8
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">
                  {todayCheckIn?.water_intake || 0}
                </div>
                <div className="text-xs text-[rgb(var(--ios-text-secondary))] font-medium">
                  {language === 'ro' ? 'Pahare de apă' : 'Glasses of water'}
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded-lg transition-all duration-300 ${
                        i < (todayCheckIn?.water_intake || 0)
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-3">
                  {(todayCheckIn?.water_intake || 0) >= 8 
                    ? (language === 'ro' ? '✨ Obiectiv atins!' : '✨ Goal reached!')
                    : `${8 - (todayCheckIn?.water_intake || 0)} ${language === 'ro' ? 'mai rămân' : 'more to go'}`
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card border-none ios-shadow-lg rounded-[20px] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-16 -mt-16" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[14px] flex items-center justify-center shadow-lg">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                  checkIn?.exercise_completed 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-50 dark:text-gray-400'
                }`}>
                  {checkIn?.exercise_completed ? '✓' : '○'}
                </div>
              </div>
              <div className="space-y-2">
                {checkIn?.exercise_completed ? (
                  <>
                    <div className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">
                      {checkIn.exercise_duration || 0}
                    </div>
                    <div className="text-xs text-[rgb(var(--ios-text-secondary))] font-medium">
                      {language === 'ro' ? 'Minute active' : 'Active minutes'}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg px-3 py-2">
                        <div className="text-xs text-[rgb(var(--ios-text-secondary))]">{language === 'ro' ? 'Tip' : 'Type'}</div>
                        <div className="text-sm font-bold text-purple-700 dark:text-purple-300 capitalize">
                          {checkIn.exercise_type?.replace('_', ' ') || 'workout'}
                        </div>
                      </div>
                      <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg px-3 py-2">
                        <div className="text-xs text-[rgb(var(--ios-text-secondary))]">🔥</div>
                        <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                          {checkIn.exercise_calories_burned || 0}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-400 dark:text-gray-600">--</div>
                    <div className="text-xs text-[rgb(var(--ios-text-secondary))] font-medium">
                      {language === 'ro' ? 'Niciun exercițiu' : 'No exercise yet'}
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                      <div className="text-xs text-center text-[rgb(var(--ios-text-tertiary))]">
                        {language === 'ro' ? 'Înregistrează-ți exercițiul' : 'Log your workout'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="ios-card ios-shadow-lg rounded-[20px] overflow-hidden border-[rgb(var(--ios-border))]">
          <CardHeader className={`${phase.bgColor} rounded-t-[20px] border-b border-[rgb(var(--ios-border))]`}>
            <CardTitle className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${phase.color} rounded-[14px] flex items-center justify-center shadow-md`}>
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className={`text-xl font-bold ${phase.textColor}`}>{phase.name}</div>
                <div className="text-sm text-[rgb(var(--ios-text-secondary))] font-normal">{phase.description}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {todayCheckIn && (
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--ios-text-secondary))]">
                  <Award className="w-4 h-4 text-emerald-500" />
                  {t('waterConsumed')}: {todayCheckIn.water_intake}/8 {t('glasses')}
                </div>
              )}
              <Link to={createPageUrl("DailyPlan")}>
                <Button className={`w-full bg-gradient-to-r ${phase.color} hover:opacity-90 text-white shadow-md rounded-[12px] h-12`}>
                  {t('viewDailyPlan')} <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {weightChartData.length > 0 && (
            <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {language === 'ro' ? 'Evoluția greutății' : 'Weight Evolution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      style={{ fontSize: '12px' }}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgb(var(--ios-bg-primary))',
                        border: '1px solid rgb(var(--ios-border))',
                        borderRadius: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      name={language === 'ro' ? 'Greutate (kg)' : 'Weight (kg)'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {language === 'ro' ? 'Calorii (7 zile)' : 'Calories (7 days)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(var(--ios-bg-primary))',
                      border: '1px solid rgb(var(--ios-border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="calories" 
                    fill="#f97316" 
                    radius={[8, 8, 0, 0]}
                    name={language === 'ro' ? 'Calorii' : 'Calories'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {language === 'ro' ? 'Mese completate (7 zile)' : 'Meals Completed (7 days)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    style={{ fontSize: '12px' }}
                    domain={[0, 5]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(var(--ios-bg-primary))',
                      border: '1px solid rgb(var(--ios-border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="meals" 
                    fill="#10b981" 
                    radius={[8, 8, 0, 0]}
                    name={language === 'ro' ? 'Mese (max 5)' : 'Meals (max 5)'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {language === 'ro' ? 'Calorii consumate vs arse' : 'Calories In vs Out'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(var(--ios-bg-primary))',
                      border: '1px solid rgb(var(--ios-border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="calories" 
                    fill="#f97316" 
                    radius={[8, 8, 0, 0]}
                    name={language === 'ro' ? 'Consumate' : 'Consumed'}
                  />
                  <Bar 
                    dataKey="caloriesBurned" 
                    fill="#8b5cf6" 
                    radius={[8, 8, 0, 0]}
                    name={language === 'ro' ? 'Arse' : 'Burned'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-1 gap-6">
          <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-[rgb(var(--ios-text-primary))]">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-[14px] flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                {t('weeklyGoals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-[rgb(var(--ios-text-secondary))]">{t('completeAllMeals')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-[rgb(var(--ios-text-secondary))]">{t('drink8Glasses')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-[rgb(var(--ios-text-secondary))]">{t('recordWeightDaily')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[rgb(var(--ios-text-tertiary))]" />
                  <span className="text-sm text-[rgb(var(--ios-text-secondary))]">{t('doExercises')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
          <CardHeader>
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkIns.slice(0, 5).map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between p-3 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))] rounded-[14px]">
                  <div>
                    <div className="font-medium text-[rgb(var(--ios-text-primary))]">
                      {language === 'ro' ? 'Ziua' : 'Day'} {checkIn.day_number} - {phaseInfo[checkIn.phase].name}
                    </div>
                    <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                      {format(new Date(checkIn.date), "d MMMM yyyy", { locale: language === 'ro' ? ro : enUS })}
                    </div>
                    {checkIn.total_calories > 0 && (
                      <div className="text-sm text-orange-600 dark:text-orange-400 font-medium mt-1">
                        {checkIn.total_calories} {language === 'ro' ? 'calorii' : 'calories'}
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${phaseInfo[checkIn.phase].bgColor} ${phaseInfo[checkIn.phase].textColor}`}>
                    {language === 'ro' ? 'Faza' : 'Phase'} {checkIn.phase}
                  </div>
                </div>
              ))}
              {checkIns.length === 0 && (
                <div className="text-center py-8 text-[rgb(var(--ios-text-tertiary))]">
                  <Calendar className="w-12 h-12 mx-auto mb-3" />
                  <p>{language === 'ro' ? 'Începe programul tău astăzi!' : 'Start your program today!'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
