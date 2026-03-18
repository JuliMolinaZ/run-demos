#!/bin/bash

# Script de despliegue remoto para producción
# Uso: ./scripts/deploy-remote.sh

set -e

# Configuración del servidor
SERVER_HOST="143.110.229.234"
SERVER_USER="root"
SERVER_APP_DIR="/opt/demo-hub"
GIT_REPO="https://github.com/JuliMolinaZ/run-demos.git"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Iniciando despliegue remoto a ${SERVER_USER}@${SERVER_HOST}..."

# Verificar que SSH funciona
echo -e "${YELLOW}🔍 Verificando conexión SSH...${NC}"
if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "echo 'Conexión exitosa'" 2>/dev/null; then
    echo -e "${RED}❌ No se pudo conectar al servidor${NC}"
    echo -e "${YELLOW}   Verifica que:${NC}"
    echo -e "   - La llave SSH está configurada correctamente"
    echo -e "   - El servidor está accesible"
    echo -e "   - Tienes permisos de acceso"
    echo -e "${YELLOW}   Prueba manualmente: ssh ${SERVER_USER}@${SERVER_HOST}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conexión SSH verificada${NC}"

# Verificar que Docker está instalado en el servidor
echo -e "${YELLOW}🔍 Verificando Docker en el servidor...${NC}"
if ! ssh ${SERVER_USER}@${SERVER_HOST} "command -v docker > /dev/null 2>&1"; then
    echo -e "${RED}❌ Docker no está instalado en el servidor${NC}"
    echo -e "${YELLOW}   Instalando Docker...${NC}"
    ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
        # Instalar Docker
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
        
        # Instalar Docker Compose
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
EOF
    echo -e "${GREEN}✅ Docker instalado${NC}"
else
    echo -e "${GREEN}✅ Docker ya está instalado${NC}"
fi

# Crear directorio de la aplicación si no existe
echo -e "${YELLOW}📁 Preparando directorio de la aplicación...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_APP_DIR}"

# Clonar o actualizar el repositorio
echo -e "${YELLOW}📦 Clonando/Actualizando repositorio...${NC}"
if ssh ${SERVER_USER}@${SERVER_HOST} "[ -d ${SERVER_APP_DIR}/.git ]"; then
    echo -e "${YELLOW}   Actualizando repositorio existente...${NC}"
    ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
        cd /opt/demo-hub
        # Limpiar solo artefactos de build (NUNCA tocar .env ni datos de producción)
        rm -rf .next node_modules *.log .cache .turbo 2>/dev/null || true
        git fetch origin
        git reset --hard origin/main
        # Excluir .env* para no borrar variables de producción
        git clean -fd -e .env.production -e '.env.production.*' -e '.env*'
EOF
else
    echo -e "${YELLOW}   Clonando repositorio...${NC}"
    ssh ${SERVER_USER}@${SERVER_HOST} << EOF
        cd $(dirname ${SERVER_APP_DIR})
        git clone ${GIT_REPO} $(basename ${SERVER_APP_DIR})
EOF
fi

echo -e "${GREEN}✅ Repositorio actualizado${NC}"

# Verificar que existe .env.production en el servidor
echo -e "${YELLOW}🔍 Verificando variables de entorno...${NC}"
if ! ssh ${SERVER_USER}@${SERVER_HOST} "[ -f ${SERVER_APP_DIR}/.env.production ]"; then
    echo -e "${RED}❌ Archivo .env.production no encontrado en el servidor${NC}"
    echo -e "${YELLOW}   Creando plantilla...${NC}"
    ssh ${SERVER_USER}@${SERVER_HOST} << 'ENVEOF'
        cd /opt/demo-hub
        if [ -f .env.production.example ]; then
            cp .env.production.example .env.production
        else
            # Crear .env.production desde cero si no existe plantilla
            cat > .env.production << 'EOF'
# ============================================
# Demo Hub - Production Environment Variables
# ============================================
# IMPORTANTE: Reemplaza todos los valores con tus credenciales reales

# Base de Datos PostgreSQL
POSTGRES_USER=demo_hub_user
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO_AQUI
POSTGRES_DB=demo_hub
POSTGRES_PORT=5432

# NextAuth.js (Autenticación)
NEXTAUTH_URL=https://demo-hub.runsolutions-services.com
NEXTAUTH_SECRET=TU_SECRET_KEY_AQUI_GENERA_UNA_CLAVE_SEGURA

# Cloudinary (Almacenamiento de Medios)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# UploadThing (Subida de Archivos)
UPLOADTHING_TOKEN=tu-uploadthing-token
UPLOADTHING_SECRET=tu-uploadthing-secret

# Encriptación de Credenciales
ENCRYPTION_KEY=TU_ENCRYPTION_KEY_AQUI_GENERA_UNA_CLAVE_SEGURA

# Docker y Aplicación
APP_PORT=3001

# N8N Webhooks (Opcional)
# N8N_WEBHOOK_URL=https://tu-n8n-instance.com/webhook
EOF
        fi
ENVEOF
    echo -e "${RED}❌ Por favor, configura .env.production en el servidor antes de continuar${NC}"
    echo -e "${YELLOW}   Ejecuta: ssh ${SERVER_USER}@${SERVER_HOST} 'nano ${SERVER_APP_DIR}/.env.production'${NC}"
    echo -e "${YELLOW}   O manualmente:${NC}"
    echo -e "${YELLOW}   1. ssh ${SERVER_USER}@${SERVER_HOST}${NC}"
    echo -e "${YELLOW}   2. cd ${SERVER_APP_DIR}${NC}"
    echo -e "${YELLOW}   3. nano .env.production${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variables de entorno verificadas${NC}"

# Construir y desplegar
echo -e "${YELLOW}🔨 Construyendo y desplegando aplicación...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    cd ${SERVER_APP_DIR}
    
    # Detener contenedores existentes de demo-hub SOLO
    echo "🛑 Deteniendo contenedores existentes de demo-hub..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production down || true
    
    # Limpiar SOLO recursos de demo-hub (NO otras aplicaciones)
    echo "🧹 Limpiando recursos antiguos de demo-hub..."
    # Eliminar solo imágenes de demo-hub
    docker images | grep "demo-hub" | awk '{print $3}' | xargs -r docker rmi -f || true
    # Eliminar solo contenedores detenidos de demo-hub
    docker ps -a | grep "demo-hub" | awk '{print $1}' | xargs -r docker rm -f || true
    # NO limpiar volúmenes automáticamente (puede afectar otras apps)
    # Los volúmenes se mantienen para preservar datos de otras aplicaciones
    
    # Construir imágenes (sin cache para asegurar build limpio)
    echo "🔨 Construyendo imágenes optimizadas..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache --pull

    # Iniciar servicios
    echo "🚀 Iniciando servicios..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
    
    # Esperar a que los servicios estén listos
    echo "⏳ Esperando a que los servicios estén listos..."
    sleep 10
    
    # Verificar salud de PostgreSQL
    if docker exec demo-hub-postgres-prod pg_isready -U \${POSTGRES_USER:-demo_hub_user} > /dev/null 2>&1; then
        echo "✅ PostgreSQL está funcionando"
    else
        echo "❌ PostgreSQL no está respondiendo"
        exit 1
    fi
    
    # Verificar salud de la aplicación
    max_attempts=30
    attempt=0
    while [ \$attempt -lt \$max_attempts ]; do
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            echo "✅ Aplicación está funcionando"
            break
        fi
        attempt=\$((attempt + 1))
        echo "   Intento \$attempt/\$max_attempts..."
        sleep 2
    done
    
    if [ \$attempt -eq \$max_attempts ]; then
        echo "❌ La aplicación no está respondiendo"
        echo "Revisa los logs: docker-compose -f docker-compose.prod.yml logs app"
        exit 1
    fi
    
    # Ejecutar migraciones
    echo "📦 Ejecutando migraciones..."
    docker exec demo-hub-app-prod npm run db:migrate || echo "⚠️  Las migraciones pueden necesitar ejecutarse manualmente"
    
    # Limpiar SOLO imágenes huérfanas de demo-hub (NO otras apps)
    echo "🧹 Limpiando imágenes huérfanas de demo-hub..."
    docker images --filter "dangling=true" --filter "reference=demo-hub*" -q | xargs -r docker rmi -f || true
    
    echo "✨ Despliegue completado exitosamente!"
EOF

echo -e "${GREEN}✨ Despliegue remoto completado exitosamente!${NC}"
echo ""
# Obtener el puerto desde .env.production si existe
APP_PORT=$(ssh ${SERVER_USER}@${SERVER_HOST} "grep APP_PORT ${SERVER_APP_DIR}/.env.production 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo '3001'")
echo -e "${GREEN}🌐 Aplicación disponible en: http://${SERVER_HOST}:${APP_PORT:-3001}${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo -e "   Ver logs: ${GREEN}ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_APP_DIR} && docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f'${NC}"
echo -e "   Detener: ${GREEN}ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_APP_DIR} && docker-compose -f docker-compose.prod.yml --env-file .env.production down'${NC}"
echo -e "   Reiniciar: ${GREEN}ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_APP_DIR} && docker-compose -f docker-compose.prod.yml --env-file .env.production restart'${NC}"
echo -e "   Estado: ${GREEN}ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_APP_DIR} && docker-compose -f docker-compose.prod.yml --env-file .env.production ps'${NC}"

