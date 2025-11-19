#!/bin/bash

echo "🚀 DEPLOY RENDER BLUEPRINT - Totul Automat"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Acest script va deploya totul automat folosind render.yaml${NC}"
echo ""

# Check if render CLI is available
if ! command -v render &> /dev/null; then
    echo -e "${RED}❌ Render CLI nu este instalat${NC}"
    echo ""
    echo -e "${CYAN}📋 Instalează:${NC}"
    echo "   brew install render"
    exit 1
fi

# Check if logged in
echo -e "${CYAN}🔐 Verificare autentificare...${NC}"
if ! render whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nu ești autentificat${NC}"
    echo ""
    echo -e "${CYAN}📋 Autentifică-te:${NC}"
    echo "   render login"
    echo ""
    echo -e "${YELLOW}După autentificare, rulează din nou acest script.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ești autentificat${NC}"
echo ""

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml nu există!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ render.yaml găsit${NC}"
echo ""

# Try to deploy blueprint
echo -e "${CYAN}🚀 Deploy blueprint...${NC}"
echo -e "${YELLOW}⏳ Așteaptă... (poate dura 5-10 minute)${NC}"
echo ""

# Deploy blueprint
render blueprints create render.yaml 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Blueprint deployed!${NC}"
    echo ""
    echo -e "${CYAN}📋 Următorii pași:${NC}"
    echo "   1. Așteaptă ca Render să creeze serviciile (5-10 minute)"
    echo "   2. Verifică în Render Dashboard că database-ul și app-ul sunt create"
    echo "   3. După ce database-ul e gata, rulează:"
    echo "      export TARGET_POSTGRES_URL=\"[connection string]\""
    echo "      node server/database-pg.js"
else
    echo ""
    echo -e "${YELLOW}⚠️  Blueprint deployment a eșuat sau serviciile există deja${NC}"
    echo ""
    echo -e "${CYAN}📋 Verifică în Render Dashboard:${NC}"
    echo "   https://dashboard.render.com"
    echo ""
    echo -e "${CYAN}📋 Dacă serviciile există deja, obține connection string:${NC}"
    echo "   1. Render Dashboard → nutriplan-db → Info"
    echo "   2. Copiază 'Internal Database URL'"
    echo "   3. Rulează: export TARGET_POSTGRES_URL=\"[connection string]\""
    echo "   4. Rulează: node server/database-pg.js"
fi

echo ""

