#!/bin/bash

# Script de limpieza pre-despliegue para optimizar el tamaño
# Elimina archivos innecesarios antes de hacer push o deploy

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧹 Limpiando proyecto antes del despliegue..."

# Limpiar node_modules si existe (se reinstalará en Docker)
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules detectado (se reinstalará en Docker)${NC}"
fi

# Limpiar builds de Next.js
if [ -d ".next" ]; then
    echo -e "${YELLOW}🗑️  Eliminando .next...${NC}"
    rm -rf .next
fi

# Limpiar archivos de log
echo -e "${YELLOW}🗑️  Eliminando archivos de log...${NC}"
find . -name "*.log" -type f -not -path "./node_modules/*" -delete 2>/dev/null || true

# Limpiar archivos temporales
echo -e "${YELLOW}🗑️  Eliminando archivos temporales...${NC}"
find . -name "*.tmp" -type f -not -path "./node_modules/*" -delete 2>/dev/null || true
find . -name "*.temp" -type f -not -path "./node_modules/*" -delete 2>/dev/null || true
rm -rf .cache .turbo .swc 2>/dev/null || true

# Limpiar TypeScript build info
echo -e "${YELLOW}🗑️  Eliminando archivos TypeScript temporales...${NC}"
find . -name "*.tsbuildinfo" -type f -not -path "./node_modules/*" -delete 2>/dev/null || true

# Verificar tamaño del proyecto
echo -e "${GREEN}📊 Tamaño del proyecto (excluyendo node_modules y .git):${NC}"
du -sh . --exclude=node_modules --exclude=.git 2>/dev/null || du -sh .

echo -e "${GREEN}✅ Limpieza completada${NC}"
echo -e "${YELLOW}💡 Los archivos se reconstruirán en el servidor durante el build de Docker${NC}"

