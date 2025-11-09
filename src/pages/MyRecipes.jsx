import React, { useState } from "react";
import localApi from "@/api/localClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ChefHat, 
  Plus, 
  Trash2, 
  Edit, 
  Users,
  Lock,
  Image as ImageIcon,
  Save,
  X
} from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function MyRecipes() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    meal_type: 'breakfast',
    phase: null,
    is_public_to_friends: false,
  });

  const { data: myRecipes = [], isLoading } = useQuery({
    queryKey: ['myRecipes'],
    queryFn: () => localApi.userRecipes.list(),
  });

  // Get user info
  React.useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => localApi.userRecipes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRecipes']);
      setShowAddDialog(false);
      resetForm();
      toast({
        title: language === 'ro' ? "Rețetă adăugată!" : "Recipe added!",
        description: language === 'ro' ? "Rețeta ta a fost salvată cu succes." : "Your recipe was saved successfully.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localApi.userRecipes.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRecipes']);
      setEditingRecipe(null);
      resetForm();
      toast({
        title: language === 'ro' ? "Rețetă actualizată!" : "Recipe updated!",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localApi.userRecipes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRecipes']);
      toast({
        title: language === 'ro' ? "Rețetă ștearsă!" : "Recipe deleted!",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      meal_type: 'breakfast',
      phases: [], // Array pentru multiple faze
      is_public_to_friends: false,
    });
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description || '',
      image_url: recipe.image_url || '',
      meal_type: recipe.meal_type,
      phases: recipe.phases || (recipe.phase ? [recipe.phase] : []), // Convertește phase vechi la array
      is_public_to_friends: recipe.is_public_to_friends,
    });
    setShowAddDialog(true);
  };

  const togglePhase = (phaseNumber) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.includes(phaseNumber)
        ? prev.phases.filter(p => p !== phaseNumber)
        : [...prev.phases, phaseNumber]
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: language === 'ro' ? "Eroare" : "Error",
        description: language === 'ro' ? "Numele este obligatoriu" : "Name is required",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = {
      ...formData,
      name_ro: formData.name, // Salvăm numele în ambele limbi
    };

    if (editingRecipe) {
      updateMutation.mutate({ id: editingRecipe.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const mealTypeLabels = {
    breakfast: { ro: 'Mic dejun', en: 'Breakfast' },
    snack1: { ro: 'Gustare 1', en: 'Snack 1' },
    lunch: { ro: 'Prânz', en: 'Lunch' },
    snack2: { ro: 'Gustare 2', en: 'Snack 2' },
    dinner: { ro: 'Cină', en: 'Dinner' },
  };

  const phaseLabels = {
    1: { ro: 'Faza 1 (Destresare)', en: 'Phase 1 (Unwind)' },
    2: { ro: 'Faza 2 (Deblocare)', en: 'Phase 2 (Unlock)' },
    3: { ro: 'Faza 3 (Ardere)', en: 'Phase 3 (Unleash)' },
    null: { ro: 'Toate fazele', en: 'All phases' },
  };

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))] flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              {language === 'ro' ? 'Rețetele Mele' : 'My Recipes'}
            </h1>
            <p className="text-[rgb(var(--ios-text-secondary))] mt-1">
              {language === 'ro' 
                ? 'Creează și gestionează rețetele tale personalizate' 
                : 'Create and manage your custom recipes'}
            </p>
          </div>
          <Button
            onClick={() => {
              // Verifică limita FREE
              if (user?.subscription_plan === 'free' && myRecipes.length >= 1) {
                toast({
                  title: language === 'ro' ? '⚠️ Limită FREE atinsă' : '⚠️ FREE Limit Reached',
                  description: language === 'ro' 
                    ? 'Ai atins limita de 1 rețetă pentru contul FREE. Upgrade la Premium pentru rețete nelimitate!' 
                    : 'You reached the limit of 1 recipe for FREE account. Upgrade to Premium for unlimited recipes!',
                  variant: 'destructive',
                  duration: 5000,
                });
                return;
              }
              resetForm();
              setEditingRecipe(null);
              setShowAddDialog(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {language === 'ro' ? 'Adaugă Rețetă' : 'Add Recipe'}
          </Button>
        </div>

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-[rgb(var(--ios-text-secondary))]">
            {language === 'ro' ? 'Se încarcă...' : 'Loading...'}
          </div>
        ) : myRecipes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRecipes.map((recipe) => (
              <Card key={recipe.id} className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))] overflow-hidden">
                {recipe.image_url ? (
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-purple-400 dark:text-purple-600" />
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-[rgb(var(--ios-text-primary))] mb-1">
                        {recipe.name_ro || recipe.name}
                      </h3>
                      {recipe.description && (
                        <p className="text-sm text-[rgb(var(--ios-text-secondary))] line-clamp-2">
                          {recipe.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {mealTypeLabels[recipe.meal_type]?.[language] || recipe.meal_type}
                      </Badge>
                      {(recipe.phases && recipe.phases.length > 0) ? (
                        recipe.phases.map(p => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {phaseLabels[p]?.[language]}
                          </Badge>
                        ))
                      ) : recipe.phase ? (
                        <Badge variant="outline" className="text-xs">
                          {phaseLabels[recipe.phase]?.[language]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {phaseLabels[null][language]}
                        </Badge>
                      )}
                      {recipe.is_public_to_friends ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {language === 'ro' ? 'Public' : 'Public'}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          {language === 'ro' ? 'Privat' : 'Private'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(recipe)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {language === 'ro' ? 'Editează' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(recipe.id)}
                        disabled={deleteMutation.isPending}
                        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="ios-card ios-shadow-lg rounded-[20px] border-[rgb(var(--ios-border))]">
            <CardContent className="text-center py-12 text-[rgb(var(--ios-text-tertiary))]">
              <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium text-[rgb(var(--ios-text-secondary))] mb-2">
                {language === 'ro' ? 'Încă nu ai rețete personalizate' : 'No custom recipes yet'}
              </p>
              <p className="text-sm">
                {language === 'ro' ? 'Creează prima ta rețetă personalizată!' : 'Create your first custom recipe!'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                {editingRecipe 
                  ? (language === 'ro' ? 'Editează Rețeta' : 'Edit Recipe')
                  : (language === 'ro' ? 'Adaugă Rețetă Nouă' : 'Add New Recipe')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{language === 'ro' ? 'Nume' : 'Name'} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'ro' ? 'Ex: Omletă cu legume' : 'Ex: Veggie Omelette'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{language === 'ro' ? 'Descriere (opțional)' : 'Description (optional)'}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === 'ro' ? 'Descriere scurtă...' : 'Short description...'}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">{language === 'ro' ? 'Link Poză (opțional)' : 'Image URL (optional)'}</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                  {formData.image_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-[rgb(var(--ios-border))] flex-shrink-0">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ro' ? 'Tip Masă' : 'Meal Type'} *</Label>
                <Select value={formData.meal_type} onValueChange={(value) => setFormData({ ...formData, meal_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">{language === 'ro' ? 'Mic dejun' : 'Breakfast'}</SelectItem>
                    <SelectItem value="snack1">{language === 'ro' ? 'Gustare 1' : 'Snack 1'}</SelectItem>
                    <SelectItem value="lunch">{language === 'ro' ? 'Prânz' : 'Lunch'}</SelectItem>
                    <SelectItem value="snack2">{language === 'ro' ? 'Gustare 2' : 'Snack 2'}</SelectItem>
                    <SelectItem value="dinner">{language === 'ro' ? 'Cină' : 'Dinner'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ro' ? 'Faze compatibile (opțional)' : 'Compatible Phases (optional)'}</Label>
                <div className="space-y-2 p-3 bg-[rgb(var(--ios-bg-tertiary))] rounded-[12px] border border-[rgb(var(--ios-border))]">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phase1"
                      checked={formData.phases?.includes(1)}
                      onCheckedChange={() => togglePhase(1)}
                    />
                    <Label htmlFor="phase1" className="cursor-pointer font-normal">
                      {language === 'ro' ? 'Faza 1 (Destresare - Carbohidrați + Proteine)' : 'Phase 1 (Unwind)'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phase2"
                      checked={formData.phases?.includes(2)}
                      onCheckedChange={() => togglePhase(2)}
                    />
                    <Label htmlFor="phase2" className="cursor-pointer font-normal">
                      {language === 'ro' ? 'Faza 2 (Deblocare - Proteine + Legume)' : 'Phase 2 (Unlock)'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phase3"
                      checked={formData.phases?.includes(3)}
                      onCheckedChange={() => togglePhase(3)}
                    />
                    <Label htmlFor="phase3" className="cursor-pointer font-normal">
                      {language === 'ro' ? 'Faza 3 (Ardere - Echilibrat)' : 'Phase 3 (Unleash)'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-[14px] border border-emerald-200 dark:border-emerald-800">
                <Checkbox
                  id="public"
                  checked={formData.is_public_to_friends}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public_to_friends: checked })}
                />
                <Label htmlFor="public" className="cursor-pointer flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-[rgb(var(--ios-text-primary))]">
                    {language === 'ro' ? 'Vizibilă prietenilor mei' : 'Visible to my friends'}
                  </span>
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingRecipe(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  {language === 'ro' ? 'Anulează' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingRecipe 
                    ? (language === 'ro' ? 'Actualizează' : 'Update')
                    : (language === 'ro' ? 'Creează' : 'Create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

