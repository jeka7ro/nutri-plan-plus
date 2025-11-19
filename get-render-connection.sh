#!/bin/bash

echo "🔍 Obținere Connection Strings de la Render..."
echo ""

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI nu este instalat"
    echo ""
    echo "📋 Instalează Render CLI:"
    echo "   brew install render"
    echo ""
    echo "SAU folosește connection strings manual:"
    echo "   1. Render Dashboard → nutriplan-db → Info"
    echo "   2. Copiază 'Internal Database URL'"
    exit 1
fi

# Check if logged in
if ! render whoami &> /dev/null; then
    echo "❌ Nu ești autentificat la Render"
    echo ""
    echo "📋 Autentifică-te:"
    echo "   render login"
    exit 1
fi

echo "✅ Render CLI este configurat"
echo ""

# Try to get database connection string
echo "🔍 Căutare database 'nutriplan-db'..."
DB_INFO=$(render databases list 2>/dev/null | grep -i nutriplan-db || echo "")

if [ -z "$DB_INFO" ]; then
    echo "⚠️  Nu am găsit database 'nutriplan-db'"
    echo ""
    echo "📋 Obține manual connection string:"
    echo "   1. Render Dashboard → nutriplan-db → Info"
    echo "   2. Copiază 'Internal Database URL'"
    exit 1
fi

echo "✅ Database găsit"
echo ""
echo "📋 Connection string:"
echo "   (Folosește Render Dashboard pentru a obține connection string)"
echo ""

