#!/bin/bash
# Script de instalación rápida - HidroAliaga Security Implementation
# Este script instala todas las dependencias necesarias

echo "=============================================="
echo "Instalación de HidroAliaga - Security Update"
echo "=============================================="
echo ""

# Verificar Python
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Instalar dependencias del backend
echo ""
echo "[1/3] Instalando dependencias del backend..."
cd backend || exit 1

pip install pyjwt asyncpg pytest pytest-asyncio httpx aiohttp

echo ""
echo "[2/3] Verificando instalación..."
python -c "import jwt; print('✓ jwt instalado')"
python -c "import asyncpg; print('✓ asyncpg instalado')"
python -c "import pytest; print('✓ pytest instalado')"

echo ""
echo "[3/3] Instalando dependencias del frontend..."
cd ../frontend || exit 1

# Verificar que playwright está instalado
if ! command -v npx &> /dev/null; then
    echo "⚠️  npm/npx no encontrado. Instalando dependencias de Node..."
    npm install
fi

echo ""
echo "Instalando browsers de Playwright..."
npx playwright install chromium

echo ""
echo "=============================================="
echo "✅ Instalación completada"
echo "=============================================="
echo ""
echo "Próximos pasos:"
echo "1. Configurar SUPABASE_JWT_SECRET en backend/.env"
echo "2. Ejecutar: python verify_files.py"
echo "3. Ejecutar: python backend/tests/stress_test.py"
echo "4. Ejecutar: npm run test:e2e"
echo ""
