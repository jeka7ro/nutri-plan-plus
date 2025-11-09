
import React, { useState, useEffect } from "react";
import localApi from "@/api/localClient";
const base44 = localApi;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users, MessageSquare, TrendingUp, TrendingDown, Activity, Shield, Crown, Calendar,
  CheckCircle, Clock, XCircle, ChefHat, Loader2, Upload, Edit, Trash2, Plus, Image as ImageIcon, ArrowRight, Award, Flame, Eye, Settings, Info
} from "lucide-react";
import { format, subDays, differenceInYears } from "date-fns";
import { ro } from "date-fns/locale";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function Admin() {
  // VERSIUNE: 1.0.1 - FIX UTILIZATORI + NUME/PRENUME
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [response, setResponse] = useState("");
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBook, setUploadingBook] = useState(false);
  const [bookUrl, setBookUrl] = useState("");
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // Pentru dialog detalii user
  const [activeTab, setActiveTab] = useState("recipes"); // Control tab-uri
  const [showCreateUser, setShowCreateUser] = useState(false); // Dialog creare utilizator
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user'
  });
  const [selectedBackup, setSelectedBackup] = useState(null); // Pentru vizualizare conținut backup
  const [backupSettings, setBackupSettings] = useState({
    interval: 12, // ore
    cleanup: 48, // ore
    autoEnabled: true
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    localApi.auth.me().then(userData => {
      console.log('👤 Admin user loaded:', userData);
      console.log('🔑 Token exists:', !!localStorage.getItem('auth_token'));
      setUser(userData);
      if (userData.role !== 'admin') {
        console.error('❌ User is not admin, redirecting...');
        window.location.href = '/';
      } else {
        console.log('✅ User is ADMIN, can access dashboard');
      }
    }).catch((error) => {
      console.error('❌ Failed to load user:', error);
      window.location.href = '/';
    });
  }, []);

  const { data: allUsers = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      console.log('🔍 Fetching users from API...');
      console.log('🔑 Using token:', localStorage.getItem('auth_token')?.substring(0, 20) + '...');
      try {
        const users = await base44.entities.User.list('-created_date');
        console.log('✅ Users received:', users);
        console.log('📊 Total users:', users.length);
        return users;
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
      }
    },
    enabled: !!user && user?.role === 'admin',
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // DEBUGGING: Log când se schimbă users
  useEffect(() => {
    console.log('👥 AllUsers updated:', allUsers);
    console.log('📊 AllUsers length:', allUsers?.length || 0);
    console.log('⏳ Loading:', usersLoading);
    console.log('❌ Error:', usersError);
  }, [allUsers, usersLoading, usersError]);

  const { data: adminChats = [] } = useQuery({
    queryKey: ['adminChats'],
    queryFn: () => base44.entities.AdminChat.list('-created_date'),
    enabled: user?.role === 'admin',
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date'),
    enabled: user?.role === 'admin',
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ['allCheckIns'],
    queryFn: () => base44.entities.DailyCheckIn.list('-date'),
    enabled: user?.role === 'admin',
  });

  const { data: allWeightEntries = [] } = useQuery({
    queryKey: ['allWeightEntries'],
    queryFn: () => localApi.admin.weightEntries(),
    enabled: user?.role === 'admin',
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: backups = [] } = useQuery({
    queryKey: ['backups'],
    queryFn: () => localApi.admin.backups.list(),
    enabled: user?.role === 'admin',
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const createBackupMutation = useMutation({
    mutationFn: () => localApi.admin.backups.create(),
    onSuccess: () => {
      queryClient.invalidateQueries(['backups']);
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/admin/backups?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete backup');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['backups']);
      alert('✅ Backup șters cu succes!');
    },
  });

  const createRecipeMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['recipes']);
      setEditingRecipe(null);
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Recipe.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['recipes']);
      setEditingRecipe(null);
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['recipes']);
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditingRecipe({ ...editingRecipe, image_url: file_url });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBookUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBook(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setBookUrl(file_url);
      alert('Document încărcat cu succes! URL: ' + file_url);
    } catch (error) {
      console.error('Error uploading book:', error);
      alert('Eroare la încărcarea documentului');
    } finally {
      setUploadingBook(false);
    }
  };

  const handleSaveRecipe = () => {
    const recipeData = {
      ...editingRecipe,
      ingredients_en: editingRecipe.ingredients_en_text?.split('\n').filter(i => i.trim()) || [],
      ingredients_ro: editingRecipe.ingredients_ro_text?.split('\n').filter(i => i.trim()) || [],
      instructions_en: editingRecipe.instructions_en_text?.split('\n').filter(i => i.trim()) || [],
      instructions_ro: editingRecipe.instructions_ro_text?.split('\n').filter(i => i.trim()) || [],
      keywords: editingRecipe.keywords_text?.split(',').map(k => k.trim()).filter(k => k) || [],
      allergens: editingRecipe.allergens || [],
      calories: parseFloat(editingRecipe.calories) || 0,
      protein: parseFloat(editingRecipe.protein) || 0,
      carbs: parseFloat(editingRecipe.carbs) || 0,
      fat: parseFloat(editingRecipe.fat) || 0,
      phase: parseInt(editingRecipe.phase) || 1,
    };

    delete recipeData.ingredients_en_text;
    delete recipeData.ingredients_ro_text;
    delete recipeData.instructions_en_text;
    delete recipeData.instructions_ro_text;
    delete recipeData.keywords_text;

    if (editingRecipe.id) {
      updateRecipeMutation.mutate({ id: editingRecipe.id, data: recipeData });
    } else {
      createRecipeMutation.mutate(recipeData);
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe({
      ...recipe,
      ingredients_en_text: Array.isArray(recipe.ingredients_en) 
        ? recipe.ingredients_en.join('\n') 
        : (recipe.ingredients_en || ''),
      ingredients_ro_text: Array.isArray(recipe.ingredients_ro) 
        ? recipe.ingredients_ro.join('\n') 
        : (recipe.ingredients_ro || ''),
      instructions_en_text: Array.isArray(recipe.instructions_en) 
        ? recipe.instructions_en.join('\n') 
        : (recipe.instructions_en || ''),
      instructions_ro_text: Array.isArray(recipe.instructions_ro) 
        ? recipe.instructions_ro.join('\n') 
        : (recipe.instructions_ro || ''),
      keywords_text: Array.isArray(recipe.keywords) 
        ? recipe.keywords.join(', ') 
        : (recipe.keywords || ''),
    });
  };

  const handleNewRecipe = () => {
    setEditingRecipe({
      name: '',
      name_ro: '',
      phase: 1,
      meal_type: 'breakfast',
      image_url: '',
      cooking_time: '',
      servings: '',
      difficulty: 'easy',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients_en_text: '',
      ingredients_ro_text: '',
      instructions_en_text: '',
      instructions_ro_text: '',
      benefits_en: '',
      benefits_ro: '',
      tags: [],
      keywords_text: '',
      is_vegetarian: false,
      is_vegan: false,
      allergens: [],
      source: 'admin',
      is_featured: false
    });
  };

  const handleRespondToRequest = async (request) => {
    if (!response.trim()) return;
    
    await base44.entities.AdminChat.update(request.id, {
      admin_response: response,
      status: 'responded'
    });
    
    setResponse("");
    setSelectedRequest(null);
    queryClient.invalidateQueries(['adminChats']);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin access required</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: allUsers.length,
    // Activi = users cu check-ins în ultimele 7 zile
    activeUsers: allUsers.filter(u => {
      const userCheckIns = allCheckIns.filter(c => c.user_id === u.id);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return userCheckIns.some(c => new Date(c.date) >= sevenDaysAgo);
    }).length,
    pendingSupport: adminChats.filter(c => c.status === 'pending').length,
    totalRecipes: recipes.length,
  };

  const recipesByPhase = {
    1: recipes.filter(r => r.phase === 1).length,
    2: recipes.filter(r => r.phase === 2).length,
    3: recipes.filter(r => r.phase === 3).length,
  };

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe => {
    if (!recipeSearchQuery.trim()) return true;
    
    const searchLower = recipeSearchQuery.toLowerCase();
    
    // Search in all text fields
    return (
      recipe.name?.toLowerCase().includes(searchLower) ||
      recipe.name_ro?.toLowerCase().includes(searchLower) ||
      recipe.ingredients_en?.some(ing => ing.toLowerCase().includes(searchLower)) ||
      recipe.ingredients_ro?.some(ing => ing.toLowerCase().includes(searchLower)) ||
      recipe.instructions_en?.some(inst => inst.toLowerCase().includes(searchLower)) ||
      recipe.instructions_ro?.some(inst => inst.toLowerCase().includes(searchLower)) ||
      recipe.keywords?.some(kw => kw.toLowerCase().includes(searchLower)) ||
      recipe.benefits_en?.toLowerCase().includes(searchLower) ||
      recipe.benefits_ro?.toLowerCase().includes(searchLower) ||
      recipe.meal_type?.toLowerCase().includes(searchLower) ||
      recipe.difficulty?.toLowerCase().includes(searchLower) ||
      recipe.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-600" />
              Admin Dashboard
            </h1>
            <p className="text-[rgb(var(--ios-text-secondary))] mt-1">Gestionează aplicația</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <Crown className="w-4 h-4 mr-1" />
            Administrator
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card 
            className="ios-card border-none ios-shadow-lg cursor-pointer hover:shadow-2xl transition-all hover:scale-105"
            onClick={() => setActiveTab("users")}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[rgb(var(--ios-text-primary))]">{stats.totalUsers}</div>
              <div className="text-xs md:text-sm text-[rgb(var(--ios-text-secondary))] mt-1">Utilizatori</div>
            </CardContent>
          </Card>

          <Card 
            className="ios-card border-none ios-shadow-lg cursor-pointer hover:shadow-2xl transition-all hover:scale-105"
            onClick={() => setActiveTab("users")}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[rgb(var(--ios-text-primary))]">{stats.activeUsers}</div>
              <div className="text-xs md:text-sm text-[rgb(var(--ios-text-secondary))] mt-1">Activi (ultim 7 zile)</div>
            </CardContent>
          </Card>

          <Card 
            className="ios-card border-none ios-shadow-lg cursor-pointer hover:shadow-2xl transition-all hover:scale-105"
            onClick={() => setActiveTab("support")}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[rgb(var(--ios-text-primary))]">{stats.pendingSupport}</div>
              <div className="text-xs md:text-sm text-[rgb(var(--ios-text-secondary))] mt-1">Suport</div>
            </CardContent>
          </Card>

          <Card 
            className="ios-card border-none ios-shadow-lg cursor-pointer hover:shadow-2xl transition-all hover:scale-105"
            onClick={() => setActiveTab("recipes")}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[rgb(var(--ios-text-primary))]">{stats.totalRecipes}</div>
              <div className="text-xs md:text-sm text-[rgb(var(--ios-text-secondary))] mt-1">Rețete</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))]">
            <TabsTrigger value="recipes">Rețete ({filteredRecipes.length})</TabsTrigger>
            <TabsTrigger value="recommendations">📖 Recomandări</TabsTrigger>
            <TabsTrigger value="resources">📚 Resurse</TabsTrigger>
            <TabsTrigger value="support">Suport ({stats.pendingSupport})</TabsTrigger>
            <TabsTrigger value="users">Utilizatori</TabsTrigger>
            <TabsTrigger value="logs">📋 Loguri</TabsTrigger>
            <TabsTrigger value="backups">💾 Backup</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Setări App</TabsTrigger>
          </TabsList>

          {/* TAB RECOMANDĂRI - EDITARE */}
          <TabsContent value="recommendations" className="mt-6">
            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <CardTitle className="text-[rgb(var(--ios-text-primary))]">📖 Editare Recomandări Dietă</CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                  Acestea apar în pagina "Recomandări" pentru toți utilizatorii
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-semibold mb-2">ℹ️ Cum să editezi:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Modifică textele direct în fișierul <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">src/pages/Recommendations.jsx</code></li>
                        <li>Carbohidrații permisi sunt în array-ul <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">allowedCarbs.items</code></li>
                        <li>Produsele interzise sunt în <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">forbidden.items</code></li>
                        <li>Fiecare fază are <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">meals[]</code> și <code className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">note</code></li>
                      </ul>
                      <p className="mt-3 font-semibold text-emerald-700 dark:text-emerald-300">
                        🚀 După editare, fă commit și push pentru a actualiza!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-orange-700 dark:text-orange-300">Faza 1 (2 zile)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p><strong>Focus:</strong> Carbohidrați + Fructe</p>
                      <p><strong>Interzis:</strong> Grăsimi, uleiuri</p>
                      <p className="text-orange-600 dark:text-orange-400 font-semibold">⚠️ Gătește pe apă!</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-emerald-700 dark:text-emerald-300">Faza 2 (2 zile)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p><strong>Focus:</strong> Proteine + Legume</p>
                      <p><strong>Interzis:</strong> Carbohidrați, fructe, uleiuri</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold">💪 Doar carne slabă!</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-purple-700 dark:text-purple-300">Faza 3 (3 zile)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p><strong>Focus:</strong> Grăsimi sănătoase</p>
                      <p><strong>Permis:</strong> Avocado, nuci, uleiuri</p>
                      <p className="text-purple-600 dark:text-purple-400 font-semibold">✅ Toate grăsimile!</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <a 
                    href="https://github.com/jeka7ro/nutri-plan-plus/blob/main/src/pages/Recommendations.jsx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    Deschide fișierul în GitHub pentru editare
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW TAB - Resources */}
          <TabsContent value="resources" className="mt-6">
            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <CardTitle className="text-[rgb(var(--ios-text-primary))]">📚 Resurse și Documente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Access to Book */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <ChefHat className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                        Fast Metabolism Diet - Cartea Oficială
                      </h3>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Accesează cartea completă pentru referințe detaliate
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                      onClick={() => window.open('https://base44.app/api/apps/6905d7376c72470a48ccfd0d/files/public/6905d7376c72470a48ccfd0d/65ed76551_MagicColbPlan_compressed.pdf', '_blank')}
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      Deschide Cartea
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText('https://base44.app/api/apps/6905d7376c72470a48ccfd0d/files/public/6905d7376c72470a48ccfd0d/65ed76551_MagicColbPlan_compressed.pdf');
                        alert('Link copiat în clipboard!');
                      }}
                    >
                      Copiază Link
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl p-8 text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xl font-bold text-[rgb(var(--ios-text-primary))] mb-2">
                    Încarcă Documente Suplimentare
                  </h3>
                  <p className="text-[rgb(var(--ios-text-secondary))] mb-4">
                    PDF, DOC, DOCX - Maxim 50MB
                  </p>
                  <label htmlFor="book-upload">
                    <input
                      id="book-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleBookUpload}
                    />
                    <Button 
                      type="button" 
                      disabled={uploadingBook}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => document.getElementById('book-upload').click()}
                    >
                      {uploadingBook ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Se încarcă...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Selectează Fișier
                        </>
                      )}
                    </Button>
                  </label>
                </div>

                {bookUrl && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-200">Document încărcat cu succes!</h4>
                    </div>
                    <div className="bg-white dark:bg-[rgb(var(--ios-bg-primary))] p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-sm text-[rgb(var(--ios-text-secondary))] mb-2">URL Document:</p>
                      <code className="text-xs text-emerald-600 dark:text-emerald-400 break-all">
                        {bookUrl}
                      </code>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(bookUrl, '_blank')}
                        className="flex-1"
                      >
                        Vezi Documentul
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(bookUrl);
                          alert('Link copiat!');
                        }}
                        className="flex-1"
                      >
                        Copiază Link
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">💡 Sfat</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Cartea oficială este sursa principală pentru toate regulile și rețetele din aplicație. Consultă-o pentru informații detaliate despre fiecare fază.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="mt-6">
            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-[rgb(var(--ios-text-primary))]">Gestionare rețete</CardTitle>
                  <Button onClick={handleNewRecipe} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Rețetă nouă
                  </Button>
                </div>

                {/* SEARCH BAR */}
                <div className="relative mb-4">
                  <Input
                    placeholder="Caută în rețete (nume, ingrediente, instrucțiuni, cuvinte cheie...)"
                    value={recipeSearchQuery}
                    onChange={(e) => setRecipeSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-[rgb(var(--ios-border))]"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <ChefHat className="w-5 h-5 text-[rgb(var(--ios-text-tertiary))]" />
                  </div>
                  {recipeSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setRecipeSearchQuery("")}
                    >
                      ✕
                    </Button>
                  )}
                </div>

                {recipeSearchQuery && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>{filteredRecipes.length}</strong> {filteredRecipes.length === 1 ? 'rețetă găsită' : 'rețete găsite'} pentru "{recipeSearchQuery}"
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Badge className="bg-orange-100 text-orange-700">Faza 1: {recipesByPhase[1]}</Badge>
                  <Badge className="bg-emerald-100 text-emerald-700">Faza 2: {recipesByPhase[2]}</Badge>
                  <Badge className="bg-purple-100 text-purple-700">Faza 3: {recipesByPhase[3]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-[rgb(var(--ios-text-secondary))]">
                      {recipeSearchQuery 
                        ? `Nu s-au găsit rețete pentru "${recipeSearchQuery}"`
                        : 'Nu există rețete disponibile'}
                    </p>
                    {recipeSearchQuery && (
                      <Button
                        variant="outline"
                        onClick={() => setRecipeSearchQuery("")}
                        className="mt-4"
                      >
                        Șterge căutarea
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRecipes.map((recipe) => (
                      <div key={recipe.id} className="flex items-center gap-4 p-4 border border-[rgb(var(--ios-border))] rounded-xl hover:bg-[rgb(var(--ios-bg-tertiary))] transition-colors">
                        <img 
                          src={recipe.image_url} 
                          alt={recipe.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-[rgb(var(--ios-text-primary))]">{recipe.name_ro}</div>
                          <div className="text-sm text-[rgb(var(--ios-text-secondary))]">{recipe.name}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge className={
                              recipe.phase === 1 ? 'bg-orange-100 text-orange-700' :
                              recipe.phase === 2 ? 'bg-emerald-100 text-emerald-700' :
                              'bg-purple-100 text-purple-700'
                            }>
                              Faza {recipe.phase}
                            </Badge>
                            <Badge variant="outline">{recipe.meal_type}</Badge>
                            <Badge variant="outline">{recipe.calories} cal</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRecipe(recipe)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Ștergi rețeta?')) {
                                deleteRecipeMutation.mutate(recipe.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <div className="space-y-4">
              {adminChats.map((request) => (
                <Card key={request.id} className="ios-card border-none ios-shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            request.status === 'responded' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {request.status === 'pending' ? <Clock className="w-3 h-3 mr-1" /> :
                             request.status === 'responded' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                             <XCircle className="w-3 h-3 mr-1" />}
                            {request.status === 'pending' ? 'În așteptare' :
                             request.status === 'responded' ? 'Răspuns' : 'Închis'}
                          </Badge>
                          <Badge variant="outline">{request.message_type}</Badge>
                        </div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))] mb-1">
                          {request.user_email} • {format(new Date(request.created_date), 'dd MMM yyyy, HH:mm', { locale: ro })}
                        </div>
                        <p className="text-[rgb(var(--ios-text-primary))] font-medium">{request.message}</p>
                      </div>
                    </div>

                    {request.admin_response && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 mb-4">
                        <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Răspunsul tău:</div>
                        <p className="text-sm text-[rgb(var(--ios-text-primary))]">{request.admin_response}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Scrie răspunsul..."
                          value={selectedRequest?.id === request.id ? response : ''}
                          onChange={(e) => {
                            setSelectedRequest(request);
                            setResponse(e.target.value);
                          }}
                          rows={4}
                          className="border-[rgb(var(--ios-border))]"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRespondToRequest(request)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={!response.trim()}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Trimite
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[rgb(var(--ios-text-primary))]">Utilizatori ({allUsers.length})</CardTitle>
                  <Button 
                    onClick={() => setShowCreateUser(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adaugă Utilizator
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilizator</TableHead>
                        <TableHead>Contact & Locație</TableHead>
                        <TableHead>Abonament</TableHead>
                        <TableHead>Date Fizice</TableHead>
                        <TableHead>Dietă</TableHead>
                        <TableHead>Progres</TableHead>
                        <TableHead>Acțiuni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((u) => {
                        const userCheckIns = allCheckIns.filter(c => c.user_id === u.id);
                        const activeDays = userCheckIns.length;
                        const totalCalories = userCheckIns.reduce((sum, c) => sum + (c.total_calories || 0), 0);
                        
                        return (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">
                              <div 
                                className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                onClick={() => setSelectedUser(u)}
                              >
                                <p className="font-bold text-[rgb(var(--ios-text-primary))] underline decoration-dotted">
                                  {u.first_name && u.last_name 
                                    ? `${u.first_name} ${u.last_name}` 
                                    : (u.name || 'N/A')
                                  }
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {u.id}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  📅 Înregistrat: {u.created_at ? new Date(u.created_at).toLocaleDateString('ro-RO') : 'N/A'}
                                </p>
                                <p className="text-xs text-blue-500 dark:text-blue-400">
                                  🕐 Ultima logare: {u.last_login ? new Date(u.last_login).toLocaleString('ro-RO', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Niciodată'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">📧 {u.email}</p>
                                {u.phone && <p className="text-xs text-gray-500 dark:text-gray-400">📱 {u.phone}</p>}
                                {u.country && <p className="text-xs text-gray-500 dark:text-gray-400">🌍 {u.country}</p>}
                                {u.city && <p className="text-xs text-gray-500 dark:text-gray-400">🏙️ {u.city}</p>}
                                <div className="pt-1">
                                  {u.role === 'admin' ? (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300">
                                      <Crown className="w-3 h-3 mr-1" />
                                      Admin
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">User</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge className={
                                  (u.subscription_tier || 'free') === 'premium' 
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }>
                                  <Crown className="w-3 h-3 mr-1" />
                                  {(u.subscription_tier || 'free').toUpperCase()}
                                </Badge>
                                {u.subscription_expires_at && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Expiră: {new Date(u.subscription_expires_at).toLocaleDateString('ro-RO')}
                                  </p>
                                )}
                                {u.subscription_code && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                                    Cod: {u.subscription_code}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs space-y-1">
                                {(() => {
                                  // Calculez evoluția greutății
                                  const userWeights = allWeightEntries.filter(w => w.user_id === u.id).sort((a, b) => new Date(a.date) - new Date(b.date));
                                  const firstWeight = userWeights[0]?.weight || u.current_weight;
                                  const lastWeight = userWeights[userWeights.length - 1]?.weight || u.current_weight;
                                  const weightDiff = firstWeight && lastWeight ? (parseFloat(firstWeight) - parseFloat(lastWeight)).toFixed(1) : 0;
                                  const hasProgress = Math.abs(weightDiff) > 0;
                                  
                                  return (
                                    <>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p><strong>Greutate:</strong> {u.current_weight || 'N/A'} kg → {u.target_weight || 'N/A'} kg</p>
                                        {hasProgress && (
                                          <div className={`flex items-center gap-1 ${weightDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {weightDiff > 0 ? (
                                              <><TrendingDown className="w-4 h-4" /> <span className="font-bold">-{weightDiff} kg</span></>
                                            ) : (
                                              <><TrendingUp className="w-4 h-4" /> <span className="font-bold">+{Math.abs(weightDiff)} kg</span></>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p><strong>Înălțime:</strong> {u.height || 'N/A'} cm</p>
                                      <p><strong>Vârstă:</strong> {u.age || 'N/A'} ani</p>
                                      <p><strong>Sex:</strong> {u.gender === 'male' || u.gender === 'm' ? 'M' : u.gender === 'female' || u.gender === 'f' ? 'F' : 'N/A'}</p>
                                      <p><strong>Activitate:</strong> {u.activity_level || 'N/A'}</p>
                                    </>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs space-y-1">
                                <p><strong>Start:</strong> {u.start_date ? new Date(u.start_date).toLocaleDateString('ro-RO') : 'N/A'}</p>
                                <p><strong>Preferințe:</strong> {u.dietary_preferences || 'Niciuna'}</p>
                                <p><strong>Alergii:</strong> {u.allergies || 'Niciuna'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {activeDays > 0 ? (
                                  <>
                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                      ✅ Activ
                                    </Badge>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      <strong>{activeDays}</strong> zile active
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      <strong>{Math.round(totalCalories)}</strong> cal totale
                                    </p>
                                  </>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500">❌ Inactiv</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {u.last_login ? (
                                  <>
                                    <p className="font-medium text-[rgb(var(--ios-text-primary))]">
                                      {new Date(u.last_login).toLocaleDateString('ro-RO')}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                      {new Date(u.last_login).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </>
                                ) : (
                                  <Badge variant="outline" className="text-gray-400">Niciodată</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Sigur ștergi utilizatorul ${u.name} (${u.email})?\\n\\nACEASTA VA ȘTERGE:\\n- Toate datele personale\\n- Toate check-ins\\n- Toate înregistrările de greutate\\n- Toate mesajele\\n\\nAceastă acțiune NU poate fi anulată!`)) {
                                    // Implementare ștergere
                                    fetch(`http://localhost:3001/api/admin/users/${u.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                                      }
                                    }).then(() => {
                                      queryClient.invalidateQueries(['allUsers']);
                                      queryClient.invalidateQueries(['allCheckIns']);
                                    });
                                  }
                                }}
                                disabled={u.id === user?.id} // Nu poate șterge pe el însuși
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB LOGURI */}
          <TabsContent value="logs" className="mt-6">
            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <CardTitle className="text-[rgb(var(--ios-text-primary))]">📋 Loguri Sistem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Loguri Login-uri */}
                  <div>
                    <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Login-uri Recente
                    </h3>
                    <div className="space-y-2">
                      {allUsers.slice(0, 10).map(u => (
                        <div key={u.id} className="p-3 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))] rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
                                {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString('ro-RO') : 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Înregistrare</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Loguri Activitate Check-ins */}
                  <div>
                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Activitate Check-ins (Ultimele 20)
                    </h3>
                    <div className="space-y-2">
                      {allCheckIns.slice(0, 20).map((checkIn, index) => {
                        const checkInUser = allUsers.find(u => u.id === checkIn.user_id);
                        return (
                          <div key={index} className="p-3 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))] rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
                                  {checkInUser?.first_name && checkInUser?.last_name 
                                    ? `${checkInUser.first_name} ${checkInUser.last_name}` 
                                    : (checkInUser?.name || `User ID ${checkIn.user_id}`)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Ziua {checkIn.day_number} • Faza {checkIn.phase} • {checkIn.total_calories || 0} cal
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  {checkIn.date ? new Date(checkIn.date).toLocaleDateString('ro-RO') : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {checkIn.updated_at ? new Date(checkIn.updated_at).toLocaleTimeString('ro-RO', {hour: '2-digit', minute: '2-digit'}) : ''}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {checkIn.breakfast_completed && <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs">🍳 Mic Dejun</Badge>}
                              {checkIn.snack1_completed && <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">🍎 Gustare 1</Badge>}
                              {checkIn.lunch_completed && <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">🍽️ Prânz</Badge>}
                              {checkIn.snack2_completed && <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">🍪 Gustare 2</Badge>}
                              {checkIn.dinner_completed && <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs">🌙 Cină</Badge>}
                              {checkIn.exercise_completed && <Badge className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs">💪 Exercițiu</Badge>}
                            </div>
                          </div>
                        );
                      })}
                      {allCheckIns.length === 0 && (
                        <p className="text-center text-gray-500 py-8">Nicio activitate înregistrată</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB BACKUPS */}
          <TabsContent value="backups" className="mt-6">
            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[rgb(var(--ios-text-primary))]">
                    💾 Backup-uri ({backups.length})
                  </CardTitle>
                  <Button
                    onClick={() => createBackupMutation.mutate()}
                    disabled={createBackupMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {createBackupMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creează Backup...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Backup Manual</>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  🔄 Backup automat: la fiecare {backupSettings.interval} ore | 🗑️ Cleanup automat: &gt; {backupSettings.cleanup}h
                </p>
              </CardHeader>
              <CardContent>
                {/* SETĂRI BACKUP */}
                <div className="mb-6 p-4 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))] rounded-lg">
                  <h3 className="font-bold text-[rgb(var(--ios-text-primary))] mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Setări Backup
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Interval Backup Automat (ore)</Label>
                      <Select 
                        value={backupSettings.interval.toString()} 
                        onValueChange={(val) => setBackupSettings({...backupSettings, interval: parseInt(val)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">La 6 ore</SelectItem>
                          <SelectItem value="12">La 12 ore</SelectItem>
                          <SelectItem value="24">La 24 ore (zilnic)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cleanup Automat (după câte ore)</Label>
                      <Select 
                        value={backupSettings.cleanup.toString()} 
                        onValueChange={(val) => setBackupSettings({...backupSettings, cleanup: parseInt(val)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 ore (1 zi)</SelectItem>
                          <SelectItem value="48">48 ore (2 zile)</SelectItem>
                          <SelectItem value="72">72 ore (3 zile)</SelectItem>
                          <SelectItem value="168">168 ore (7 zile)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => alert(`✅ Setări salvate!\n\nInterval: ${backupSettings.interval}h\nCleanup: ${backupSettings.cleanup}h`)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        💾 Salvează Setări
                      </Button>
                    </div>
                  </div>
                </div>

              </CardContent>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fișier</TableHead>
                      <TableHead>Mărime</TableHead>
                      <TableHead>Creat de</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-mono text-xs">{backup.filename}</TableCell>
                        <TableCell>{backup.size_mb} MB</TableCell>
                        <TableCell>
                          {backup.created_by_name ? (
                            <div>
                              <p className="font-medium">{backup.created_by_name}</p>
                              <p className="text-xs text-gray-500">{backup.created_by_email}</p>
                            </div>
                          ) : (
                            <Badge variant="outline">System</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-medium">{new Date(backup.created_at).toLocaleDateString('ro-RO')}</p>
                            <p className="text-gray-500">{new Date(backup.created_at).toLocaleTimeString('ro-RO')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {backup.auto_generated ? (
                            <Badge className="bg-blue-100 text-blue-700">🔄 Auto</Badge>
                          ) : (
                            <Badge className="bg-purple-100 text-purple-700">👤 Manual</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBackup(backup)}
                              className="border-[rgb(var(--ios-border))]"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Sigur ștergi backup-ul ${backup.filename}?`)) {
                                  deleteBackupMutation.mutate(backup.id);
                                }
                              }}
                              disabled={deleteBackupMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {backups.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-4">Nicio backup găsit</p>
                    <Button onClick={() => createBackupMutation.mutate()} className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" /> Creează primul backup
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB SETĂRI APP - Prețuri dinamice */}
          <TabsContent value="settings" className="mt-6">
            <Card className="ios-card border-none ios-shadow-lg">
              <CardHeader>
                <CardTitle className="text-[rgb(var(--ios-text-primary))]">⚙️ Setări Aplicație</CardTitle>
                <p className="text-sm text-[rgb(var(--ios-text-secondary))] mt-2">
                  Setări globale pentru aplicație (prețuri, contact, etc.)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>💰 Preț Prima Lună (RON)</Label>
                      <Input 
                        type="number" 
                        defaultValue="200"
                        placeholder="200"
                        className="text-lg font-bold"
                      />
                      <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">
                        Preț pentru primul abonament Premium
                      </p>
                    </div>

                    <div>
                      <Label>💰 Preț Lunar Recurent (RON)</Label>
                      <Input 
                        type="number" 
                        defaultValue="20"
                        placeholder="20"
                        className="text-lg font-bold"
                      />
                      <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">
                        Preț pentru lunile următoare (recurent)
                      </p>
                    </div>

                    <div>
                      <Label>📧 Email Suport</Label>
                      <Input 
                        type="email" 
                        defaultValue="support@eatnfit.app"
                        placeholder="support@eatnfit.app"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>🔗 Netopia Merchant ID</Label>
                      <Input 
                        placeholder="Merchant ID de la Netopia"
                      />
                      <p className="text-xs text-[rgb(var(--ios-text-tertiary))] mt-1">
                        Pentru integrare plăți Netopia Payments
                      </p>
                    </div>

                    <div>
                      <Label>🔑 Netopia API Key</Label>
                      <Input 
                        type="password"
                        placeholder="API Key Netopia"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="enable-reg" defaultChecked />
                      <Label htmlFor="enable-reg">🔓 Permite înregistrări noi</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 flex-1">
                    💾 Salvează Setări
                  </Button>
                  <Button variant="outline" className="flex-1">
                    🔄 Resetează la Default
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                  <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                    <strong>ℹ️ Notă:</strong> După salvare, prețurile se vor actualiza automat pe pagina /upgrade și în toate locurile unde sunt afișate.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recipe Editor Dialog */}
      <Dialog open={!!editingRecipe} onOpenChange={() => setEditingRecipe(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[rgb(var(--ios-bg-primary))]">
          {editingRecipe && (
            <>
              <DialogHeader>
                <DialogTitle>{editingRecipe.id ? 'Editează rețeta' : 'Rețetă nouă'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nume (EN)</Label>
                    <Input
                      value={editingRecipe.name || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
                      placeholder="Recipe name in English"
                    />
                  </div>
                  <div>
                    <Label>Nume (RO)</Label>
                    <Input
                      value={editingRecipe.name_ro || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, name_ro: e.target.value })}
                      placeholder="Nume rețetă în română"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Imagine</Label>
                  {editingRecipe.image_url && (
                    <img src={editingRecipe.image_url} alt="Recipe" className="w-full h-48 object-cover rounded-lg mb-2" />
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={editingRecipe.image_url || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, image_url: e.target.value })}
                      placeholder="URL imagine sau încarcă"
                    />
                    <label htmlFor="image-upload">
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button type="button" variant="outline" disabled={uploadingImage} onClick={() => document.getElementById('image-upload').click()}>
                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Faza</Label>
                    <Select value={String(editingRecipe.phase)} onValueChange={(v) => setEditingRecipe({ ...editingRecipe, phase: parseInt(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Faza 1</SelectItem>
                        <SelectItem value="2">Faza 2</SelectItem>
                        <SelectItem value="3">Faza 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tip masă</Label>
                    <Select value={editingRecipe.meal_type} onValueChange={(v) => setEditingRecipe({ ...editingRecipe, meal_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Mic dejun</SelectItem>
                        <SelectItem value="snack1">Gustare 1</SelectItem>
                        <SelectItem value="lunch">Prânz</SelectItem>
                        <SelectItem value="snack2">Gustare 2</SelectItem>
                        <SelectItem value="dinner">Cină</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Dificultate</Label>
                    <Select value={editingRecipe.difficulty} onValueChange={(v) => setEditingRecipe({ ...editingRecipe, difficulty: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Ușor</SelectItem>
                        <SelectItem value="medium">Mediu</SelectItem>
                        <SelectItem value="hard">Greu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label>Calorii</Label>
                    <Input type="number" value={editingRecipe.calories || ''} onChange={(e) => setEditingRecipe({ ...editingRecipe, calories: e.target.value })} />
                  </div>
                  <div>
                    <Label>Proteine (g)</Label>
                    <Input type="number" value={editingRecipe.protein || ''} onChange={(e) => setEditingRecipe({ ...editingRecipe, protein: e.target.value })} />
                  </div>
                  <div>
                    <Label>Carbohidrați (g)</Label>
                    <Input type="number" value={editingRecipe.carbs || ''} onChange={(e) => setEditingRecipe({ ...editingRecipe, carbs: e.target.value })} />
                  </div>
                  <div>
                    <Label>Grăsimi (g)</Label>
                    <Input type="number" value={editingRecipe.fat || ''} onChange={(e) => setEditingRecipe({ ...editingRecipe, fat: e.target.value })} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Ingrediente (EN) - câte una pe linie</Label>
                    <Textarea
                      value={editingRecipe.ingredients_en_text || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, ingredients_en_text: e.target.value })}
                      rows={6}
                      placeholder="1 cup quinoa&#10;2 cups almond milk"
                    />
                  </div>
                  <div>
                    <Label>Ingrediente (RO) - câte una pe linie</Label>
                    <Textarea
                      value={editingRecipe.ingredients_ro_text || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, ingredients_ro_text: e.target.value })}
                      rows={6}
                      placeholder="1 cană quinoa&#10;2 căni lapte de migdale"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Instrucțiuni (EN) - câte una pe linie</Label>
                    <Textarea
                      value={editingRecipe.instructions_en_text || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, instructions_en_text: e.target.value })}
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label>Instrucțiuni (RO) - câte una pe linie</Label>
                    <Textarea
                      value={editingRecipe.instructions_ro_text || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, instructions_ro_text: e.target.value })}
                      rows={6}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Beneficii (EN)</Label>
                    <Textarea
                      value={editingRecipe.benefits_en || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, benefits_en: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Beneficii (RO)</Label>
                    <Textarea
                      value={editingRecipe.benefits_ro || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, benefits_ro: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id="vegetarian"
                      checked={editingRecipe.is_vegetarian}
                      onCheckedChange={(checked) => setEditingRecipe({ ...editingRecipe, is_vegetarian: checked })}
                    />
                    <Label htmlFor="vegetarian">Vegetarian</Label>

                    <Checkbox
                      id="vegan"
                      checked={editingRecipe.is_vegan}
                      onCheckedChange={(checked) => setEditingRecipe({ ...editingRecipe, is_vegan: checked })}
                    />
                    <Label htmlFor="vegan">Vegan</Label>

                    <Checkbox
                      id="featured"
                      checked={editingRecipe.is_featured}
                      onCheckedChange={(checked) => setEditingRecipe({ ...editingRecipe, is_featured: checked })}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                  <div>
                    <Label>Keywords (separă cu virgulă)</Label>
                    <Input
                      value={editingRecipe.keywords_text || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, keywords_text: e.target.value })}
                      placeholder="chicken, avocado, healthy"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setEditingRecipe(null)} className="flex-1">
                    Anulează
                  </Button>
                  <Button onClick={handleSaveRecipe} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    {editingRecipe.id ? 'Salvează' : 'Creează'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog - COMPLET CU GRAFICE */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[rgb(var(--ios-bg-primary))]">
          {selectedUser && (() => {
            const userCheckIns = allCheckIns.filter(c => c.user_id === selectedUser.id);
            const userWeights = allWeightEntries.filter(w => w.user_id === selectedUser.id).sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Calculez statistici
            const activeDays = userCheckIns.length;
            const totalCalories = userCheckIns.reduce((sum, c) => sum + (c.total_calories || 0), 0);
            const avgCaloriesPerDay = activeDays > 0 ? Math.round(totalCalories / activeDays) : 0;
            
            // Evoluție greutate - PRIMA vs ULTIMA înregistrare
            const firstWeight = userWeights.length > 0 ? parseFloat(userWeights[0]?.weight) : null;
            const lastWeight = userWeights.length > 0 ? parseFloat(userWeights[userWeights.length - 1]?.weight) : null;
            const weightDiff = (firstWeight && lastWeight && firstWeight !== lastWeight) 
              ? (firstWeight - lastWeight).toFixed(1) 
              : 0;
            
            // Date pentru TOATE graficele (identice cu Dashboard)
            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const date = subDays(today, 6 - i);
              const dateStr = format(date, 'yyyy-MM-dd');
              const checkIn = userCheckIns.find(c => c.date.startsWith(dateStr));
              
              // Calculez mese completate
              const mealsCompleted = checkIn ? [
                checkIn.breakfast_completed,
                checkIn.snack1_completed,
                checkIn.lunch_completed,
                checkIn.snack2_completed,
                checkIn.dinner_completed
              ].filter(Boolean).length : 0;
              
              return {
                date: format(date, 'dd MMM', { locale: ro }),
                weight: userWeights.find(w => w.date.startsWith(dateStr))?.weight || null,
                calories: checkIn?.total_calories || 0,
                meals: mealsCompleted,
                caloriesBurned: checkIn?.exercise_calories_burned || 0,
                water: checkIn?.water_intake || 0,
              };
            });
            
            // Filtrează doar datele cu greutate pentru graficul de greutate
            const weightChartData = last7Days.filter(d => d.weight !== null);
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-xl font-bold">Detalii {selectedUser.name}</p>
                      <p className="text-sm text-gray-500 font-normal">{selectedUser.email}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* INFO PERSONALE */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="ios-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Date Generale</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        {/* POZA MARE - 3x mai mare (12x12 → 36x36) */}
                        <div className="flex justify-center">
                          {selectedUser.profile_picture ? (
                            <img 
                              src={selectedUser.profile_picture} 
                              alt={selectedUser.name} 
                              className="w-36 h-36 rounded-full object-cover border-4 border-emerald-500 shadow-xl" 
                            />
                          ) : (
                            <div className="w-36 h-36 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-4 border-emerald-300">
                              <Users className="w-16 h-16 text-emerald-600" />
                            </div>
                          )}
                        </div>
                        <div className="text-xs space-y-2 pt-2">
                          <p><strong>Email:</strong> {selectedUser.email}</p>
                          {selectedUser.phone && <p><strong>Telefon:</strong> 📱 {selectedUser.phone}</p>}
                          <p><strong>ID:</strong> {selectedUser.id}</p>
                          
                          {/* SCHIMBARE ROL - SELECT EDITABIL */}
                          <div className="pt-2 pb-2">
                            <Label className="text-xs font-bold mb-2 block">🔐 Rol Utilizator:</Label>
                            <Select 
                              value={selectedUser.role} 
                              onValueChange={(newRole) => {
                                if (confirm(`Sigur vrei să schimbi rolul lui ${selectedUser.first_name || selectedUser.name} la ${newRole.toUpperCase()}?`)) {
                                  fetch(`/api/admin/users`, {
                                    method: 'PUT',
                                    headers: {
                                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ userId: selectedUser.id, role: newRole })
                                  })
                                  .then(r => r.json())
                                  .then(() => {
                                    alert(`✅ Rol schimbat cu succes la ${newRole.toUpperCase()}!`);
                                    queryClient.invalidateQueries(['allUsers']);
                                    setSelectedUser(null);
                                  })
                                  .catch(e => alert('❌ Eroare: ' + e.message));
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">👤 User</SelectItem>
                                <SelectItem value="admin">👑 Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {selectedUser.country && <p><strong>Țara:</strong> 🌍 {selectedUser.country}</p>}
                          {selectedUser.city && <p><strong>Orașul:</strong> 🏙️ {selectedUser.city}</p>}
                          {selectedUser.birth_date && (
                            <p><strong>Data nașterii:</strong> 🎂 {new Date(selectedUser.birth_date).toLocaleDateString('ro-RO')}</p>
                          )}
                          <p><strong>📅 Înregistrat:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('ro-RO') : 'N/A'}</p>
                          <p><strong>🕐 Ultima logare:</strong> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString('ro-RO', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Niciodată'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="ios-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Date Fizice</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        <p><strong>Greutate:</strong> {selectedUser.current_weight || 'N/A'} kg</p>
                        <p><strong>Țintă:</strong> {selectedUser.target_weight || 'N/A'} kg</p>
                        <p><strong>Înălțime:</strong> {selectedUser.height || 'N/A'} cm</p>
                        <p><strong>Vârstă:</strong> {selectedUser.birth_date 
                          ? `${differenceInYears(new Date(), new Date(selectedUser.birth_date))} ani` 
                          : (selectedUser.age ? `${selectedUser.age} ani` : 'N/A')
                        }</p>
                        <p><strong>Sex:</strong> {selectedUser.gender === 'male' ? 'M' : selectedUser.gender === 'female' ? 'F' : 'N/A'}</p>
                        <p><strong>Activitate:</strong> {selectedUser.activity_level || 'N/A'}</p>
                      </CardContent>
                    </Card>

                    <Card className="ios-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Abonament</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        <p><strong>Tier:</strong> <Badge className={selectedUser.subscription_tier === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}>{(selectedUser.subscription_tier || 'free').toUpperCase()}</Badge></p>
                        {selectedUser.subscription_expires_at && (
                          <p><strong>Expiră:</strong> {new Date(selectedUser.subscription_expires_at).toLocaleDateString('ro-RO')}</p>
                        )}
                        {selectedUser.subscription_code && (
                          <p className="font-mono text-blue-600"><strong>Cod:</strong> {selectedUser.subscription_code}</p>
                        )}
                        <p><strong>Start dietă:</strong> {selectedUser.start_date ? new Date(selectedUser.start_date).toLocaleDateString('ro-RO') : 'N/A'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* STATISTICI */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="ios-card">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500">Zile Active</p>
                        <p className="text-2xl font-bold text-emerald-600">{activeDays}</p>
                      </CardContent>
                    </Card>
                    <Card className="ios-card">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500">Calorii Totale</p>
                        <p className="text-2xl font-bold text-orange-600">{Math.round(totalCalories)}</p>
                      </CardContent>
                    </Card>
                    <Card className="ios-card">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500">Medie/Zi</p>
                        <p className="text-2xl font-bold text-blue-600">{avgCaloriesPerDay}</p>
                      </CardContent>
                    </Card>
                    <Card className="ios-card">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500">Evoluție Greutate</p>
                        <div className={`flex items-center gap-2 text-2xl font-bold ${weightDiff > 0 ? 'text-green-600' : weightDiff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {weightDiff > 0 ? (
                            <><TrendingDown className="w-6 h-6" /> -{weightDiff} kg</>
                          ) : weightDiff < 0 ? (
                            <><TrendingUp className="w-6 h-6" /> +{Math.abs(weightDiff)} kg</>
                          ) : (
                            <><ArrowRight className="w-6 h-6" /> 0 kg</>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* GRAFICE - 3 GRAFICE (fără duplicat calorii) */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* 1. Grafic Evoluție Greutate */}
                    {weightChartData.length > 0 && (
                      <Card className="ios-card">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Evoluția greutății
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={weightChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" style={{ fontSize: 12 }} />
                              <YAxis style={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '12px' }} />
                              <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Greutate (kg)" />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* 2. Grafic Mese Completate (7 zile) */}
                    <Card className="ios-card">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-600" />
                          Mese completate (7 zile)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={last7Days}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" style={{ fontSize: 12 }} />
                            <YAxis style={{ fontSize: 12 }} domain={[0, 5]} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '12px' }} />
                            <Bar dataKey="meals" fill="#10b981" radius={[8, 8, 0, 0]} name="Mese (max 5)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* 3. Grafic Calorii Consumate vs Arse */}
                    <Card className="ios-card">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-600" />
                          Calorii consumate vs arse
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={last7Days}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" style={{ fontSize: 12 }} />
                            <YAxis style={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '12px' }} />
                            <Bar dataKey="calories" fill="#f97316" radius={[8, 8, 0, 0]} name="Consumate" />
                            <Bar dataKey="caloriesBurned" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Arse" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* MÂNCĂRURI ALESE */}
                  <Card className="ios-card">
                    <CardHeader>
                      <CardTitle className="text-sm">Mâncăruri Alese Recent ({userCheckIns.slice(-10).length} ultimele zile)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {userCheckIns.slice(-10).reverse().map((checkIn, idx) => (
                          <div key={idx} className="border border-[rgb(var(--ios-border))] rounded-lg p-3">
                            <p className="font-bold text-sm mb-2">{new Date(checkIn.date).toLocaleDateString('ro-RO')}</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                              {checkIn.breakfast_option && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">🍳 Breakfast</p>
                                  <p className="text-gray-600 dark:text-gray-400">{checkIn.breakfast_option}</p>
                                  <p className="text-emerald-600">{checkIn.breakfast_calories} cal</p>
                                </div>
                              )}
                              {checkIn.snack1_option && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                  <p className="font-semibold text-blue-700 dark:text-blue-300">🍎 Snack 1</p>
                                  <p className="text-gray-600 dark:text-gray-400">{checkIn.snack1_option}</p>
                                  <p className="text-blue-600">{checkIn.snack1_calories} cal</p>
                                </div>
                              )}
                              {checkIn.lunch_option && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                                  <p className="font-semibold text-orange-700 dark:text-orange-300">🍽️ Lunch</p>
                                  <p className="text-gray-600 dark:text-gray-400">{checkIn.lunch_option}</p>
                                  <p className="text-orange-600">{checkIn.lunch_calories} cal</p>
                                </div>
                              )}
                              {checkIn.snack2_option && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                  <p className="font-semibold text-purple-700 dark:text-purple-300">🍪 Snack 2</p>
                                  <p className="text-gray-600 dark:text-gray-400">{checkIn.snack2_option}</p>
                                  <p className="text-purple-600">{checkIn.snack2_calories} cal</p>
                                </div>
                              )}
                              {checkIn.dinner_option && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                                  <p className="font-semibold text-indigo-700 dark:text-indigo-300">🌙 Dinner</p>
                                  <p className="text-gray-600 dark:text-gray-400">{checkIn.dinner_option}</p>
                                  <p className="text-indigo-600">{checkIn.dinner_calories} cal</p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                              <span>💧 Apă: {checkIn.water_intake || 0}/8</span>
                              <span>🏃 Exerciții: {checkIn.exercise_completed ? `✅ (${checkIn.exercise_calories_burned || 0} cal)` : '❌'}</span>
                              <span className="font-bold text-orange-600">📊 Total: {checkIn.total_calories || 0} cal</span>
                            </div>
                          </div>
                        ))}
                        {userCheckIns.length === 0 && (
                          <p className="text-center text-gray-500 py-8">Nicio activitate înregistrată</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog Creare Utilizator */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-6 h-6 text-emerald-600" />
              Adaugă Utilizator Nou
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            
            // Validare
            if (!newUserData.email || !newUserData.password || !newUserData.first_name || !newUserData.last_name) {
              alert('❌ Completează toate câmpurile obligatorii!');
              return;
            }
            
            // Creează utilizator prin endpoint de register
            localApi.auth.register({
              ...newUserData,
              name: `${newUserData.first_name} ${newUserData.last_name}`,
              isRegister: true
            })
            .then(() => {
              alert('✅ Utilizator creat cu succes!');
              setShowCreateUser(false);
              setNewUserData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                phone: '',
                role: 'user'
              });
              queryClient.invalidateQueries(['allUsers']);
            })
            .catch((error) => {
              alert('❌ Eroare: ' + error.message);
            });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email *</Label>
              <Input
                id="new-email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-firstname">Prenume *</Label>
                <Input
                  id="new-firstname"
                  type="text"
                  value={newUserData.first_name}
                  onChange={(e) => setNewUserData({...newUserData, first_name: e.target.value})}
                  placeholder="Ion"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lastname">Nume *</Label>
                <Input
                  id="new-lastname"
                  type="text"
                  value={newUserData.last_name}
                  onChange={(e) => setNewUserData({...newUserData, last_name: e.target.value})}
                  placeholder="Popescu"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-phone">Telefon</Label>
              <Input
                id="new-phone"
                type="tel"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                placeholder="+40 123 456 789"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Parolă *</Label>
              <Input
                id="new-password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                placeholder="Minim 6 caractere"
                minLength={6}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-role">Rol</Label>
              <Select 
                value={newUserData.role} 
                onValueChange={(value) => setNewUserData({...newUserData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateUser(false)}
                className="flex-1"
              >
                Anulează
              </Button>
              <Button 
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Creează
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Vizualizare Backup */}
      <Dialog open={selectedBackup !== null} onOpenChange={() => setSelectedBackup(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-600" />
              Conținut Backup: {selectedBackup?.filename}
            </DialogTitle>
          </DialogHeader>
          {selectedBackup && (() => {
            let backupContent = null;
            try {
              backupContent = selectedBackup.backup_data ? JSON.parse(selectedBackup.backup_data) : null;
            } catch (e) {
              backupContent = null;
            }

            return (
              <div className="space-y-4">
                {/* Info Backup */}
                <div className="p-4 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))] rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Fișier:</strong> {selectedBackup.filename}</div>
                    <div><strong>Mărime:</strong> {selectedBackup.size_mb} MB</div>
                    <div><strong>Data:</strong> {new Date(selectedBackup.created_at).toLocaleString('ro-RO')}</div>
                    <div><strong>Tip:</strong> {selectedBackup.auto_generated ? '🔄 Automat' : '👤 Manual'}</div>
                  </div>
                </div>

                {/* Conținut Tabele */}
                {backupContent ? (
                  <div className="space-y-4">
                    {Object.entries(backupContent).map(([tableName, rows]) => (
                      <Card key={tableName} className="ios-card">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>📊 {tableName}</span>
                            <Badge>{rows.length} înregistrări</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto max-h-40">
                            <pre className="text-xs">
                              {JSON.stringify(rows.slice(0, 3), null, 2)}
                              {rows.length > 3 && `\n... și încă ${rows.length - 3} înregistrări`}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>⚠️ Conținutul backup-ului nu este disponibil</p>
                    <p className="text-xs mt-2">Backup-ul poate fi de tip SQL sau fișier extern</p>
                  </div>
                )}

                {/* Butoane Acțiuni */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      if (backupContent) {
                        const dataStr = JSON.stringify(backupContent, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = selectedBackup.filename;
                        link.click();
                        URL.revokeObjectURL(url);
                        alert('✅ Backup descărcat!');
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!backupContent}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Descarcă Backup
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedBackup(null)}
                    className="flex-1"
                  >
                    Închide
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
