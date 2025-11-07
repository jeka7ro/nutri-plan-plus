
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

        {/* Add Weight Form */}
        <Card className="ios-card ios-shadow-lg rounded-[24px] border-[rgb(var(--ios-border))]">
          <CardHeader>
            <CardTitle className="text-[rgb(var(--ios-text-primary))]">Înregistrează greutatea de astăzi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-[rgb(var(--ios-text-primary))]">Greutate (kg)</Label>
                  
                  {/* Mobile: iOS-style increment/decrement */}
                  <div className="md:hidden">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-2 border-[rgb(var(--ios-border))] bg-[rgb(var(--ios-bg-tertiary))] active:scale-95 transition-transform"
                        onClick={() => setWeight(Math.max(0, (parseFloat(weight) || 0) - 0.5).toFixed(1))}
                      >
                        <span className="text-2xl font-light text-[rgb(var(--ios-text-primary))]">−</span>
                      </Button>
                      
                      <div className="flex-1 text-center">
                        <Input
                          id="weight-mobile"
                          name="weight"
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="75.5"
                          className="text-center text-2xl font-semibold h-14 border-2 border-[rgb(var(--ios-border))] bg-[rgb(var(--ios-bg-primary))]"
                        />
                        <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">kg</p>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-2 border-[rgb(var(--ios-border))] bg-[rgb(var(--ios-bg-tertiary))] active:scale-95 transition-transform"
                        onClick={() => setWeight(((parseFloat(weight) || 0) + 0.5).toFixed(1))}
                      >
                        <span className="text-2xl font-light text-[rgb(var(--ios-text-primary))]">+</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Desktop: Regular input */}
                  <Input
                    id="weight"
                    name="weight-desktop"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 75.5"
                    className="hidden md:block border-[rgb(var(--ios-border))]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mood" className="text-[rgb(var(--ios-text-primary))]">Cum te simți?</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelent">🤩 Excelent</SelectItem>
                      <SelectItem value="bine">😊 Bine</SelectItem>
                      <SelectItem value="normal">😐 Normal</SelectItem>
                      <SelectItem value="obosit">😴 Obosit</SelectItem>
                      <SelectItem value="slab">😞 Slab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[rgb(var(--ios-text-primary))]">Notițe (opțional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observații despre zi, mâncare, exerciții..."
                  rows={3}
                  className="border-[rgb(var(--ios-border))]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[12px]"
                disabled={addWeightMutation.isPending}
              >
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
