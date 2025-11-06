# 🚀 DEPLOYMENT GUIDE - Nutri Plan Plus

## 📋 OVERVIEW

**Backend:** Render (Node.js + PostgreSQL)  
**Frontend:** Vercel (Vite + React)

---

## 1️⃣ PREGĂTIRE - GITHUB

### Push codul pe GitHub:

```bash
cd /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d

# Verifică că toate fișierele sunt committed
git status

# Creează repo nou pe GitHub: https://github.com/new
# Nume: nutri-plan-plus

# Adaugă GitHub remote
git remote add origin https://github.com/USERNAME/nutri-plan-plus.git

# Push codul
git branch -M main
git push -u origin main
```

---

## 2️⃣ DEPLOY BACKEND - RENDER

### A. Creează PostgreSQL Database

1. Mergi pe **https://render.com**
2. Click **"New +"** → **"PostgreSQL"**
3. Setări:
   - **Name:** `nutriplan-db`
   - **Database:** `nutriplan`
   - **User:** `nutriplan` (automat)
   - **Region:** `Frankfurt` (sau EU aproape)
   - **Plan:** `Free` (sau `Starter` pentru producție)
4. Click **"Create Database"**
5. **SALVEAZĂ "Internal Database URL"** - vei avea nevoie!

### B. Creează Web Service (Backend)

1. Click **"New +"** → **"Web Service"**
2. Conectează GitHub repo-ul
3. Setări:
   - **Name:** `nutriplan-backend`
   - **Region:** `Frankfurt` (același cu DB)
   - **Branch:** `main`
   - **Runtime:** `Docker`
   - **Plan:** `Free` (sau `Starter`)
4. **Environment Variables:**
   ```
   DATABASE_URL = [copiază Internal Database URL de la pasul A]
   JWT_SECRET = nutri-plan-plus-super-secret-key-2024-PRODUCTION
   FRONTEND_URL = https://your-app.vercel.app (actualizează după deploy frontend)
   NODE_ENV = production
   PORT = 3001
   ```
5. Click **"Create Web Service"**
6. Așteaptă build (~5-10 minute)
7. **SALVEAZĂ URL-ul:** `https://nutriplan-backend.onrender.com`

### C. Inițializează Database

După ce backend-ul e LIVE:

1. Deschide Render Dashboard → `nutriplan-backend` → **"Shell"** tab
2. Rulează:
   ```bash
   node server/database-pg.js
   ```
3. Sau conectează-te la DB și rulează:
   ```bash
   psql $DATABASE_URL -f server/add-snack2-phase1-phase2.sql
   ```

---

## 3️⃣ DEPLOY FRONTEND - VERCEL

### A. Creează project Vercel

1. Mergi pe **https://vercel.com**
2. Click **"Add New"** → **"Project"**
3. **Import GitHub repo:** `nutri-plan-plus`
4. Setări:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### B. Environment Variables

Click **"Environment Variables"** și adaugă:

```
VITE_API_URL = https://nutriplan-backend.onrender.com/api
```

### C. Deploy

1. Click **"Deploy"**
2. Așteaptă build (~3-5 minute)
3. **SALVEAZĂ URL-ul:** `https://your-app.vercel.app`

### D. Actualizează FRONTEND_URL în Render

1. Mergi înapoi în Render → `nutriplan-backend`
2. **Environment** → Editează `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://your-app.vercel.app
   ```
3. Salvează → Backend se va redeploy automat

---

## 4️⃣ VERIFICARE FINALĂ

### A. Testează Backend

```bash
# Health check
curl https://nutriplan-backend.onrender.com/api/health

# Login test
curl -X POST https://nutriplan-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jeka7ro@gmail.com","password":"admin123777"}'
```

### B. Testează Frontend

1. Deschide `https://your-app.vercel.app`
2. Loghează-te cu `jeka7ro@gmail.com` / `admin123777`
3. Verifică Dashboard, Daily Plan, Recipes

---

## 5️⃣ TROUBLESHOOTING

### Backend nu pornește?

```bash
# Verifică logs în Render Dashboard
# Logs → caută erori SQL sau connection

# Verifică env vars:
echo $DATABASE_URL
echo $JWT_SECRET
```

### Frontend nu se conectează la backend?

```bash
# Verifică în browser Console:
# F12 → Network → caută request-uri la /api/

# Verifică CORS în Render:
FRONTEND_URL trebuie să fie exact ca URL-ul Vercel!
```

### Database nu are date?

```bash
# Conectează-te la DB și rulează seed:
psql $DATABASE_URL

# Apoi în psql:
\i server/add-snack2-phase1-phase2.sql
```

---

## 📌 IMPORTANT!

1. **Free tier Render:** Backend se oprește după 15 min inactivitate → prima încărcare e lentă (30s)
2. **Render Logs:** Verifică constant logs pentru erori
3. **Vercel Logs:** Dashboard → Deployments → Vezi build logs
4. **Environment Variables:** Actualizează FRONTEND_URL după deploy!

---

## ✅ CHECKLIST FINAL

- [ ] GitHub repo creat și push-uit
- [ ] PostgreSQL DB creat pe Render
- [ ] Backend deployed pe Render
- [ ] Database inițializat cu rețete
- [ ] Frontend deployed pe Vercel
- [ ] FRONTEND_URL actualizat în Render
- [ ] Testat login și selecție mese
- [ ] Dashboard arată date corecte

---

## 🎉 SUCCES!

**Backend:** `https://nutriplan-backend.onrender.com`  
**Frontend:** `https://your-app.vercel.app`

