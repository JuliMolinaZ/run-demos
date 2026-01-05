#!/bin/bash

# Script seguro para inicializar Git y hacer el primer commit
# Uso: ./scripts/safe-git-init.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔒 Inicializando repositorio Git de forma segura..."

# Verificar que no haya archivos sensibles en el staging
echo -e "${YELLOW}🔍 Verificando archivos sensibles...${NC}"

# Los archivos .env locales están bien si están en .gitignore
# Solo verificamos que no se vayan a agregar al staging
if [ -f .env ] || [ -f .env.production ] || [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Archivos .env detectados (esto está bien si están en .gitignore)${NC}"
    echo -e "${GREEN}   Verificando que estén en .gitignore...${NC}"
    
    # Verificar que .env esté en .gitignore
    if ! grep -q "^\.env$" .gitignore && ! grep -q "^\.env\*" .gitignore; then
        echo -e "${RED}❌ ERROR: .env no está en .gitignore${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Archivos .env están protegidos por .gitignore${NC}"
fi

# Verificar que .gitignore esté presente
if [ ! -f .gitignore ]; then
    echo -e "${RED}❌ ERROR: .gitignore no encontrado${NC}"
    exit 1
fi

# Verificar que .gitignore esté funcionando correctamente
echo -e "${GREEN}✅ .gitignore verificado${NC}"

# Inicializar Git
echo -e "${GREEN}📦 Inicializando repositorio Git...${NC}"
git init

# Configurar branch principal
git branch -M main

# Agregar archivos (gitignore ya protegerá los archivos sensibles)
echo -e "${GREEN}📝 Agregando archivos al staging...${NC}"
git add .

# Verificar qué se va a commitear
echo -e "${YELLOW}📋 Archivos que se van a commitear:${NC}"
git status --short

# Verificar que no haya .env en el staging (doble verificación)
ENV_FILES_IN_STAGING=$(git diff --cached --name-only | grep -E "\.env$|\.env\." || true)
if [ -n "$ENV_FILES_IN_STAGING" ]; then
    echo -e "${RED}❌ ERROR: Archivos .env detectados en staging:${NC}"
    echo "$ENV_FILES_IN_STAGING"
    echo -e "${YELLOW}   Eliminando del staging...${NC}"
    git reset HEAD .env* 2>/dev/null || true
    echo -e "${RED}   Por favor, verifica tu .gitignore y vuelve a intentar${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Verificación: No hay archivos .env en staging${NC}"

# Hacer commit inicial
echo -e "${GREEN}💾 Creando commit inicial...${NC}"
git commit -m "Initial commit: RUN Demo Hub - Enterprise Sales Enablement Platform"

echo -e "${GREEN}✅ Repositorio inicializado correctamente${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo -e "   1. Agregar remote: ${GREEN}git remote add origin https://github.com/JuliMolinaZ/run-demos.git${NC}"
echo -e "   2. Verificar que todo esté bien: ${GREEN}git status${NC}"
echo -e "   3. Hacer push: ${GREEN}git push -u origin main${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "   - NUNCA subas archivos .env"
echo -e "   - NUNCA subas node_modules o .next"
echo -e "   - Verifica siempre con: ${GREEN}./scripts/pre-commit-check.sh${NC} antes de hacer commit"

