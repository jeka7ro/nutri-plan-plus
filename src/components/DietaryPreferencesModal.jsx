
import React, { useState } from 'react';
import localApi from "@/api/localClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Leaf, AlertTriangle, X, Heart, Check } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function DietaryPreferencesModal({ isOpen, onClose, user, onSave }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isVegetarian, setIsVegetarian] = useState(user?.is_vegetarian || false);
  const [isVegan, setIsVegan] = useState(user?.is_vegan || false);
  const [allergies, setAllergies] = useState(user?.allergies || []);
  const [favoriteFoods, setFavoriteFoods] = useState(user?.favorite_foods || []);
  const [newAllergy, setNewAllergy] = useState("");
  const [newFavorite, setNewFavorite] = useState("");

  const commonAllergies = {
    en: [
      "Dairy", "Eggs", "Fish", "Shellfish", "Tree nuts", 
      "Peanuts", "Wheat/Gluten", "Soy"
    ],
    ro: [
      "Lactate", "Ouă", "Pește", "Fructe de mare", "Nuci", 
      "Alune", "Grâu/Gluten", "Soia"
    ]
  };

  const popularFoods = {
    en: [
      "Chicken", "Salmon", "Tuna", "Turkey", "Eggs",
      "Avocado", "Quinoa", "Brown Rice", "Broccoli", "Spinach",
      "Sweet Potato", "Berries", "Nuts", "Olive Oil", "Greek Yogurt"
    ],
    ro: [
      "Pui", "Somon", "Ton", "Curcan", "Ouă",
      "Avocado", "Quinoa", "Orez brun", "Broccoli", "Spanac",
      "Cartof dulce", "Fructe de pădure", "Nuci", "Ulei de măsline", "Iaurt grecesc"
    ]
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (allergy) => {
    setAllergies(allergies.filter(a => a !== allergy));
  };

  const handleQuickAddAllergy = (allergy) => {
    if (!allergies.includes(allergy)) {
      setAllergies([...allergies, allergy]);
    }
  };

  const handleAddFavorite = () => {
    if (newFavorite.trim() && !favoriteFoods.includes(newFavorite.trim())) {
      setFavoriteFoods([...favoriteFoods, newFavorite.trim()]);
      setNewFavorite("");
    }
  };

  const handleRemoveFavorite = (food) => {
    setFavoriteFoods(favoriteFoods.filter(f => f !== food));
  };

  const handleQuickAddFavorite = (food) => {
    if (!favoriteFoods.includes(food)) {
      setFavoriteFoods([...favoriteFoods, food]);
    }
  };

  const handleSave = async () => {
    try {
      console.log('SALVEZ Dietary Preferences:', {
        is_vegetarian: isVegetarian,
        is_vegan: isVegan,
        allergies,
        favorite_foods: favoriteFoods
      });
      
      // Convertim array-uri la string pentru PostgreSQL TEXT fields
      const dietary_preferences = [];
      if (isVegetarian) dietary_preferences.push('vegetarian');
      if (isVegan) dietary_preferences.push('vegan');
      
      await localApi.auth.updateProfile({
        is_vegetarian: isVegetarian,
        is_vegan: isVegan,
        dietary_preferences: dietary_preferences.join(','),
        allergies: allergies.join(','),
        favorite_foods: favoriteFoods.join(',')
      });
      
      console.log('Dietary Preferences SALVATE!');
      
      toast({
        title: language === 'ro' ? "Preferințe salvate!" : "Preferences saved!",
        description: language === 'ro' ? "Preferințele tale au fost actualizate cu succes." : "Your preferences have been updated successfully.",
        duration: 3000,
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Eroare salvare preferințe:', error);
      toast({
        title: language === 'ro' ? "Eroare" : "Error",
        description: error.message || (language === 'ro' ? "Nu s-au putut salva preferințele." : "Could not save preferences."),
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-600" />
            {language === 'ro' ? 'Preferințe Alimentare' : 'Dietary Preferences'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ro' 
              ? 'Personalizează meniurile în funcție de preferințele tale.'
              : 'Customize your meal plans based on your preferences.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* IMPORTANT WARNING */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded-xl p-4">
            <p className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">
              {language === 'ro' ? 'Filtrare strictă activă' : 'WARNING - Strict filtering!'}
            </p>
            <p className="text-sm text-red-800 dark:text-red-200">
              {language === 'ro' 
                ? 'Dacă activezi Vegetarian sau Vegan, vei vedea DOAR rețete fără carne/pește. Aplicația va exclude COMPLET orice rețetă cu produse animale nepermise!'
                : 'If you enable Vegetarian or Vegan, you will see ONLY recipes without meat/fish. The app will COMPLETELY exclude any recipe with prohibited animal products!'}
            </p>
          </div>

          {/* Dietary Type */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {language === 'ro' ? 'Tipul de dietă' : 'Diet Type'}
            </h3>
            
            <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:bg-emerald-50 transition-colors">
              <Checkbox 
                id="vegetarian" 
                checked={isVegetarian}
                onCheckedChange={(checked) => {
                  setIsVegetarian(checked);
                  if (!checked) setIsVegan(false);
                }}
              />
              <Label htmlFor="vegetarian" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <span className="font-bold">
                    {language === 'ro' ? 'Vegetarian' : 'Vegetarian'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ro' 
                    ? 'Fără carne, pește sau pasăre'
                    : 'No meat, fish, or poultry'}
                </p>
                <p className="text-xs font-bold text-green-700 dark:text-green-400 mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {language === 'ro' 
                      ? 'Filtrează 100% produse cu carne'
                      : 'Filters 100% meat products'}
                  </span>
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:bg-emerald-50 transition-colors">
              <Checkbox 
                id="vegan" 
                checked={isVegan}
                onCheckedChange={(checked) => {
                  setIsVegan(checked);
                  if (checked) setIsVegetarian(true);
                }}
              />
              <Label htmlFor="vegan" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <span className="font-bold">
                    {language === 'ro' ? 'Vegan' : 'Vegan'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ro' 
                    ? 'Fără produse de origine animală'
                    : 'No animal products'}
                </p>
                <p className="text-xs font-bold text-green-700 dark:text-green-400 mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {language === 'ro' 
                      ? 'Filtrează 100% carne, ouă, lactate, miere'
                      : 'Filters 100% meat, eggs, dairy, honey'}
                  </span>
                </p>
              </Label>
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              {language === 'ro' ? 'Alergii și intoleranțe' : 'Allergies & Intolerances'}
            </h3>

            {/* Quick Add Common Allergies */}
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {language === 'ro' ? 'Alergii comune:' : 'Common allergies:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {commonAllergies[language].map((allergy) => (
                  <Badge
                    key={allergy}
                    variant={allergies.includes(allergy) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      allergies.includes(allergy) 
                        ? 'bg-orange-100 text-orange-700 border-orange-300' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleQuickAddAllergy(allergy)}
                  >
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Allergy Input */}
            <div className="flex gap-2">
              <Input
                placeholder={language === 'ro' ? 'Adaugă altă alergie...' : 'Add another allergy...'}
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
              />
              <Button onClick={handleAddAllergy} variant="outline">
                {language === 'ro' ? 'Adaugă' : 'Add'}
              </Button>
            </div>

            {/* Selected Allergies */}
            {allergies.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {language === 'ro' ? 'Alergiile tale:' : 'Your allergies:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      className="bg-orange-100 text-orange-700 border-orange-300 pr-1"
                    >
                      {allergy}
                      <button
                        onClick={() => handleRemoveAllergy(allergy)}
                        className="ml-2 hover:bg-orange-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Favorite Foods */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              {language === 'ro' ? 'Alimente favorite' : 'Favorite Foods'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'ro' 
                ? 'Alege alimentele pe care le preferi și vom prioritiza rețetele care le conțin.'
                : 'Choose foods you prefer and we will prioritize recipes containing them.'}
            </p>

            {/* Quick Add Popular Foods */}
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {language === 'ro' ? 'Alimente populare:' : 'Popular foods:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {popularFoods[language].map((food) => (
                  <Badge
                    key={food}
                    variant={favoriteFoods.includes(food) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      favoriteFoods.includes(food) 
                        ? 'bg-pink-100 text-pink-700 border-pink-300' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleQuickAddFavorite(food)}
                  >
                    {food}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Favorite Input */}
            <div className="flex gap-2">
              <Input
                placeholder={language === 'ro' ? 'Adaugă alt aliment favorit...' : 'Add another favorite food...'}
                value={newFavorite}
                onChange={(e) => setNewFavorite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFavorite()}
              />
              <Button onClick={handleAddFavorite} variant="outline">
                {language === 'ro' ? 'Adaugă' : 'Add'}
              </Button>
            </div>

            {/* Selected Favorites */}
            {favoriteFoods.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {language === 'ro' ? 'Alimentele tale favorite:' : 'Your favorite foods:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {favoriteFoods.map((food) => (
                    <Badge
                      key={food}
                      className="bg-pink-100 text-pink-700 border-pink-300 pr-1"
                    >
                      {food}
                      <button
                        onClick={() => handleRemoveFavorite(food)}
                        className="ml-2 hover:bg-pink-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {language === 'ro' 
                ? 'Aceste preferințe vor fi folosite pentru a filtra și prioritiza meniurile potrivite pentru tine. Le poți schimba oricând.'
                : 'These preferences will be used to filter and prioritize meal plans suitable for you. You can change them anytime.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {language === 'ro' ? 'Anulează' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            {language === 'ro' ? 'Salvează preferințele' : 'Save Preferences'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
