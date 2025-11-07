
import React, { useState, useEffect } from "react";
import localApi from "@/api/localClient";
const base44 = localApi;
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Target, Calendar, Crown, Check, Upload, Camera } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Profile() {
  // VERSIUNE: 1.0.1 - NUME SI PRENUME ADAUGATE
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [startDate, setStartDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    localApi.auth.me().then(userData => {
      console.log('📥 User data loaded:', userData);
      console.log('🔍 VERIFICARE NUME:', { first_name: userData.first_name, last_name: userData.last_name });
      setUser(userData);
      setFirstName(userData.first_name || "");
      setLastName(userData.last_name || "");
      setCurrentWeight(userData.current_weight || "");
      setTargetWeight(userData.target_weight || "");
      setHeight(userData.height || "");
      setAge(userData.age || "");
      setGender(userData.gender || "");
      
      // Fix date format: "2025-11-06T00:00:00.000Z" -> "2025-11-06"
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";
        return dateStr.split('T')[0]; // Ia doar partea de dată
      };
      
      setStartDate(formatDateForInput(userData.start_date) || format(new Date(), 'yyyy-MM-dd'));
      setBirthDate(formatDateForInput(userData.birth_date) || "");
      setCountry(userData.country || "");
      setCity(userData.city || "");
    }).catch(() => {});
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => {
      console.log('📤 Salvez datele:', data);
      return localApi.auth.updateProfile(data);
    },
    onSuccess: (updatedUser) => {
      console.log('✅ Date salvate cu succes:', updatedUser);
      setUser(updatedUser);
      alert('✅ Date salvate cu succes!');
    },
    onError: (error) => {
      console.error('❌ Eroare la salvare:', error);
      alert('❌ Eroare la salvare: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSave = {
      first_name: firstName || null,
      last_name: lastName || null,
      current_weight: currentWeight ? parseFloat(currentWeight) : null,
      target_weight: targetWeight ? parseFloat(targetWeight) : null,
      height: height ? parseFloat(height) : null,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      start_date: startDate || null,
      birth_date: birthDate || null,
      country: country || null,
      city: city || null,
    };
    
    console.log('🚀 Trimit datele spre salvare:', dataToSave);
    updateProfileMutation.mutate(dataToSave);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      // Convertește imaginea la base64 direct (fără server upload)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          // Resize și compress imaginea
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 (JPEG, calitate 0.7 pentru compresia)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          // Salvează direct în profil
          await updateProfileMutation.mutateAsync({ profile_picture: compressedBase64 });
          setUploadingPhoto(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Eroare la încărcarea pozei');
      setUploadingPhoto(false);
    }
  };

  const calculateBMI = () => {
    if (!currentWeight || !height) return null;
    const heightInMeters = height / 100;
    return (currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI();
  const subscriptionTypes = {
    trial: { label: "Perioadă de probă", color: "bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300" },
    monthly: { label: "Abonament lunar", color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" },
    yearly: { label: "Abonament anual", color: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300" }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">Profilul Meu</h1>
          <p className="text-[rgb(var(--ios-text-secondary))] mt-1">Gestionează informațiile și abonamentul</p>
        </div>

        {/* User Info Card with Photo */}
        <Card className="ios-card border-none shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt={user.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <label 
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[rgb(var(--ios-bg-tertiary))] border-2 border-emerald-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors shadow-md"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-[rgb(var(--ios-text-primary))]">{user?.full_name}</h2>
                <p className="text-[rgb(var(--ios-text-secondary))]">{user?.email}</p>
                <div className="flex gap-2 mt-3 justify-center md:justify-start flex-wrap">
                  <Badge className={subscriptionTypes[user?.subscription_type || 'trial'].color}>
                    <Crown className="w-3 h-3 mr-1" />
                    {subscriptionTypes[user?.subscription_type || 'trial'].label}
                  </Badge>
                  {user?.subscription_expires && (
                    <Badge variant="outline" className="border-[rgb(var(--ios-border))] text-[rgb(var(--ios-text-secondary))]">
                      Până la {format(new Date(user.subscription_expires), "d MMM yyyy", { locale: ro })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="ios-card border-none shadow-lg">
            <CardContent className="p-6">
              <div className="text-sm text-[rgb(var(--ios-text-secondary))] mb-1">Greutate curentă</div>
              <div className="text-3xl font-bold text-[rgb(var(--ios-text-primary))]">
                {currentWeight || '-'} kg
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card border-none shadow-lg">
            <CardContent className="p-6">
              <div className="text-sm text-[rgb(var(--ios-text-secondary))] mb-1">Greutate țintă</div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {targetWeight || '-'} kg
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card border-none shadow-lg">
            <CardContent className="p-6">
              <div className="text-sm text-[rgb(var(--ios-text-secondary))] mb-1">IMC</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {bmi || '-'}
              </div>
              {bmi && (
                <div className="text-xs text-[rgb(var(--ios-text-secondary))] mt-1">
                  {bmi < 18.5 && 'Subponderal'}
                  {bmi >= 18.5 && bmi < 25 && 'Normal'}
                  {bmi >= 25 && bmi < 30 && 'Supraponderal'}
                  {bmi >= 30 && 'Obezitate'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Form */}
        <Card className="ios-card border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Actualizează datele tale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[rgb(var(--ios-text-primary))]">👤 Prenume *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Ion"
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[rgb(var(--ios-text-primary))]">👤 Nume *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Popescu"
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-[rgb(var(--ios-text-primary))]">📅 Data nașterii *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Sexul</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="border-[rgb(var(--ios-border))]">
                      <SelectValue placeholder="Selectează" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Feminin</SelectItem>
                      <SelectItem value="male">Masculin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-[rgb(var(--ios-text-primary))]">🌍 Țara</Label>
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ex: România"
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[rgb(var(--ios-text-primary))]">🏙️ Orașul</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: București"
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentWeight" className="text-[rgb(var(--ios-text-primary))]">Greutate inițială (kg)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder="Ex: 80"
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight" className="text-[rgb(var(--ios-text-primary))]">Greutate țintă (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="Ex: 70"
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-[rgb(var(--ios-text-primary))]">Înălțime (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ex: 170"
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-[rgb(var(--ios-text-primary))]">Data începerii programului</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-[rgb(var(--ios-border))]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[12px]"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  'Se salvează...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Salvează modificările
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Program Info */}
        <Card className="ios-card border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Despre program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-[rgb(var(--ios-text-primary))]">Program de 28 de zile</div>
                <div className="text-sm text-[rgb(var(--ios-text-secondary))]">4 săptămâni complete cu meniuri detaliate</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-[rgb(var(--ios-text-primary))]">3 faze distincte</div>
                <div className="text-sm text-[rgb(var(--ios-text-secondary))]">Fiecare fază cu rol specific în metabolism</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-[rgb(var(--ios-text-primary))]">Tracking complet</div>
                <div className="text-sm text-[rgb(var(--ios-text-secondary))]">Monitorizare greutate și progres zilnic</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-[rgb(var(--ios-text-primary))]">Rețete delicioase</div>
                <div className="text-sm text-[rgb(var(--ios-text-secondary))]">Peste 50 de rețete adaptate pe faze</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="ios-card border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[rgb(var(--ios-text-primary))]">
              <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Abonament
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[rgb(var(--ios-bg-tertiary))] rounded-xl border border-[rgb(var(--ios-border))]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[rgb(var(--ios-text-primary))]">Status actual</span>
                <Badge className={subscriptionTypes[user?.subscription_type || 'trial'].color}>
                  {subscriptionTypes[user?.subscription_type || 'trial'].label}
                </Badge>
              </div>
              {user?.subscription_expires && (
                <p className="text-sm text-[rgb(var(--ios-text-secondary))]">
                  Abonamentul expiră pe {format(new Date(user.subscription_expires), "d MMMM yyyy", { locale: ro })}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg text-blue-900 dark:text-blue-100">Abonament Lunar</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Acces complet la toate funcțiile</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">99 RON</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">pe lună</div>
                  </div>
                </div>
                <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 rounded-[12px]">
                  Alege lunar
                </Button>
              </div>

              <div className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-xl bg-purple-50 dark:bg-purple-900/20 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Badge className="bg-purple-600 text-white">Cea mai populară</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg text-purple-900 dark:text-purple-100">Abonament Anual</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Economisești 40%!</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">699 RON</div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">pe an (~58 RON/lună)</div>
                  </div>
                </div>
                <Button className="w-full mt-3 bg-purple-600 hover:bg-purple-700 rounded-[12px]">
                  Alege anual
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
