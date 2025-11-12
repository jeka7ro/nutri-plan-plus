import React, { useState } from "react";
import api from "@/api/apiAdapter";
const base44 = api;
const localApi = api;
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChefHat, Clock, Users, Flame, Search, Leaf, Wheat, Zap, Heart, UtensilsCrossed, Star } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { getPhaseInfo } from "../utils/phaseUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Recipes() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("1");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // LOAD REAL RECIPES FROM DATABASE
  const { data: allRecipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const recipes = await localApi.recipes.list();
      return recipes;
    },
    retry: false,
  });

  // Use centralized phase info
  const phaseInfo = {
    1: {
      ...getPhaseInfo(1, language),
      color: "from-red-400 to-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-700 dark:text-orange-300"
    },
    2: {
      ...getPhaseInfo(2, language),
      color: "from-emerald-400 to-green-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-700 dark:text-emerald-300"
    },
    3: {
      ...getPhaseInfo(3, language),
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-700 dark:text-purple-300"
    }
  };

  const categories = [
    { value: "all", label: language === 'ro' ? "Toate" : "All" },
    { value: "vegetarian", label: language === 'ro' ? "Vegetarian" : "Vegetarian", icon: Leaf },
    { value: "vegan", label: language === 'ro' ? "Vegan" : "Vegan", icon: Leaf },
    { value: "gluten-free", label: language === 'ro' ? "Fără gluten" : "Gluten-free", icon: Wheat },
    { value: "slow-cooker", label: "Slow Cooker", icon: Clock },
    { value: "quick", label: language === 'ro' ? "Rapid" : "Quick", icon: Zap },
  ];

  const filterRecipes = (phaseRecipes) => {
    return phaseRecipes.filter(recipe => {
      const recipeName = language === 'ro' ? recipe.name_ro : recipe.name;
      const matchesSearch = recipeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || recipe.tags?.includes(filterCategory);
      return matchesSearch && matchesCategory;
    });
  };

  const phase = phaseInfo[selectedPhase];
  
  // Filter recipes by selected phase
  const phaseRecipes = allRecipes.filter(r => r.phase === parseInt(selectedPhase));
  const filteredRecipes = filterRecipes(phaseRecipes);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
          <p className="text-[rgb(var(--ios-text-secondary))]">
            {language === 'ro' ? 'Se încarcă rețetele...' : 'Loading recipes...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">
            {language === 'ro' ? 'Biblioteca de Rețete' : 'Recipe Library'}
          </h1>
          <p className="text-[rgb(var(--ios-text-secondary))] mt-1">
            {language === 'ro' ? 'Rețete delicioase pentru fiecare fază' : 'Delicious recipes for each phase'}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="ios-card ios-shadow-lg border-[rgb(var(--ios-border))]">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--ios-text-tertiary))] w-5 h-5" />
                <Input
                  placeholder={language === 'ro' ? "Caută rețete..." : "Search recipes..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[rgb(var(--ios-border))]"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48 border-[rgb(var(--ios-border))]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedPhase} onValueChange={setSelectedPhase} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[rgb(var(--ios-bg-tertiary))] border border-[rgb(var(--ios-border))]">
            <TabsTrigger 
              value="1" 
              className="data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900/30 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-300"
            >
              {language === 'ro' ? 'Faza 1' : 'Phase 1'}
            </TabsTrigger>
            <TabsTrigger 
              value="2" 
              className="data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
            >
              {language === 'ro' ? 'Faza 2' : 'Phase 2'}
            </TabsTrigger>
            <TabsTrigger 
              value="3" 
              className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300"
            >
              {language === 'ro' ? 'Faza 3' : 'Phase 3'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPhase} className="space-y-6 mt-6">
            {/* Phase Info Banner */}
            <Card className={`ios-card border-[rgb(var(--ios-border))] ${phase.bgColor}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${phase.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${phase.textColor}`}>{phase.name}</h2>
                    <p className="text-[rgb(var(--ios-text-secondary))]">{phase.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${phase.bgColor} ${phase.textColor} border-[rgb(var(--ios-border))]`}>
                    {filteredRecipes.length} {language === 'ro' ? 'rețete' : 'recipes'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recipes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="ios-card ios-shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-[rgb(var(--ios-border))] overflow-hidden"
                  onClick={() => {
                    // PostgreSQL returnează JSONB deja ca array
                    const parsedRecipe = {
                      ...recipe,
                      ingredients_ro: recipe.ingredients_ro || [],
                      ingredients_en: recipe.ingredients_en || [],
                      instructions_ro: typeof recipe.instructions_ro === 'string' 
                        ? recipe.instructions_ro.split('.').filter(s => s.trim()).map(s => s + '.') 
                        : (recipe.instructions_ro || []),
                      instructions_en: typeof recipe.instructions_en === 'string' 
                        ? recipe.instructions_en.split('.').filter(s => s.trim()).map(s => s + '.')
                        : (recipe.instructions_en || []),
                    };
                    setSelectedRecipe(parsedRecipe);
                  }}
                >
                  {/* Recipe Image - FROM DATABASE */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={recipe.image_url} 
                      alt={language === 'ro' ? recipe.name_ro : recipe.name_en}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/70 text-white border-none">
                        <Flame className="w-3 h-3 mr-1" />
                        {recipe.calories} cal
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className={`${phase.bgColor} border-b border-[rgb(var(--ios-border))]`}>
                    <CardTitle className="flex items-start gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${phase.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <ChefHat className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-[rgb(var(--ios-text-primary))] line-clamp-2">
                          {language === 'ro' ? recipe.name_ro : recipe.name_en}
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {recipe.cooking_time && (
                            <Badge variant="secondary" className="text-xs bg-[rgb(var(--ios-bg-tertiary))] text-[rgb(var(--ios-text-secondary))] border-[rgb(var(--ios-border))]">
                              <Clock className="w-3 h-3 mr-1" />
                              {recipe.cooking_time}
                            </Badge>
                          )}
                          {recipe.servings && (
                            <Badge variant="secondary" className="text-xs bg-[rgb(var(--ios-bg-tertiary))] text-[rgb(var(--ios-text-secondary))] border-[rgb(var(--ios-border))]">
                              <Users className="w-3 h-3 mr-1" />
                              {recipe.servings}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {recipe.is_vegetarian && (
                        <Badge variant="outline" className="text-xs border-[rgb(var(--ios-border))] text-[rgb(var(--ios-text-secondary))]">
                          <Leaf className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
                          {language === 'ro' ? 'Vegetarian' : 'Vegetarian'}
                        </Badge>
                      )}
                      {recipe.is_vegan && (
                        <Badge variant="outline" className="text-xs border-[rgb(var(--ios-border))] text-[rgb(var(--ios-text-secondary))]">
                          <Leaf className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
                          {language === 'ro' ? 'Vegan' : 'Vegan'}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[rgb(var(--ios-border))]">
                      <div className="grid grid-cols-3 gap-2 text-xs text-[rgb(var(--ios-text-secondary))]">
                        <div>
                          <div className="font-medium">
                            {language === 'ro' ? 'Proteine' : 'Protein'}
                          </div>
                          <div className="font-bold text-[rgb(var(--ios-text-primary))]">{recipe.protein}g</div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {language === 'ro' ? 'Carbohidrați' : 'Carbs'}
                          </div>
                          <div className="font-bold text-[rgb(var(--ios-text-primary))]">{recipe.carbs}g</div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {language === 'ro' ? 'Grăsimi' : 'Fat'}
                          </div>
                          <div className="font-bold text-[rgb(var(--ios-text-primary))]">{recipe.fat}g</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <Card className="ios-card ios-shadow-lg border-[rgb(var(--ios-border))]">
                <CardContent className="p-12 text-center text-[rgb(var(--ios-text-tertiary))]">
                  <ChefHat className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">
                    {language === 'ro' ? 'Nu s-au găsit rețete' : 'No recipes found'}
                  </p>
                  <p className="text-sm">
                    {language === 'ro' ? 'Încearcă să modifici filtrele sau căutarea' : 'Try adjusting your filters or search'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Recipe Detail Modal */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[rgb(var(--ios-bg-primary))] border-[rgb(var(--ios-border))]"
          aria-describedby="recipe-description"
        >
          {selectedRecipe && (
            <>
              {/* Recipe Image in Modal - FROM DATABASE */}
              <div className="relative h-64 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                <img 
                  src={selectedRecipe.image_url} 
                  alt={language === 'ro' ? selectedRecipe.name_ro : selectedRecipe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 id="recipe-description" className="text-3xl font-bold text-white drop-shadow-lg">
                    {language === 'ro' ? selectedRecipe.name_ro : selectedRecipe.name}
                  </h2>
                </div>
              </div>

              <div className="space-y-4 px-6">
                {/* Stats */}
                <div className="flex gap-4 flex-wrap">
                  {selectedRecipe.cooking_time && (
                    <Badge className="flex items-center gap-1 bg-[rgb(var(--ios-bg-tertiary))] text-[rgb(var(--ios-text-primary))] border-[rgb(var(--ios-border))]">
                      <Clock className="w-4 h-4" />
                      {selectedRecipe.cooking_time}
                    </Badge>
                  )}
                  {selectedRecipe.servings && (
                    <Badge className="flex items-center gap-1 bg-[rgb(var(--ios-bg-tertiary))] text-[rgb(var(--ios-text-primary))] border-[rgb(var(--ios-border))]">
                      <Users className="w-4 h-4" />
                      {selectedRecipe.servings} {language === 'ro' ? 'porții' : 'servings'}
                    </Badge>
                  )}
                  <Badge className="flex items-center gap-1 bg-[rgb(var(--ios-bg-tertiary))] text-[rgb(var(--ios-text-primary))] border-[rgb(var(--ios-border))]">
                    <Flame className="w-4 h-4" />
                    {selectedRecipe.calories} {language === 'ro' ? 'calorii' : 'calories'}
                  </Badge>
                </div>

                {/* Nutrition */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-[rgb(var(--ios-border))]">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-[rgb(var(--ios-text-primary))]">
                      {language === 'ro' ? 'Informații Nutriționale' : 'Nutrition Facts'}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedRecipe.protein}g</div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                          {language === 'ro' ? 'Proteine' : 'Protein'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedRecipe.carbs}g</div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                          {language === 'ro' ? 'Carbohidrați' : 'Carbs'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedRecipe.fat}g</div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                          {language === 'ro' ? 'Grăsimi' : 'Fat'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ingredients */}
                {selectedRecipe.ingredients_en && selectedRecipe.ingredients_en.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                      <UtensilsCrossed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      {language === 'ro' ? 'Ingrediente' : 'Ingredients'}
                    </h3>
                    <ul className="space-y-2">
                      {(language === 'ro' ? selectedRecipe.ingredients_ro : selectedRecipe.ingredients_en).map((ingredient, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span className="text-[rgb(var(--ios-text-secondary))]">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instructions */}
                {selectedRecipe.instructions_en && selectedRecipe.instructions_en.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
                      <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      {language === 'ro' ? 'Mod de preparare' : 'Instructions'}
                    </h3>
                    <ol className="space-y-3">
                      {(language === 'ro' ? selectedRecipe.instructions_ro : selectedRecipe.instructions_en).map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full ${phaseInfo[selectedPhase].bgColor} ${phaseInfo[selectedPhase].textColor} flex items-center justify-center text-sm font-bold`}>
                            {i + 1}
                          </span>
                          <span className="text-[rgb(var(--ios-text-secondary))] pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Benefits */}
                {selectedRecipe.benefits_en && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      {language === 'ro' ? 'Beneficii' : 'Benefits'}
                    </h3>
                    <p className="text-sm text-emerald-900 dark:text-emerald-100">
                      {language === 'ro' ? selectedRecipe.benefits_ro : selectedRecipe.benefits_en}
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                  onClick={() => setSelectedRecipe(null)}
                >
                  {language === 'ro' ? 'Închide' : 'Close'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}