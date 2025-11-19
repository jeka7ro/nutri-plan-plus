# 🔄 Migrare Toate Datele de la Neon la Render PostgreSQL

## 📋 Ce va fi migrat:

- ✅ **Users** - toți userii (admin și user simplu)
- ✅ **Recipes** - toate rețetele (admin și user)
- ✅ **Daily Check-ins** - toate check-in-urile
- ✅ **Weight Entries** - toate măsurătorile de greutate
- ✅ **Progress Notes** - toate notele de progres
- ✅ **Friendships** - toate prieteniile
- ✅ **Messages** - toate mesajele
- ✅ **Subscription Codes** - toate codurile de subscription
- ✅ **Backups** - toate backup-urile
- ✅ **Payment Processors** - toate procesatoarele de plată

## 🚀 Pași pentru Migrare:

### 1. Pregătește Connection Strings

**De la Neon:**
1. Mergi pe https://console.neon.tech
2. Selectează proiectul
3. Click "Connection Details"
4. Copiază connection string-ul

**De la Render:**
1. Mergi pe https://dashboard.render.com
2. Selectează PostgreSQL Database (`nutriplan-db`)
3. Click "Info" tab
4. Copiază "Internal Database URL" sau "Connection String"

### 2. Rulează Script-ul de Migrare

**Opțiunea A: Local (pe computerul tău)**

```bash
cd /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d

# Setează environment variables
export NEON_POSTGRES_URL="[connection string de la Neon]"
export RENDER_POSTGRES_URL="[connection string de la Render]"

# Rulează migrarea
node migrate-all-data-to-render.js
```

**Opțiunea B: Direct pe Render (via SSH/Console)**

1. Pe Render Dashboard → serviciul tău → "Shell"
2. Sau folosește Render Console
3. Rulează script-ul cu connection strings

### 3. Verifică Migrarea

Script-ul va afișa:
- Câte record-uri au fost găsite în Neon
- Câte au fost inserate/actualizate în Render
- Erori (dacă există)

### 4. Actualizează Environment Variables pe Render

**IMPORTANT:** După migrare, actualizează Render să folosească Render PostgreSQL:

1. Render Dashboard → serviciul tău → **Environment**
2. **Șterge** sau **actualizează**:
   - `POSTGRES_URL` = [connection string de la Render PostgreSQL]
   - `DATABASE_URL` = [connection string de la Render PostgreSQL]
3. **NU** folosi connection string-ul de la Neon!
4. Click **"Save Changes"**
5. Render va face automatic redeploy

### 5. Testează

1. Așteaptă redeploy-ul (2-3 minute)
2. Mergi pe https://eatnfit.onrender.com
3. Încearcă să te loghezi cu un user existent
4. Verifică că toate datele sunt accesibile:
   - Rețete (admin și user)
   - Check-ins
   - Greutate
   - Prieteni
   - Mesaje

## ⚠️ IMPORTANT:

- **Backup înainte:** Fă un backup complet din Neon înainte de migrare
- **Test înainte:** Testează script-ul pe un user de test mai întâi
- **Verifică după:** Verifică că toate datele au fost migrate corect

## 🔧 Dacă ai probleme:

1. **Erori la migrare:**
   - Verifică că ambele connection strings sunt corecte
   - Verifică că tabelele există în ambele baze de date
   - Verifică logs-urile pentru detalii

2. **Date duplicate:**
   - Script-ul folosește `ON CONFLICT DO NOTHING` pentru a evita duplicate
   - Dacă există duplicate, șterge-le manual din Render

3. **Date lipsă:**
   - Verifică logs-urile script-ului
   - Rulează din nou script-ul (va actualiza record-urile existente)

---

**Script:** `migrate-all-data-to-render.js`

