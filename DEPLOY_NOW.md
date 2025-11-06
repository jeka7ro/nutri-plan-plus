# 🚀 DEPLOYMENT ACUM - PAȘI EXACȚI

## TE-AM PREGĂTIT TOTUL! URMEAZĂ PAȘII:

### 1️⃣ CREEAZĂ GITHUB REPO (2 minute)

Deschide: **https://github.com/new**

- Repository name: `nutri-plan-plus`
- Visibility: `Private`
- Click **"Create repository"**

### 2️⃣ PUSH CODUL (1 minut)

**Copiază și lipește în Terminal:**

```bash
cd /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d
git remote add origin https://github.com/USERNAME/nutri-plan-plus.git
git branch -M main
git push -u origin main
```

(Înlocuiește `USERNAME` cu username-ul tău GitHub!)

### 3️⃣ DEPLOY BACKEND PE RENDER (5 minute)

Deschide: **https://dashboard.render.com**

**A. Creează PostgreSQL:**
- Click **"New +"** → **"PostgreSQL"**
- Name: `nutriplan-db`
- Region: `Frankfurt`
- Plan: `Free`
- Click **"Create Database"**
- **COPIAZĂ "Internal Database URL"** (vei avea nevoie!)

**B. Creează Web Service:**
- Click **"New +"** → **"Web Service"**
- Connect GitHub → selectează `nutri-plan-plus`
- Name: `nutriplan-backend`
- Region: `Frankfurt`
- Runtime: `Docker`
- **Environment Variables:**
  ```
  DATABASE_URL = [lipește Internal Database URL de mai sus]
  JWT_SECRET = nutri-plan-2024-production-secret
  FRONTEND_URL = https://your-app.vercel.app
  NODE_ENV = production
  ```
- Click **"Create Web Service"**
- Așteaptă 5-10 minute pentru build
- **COPIAZĂ URL-ul:** `https://nutriplan-backend.onrender.com`

### 4️⃣ DEPLOY FRONTEND PE VERCEL (3 minute)

Deschide: **https://vercel.com/new**

- Import GitHub → selectează `nutri-plan-plus`
- Framework: `Vite`
- **Environment Variables:**
  ```
  VITE_API_URL = https://nutriplan-backend.onrender.com/api
  ```
- Click **"Deploy"**
- Așteaptă 3-5 minute
- **COPIAZĂ URL-ul:** `https://your-app-name.vercel.app`

### 5️⃣ UPDATE FRONTEND_URL ÎN RENDER

- Render Dashboard → `nutriplan-backend` → **Environment**
- Editează `FRONTEND_URL`:
  ```
  https://your-app-name.vercel.app
  ```
- Salvează (backend se va redeploy automat)

### 6️⃣ TESTEAZĂ!

Deschide: `https://your-app-name.vercel.app`

- Login: `jeka7ro@gmail.com / admin123777`
- Daily Plan → selectează mese
- Dashboard → ar trebui să vezi date!

---

## ✅ GATA! APLICAȚIA E LIVE!

**Backend:** `https://nutriplan-backend.onrender.com`  
**Frontend:** `https://your-app-name.vercel.app`

**NICIUN CACHE, NICIUN BROWSER LOCAL, TOTUL FRESH ȘI FUNCȚIONAL!** 🎉
