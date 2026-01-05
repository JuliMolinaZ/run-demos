#!/bin/bash

# Script de despliegue para producción
# Uso: ./scripts/deploy.sh

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de Demo Hub..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

# Verificar que existe .env.production
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  Archivo .env.production no encontrado.${NC}"
    echo -e "${YELLOW}   Creando desde .env.production.example...${NC}"
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}   Por favor, completa los valores en .env.production antes de continuar.${NC}"
        exit 1
    else
        echo -e "${RED}❌ Archivo .env.production.example no encontrado.${NC}"
        exit 1
    fi
fi

# Verificar variables críticas
source .env.production

if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$NEXTAUTH_SECRET" ] || [ -z "$ENCRYPTION_KEY" ]; then
    echo -e "${RED}❌ Faltan variables críticas en .env.production${NC}"
    echo -e "${RED}   Asegúrate de configurar: POSTGRES_PASSWORD, NEXTAUTH_SECRET, ENCRYPTION_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variables de entorno verificadas${NC}"

# Detener contenedores existentes si están corriendo
echo -e "${YELLOW}🛑 Deteniendo contenedores existentes...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Construir imágenes
echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar salud de los servicios
echo -e "${YELLOW}🏥 Verificando salud de los servicios...${NC}"

# Verificar PostgreSQL
if docker exec demo-hub-postgres-prod pg_isready -U ${POSTGRES_USER:-demo_hub_user} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL está funcionando${NC}"
else
    echo -e "${RED}❌ PostgreSQL no está respondiendo${NC}"
    exit 1
fi

# Verificar aplicación
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:${APP_PORT:-3000}/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicación está funcionando${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -e "${YELLOW}   Intento $attempt/$max_attempts...${NC}"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ La aplicación no está respondiendo después de $max_attempts intentos${NC}"
    echo -e "${YELLOW}   Revisa los logs: docker-compose -f docker-compose.prod.yml logs app${NC}"
    exit 1
fi

# Ejecutar migraciones
echo -e "${YELLOW}📦 Ejecutando migraciones de base de datos...${NC}"
docker exec demo-hub-app-prod npm run db:migrate || echo -e "${YELLOW}⚠️  Las migraciones pueden necesitar ejecutarse manualmente${NC}"

echo -e "${GREEN}✨ Despliegue completado exitosamente!${NC}"
echo -e "${GREEN}🌐 Aplicación disponible en: http://localhost:${APP_PORT:-3000}${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo -e "   Ver logs: ${GREEN}docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "   Detener: ${GREEN}docker-compose -f docker-compose.prod.yml down${NC}"
echo -e "   Reiniciar: ${GREEN}docker-compose -f docker-compose.prod.yml restart${NC}"

