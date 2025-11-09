import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, Calculator } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { useQuery } from "@tanstack/react-query";

export default function FoodIngredientPicker({ onIngredientsChange }) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [quantities, setQuantities] = useState({}); // { ingredientId: grams }

  // Search ingredients
  const { data: searchResults = [] } = useQuery({
    queryKey: ['foodSearch', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await fetch(`/api/recipes?food=search&q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const addIngredient = (ingredient) => {
    if (selectedIngredients.find(i => i.id === ingredient.id)) return;
    
    setSelectedIngredients([...selectedIngredients, ingredient]);
    setQuantities({ ...quantities, [ingredient.id]: 100 }); // Default 100g
    setSearchQuery("");
  };

  const removeIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredientId));
    const newQuantities = { ...quantities };
    delete newQuantities[ingredientId];
    setQuantities(newQuantities);
  };

  const updateQuantity = (ingredientId, grams) => {
    const qty = parseInt(grams) || 0;
    setQuantities({ ...quantities, [ingredientId]: qty });
  };

  // Calculate totals
  const totals = selectedIngredients.reduce((acc, ingredient) => {
    const qty = quantities[ingredient.id] || 0;
    const factor = qty / 100; // Macros sunt per 100g
    
    return {
      calories: acc.calories + (parseFloat(ingredient.calories_per_100g) || 0) * factor,
      protein: acc.protein + (parseFloat(ingredient.protein_per_100g) || 0) * factor,
      carbs: acc.carbs + (parseFloat(ingredient.carbs_per_100g) || 0) * factor,
      fat: acc.fat + (parseFloat(ingredient.fat_per_100g) || 0) * factor,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Notify parent component
  React.useEffect(() => {
    if (onIngredientsChange) {
      onIngredientsChange({ ingredients: selectedIngredients, quantities, totals });
    }
  }, [selectedIngredients, quantities]);

  return (
    <Card className="ios-card border-[rgb(var(--ios-border))]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          {language === 'ro' ? '🍴 Food Database' : '🍴 Food Database'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={language === 'ro' ? 'Caută ingredient (ex: pui, orez, broccoli)...' : 'Search ingredient (ex: chicken, rice, broccoli)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && searchResults.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {searchResults.map((ingredient) => (
              <div 
                key={ingredient.id}
                className="flex items-center justify-between p-3 bg-[rgb(var(--ios-bg-tertiary))] rounded-lg hover:bg-[rgb(var(--ios-bg-secondary))] cursor-pointer"
                onClick={() => addIngredient(ingredient)}
              >
                <div>
                  <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
                    {language === 'ro' ? ingredient.name_ro : ingredient.name_en}
                  </p>
                  <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                    {ingredient.calories_per_100g} kcal / 100g
                  </p>
                </div>
                <Plus className="w-4 h-4 text-emerald-500" />
              </div>
            ))}
          </div>
        )}

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[rgb(var(--ios-border))]">
            <p className="font-semibold text-[rgb(var(--ios-text-primary))]">
              {language === 'ro' ? 'Ingrediente selectate:' : 'Selected ingredients:'}
            </p>
            {selectedIngredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center gap-3 p-3 bg-[rgb(var(--ios-bg-secondary))] rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-[rgb(var(--ios-text-primary))]">
                    {language === 'ro' ? ingredient.name_ro : ingredient.name_en}
                  </p>
                  <p className="text-xs text-[rgb(var(--ios-text-tertiary))]">
                    {ingredient.category}
                  </p>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={quantities[ingredient.id] || 0}
                  onChange={(e) => updateQuantity(ingredient.id, e.target.value)}
                  className="w-20 text-center"
                  placeholder="0"
                />
                <span className="text-sm text-[rgb(var(--ios-text-secondary))]">g</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeIngredient(ingredient.id)}
                  className="hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Totals Calculator */}
        {selectedIngredients.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/20">
            <p className="font-bold text-[rgb(var(--ios-text-primary))] mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" />
              {language === 'ro' ? 'Total Nutrițional:' : 'Nutritional Total:'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2 bg-[rgb(var(--ios-bg-primary))] rounded-lg">
                <span className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Calorii:' : 'Calories:'}
                </span>
                <Badge className="bg-orange-500">{totals.calories.toFixed(0)} kcal</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-[rgb(var(--ios-bg-primary))] rounded-lg">
                <span className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Proteine:' : 'Protein:'}
                </span>
                <Badge className="bg-cyan-500">{totals.protein.toFixed(1)}g</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-[rgb(var(--ios-bg-primary))] rounded-lg">
                <span className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Carbohidrați:' : 'Carbs:'}
                </span>
                <Badge className="bg-purple-500">{totals.carbs.toFixed(1)}g</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-[rgb(var(--ios-bg-primary))] rounded-lg">
                <span className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  {language === 'ro' ? 'Grăsimi:' : 'Fats:'}
                </span>
                <Badge className="bg-pink-500">{totals.fat.toFixed(1)}g</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

