# 🚀 INIȚIALIZARE DATABASE NEON PE VERCEL

## DUPĂ REDEPLOY, VEI AVEA:

### ✅ BACKEND API FUNCȚIONAL:
```
https://nutri-plan-plus.vercel.app/api/health
→ {"status":"ok","platform":"vercel-serverless"}
```

### ✅ NEON DATABASE CONECTAT:
- Toate environment variables setate
- Pool connection la Neon Postgres
- SSL enabled automat

---

## 📋 PAȘI PENTRU INIȚIALIZARE:

### 1️⃣ RULEAZĂ MIGRAȚIILE (CREATE TABLES):

**Metoda 1: Via API call**
```bash
curl -X POST https://nutri-plan-plus.vercel.app/api/admin/init-database \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Metoda 2: Direct în Neon SQL Editor**
- Vercel Dashboard → Storage → nutriplan-db → Query
- Paste SQL din `server/database-pg.js` (CREATE TABLE statements)
- Run Query

### 2️⃣ SEEDEAZĂ 88 REȚETE:

Via script local care trimite la API:
```bash
node server/seed-neon.js
```

### 3️⃣ CREEAZĂ ADMIN USER:

```bash
curl -X POST https://nutri-plan-plus.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jeka7ro@gmail.com",
    "password": "admin123777",
    "name": "Admin User"
  }'
```

---

## ⏳ TIMELINE:

- ✅ PUSH: ef7ddbb
- 🔄 BUILD: ~30 sec
- 🔄 DEPLOY: ~1 min
- ✅ LIVE: 2 min total

**SPUNE "redeploy" DUPĂ 2 MINUTE!**
