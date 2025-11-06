#!/bin/bash

echo "🤖 SCRIPT AUTOMAT COMPLET - FAC TOTUL SINGUR!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

URL="https://nutri-plan-plus-48ccfd0d-kv5ul51oa-jeka7ros-projects.vercel.app"

# 1. Aștept deployment să fie gata
echo "⏳ PASUL 1: Aștept deployment Vercel..."
for i in {1..6}; do
  echo "   Încercare $i/6..."
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/health" 2>/dev/null)
  
  if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ Backend răspunde!"
    break
  fi
  
  if [ $i -lt 6 ]; then
    sleep 20
  fi
done

# 2. Apelez /api/init
echo ""
echo "🔧 PASUL 2: Inițializez database (creez tabele + admin)..."
curl -s "$URL/api/init" | python3 -m json.tool 2>/dev/null
echo ""

# 3. Login și verificare
echo "🔐 PASUL 3: Login și verificare..."
TOKEN=$(curl -s -X POST "$URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jeka7ro@gmail.com","password":"admin123777"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('token', 'NONE'))" 2>/dev/null)

if [ "$TOKEN" != "NONE" ] && [ ! -z "$TOKEN" ]; then
  echo "✅ LOGIN SUCCESS!"
  echo ""
  
  # 4. Verifică recipes
  echo "📊 PASUL 4: Verificăm recipes..."
  RECIPES_COUNT=$(curl -s "$URL/api/recipes" \
    -H "Authorization: Bearer $TOKEN" | \
    python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
  
  echo "   Recipes în DB: $RECIPES_COUNT"
  
  if [ "$RECIPES_COUNT" = "0" ]; then
    echo ""
    echo "❌ DATABASE GOL - TREBUIE SEED MANUAL!"
    echo "   Rulează: npm run seed"
  else
    echo ""
    echo "✅✅✅ TOTUL GATA! $RECIPES_COUNT rețete în DB!"
  fi
else
  echo "❌ Login eșuat - verifică deployment!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SCRIPT COMPLET!"
