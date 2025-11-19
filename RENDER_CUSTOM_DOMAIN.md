# 🌐 Configurare Domeniu Personalizat pe Render

## 📋 Pași pentru a adăuga domeniul tău personalizat:

### 1. Mergi la serviciul tău pe Render

1. Deschide https://dashboard.render.com
2. Selectează serviciul tău (ex: `nutri-plan-plus` sau `eatnfit`)
3. Click pe **"Settings"** (în sidebar-ul stâng)

### 2. Adaugă Custom Domain

1. Scroll jos la secțiunea **"Custom Domains"**
2. Click **"Add Custom Domain"**
3. Introdu domeniul tău (ex: `eatnfit.app` sau `www.eatnfit.app`)
4. Click **"Add"**

### 3. Configurează DNS-ul

Render îți va da instrucțiuni pentru DNS. De obicei trebuie să adaugi:

**Pentru domeniul principal (ex: eatnfit.app):**
```
Type: CNAME
Name: @ (sau root domain)
Value: [nume-serviciu].onrender.com
```

**Pentru subdomain www (ex: www.eatnfit.app):**
```
Type: CNAME
Name: www
Value: [nume-serviciu].onrender.com
```

**SAU folosește A Record (dacă provider-ul tău DNS nu suportă CNAME pe root):**
```
Type: A
Name: @
Value: [IP-ul de la Render] (Render îl va furniza)
```

### 4. Așteaptă propagarea DNS

- DNS propagation poate dura 5 minute - 48 de ore
- De obicei durează 10-30 minute
- Poți verifica cu: https://dnschecker.org

### 5. SSL Certificate (automat)

- Render va emite automat un certificat SSL (Let's Encrypt)
- Va dura 5-10 minute după ce DNS-ul este propagat
- Aplicația va fi accesibilă pe HTTPS automat

### 6. Actualizează Environment Variables

După ce domeniul funcționează, actualizează în Render:

1. Mergi la serviciul tău → **Environment**
2. Actualizează `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://eatnfit.app
   ```
   (sau domeniul tău real)

3. **Redeploy** serviciul (Render va face automat după ce schimbi env vars)

## ✅ Verificare

După configurare, testează:
- `https://eatnfit.app` (sau domeniul tău)
- `https://www.eatnfit.app` (dacă ai configurat)

## 🔧 Dacă ai probleme:

1. **DNS nu se propagă:**
   - Verifică că ai adăugat corect înregistrările DNS
   - Așteaptă mai mult timp (până la 48h)
   - Verifică cu `nslookup` sau `dig`

2. **SSL nu se emite:**
   - Asigură-te că DNS-ul este propagat complet
   - Render va emite automat SSL după propagare
   - Poți forța re-emiterea din Settings → Custom Domains

3. **Aplicația nu se încarcă:**
   - Verifică că serviciul rulează (Status: Live)
   - Verifică logs pentru erori
   - Asigură-te că `FRONTEND_URL` este setat corect

---

**Notă:** Render suportă domenii custom pe planul Free, dar cu limitări. Pentru producție, recomand planul Starter ($7/lună) care oferă:
- ✅ Fără "sleep" (nu se adormește)
- ✅ SSL automat
- ✅ Support mai bun

