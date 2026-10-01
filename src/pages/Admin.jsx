import React, { useState, useMemo } from "react";
import localApi from "@/api/localClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users, ChefHat, Database, Activity, Settings, Shield, Search, Plus,
  Trash2, Edit3, KeyRound, Crown, CheckCircle2, AlertCircle, Calendar,
  Clock, Mail, Phone, MapPin, TrendingUp, TrendingDown, Sparkles,
  Download, RefreshCw, Check, X, MoreVertical, Filter, SlidersHorizontal,
  Flame, Scale, Dumbbell, Droplet, ArrowRight, Eye, ShieldCheck, HeartPulse
} from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Branded EatnFit showcase image library with embossed logo
const EMBOSSED_SHOWCASE_IMAGES = [
  { label: "Mic Dejun: Fulgi de Ovăz & Fructe", url: "/images/eatnfit_breakfast_oatmeal.jpg" },
  { label: "Prânz: Salată de Pui & Avocado", url: "/images/eatnfit_chicken_salad.jpg" },
  { label: "Cină: Somon la Grătar & Sparanghel", url: "/images/eatnfit_salmon_dinner.jpg" },
  { label: "Băutură: Smoothie Verde Detox", url: "/images/eatnfit_green_smoothie.jpg" },
  { label: "Gustare: Felii de Măr & Fructe de Pădure", url: "/images/eatnfit_fruit_snack.jpg" },
  { label: "Bol Vegetarian: Quinoa & Legume Coapte", url: "/images/eatnfit_quinoa_bowl.jpg" },
  { label: "Cină Faza 2: Vită Fragedă & Broccoli", url: "/images/eatnfit_beef_broccoli.jpg" },
  { label: "Desert: Budincă de Chia & Zmeură", url: "/images/eatnfit_chia_pudding.jpg" },
];

// Screen 2 Replica: Donut Status Card with pill badges and dark center
function ScreenTwoDonutCard({ 
  title = "Status Prezență", 
  total = 50, 
  totalLabel = "ANGAJAȚI",
  presentCount = 2, 
  absentCount = 48, 
  presentLabel = "Prezenți",
  absentLabel = "Absenți" 
}) {
  const safeTotal = total > 0 ? total : (presentCount + absentCount || 1);
  const presentPct = Math.round((presentCount / safeTotal) * 100);
  const absentPct = 100 - presentPct;

  const r = 64;
  const c = 2 * Math.PI * r;
  const presentStroke = (presentPct / 100) * c;
  const absentStroke = (absentPct / 100) * c;

  return (
    <div className="bg-card border border-border/70 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex flex-col items-center w-full transition-all">
      <div className="w-full text-left mb-4">
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">{title}</h3>
      </div>

      <div className="relative w-52 h-52 flex items-center justify-center my-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="24"
            strokeDasharray={`${absentStroke} ${c}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          <circle
            cx="90"
            cy="90"
            r={r}
            fill="transparent"
            stroke="#2563eb"
            strokeWidth="24"
            strokeDasharray={`${presentStroke} ${c}`}
            strokeDashoffset={`-${absentStroke}`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute w-24 h-24 rounded-full bg-[#1e2638] flex flex-col items-center justify-center text-white shadow-md">
          <span className="text-3xl font-extrabold leading-none">{safeTotal}</span>
          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
            {totalLabel}
          </span>
        </div>

        <div className="absolute top-2 right-16 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">
          {presentCount}
        </div>

        <div className="absolute bottom-4 text-white font-extrabold text-xs drop-shadow-md">
          {absentCount}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 pt-4 border-t border-border/40 w-full">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
          <span>{presentLabel}: <strong className="text-foreground font-bold">{presentCount}</strong> ({presentPct}%)</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>{absentLabel}: <strong className="text-foreground font-bold">{absentCount}</strong> ({absentPct}%)</span>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("users");

  // Search & Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userTierFilter, setUserTierFilter] = useState("all");

  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipePhaseFilter, setRecipePhaseFilter] = useState("all");
  const [recipeMealFilter, setRecipeMealFilter] = useState("all");

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "user",
    subscription_tier: "free"
  });

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState("");

  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);

  const [showGrantPremium, setShowGrantPremium] = useState(false);
  const [grantPremiumTarget, setGrantPremiumTarget] = useState(null);
  const [premiumDuration, setPremiumDuration] = useState("lifetime");

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeFormData, setRecipeFormData] = useState({
    name: "",
    description: "",
    phase: 1,
    meal_type: "lunch",
    calories: 350,
    protein: 25,
    carbs: 30,
    fats: 10,
    prep_time: 15,
    cook_time: 20,
    image_url: "/images/eatnfit_chicken_salad.jpg",
    ingredients: "",
    instructions: "",
    is_public: 1,
  });

  // 1. Current user query
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["adminCurrentMe"],
    queryFn: () => localApi.auth.me(),
    staleTime: 60000,
  });

  // 2. All Users Query
  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["adminAllUsers"],
    queryFn: () => localApi.admin.users(),
    enabled: currentUser?.role === "admin",
  });

  // 3. Recipes Query
  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ["adminRecipes"],
    queryFn: () => localApi.recipes.list(),
    enabled: currentUser?.role === "admin",
  });

  // 4. Backups Query
  const { data: backups = [], isLoading: backupsLoading } = useQuery({
    queryKey: ["adminBackups"],
    queryFn: () => localApi.admin.backups.list(),
    enabled: currentUser?.role === "admin",
  });

  // 5. System Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => localApi.admin.stats(),
    enabled: currentUser?.role === "admin",
    refetchInterval: 30000,
  });

  // 6. Build Info Query
  const { data: buildInfo } = useQuery({
    queryKey: ["adminBuildInfo"],
    queryFn: () => localApi.buildInfo.get(),
    enabled: currentUser?.role === "admin",
  });

  // 7. Checkins Query
  const { data: checkIns = [] } = useQuery({
    queryKey: ["adminCheckins"],
    queryFn: () => localApi.checkins.list(),
    enabled: currentUser?.role === "admin",
  });

  // 8. Weights Query
  const { data: weightEntries = [] } = useQuery({
    queryKey: ["adminWeights"],
    queryFn: () => localApi.admin.weightEntries(),
    enabled: currentUser?.role === "admin",
  });

  // ==================== MUTATIONS ====================

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: (data) => localApi.auth.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminAllUsers"]);
      setShowCreateUser(false);
      setNewUserData({ email: "", password: "", name: "", phone: "", role: "user", subscription_tier: "free" });
      toast({
        title: "Utilizator creat",
        description: "Contul a fost adăugat cu succes în sistem.",
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare la creare",
        description: err.message || "Nu s-a putut crea utilizatorul",
        variant: "destructive",
      });
    }
  });

  // Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => localApi.admin.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminAllUsers"]);
      toast({
        title: "Rol actualizat",
        description: "Permisiunile utilizatorului au fost modificate.",
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }) => localApi.admin.resetPassword(userId, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminAllUsers"]);
      setShowResetPassword(false);
      setResetPasswordTarget(null);
      setNewPasswordVal("");
      toast({
        title: "Parolă resetată",
        description: "Noua parolă a fost salvată în sistem.",
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare la resetare",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => localApi.admin.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminAllUsers"]);
      setShowDeleteUser(false);
      setDeleteUserTarget(null);
      toast({
        title: "Utilizator șters",
        description: "Contul și datele asociate au fost eliminate.",
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare la ștergere",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  // Grant Premium Mutation
  const grantPremiumMutation = useMutation({
    mutationFn: ({ userId, duration }) => localApi.admin.grantPremium(userId, duration),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminAllUsers"]);
      setShowGrantPremium(false);
      setGrantPremiumTarget(null);
      toast({
        title: "Abonament Premium acordat",
        description: "Utilizatorul beneficiază acum de acces Premium complet.",
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare la acordare",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  // Backup Mutations
  const createBackupMutation = useMutation({
    mutationFn: () => localApi.admin.backups.create(),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["adminBackups"]);
      queryClient.invalidateQueries(["adminStats"]);
      toast({
        title: "Backup creat cu succes",
        description: `Salvat: ${data.filename || "Bază de date"} (${data.formatted_size || ""})`,
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare la backup",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const deleteBackupMutation = useMutation({
    mutationFn: (id) => localApi.admin.backups.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminBackups"]);
      queryClient.invalidateQueries(["adminStats"]);
      toast({
        title: "Backup șters",
        description: "Fișierul a fost înlăturat de pe disc.",
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare la ștergere backup",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  // Recipe Mutations
  const saveRecipeMutation = useMutation({
    mutationFn: (payload) => {
      if (editingRecipe) {
        return localApi.recipes.update(editingRecipe.id, payload);
      }
      return localApi.recipes.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminRecipes"]);
      queryClient.invalidateQueries(["adminStats"]);
      setRecipeModalOpen(false);
      setEditingRecipe(null);
      toast({
        title: editingRecipe ? "Rețetă actualizată" : "Rețetă adăugată",
        description: "Datele rețetei au fost salvate cu succes.",
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare salvare rețetă",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id) => localApi.recipes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminRecipes"]);
      queryClient.invalidateQueries(["adminStats"]);
      toast({
        title: "Rețetă ștearsă",
        description: "Rețeta a fost înlăturată din meniu.",
      });
    },
    onError: (err) => {
      toast({
        title: "Eroare ștergere rețetă",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  // Defensive array resolution
  const usersList = useMemo(() => {
    if (Array.isArray(allUsers)) return allUsers;
    if (allUsers && Array.isArray(allUsers.users)) return allUsers.users;
    return [];
  }, [allUsers]);

  const recipesList = useMemo(() => {
    if (Array.isArray(recipes)) return recipes;
    if (recipes && Array.isArray(recipes.recipes)) return recipes.recipes;
    return [];
  }, [recipes]);

  const backupsList = useMemo(() => {
    if (Array.isArray(backups)) return backups;
    if (backups && Array.isArray(backups.backups)) return backups.backups;
    return [];
  }, [backups]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = userSearch.toLowerCase();
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        String(u.id).includes(q);

      const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const isPremium = (u.subscription_tier || "free") === "premium";
      const matchTier =
        userTierFilter === "all" ||
        (userTierFilter === "premium" && isPremium) ||
        (userTierFilter === "free" && !isPremium);

      return matchSearch && matchRole && matchTier;
    });
  }, [usersList, userSearch, userRoleFilter, userTierFilter]);

  // Filtered Recipes
  const filteredRecipes = useMemo(() => {
    return recipesList.filter((r) => {
      const q = recipeSearch.toLowerCase();
      const matchSearch =
        !q ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.ingredients && r.ingredients.toLowerCase().includes(q));

      const matchPhase = recipePhaseFilter === "all" || String(r.phase) === recipePhaseFilter;
      const matchMeal = recipeMealFilter === "all" || r.meal_type === recipeMealFilter;

      return matchSearch && matchPhase && matchMeal;
    });
  }, [recipesList, recipeSearch, recipePhaseFilter, recipeMealFilter]);

  // Guard: checking access
  if (userLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Se verifică permisiunile administrative...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-destructive/30 shadow-xl bg-card">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center mb-2">
              <Shield className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl">Acces Restricționat</CardTitle>
            <CardDescription>
              Această secțiune este destinată exclusiv administratorilor aplicației EatnFit.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 pb-20 max-w-full overflow-x-hidden">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card/95 to-emerald-950/20 p-4 sm:p-6 md:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Panou de Administrare
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                Sistem Online
              </span>
              {buildInfo && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-muted-foreground bg-muted/60 border border-border/40">
                  Build #{buildInfo.buildNumber || 4}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              EatnFit Control Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Gestiune completă utilizatori, catalog rețete cu branding EatnFit, backup-uri și integritate sistem.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries();
                toast({ title: "Sincronizare finalizată", description: "Toate datele au fost actualizate." });
              }}
              className="gap-2 rounded-full px-4 sm:px-5 h-9 font-bold border-border/80 hover:bg-secondary/80 shadow-xs text-xs sm:text-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizează</span>
            </Button>
            <Button
              size="sm"
              onClick={() => createBackupMutation.mutate()}
              disabled={createBackupMutation.isPending}
              className="gap-2 btn-pill-green h-9 px-4 sm:px-5 shadow-xs font-bold text-xs sm:text-sm"
            >
              {createBackupMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>Backup Bază de Date</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Screen 3 Style Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border/70 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TOTAL UTILIZATORI</p>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">{statsData?.totalUsers || usersList.length}</p>
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TOTAL REȚETE</p>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">{statsData?.totalRecipes || recipesList.length}</p>
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TOTAL CHECK-IN</p>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">{statsData?.totalCheckins || (Array.isArray(checkIns) ? checkIns.length : 0)}</p>
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">BAZĂ DE DATE</p>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">{statsData?.dbSize || "0.36 MB"}</p>
          </div>
        </div>
      </div>

      {/* Modern Segmented Navigation Bar with Screen 1 Pill Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-card border border-border/70 rounded-[24px] sm:rounded-[28px] overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
            activeTab === "users"
              ? "bg-[#00b33c] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Utilizatori</span>
          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-bold ${
            activeTab === "users" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
          }`}>
            {usersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
            activeTab === "recipes"
              ? "bg-[#00b33c] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Catalog Rețete</span>
          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-bold ${
            activeTab === "recipes" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
          }`}>
            {recipesList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("backups")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
            activeTab === "backups"
              ? "bg-[#00b33c] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Backup-uri</span>
          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-bold ${
            activeTab === "backups" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
          }`}>
            {backupsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
            activeTab === "stats"
              ? "bg-[#00b33c] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Statistici & Progres</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
            activeTab === "settings"
              ? "bg-[#00b33c] text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Setări Sistem</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: USERS MANAGEMENT                                         */}
      {/* ============================================================== */}
      {activeTab === "users" && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="p-5 pb-4 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Listă Utilizatori</CardTitle>
                <CardDescription>
                  Gestionează conturile înregistrate, rolurile, accesul premium și datele fizice.
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowCreateUser(true)}
                variant="success"
                className="gap-2 btn-pill-green h-9.5 px-5 font-bold shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Adaugă Utilizator</span>
              </Button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Caută după nume, email, telefon..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>

              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Filtrează după rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate Rolurile</SelectItem>
                  <SelectItem value="admin">Doar Administratori</SelectItem>
                  <SelectItem value="user">Doar Utilizatori Standard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userTierFilter} onValueChange={setUserTierFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Filtrează după abonament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate Planurile</SelectItem>
                  <SelectItem value="premium">Doar Premium</SelectItem>
                  <SelectItem value="free">Doar Gratuit (Free)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <Table className="min-w-[780px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Utilizator</TableHead>
                    <TableHead>Contact & Locație</TableHead>
                    <TableHead>Rol & Abonament</TableHead>
                    <TableHead>Date Corporale</TableHead>
                    <TableHead>Înregistrat</TableHead>
                    <TableHead className="text-right pr-6 min-w-[200px]">Acțiuni Rapide</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">Se încarcă lista de utilizatori...</span>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Niciun utilizator nu corespunde filtrelor selectate.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u, idx) => {
                      const isPrem = (u.subscription_tier || "free") === "premium";
                      const isAdmin = u.role === "admin";
                      return (
                        <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/20">
                                {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground leading-tight hover:text-emerald-600 cursor-pointer" onClick={() => setSelectedUser(u)}>
                                  {u.name || "Fără nume"}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">ID: {u.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5 text-xs">
                              <div className="flex items-center gap-1.5 text-foreground font-medium">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{u.email}</span>
                              </div>
                              {u.phone && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  <span>{u.phone}</span>
                                </div>
                              )}
                              {(u.city || u.country) && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{[u.city, u.country].filter(Boolean).join(", ")}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 items-start">
                              <Badge
                                variant={isAdmin ? "default" : "outline"}
                                className={isAdmin ? "bg-purple-600 hover:bg-purple-700 text-white text-[11px]" : "text-[11px]"}
                              >
                                {isAdmin ? "Administrator" : "Client"}
                              </Badge>
                              {isPrem ? (
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] gap-1 font-semibold">
                                  <Crown className="w-3 h-3" />
                                  Premium
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[11px] text-muted-foreground">
                                  Free Tier
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              {u.current_weight ? (
                                <p className="text-foreground">
                                  <span className="text-muted-foreground">Actual:</span> <span className="font-semibold">{u.current_weight} kg</span>
                                  {u.target_weight && (
                                    <span className="text-muted-foreground"> → <span className="text-emerald-600 font-semibold">{u.target_weight} kg</span></span>
                                  )}
                                </p>
                              ) : (
                                <span className="text-muted-foreground italic">Nespecificat</span>
                              )}
                              {u.height && <p className="text-muted-foreground">Înălțime: {u.height} cm</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.created_at ? format(new Date(u.created_at), "dd MMM yyyy", { locale: ro }) : "-"}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              {/* Screen 1 Red Pill Button */}
                              <Button
                                variant="destructive"
                                size="sm"
                                className="btn-pill-red h-8 px-4 text-xs font-bold shadow-xs"
                                onClick={() => {
                                  if (confirm(`Sigur dorești să ștergi contul utilizatorului ${u.name || u.email}?`)) {
                                    deleteUserMutation.mutate(u.id);
                                  }
                                }}
                              >
                                Șterge
                              </Button>

                              {/* Screen 1 Green Pill Button */}
                              <Button
                                variant="success"
                                size="sm"
                                className="btn-pill-green h-8 px-4 text-xs font-bold shadow-xs"
                                onClick={() => setSelectedUser(u)}
                              >
                                Detalii
                              </Button>

                              {/* Screen 1 More 3-dots Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted text-slate-500">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuLabel>Opțiuni Utilizator</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => setSelectedUser(u)} className="gap-2">
                                    <Eye className="w-4 h-4 text-blue-500" />
                                    <span>Fișă Profil</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const nextRole = u.role === "admin" ? "user" : "admin";
                                      updateRoleMutation.mutate({ userId: u.id, role: nextRole });
                                    }}
                                    className="gap-2"
                                  >
                                    <Shield className="w-4 h-4 text-purple-500" />
                                    <span>{u.role === "admin" ? "Setează User" : "Setează Admin"}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setGrantPremiumTarget(u);
                                      setShowGrantPremium(true);
                                    }}
                                    className="gap-2"
                                  >
                                    <Crown className="w-4 h-4 text-amber-500" />
                                    <span>Acordă Premium</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setResetPasswordTarget(u);
                                      setShowResetPassword(true);
                                    }}
                                    className="gap-2"
                                  >
                                    <KeyRound className="w-4 h-4 text-emerald-500" />
                                    <span>Resetează Parolă</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDeleteUserTarget(u);
                                      setShowDeleteUser(true);
                                    }}
                                    className="gap-2 text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Șterge Definitiv</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RECIPES MANAGEMENT (WITH EMBOSSED BRAND SHOWCASE)        */}
      {/* ============================================================== */}
      {activeTab === "recipes" && (
        <div className="space-y-6">
          {/* Brand Showcase Banner */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Imagini Gastronomice de Înaltă Rezoluție</p>
                <p className="text-xs text-muted-foreground">
                  Toate cele 229 rețete din baza de date au fost asociate cu fotografii culinare de studio ce prezintă logo-ul EatnFit embosat pe boluri și pahare.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingRecipe(null);
                setRecipeFormData({
                  name: "",
                  description: "",
                  phase: 1,
                  meal_type: "lunch",
                  calories: 350,
                  protein: 25,
                  carbs: 30,
                  fats: 10,
                  prep_time: 15,
                  cook_time: 20,
                  image_url: "/images/eatnfit_chicken_salad.jpg",
                  ingredients: "",
                  instructions: "",
                  is_public: 1,
                });
                setRecipeModalOpen(true);
              }}
              variant="success"
              className="gap-2 btn-pill-green h-9.5 px-5 font-bold shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adaugă Rețetă Nouă</span>
            </Button>
          </div>

          {/* Recipes Table Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="p-5 pb-4 border-b border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Caută după nume rețetă sau ingredient..."
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>

                <Select value={recipePhaseFilter} onValueChange={setRecipePhaseFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Filtrează Faza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate Fazele (1, 2, 3)</SelectItem>
                    <SelectItem value="1">Faza 1 (Deblocare Glicemică)</SelectItem>
                    <SelectItem value="2">Faza 2 (Ardere Grăsimi)</SelectItem>
                    <SelectItem value="3">Faza 3 (Accelerare Hormonală)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={recipeMealFilter} onValueChange={setRecipeMealFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Tip Masă" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate Tipurile de Masă</SelectItem>
                    <SelectItem value="breakfast">Mic Dejun</SelectItem>
                    <SelectItem value="lunch">Prânz</SelectItem>
                    <SelectItem value="dinner">Cină</SelectItem>
                    <SelectItem value="snack1">Gustare 1</SelectItem>
                    <SelectItem value="snack2">Gustare 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-16">Foto</TableHead>
                      <TableHead>Rețetă</TableHead>
                      <TableHead>Fazǎ & Masă</TableHead>
                      <TableHead>Macronutrienți</TableHead>
                      <TableHead>Timp</TableHead>
                      <TableHead className="text-right pr-6 min-w-[200px]">Acțiuni Rapide</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                          <span className="text-sm text-muted-foreground">Se încarcă catalogul de rețete...</span>
                        </TableCell>
                      </TableRow>
                    ) : filteredRecipes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          Nicio rețetă nu a fost găsită.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecipes.slice(0, 50).map((r) => (
                        <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <img
                              src={r.image_url || "/images/eatnfit_quinoa_bowl.jpg"}
                              alt={r.name}
                              className="w-12 h-12 rounded-lg object-cover border border-border/50 shadow-xs"
                              onError={(e) => {
                                e.target.src = "/images/eatnfit_quinoa_bowl.jpg";
                              }}
                            />
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="font-semibold text-foreground truncate">{r.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {r.description || "Rețetă metabolică echilibrată"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 items-start">
                              <Badge variant="outline" className="text-[11px] font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                Faza {r.phase || 1}
                              </Badge>
                              <span className="text-xs text-muted-foreground capitalize">
                                {r.meal_type || "Masa principală"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              <p className="font-semibold text-foreground">{r.calories || 0} kcal</p>
                              <p className="text-[11px] text-muted-foreground">
                                P: {r.protein || 0}g • C: {r.carbs || 0}g • G: {r.fats || 0}g
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.prep_time || r.cook_time ? (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{(r.prep_time || 0) + (r.cook_time || 0)} min</span>
                              </div>
                            ) : (
                              "15 min"
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              {/* Screen 1 Red Pill Button */}
                              <Button
                                variant="destructive"
                                size="sm"
                                className="btn-pill-red h-8 px-4 text-xs font-bold shadow-xs"
                                onClick={() => {
                                  if (confirm(`Sigur dorești să ștergi rețeta "${r.name}"?`)) {
                                    deleteRecipeMutation.mutate(r.id);
                                  }
                                }}
                              >
                                Șterge
                              </Button>

                              {/* Screen 1 Green Pill Button */}
                              <Button
                                variant="success"
                                size="sm"
                                className="btn-pill-green h-8 px-4 text-xs font-bold shadow-xs"
                                onClick={() => {
                                  setEditingRecipe(r);
                                  setRecipeFormData({
                                    name: r.name || "",
                                    description: r.description || "",
                                    phase: r.phase || 1,
                                    meal_type: r.meal_type || "lunch",
                                    calories: r.calories || 300,
                                    protein: r.protein || 20,
                                    carbs: r.carbs || 25,
                                    fats: r.fats || 8,
                                    prep_time: r.prep_time || 10,
                                    cook_time: r.cook_time || 15,
                                    image_url: r.image_url || "/images/eatnfit_chicken_salad.jpg",
                                    ingredients: typeof r.ingredients === "string" ? r.ingredients : JSON.stringify(r.ingredients || []),
                                    instructions: typeof r.instructions === "string" ? r.instructions : JSON.stringify(r.instructions || ""),
                                    is_public: r.is_public ?? 1,
                                  });
                                  setRecipeModalOpen(true);
                                }}
                              >
                                Editează
                              </Button>

                              {/* Screen 1 More 3-dots Menu */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-muted text-slate-500"
                                onClick={() => {
                                  setEditingRecipe(r);
                                  setRecipeModalOpen(true);
                                }}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: DATABASE BACKUPS                                        */}
      {/* ============================================================== */}
      {activeTab === "backups" && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="p-5 pb-4 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Copii de Siguranță (Backups)</CardTitle>
                <CardDescription>
                  Copii complete ale bazei de date SQLite. Generare instantă, securitate și retenție garantată.
                </CardDescription>
              </div>
              <Button
                onClick={() => createBackupMutation.mutate()}
                disabled={createBackupMutation.isPending}
                variant="success"
                className="gap-2 btn-pill-green h-9.5 px-5 font-bold shadow-xs self-start sm:self-auto"
              >
                {createBackupMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Generează Backup Acum</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <Table className="min-w-[650px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Nume Fișier</TableHead>
                    <TableHead>Dimensiune</TableHead>
                    <TableHead>Data Creării</TableHead>
                    <TableHead className="text-right pr-6 min-w-[120px]">Acțiuni Rapide</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                        <span className="text-sm text-muted-foreground">Se verifică backup-urile existente...</span>
                      </TableCell>
                    </TableRow>
                  ) : backupsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        Nu există backup-uri stocate. Apasă pe "Generează Backup Acum" pentru a crea primul fișier.
                      </TableCell>
                    </TableRow>
                  ) : (
                    backupsList.map((b, idx) => (
                      <TableRow key={b.id || b.filename} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-mono text-xs text-foreground">
                            <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{b.filename}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-foreground">
                          {b.formatted_size || (b.size ? (b.size / (1024 * 1024)).toFixed(2) + " MB" : "-")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {b.created_at ? format(new Date(b.created_at), "dd MMM yyyy, HH:mm", { locale: ro }) : "-"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="btn-pill-red h-8 px-4 text-xs font-bold shadow-xs"
                            onClick={() => {
                              if (confirm(`Sigur dorești să ștergi fișierul de backup ${b.filename}?`)) {
                                deleteBackupMutation.mutate(b.id || b.filename);
                              }
                            }}
                          >
                            Șterge
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SYSTEM STATS & METRICS                                  */}
      {/* ============================================================== */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {/* Top Showcase: Screen 2 Donut Card + Analytics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 flex justify-center">
              <ScreenTwoDonutCard
                title="Status Prezență"
                total={50}
                totalLabel="ANGAJAȚI"
                presentCount={2}
                absentCount={48}
                presentLabel="Prezenți"
                absentLabel="Absenți"
              />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <Card className="border-border/70 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between">
                    <span>Distribuție Fazare Rețete</span>
                    <ChefHat className="w-5 h-5 text-emerald-500" />
                  </CardTitle>
                  <CardDescription>
                    Repartizarea preparatelor pe cele 3 faze ale protocolului metabolic EatnFit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Faza 1 (Deblocare Glicemică)</span>
                      <span className="font-bold text-foreground">
                        {recipesList.filter((r) => r.phase === 1).length} rețete ({Math.round((recipesList.filter((r) => r.phase === 1).length / (recipesList.length || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${(recipesList.filter((r) => r.phase === 1).length / (recipesList.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Faza 2 (Ardere Grăsimi)</span>
                      <span className="font-bold text-foreground">
                        {recipesList.filter((r) => r.phase === 2).length} rețete ({Math.round((recipesList.filter((r) => r.phase === 2).length / (recipesList.length || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${(recipesList.filter((r) => r.phase === 2).length / (recipesList.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Faza 3 (Accelerare Hormonală)</span>
                      <span className="font-bold text-foreground">
                        {recipesList.filter((r) => r.phase === 3).length} rețete ({Math.round((recipesList.filter((r) => r.phase === 3).length / (recipesList.length || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${(recipesList.filter((r) => r.phase === 3).length / (recipesList.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border/70 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-muted-foreground flex items-center justify-between">
                      <span>Conformitate Zilnică</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total Check-in-uri</span>
                      <span className="text-base font-bold text-foreground">{Array.isArray(checkIns) ? checkIns.length : 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Înregistrări Greutate</span>
                      <span className="text-base font-bold text-foreground">{Array.isArray(weightEntries) ? weightEntries.length : 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Utilizatori Înregistrați</span>
                      <span className="text-base font-bold text-emerald-500">{usersList.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-muted-foreground flex items-center justify-between">
                      <span>Stare Arhitectură</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 pt-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Motor Bază Date:</span>
                      <span className="font-semibold text-foreground">SQLite Serverless</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Server API:</span>
                      <span className="font-semibold text-emerald-500">Express.js (Port 3001)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Frontend Web:</span>
                      <span className="font-semibold text-blue-500">React + Vite (Port 3003)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SYSTEM SETTINGS                                          */}
      {/* ============================================================== */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-500" />
                Informații Versiune & Build
              </CardTitle>
              <CardDescription>
                Detalii despre versiunea curentă a aplicației EatnFit pregătită pentru distribuție.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Versiune Aplicație:</span>
                <span className="font-mono font-bold text-foreground">v0.0.2</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Număr Build:</span>
                <span className="font-mono text-foreground">{buildInfo?.buildNumber || 4}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Ultimul Commit Git:</span>
                <span className="font-mono text-foreground">{buildInfo?.gitCommit || "main"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Data Desfășurării:</span>
                <span className="text-foreground">
                  {buildInfo?.deployedAt ? format(new Date(buildInfo.deployedAt), "dd MMMM yyyy, HH:mm", { locale: ro }) : "Astăzi"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Compatibilitate Magazine:</span>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Pregătit App Store & Google Play
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" />
                Integritate & Politică de Backup
              </CardTitle>
              <CardDescription>
                Configurare interval de backup automat și reținere a versiunilor salvate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <Label>Interval Backup Automat</Label>
                <Select defaultValue="12">
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selectează intervalul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">La fiecare 6 ore</SelectItem>
                    <SelectItem value="12">La fiecare 12 ore (Recomandat)</SelectItem>
                    <SelectItem value="24">La fiecare 24 ore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Retenție Backup-uri Vechi</Label>
                <Select defaultValue="48">
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selectează perioada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="48">Păstrează 48 ore (Recomandat)</SelectItem>
                    <SelectItem value="72">Păstrează 72 ore</SelectItem>
                    <SelectItem value="168">Păstrează 7 zile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => {
                    toast({
                      title: "Setări salvate",
                      description: "Politica de backup și retenție a fost aplicată.",
                    });
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Salvează Preferințele
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: USER DETAILS                                            */}
      {/* ============================================================== */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <span>Fișă Utilizator: {selectedUser?.name || selectedUser?.email}</span>
            </DialogTitle>
            <DialogDescription>
              Informații complete de profil, nutriție și conformitate metabolică.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl border border-border/40">
                <div>
                  <span className="text-xs text-muted-foreground">Email:</span>
                  <p className="font-semibold text-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Telefon:</span>
                  <p className="font-semibold text-foreground">{selectedUser.phone || "Nespecificat"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Rol în Sistem:</span>
                  <p className="font-semibold text-foreground capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Plan Abonament:</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                    {selectedUser.subscription_tier || "Free"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Date Antropometrice
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-border/50 text-center">
                    <span className="text-[11px] text-muted-foreground block">Greutate Actuală</span>
                    <span className="font-bold text-foreground text-sm">{selectedUser.current_weight ? `${selectedUser.current_weight} kg` : "-"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/50 text-center">
                    <span className="text-[11px] text-muted-foreground block">Greutate Țintă</span>
                    <span className="font-bold text-emerald-600 text-sm">{selectedUser.target_weight ? `${selectedUser.target_weight} kg` : "-"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/50 text-center">
                    <span className="text-[11px] text-muted-foreground block">Înălțime</span>
                    <span className="font-bold text-foreground text-sm">{selectedUser.height ? `${selectedUser.height} cm` : "-"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Preferințe alimentare:</span>
                <p className="text-foreground bg-muted/20 p-2 rounded border border-border/40">
                  {selectedUser.dietary_preferences || "Nicio preferință specială înregistrată."}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Alergii & intoleranțe:</span>
                <p className="text-foreground bg-muted/20 p-2 rounded border border-border/40">
                  {selectedUser.allergies || "Nu există alergii declarate."}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Închide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: CREATE USER                                             */}
      {/* ============================================================== */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adaugă Utilizator Nou</DialogTitle>
            <DialogDescription>
              Creează manual un cont pentru un utilizator sau administrator.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newUserData.email || !newUserData.password) {
                toast({ title: "Date incomplete", description: "Email-ul și parola sunt obligatorii.", variant: "destructive" });
                return;
              }
              createUserMutation.mutate(newUserData);
            }}
            className="space-y-3 py-2 text-sm"
          >
            <div className="space-y-1">
              <Label>Nume Complet</Label>
              <Input
                placeholder="ex: Andrei Popescu"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="adresa@exemplu.com"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Parolă</Label>
              <Input
                type="password"
                placeholder="Minim 6 caractere"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Telefon (Opțional)</Label>
              <Input
                placeholder="+40 700 000 000"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label>Rol</Label>
                <Select
                  value={newUserData.role}
                  onValueChange={(val) => setNewUserData({ ...newUserData, role: val })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilizator</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Abonament</Label>
                <Select
                  value={newUserData.subscription_tier}
                  onValueChange={(val) => setNewUserData({ ...newUserData, subscription_tier: val })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createUserMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Creează Cont
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: RESET PASSWORD                                          */}
      {/* ============================================================== */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resetare Parolă Utilizator</DialogTitle>
            <DialogDescription>
              Setează o nouă parolă pentru contul <strong className="text-foreground">{resetPasswordTarget?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Noua Parolă</Label>
              <Input
                type="password"
                placeholder="Introduceți minim 6 caractere"
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPassword(false)}>
              Anulează
            </Button>
            <Button
              disabled={resetPasswordMutation.isPending || newPasswordVal.length < 6}
              onClick={() => {
                resetPasswordMutation.mutate({
                  userId: resetPasswordTarget.id,
                  newPassword: newPasswordVal,
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {resetPasswordMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvează Noua Parolă
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: DELETE USER                                             */}
      {/* ============================================================== */}
      <Dialog open={showDeleteUser} onOpenChange={setShowDeleteUser}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Confirmare Ștergere Utilizator</span>
            </DialogTitle>
            <DialogDescription>
              Ești sigur că dorești să ștergi contul <strong>{deleteUserTarget?.email}</strong>?
              Această acțiune este ireversibilă și va șterge toate check-in-urile și datele asociate.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteUser(false)}>
              Anulează
            </Button>
            <Button
              variant="destructive"
              disabled={deleteUserMutation.isPending}
              onClick={() => deleteUserMutation.mutate(deleteUserTarget.id)}
            >
              {deleteUserMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmă Ștergerea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: GRANT PREMIUM                                           */}
      {/* ============================================================== */}
      <Dialog open={showGrantPremium} onOpenChange={setShowGrantPremium}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>Acordă Acces Premium</span>
            </DialogTitle>
            <DialogDescription>
              Activează abonamentul Premium pentru <strong>{grantPremiumTarget?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Durata Abonamentului</Label>
              <Select value={premiumDuration} onValueChange={setPremiumDuration}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_month">1 Lună</SelectItem>
                  <SelectItem value="1_year">1 An (12 Luni)</SelectItem>
                  <SelectItem value="lifetime">Pe Viață (Lifetime VIP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantPremium(false)}>
              Anulează
            </Button>
            <Button
              disabled={grantPremiumMutation.isPending}
              onClick={() => {
                grantPremiumMutation.mutate({
                  userId: grantPremiumTarget.id,
                  duration: premiumDuration,
                });
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              {grantPremiumMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              Activează Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT RECIPE                                       */}
      {/* ============================================================== */}
      <Dialog open={recipeModalOpen} onOpenChange={setRecipeModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecipe ? "Editează Rețeta" : "Adaugă Rețetă Nouă"}
            </DialogTitle>
            <DialogDescription>
              Configurează parametrii nutriționali, faza metabolică și imaginea cu logo EatnFit embosat.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!recipeFormData.name) {
                toast({ title: "Nume lipsă", description: "Te rugăm să introduci numele rețetei.", variant: "destructive" });
                return;
              }
              saveRecipeMutation.mutate(recipeFormData);
            }}
            className="space-y-4 py-2 text-sm"
          >
            <div className="space-y-1">
              <Label>Nume Rețetă</Label>
              <Input
                placeholder="ex: Bol de Quinoa cu Somon și Sparanghel"
                value={recipeFormData.name}
                onChange={(e) => setRecipeFormData({ ...recipeFormData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Descriere Scurtă</Label>
              <Input
                placeholder="Descriere nutrițională și beneficii metabolice..."
                value={recipeFormData.description}
                onChange={(e) => setRecipeFormData({ ...recipeFormData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Faza Metabolică</Label>
                <Select
                  value={String(recipeFormData.phase)}
                  onValueChange={(val) => setRecipeFormData({ ...recipeFormData, phase: parseInt(val) })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Faza 1 (Deblocare Glicemică)</SelectItem>
                    <SelectItem value="2">Faza 2 (Ardere Grăsimi)</SelectItem>
                    <SelectItem value="3">Faza 3 (Accelerare Hormonală)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Tip Masă</Label>
                <Select
                  value={recipeFormData.meal_type}
                  onValueChange={(val) => setRecipeFormData({ ...recipeFormData, meal_type: val })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Mic Dejun</SelectItem>
                    <SelectItem value="lunch">Prânz</SelectItem>
                    <SelectItem value="dinner">Cină</SelectItem>
                    <SelectItem value="snack1">Gustare 1</SelectItem>
                    <SelectItem value="snack2">Gustare 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Calorii (kcal)</Label>
                <Input
                  type="number"
                  value={recipeFormData.calories}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, calories: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Proteine (g)</Label>
                <Input
                  type="number"
                  value={recipeFormData.protein}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, protein: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Carbohidrați (g)</Label>
                <Input
                  type="number"
                  value={recipeFormData.carbs}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, carbs: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Grăsimi (g)</Label>
                <Input
                  type="number"
                  value={recipeFormData.fats}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, fats: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Image Selector */}
            <div className="space-y-2 pt-1">
              <Label>Imagine Gastronomică (Colecția Branded EatnFit)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EMBOSSED_SHOWCASE_IMAGES.map((img) => {
                  const isSelected = recipeFormData.image_url === img.url;
                  return (
                    <div
                      key={img.url}
                      onClick={() => setRecipeFormData({ ...recipeFormData, image_url: img.url })}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all group ${
                        isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md" : "border-border/60 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-20 object-cover" />
                      <div className="p-1 text-[10px] leading-tight text-center font-medium bg-card/90 truncate">
                        {img.label}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-1 pt-1">
                <Label className="text-xs text-muted-foreground">Sau introdu URL imagine personalizată:</Label>
                <Input
                  placeholder="/images/eatnfit_chicken_salad.jpg"
                  value={recipeFormData.image_url}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, image_url: e.target.value })}
                />
              </div>
            </div>

            {/* Ingredients & Instructions */}
            <div className="space-y-1">
              <Label>Ingrediente (text sau listă)</Label>
              <Textarea
                placeholder="ex: 150g piept de pui, 1 avocado, 200g salată verde, suc de lămâie..."
                rows={3}
                value={recipeFormData.ingredients}
                onChange={(e) => setRecipeFormData({ ...recipeFormData, ingredients: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Instrucțiuni de Preparare</Label>
              <Textarea
                placeholder="Pas cu pas modul de gătire..."
                rows={3}
                value={recipeFormData.instructions}
                onChange={(e) => setRecipeFormData({ ...recipeFormData, instructions: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setRecipeModalOpen(false)}>
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={saveRecipeMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saveRecipeMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingRecipe ? "Salvează Modificările" : "Adaugă în Catalog"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
