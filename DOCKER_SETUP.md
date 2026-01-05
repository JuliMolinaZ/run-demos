# 🐳 Configuración Docker - Resumen Rápido

## 📁 Archivos Creados

### Dockerfiles y Configuración
- ✅ `Dockerfile` - Multi-stage build optimizado para producción
- ✅ `.dockerignore` - Exclusiones para builds más rápidos
- ✅ `docker-compose.prod.yml` - Configuración de producción
- ✅ `docker-compose.dev.yml` - Configuración de desarrollo (solo DB)

### Scripts y Documentación
- ✅ `scripts/deploy.sh` - Script de despliegue automático
- ✅ `DEPLOY.md` - Guía completa de despliegue
- ✅ `.env.production.example` - Plantilla de variables de entorno

### Endpoints
- ✅ `app/api/health/route.ts` - Health check para Docker

## 🚀 Despliegue Rápido (3 Pasos)

### 1. Configurar Variables de Entorno

```bash
cp .env.production.example .env.production
# Editar .env.production con tus valores
```

### 2. Ejecutar Despliegue

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. Crear Usuario Admin

```bash
docker exec -it demo-hub-app-prod npm run create-user "Admin" admin@example.com "password123" admin
```

## 📋 Comandos NPM Útiles

```bash
# Docker - Producción
npm run docker:build    # Construir imágenes
npm run docker:up       # Iniciar servicios
npm run docker:down     # Detener servicios
npm run docker:logs     # Ver logs

# Docker - Desarrollo (solo DB)
npm run docker:dev      # Iniciar solo PostgreSQL
npm run docker:dev:down # Detener PostgreSQL

# Despliegue completo
npm run deploy          # Ejecutar script de despliegue
```

## 🔍 Verificación

```bash
# Verificar que todo está corriendo
docker-compose -f docker-compose.prod.yml ps

# Health check
curl http://localhost:3000/api/health

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 📚 Documentación Completa

Para más detalles, consulta `DEPLOY.md`

---

**¡Listo para producción! 🎉**

