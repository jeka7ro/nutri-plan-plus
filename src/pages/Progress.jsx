
import React, { useState, useEffect } from "react";
import localApi from "@/api/localClient";
import { api as base44 } from "@/api/apiAdapter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Droplets, UtensilsCrossed, Dumbbell, Target, Calendar, Award, Flame } from "lucide-react";
import { format, differenceInDays, subDays, parseISO } from "date-fns";
import { ro, enUS } from "date-fns/locale";
import { useLanguage } from "../components/LanguageContext";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Progress() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState('30'); // 7, 14, 30, 90 days

  const { data: weightEntries = [] } = useQuery({
    queryKey: ['weightEntries'],
    queryFn: () => base44.entities.WeightEntry.list('-date'),
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['checkIns'],
    queryFn: () => base44.entities.DailyCheckIn.list('-date'),
  });

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const periodDays = parseInt(period);
  const startDate = subDays(new Date(), periodDays - 1);

  // Filter data by period
  const filteredWeightEntries = weightEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= startDate;
  });

  const filteredCheckIns = checkIns.filter(checkIn => {
    const checkInDate = parseISO(checkIn.date);
    return checkInDate >= startDate;
  });

  // Weight Chart Data
  const weightChartData = filteredWeightEntries
    .slice()
    .reverse()
    .map(entry => ({
      date: format(parseISO(entry.date), 'MMM dd', { locale: language === 'ro' ? ro : enUS }),
      weight: entry.weight,
      target: user?.target_weight || 0
    }));

  // Calculate Statistics
  const totalWeightLost = user?.current_weight && filteredWeightEntries[0]?.weight
    ? (user.current_weight - filteredWeightEntries[0].weight).toFixed(1)
    : 0;

  const averageWaterIntake = filteredCheckIns.length > 0
    ? (filteredCheckIns.reduce((sum, c) => sum + (c.water_intake || 0), 0) / filteredCheckIns.length).toFixed(1)
    : 0;

  const totalMeals = filteredCheckIns.length * 5; // 5 meals per day
  const completedMeals = filteredCheckIns.reduce((sum, c) => {
    return sum + [
      c.breakfast_completed,
      c.snack1_completed,
      c.lunch_completed,
      c.snack2_completed,
      c.dinner_completed
    ].filter(Boolean).length;
  }, 0);
  const mealAdherence = totalMeals > 0 ? ((completedMeals / totalMeals) * 100).toFixed(0) : 0;

  const exerciseAdherence = filteredCheckIns.length > 0
    ? ((filteredCheckIns.filter(c => c.exercise_completed).length / filteredCheckIns.length) * 100).toFixed(0)
    : 0;

  const waterAdherence = filteredCheckIns.length > 0
    ? ((filteredCheckIns.filter(c => (c.water_intake || 0) >= 8).length / filteredCheckIns.length) * 100).toFixed(0)
    : 0;

  const overallAdherence = filteredCheckIns.length > 0
    ? (
        (parseFloat(mealAdherence) + parseFloat(exerciseAdherence) + parseFloat(waterAdherence)) / 3
      ).toFixed(0)
    : 0;

  // Daily completion chart data
  const dailyCompletionData = Array.from({ length: Math.min(periodDays, 30) }, (_, i) => {
    const date = subDays(new Date(), periodDays - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const checkIn = filteredCheckIns.find(c => c.date === dateStr);

    const mealsCompleted = checkIn ? [
      checkIn.breakfast_completed,
      checkIn.snack1_completed,
      checkIn.lunch_completed,
      checkIn.snack2_completed,
      checkIn.dinner_completed
    ].filter(Boolean).length : 0;

    return {
      date: format(date, 'MMM dd', { locale: language === 'ro' ? ro : enUS }),
      meals: mealsCompleted,
      water: checkIn?.water_intake || 0,
      exercise: checkIn?.exercise_completed ? 1 : 0,
      calories: checkIn?.total_calories || 0
    };
  });

  // Weekly averages
  const weeklyData = [];
  for (let i = 0; i < Math.min(Math.floor(periodDays / 7), 12); i++) {
    const weekStart = subDays(new Date(), (i + 1) * 7);
    const weekEnd = subDays(new Date(), i * 7);

    const weekCheckIns = checkIns.filter(c => {
      const date = parseISO(c.date);
      return date >= weekStart && date <= weekEnd;
    });

    if (weekCheckIns.length > 0) {
      const weekMeals = weekCheckIns.reduce((sum, c) => {
        return sum + [
          c.breakfast_completed,
          c.snack1_completed,
          c.lunch_completed,
          c.snack2_completed,
          c.dinner_completed
        ].filter(Boolean).length;
      }, 0);

      weeklyData.unshift({
        week: language === 'ro'
          ? `Săpt ${Math.floor(periodDays / 7) - i}`
          : `Week ${Math.floor(periodDays / 7) - i}`,
        meals: (weekMeals / (weekCheckIns.length * 5) * 100).toFixed(0),
        water: (weekCheckIns.filter(c => (c.water_intake || 0) >= 8).length / weekCheckIns.length * 100).toFixed(0),
        exercise: (weekCheckIns.filter(c => c.exercise_completed).length / weekCheckIns.length * 100).toFixed(0)
      });
    }
  }

  const latestWeight = filteredWeightEntries[0]?.weight || user?.current_weight || 0;
  const weightToGo = latestWeight && user?.target_weight ? (latestWeight - user.target_weight).toFixed(1) : 0;

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">
              {language === 'ro' ? 'Progresul Meu' : 'My Progress'}
            </h1>
            <p className="text-[rgb(var(--ios-text-secondary))] mt-1">
              {language === 'ro'
                ? 'Urmărește evoluția și rezultatele tale'
                : 'Track your evolution and results'}
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">
                {language === 'ro' ? 'Ultimele 7 zile' : 'Last 7 days'}
              </SelectItem>
              <SelectItem value="14">
                {language === 'ro' ? 'Ultimele 14 zile' : 'Last 14 days'}
              </SelectItem>
              <SelectItem value="30">
                {language === 'ro' ? 'Ultimele 30 zile' : 'Last 30 days'}
              </SelectItem>
              <SelectItem value="90">
                {language === 'ro' ? 'Ultimele 90 zile' : 'Last 90 days'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-[rgb(var(--ios-border))]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalWeightLost}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">kg</div>
                </div>
              </div>
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {language === 'ro' ? 'Kg pierdute' : 'Weight Lost'}
              </div>
              {weightToGo > 0 && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {language === 'ro' ? 'Mai ai' : 'To go'}: {weightToGo} kg
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-[rgb(var(--ios-border))]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{mealAdherence}%</div>
                </div>
              </div>
              <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {language === 'ro' ? 'Aderență mese' : 'Meal Adherence'}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {completedMeals}/{totalMeals} {language === 'ro' ? 'mese' : 'meals'}
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 border-[rgb(var(--ios-border))]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{averageWaterIntake}</div>
                  <div className="text-sm text-cyan-700 dark:text-cyan-300">
                    {language === 'ro' ? 'pahare' : 'glasses'}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-cyan-800 dark:text-cyan-200">
                {language === 'ro' ? 'Apă/zi (medie)' : 'Water/day (avg)'}
              </div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                {language === 'ro' ? 'Aderență' : 'Adherence'}: {waterAdherence}%
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-[rgb(var(--ios-border))]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{overallAdherence}%</div>
                </div>
              </div>
              <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                {language === 'ro' ? 'Aderență totală' : 'Overall Adherence'}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {language === 'ro' ? 'Exerciții' : 'Exercise'}: {exerciseAdherence}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Progress Chart */}
        {weightChartData.length > 0 && (
          <Card className="ios-card ios-shadow-lg rounded-[24px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {language === 'ro' ? 'Evoluția greutății' : 'Weight Progress'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={weightChartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ios-border))" />
                  <XAxis
                    dataKey="date"
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '12px' }}
                    domain={user?.target_weight ? [user.target_weight - 5, 'dataMax + 2'] : ['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--ios-bg-primary))',
                      border: '1px solid rgb(var(--ios-border))',
                      borderRadius: '12px',
                      color: 'rgb(var(--ios-text-primary))'
                    }}
                    itemStyle={{ color: 'rgb(var(--ios-text-primary))' }}
                    labelStyle={{ color: 'rgb(var(--ios-text-secondary))' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorWeight)"
                    name={language === 'ro' ? 'Greutate (kg)' : 'Weight (kg)'}
                  />
                  {user?.target_weight && (
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name={language === 'ro' ? 'Țintă' : 'Target'}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Activity Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Meals & Water */}
          <Card className="ios-card ios-shadow-lg rounded-[24px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {language === 'ro' ? 'Mese și hidratare zilnică' : 'Daily Meals & Hydration'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ios-border))" />
                  <XAxis
                    dataKey="date"
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--ios-bg-primary))',
                      border: '1px solid rgb(var(--ios-border))',
                      borderRadius: '12px',
                      color: 'rgb(var(--ios-text-primary))'
                    }}
                    itemStyle={{ color: 'rgb(var(--ios-text-primary))' }}
                    labelStyle={{ color: 'rgb(var(--ios-text-secondary))' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="meals"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name={language === 'ro' ? 'Mese (max 5)' : 'Meals (max 5)'}
                  />
                  <Bar
                    dataKey="water"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                    name={language === 'ro' ? 'Apă (pahare)' : 'Water (glasses)'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Calories & Exercise */}
          <Card className="ios-card ios-shadow-lg rounded-[24px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {language === 'ro' ? 'Calorii și exerciții' : 'Calories & Exercise'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ios-border))" />
                  <XAxis
                    dataKey="date"
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '12px' }}
                    domain={[0, 1]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--ios-bg-primary))',
                      border: '1px solid rgb(var(--ios-border))',
                      borderRadius: '12px',
                      color: 'rgb(var(--ios-text-primary))'
                    }}
                    itemStyle={{ color: 'rgb(var(--ios-text-primary))' }}
                    labelStyle={{ color: 'rgb(var(--ios-text-secondary))' }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="calories"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    name={language === 'ro' ? 'Calorii' : 'Calories'}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="exercise"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                    name={language === 'ro' ? 'Exercițiu (da/nu)' : 'Exercise (yes/no)'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Adherence */}
        {weeklyData.length > 0 && (
          <Card className="ios-card ios-shadow-lg rounded-[24px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {language === 'ro' ? 'Aderență săptămânală (%)' : 'Weekly Adherence (%)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ios-border))" />
                  <XAxis
                    dataKey="week"
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="rgb(var(--ios-text-secondary))"
                    style={{ fontSize: '12px' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--ios-bg-primary))',
                      border: '1px solid rgb(var(--ios-border))',
                      borderRadius: '12px',
                      color: 'rgb(var(--ios-text-primary))'
                    }}
                    itemStyle={{ color: 'rgb(var(--ios-text-primary))' }}
                    labelStyle={{ color: 'rgb(var(--ios-text-secondary))' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="meals"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name={language === 'ro' ? 'Mese' : 'Meals'}
                  />
                  <Line
                    type="monotone"
                    dataKey="water"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name={language === 'ro' ? 'Apă' : 'Water'}
                  />
                  <Line
                    type="monotone"
                    dataKey="exercise"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name={language === 'ro' ? 'Exerciții' : 'Exercise'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Achievements Section */}
        <Card className="ios-card ios-shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-[rgb(var(--ios-border))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              {language === 'ro' ? 'Realizări' : 'Achievements'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {parseFloat(mealAdherence) >= 80 && (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                      <UtensilsCrossed className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-900 dark:text-emerald-100">
                        {language === 'ro' ? 'Mâncare Disciplinată' : 'Meal Master'}
                      </div>
                      <div className="text-sm text-emerald-700 dark:text-emerald-300">
                        {mealAdherence}% {language === 'ro' ? 'aderență' : 'adherence'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {parseFloat(waterAdherence) >= 70 && (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-xl p-4 border-2 border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center">
                      <Droplets className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <div className="font-bold text-cyan-900 dark:text-cyan-100">
                        {language === 'ro' ? 'Campion Hidratare' : 'Hydration Hero'}
                      </div>
                      <div className="text-sm text-cyan-700 dark:text-cyan-300">
                        {waterAdherence}% {language === 'ro' ? 'zile cu 8+ pahare' : 'days with 8+ glasses'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {parseFloat(exerciseAdherence) >= 60 && (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-bold text-purple-900 dark:text-purple-100">
                        {language === 'ro' ? 'Fitness Warrior' : 'Fitness Warrior'}
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        {exerciseAdherence}% {language === 'ro' ? 'aderență exerciții' : 'exercise adherence'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {parseFloat(totalWeightLost) >= 2 && (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 dark:text-blue-100">
                        {language === 'ro' ? 'Scădere Notabilă' : 'Significant Loss'}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        {totalWeightLost} kg {language === 'ro' ? 'pierdute' : 'lost'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {parseFloat(overallAdherence) >= 75 && (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-xl p-4 border-2 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-900 dark:text-amber-100">
                        {language === 'ro' ? 'Campion Consistent' : 'Consistency Champion'}
                      </div>
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        {overallAdherence}% {language === 'ro' ? 'aderență totală' : 'overall adherence'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {filteredCheckIns.length >= 7 && (
                <div className="bg-[rgb(var(--ios-bg-primary))] rounded-xl p-4 border-2 border-pink-200 dark:border-pink-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <div className="font-bold text-pink-900 dark:text-pink-100">
                        {language === 'ro' ? 'Tracking Dedicat' : 'Dedicated Tracker'}
                      </div>
                      <div className="text-sm text-pink-700 dark:text-pink-300">
                        {filteredCheckIns.length} {language === 'ro' ? 'zile înregistrate' : 'days logged'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {[mealAdherence, waterAdherence, exerciseAdherence].every(v => parseFloat(v) < 50) && (
              <div className="text-center py-8 text-[rgb(var(--ios-text-tertiary))]">
                <Award className="w-16 h-16 mx-auto mb-4" />
                <p className="font-medium">
                  {language === 'ro'
                    ? 'Continuă să urmărești progresul pentru a debloca realizări!'
                    : 'Keep tracking your progress to unlock achievements!'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
