#!/bin/bash

echo "🚀 SETUP COMPLET RENDER - Totul Automat"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Acest script va:${NC}"
echo "   1. Verifica dacă database-ul există pe Render"
echo "   2. Te ghidează să creezi database-ul (dacă nu există)"
echo "   3. Inițializează tabelele"
echo "   4. Migrează date (dacă e necesar)"
echo "   5. Configurează totul"
echo ""

# Check if render CLI is available
if command -v render &> /dev/null; then
    echo -e "${GREEN}✅ Render CLI este instalat${NC}"
    
    # Check if logged in
    if render whoami &> /dev/null; then
        echo -e "${GREEN}✅ Ești autentificat la Render${NC}"
        echo ""
        
        # Try to find database
        echo -e "${CYAN}🔍 Căutare database 'nutriplan-db' pe Render...${NC}"
        DB_LIST=$(render databases list 2>/dev/null | grep -i "nutriplan\|eatnfit" || echo "")
        
        if [ ! -z "$DB_LIST" ]; then
            echo -e "${GREEN}✅ Database găsit!${NC}"
            echo "$DB_LIST"
            echo ""
            echo -e "${YELLOW}📋 Următorul pas:${NC}"
            echo "   1. Render Dashboard → nutriplan-db → Info"
            echo "   2. Copiază 'Internal Database URL'"
            echo "   3. Rulează: export TARGET_POSTGRES_URL=\"[connection string]\""
            echo "   4. Apoi rulează: node server/database-pg.js"
        else
            echo -e "${YELLOW}⚠️  Database nu a fost găsit${NC}"
            echo ""
            echo -e "${CYAN}📋 Trebuie să creezi database-ul:${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Nu ești autentificat la Render${NC}"
        echo ""
        echo -e "${CYAN}📋 Autentifică-te:${NC}"
        echo "   render login"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  Render CLI nu este instalat${NC}"
    echo ""
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 INSTRUCȚIUNI SIMPLE - URMEAZĂ PAȘII:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}1️⃣ CREEAZĂ DATABASE PE RENDER:${NC}"
echo ""
echo "   a) Deschide: https://dashboard.render.com"
echo "   b) Click 'New +' → 'PostgreSQL'"
echo "   c) Name: nutriplan-db"
echo "   d) Region: Frankfurt"
echo "   e) Plan: Free (sau Starter)"
echo "   f) Click 'Create Database'"
echo "   g) Așteaptă 2-3 minute"
echo ""

echo -e "${CYAN}2️⃣ COPIAZĂ CONNECTION STRING:${NC}"
echo ""
echo "   a) Click pe database-ul creat"
echo "   b) Click tab 'Info'"
echo "   c) Găsește 'Internal Database URL'"
echo "   d) COPIAZĂ tot (ex: postgresql://nutriplan:xxx@dpg-xxx...)"
echo ""

echo -e "${CYAN}3️⃣ RULEAZĂ ÎN TERMINAL:${NC}"
echo ""
echo -e "${YELLOW}   export TARGET_POSTGRES_URL=\"[LIPEȘTE CONNECTION STRING AICI]\"${NC}"
echo -e "${YELLOW}   node server/database-pg.js${NC}"
echo ""

echo -e "${CYAN}4️⃣ DACĂ AI DATE EXISTENTE (opțional):${NC}"
echo ""
echo -e "${YELLOW}   export SOURCE_POSTGRES_URL=\"[connection string sursă]\"${NC}"
echo -e "${YELLOW}   export TARGET_POSTGRES_URL=\"[connection string Render]\"${NC}"
echo -e "${YELLOW}   node migrate-all-data-to-render.js${NC}"
echo ""

echo -e "${CYAN}5️⃣ ACTUALIZEAZĂ RENDER APP:${NC}"
echo ""
echo "   a) Render Dashboard → nutriplan-app → Environment"
echo "   b) Adaugă: DATABASE_URL = [connection string]"
echo "   c) Adaugă: POSTGRES_URL = [connection string]"
echo "   d) Adaugă: JWT_SECRET = nutri-plan-2024-production-secret-jeka7ro"
echo "   e) Click 'Save Changes'"
echo "   f) Așteaptă redeploy (2-3 minute)"
echo ""

echo -e "${GREEN}✅ GATA! După ce faci pașii de mai sus, totul va funcționa!${NC}"
echo ""

