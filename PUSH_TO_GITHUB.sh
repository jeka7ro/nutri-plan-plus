#!/bin/bash
cd /Users/eugeniucazmal/dev/nutri-plan-plus-48ccfd0d

echo "🚀 PUSH TO GITHUB..."
echo ""

# Verificăm status
echo "📊 Git status:"
git status --short

echo ""
echo "📦 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ COD UPLOADAT PE GITHUB!"
  echo ""
  echo "🔗 Vezi repo-ul aici:"
  echo "   https://github.com/jeka7ro/nutri-plan-plus"
  echo ""
  echo "✅ URMĂTORUL PAS: RENDER!"
else
  echo ""
  echo "❌ EROARE la push!"
  echo ""
  echo "POATE REPO-UL NU EXISTĂ ÎNC PE GITHUB?"
  echo "Deschide: https://github.com/new"
  echo "Creează repo: nutri-plan-plus"
  echo "Apoi spune 'gata' și reîncerc!"
fi
