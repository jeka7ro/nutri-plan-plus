import React, { useState, useEffect, useMemo } from "react";
import localApi from "@/api/localClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Shuffle,
  Save,
  X
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { ro } from "date-fns/locale";
import { useLanguage } from "../components/LanguageContext";

export default function Calendar() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingCheckIn, setEditingCheckIn] = useState(null);
  const [showQuickActionDialog, setShowQuickActionDialog] = useState(false);
  const [pendingDay, setPendingDay] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

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
      console.log('📡 CALENDAR - SALVEZ în PostgreSQL:', data);
      const result = await localApi.checkins.upsert(data);
      console.log('✅ CALENDAR - SALVAT cu succes:', result);
      return result;
    },
    onSuccess: (newData) => {
      queryClient.invalidateQueries(['allCheckIns']);
      queryClient.setQueryData(['checkIn', newData.date], newData);
      setEditingCheckIn(null);
      setSelectedDay(null);
    },
  });

  const getCurrentPhase = (dayNumber) => {
    const cycle = ((dayNumber - 1) % 7);
    if (cycle < 2) return 1; // Zile 1-2
    if (cycle < 4) return 2; // Zile 3-4
    return 3; // Zile 5-7
  };

  const getDateForDay = (dayNumber) => {
    if (!user?.start_date) return new Date();
    const startDate = new Date(user.start_date);
    return addDays(startDate, dayNumber - 1);
  };

  const getDayStatus = (dayNumber) => {
    if (!user?.start_date) return 'future';
    
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
      console.error('❌ Eroare la marcarea zilei complete:', error);
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
      console.error('❌ Eroare la ștergerea datelor:', error);
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
      r.phase === phase && r.meal_type === mealType
    );
    
    if (availableRecipes.length === 0) return;
    
    const randomRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
    const optionName = language === 'ro' ? randomRecipe.name_ro : randomRecipe.name_en;
    
    setEditingCheckIn(prev => ({
      ...prev,
      [mealKey]: optionName,
      [`${mealType}_image`]: randomRecipe.image_url,
      [`${mealType}_calories`]: randomRecipe.calories,
    }));
  };

  const handleSave = () => {
    if (!editingCheckIn) return;
    
    console.log('💾 SALVEZ CALENDAR PENTRU:', editingCheckIn.date);
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

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
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
                        {language === 'ro' ? '✅ Marchează Completă' : '✅ Mark Complete'}
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
                    <X className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-bold">
                        {language === 'ro' ? '🗑️ Șterge Tot' : '🗑️ Clear All'}
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
                className="w-full"
              >
                {language === 'ro' ? '✏️ Editare Manuală' : '✏️ Manual Edit'}
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
                              <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                                ✓ {selectedOption}
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
                <div className="text-xs text-[rgb(var(--ios-text-tertiary))] text-center pt-2 border-t border-[rgb(var(--ios-border))]">
                  💾 {language === 'ro' 
                    ? 'Modificările se salvează automat în baza de date PostgreSQL' 
                    : 'Changes are automatically saved to PostgreSQL database'}
                </div>
              </div>
            )}
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

