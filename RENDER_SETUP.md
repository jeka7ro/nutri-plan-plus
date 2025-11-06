# 🎯 RENDER DEPLOYMENT - PAȘI EXACȚI

## PASUL 1: CREEAZĂ POSTGRESQL DATABASE

**Deschide:** https://dashboard.render.com

### A. Click "New +" → "PostgreSQL"

**Completează:**
- **Name:** `nutriplan-db`
- **Database:** `nutriplan` (auto-generat)
- **User:** `nutriplan` (auto-generat)
- **Region:** `Frankfurt (eu-central)`
- **PostgreSQL Version:** `16`
- **Plan:** `Free`

**Click:** `Create Database`

**⏳ Așteaptă 2-3 minute...**

### B. COPIAZĂ "Internal Database URL"

După ce se creează, vezi pe pagină:

```
Internal Database URL
postgresql://nutriplan:xxxxx@dpg-xxxxx-a.frankfurt-postgres.render.com/nutriplan
```

**📋 COPIAZĂ ACEST URL!** (vei avea nevoie la următorul pas!)

---

## PASUL 2: CREEAZĂ WEB SERVICE (BACKEND)

### A. Click "New +" → "Web Service"

**Connect GitHub:**
- Click "Connect account" (dacă e prima oară)
- Selectează `jeka7ro/nutri-plan-plus`

**Completează:**
- **Name:** `nutriplan-backend`
- **Region:** `Frankfurt`
- **Branch:** `main`
- **Root Directory:** (lasă gol)
- **Runtime:** `Docker`
- **Instance Type:** `Free`

### B. ENVIRONMENT VARIABLES

Click "Advanced" → "Add Environment Variable"

**Adaugă TOATE acestea:**

```
DATABASE_URL = [lipește Internal Database URL de la Pasul 1.B]
```

```
JWT_SECRET = nutri-plan-2024-production-secret-jeka7ro
```

```
NODE_ENV = production
```

```
PORT = 10000
```

```
FRONTEND_URL = https://nutriplan.vercel.app
```
*(Vei actualiza asta mai târziu cu URL-ul real Vercel)*

### C. DEPLOY!

**Click:** `Create Web Service`

**⏳ Așteaptă 10-15 minute pentru build...**

**După ce se termină, vezi:**
```
✅ Live
https://nutriplan-backend.onrender.com
```

**📋 COPIAZĂ ACEST URL!** (pentru Vercel)

---

## ✅ GATA CU RENDER!

**Backend:** `https://nutriplan-backend.onrender.com`  
**Database:** PostgreSQL activ

**URMĂTORUL PAS: VERCEL (Frontend)**
