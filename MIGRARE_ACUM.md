# 🚀 MIGRARE DATE - PAȘI EXACȚI

## 📋 Ce vei face:
Migrezi **TOATE datele** (useri, rețete, poze, prietenii, greutate, tot!) din baza de date existentă în Render PostgreSQL.

---

## PASUL 1: Găsește Connection Strings (5 minute)

### A. SOURCE (baza de date existentă - de unde migrăm)

**Dacă ai baza de date pe Neon:**
1. Mergi pe https://console.neon.tech
2. Selectează proiectul
3. Click "Connection Details"
4. **COPIAZĂ** connection string-ul (ex: `postgresql://user:pass@host/db`)

**Dacă ai baza de date pe alt serviciu:**
- Găsește connection string-ul PostgreSQL

### B. TARGET (Render PostgreSQL - unde migrăm)

1. Mergi pe https://dashboard.render.com
2. Click pe **PostgreSQL Database** (`nutriplan-db`)
3. Click pe tab-ul **"Info"**
4. Găsește **"Internal Database URL"** sau **"Connection String"**
5. **COPIAZĂ** connection string-ul (ex: `postgresql://nutriplan:xxx@dpg-xxx.frankfurt-postgres.render.com/nutriplan`)

---

## PASUL 2: Rulează Script-ul de Migrare (10-15 minute)

### Deschide Terminal:

```bash
cd /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d
```

### Setează Environment Variables:

**Înlocuiește `[SOURCE_URL]` și `[TARGET_URL]` cu connection strings-urile copiate!**

```bash
export SOURCE_POSTGRES_URL="[connection string de la baza de date existentă]"
export TARGET_POSTGRES_URL="[connection string de la Render PostgreSQL]"
```

**Exemplu:**
```bash
export SOURCE_POSTGRES_URL="postgresql://user:pass@neon-host/db"
export TARGET_POSTGRES_URL="postgresql://nutriplan:xxx@dpg-xxx.frankfurt-postgres.render.com/nutriplan"
```

### Rulează Migrarea:

```bash
node migrate-all-data-to-render.js
```

### Ce vei vedea:

```
🚀 Starting migration to Render PostgreSQL...

📋 This will migrate TOATE datele:
   - Users (toți userii - cu poze, profile_picture, etc.)
   - Recipes (toate rețetele - admin și user - cu poze)
   - Daily Check-ins (toate check-in-urile - cu poze)
   ...

🔌 Testing connections...
   ✅ Connected to SOURCE database
   ✅ Connected to RENDER PostgreSQL (TARGET)

🔄 Migrating users...
   📊 Found 50 records in source database
   🖼️  Users with profile pictures: 30/50
   ✅ Migrated users: 50 inserted, 0 updated

🔄 Migrating recipes...
   📊 Found 200 records in source database
   🖼️  Recipes with images: 180/200
      📸 Recipe #1 image migrated (base64)
      📸 Recipe #2 image migrated (URL)
   ✅ Migrated recipes: 200 inserted, 0 updated

...
```

**⏳ Așteaptă să se termine (5-15 minute, depinde de câte date ai)**

---

## PASUL 3: Actualizează Environment Variables pe Render (2 minute)

**IMPORTANT:** După migrare, Render trebuie să folosească Render PostgreSQL!

1. Mergi pe https://dashboard.render.com
2. Click pe serviciul tău (`nutriplan-app`)
3. Click pe tab-ul **"Environment"**
4. **Actualizează** sau **Adaugă**:
   - `POSTGRES_URL` = [connection string de la Render PostgreSQL - TARGET]
   - `DATABASE_URL` = [connection string de la Render PostgreSQL - TARGET]
5. **Șterge** connection string-ul vechi (dacă există)
6. Click **"Save Changes"**
7. Render va face automat **redeploy** (2-3 minute)

---

## PASUL 4: Testează (5 minute)

1. **Așteaptă redeploy-ul** (vezi în Render Dashboard → "Events" → "Deploy")
2. Când apare **"Live"**, mergi pe site-ul tău
3. **Testează login** cu un user existent
4. **Verifică:**
   - ✅ Rețete (admin și user) - **cu poze**
   - ✅ Check-ins - **cu poze**
   - ✅ Greutate
   - ✅ Prieteni
   - ✅ Mesaje
   - ✅ Profile pictures

---

## ✅ GATA!

Dacă totul funcționează, **toate datele sunt migrate în Render PostgreSQL!**

---

## ❌ Dacă ai probleme:

### Eroare: "Cannot connect to database"
- Verifică că connection strings-urile sunt corecte
- Verifică că bazele de date sunt accesibile

### Eroare: "Table does not exist"
- Verifică că tabelele există în ambele baze de date
- Rulează `server/database-pg.js` pentru a crea tabelele în Render

### Date duplicate
- Script-ul folosește `ON CONFLICT DO NOTHING` - nu ar trebui să fie duplicate
- Dacă sunt, șterge-le manual din Render

### Date lipsă
- Verifică logs-urile script-ului
- Rulează din nou script-ul (va actualiza record-urile existente)

---

**Script:** `migrate-all-data-to-render.js`  
**Ghid complet:** `MIGRATE_DATA_TO_RENDER.md`

