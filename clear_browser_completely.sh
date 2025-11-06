#!/bin/bash
echo "🧹 ȘTERG COMPLET CACHE JAVASCRIPT..."

# Opresc toate procesele Vite vechi
pkill -f "vite" 2>/dev/null
sleep 2

# Șterg cache Vite
rm -rf node_modules/.vite
rm -rf .vite

# Șterg cache browser
rm -rf ~/Library/Caches/com.apple.Safari/*
rm -rf ~/Library/Caches/Google/Chrome/*
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Cache/*
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Code\ Cache/*

echo "✅ CACHE COMPLET ȘTERS!"
echo ""
echo "🔄 Pornesc Vite FRESH..."
