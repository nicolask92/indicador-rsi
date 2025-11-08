#!/bin/bash

echo "🚀 Iniciando Indicador RSI Dashboard..."
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

echo "🏗️  Construyendo aplicación..."
npm run build
echo ""

echo "✅ Iniciando servidor..."
npm start

