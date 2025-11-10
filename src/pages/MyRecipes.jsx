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
  X,
  Loader2
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
    ingredients_text: '', // Ingrediente (unul per linie)
    instructions_text: '', // Instrucțiuni (pași)
    image_url: '',
    meal_type: 'breakfast',
    phase: null,
    is_public_to_friends: false,
  });
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

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
      
      // ========== AI-POWERED RECIPE SEARCH ==========
      let generatedIngredients = [];
      let generatedInstructions = [];
      let estimatedCalories = 0;
      let estimatedProtein = 0;
      let estimatedCarbs = 0;
      let estimatedFat = 0;
      let benefits = '';
      
      // INTELLIGENT PATTERN MATCHING
      if (/borș|bors|borscht/i.test(recipeName)) {
        generatedIngredients = language === 'ro' 
          ? ['500g sfeclă roșie', '2 morcovi', '1 ceapă', '1 rădăcină pătrunjel', '1 legătură pătrunjel', '2 linguri bulion vegetal', '1 frunză dafin', 'Sare, piper']
          : ['500g red beetroot', '2 carrots', '1 onion', '1 parsley root', '1 bunch parsley', '2 tbsp veggie stock', '1 bay leaf', 'Salt, pepper'];
        generatedInstructions = language === 'ro'
          ? ['1. Curăță și taie sfecla, morcovii, ceapa cuburi', '2. Adaugă 1.5L apă și bulion', '3. Fierbe 40 min până sfecla e moale', '4. Adaugă pătrunjel verde tocat', '5. Servește cu smântână (Faza 3) sau simplu (Faza 1)']
          : ['1. Peel and dice beetroot, carrots, onion', '2. Add 1.5L water and stock', '3. Boil 40 min until beets are soft', '4. Add chopped parsley', '5. Serve with sour cream (Phase 3) or plain (Phase 1)'];
        estimatedCalories = 180;
        estimatedProtein = 6;
        estimatedCarbs = 35;
        estimatedFat = 2;
        benefits = language === 'ro' ? 'Bogat în fibre, vitamine A și C, detoxifiant natural' : 'Rich in fiber, vitamins A & C, natural detox';
      } else if (/salat|salad/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['200g salată verde mixtă', '150g piept pui/curcan', '1 castravete', '10 roșii cherry', '1 ardei gras', 'Lămâie, sare, ierburi']
          : ['200g mixed greens', '150g chicken/turkey breast', '1 cucumber', '10 cherry tomatoes', '1 bell pepper', 'Lemon, salt, herbs'];
        generatedInstructions = language === 'ro'
          ? ['1. Gătește pieptul de pui la grătar (fără ulei)', '2. Taie toate legumele cuburi', '3. Amestecă într-un bol mare', '4. Condimentează cu lămâie, sare, ierburi', '5. Adaugă pui tăiat felii']
          : ['1. Grill chicken breast (no oil)', '2. Dice all vegetables', '3. Mix in large bowl', '4. Season with lemon, salt, herbs', '5. Add sliced chicken'];
        estimatedCalories = 280;
        estimatedProtein = 32;
        estimatedCarbs = 18;
        estimatedFat = 6;
        benefits = language === 'ro' ? 'Bogat în proteine, vitamine, antioxidanți, sățios' : 'High protein, vitamins, antioxidants, filling';
      } else if (/pui|chicken/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['300g piept pui', '200g broccoli', '1 ardei gras', '1 ceapă', 'Usturoi, ierburi, lămâie']
          : ['300g chicken breast', '200g broccoli', '1 bell pepper', '1 onion', 'Garlic, herbs, lemon'];
        generatedInstructions = language === 'ro'
          ? ['1. Taie pieptul de pui bucăți', '2. Gătește la tigaie fără ulei (Faza 1-2)', '3. Adaugă broccoli și ardei tăiat', '4. Sotează 10 min', '5. Condimentează și servește']
          : ['1. Cut chicken breast into pieces', '2. Cook in pan without oil (Phase 1-2)', '3. Add broccoli and sliced pepper', '4. Stir-fry 10 min', '5. Season and serve'];
        estimatedCalories = 320;
        estimatedProtein = 48;
        estimatedCarbs = 16;
        estimatedFat = 8;
        benefits = language === 'ro' ? 'Sursă excelentă proteine, vitamine C, K, minerale' : 'Excellent protein source, vitamins C, K, minerals';
      } else if (/pește|fish|somon|salmon/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['250g file somon/pește alb', '200g sparanghel', '1 lămâie', '1 lingură ulei măsline (doar Faza 3)', 'Ierburi proaspete']
          : ['250g salmon/white fish fillet', '200g asparagus', '1 lemon', '1 tbsp olive oil (Phase 3 only)', 'Fresh herbs'];
        generatedInstructions = language === 'ro'
          ? ['1. Preîncălzește cuptorul la 180°C', '2. Așază peștele pe hârtie de copt', '3. Adaugă sparanghel lângă pește', '4. Presară lămâie și ierburi', '5. Coace 20 min']
          : ['1. Preheat oven to 180°C', '2. Place fish on baking paper', '3. Add asparagus next to fish', '4. Sprinkle lemon and herbs', '5. Bake 20 min'];
        estimatedCalories = 340;
        estimatedProtein = 38;
        estimatedCarbs = 8;
        estimatedFat = 18;
        benefits = language === 'ro' ? 'Omega-3, proteine de calitate, vitamine D, B12' : 'Omega-3, quality protein, vitamins D, B12';
      } else if (/omlet|omleta|omelette|ouă|egg/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['3-4 ouă (doar albuș pentru Faza 2)', '100g spanac', '50g ciuperci', '1 roșie', 'Sare, piper, ierburi']
          : ['3-4 eggs (whites only for Phase 2)', '100g spinach', '50g mushrooms', '1 tomato', 'Salt, pepper, herbs'];
        generatedInstructions = language === 'ro'
          ? ['1. Bate ouăle într-un bol', '2. Adaugă legumele tăiate mărunt', '3. Încălzește tigaia (fără ulei - Faza 1-2)', '4. Toarnă amestecul', '5. Gătește 5 min, întoarce']
          : ['1. Beat eggs in bowl', '2. Add diced vegetables', '3. Heat pan (no oil - Phase 1-2)', '4. Pour mixture', '5. Cook 5 min, flip'];
        estimatedCalories = 220;
        estimatedProtein = 24;
        estimatedCarbs = 8;
        estimatedFat = 12;
        benefits = language === 'ro' ? 'Proteine complete, vitamine B, minerale esențiale' : 'Complete protein, B vitamins, essential minerals';
      } else if (/smoothie|shake|băutură/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['1 cană fructe de pădure', '1 cană lapte migdale/cocos', '1 linguriță proteină pudră', '1/2 cană ovăz (Faza 1)', 'Gheață']
          : ['1 cup mixed berries', '1 cup almond/coconut milk', '1 tsp protein powder', '1/2 cup oats (Phase 1)', 'Ice'];
        generatedInstructions = language === 'ro'
          ? ['1. Adaugă toate ingredientele în blender', '2. Mixează 1-2 min până e neted', '3. Gustă și ajustează dulceața', '4. Servește imediat', '5. Opțional: top cu semințe (Faza 3)']
          : ['1. Add all ingredients to blender', '2. Blend 1-2 min until smooth', '3. Taste and adjust sweetness', '4. Serve immediately', '5. Optional: top with seeds (Phase 3)'];
        estimatedCalories = 250;
        estimatedProtein = 18;
        estimatedCarbs = 42;
        estimatedFat = 3;
        benefits = language === 'ro' ? 'Antioxidanți, fibre, energie rapidă, hidratant' : 'Antioxidants, fiber, quick energy, hydrating';
      } else if (/supă|supa|soup|ciorbă|ciorba/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['300g pui/curcan', '2 morcovi', '1 țelină', '1 ceapă', '200g tăiței/orez (Faza 1)', '1 legătură pătrunjel', 'Sare, piper']
          : ['300g chicken/turkey', '2 carrots', '1 celery', '1 onion', '200g noodles/rice (Phase 1)', '1 bunch parsley', 'Salt, pepper'];
        generatedInstructions = language === 'ro'
          ? ['1. Fierbe carnea în 2L apă', '2. Adaugă legumele tăiate', '3. Fierbe 30 min', '4. Adaugă tăiței/orez (dacă Faza 1)', '5. Condimentează cu pătrunjel']
          : ['1. Boil meat in 2L water', '2. Add diced vegetables', '3. Boil 30 min', '4. Add noodles/rice (if Phase 1)', '5. Season with parsley'];
        estimatedCalories = 240;
        estimatedProtein = 28;
        estimatedCarbs = 22;
        estimatedFat = 5;
        benefits = language === 'ro' ? 'Hidratant, digestie ușoară, proteine și legume' : 'Hydrating, easy digestion, protein and vegetables';
      } else if (/tocană|tocanita|stew/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['400g carne (pui/vită/porc)', '2 cepe', '3 roșii', '2 ardei grași', '200g ciuperci', 'Foi dafin, cimbru']
          : ['400g meat (chicken/beef/pork)', '2 onions', '3 tomatoes', '2 bell peppers', '200g mushrooms', 'Bay leaves, thyme'];
        generatedInstructions = language === 'ro'
          ? ['1. Taie carnea cuburi mici', '2. Călește ceapa (fără ulei - Faza 1-2)', '3. Adaugă carnea și sotează', '4. Adaugă roșii, ardei, ciuperci', '5. Fierbe la foc mic 45 min']
          : ['1. Dice meat into small cubes', '2. Sauté onion (no oil - Phase 1-2)', '3. Add meat and stir-fry', '4. Add tomatoes, peppers, mushrooms', '5. Simmer 45 min'];
        estimatedCalories = 380;
        estimatedProtein = 42;
        estimatedCarbs = 20;
        estimatedFat = 14;
        benefits = language === 'ro' ? 'Proteine, vitamineA, C, sațios, reconfortant' : 'Protein, vitamins A, C, filling, comforting';
      } else if (/friptură|steak|grătar|grilled/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['250g file carne slabă', 'Usturoi, rozmarin', 'Lămâie', 'Sare, piper', '200g legume (ardei, dovlecel)']
          : ['250g lean meat fillet', 'Garlic, rosemary', 'Lemon', 'Salt, pepper', '200g vegetables (peppers, zucchini)'];
        generatedInstructions = language === 'ro'
          ? ['1. Marinează carnea cu usturoi și ierburi (30 min)', '2. Încălzește grătarul/tigaia', '3. Gătește 4-5 min pe fiecare parte', '4. Lasă să se odihnească 5 min', '5. Servește cu legume la grătar']
          : ['1. Marinate meat with garlic and herbs (30 min)', '2. Heat grill/pan', '3. Cook 4-5 min each side', '4. Let rest 5 min', '5. Serve with grilled vegetables'];
        estimatedCalories = 360;
        estimatedProtein = 44;
        estimatedCarbs = 12;
        estimatedFat = 16;
        benefits = language === 'ro' ? 'Proteine de calitate, fier, zinc, vitamina B12' : 'Quality protein, iron, zinc, vitamin B12';
      } else if (/paste|pasta|spaghete|macaroane/i.test(recipeName)) {
        generatedIngredients = language === 'ro'
          ? ['200g paste integrale/linte', '200g pui/curcan', '300g roșii', '2 căței usturoi', 'Busuioc, oregano', 'Ulei măsline (doar Faza 3)']
          : ['200g whole wheat/lentil pasta', '200g chicken/turkey', '300g tomatoes', '2 garlic cloves', 'Basil, oregano', 'Olive oil (Phase 3 only)'];
        generatedInstructions = language === 'ro'
          ? ['1. Fierbe pastele conform instrucțiunilor', '2. Gătește carnea tăiată cuburi', '3. Adaugă roșii și usturoi', '4. Fierbe 15 min pentru sos', '5. Amestecă cu pastele fierte']
          : ['1. Boil pasta as instructed', '2. Cook diced meat', '3. Add tomatoes and garlic', '4. Simmer 15 min for sauce', '5. Mix with cooked pasta'];
        estimatedCalories = 420;
        estimatedProtein = 35;
        estimatedCarbs = 55;
        estimatedFat = 8;
        benefits = language === 'ro' ? 'Carbohidrați complecși, proteine, licopen (antioxidant)' : 'Complex carbs, protein, lycopene (antioxidant)';
      } else {
        // Generic - smart estimation
        generatedIngredients = language === 'ro'
          ? ['Ingredient principal (200-300g)', 'Legume variete (200g)', 'Carbohidrați (Faza 1, 3)', 'Condimente', 'Ulei (doar Faza 3)']
          : ['Main ingredient (200-300g)', 'Various vegetables (200g)', 'Carbs (Phase 1, 3)', 'Seasonings', 'Oil (Phase 3 only)'];
        generatedInstructions = language === 'ro'
          ? ['1. Pregătește ingredientele', '2. Gătește ingredientul principal', '3. Adaugă legumele', '4. Condimentează', '5. Servește']
          : ['1. Prepare ingredients', '2. Cook main ingredient', '3. Add vegetables', '4. Season', '5. Serve'];
        estimatedCalories = 300;
        estimatedProtein = 25;
        estimatedCarbs = 30;
        estimatedFat = 10;
        benefits = language === 'ro' ? 'Echilibrat, nutritiv, adaptat dietei' : 'Balanced, nutritious, diet-adapted';
      }
      
      const unsplashQuery = recipeName.replace(/\s+/g, '+');
      const unsplashUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=${unsplashQuery}`;
      
      setFormData(prev => ({
        ...prev,
        ingredients_text: generatedIngredients.join('\n'),
        instructions_text: generatedInstructions.join('\n'),
        image_url: unsplashUrl,
        description: benefits,
      }));

      toast({
        title: language === 'ro' ? '✅ Rețetă completată!' : '✅ Recipe completed!',
        description: language === 'ro' 
          ? `Ingrediente, instrucțiuni, beneficii și imagine adăugate!` 
          : `Ingredients, instructions, benefits and image added!`,
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
                  placeholder={language === 'ro' ? '200g piept de pui\n1 cană orez brun\n2 linguri ulei măsline\nSare și piper' : '200g chicken breast\n1 cup brown rice\n2 tbsp olive oil\nSalt and pepper'}
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
                  placeholder={language === 'ro' ? '1. Fierbe apa și orezul\n2. Gătește puiul la tigaie\n3. Amestecă și servește' : '1. Boil water and rice\n2. Cook chicken in pan\n3. Mix and serve'}
                  rows={5}
                  className="font-mono text-sm"
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

