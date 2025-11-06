# 🎯 START AICI - Nutri Plan Plus

## ⚡ Pornire Rapidă (30 secunde)

### 1. Pornește Backend + Frontend

```bash
./start-all.sh
```

**SAU manual în 2 terminale:**

```bash
# Terminal 1
cd server && npm start

# Terminal 2  
npm run dev -- --port 3000
```

### 2. Deschide Browser

http://localhost:3000

### 3. Creează Cont

- Click "Nu ai cont? Creează unul aici"
- Completează email și parolă
- Click "Creează cont"

### 4. Completează Onboarding

- Greutate, înălțime, vârstă
- Click "Finalizează"

### 5. Gata! ✅

Dashboard-ul tău este live!

---

## 👥 Testare Multi-User

### Utilizatori Pre-Creați:

```
test@nutriplan.com / test123
admin@nutriplan.com / admin123
maria@nutriplan.com / maria123
```

### Creează Utilizatori Noi:

1. **Browser normal**: ion@test.com
2. **Incognito window**: maria@test.com  
3. **Alt browser**: ana@test.com

---

## 📝 Ce Funcționează

✅ Login/Register cu email  
✅ Onboarding complet  
✅ Dashboard personal  
✅ Weight tracking  
✅ Recipes (create/view)  
✅ Friends system  
✅ Messages  
✅ Logout  

**Date salvate în:** `server/nutri-plan.db`

---

## 🔧 Comenzi Utile

### Resetare date:
```bash
rm server/nutri-plan.db && cd server && npm start
```

### Repopulare utilizatori test:
```bash
curl -X POST http://localhost:3001/api/seed
```

### Verificare server:
```bash
curl http://localhost:3001/api/health
```

---

## 📚 Mai Multe Detalii

- `QUICK_START.md` - Tutorial pas cu pas
- `README_LOCAL_AUTH.md` - Documentație completă
- `SERVER_SETUP.md` - Detalii tehnice

---

**ENJOY! 🎉**


