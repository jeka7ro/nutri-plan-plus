# 🚀 Deployment Guide - NutriPlan Plus

## 📋 Cuprins
1. [Backend pe Render](#backend-pe-render)
2. [Frontend pe Vercel](#frontend-pe-vercel)
3. [Environment Variables](#environment-variables)

---

## 🔧 Backend pe Render

### 1. Creează PostgreSQL Database

1. Mergi la [Render Dashboard](https://dashboard.render.com/)
2. Click pe **"New +"** → **"PostgreSQL"**
3. Configurează:
   - **Name:** `nutriplan-db`
   - **Database:** `nutriplan`
   - **User:** `nutriplan`
   - **Region:** Frankfurt (sau cel mai apropiat)
   - **Plan:** Starter ($7/lună) sau Free (expiră după 90 zile)
4. Click **"Create Database"**
5. **SALVEAZĂ:**
   - **Internal Database URL** (pentru backend)
   - **External Database URL** (pentru acces local)

### 2. Creează Backend Web Service

1. Click pe **"New +"** → **"Web Service"**
2. Conectează GitHub repository-ul
3. Configurează:
   - **Name:** `nutriplan-backend`
   - **Region:** Frankfurt (același cu DB)
   - **Branch:** `main`
   - **Root Directory:** lasă gol
   - **Environment:** Docker
   - **Plan:** Starter ($7/lună) sau Free
   
4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[copiază Internal Database URL de la step 1]
   JWT_SECRET=[generează un string aleator puternic, ex: openssl rand -hex 32]
   FRONTEND_URL=https://your-app.vercel.app (vei actualiza mai târziu)
   ```

5. **Advanced Settings:**
   - **Health Check Path:** `/api/health`
   - **Auto-Deploy:** Yes
   
6. Click **"Create Web Service"**

### 3. Seed Database cu Rețete

După ce backend-ul e deployed:

```bash
# Conectează-te la baza de date
psql [External Database URL de la step 1]

# Sau rulează seed script-ul local
DATABASE_URL="[External Database URL]" node server/seed-recipes-production.js
```

**Backend URL:** `https://nutriplan-backend.onrender.com`

---

## 🎨 Frontend pe Vercel

### 1. Deploy pe Vercel

1. Instalează Vercel CLI (opțional):
   ```bash
   npm i -g vercel
   ```

2. **Opțiunea A - Via CLI:**
   ```bash
   cd /path/to/nutri-plan-plus
   vercel
   ```

3. **Opțiunea B - Via Dashboard:**
   - Mergi la [vercel.com/new](https://vercel.com/new)
   - Importă GitHub repository
   - Vercel va detecta automat Vite

### 2. Configurare Environment Variables

În Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://nutriplan-backend.onrender.com/api
```

### 3. Update CORS în Backend

După deployment, actualizează `FRONTEND_URL` în Render:
```
FRONTEND_URL=https://your-app.vercel.app
```

Apoi în `server/server-pg.js`, actualizează CORS:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

**Frontend URL:** `https://your-app.vercel.app`

---

## 🔐 Environment Variables

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing key | `[random-64-char-string]` |
| `FRONTEND_URL` | Frontend origin for CORS | `https://your-app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://nutriplan-backend.onrender.com/api` |

---

## ✅ Verificare Post-Deployment

### Backend Health Check
```bash
curl https://nutriplan-backend.onrender.com/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Test Authentication
```bash
curl -X POST https://nutriplan-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Frontend
- Deschide `https://your-app.vercel.app`
- Testează login/register
- Verifică că Daily Plan încarcă rețete

---

## 🐛 Troubleshooting

### Backend nu se conectează la DB
- Verifică `DATABASE_URL` în Render Environment Variables
- Asigură-te că backend și DB sunt în același region
- Check logs: Render Dashboard → Backend Service → Logs

### CORS Errors în Frontend
- Verifică `FRONTEND_URL` în backend env vars
- Asigură-te că URL-ul Vercel e corect
- Redeploy backend după modificări la env vars

### Frontend nu găsește API
- Verifică `VITE_API_URL` în Vercel
- Testează manual endpoint-ul backend
- Check Network tab în browser DevTools

---

## 📊 Costuri Estimate

| Service | Plan | Cost/lună |
|---------|------|-----------|
| Render PostgreSQL | Starter | $7 |
| Render Web Service | Starter | $7 |
| Vercel | Hobby (Free) | $0 |
| **Total** | | **$14/lună** |

*Free tier-urile Render expiră după 90 zile și se opresc după 15 min de inactivitate*

---

## 🔄 CI/CD

Ambele platforme au auto-deploy:
- **Render:** Deploy automat la push pe `main`
- **Vercel:** Deploy automat la orice push (preview pentru branches, production pentru main)

---

## 📝 Notițe Importante

1. **Prima rulare:** Backend-ul va crea automat toate tabelele PostgreSQL la prima conectare
2. **Seed rețete:** După deployment, trebuie să populezi baza de date cu rețete
3. **JWT Secret:** Nu folosi niciodată secretul default în production!
4. **CORS:** Actualizează `FRONTEND_URL` după ce ai URL-ul Vercel
5. **Logs:** Monitorizează logs-urile în primele 24h după deployment

---

## 🆘 Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Succes cu deployment-ul! 🚀**

