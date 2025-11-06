# 🎯 VERCEL DEPLOYMENT - PAȘI EXACȚI

## PASUL 1: DEPLOY FRONTEND

**Deschide:** https://vercel.com/new

### A. Import GitHub Repository

**Click:** "Add GitHub Account" (dacă e prima oară)
sau
**Select:** Repository existent

**Caută și selectează:** `jeka7ro/nutri-plan-plus`

### B. Configure Project

**Project Name:** `nutriplan` (sau altceva custom)

**Framework Preset:** `Vite` ✅ (auto-detectat)

**Root Directory:** `.` (lasă gol)

**Build Command:** `npm run build` ✅ (auto)

**Output Directory:** `dist` ✅ (auto)

### C. ENVIRONMENT VARIABLES ⚠️ IMPORTANT!

Click "Environment Variables"

**Adaugă:**

```
VITE_API_URL = https://nutriplan-backend.onrender.com/api
```

*(Înlocuiește cu URL-ul REAL de la Render Backend!)*

### D. DEPLOY!

**Click:** `Deploy`

**⏳ Așteaptă 3-5 minute...**

**După ce se termină:**

```
✅ Deployed!
https://nutriplan-jeka7ro.vercel.app
```

**📋 COPIAZĂ ACEST URL!**

---

## PASUL 2: UPDATE BACKEND CORS

**Mergi înapoi la Render:**

https://dashboard.render.com → `nutriplan-backend` → **Environment**

**Editează variabila:**

```
FRONTEND_URL = https://nutriplan-jeka7ro.vercel.app
```

*(cu URL-ul REAL de la Vercel!)*

**Salvează** → Backend se va redeploy automat (2-3 minute)

---

## ✅ GATA! APLICAȚIA E LIVE!

**Frontend:** https://nutriplan-jeka7ro.vercel.app  
**Backend:** https://nutriplan-backend.onrender.com

**LOGIN:**
- Email: `jeka7ro@gmail.com`
- Password: `admin123777`

---

## 🔥 TESTARE FINALĂ:

1. Deschide frontend URL
2. Login cu credențiale
3. Daily Plan → selectează mese
4. Dashboard → vezi date reale!

**NICIUN CACHE BROWSER, TOTUL FRESH!** 🎉
