# 🔍 Verificare Render Database - Diagnosticare Probleme Login

## Problema:
- ❌ 401 Unauthorized la `/api/auth/login`
- ❌ 401 Unauthorized la `/api/auth/me`
- ❌ Nu te poți loga pe https://eatnfit.onrender.com/app

## Cauze posibile:

### 1. **Baza de date nu are userii** (cel mai probabil)
- Baza de date Render PostgreSQL este goală
- Nu ai făcut migrarea datelor

### 2. **JWT_SECRET nu este setat corect**
- JWT_SECRET lipsește sau folosește valoarea default
- Trebuie să fie același pe Render și în cod

### 3. **Baza de date nu este conectată**
- Connection string greșit în environment variables
- Baza de date nu este accesibilă

---

## 🔧 Soluție: Verifică Database-ul

### Pasul 1: Rulează Script-ul de Diagnosticare

```bash
cd /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d

# Setează connection string de la Render
export RENDER_POSTGRES_URL="[connection string de la Render PostgreSQL]"

# Rulează verificarea
node check-render-db.js
```

**Unde găsești connection string:**
1. Render Dashboard → `nutriplan-db` → Info
2. Copiază "Internal Database URL"

### Pasul 2: Analizează Rezultatele

Script-ul va afișa:
- ✅ Dacă conexiunea funcționează
- ✅ Dacă tabelele există
- ✅ Câți useri sunt în database
- ✅ Dacă JWT_SECRET este setat corect

---

## 🚨 Dacă nu sunt useri în database:

**SOLUȚIE: Rulează migrarea!**

```bash
# Setează connection strings
export SOURCE_POSTGRES_URL="[connection string de la baza de date existentă]"
export TARGET_POSTGRES_URL="[connection string de la Render PostgreSQL]"

# Rulează migrarea
node migrate-all-data-to-render.js
```

**Ghid complet:** `MIGRARE_ACUM.md`

---

## 🚨 Dacă JWT_SECRET nu este setat:

**SOLUȚIE: Setează JWT_SECRET pe Render!**

1. Render Dashboard → `nutriplan-app` → **Environment**
2. Click **"Add Environment Variable"**
3. **Key:** `JWT_SECRET`
4. **Value:** Generează un string puternic:
   ```bash
   openssl rand -hex 32
   ```
   Sau folosește: `nutri-plan-2024-production-secret-jeka7ro`
5. Click **"Save Changes"**
6. Render va face automat redeploy

**IMPORTANT:** Dacă schimbi JWT_SECRET, toți userii trebuie să se logheze din nou!

---

## 🚨 Dacă baza de date nu este conectată:

**SOLUȚIE: Verifică Environment Variables pe Render!**

1. Render Dashboard → `nutriplan-app` → **Environment**
2. Verifică că există:
   - `DATABASE_URL` = [connection string de la Render PostgreSQL]
   - `POSTGRES_URL` = [connection string de la Render PostgreSQL]
3. **Șterge** connection string-urile vechi (dacă există)
4. Click **"Save Changes"**
5. Render va face automat redeploy

---

## ✅ După ce rezolvi:

1. **Așteaptă redeploy-ul** (2-3 minute)
2. **Testează login** pe https://eatnfit.onrender.com/app
3. **Verifică** că totul funcționează

---

**Script de verificare:** `check-render-db.js`

