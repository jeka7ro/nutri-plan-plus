#!/bin/bash

echo "🚀 AUTO-FIX RENDER - Rezolvare Automată"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if connection strings are provided
if [ -z "$TARGET_POSTGRES_URL" ]; then
    echo -e "${YELLOW}⚠️  Lipsește TARGET_POSTGRES_URL${NC}"
    echo ""
    echo -e "${CYAN}📋 Unde găsești connection string:${NC}"
    echo "   1. Render Dashboard → nutriplan-db → Info"
    echo "   2. Copiază 'Internal Database URL'"
    echo ""
    echo -e "${YELLOW}Introdu connection string de la Render PostgreSQL:${NC}"
    read -p "TARGET_POSTGRES_URL: " TARGET_POSTGRES_URL
    export TARGET_POSTGRES_URL
    echo ""
fi

# Check if source is provided (optional)
if [ -z "$SOURCE_POSTGRES_URL" ]; then
    echo -e "${YELLOW}💡 Dacă vrei să migrezi date, introdu connection string sursă (sau apasă ENTER pentru a continua fără migrare):${NC}"
    read -p "SOURCE_POSTGRES_URL (opțional): " SOURCE_POSTGRES_URL
    if [ ! -z "$SOURCE_POSTGRES_URL" ]; then
        export SOURCE_POSTGRES_URL
    fi
    echo ""
fi

# Run the fix script
echo -e "${CYAN}🔍 Rulare verificare...${NC}"
echo ""

node fix-render-all.js

echo ""
echo -e "${GREEN}✅ Verificare completă!${NC}"
echo ""

# If migration is needed and source is provided
if [ ! -z "$SOURCE_POSTGRES_URL" ] && [ ! -z "$TARGET_POSTGRES_URL" ]; then
    echo -e "${YELLOW}🔄 Vrei să rulez migrarea acum? (y/n)${NC}"
    read -p "Răspuns: " run_migration
    
    if [ "$run_migration" = "y" ] || [ "$run_migration" = "Y" ]; then
        echo ""
        echo -e "${CYAN}🚀 Rulare migrare date...${NC}"
        echo -e "${YELLOW}⏳ Așteaptă... (poate dura 5-15 minute)${NC}"
        echo ""
        
        node migrate-all-data-to-render.js
        
        echo ""
        echo -e "${GREEN}✅ Migrare completă!${NC}"
    fi
fi

echo ""
echo -e "${CYAN}📋 URMĂTORII PAȘI:${NC}"
echo "   1. Actualizează JWT_SECRET pe Render Dashboard"
echo "   2. Verifică connection strings pe Render"
echo "   3. Așteaptă redeploy (2-3 minute)"
echo "   4. Testează login pe https://eatnfit.onrender.com/app"
echo ""

