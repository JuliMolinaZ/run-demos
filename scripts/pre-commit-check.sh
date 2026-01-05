#!/bin/bash

# Script de verificación pre-commit para asegurar que no se suban archivos sensibles
# Uso: ./scripts/pre-commit-check.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Verificando que no haya archivos sensibles..."

ERRORS=0

# Verificar archivos .env (sin extensión)
if git ls-files | grep -q "^\.env$"; then
    echo -e "${RED}❌ ERROR: Archivo .env detectado en el staging area${NC}"
    echo -e "${YELLOW}   Los archivos .env NUNCA deben subirse al repositorio${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar archivos .env.* pero PERMITIR .env.*.example (plantillas)
if git ls-files | grep -E "\.env\." | grep -v "\.example$" | grep -v "\.example\." > /dev/null; then
    echo -e "${RED}❌ ERROR: Archivos .env.* detectados en el staging area (excepto plantillas .example)${NC}"
    echo -e "${YELLOW}   Los archivos .env.* NUNCA deben subirse al repositorio${NC}"
    echo -e "${YELLOW}   Archivos detectados:${NC}"
    git ls-files | grep -E "\.env\." | grep -v "\.example$" | grep -v "\.example\." | sed 's/^/     - /'
    ERRORS=$((ERRORS + 1))
fi

# Verificar credenciales hardcodeadas
if git diff --cached | grep -iE "(password|secret|key|token|api_key|api_secret)\s*=\s*['\"][^'\"]+['\"]" | grep -v "example\|placeholder\|TODO" > /dev/null; then
    echo -e "${RED}❌ ERROR: Posibles credenciales hardcodeadas detectadas${NC}"
    echo -e "${YELLOW}   Revisa el código antes de hacer commit${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar node_modules
if git ls-files | grep -q "node_modules/"; then
    echo -e "${RED}❌ ERROR: node_modules detectado en el staging area${NC}"
    echo -e "${YELLOW}   node_modules no debe subirse al repositorio${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar .next
if git ls-files | grep -q "\.next/"; then
    echo -e "${RED}❌ ERROR: .next detectado en el staging area${NC}"
    echo -e "${YELLOW}   .next no debe subirse al repositorio${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar archivos de log
if git ls-files | grep -q "\.log$"; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Archivos .log detectados${NC}"
    echo -e "${YELLOW}   Considera no subir archivos de log${NC}"
fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Verificación completada: No se detectaron problemas de seguridad${NC}"
    exit 0
else
    echo -e "${RED}❌ Se encontraron $ERRORS error(es). Por favor corrígelos antes de hacer commit.${NC}"
    exit 1
fi

