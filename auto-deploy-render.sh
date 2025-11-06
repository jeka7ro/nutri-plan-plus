#!/bin/bash

echo "🚀 RENDER AUTO-DEPLOYMENT SCRIPT"
echo "================================="
echo ""

# Step 1: Check if logged in to Render
echo "🔐 PASUL 1: Verificăm autentificare Render..."
render whoami 2>/dev/null

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ NU ești autentificat la Render CLI!"
  echo ""
  echo "📖 SOLUȚIE MAI SIMPLĂ: Deploy prin browser (5 minute)!"
  echo ""
  echo "HAI SĂ DESCHIDEM PAGINILE NECESARE:"
  echo ""
  
  # Open Render Dashboard
  echo "1️⃣ Deschid Render Dashboard..."
  open "https://dashboard.render.com"
  sleep 2
  
  echo ""
  echo "2️⃣ Instrucțiuni clare:"
  echo ""
  echo "═══════════════════════════════════════════════════"
  echo "📌 PASUL A: CREEAZĂ POSTGRESQL"
  echo "═══════════════════════════════════════════════════"
  echo ""
  echo "  În Render Dashboard:"
  echo "  - Click: New + → PostgreSQL"
  echo "  - Name: nutriplan-db"
  echo "  - Region: Frankfurt"
  echo "  - Plan: Free"
  echo "  - Click: Create Database"
  echo ""
  echo "  ⏳ Așteaptă 2-3 minute..."
  echo ""
  echo "  📋 COPIAZĂ 'Internal Database URL'"
  echo "     (ex: postgresql://nutriplan:xxxxx@dpg-xxxxx...)"
  echo ""
  read -p "  Apasă ENTER după ce ai copiat URL-ul... " dummy
  
  echo ""
  echo "═══════════════════════════════════════════════════"
  echo "📌 PASUL B: CREEAZĂ WEB SERVICE (BACKEND)"
  echo "═══════════════════════════════════════════════════"
  echo ""
  echo "  În Render Dashboard:"
  echo "  - Click: New + → Web Service"
  echo "  - Connect GitHub (dacă e prima oară)"
  echo "  - Selectează: jeka7ro/nutri-plan-plus"
  echo "  - Name: nutriplan-backend"
  echo "  - Region: Frankfurt"
  echo "  - Runtime: Docker"
  echo "  - Plan: Free"
  echo ""
  echo "  ⚠️ ENVIRONMENT VARIABLES (Click 'Advanced'):"
  echo ""
  echo "     DATABASE_URL = [lipește Internal Database URL]"
  echo "     JWT_SECRET = nutri-plan-2024-production-secret"
  echo "     NODE_ENV = production"
  echo "     PORT = 10000"
  echo "     FRONTEND_URL = https://nutriplan.vercel.app"
  echo ""
  echo "  - Click: Create Web Service"
  echo ""
  echo "  ⏳ Așteaptă 10-15 minute pentru build..."
  echo ""
  echo "  📋 COPIAZĂ URL-ul backend"
  echo "     (ex: https://nutriplan-backend.onrender.com)"
  echo ""
  read -p "  Apasă ENTER după ce backend e deploiat... " dummy
  
  echo ""
  echo "✅ RENDER DEPLOYMENT GATA!"
  echo ""
  echo "📝 Notează URL-ul backend pentru următorul pas (Vercel)!"
  echo ""
  
  # Save instructions for Vercel
  cat > /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d/NEXT_STEP_VERCEL.txt << 'VERCEL'
🚀 URMĂTORUL PAS: VERCEL (FRONTEND)

Deschide: https://vercel.com/new

1️⃣ Import GitHub:
   - Conectează GitHub (dacă e prima oară)
   - Selectează: jeka7ro/nutri-plan-plus

2️⃣ Configure:
   - Framework: Vite ✅ (auto-detect)
   - Root Directory: . (lasă gol)

3️⃣ Environment Variables:
   Click "Environment Variables" → Adaugă:
   
   VITE_API_URL = [Backend URL de pe Render]/api
   
   Exemplu:
   VITE_API_URL = https://nutriplan-backend.onrender.com/api

4️⃣ Deploy!
   - Click: Deploy
   - Așteaptă 3-5 minute
   - COPIAZĂ URL-ul frontend!

5️⃣ UPDATE BACKEND:
   - Render Dashboard → nutriplan-backend → Environment
   - Editează: FRONTEND_URL = [URL frontend de pe Vercel]
   - Salvează (backend se va redeploy automat)

✅ GATA! APLICAȚIA E LIVE!
VERCEL
  
  echo "📄 Am salvat instrucțiunile pentru Vercel în:"
  echo "    NEXT_STEP_VERCEL.txt"
  echo ""
  echo "Rulează: cat NEXT_STEP_VERCEL.txt"
  echo ""
  
else
  echo "✅ Autentificat la Render CLI!"
  echo ""
  echo "🚀 Deployment automat prin Blueprint..."
  echo ""
  
  # Blueprint deployment
  cd /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d
  
  if [ -f "render.yaml" ]; then
    echo "📋 render.yaml găsit!"
    echo ""
    echo "Deployment în curs..."
    render blueprint launch
  else
    echo "❌ render.yaml nu există!"
  fi
fi
