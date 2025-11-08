
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
      setWeight(user.current_weight.toFixed(1));
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

    addWeightMutation.mutate({
      weight: parseFloat(weight),
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
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

          <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-[rgb(var(--ios-border))]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total pierdut</span>
                <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {totalWeightLost} kg
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                Felicitări pentru progres! 🎉
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card ios-shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-[rgb(var(--ios-border))]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Până la țintă</span>
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {remainingWeight > 0 ? remainingWeight : '0'} kg
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                Țintă: {user?.target_weight || '-'} kg
              </div>
            </CardContent>
          </Card>
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

              {/* Smart Forecast */}
              {(() => {
                const avgWeeklyLoss = weightEntries.length >= 2 
                  ? weightEntries.slice(0, Math.min(7, weightEntries.length)).reduce((sum, entry, idx, arr) => {
                      if (idx === arr.length - 1) return sum;
                      return sum + (arr[idx + 1].weight - entry.weight);
                    }, 0) / Math.min(6, weightEntries.length - 1)
                  : 0;
                
                const daysToTarget = remainingWeight > 0 && avgWeeklyLoss < 0
                  ? Math.ceil((remainingWeight / Math.abs(avgWeeklyLoss)) * 7)
                  : null;

                return (
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-[16px]">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-900 dark:text-purple-100">Prognoză inteligentă</span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {daysToTarget && daysToTarget > 0 && daysToTarget < 365
                        ? `În ritmul actual, vei ajunge la ținta de ${user?.target_weight} kg în aproximativ ${daysToTarget} zile (${Math.round(daysToTarget / 7)} săptămâni). ${avgWeeklyLoss < -0.5 ? '🔥 Ritm excelent!' : avgWeeklyLoss < 0 ? '✨ Progres constant!' : ''}`
                        : avgWeeklyLoss < -0.5
                        ? `🔥 Progres excelent! Pierzi în medie ${Math.abs(avgWeeklyLoss * 7).toFixed(1)} kg/săptămână.`
                        : avgWeeklyLoss < 0
                        ? `✨ Continui pe drumul cel bun! Ritmul actual: ${Math.abs(avgWeeklyLoss * 7).toFixed(1)} kg/săptămână.`
                        : weightEntries.length < 2
                        ? '📊 Adaugă mai multe înregistrări pentru o prognoză precisă.'
                        : '💪 Menține-ți greutatea stabilă! Continuă cu rutina ta.'}
                    </p>
                  </div>
                );
              })()}

              {/* Weight Input - Centered & Prominent */}
              <div className="space-y-3">
                <Label htmlFor="weight" className="text-center block text-[rgb(var(--ios-text-primary))] font-semibold">
                  Greutatea de astăzi
                </Label>
                
                {/* Mobile & Desktop: iOS-style increment/decrement */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full border-2 border-blue-300 dark:border-blue-700 bg-[rgb(var(--ios-bg-tertiary))] hover:bg-blue-50 dark:hover:bg-blue-900/50 active:scale-95 transition-all"
                    onClick={() => setWeight(Math.max(0, (parseFloat(weight) || 0) - 0.5).toFixed(1))}
                  >
                    <span className="text-3xl font-light text-blue-600 dark:text-blue-400">−</span>
                  </Button>
                  
                  <div className="text-center">
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="75.5"
                      className="text-center text-4xl font-bold h-20 w-32 border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 rounded-[16px] shadow-lg"
                    />
                    <p className="text-sm text-[rgb(var(--ios-text-tertiary))] mt-2 font-medium">kilogramе</p>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full border-2 border-blue-300 dark:border-blue-700 bg-[rgb(var(--ios-bg-tertiary))] hover:bg-blue-50 dark:hover:bg-blue-900/50 active:scale-95 transition-all"
                    onClick={() => setWeight(((parseFloat(weight) || 0) + 0.5).toFixed(1))}
                  >
                    <span className="text-3xl font-light text-blue-600 dark:text-blue-400">+</span>
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
