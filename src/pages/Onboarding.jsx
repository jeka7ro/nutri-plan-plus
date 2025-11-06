
import React, { useState } from "react";
import api from "@/api/apiAdapter";
const localApi = api;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingDown, Target, Calendar, Ruler, User, Leaf, Heart, AlertCircle, Activity, Camera, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Onboarding() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    current_weight: "",
    target_weight: "",
    height: "",
    birth_date: "",
    gender: "",
    activity_level: "moderate",
    start_date: new Date().toISOString().split('T')[0],
    is_vegetarian: false,
    is_vegan: false,
    allergies: [],
    favorite_foods: "",
    profile_picture: "",
    country: "",
    city: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [countries, setCountries] = useState({});
  const [cities, setCities] = useState([]);
  
  // Încarcă lista de țări
  React.useEffect(() => {
    fetch('http://localhost:3001/api/countries')
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Error loading countries:', err));
  }, []);

  const allergenOptions = [
    "Eggs",
    "Dairy",
    "Fish",
    "Shellfish",
    "Tree nuts",
    "Wheat/Gluten",
    "Soy"
  ];

  const allergenTranslations = {
    "Eggs": "Ouă",
    "Dairy": "Lactate",
    "Fish": "Pește",
    "Shellfish": "Fructe de mare",
    "Tree nuts": "Nuci",
    "Wheat/Gluten": "Grâu/Gluten",
    "Soy": "Soia"
  };

  const activityLevels = {
    sedentary: {
      name: { ro: "Sedentar", en: "Sedentary" },
      desc: { ro: "Minim sau fără exerciții", en: "Little or no exercise" }
    },
    light: {
      name: { ro: "Ușor Activ", en: "Lightly Active" },
      desc: { ro: "Exerciții ușoare 1-3 zile/săptămână", en: "Light exercise 1-3 days/week" }
    },
    moderate: {
      name: { ro: "Moderat Activ", en: "Moderately Active" },
      desc: { ro: "Exerciții moderate 3-5 zile/săptămână", en: "Moderate exercise 3-5 days/week" }
    },
    active: {
      name: { ro: "Foarte Activ", en: "Very Active" },
      desc: { ro: "Exerciții intense 6-7 zile/săptămână", en: "Hard exercise 6-7 days/week" }
    },
    very_active: {
      name: { ro: "Extrem de Activ", en: "Extra Active" },
      desc: { ro: "Exerciții foarte intense zilnic", en: "Very hard exercise daily" }
    }
  };

  const handleAllergenToggle = (allergen) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergen)
        ? prev.allergies.filter(a => a !== allergen)
        : [...prev.allergies, allergen]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB original)
      if (file.size > 10 * 1024 * 1024) {
        alert(language === 'ro' ? 'Imaginea este prea mare. Maxim 10MB.' : 'Image is too large. Maximum 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Compress and resize image
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression (0.7 quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, profile_picture: compressedBase64 });
          setImagePreview(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, profile_picture: "" });
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare dietary preferences
      let dietary_preferences = [];
      if (formData.is_vegetarian) dietary_preferences.push('vegetarian');
      if (formData.is_vegan) dietary_preferences.push('vegan');

      // Calculate age from birth_date
      const age = calculateAge();

      await localApi.auth.updateMe({
        name: formData.full_name,
        birth_date: formData.birth_date,
        current_weight: parseFloat(formData.current_weight),
        target_weight: parseFloat(formData.target_weight),
        height: parseFloat(formData.height),
        age: age,
        gender: formData.gender,
        activity_level: 'moderate', // Default moderat
        start_date: formData.start_date,
        dietary_preferences: dietary_preferences.join(','),
        allergies: formData.allergies.join(','),
        profile_picture: formData.profile_picture
      });

      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Onboarding error:", error);
      alert(language === 'ro' ? 'A apărut o eroare. Te rugăm să încerci din nou.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.full_name && formData.current_weight && formData.target_weight && 
             formData.height && formData.birth_date && formData.gender;
    }
    return true;
  };

  const steps = [
    {
      title: language === 'ro' ? 'Informații de bază' : 'Basic Information',
      description: language === 'ro' ? 'Datele tale personale și obiective' : "Your personal data and goals"
    },
    {
      title: language === 'ro' ? 'Preferințe alimentare' : 'Food Preferences',
      description: language === 'ro' ? 'Personalizează meniurile tale' : 'Customize your menus'
    },
    {
      title: language === 'ro' ? 'Confirmă și începe' : 'Review & Start',
      description: language === 'ro' ? 'Verifică datele și pornește programul' : 'Review data and start program'
    }
  ];

  const calculateBMI = () => {
    if (!formData.current_weight || !formData.height) return null;
    const heightInMeters = parseFloat(formData.height) / 100;
    const weight = parseFloat(formData.current_weight);
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateAge = () => {
    if (!formData.birth_date) return 0;
    const today = new Date();
    const birthDate = new Date(formData.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateTDEE = () => {
    if (!formData.current_weight || !formData.height || !formData.birth_date || !formData.gender) return 0;

    const weight = parseFloat(formData.current_weight);
    const height = parseFloat(formData.height);
    const age = calculateAge();

    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Folosim un multiplier moderat ca default
    const multiplier = 1.55;
    return Math.round(bmr * multiplier);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <TrendingDown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ro' ? 'Bine ai venit!' : 'Welcome!'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ro' 
              ? 'Hai să-ți configurăm profilul pentru Fast Metabolism Diet' 
              : "Let's set up your Fast Metabolism Diet profile"}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          {steps.map((s, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step > index + 1 
                  ? 'bg-emerald-500 text-white' 
                  : step === index + 1 
                    ? 'bg-emerald-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {step > index + 1 ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-1 mx-2 transition-all ${
                  step > index + 1 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="ios-card ios-shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              <span className="text-emerald-600 dark:text-emerald-400">
                {language === 'ro' ? 'Pasul' : 'Step'} {step}:
              </span>{' '}
              {steps[step - 1].title}
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
              {steps[step - 1].description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    {language === 'ro' ? 'Numele complet *' : 'Full Name *'}
                  </Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder={language === 'ro' ? 'Ex: Maria Popescu' : 'Ex: John Doe'}
                    className="h-12"
                  />
                </div>

                {/* Profile Picture Upload */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    {language === 'ro' ? 'Poză de profil (opțional)' : 'Profile Picture (optional)'}
                  </Label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Profile preview" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="profile-picture"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('profile-picture').click()}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {language === 'ro' ? 'Încarcă poză' : 'Upload Photo'}
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'ro' ? 'Din galerie sau cameră' : 'From gallery or camera'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      {language === 'ro' ? 'Data de naștere *' : 'Date of Birth *'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-pink-600" />
                      {language === 'ro' ? 'Sexul *' : 'Gender *'}
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={language === 'ro' ? 'Selectează' : 'Select'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">{language === 'ro' ? 'Feminin' : 'Female'}</SelectItem>
                        <SelectItem value="male">{language === 'ro' ? 'Masculin' : 'Male'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-blue-600" />
                      {language === 'ro' ? 'Greutatea actuală (kg) *' : 'Current Weight (kg) *'}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.current_weight}
                      onChange={(e) => setFormData({ ...formData, current_weight: e.target.value })}
                      placeholder="75.5"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      {language === 'ro' ? 'Greutatea țintă (kg) *' : 'Target Weight (kg) *'}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.target_weight}
                      onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                      placeholder="65.0"
                      className="h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Ruler className="w-4 h-4 text-orange-600" />
                    {language === 'ro' ? 'Înălțimea (cm) *' : 'Height (cm) *'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="165"
                    className="h-12"
                  />
                </div>

                {/* ȚARĂ + ORAȘ */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      🌍 {language === 'ro' ? 'Țara' : 'Country'}
                    </Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, country: value, city: '' });
                        setCities(countries[value] || []);
                      }}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={language === 'ro' ? 'Selectează țara' : 'Select country'} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(countries).map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      🏙️ {language === 'ro' ? 'Orașul' : 'City'}
                    </Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                      disabled={!formData.country}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={language === 'ro' ? 'Selectează orașul' : 'Select city'} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Leaf className="w-4 h-4 text-green-600" />
                    {language === 'ro' ? 'Preferințe alimentare' : 'Dietary Preferences'}
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-xl border-gray-200 dark:border-gray-700">
                      <Checkbox
                        id="vegetarian"
                        checked={formData.is_vegetarian}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_vegetarian: checked })}
                      />
                      <Label htmlFor="vegetarian" className="cursor-pointer flex-1">
                        <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                          {language === 'ro' ? 'Vegetarian' : 'Vegetarian'}
                        </div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                          {language === 'ro' ? 'Nu consumă carne sau pește' : 'No meat or fish'}
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border-2 rounded-xl border-gray-200 dark:border-gray-700">
                      <Checkbox
                        id="vegan"
                        checked={formData.is_vegan}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_vegan: checked, is_vegetarian: checked ? true : formData.is_vegetarian })}
                      />
                      <Label htmlFor="vegan" className="cursor-pointer flex-1">
                        <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                          {language === 'ro' ? 'Vegan' : 'Vegan'}
                        </div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))]">
                          {language === 'ro' ? 'Nu consumă produse de origine animală' : 'No animal products'}
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-pink-600" />
                    {language === 'ro' ? 'Data de început *' : 'Start Date *'}
                  </Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ro' 
                      ? 'Data când începi programul de 28 de zile' 
                      : 'The date when you start the 28-day program'}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">
                    ⚠️ {language === 'ro' ? 'IMPORTANT!' : 'IMPORTANT!'}
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {language === 'ro' 
                      ? 'Dacă selectezi Vegetarian sau Vegan, aplicația va filtra COMPLET orice rețetă cu carne, pește sau pasăre. Vei vedea DOAR rețete compatibile cu dieta ta!'
                      : 'If you select Vegetarian or Vegan, the app will COMPLETELY filter out any recipe with meat, fish, or poultry. You will see ONLY recipes compatible with your diet!'}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    {language === 'ro' 
                      ? 'ℹ️ Aceste preferințe ne vor ajuta să personalizăm rețetele și să prioritizăm ingredientele tale favorite.'
                      : 'ℹ️ These preferences will help us personalize recipes and prioritize your favorite ingredients.'}
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Leaf className="w-4 h-4 text-green-600" />
                    {language === 'ro' ? 'Tipul de dietă' : 'Diet Type'}
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Checkbox
                        id="vegetarian"
                        checked={formData.is_vegetarian}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_vegetarian: checked, is_vegan: false })}
                      />
                      <label htmlFor="vegetarian" className="flex-1 cursor-pointer">
                        <div className="font-bold text-lg flex items-center gap-2">
                          <Leaf className="w-5 h-5 text-green-600" />
                          {language === 'ro' ? 'Vegetarian' : 'Vegetarian'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {language === 'ro' ? 'Fără carne, pește sau pasăre' : 'No meat, fish, or poultry'}
                        </div>
                        <div className="text-xs font-bold text-green-700 dark:text-green-400 mt-2 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded inline-block">
                          {language === 'ro' ? '✓ 100% fără produse animale cu carne' : '✓ 100% no animal meat products'}
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Checkbox
                        id="vegan"
                        checked={formData.is_vegan}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_vegan: checked, is_vegetarian: checked })}
                      />
                      <label htmlFor="vegan" className="flex-1 cursor-pointer">
                        <div className="font-bold text-lg flex items-center gap-2">
                          <Leaf className="w-5 h-5 text-green-600" />
                          {language === 'ro' ? 'Vegan' : 'Vegan'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {language === 'ro' ? 'Fără produse de origine animală' : 'No animal products'}
                        </div>
                        <div className="text-xs font-bold text-green-700 dark:text-green-400 mt-2 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded inline-block">
                          {language === 'ro' ? '✓ 100% fără ouă, lactate, miere, carne, pește' : '✓ 100% no eggs, dairy, honey, meat, fish'}
                        </div>
                      </label>
                    </div>

                    {!formData.is_vegetarian && !formData.is_vegan && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          {language === 'ro' 
                            ? 'ℹ️ Nu ai selectat restricții - vei vedea TOATE rețetele, inclusiv cele cu carne, pește și pasăre.'
                            : 'ℹ️ No restrictions selected - you will see ALL recipes, including those with meat, fish, and poultry.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    {language === 'ro' ? 'Alergii alimentare' : 'Food Allergies'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {allergenOptions.map((allergen) => (
                      <Badge
                        key={allergen}
                        variant={formData.allergies.includes(allergen) ? "default" : "outline"}
                        className={`cursor-pointer py-2 px-4 ${
                          formData.allergies.includes(allergen)
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => handleAllergenToggle(allergen)}
                      >
                        {language === 'ro' ? allergenTranslations[allergen] : allergen}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-600" />
                    {language === 'ro' ? 'Alimente și ingrediente favorite' : 'Favorite Foods & Ingredients'}
                  </Label>
                  <Input
                    value={formData.favorite_foods}
                    onChange={(e) => setFormData({ ...formData, favorite_foods: e.target.value })}
                    placeholder={language === 'ro' ? 'Ex: pui, avocado, spanac, quinoa' : 'Ex: chicken, avocado, spinach, quinoa'}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ro' 
                      ? 'Separă cu virgulă. Vom prioritiza rețete cu aceste ingrediente.' 
                      : 'Separate with commas. We\'ll prioritize recipes with these ingredients.'}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-100 mb-4">
                    {language === 'ro' ? '✓ Rezumatul profilului tău' : '✓ Your Profile Summary'}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'ro' ? 'Nume' : 'Name'}</div>
                        <div className="font-semibold text-[rgb(var(--ios-text-primary))]">{formData.full_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'ro' ? 'Vârstă' : 'Age'}</div>
                        <div className="font-semibold text-[rgb(var(--ios-text-primary))]">{formData.age} {language === 'ro' ? 'ani' : 'years'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'ro' ? 'Greutate actuală' : 'Current Weight'}</div>
                        <div className="font-semibold text-blue-600 dark:text-blue-400">{formData.current_weight} kg</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'ro' ? 'Greutate țintă' : 'Target Weight'}</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">{formData.target_weight} kg</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'ro' ? 'Înălțime' : 'Height'}</div>
                        <div className="font-semibold text-[rgb(var(--ios-text-primary))]">{formData.height} cm</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">IMC</div>
                        <div className="font-semibold text-purple-600 dark:text-purple-400">{calculateBMI() || '-'}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'ro' ? 'Nivel activitate' : 'Activity Level'}</div>
                      <div className="font-semibold text-[rgb(var(--ios-text-primary))]">
                        {activityLevels[formData.activity_level].name[language]}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        TDEE estimat: ~{calculateTDEE()} {language === 'ro' ? 'calorii/zi' : 'calories/day'}
                      </div>
                    </div>

                    {(formData.is_vegetarian || formData.is_vegan || formData.allergies.length > 0) && (
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {language === 'ro' ? 'Preferințe alimentare' : 'Food Preferences'}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {formData.is_vegan && (
                            <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                              Vegan
                            </Badge>
                          )}
                          {formData.is_vegetarian && !formData.is_vegan && (
                            <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                              {language === 'ro' ? 'Vegetarian' : 'Vegetarian'}
                            </Badge>
                          )}
                          {formData.allergies.map(allergy => (
                            <Badge key={allergy} className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
                              {language === 'ro' ? 'Fără' : 'No'} {allergenTranslations[allergy] || allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.favorite_foods && (
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{language === 'ro' ? 'Alimente favorite' : 'Favorite Foods'}</div>
                        <div className="text-sm text-[rgb(var(--ios-text-secondary))]">{formData.favorite_foods}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {language === 'ro' ? '🎉 Ce urmează?' : '🎉 What\'s Next?'}
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>✓ {language === 'ro' ? 'Începi cu 30 de zile de acces gratuit (perioadă de probă)' : 'Start with 30 days free trial access'}</li>
                    <li>✓ {language === 'ro' ? 'Program personalizat de 28 de zile, adaptat preferințelor tale' : '28-day personalized program adapted to your preferences'}</li>
                    <li>✓ {language === 'ro' ? 'Rețete delicioase pentru fiecare fază' : 'Delicious recipes for each phase'}</li>
                    <li>✓ {language === 'ro' ? 'Monitorizare completă: greutate, mese, apă, exerciții' : 'Complete tracking: weight, meals, water, exercise'}</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </CardContent>

          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                {language === 'ro' ? 'Înapoi' : 'Back'}
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {language === 'ro' ? 'Continuă' : 'Continue'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 shadow-lg"
              >
                {loading 
                  ? (language === 'ro' ? 'Se salvează...' : 'Saving...') 
                  : (language === 'ro' ? '🚀 Începe Programul!' : '🚀 Start Program!')}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
