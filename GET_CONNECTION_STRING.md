# 📋 Cum să Obții Connection String de la Render

## Pasul 1: Deschide Render Dashboard

**Deschide în browser:** https://dashboard.render.com

## Pasul 2: Găsește Database-ul

1. În lista de servicii, click pe **PostgreSQL Database** → `nutriplan-db`
2. Dacă nu vezi `nutriplan-db`, click pe **"New +"** → **"PostgreSQL"** și creează-l

## Pasul 3: Copiază Connection String

1. Click pe tab-ul **"Info"** (sau **"Connections"**)
2. Găsește **"Internal Database URL"** sau **"Connection String"**
3. Arată cam așa:
   ```
   postgresql://nutriplan:ABC123xyz@dpg-xxxxx-a.frankfurt-postgres.render.com/nutriplan
   ```
4. **COPIAZĂ TOT** (click dreapta → Copy sau Cmd+C)

## Pasul 4: Folosește-l în Terminal

**IMPORTANT:** Înlocuiește `[connection string Render PostgreSQL]` cu connection string-ul real!

**Exemplu corect:**
```bash
export TARGET_POSTGRES_URL="postgresql://nutriplan:ABC123xyz@dpg-xxxxx-a.frankfurt-postgres.render.com/nutriplan"
```

**Exemplu GREȘIT (ce ai făcut tu):**
```bash
export TARGET_POSTGRES_URL="[connection string Render PostgreSQL]"  # ❌ GREȘIT!
```

---

## 🚀 Apoi Rulează:

```bash
cd /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d

# Înlocuiește cu connection string-ul REAL de la Render!
export TARGET_POSTGRES_URL="postgresql://nutriplan:ABC123xyz@dpg-xxxxx-a.frankfurt-postgres.render.com/nutriplan"

# Rulează verificarea
node fix-render-all.js
```

---

## 💡 Dacă Nu Găsești Database-ul:

**Creează-l:**
1. Render Dashboard → **"New +"** → **"PostgreSQL"**
2. **Name:** `nutriplan-db`
3. **Region:** `Frankfurt`
4. **Plan:** `Free` sau `Starter`
5. Click **"Create Database"**
6. Așteaptă 2-3 minute
7. Apoi copiază "Internal Database URL"

