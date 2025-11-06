# 🎉 Nutri Plan Plus - Sistem Complet de Autentificare Locală

## ✅ CE AM CREAT

Am implementat un sistem **COMPLET** de autentificare și backend local pentru aplicația Nutri Plan Plus:

### 🏗️ Arhitectură

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  Port: 3000                             │
│  - Login/Register UI                    │
│  - Toate paginile aplicației            │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────┐
│  Backend (Express.js)                   │
│  Port: 3001                             │
│  - API REST                             │
│  - JWT Authentication                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Database (SQLite)                      │
│  File: server/nutri-plan.db            │
│  - Date utilizatori                     │
│  - Greutăți, mese, rețete              │
└─────────────────────────────────────────┘
```

---

## 🚀 PORNIRE RAPIDĂ

### Metoda 1: Automată (Recomandat)

```bash
./start-all.sh
```

### Metoda 2: Manuală

**Terminal 1:**
```bash
cd server
npm start
```

**Terminal 2:**
```bash
npm run dev -- --port 3000
```

---

## 📝 TESTARE PAS CU PAS

### 1️⃣ Creează Primul Utilizator

1. Deschide http://localhost:3000
2. Vei vedea pagina de **Login/Register**
3. Click pe **"Nu ai cont? Creează unul aici"**
4. Completează:
   ```
   Nume: Ion Popescu
   Email: ion@test.com
   Parolă: password123
   ```
5. Click **"Creează cont"**
6. Completează **Onboarding**:
   - Greutate curentă: 80 kg
   - Greutate țintă: 75 kg
   - Înălțime: 175 cm
   - Vârstă: 30
   - Gen: Masculin
   - Nivel activitate: Moderat
7. Vei ajunge la **Dashboard**

### 2️⃣ Creează Al Doilea Utilizator

1. Deschide o fereastră **Incognito/Private** (Cmd+Shift+N în Chrome)
2. Mergi la http://localhost:3000
3. Click **"Nu ai cont? Creează unul aici"**
4. Completează:
   ```
   Nume: Maria Ionescu
   Email: maria@test.com
   Parolă: password123
   ```
5. Completează Onboarding cu date diferite
6. Vei ajunge la Dashboard

### 3️⃣ Testează Funcționalitățile

**Ca primul utilizator (Ion):**
- Mergi la **Friends** (din sidebar)
- Caută "Maria Ionescu"
- Adaugă-o ca prieten
- Mergi la **Messages**
- Trimite-i un mesaj

**Ca al doilea utilizator (Maria):**
- Mergi la **Friends**
- Vezi cererea de prietenie
- Acceptă-o
- Mergi la **Messages**
- Vezi mesajul de la Ion
- Răspunde

**Ambii utilizatori:**
- Mergi la **Weight Tracking**
- Adaugă câteva măsurători
- Vezi graficul personal
- Mergi la **Recipes**
- Creează rețete noi
- Vezi rețetele publice ale celorlalți

### 4️⃣ Testează Logout

- Click pe butonul **Logout** din sidebar (jos)
- Vei fi redirectat la pagina de Login
- Datele tale sunt salvate
- Re-login cu același email/parolă pentru a continua

---

## 🗄️ Baza de Date

### Tabele Create

1. **users** - Informații utilizatori
   - Email, parolă (hash-ată), nume
   - Date personale (greutate, înălțime, vârstă)
   - Preferințe alimentare și alergii

2. **weight_entries** - Istoric greutate
   - Măsurători zilnice
   - Note personale

3. **daily_meals** - Planuri de mese
   - Mese pe zile (1-28)
   - Calorii, macronutrienți
   - Status completare

4. **recipes** - Rețete
   - Publice și private
   - Ingrediente, instrucțiuni
   - Valori nutriționale

5. **progress_notes** - Note de progres
   - Jurnal zilnic
   - Mood, energie

6. **friendships** - Relații de prietenie
   - Status: pending, accepted, rejected

7. **messages** - Mesaje între utilizatori
   - Text, timestamp
   - Status citit/necitit

### Vizualizare Date

Pentru SQLite:
```bash
cd server
sqlite3 nutri-plan.db
```

Comenzi utile:
```sql
.tables                           -- Vezi toate tabelele
SELECT * FROM users;              -- Vezi toți utilizatorii
SELECT * FROM weight_entries;    -- Vezi măsurătorile
SELECT * FROM recipes;           -- Vezi rețetele
.quit                            -- Ieși
```

---

## 🔐 Securitate

- ✅ **Parole hash-ate** - bcryptjs cu 10 rounds
- ✅ **JWT tokens** - Expiră în 30 de zile
- ✅ **Protected endpoints** - Toate necesită autentificare
- ✅ **CORS enabled** - Pentru development
- ✅ **Input validation** - Email, parolă minimă 6 caractere

---

## 🎯 API Endpoints

### Autentificare
```
POST   /api/auth/register   - Creează cont nou
POST   /api/auth/login      - Autentificare
GET    /api/auth/me         - Profilul curent
PUT    /api/auth/me         - Update profil
```

### Date Utilizator
```
GET    /api/weight          - Lista măsurători greutate
POST   /api/weight          - Adaugă măsurătoare
DELETE /api/weight/:id      - Șterge măsurătoare

GET    /api/meals           - Toate mesele
GET    /api/meals/day/:day  - Mese pentru o zi
POST   /api/meals           - Adaugă masă
PUT    /api/meals/:id       - Update masă
DELETE /api/meals/:id       - Șterge masă

GET    /api/recipes         - Toate rețetele
GET    /api/recipes/:id     - Rețetă specifică
POST   /api/recipes         - Creează rețetă
PUT    /api/recipes/:id     - Update rețetă
DELETE /api/recipes/:id     - Șterge rețetă

GET    /api/progress        - Note de progres
POST   /api/progress        - Adaugă notă

GET    /api/users           - Toți utilizatorii
GET    /api/friends         - Prieteni
POST   /api/friends         - Adaugă prieten

GET    /api/messages        - Mesaje
POST   /api/messages        - Trimite mesaj
PUT    /api/messages/:id/read - Marchează ca citit
```

### Admin (doar pentru role='admin')
```
GET    /api/admin/users          - Toți utilizatorii
PUT    /api/admin/users/:id/role - Schimbă rol
```

### Utility
```
GET    /api/health          - Status server
POST   /api/seed            - Populează date de test
```

---

## 💡 Exemplu de Utilizare (cURL)

### Creează cont:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"nou@test.com","password":"test123","name":"Utilizator Nou"}'
```

### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@nutriplan.com","password":"test123"}'
```

Răspuns:
```json
{
  "user": {
    "id": 2,
    "email": "test@nutriplan.com",
    "name": "Test User",
    "role": "user"
  },
  "token": "eyJhbGciOiJI..."
}
```

### Folosește token-ul:
```bash
TOKEN="eyJhbGciOiJI..."

curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Eroare: "Failed to connect to localhost:3001"
**Soluție:** Backend-ul nu rulează
```bash
cd server
npm start
```

### Eroare: "Email already exists"
**Soluție:** Folosește alt email sau resetează baza de date
```bash
cd server
rm nutri-plan.db
npm start
curl -X POST http://localhost:3001/api/seed
```

### Eroare: "Invalid token"
**Soluție:** Token-ul a expirat sau e invalid
- Fă logout și login din nou
- Sau șterge localStorage din browser DevTools

### Frontend nu se conectează
**Verifică:**
1. Backend rulează: `curl http://localhost:3001/api/health`
2. CORS este enabled în server.js
3. Nu ai erori în consola browser

---

## 📊 Monitorizare

### Vezi utilizatori înregistrați:
```bash
cd server
sqlite3 nutri-plan.db "SELECT id, email, name, role FROM users;"
```

### Vezi măsurători greutate:
```bash
sqlite3 nutri-plan.db "SELECT * FROM weight_entries;"
```

### Vezi rețete:
```bash
sqlite3 nutri-plan.db "SELECT id, name, user_id, is_public FROM recipes;"
```

---

## 🎨 Design Decisions

### De ce SQLite?
- ✅ Zero configurare
- ✅ Fișier local - date private
- ✅ Perfect pentru development
- ✅ Rapid și eficient
- ✅ Ușor de backup (copiază .db file)

### De ce JWT?
- ✅ Stateless - serverul nu stochează sesiuni
- ✅ Securizat
- ✅ Expirare automată
- ✅ Include user info

### De ce Express?
- ✅ Simplu și rapid
- ✅ Middleware ecosystem
- ✅ REST API standard
- ✅ Bine documentat

---

## 📦 Structura Proiectului

```
nutri-plan-plus/
├── server/                    # Backend
│   ├── server.js             # Server principal
│   ├── database.js           # Schema & init DB
│   ├── auth.js               # Logică autentificare
│   ├── package.json          # Dependențe backend
│   └── nutri-plan.db         # Baza de date (generat)
│
├── src/
│   ├── api/
│   │   ├── localClient.js    # Client API direct
│   │   ├── apiAdapter.js     # Adaptor Base44 → Local
│   │   └── base44Client.js   # Client Base44 (unused)
│   │
│   ├── pages/
│   │   ├── index.jsx         # Login/Register ✨ NOU
│   │   ├── Onboarding.jsx    # Modificat pentru local API
│   │   ├── Dashboard.jsx     # Modificat
│   │   ├── Layout.jsx        # Modificat
│   │   └── ...               # Toate modificate
│   │
│   └── components/
│       ├── LanguageContext.jsx
│       ├── ThemeContext.jsx
│       └── ...
│
├── start-all.sh              # Script pornire automată
├── QUICK_START.md            # Ghid rapid
└── SERVER_SETUP.md           # Documentație detaliată
```

---

## 🔄 Workflow Development

### Zi cu zi:
1. `./start-all.sh` - Pornește totul
2. Dezvoltă features
3. Testează cu utilizatori multipli
4. Ctrl+C pentru a opri

### Resetare completă:
```bash
# Șterge baza de date
rm server/nutri-plan.db

# Repornește serverul
cd server && npm start

# Populează date de test
curl -X POST http://localhost:3001/api/seed
```

---

## ✨ Features Implementate

### ✅ Autentificare Completă
- Înregistrare cu email/parolă
- Login cu validare
- Logout sigur
- JWT tokens
- Protected routes

### ✅ Multi-User Support
- Utilizatori multipli activi simultan
- Fiecare cu datele sale
- Mesaje între utilizatori
- Sistem de prietenie

### ✅ Date Persistente
- Toate datele salvate în SQLite
- Nu se pierd la restart
- Backup simplu (copiază .db file)
- Nu se trimit online NICĂIERI

### ✅ API Complet
- Weight tracking
- Meals planning
- Recipes management
- Progress notes
- Friends system
- Messaging
- Admin panel

---

## 🎓 Cum Să Testezi Cu Mai Mulți Utilizatori

### Scenariul 1: Desktop + Mobile

**Pe Desktop:**
1. http://localhost:3000
2. Login ca `test@nutriplan.com`

**Pe Mobile (același WiFi):**
1. Află IP-ul computerului: `ipconfig getifaddr en0` (Mac) sau `ipconfig` (Windows)
2. Pe telefon: http://[IP]:3000
3. Creează alt cont

### Scenariul 2: Multiple Browsers

**Chrome Normal:**
- Utilizator 1

**Chrome Incognito:**
- Utilizator 2

**Firefox:**
- Utilizator 3

### Scenariul 3: Multiple Tabs Incognito

- Fiecare tab Incognito = sesiune separată
- Poți avea 5+ utilizatori activi simultan

---

## 🔥 Demo Quick

```bash
# Pornește aplicația
./start-all.sh

# Într-un browser nou (sau tab Incognito):
# 1. Mergi la http://localhost:3000
# 2. Creează cont: demo@test.com / demo123
# 3. Completează onboarding
# 4. Adaugă măsurători greutate
# 5. Creează rețete
# 6. Logout
# 7. Login din nou - datele sunt salvate!
```

---

## 📊 Monitorizare & Debug

### Vezi logs server:
Backend-ul afișează toate request-urile în terminal

### Vezi JWT token:
```javascript
// În browser console:
localStorage.getItem('auth_token')
```

### Vezi user curent:
```javascript
// În browser console:
JSON.parse(localStorage.getItem('current_user'))
```

### Test API direct:
```bash
# Health check
curl http://localhost:3001/api/health

# Get user (cu token)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Ce Poți Face Acum

### ✅ Development Local Complet
- Dezvoltă features fără internet
- Testează cu date reale (nu mock)
- Multiple utilizatori simultan
- Date persistente între restarts

### ✅ Testing
- Creează conturi de test
- Testează flows complete
- Verifică permisiuni (user vs admin)
- Testează edge cases

### ✅ Demo
- Arată aplicația clienților
- Fără dependențe externe
- Control complet asupra datelor
- Performanță maximă (local)

---

## 🚨 Important

### Date Locale = Siguranță
- Datele NU ies din computerul tău
- NU se trimit la Base44
- NU se trimit online
- Tot ce creezi rămâne LOCAL

### Backup Simplu
```bash
# Backup baza de date
cp server/nutri-plan.db server/nutri-plan.backup.db

# Restore
cp server/nutri-plan.backup.db server/nutri-plan.db
```

### Producție
Pentru producție, poți:
1. Deploy backend pe un server real
2. Schimbă SQLite cu PostgreSQL/MySQL
3. Adaugă HTTPS
4. Rate limiting
5. Email verification

---

## 🎉 SUCCESS!

Ai acum un sistem **COMPLET FUNCȚIONAL** de:
- ✅ Autentificare cu email/parolă
- ✅ Înregistrare utilizatori noi
- ✅ Multi-user support
- ✅ Backend local cu SQLite
- ✅ API REST complet
- ✅ Date persistente
- ✅ Zero dependențe online

**Totul rulează 100% LOCAL pe computerul tău!** 🚀

Pentru orice întrebări, verifică:
- `SERVER_SETUP.md` - Detalii tehnice
- `QUICK_START.md` - Ghid rapid pornire
- `server/server.js` - Cod backend comentat


