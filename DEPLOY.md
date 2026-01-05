# 🚀 Guía de Despliegue a Producción

Esta guía te ayudará a desplegar **Demo Hub** en producción usando Docker de manera sencilla.

## 📋 Prerrequisitos

- Docker 20.10+
- Docker Compose 2.0+
- Al menos 2GB de RAM disponible
- Puerto 3001 y 5432 disponibles

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd demo-hub
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production  # o usa tu editor preferido
```

### 3. Generar Claves Secretas

```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Generar ENCRYPTION_KEY
openssl rand -base64 32

# Generar POSTGRES_PASSWORD (opcional, puedes usar cualquier string seguro)
openssl rand -base64 24
```

## 🐳 Despliegue con Docker

### Opción 1: Script Automático (Recomendado)

```bash
# Dar permisos de ejecución
chmod +x scripts/deploy.sh

# Ejecutar despliegue
./scripts/deploy.sh
```

El script automáticamente:
- ✅ Verifica dependencias
- ✅ Construye las imágenes
- ✅ Inicia los servicios
- ✅ Verifica la salud de los servicios
- ✅ Ejecuta migraciones

### Opción 2: Manual

```bash
# 1. Construir imágenes
docker-compose -f docker-compose.prod.yml build

# 2. Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# 3. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f

# 4. Ejecutar migraciones (si es necesario)
docker exec demo-hub-app-prod npm run db:migrate
```

## 🔍 Verificación

### Verificar que los servicios están corriendo

```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Verificar salud de la aplicación
curl http://localhost:3001/api/health

# Verificar base de datos
docker exec demo-hub-postgres-prod pg_isready -U demo_hub_user
```

### Crear Usuario Administrador

```bash
docker exec -it demo-hub-app-prod npm run create-user "Admin Name" admin@example.com "secure-password" admin
```

## 📊 Monitoreo y Logs

### Ver Logs

```bash
# Todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Solo la aplicación
docker-compose -f docker-compose.prod.yml logs -f app

# Solo la base de datos
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Estadísticas de Recursos

```bash
docker stats demo-hub-app-prod demo-hub-postgres-prod
```

## 🔄 Actualización

Para actualizar la aplicación:

```bash
# 1. Detener servicios
docker-compose -f docker-compose.prod.yml down

# 2. Actualizar código (si usas git)
git pull

# 3. Reconstruir y reiniciar
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 4. Ejecutar migraciones si hay cambios en la BD
docker exec demo-hub-app-prod npm run db:migrate
```

## 🛑 Detener Servicios

```bash
# Detener sin eliminar volúmenes
docker-compose -f docker-compose.prod.yml stop

# Detener y eliminar contenedores (mantiene volúmenes)
docker-compose -f docker-compose.prod.yml down

# Detener y eliminar todo (incluyendo volúmenes - ¡CUIDADO!)
docker-compose -f docker-compose.prod.yml down -v
```

## 🔐 Seguridad en Producción

### 1. Firewall

Asegúrate de que solo los puertos necesarios estén expuestos:

```bash
# Solo exponer puerto 3001 (aplicación)
# No exponer 5432 (PostgreSQL) públicamente
```

### 2. Variables de Entorno

- ✅ Nunca subas `.env.production` al repositorio
- ✅ Usa secretos del sistema o un gestor de secretos
- ✅ Rota las contraseñas regularmente

### 3. SSL/TLS

Para producción, usa un reverse proxy (Nginx, Traefik, etc.) con SSL:

```nginx
# Ejemplo Nginx
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
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Solución de Problemas

### La aplicación no inicia

```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs app

# Verificar variables de entorno
docker exec demo-hub-app-prod env | grep -E "(DATABASE_URL|NEXTAUTH)"
```

### Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Verificar logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Probar conexión manual
docker exec -it demo-hub-postgres-prod psql -U demo_hub_user -d demo_hub
```

### Problemas de permisos

```bash
# Verificar ownership de volúmenes
docker volume inspect demo-hub_postgres_data_prod

# Si es necesario, recrear volúmenes
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Escalabilidad

Para escalar horizontalmente:

```bash
# Escalar la aplicación (ej: 3 instancias)
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

**Nota**: Necesitarás un load balancer (Nginx, Traefik) para distribuir el tráfico.

## 🔄 Backup y Restauración

### Backup de Base de Datos

```bash
# Crear backup
docker exec demo-hub-postgres-prod pg_dump -U demo_hub_user demo_hub > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i demo-hub-postgres-prod psql -U demo_hub_user demo_hub < backup.sql
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verifica las variables de entorno
3. Consulta la documentación en `README.md`

---

**¡Despliegue exitoso! 🎉**

