
import React, { useState, useEffect } from "react";
import localApi from "@/api/localClient";
const base44 = localApi; // Pentru compatibilitate
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scale, TrendingDown, TrendingUp, Target, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeightTracking() {
  const [user, setUser] = useState(null);
  const [weight, setWeight] = useState("");
  const [mood, setMood] = useState("normal");
  const [notes, setNotes] = useState("");
  const [flashColor, setFlashColor] = useState(null); // 'red', 'green', null pentru animație subtilă
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: weightEntries = [] } = useQuery({
    queryKey: ['weightEntries'],
    queryFn: () => localApi.weight.list(),
  });

  // PRE-POPULEAZĂ greutatea cu ultima valoare salvată
  useEffect(() => {
    if (weightEntries.length > 0 && !weight) {
      const lastWeight = weightEntries[0].weight;
      setWeight(lastWeight.toFixed(1));
      console.log('✅ Pre-populat greutate:', lastWeight);
    } else if (user?.current_weight && !weight && weightEntries.length === 0) {
      setWeight(parseFloat(user.current_weight).toFixed(1));
      console.log('✅ Pre-populat greutate din profil:', user.current_weight);
    }
  }, [weightEntries, user, weight]);

  const addWeightMutation = useMutation({
    mutationFn: async (data) => {
      await localApi.weight.add({
        weight: data.weight,
        date: data.date,
        notes: data.notes,
        mood: data.mood,
      });
      if (user && !user.current_weight) {
        await localApi.auth.updateProfile({ current_weight: data.weight });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['weightEntries']);
      setWeight("");
      setNotes("");
      setMood("normal");
      toast({
        title: "Greutate salvată!",
        description: "Înregistrarea ta a fost adăugată cu succes.",
        duration: 3000,
      });
    },
  });

  const deleteWeightMutation = useMutation({
    mutationFn: async (id) => {
      await localApi.weight.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['weightEntries']);
      toast({
        title: "Înregistrare ștearsă!",
        description: "Greutatea a fost ștearsă din istoric.",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut șterge înregistrarea.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleDecrement = () => {
    const newWeight = Math.max(0, (parseFloat(weight) || 0) - 0.1).toFixed(1); // 0.1 increment!
    setWeight(newWeight);
    setFlashColor('green'); // VERDE = scade = BUN
    setTimeout(() => setFlashColor(null), 800);
    console.log('🟢 MINUS: Greutate scade cu 0.1 kg');
  };

  const handleIncrement = () => {
    const newWeight = ((parseFloat(weight) || 0) + 0.1).toFixed(1); // 0.1 increment!
    setWeight(newWeight);
    setFlashColor('red'); // ROȘU = crește = RĂU
    setTimeout(() => setFlashColor(null), 800);
    console.log('🔴 PLUS: Greutate crește cu 0.1 kg');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight) {
      toast({
        title: "Completează greutatea",
        description: "Te rog introdu greutatea înainte de a salva.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // FIX: Convertește virgula în punct pentru parseFloat!
    const weightValue = parseFloat(String(weight).replace(',', '.'));
    
    console.log('💾 Saving weight:', weight, '→', weightValue);
    
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Greutate invalidă",
        description: "Te rog introdu o greutate validă.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    addWeightMutation.mutate({
      weight: weightValue,
      date: format(new Date(), 'yyyy-MM-dd'),
      mood,
      notes
    });
  };

  const chartData = weightEntries
    .slice()
    .reverse()
    .slice(-14)
    .map(entry => ({
      date: format(new Date(entry.date), 'dd MMM', { locale: ro }),
      weight: entry.weight
    }));

  const latestWeight = weightEntries[0];
  const previousWeight = weightEntries[1];
  const weightChange = latestWeight && previousWeight 
    ? (latestWeight.weight - previousWeight.weight).toFixed(1)
    : 0;

  const totalWeightLost = user?.current_weight && latestWeight?.weight
    ? (user.current_weight - latestWeight.weight).toFixed(1)
    : 0;

  const remainingWeight = latestWeight?.weight && user?.target_weight
    ? (latestWeight.weight - user.target_weight).toFixed(1)
    : 0;

  const moodEmojis = {
    excelent: "🤩",
    bine: "😊",
    normal: "😐",
    obosit: "😴",
    slab: "😞"
  };

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">Monitorizare Greutate</h1>
          <p className="text-[rgb(var(--ios-text-secondary))] mt-1">Urmărește-ți progresul zilnic</p>
        </div>

        {/* 3 Carduri de Aceeași Dimensiune */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Greutate Curentă */}
          <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-[rgb(var(--ios-border))]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Greutate curentă</span>
                <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {latestWeight?.weight || user?.current_weight || '-'} kg
              </div>
              {weightChange !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  weightChange < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {weightChange < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {Math.abs(weightChange)} kg față de ultima înregistrare
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Total Pierdut + Până la Țintă COMBINAT */}
          <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-purple-50 dark:from-emerald-900/30 dark:via-teal-900/30 dark:to-purple-900/30 border-[rgb(var(--ios-border))]">
            <CardContent className="p-6">
              <div className="space-y-3">
                {/* Total Pierdut */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">📉 Total pierdut</span>
                  <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{totalWeightLost} kg</span>
                </div>
                {/* Separator */}
                <div className="h-px bg-gradient-to-r from-emerald-300 via-teal-300 to-purple-300 dark:from-emerald-700 dark:via-teal-700 dark:to-purple-700"></div>
                {/* Până la Țintă */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">🎯 Până la țintă</span>
                  <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">{remainingWeight > 0 ? remainingWeight : '0'} kg</span>
                </div>
              </div>
              <div className="text-xs text-center text-gray-600 dark:text-gray-400 mt-3">
                Țintă: {user?.target_weight ? parseFloat(user.target_weight).toFixed(1) : '-'} kg
              </div>
            </CardContent>
          </Card>

          {/* Card 3: IMC */}
          {(() => {
            const height = user?.height ? parseFloat(user.height) / 100 : null;
            const currentWeight = latestWeight?.weight || user?.current_weight || null;
            const bmi = height && currentWeight ? (currentWeight / (height * height)) : null;
            
            let bmiCategory = '';
            let bmiColor = '';
            let bmiGradient = '';
            
            if (bmi) {
              if (bmi < 18.5) {
                bmiCategory = 'Subponderal';
                bmiColor = 'text-orange-700 dark:text-orange-300';
                bmiGradient = 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30';
              } else if (bmi >= 18.5 && bmi < 25) {
                bmiCategory = 'Normal';
                bmiColor = 'text-green-700 dark:text-green-300';
                bmiGradient = 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30';
              } else if (bmi >= 25 && bmi < 30) {
                bmiCategory = 'Supraponderal';
                bmiColor = 'text-yellow-700 dark:text-yellow-300';
                bmiGradient = 'from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30';
              } else {
                bmiCategory = 'Obezitate';
                bmiColor = 'text-red-700 dark:text-red-300';
                bmiGradient = 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30';
              }
            }
            
            return bmi ? (
              <Card className={`ios-card ios-shadow-lg bg-gradient-to-br ${bmiGradient} border-[rgb(var(--ios-border))]`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium ${bmiColor}">IMC</span>
                    <Target className="w-5 h-5 ${bmiColor}" />
                  </div>
                  <div className={`text-3xl font-bold ${bmiColor}`}>
                    {bmi.toFixed(1)}
                  </div>
                  <div className={`text-sm ${bmiColor} mt-2`}>
                    {bmiCategory}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {height && `${(height * 100).toFixed(0)} cm`}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-[rgb(var(--ios-border))]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IMC</span>
                    <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    -
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Completează înălțimea în profil
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>

        {/* Smart Weight Widget - iOS Style */}
        <Card className="ios-card ios-shadow-lg rounded-[24px] border-[rgb(var(--ios-border))] overflow-hidden bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header: Date + Prediction */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[rgb(var(--ios-text-tertiary))] text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(), 'EEEE, d MMMM yyyy', { locale: ro })}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">
                    Înregistrare greutate
                  </h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {latestWeight ? latestWeight.weight.toFixed(1) : user?.current_weight || '-'} kg
                  </span>
                </div>
              </div>

              {/* GREUTATEA IDEALĂ (bazată pe înălțime, vârstă, sex) */}
              {(() => {
                // Calculăm greutatea ideală bazată pe BMI sănătos (20-25)
                const height = user?.height ? parseFloat(user.height) / 100 : null; // cm -> m
                const age = user?.birth_date ? new Date().getFullYear() - new Date(user.birth_date).getFullYear() : null;
                const gender = user?.gender || 'other';
                
                if (!height || height < 1.2 || height > 2.5) {
                  return (
                    <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-[16px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-emerald-900 dark:text-emerald-100">🎯 Greutatea ta ideală</span>
                      </div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        💡 Completează înălțimea în profil pentru a vedea greutatea ta ideală!
                      </p>
                    </div>
                  );
                }
                
                // BMI sănătos: 20-25 (ajustat ușor pentru vârstă/sex)
                let minBMI = 20;
                let maxBMI = 25;
                
                // Ajustări pentru vârstă (opțional)
                if (age && age > 50) {
                  minBMI = 21; // Peste 50 ani, BMI ușor mai mare e OK
                  maxBMI = 26;
                }
                
                const idealWeightMin = (minBMI * height * height).toFixed(1);
                const idealWeightMax = (maxBMI * height * height).toFixed(1);
                const currentWeight = latestWeight?.weight || user?.current_weight || 0;
                const currentBMI = currentWeight / (height * height);
                
                let message = '';
                let emoji = '';
                
                if (currentBMI < minBMI) {
                  emoji = '⬆️';
                  message = `Ești sub greutatea ideală. Ar fi sănătos să ajungi în range-ul ${idealWeightMin}-${idealWeightMax} kg.`;
                } else if (currentBMI > maxBMI) {
                  emoji = '⬇️';
                  message = `Ai depășit greutatea ideală. Obiectivul tău de ${user?.target_weight || idealWeightMin} kg e excelent!`;
                } else {
                  emoji = '✅';
                  message = `Felicitări! Ești în range-ul sănătos (IMC ${currentBMI.toFixed(1)}). Menține-te!`;
                }

                return (
                  <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-[16px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-emerald-900 dark:text-emerald-100">🎯 Greutatea ta ideală</span>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                      {emoji} {message}
                    </p>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg">
                      💚 Range sănătos (IMC 20-25): <strong>{idealWeightMin}-{idealWeightMax} kg</strong>
                      {age && ` • Vârstă: ${age} ani`}
                      {height && ` • Înălțime: ${(height * 100).toFixed(0)} cm`}
                    </div>
                  </div>
                );
              })()}

              {/* Weight Input - Centered & Prominent */}
              <div className="space-y-3">
                <Label htmlFor="weight" className="text-center block text-[rgb(var(--ios-text-primary))] font-semibold">
                  Greutatea de astăzi
                </Label>
                  
                {/* Mobile & Desktop: iOS-style increment/decrement cu ANIMAȚIE CULOARE + MAGIE ✨ */}
                <div className="flex items-center justify-center gap-4 md:gap-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                    className="h-14 w-14 md:h-16 md:w-16 rounded-full border-2 border-blue-300 dark:border-blue-700 bg-[rgb(var(--ios-bg-tertiary))] hover:bg-blue-50 dark:hover:bg-blue-900/50 active:scale-95 transition-all"
                        onClick={handleDecrement}
                      >
                    <span className="text-3xl md:text-4xl font-light text-blue-600 dark:text-blue-400">−</span>
                      </Button>
                      
                  <div className="text-center relative">
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="75.5"
                      className={`text-center text-4xl md:text-7xl font-bold h-20 md:h-28 w-32 md:w-56 border-2 bg-white dark:bg-gray-900 rounded-[16px] transition-all duration-800 ${
                        flashColor === 'red' 
                          ? 'ring-8 ring-red-500/50 border-red-500 text-red-600 dark:text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-105' 
                          : flashColor === 'green'
                          ? 'ring-8 ring-green-500/50 border-green-500 text-green-600 dark:text-green-400 shadow-[0_0_40px_rgba(34,197,94,0.6)] scale-105'
                          : 'border-blue-300 dark:border-blue-700 text-[rgb(var(--ios-text-primary))] shadow-lg scale-100'
                      }`}
                    />
                    <p className="text-sm md:text-base text-[rgb(var(--ios-text-tertiary))] mt-2 font-medium">kilogramе</p>
                  </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                    className="h-14 w-14 md:h-16 md:w-16 rounded-full border-2 border-blue-300 dark:border-blue-700 bg-[rgb(var(--ios-bg-tertiary))] hover:bg-blue-50 dark:hover:bg-blue-900/50 active:scale-95 transition-all"
                        onClick={handleIncrement}
                      >
                    <span className="text-3xl md:text-4xl font-light text-blue-600 dark:text-blue-400">+</span>
                      </Button>
                </div>
              </div>

              {/* Notes - Compact */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[rgb(var(--ios-text-primary))] text-sm">Notițe (opțional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observații despre zi, mâncare, exerciții..."
                  rows={2}
                  className="border-[rgb(var(--ios-border))] rounded-[12px] text-sm"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-[16px] text-white font-semibold shadow-lg active:scale-95 transition-all"
                disabled={addWeightMutation.isPending}
              >
                <Scale className="w-5 h-5 mr-2" />
                {addWeightMutation.isPending ? 'Se salvează...' : 'Salvează înregistrarea'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="ios-card ios-shadow-lg rounded-[24px] border-[rgb(var(--ios-border))]">
            <CardHeader>
              <CardTitle className="text-[rgb(var(--ios-text-primary))]">Evoluția ultimele 14 zile</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--ios-bg-primary))', border: '1px solid rgb(var(--ios-border))', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card className="ios-card ios-shadow-lg rounded-[24px] border-[rgb(var(--ios-border))]">
          <CardHeader>
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">Istoric înregistrări</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weightEntries.map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))] rounded-xl hover:opacity-80 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-[rgb(var(--ios-bg-primary))] border border-[rgb(var(--ios-border))] rounded-xl flex items-center justify-center ios-shadow-sm">
                      <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[rgb(var(--ios-text-primary))]">{entry.weight} kg</div>
                      <div className="text-sm text-[rgb(var(--ios-text-secondary))] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(entry.date), "d MMMM yyyy", { locale: ro })}
                      </div>
                      {entry.notes && (
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))] mt-1">{entry.notes}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* BUTON DELETE */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    onClick={() => {
                      if (window.confirm('Sigur vrei să ștergi această înregistrare?')) {
                        deleteWeightMutation.mutate(entry.id);
                      }
                    }}
                    disabled={deleteWeightMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {weightEntries.length === 0 && (
                <div className="text-center py-12 text-[rgb(var(--ios-text-tertiary))]">
                  <Scale className="w-16 h-16 mx-auto mb-4" />
                  <p>Încă nu ai înregistrări.</p>
                  <p className="text-sm">Adaugă prima ta înregistrare de greutate!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
