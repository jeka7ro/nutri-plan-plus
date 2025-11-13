import React, { useState, useMemo, useRef } from "react";
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
  X,
  Loader2,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { getPhaseInfo } from "@/utils/phaseUtils";

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
    ingredients_text: '', // Ingrediente (unul per linie)
    instructions_text: '', // Instrucțiuni (pași)
    image_url: '',
    meal_type: 'breakfast',
    phase: null,
    is_public_to_friends: false,
  });
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

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

  const optionalLabel = language === 'ro' ? '(opțional)' : '(optional)';

  const keywordConfigs = [
    {
      regex: /pui|chicken|curcan|turkey/i,
      key: 'chicken',
      coreIngredients: {
        ro: ['300g piept pui'],
        en: ['300g chicken breast'],
      },
      optionalIngredients: {
        ro: ['200g broccoli', '1 ardei gras', '1 ceapă', 'Usturoi, ierburi, lămâie'],
        en: ['200g broccoli', '1 bell pepper', '1 onion', 'Garlic, herbs, lemon'],
      },
      instructionCore: {
        ro: 'Gătește pieptul de pui la tigaie/grătar până devine fraged.',
        en: 'Cook the chicken breast in a pan/grill until tender.',
      },
      instructionOptional: {
        ro: 'Adaugă legumele/condimentele opționale după gust.',
        en: 'Add the optional vegetables/seasonings to taste.',
      },
      benefit: {
        ro: 'Proteine de înaltă calitate',
        en: 'High-quality protein',
      },
      image: 'chicken',
    },
    {
      regex: /quinoa/i,
      key: 'quinoa',
      coreIngredients: {
        ro: ['1 cană quinoa, clătită'],
        en: ['1 cup quinoa, rinsed'],
      },
      optionalIngredients: {
        ro: [],
        en: [],
      },
      instructionCore: {
        ro: 'Fierbe quinoa 15 minute în apă cu puțină sare.',
        en: 'Cook quinoa for 15 minutes in lightly salted water.',
      },
      benefit: {
        ro: 'Carbohidrați complecși și fibre',
        en: 'Complex carbs and fiber',
      },
      image: 'quinoa',
    },
    {
      regex: /dovleac|pumpkin/i,
      key: 'pumpkin',
      coreIngredients: {
        ro: ['250g dovleac tăiat cuburi'],
        en: ['250g pumpkin, diced'],
      },
      optionalIngredients: {
        ro: [],
        en: [],
      },
      instructionCore: {
        ro: 'Coace sau gătește dovleacul până devine fraged.',
        en: 'Roast or cook the pumpkin until tender.',
      },
      benefit: {
        ro: 'Vitamina A și antioxidanți',
        en: 'Vitamin A and antioxidants',
      },
      image: 'pumpkin',
    },
    {
      regex: /broccoli/i,
      key: 'broccoli',
      coreIngredients: {
        ro: ['200g broccoli desfăcut buchețele'],
        en: ['200g broccoli florets'],
      },
      optionalIngredients: {
        ro: [],
        en: [],
      },
      instructionCore: {
        ro: 'Blanșează broccoli 3-4 minute sau gătește-l la abur.',
        en: 'Blanch the broccoli for 3-4 minutes or steam it.',
      },
      benefit: {
        ro: 'Vitamine C și K',
        en: 'Vitamins C and K',
      },
      image: 'broccoli',
    },
    {
      regex: /orez|rice/i,
      key: 'rice',
      coreIngredients: {
        ro: ['1 cană orez brun'],
        en: ['1 cup brown rice'],
      },
      optionalIngredients: {
        ro: [],
        en: [],
      },
      instructionCore: {
        ro: 'Fierbe orezul conform instrucțiunilor de pe ambalaj.',
        en: 'Cook rice according to package instructions.',
      },
      benefit: {
        ro: 'Carbohidrați complecși pentru energie',
        en: 'Complex carbs for energy',
      },
      image: 'rice',
    },
  ];

  const buildSmartRecipeFromName = (name) => {
    const lower = name.toLowerCase();
    const matchedConfigs = keywordConfigs.filter((config) => config.regex.test(lower));

    if (matchedConfigs.length === 0) {
      return null;
    }

    const ingredientSet = new Set();
    const instructionSteps = [];
    const optionalInstructionSet = new Set();
    const benefitSet = new Set();
    const imageKeywords = [];

    matchedConfigs.forEach((config) => {
      config.coreIngredients[language].forEach((item) => ingredientSet.add(item));
      if (config.optionalIngredients?.[language]?.length) {
        config.optionalIngredients[language].forEach((item) =>
          ingredientSet.add(`${item} ${optionalLabel}`)
        );
      }
      instructionSteps.push(config.instructionCore[language]);
      if (config.optionalIngredients?.[language]?.length && config.instructionOptional?.[language]) {
        optionalInstructionSet.add(config.instructionOptional[language]);
      }
      benefitSet.add(config.benefit[language]);
      imageKeywords.push(config.image);
    });

    // Step order: preparare componente, fierbere garnitură/quinoa, combinare
    const combinedInstructions = [];
    let stepCounter = 1;
    instructionSteps.forEach((step) => {
      combinedInstructions.push(`${stepCounter}. ${step}`);
      stepCounter += 1;
    });
    optionalInstructionSet.forEach((optionalStep) => {
      combinedInstructions.push(`${stepCounter}. ${optionalStep}`);
      stepCounter += 1;
    });
    combinedInstructions.push(
      `${stepCounter}. ${language === 'ro' ? 'Amestecă toate ingredientele și asezonează după gust.' : 'Combine all ingredients and season to taste.'}`
    );

    const description = Array.from(benefitSet).join(', ');

    return {
      ingredients: Array.from(ingredientSet),
      instructions: combinedInstructions,
      benefits: description,
      imageQuery: imageKeywords.join('+'),
    };
  };

  const handleSearchOnline = async () => {
    if (!formData.name.trim()) {
      toast({
        title: language === 'ro' ? '⚠️ Introdu numele rețetei' : '⚠️ Enter recipe name',
        variant: "destructive",
      });
      return;
    }

    setIsSearchingOnline(true);

    try {
      const recipeName = formData.name.toLowerCase();
      const smartRecipe = buildSmartRecipeFromName(recipeName);

      if (smartRecipe) {
        setFormData((prev) => ({
          ...prev,
          ingredients_text: smartRecipe.ingredients.join('\n'),
          instructions_text: smartRecipe.instructions.join('\n'),
          image_url: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=${smartRecipe.imageQuery}`,
          description: smartRecipe.benefits,
        }));
        setImagePreview(`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=${smartRecipe.imageQuery}`);
      } else {
        toast({
          title: language === 'ro' ? 'ℹ️ Sugestie limitată' : 'ℹ️ Limited suggestion',
          description: language === 'ro'
            ? 'Nu am recunoscut ingredientele principale. Completează manual.'
            : 'Could not detect main ingredients. Please fill in manually.',
        });
      }

      toast({
        title: language === 'ro' ? '✅ Rețetă completată!' : '✅ Recipe completed!',
        description: language === 'ro' 
          ? `Ingrediente, instrucțiuni și imagine generate pe baza rețetei tale.` 
          : `Ingredients, instructions and image generated from your recipe name.`,
      });

    } catch (error) {
      toast({
        title: language === 'ro' ? '❌ Eroare' : '❌ Error',
        description: language === 'ro' ? 'Nu s-a putut căuta online' : 'Could not search online',
        variant: "destructive",
      });
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ingredients_text: '',
      instructions_text: '',
      image_url: '',
      meal_type: 'breakfast',
      phases: [], // Array pentru multiple faze
      is_public_to_friends: false,
    });
    setImagePreview('');
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
    setImagePreview(recipe.image_url || '');
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

  const phaseAllowedData = useMemo(() => {
    if (!formData.phases || formData.phases.length === 0) return [];
    return formData.phases.map((phase) => {
      const info = getPhaseInfo(phase, language);
      return {
        phase,
        label: phaseLabels[phase]?.[language] || `Phase ${phase}`,
        allowed: (info?.allowedFoods?.yes || []).map((item) => item.toLowerCase()),
        forbidden: (info?.allowedFoods?.no || []).map((item) => item.toLowerCase()),
      };
    });
  }, [formData.phases, language]);

  const ingredientChecks = useMemo(() => {
    const lines = formData.ingredients_text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0 || phaseAllowedData.length === 0) {
      return [];
    }

    return lines.map((line) => {
      const normalized = line.toLowerCase();
      const matchedAllowed = [];
      const matchedForbidden = [];

      phaseAllowedData.forEach(({ label, allowed, forbidden }) => {
        if (forbidden.some((item) => normalized.includes(item))) {
          matchedForbidden.push(label);
        } else if (allowed.some((item) => normalized.includes(item))) {
          matchedAllowed.push(label);
        }
      });

      let status = 'unknown';
      let message;
      if (matchedForbidden.length > 0) {
        status = 'forbidden';
        message = language === 'ro'
          ? `Nu este permis în: ${matchedForbidden.join(', ')}`
          : `Not allowed in: ${matchedForbidden.join(', ')}`;
      } else if (matchedAllowed.length > 0) {
        status = 'allowed';
        message = language === 'ro'
          ? `Permis în: ${matchedAllowed.join(', ')}`
          : `Allowed in: ${matchedAllowed.join(', ')}`;
      } else {
        status = 'unknown';
        message = language === 'ro'
          ? 'Ingredient necunoscut pentru fazele selectate'
          : 'Unknown ingredient for selected phases';
      }

      return { line, status, message };
    });
  }, [formData.ingredients_text, phaseAllowedData, language]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: language === 'ro' ? 'Imagine prea mare' : 'Image too large',
        description: language === 'ro'
          ? 'Limita este de 8MB.'
          : 'Maximum allowed size is 8MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result;
      if (typeof dataUrl === 'string') {
        setFormData((prev) => ({ ...prev, image_url: dataUrl }));
        setImagePreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image_url: '' }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ingredientStatusIcon = (status) => {
    if (status === 'allowed') {
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
    if (status === 'forbidden') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <HelpCircle className="w-4 h-4 text-yellow-500" />;
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

        {/* Add/Edit Dialog - SCROLLABLE! */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'ro' ? 'Ex: Omletă cu legume' : 'Ex: Veggie Omelette'}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchOnline}
                    disabled={isSearchingOnline || !formData.name.trim()}
                    className="bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                  >
                    {isSearchingOnline ? '🔍...' : '🔍 Online'}
                  </Button>
                </div>
                <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                  {language === 'ro' 
                    ? '💡 Caută online pentru imagine automată' 
                    : '💡 Search online for auto image'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{language === 'ro' ? 'Descriere (opțional)' : 'Description (optional)'}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === 'ro' ? 'Descriere scurtă...' : 'Short description...'}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">{language === 'ro' ? 'Ingrediente (unul per linie)' : 'Ingredients (one per line)'}</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients_text}
                  onChange={(e) => setFormData({ ...formData, ingredients_text: e.target.value })}
                  placeholder=""
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">{language === 'ro' ? 'Instrucțiuni (pași de preparare)' : 'Instructions (preparation steps)'}</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions_text}
                  onChange={(e) => setFormData({ ...formData, instructions_text: e.target.value })}
                  placeholder=""
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>

              {formData.ingredients_text.trim().length > 0 && formData.phases.length === 0 && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/30 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-200">
                  {language === 'ro'
                    ? 'Selectează cel puțin o fază pentru a verifica dacă ingredientele sunt permise.'
                    : 'Select at least one phase to validate your ingredients.'}
                </div>
              )}

              {ingredientChecks.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {language === 'ro' ? 'Compatibilitate ingrediente' : 'Ingredient compatibility'}
                  </Label>
                  <div className="space-y-2">
                    {ingredientChecks.map(({ line, status, message }, index) => (
                      <div
                        key={`${line}-${index}`}
                        className={`flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm ${
                          status === 'allowed'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-200'
                            : status === 'forbidden'
                            ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200'
                            : 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {ingredientStatusIcon(status)}
                          <span className="font-medium">{line}</span>
                        </div>
                        <span className="text-xs">{message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="image_url">{language === 'ro' ? 'Poză rețetă (opțional)' : 'Recipe image (optional)'}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {language === 'ro' ? 'Încarcă din galerie/cameră' : 'Upload from gallery/camera'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleRemoveImage}
                      disabled={!imagePreview}
                      className="text-red-600 hover:text-red-700 disabled:text-gray-400"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {language === 'ro' ? 'Șterge imaginea' : 'Remove image'}
                    </Button>
                  </div>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, image_url: value });
                      setImagePreview(value);
                    }}
                    placeholder="https://..."
                  />
                  {imagePreview && (
                    <div className="w-full max-w-[200px] h-40 rounded-xl overflow-hidden border-2 border-[rgb(var(--ios-border))]">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
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

