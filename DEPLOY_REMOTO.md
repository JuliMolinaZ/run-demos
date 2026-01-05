# 🚀 Despliegue Remoto a Servidor

Guía para desplegar Demo Hub en un servidor remoto usando SSH.

## 📋 Prerrequisitos

- Acceso SSH al servidor (143.110.229.234)
- Llave SSH configurada
- Repositorio en GitHub (https://github.com/JuliMolinaZ/run-demos.git)

## 🔧 Configuración Inicial

### 1. Verificar Conexión SSH

```bash
ssh root@143.110.229.234
```

Si puedes conectarte, estás listo para continuar.

### 2. Configurar Variables de Entorno en el Servidor

**Primera vez:**
```bash
# Conectarse al servidor
ssh root@143.110.229.234

# Navegar al directorio (se creará automáticamente)
cd /opt/demo-hub

# Crear .env.production desde la plantilla
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production
```

**Variables requeridas:**
```env
# Base de datos
POSTGRES_USER=demo_hub_user
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO
POSTGRES_DB=demo_hub

# NextAuth
NEXTAUTH_URL=http://143.110.229.234:3001
NEXTAUTH_SECRET=TU_SECRET_KEY

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# UploadThing
UPLOADTHING_TOKEN=tu-token
UPLOADTHING_SECRET=tu-secret

# Encryption
ENCRYPTION_KEY=TU_ENCRYPTION_KEY

# Docker
APP_PORT=3001
```

## 🚀 Despliegue

### Opción 1: Script Automático (Recomendado)

```bash
# Desde tu máquina local
./scripts/deploy-remote.sh
```

El script automáticamente:
- ✅ Verifica conexión SSH
- ✅ Instala Docker si es necesario
- ✅ Clona/actualiza el repositorio
- ✅ Construye las imágenes
- ✅ Inicia los servicios
- ✅ Verifica la salud de los servicios
- ✅ Ejecuta migraciones

### Opción 2: Manual

```bash
# 1. Conectarse al servidor
ssh root@143.110.229.234

# 2. Clonar repositorio (primera vez)
cd /opt
git clone https://github.com/JuliMolinaZ/run-demos.git demo-hub
cd demo-hub

# 3. Configurar .env.production (si no existe)
cp .env.production.example .env.production
nano .env.production

# 4. Construir y desplegar
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar
docker-compose -f docker-compose.prod.yml ps
curl http://localhost:3001/api/health
```

## 🔄 Actualización

Para actualizar la aplicación después de hacer push a GitHub:

```bash
# Ejecutar el script de despliegue remoto
./scripts/deploy-remote.sh
```

O manualmente:

```bash
ssh root@143.110.229.234 << 'EOF'
    cd /opt/demo-hub
    git pull origin main
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    docker exec demo-hub-app-prod npm run db:migrate
EOF
```

## 📊 Monitoreo

### Ver Logs

```bash
# Todos los servicios
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml logs -f'

# Solo la aplicación
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml logs -f app'

# Solo PostgreSQL
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml logs -f postgres'
```

### Estado de los Servicios

```bash
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml ps'
```

### Estadísticas de Recursos

```bash
ssh root@143.110.229.234 'docker stats demo-hub-app-prod demo-hub-postgres-prod'
```

## 🛑 Detener Servicios

```bash
# Detener sin eliminar volúmenes
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml stop'

# Detener y eliminar contenedores
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml down'

# Detener y eliminar todo (incluyendo volúmenes - ¡CUIDADO!)
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml down -v'
```

## 🔐 Seguridad

### Firewall

Asegúrate de que solo los puertos necesarios estén abiertos:

```bash
# En el servidor
ufw allow 3001/tcp  # Aplicación
ufw allow 22/tcp    # SSH
ufw enable
```

### Nginx Reverse Proxy (Recomendado)

Para producción, configura Nginx como reverse proxy con SSL:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Solución de Problemas

### La aplicación no inicia

```bash
# Ver logs detallados
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml logs app'

# Verificar variables de entorno
ssh root@143.110.229.234 'cd /opt/demo-hub && docker exec demo-hub-app-prod env | grep -E "(DATABASE_URL|NEXTAUTH)"'
```

### Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
ssh root@143.110.229.234 'docker ps | grep postgres'

# Ver logs de PostgreSQL
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml logs postgres'
```

### Problemas de permisos

```bash
# Verificar ownership
ssh root@143.110.229.234 'docker volume inspect demo-hub_postgres_data_prod'
```

## 📈 Acceso a la Aplicación

Una vez desplegado, la aplicación estará disponible en:

- **HTTP**: http://143.110.229.234:3001
- **Health Check**: http://143.110.229.234:3001/api/health

## 🔄 Crear Usuario Administrador

```bash
ssh root@143.110.229.234 'docker exec -it demo-hub-app-prod npm run create-user "Admin Name" admin@example.com "secure-password" admin'
```

---

**¡Despliegue remoto exitoso! 🎉**

