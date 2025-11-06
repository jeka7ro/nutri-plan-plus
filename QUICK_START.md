# 🚀 Ghid Rapid - Nutri Plan Plus

## Start Rapid (2 comenzi)

### Opțiunea 1: Start Complet Automat

```bash
./start-all.sh
```

### Opțiunea 2: Start Manual (pentru debug)

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev -- --port 3000
```

---

## ✅ Verificare

- **Backend**: http://localhost:3001/api/health
- **Frontend**: http://localhost:3000

---

## 👤 Utilizatori de Test

Deja creați în baza de date:

```
Email: admin@nutriplan.com
Parolă: admin123
Rol: Admin
```

```
Email: test@nutriplan.com
Parolă: test123
Rol: User
```

```
Email: maria@nutriplan.com  
Parolă: maria123
Rol: User
```

---

## 🎯 Testare cu Utilizatori Multipli

### Pas 1: Primul Utilizator
1. Deschide http://localhost:3000
2. Click pe "Nu ai cont? Creează unul aici"
3. Completează: 
   - Nume: Ionel Popescu
   - Email: ionel@test.com
   - Parolă: test123
4. Click "Creează cont"
5. Completează Onboarding-ul (greutate, înălțime, etc)

### Pas 2: Al Doilea Utilizator
1. Deschide o fereastră **Incognito/Private**
2. Mergi la http://localhost:3000
3. Creează alt cont:
   - Nume: Ana Ionescu
   - Email: ana@test.com
   - Parolă: test123
4. Completează Onboarding-ul

### Pas 3: Testează Funcționalități
- Adaugă unul pe altul ca prieten (Friends page)
- Trimite mesaje (Messages page)
- Vezi rețetele create de fiecare
- Compară progresul

---

## 📊 Funcționalități Disponibile

### ✅ Complet Funcționale
- ✅ **Înregistrare** - Creează cont cu email
- ✅ **Login** - Autentificare cu email/parolă
- ✅ **Logout** - Deconectare sigură
- ✅ **Onboarding** - Completare date personale
- ✅ **Profil** - Editare date utilizator
- ✅ **Weight Tracking** - Adaugă/șterge măsurători
- ✅ **Recipes** - Vezi/creează rețete
- ✅ **Friends** - Adaugă prieteni
- ✅ **Messages** - Trimite mesaje
- ✅ **Admin Panel** - Gestionează utilizatori

### 🔄 Parțial Funcționale
- ⚠️ **Daily Plan** - Interfață funcțională, salvare simplificată
- ⚠️ **Progress** - Afișare, salvare simplificată
- ⚠️ **AI Assistant** - UI funcțional, backend stub

---

## 🔧 Debugging

### Server nu pornește?
```bash
cd server
rm nutri-plan.db
npm install
npm start
```

### Baza de date goală?
```bash
curl -X POST http://localhost:3001/api/seed
```

### Frontend nu se conectează?
- Verifică că backend-ul rulează: http://localhost:3001/api/health
- Verifică consola browser pentru erori CORS

---

## 💾 Date Salvate

Toate datele sunt salvate în:
```
server/nutri-plan.db
```

### Resetare completă:
```bash
cd server
rm nutri-plan.db
npm start
curl -X POST http://localhost:3001/api/seed
```

---

## 🎨 Testare Rapidă

1. **Login cu cont existent:**
   - Email: `test@nutriplan.com`
   - Parolă: `test123`

2. **Sau creează cont nou:**
   - Click "Nu ai cont? Creează unul aici"
   - Completează formularul

3. **Testează Logout:**
   - În sidebar (stânga jos)
   - Click pe butonul cu icon de "Logout"

---

## 📱 Features Multi-User

- Fiecare utilizator are propriile date
- Rețetele pot fi publice sau private
- Utilizatorii pot deveni prieteni
- Mesaje între utilizatori
- Admin poate gestiona toți utilizatorii

---

Enjoy! 🎉


