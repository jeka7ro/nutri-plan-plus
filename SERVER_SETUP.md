# 🚀 Nutri Plan Plus - Setup Local

## Serverul Backend Local

Am creat un server backend complet cu autentificare și bază de date SQLite.

### 📋 Arhitectură

- **Backend**: Express.js pe port 3001
- **Frontend**: Vite React pe port 3000  
- **Bază de date**: SQLite (fișier local `server/nutri-plan.db`)
- **Autentificare**: JWT (JSON Web Tokens)

---

## 🏃 Cum să pornești aplicația

### 1. Pornește Backend-ul

```bash
cd server
npm start
```

Serverul va rula pe **http://localhost:3001**

### 2. Pornește Frontend-ul

În alt terminal:

```bash
npm run dev -- --port 3000
```

Frontend-ul va rula pe **http://localhost:3000**

---

## 👥 Utilizatori de Test

Baza de date vine pre-populată cu 3 utilizatori:

| Email | Parolă | Rol |
|-------|--------|-----|
| `admin@nutriplan.com` | `admin123` | Admin |
| `test@nutriplan.com` | `test123` | User |
| `maria@nutriplan.com` | `maria123` | User |

---

## ✨ Funcționalități

### Autentificare
- ✅ Înregistrare cu email și parolă
- ✅ Login cu email și parolă
- ✅ Logout
- ✅ JWT tokens pentru securitate
- ✅ Utilizatori multipli pot folosi aplicația simultan

### Date Utilizator
- ✅ Profil complet (greutate, înălțime, vârstă, gen)
- ✅ Obiective de greutate
- ✅ Preferințe alimentare
- ✅ Alergii

### Funcționalități App
- ✅ Monitorizare greutate
- ✅ Plan zilnic de mese
- ✅ Rețete (publice și personale)
- ✅ Progres zilnic
- ✅ Prieteni
- ✅ Mesaje între utilizatori
- ✅ Admin panel

---

## 🗄️ Structura Bazei de Date

### Tabele:
- `users` - Utilizatori
- `weight_entries` - Istoric greutate
- `daily_meals` - Planuri de mese zilnice
- `recipes` - Rețete
- `progress_notes` - Note de progres
- `friendships` - Relații de prietenie
- `messages` - Mesaje între utilizatori

---

## 🔧 API Endpoints

### Auth
- `POST /api/auth/register` - Înregistrare
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Profil curent
- `PUT /api/auth/me` - Update profil

### Weight
- `GET /api/weight` - Listă măsurători
- `POST /api/weight` - Adaugă măsurătoare
- `DELETE /api/weight/:id` - Șterge măsurătoare

### Meals
- `GET /api/meals` - Toate mesele
- `GET /api/meals/day/:day` - Mese pentru o zi
- `POST /api/meals` - Adaugă masă
- `PUT /api/meals/:id` - Update masă
- `DELETE /api/meals/:id` - Șterge masă

### Recipes
- `GET /api/recipes` - Toate rețetele
- `GET /api/recipes/:id` - Rețetă specifică
- `POST /api/recipes` - Creează rețetă
- `PUT /api/recipes/:id` - Update rețetă
- `DELETE /api/recipes/:id` - Șterge rețetă

### Friends & Messages
- `GET /api/users` - Toți utilizatorii
- `GET /api/friends` - Lista de prieteni
- `POST /api/friends` - Adaugă prieten
- `GET /api/messages` - Mesaje
- `POST /api/messages` - Trimite mesaj

### Admin
- `GET /api/admin/users` - Toți utilizatorii (admin)
- `PUT /api/admin/users/:id/role` - Schimbă rol (admin)

---

## 📝 Cum să testezi cu utilizatori multipli

1. **Deschide aplicația în browser** - http://localhost:3000
2. **Creează un cont nou** sau folosește unul din cele de test
3. **Completează Onboarding-ul** cu datele tale
4. **Pentru al doilea utilizator:**
   - Deschide un **Incognito/Private window**
   - Mergi la http://localhost:3000
   - Creează alt cont sau folosește alt utilizator de test
5. **Testează funcționalitățile:**
   - Adaugă unul pe altul ca prieten
   - Trimite mesaje
   - Vezi rețetele publice
   - Compară progresul

---

## 🛠️ Development

### Resetare bază de date

Dacă vrei să resetezi baza de date:

```bash
cd server
rm nutri-plan.db
npm start
```

Apoi populează din nou cu date de test:

```bash
curl -X POST http://localhost:3001/api/seed
```

### Verificare server

```bash
curl http://localhost:3001/api/health
```

Ar trebui să returneze: `{"status":"ok","timestamp":"..."}`

---

## 🔐 Securitate

- Parolele sunt hash-ate cu bcrypt
- JWT tokens pentru autentificare
- Toate endpoint-urile (mai puțin auth) necesită token valid
- Datele sunt stocate LOCAL - nu sunt trimise online

---

## 📦 Ce am modificat în cod

1. **Creat `/server`** - Backend complet
2. **Adăugat `src/api/localClient.js`** - Client API pentru frontend
3. **Modificat `src/pages/index.jsx`** - Pagină login/register
4. **Modificat `src/pages/Layout.jsx`** - Folosește localApi
5. **Modificat `src/pages/Onboarding.jsx`** - Salvează în DB local
6. **Modificat `src/App.jsx`** - Adăugat Providers la nivel global

---

## ✅ Testat și funcțional!

Toate datele se salvează în baza de date SQLite locală.
Poți avea utilizatori multipli activi simultan.
Fiecare utilizator are datele sale separate și securizate.

Enjoy! 🎉


