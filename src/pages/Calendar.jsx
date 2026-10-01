import React, { useState, useEffect, useMemo } from "react";
import localApi from "@/api/localClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Shuffle,
  Save,
  X,
  Loader2,
  Edit3,
  Trash2,
  Check,
  RotateCcw,
  Square,
  Play,
  AlertTriangle,
  CalendarDays,
  RefreshCw,
  Clock
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { ro } from "date-fns/locale";
import { useLanguage } from "../components/LanguageContext";
import { getCurrentPhase, isRecipeValidForPhase } from "../utils/phaseUtils";

export default function Calendar() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingCheckIn, setEditingCheckIn] = useState(null);
  const [showQuickActionDialog, setShowQuickActionDialog] = useState(false);
  const [pendingDay, setPendingDay] = useState(null);
  const queryClient = useQueryClient();

  // Program lifecycle modal states
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [restartStartDate, setRestartStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [clearCheckinsOnRestart, setClearCheckinsOnRestart] = useState(true);
  const [clearCheckinsOnAbandon, setClearCheckinsOnAbandon] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  // Program lifecycle status
  const hasActiveProgram = !!user?.start_date && user?.program_status !== 'abandoned';
  const startDateObj = useMemo(() => {
    return user?.start_date ? new Date(user.start_date) : null;
  }, [user?.start_date]);

  const todayObj = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const daysPassed = useMemo(() => {
    if (!startDateObj) return 0;
    const s = new Date(startDateObj);
    s.setHours(0, 0, 0, 0);
    return differenceInDays(todayObj, s) + 1;
  }, [startDateObj, todayObj]);

  const isProgramExpired = hasActiveProgram && daysPassed > 28;
  const isProgramActive = hasActiveProgram && daysPassed >= 1 && daysPassed <= 28;
  const isProgramAbandoned = user?.program_status === 'abandoned' || !user?.start_date;

  // Fetch toate check-ins pentru user
  const { data: allCheckIns = [] } = useQuery({
    queryKey: ['allCheckIns'],
    queryFn: () => localApi.checkins.list(),
    enabled: !!user,
  });

  // Fetch recipes pentru generare aleatorie
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => localApi.recipes.list(),
  });

  const updateCheckInMutation = useMutation({
    mutationFn: async (data) => {
      console.log('CALENDAR - Salvare date:', data);
      const result = await localApi.checkins.upsert(data);
      console.log('CALENDAR - Salvat cu succes:', result);
      return result;
    },
    onSuccess: (newData) => {
      queryClient.invalidateQueries(['allCheckIns']);
      queryClient.setQueryData(['checkIn', newData.date], newData);
      setEditingCheckIn(null);
      setSelectedDay(null);
    },
  });

  // Program restart action
  const handleRestartProgram = async () => {
    setIsActionLoading(true);
    try {
      const res = await localApi.program.restart(restartStartDate, clearCheckinsOnRestart);
      setUser(res.user);
      queryClient.invalidateQueries(['allCheckIns']);
      setShowRestartModal(false);
    } catch (err) {
      console.error('Error restarting program:', err);
      alert(language === 'ro' ? 'Eroare la reînceperea programului: ' + err.message : 'Error restarting program: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Program abandon action
  const handleAbandonProgram = async () => {
    setIsActionLoading(true);
    try {
      const res = await localApi.program.abandon(clearCheckinsOnAbandon);
      setUser(res.user);
      queryClient.invalidateQueries(['allCheckIns']);
      setShowAbandonModal(false);
    } catch (err) {
      console.error('Error abandoning program:', err);
      alert(language === 'ro' ? 'Eroare la abandonarea programului: ' + err.message : 'Error abandoning program: ' + err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getDateForDay = (dayNumber) => {
    if (!user?.start_date) {
      // Preview using today as Day 1
      return addDays(new Date(), dayNumber - 1);
    }
    const startDate = new Date(user.start_date);
    return addDays(startDate, dayNumber - 1);
  };

  const getDayStatus = (dayNumber) => {
    if (!hasActiveProgram) return 'future';
    
    const dayDate = getDateForDay(dayNumber);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);
    
    if (dayDate > today) return 'future';
    
    const dateStr = format(dayDate, 'yyyy-MM-dd');
    const checkIn = allCheckIns.find(c => c.date?.startsWith(dateStr));
    
    if (!checkIn) return dayDate < today ? 'incomplete' : 'today';
    
    const allMealsComplete = 
      checkIn.breakfast_completed &&
      checkIn.snack1_completed &&
      checkIn.lunch_completed &&
      checkIn.snack2_completed &&
      checkIn.dinner_completed;
    
    return allMealsComplete ? 'complete' : 'incomplete';
  };

  const days = Array.from({ length: 28 }, (_, i) => {
    const dayNumber = i + 1;
    const phase = getCurrentPhase(dayNumber);
    const status = getDayStatus(dayNumber);
    const date = getDateForDay(dayNumber);
    
    return { dayNumber, phase, status, date };
  });

  const handleDayClick = (day) => {
    const dateStr = format(day.date, 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    const isPastDay = dateStr < today;
    
    // Dacă e zi trecută, arată Quick Actions dialog
    if (isPastDay) {
      setPendingDay(day);
      setShowQuickActionDialog(true);
      return;
    }
    
    // Altfel, deschide dialogul normal de editare
    const existingCheckIn = allCheckIns.find(c => c.date?.startsWith(dateStr));
    
    setSelectedDay(day);
    setEditingCheckIn(existingCheckIn || {
      date: dateStr,
      day_number: day.dayNumber,
      phase: day.phase,
      breakfast_completed: false,
      snack1_completed: false,
      lunch_completed: false,
      snack2_completed: false,
      dinner_completed: false,
      breakfast_option: null,
      snack1_option: null,
      lunch_option: null,
      snack2_option: null,
      dinner_option: null,
    });
  };

  // QUICK ACTION: Marchează zi completă (toate mesele + exercițiu)
  const handleMarkDayComplete = async () => {
    if (!pendingDay) return;
    
    const dateStr = format(pendingDay.date, 'yyyy-MM-dd');
    const completeCheckIn = {
      date: dateStr,
      day_number: pendingDay.dayNumber,
      phase: pendingDay.phase,
      breakfast_completed: true,
      snack1_completed: true,
      lunch_completed: true,
      snack2_completed: true,
      dinner_completed: true,
      exercise_completed: true,
      breakfast_option: 'Completat manual',
      snack1_option: 'Completat manual',
      lunch_option: 'Completat manual',
      snack2_option: 'Completat manual',
      dinner_option: 'Completat manual',
      exercise_type: 'walking',
      exercise_duration: 30,
      exercise_calories_burned: 150,
      water_intake: 8,
      total_calories: 0,
      notes: language === 'ro' ? 'Zi marcată manual ca completă' : 'Day manually marked as complete',
    };
    
    try {
      await updateCheckInMutation.mutateAsync(completeCheckIn);
      setShowQuickActionDialog(false);
      setPendingDay(null);
    } catch (error) {
      console.error('Eroare la marcarea zilei complete:', error);
      alert(language === 'ro' ? 'Eroare la salvare' : 'Error saving');
    }
  };

  // QUICK ACTION: Șterge toate datele zilei
  const handleClearDay = async () => {
    if (!pendingDay) return;
    
    const dateStr = format(pendingDay.date, 'yyyy-MM-dd');
    const emptyCheckIn = {
      date: dateStr,
      day_number: pendingDay.dayNumber,
      phase: pendingDay.phase,
      breakfast_completed: false,
      snack1_completed: false,
      lunch_completed: false,
      snack2_completed: false,
      dinner_completed: false,
      exercise_completed: false,
      breakfast_option: null,
      snack1_option: null,
      lunch_option: null,
      snack2_option: null,
      dinner_option: null,
      breakfast_image: null,
      snack1_image: null,
      lunch_image: null,
      snack2_image: null,
      dinner_image: null,
      breakfast_calories: 0,
      snack1_calories: 0,
      lunch_calories: 0,
      snack2_calories: 0,
      dinner_calories: 0,
      exercise_type: null,
      exercise_duration: 0,
      exercise_calories_burned: 0,
      water_intake: 0,
      total_calories: 0,
      notes: '',
    };
    
    try {
      await updateCheckInMutation.mutateAsync(emptyCheckIn);
      setShowQuickActionDialog(false);
      setPendingDay(null);
    } catch (error) {
      console.error('Eroare la ștergerea datelor:', error);
      alert(language === 'ro' ? 'Eroare la salvare' : 'Error saving');
    }
  };

  // Helper: Deschide dialogul normal de editare (dacă user alege "Editare manuală")
  const handleOpenEditDialog = () => {
    if (!pendingDay) return;
    
    const dateStr = format(pendingDay.date, 'yyyy-MM-dd');
    const existingCheckIn = allCheckIns.find(c => c.date?.startsWith(dateStr));
    
    setSelectedDay(pendingDay);
    setEditingCheckIn(existingCheckIn || {
      date: dateStr,
      day_number: pendingDay.dayNumber,
      phase: pendingDay.phase,
      breakfast_completed: false,
      snack1_completed: false,
      lunch_completed: false,
      snack2_completed: false,
      dinner_completed: false,
      breakfast_option: null,
      snack1_option: null,
      lunch_option: null,
      snack2_option: null,
      dinner_option: null,
    });
    
    setShowQuickActionDialog(false);
    setPendingDay(null);
  };

  const handleMealToggle = (mealKey) => {
    setEditingCheckIn(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey]
    }));
  };

  const handleRandomMeal = (mealType, mealKey) => {
    const phase = selectedDay.phase;
    const availableRecipes = recipes.filter(r => 
      r.meal_type === mealType && isRecipeValidForPhase(r, phase)
    );
    
    if (availableRecipes.length === 0) return;
    
    const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    const optionName = language === 'ro' 
      ? (randomRecipe.name_ro || randomRecipe.name) 
      : (randomRecipe.name_en || randomRecipe.name);
    
    setEditingCheckIn(prev => ({
      ...prev,
      [mealKey]: optionName,
      [`${mealType}_image`]: randomRecipe.image_url,
      [`${mealType}_calories`]: randomRecipe.calories,
    }));
  };

  const handleSave = () => {
    if (!editingCheckIn) return;
    
    console.log('Salvare calendar pentru:', editingCheckIn.date);
    updateCheckInMutation.mutate({
      ...editingCheckIn,
      date: format(selectedDay.date, 'yyyy-MM-dd'),
      day_number: selectedDay.dayNumber,
      phase: selectedDay.phase,
    });
  };

  const statusColors = {
    complete: 'bg-emerald-500 text-white border-emerald-600',
    incomplete: 'bg-red-500/20 text-red-400 border-red-600',
    today: 'bg-blue-500 text-white border-blue-600',
    future: 'bg-gray-700 text-gray-400 border-gray-600',
  };

  const statusIcons = {
    complete: <CheckCircle2 className="w-4 h-4" />,
    incomplete: <Circle className="w-4 h-4" />,
    today: <Circle className="w-4 h-4 fill-current" />,
    future: <Circle className="w-4 h-4" />,
  };

  const meals = [
    { key: 'breakfast_completed', optionKey: 'breakfast_option', type: 'breakfast', label: language === 'ro' ? 'Mic dejun' : 'Breakfast' },
    { key: 'snack1_completed', optionKey: 'snack1_option', type: 'snack1', label: language === 'ro' ? 'Gustare 1' : 'Snack 1' },
    { key: 'lunch_completed', optionKey: 'lunch_option', type: 'lunch', label: language === 'ro' ? 'Prânz' : 'Lunch' },
    { key: 'snack2_completed', optionKey: 'snack2_option', type: 'snack2', label: language === 'ro' ? 'Gustare 2' : 'Snack 2' },
    { key: 'dinner_completed', optionKey: 'dinner_option', type: 'dinner', label: language === 'ro' ? 'Cină' : 'Dinner' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Se încarcă...
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Verificăm datele tale...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Program Lifecycle Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">
              {language === 'ro' ? 'Calendar Program (28 Zile)' : 'Program Calendar (28 Days)'}
            </h1>
            <p className="text-[rgb(var(--ios-text-secondary))] mt-1">
              {language === 'ro' 
                ? 'Selectează o zi pentru a marca mesele ca fiind completate' 
                : 'Select a day to mark meals as completed'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setRestartStartDate(format(new Date(), 'yyyy-MM-dd'));
                setShowRestartModal(true);
              }}
              className="btn-pill-green rounded-full px-5 h-10 shadow-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {language === 'ro' ? 'Ciclu Nou (28 Zile)' : 'New Cycle (28 Days)'}
            </Button>
            {hasActiveProgram && (
              <Button
                variant="outline"
                onClick={() => setShowAbandonModal(true)}
                className="rounded-full px-4 h-10 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
              >
                <Square className="w-4 h-4 mr-1.5" />
                {language === 'ro' ? 'Abandonează Programul' : 'Abandon Program'}
              </Button>
            )}
          </div>
        </div>

        {/* Program Lifecycle Banner */}
        {isProgramExpired && (
          <Card className="rounded-[20px] border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 dark:to-transparent p-5 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-semibold px-2.5 py-0.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {language === 'ro' ? 'Program Neterminat / Expirat' : 'Unfinished / Expired Program'}
                  </Badge>
                  {startDateObj && (
                    <span className="text-xs text-[rgb(var(--ios-text-secondary))] font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(startDateObj, 'd MMM yyyy', { locale: ro })} — {format(addDays(startDateObj, 27), 'd MMM yyyy', { locale: ro })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[rgb(var(--ios-text-primary))] font-medium">
                  {language === 'ro' 
                    ? 'Programul anterior a depășit cele 28 de zile și a rămas neterminat. Poți încheia/abandona ciclul vechi sau poți începe unul nou de azi.' 
                    : 'The previous 28-day program expired and remained unfinished. You can abandon the old cycle or start a fresh one today.'}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <Button
                  onClick={() => {
                    setRestartStartDate(format(new Date(), 'yyyy-MM-dd'));
                    setShowRestartModal(true);
                  }}
                  className="btn-pill-green rounded-full px-5 h-9 text-xs shadow-sm font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  {language === 'ro' ? 'Începe de Azi' : 'Start Today'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAbandonModal(true)}
                  className="rounded-full px-3.5 h-9 text-xs border-[rgb(var(--ios-border))] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Square className="w-3.5 h-3.5 mr-1" />
                  {language === 'ro' ? 'Abandonează' : 'Abandon'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isProgramAbandoned && (
          <Card className="rounded-[20px] border-blue-500/40 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-950/40 dark:via-blue-950/20 dark:to-transparent p-5 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40 font-semibold px-2.5 py-0.5">
                    {language === 'ro' ? 'Fără Program Activ' : 'No Active Program'}
                  </Badge>
                </div>
                <p className="text-sm text-[rgb(var(--ios-text-primary))] font-medium">
                  {language === 'ro'
                    ? 'Programul anterior a fost oprit/abandonat. Când ești pregătit, pornește un nou ciclu de 28 de zile.'
                    : 'The previous program was stopped/abandoned. When ready, start a new 28-day cycle.'}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <Button
                  onClick={() => {
                    setRestartStartDate(format(new Date(), 'yyyy-MM-dd'));
                    setShowRestartModal(true);
                  }}
                  className="btn-pill-green rounded-full px-5 h-9 text-xs shadow-sm font-semibold"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  {language === 'ro' ? 'Începe ciclu nou (28 Zile)' : 'Start 28-Day Cycle'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isProgramActive && (
          <Card className="rounded-[20px] border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/30 dark:to-transparent p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold px-2.5 py-0.5">
                  {language === 'ro' ? `Ziua ${daysPassed} din 28` : `Day ${daysPassed} of 28`}
                </Badge>
                {startDateObj && (
                  <span className="text-xs text-[rgb(var(--ios-text-secondary))] font-medium">
                    {format(startDateObj, 'd MMM yyyy', { locale: ro })} — {format(addDays(startDateObj, 27), 'd MMM yyyy', { locale: ro })}
                  </span>
                )}
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {language === 'ro' ? 'Program în derulare activă' : 'Active program in progress'}
              </span>
            </div>
          </Card>
        )}

        {/* Legend */}
        <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                <span className="text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Complet (toate mesele)' : 'Complete (all meals)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500/20 border-2 border-red-600"></div>
                <span className="text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Necomplet (zi trecută)' : 'Incomplete (past day)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500"></div>
                <span className="text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Zi viitoare' : 'Future day'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Ziua Selectată' : 'Selected day'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
          {days.map((day) => {
            const isSelected = selectedDay?.dayNumber === day.dayNumber;
            
            return (
              <Card
                key={day.dayNumber}
                className={`ios-card cursor-pointer hover:shadow-xl transition-all ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                } ${statusColors[day.status]}`}
                onClick={() => handleDayClick(day)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-xs mb-1 opacity-75">
                    {format(day.date, 'd MMM', { locale: ro })}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {day.dayNumber}
                  </div>
                  {isSelected ? (
                    <div className="text-xs font-semibold">
                      {language === 'ro' ? 'SELECTAT' : 'SELECTED'}
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      {statusIcons[day.status]}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions Dialog (pentru zile trecute) */}
        <Dialog open={showQuickActionDialog} onOpenChange={setShowQuickActionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {language === 'ro' ? 'Zi Trecută' : 'Past Day'} - {pendingDay && format(pendingDay.date, 'd MMMM yyyy', { locale: ro })}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              <p className="text-sm text-[rgb(var(--ios-text-secondary))] mb-4">
                {language === 'ro' 
                  ? 'Alege o acțiune rapidă sau editează manual:' 
                  : 'Choose a quick action or edit manually:'}
              </p>

              {/* Marchează Zi Completă */}
              <Button
                onClick={handleMarkDayComplete}
                className="w-full h-auto py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                disabled={updateCheckInMutation.isPending}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-bold">
                        {language === 'ro' ? 'Marchează Completă' : 'Mark Complete'}
                      </div>
                      <div className="text-xs opacity-90">
                        {language === 'ro' ? 'Toate mesele + exercițiu bifate' : 'All meals + exercise checked'}
                      </div>
                    </div>
                  </div>
                </div>
              </Button>

              {/* Șterge Tot */}
              <Button
                onClick={handleClearDay}
                variant="destructive"
                className="w-full h-auto py-4"
                disabled={updateCheckInMutation.isPending}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-bold">
                        {language === 'ro' ? 'Șterge Tot' : 'Clear All'}
                      </div>
                      <div className="text-xs opacity-90">
                        {language === 'ro' ? 'Resetează ziua completă' : 'Reset entire day'}
                      </div>
                    </div>
                  </div>
                </div>
              </Button>

              {/* Editare Manuală */}
              <Button
                onClick={handleOpenEditDialog}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{language === 'ro' ? 'Editare Manuală' : 'Manual Edit'}</span>
              </Button>

              {/* Cancel */}
              <Button
                onClick={() => {
                  setShowQuickActionDialog(false);
                  setPendingDay(null);
                }}
                variant="ghost"
                className="w-full"
              >
                {language === 'ro' ? 'Anulează' : 'Cancel'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {language === 'ro' ? 'Ziua' : 'Day'} {selectedDay?.dayNumber} - {selectedDay && format(selectedDay.date, 'EEEE, d MMMM yyyy', { locale: ro })}
              </DialogTitle>
              <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                Faza {selectedDay?.phase} • 
                {selectedDay?.phase === 1 && (language === 'ro' ? ' Destresare' : ' Unwind')}
                {selectedDay?.phase === 2 && (language === 'ro' ? ' Deblocare' : ' Unlock')}
                {selectedDay?.phase === 3 && (language === 'ro' ? ' Ardere' : ' Unleash')}
              </div>
            </DialogHeader>

            {editingCheckIn && (
              <div className="space-y-4 mt-4">
                {/* Meals List */}
                {meals.map((meal) => {
                  const isCompleted = editingCheckIn[meal.key];
                  const selectedOption = editingCheckIn[meal.optionKey];
                  
                  return (
                    <div key={meal.key} className="p-4 bg-[rgb(var(--ios-bg-tertiary))] rounded-[14px] border border-[rgb(var(--ios-border))]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => handleMealToggle(meal.key)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-600' 
                                : 'border-gray-400 dark:border-gray-600'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                              {meal.label}
                            </div>
                            {selectedOption && (
                              <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>{selectedOption}</span>
                              </div>
                            )}
                            {!selectedOption && (
                              <div className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">
                                {language === 'ro' ? 'Nicio opțiune selectată' : 'No option selected'}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRandomMeal(meal.type, meal.optionKey)}
                          className="flex-shrink-0"
                        >
                          <Shuffle className="w-4 h-4 mr-1" />
                          {language === 'ro' ? 'Aleatoriu' : 'Random'}
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Save/Cancel Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDay(null);
                      setEditingCheckIn(null);
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {language === 'ro' ? 'Anulează' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateCheckInMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateCheckInMutation.isPending 
                      ? (language === 'ro' ? 'Se salvează...' : 'Saving...') 
                      : (language === 'ro' ? 'Salvează' : 'Save')}
                  </Button>
                </div>

                {/* Info */}
                <div className="text-xs text-[rgb(var(--ios-text-tertiary))] text-center pt-2 border-t border-[rgb(var(--ios-border))] flex items-center justify-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {language === 'ro' 
                      ? 'Modificările se salvează automat în baza de date locală' 
                      : 'Changes are automatically saved to database'}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL: START / RESTART PROGRAM (28 ZILE) */}
        <Dialog open={showRestartModal} onOpenChange={setShowRestartModal}>
          <DialogContent className="max-w-md rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {language === 'ro' ? 'Începe un ciclu nou (28 Zile)' : 'Start a New 28-Day Cycle'}
              </DialogTitle>
              <DialogDescription>
                {language === 'ro'
                  ? 'Setează data de început pentru noul tău program de 28 de zile (Fast Metabolism Diet).'
                  : 'Set the starting date for your new 28-day program (Fast Metabolism Diet).'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="space-y-2">
                <Label htmlFor="restart-date" className="text-sm font-semibold text-[rgb(var(--ios-text-primary))]">
                  {language === 'ro' ? 'Data de început (Ziua 1)' : 'Start Date (Day 1)'}
                </Label>
                <Input
                  id="restart-date"
                  type="date"
                  value={restartStartDate}
                  onChange={(e) => setRestartStartDate(e.target.value)}
                  className="rounded-xl border-[rgb(var(--ios-border))]"
                />
                <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                  {language === 'ro' ? 'Implicit este selectată data de azi.' : 'Today is selected by default.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-[rgb(var(--ios-border))] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="clear-checkins-restart"
                  checked={clearCheckinsOnRestart}
                  onChange={(e) => setClearCheckinsOnRestart(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="clear-checkins-restart" className="text-xs text-[rgb(var(--ios-text-secondary))] cursor-pointer">
                  <span className="font-semibold text-[rgb(var(--ios-text-primary))] block">
                    {language === 'ro' ? 'Start curat (recomandat)' : 'Clean start (recommended)'}
                  </span>
                  {language === 'ro'
                    ? 'Șterge bifele și mesele din ciclul anterior pentru a începe cu un calendar proaspăt.'
                    : 'Clear meal check-ins from the previous cycle to start with a fresh calendar.'}
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-[rgb(var(--ios-border))]">
              <Button
                variant="outline"
                onClick={() => setShowRestartModal(false)}
                disabled={isActionLoading}
                className="rounded-full px-5"
              >
                {language === 'ro' ? 'Anulează' : 'Cancel'}
              </Button>
              <Button
                onClick={handleRestartProgram}
                disabled={isActionLoading || !restartStartDate}
                className="btn-pill-green rounded-full px-5 shadow-sm"
              >
                {isActionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ro' ? 'Se pornește...' : 'Starting...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    {language === 'ro' ? 'Pornește Ciclul' : 'Start Cycle'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: ABANDON PROGRAM */}
        <Dialog open={showAbandonModal} onOpenChange={setShowAbandonModal}>
          <DialogContent className="max-w-md rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-red-600 dark:text-red-400">
                <Square className="w-5 h-5" />
                {language === 'ro' ? 'Abandonează / Încheie Programul' : 'Abandon / End Program'}
              </DialogTitle>
              <DialogDescription>
                {language === 'ro'
                  ? 'Programul tău curent va fi oprit așa cum a rămas (neterminat). Nu vei mai avea un ciclu activ.'
                  : 'Your current program will be stopped as it was left (unfinished). You will no longer have an active cycle.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-1 text-xs text-red-700 dark:text-red-300">
                <div className="font-semibold text-sm">
                  {language === 'ro' ? 'Ce se va întâmpla:' : 'What will happen:'}
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>{language === 'ro' ? 'Ciclul vechi este arhivat ca abandonat/încheiat.' : 'The old cycle is archived as abandoned/ended.'}</li>
                  <li>{language === 'ro' ? 'Zilele trecute nu vor mai fi marcate cu erori roșii.' : 'Past days will no longer show red incomplete errors.'}</li>
                  <li>{language === 'ro' ? 'Poți începe oricând un ciclu nou de la Ziua 1.' : 'You can start a new cycle from Day 1 at any time.'}</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-[rgb(var(--ios-border))] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="clear-checkins-abandon"
                  checked={clearCheckinsOnAbandon}
                  onChange={(e) => setClearCheckinsOnAbandon(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="clear-checkins-abandon" className="text-xs text-[rgb(var(--ios-text-secondary))] cursor-pointer">
                  <span className="font-semibold text-[rgb(var(--ios-text-primary))] block">
                    {language === 'ro' ? 'Curăță istoricul meselor din acest program' : 'Clear meal history from this program'}
                  </span>
                  {language === 'ro'
                    ? 'Opțional: elimină bifele de mese asociate acestui ciclu abandonat.'
                    : 'Optional: clear meal check-ins associated with this abandoned cycle.'}
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-[rgb(var(--ios-border))]">
              <Button
                variant="outline"
                onClick={() => setShowAbandonModal(false)}
                disabled={isActionLoading}
                className="rounded-full px-5"
              >
                {language === 'ro' ? 'Anulează' : 'Cancel'}
              </Button>
              <Button
                onClick={handleAbandonProgram}
                disabled={isActionLoading}
                className="rounded-full px-5 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm"
              >
                {isActionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ro' ? 'Se procesează...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 mr-1.5" />
                    {language === 'ro' ? 'Confirmă Abandonarea' : 'Confirm Abandon'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Info */}
        <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
          <CardContent className="p-6 text-center text-[rgb(var(--ios-text-secondary))]">
            {language === 'ro' 
              ? 'Calendarul afișează progresul pe întregul ciclu de 28 de zile. Click pe o zi pentru a o edita.' 
              : 'Calendar displays progress for the entire 28-day cycle. Click on a day to edit it.'}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

