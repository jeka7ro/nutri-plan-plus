# 🚀 DEPLOY PE RENDER - GHID COMPLET

## ✅ Ce am făcut:

1. **Server-ul servește și frontend-ul** - `server-pg.js` servește static files din `dist/`
2. **Dockerfile multi-stage** - construiește frontend-ul și apoi servește totul
3. **render.yaml actualizat** - un singur serviciu web pentru tot (frontend + backend)

## 📋 PAȘI PENTRU DEPLOY:

### PASUL 1: Conectează GitHub pe Render

1. Mergi pe https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Conectează GitHub account (dacă nu e deja conectat)
4. Selectează repository: `jeka7ro/nutri-plan-plus`
5. Click "Apply"

### PASUL 2: Render va detecta `render.yaml` automat

Render va crea automat:
- ✅ PostgreSQL Database (`nutriplan-db`)
- ✅ Web Service (`nutriplan-app`)

### PASUL 3: Configurează Environment Variables

După ce se creează serviciile, mergi la **nutriplan-app** → **Environment**:

**Adaugă aceste variabile:**

```
FRONTEND_URL = https://nutriplan-app.onrender.com
```

*(Vei actualiza asta după ce știi URL-ul final)*

**Pentru email (opțional):**
```
SENDGRID_API_KEY = [key-ul tău SendGrid]
```

SAU

```
GMAIL_USER = [email-ul tău Gmail]
GMAIL_APP_PASSWORD = [app password Gmail]
```

### PASUL 4: Așteaptă Build-ul

- Build-ul va dura 10-15 minute (construiește frontend + backend)
- Poți urmări logs în timp real

### PASUL 5: Testează

După ce build-ul se termină, vei avea:
- **URL:** `https://nutriplan-app.onrender.com`
- **API:** `https://nutriplan-app.onrender.com/api/...`
- **Frontend:** `https://nutriplan-app.onrender.com` (toate rutele)

## 🎯 AVANTAJE FAȚĂ DE VERCEL:

✅ **Fără limită de Serverless Functions** - poți avea câte endpoint-uri vrei
✅ **Un singur serviciu** - frontend + backend împreună
✅ **PostgreSQL inclus** - database în același loc
✅ **Docker** - control complet asupra build-ului
✅ **Free tier generos** - 750 ore/lună

## ⚠️ NOTĂ IMPORTANTĂ:

Pe planul **Free**, serviciul se "adormește" după 15 minute de inactivitate. Primul request după "adormire" va dura ~30-50 secunde (cold start).

Pentru a evita asta:
- Upgrade la **Starter** ($7/lună) - nu se adormește niciodată
- SAU folosește un cron job care face ping la `/api/health` la fiecare 10 minute

## 🔧 Dacă ai probleme:

1. **Verifică logs** în Render Dashboard → nutriplan-app → Logs
2. **Verifică build logs** - vezi dacă frontend-ul s-a construit corect
3. **Verifică environment variables** - toate sunt setate corect?

## 📝 După deploy:

1. Actualizează `FRONTEND_URL` cu URL-ul real
2. Testează toate funcționalitățile
3. Verifică că resetarea parolei funcționează (email)

---

**Commit:** `743c032` - "Feat: Migrare completă pe Render - frontend + backend într-un singur serviciu"

