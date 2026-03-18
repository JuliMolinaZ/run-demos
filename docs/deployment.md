# 🚀 Guía de Despliegue

Documentación consolidada para desplegar **Demo Hub** en producción.

## 📋 Prerrequisitos

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (para scripts locales)
- Al menos 2GB de RAM disponible
- Puertos 3001 (app) y 5432 (PostgreSQL, solo interno) disponibles

## 🔧 Configuración inicial

### 1. Clonar y configurar variables

```bash
git clone <tu-repositorio>
cd demo-hub
cp .env.production.example .env.production
nano .env.production
```

### 2. Generar claves secretas

```bash
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -base64 32   # ENCRYPTION_KEY
openssl rand -base64 24   # POSTGRES_PASSWORD (opcional)
```

## 🐳 Despliegue con Docker (local o VPS)

### Script automático (recomendado)

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

El script verifica dependencias, construye imágenes, inicia servicios, verifica salud y ejecuta migraciones.

### Manual

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker exec demo-hub-app-prod npm run db:migrate
```

### Despliegue remoto (SSH)

Para desplegar en un servidor remoto:

1. Configura acceso SSH al servidor.
2. En el servidor: clona el repo en `/opt/demo-hub`, crea `.env.production` desde `.env.production.example`.
3. Desde local:

```bash
./scripts/deploy-remote.sh
# o
npm run deploy:remote
```

Para despliegue limpio (limpieza + deploy):

```bash
npm run deploy:clean
```

## ✅ Verificación

```bash
docker-compose -f docker-compose.prod.yml ps
curl http://localhost:3001/api/health
docker exec demo-hub-postgres-prod pg_isready -U demo_hub_user
```

### Crear usuario administrador

```bash
docker exec -it demo-hub-app-prod npm run create-user "Admin" admin@example.com "password-seguro" admin
```

## 🔄 Actualización

```bash
docker-compose -f docker-compose.prod.yml down
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
docker exec demo-hub-app-prod npm run db:migrate
```

## 📌 Paridad local y producción

Para que **local** y **producción** tengan el mismo código (las 2 apps iguales):

1. **Sube los cambios a `main`:**
   ```bash
   git add .
   git commit -m "mensaje"
   git push origin main
   ```

2. **Despliega en el servidor** (actualiza código desde el repo, sin borrar nada de producción):
   ```bash
   ./scripts/deploy-remote.sh
   ```

El script de deploy remoto:
- Actualiza solo el **código** desde `origin/main` (`git fetch` + `git reset --hard`).
- **No borra** en el servidor: `.env.production`, ningún `.env*`, ni los volúmenes Docker (base de datos, etc.).
- Limpia solo artefactos de build (`.next`, `node_modules`, `.cache`, logs) y luego reconstruye con Docker.

**Qué se mantiene siempre en producción (no se toca):**
- `.env.production` y cualquier archivo `.env*`
- Volumen `postgres_data_prod` (datos de la BD)
- Cualquier archivo creado solo en el servidor

**Validación rápida** (misma versión en ambos lados):
- Tras el deploy, en producción: `curl https://tu-dominio/api/health` debe responder OK.
- Rutas clave: `/demos`, `/demos/[id]/view`, `/demos/[id]/public` (links compartidos).

## 🔐 Seguridad en producción

- No exponer el puerto 5432 (PostgreSQL) a internet.
- Usar reverse proxy (Nginx, Traefik) con SSL delante de la app.
- Nunca subir `.env.production` al repositorio.
- Ver también [SECURITY.md](../SECURITY.md) en la raíz del proyecto.

## 🐛 Solución de problemas

- **App no inicia:** `docker-compose -f docker-compose.prod.yml logs app`
- **BD no conecta:** `docker ps | grep postgres` y revisar `DATABASE_URL` en `.env.production`
- **Permisos:** revisar ownership de volúmenes; si es necesario, `down -v` y volver a `up -d`

## 📊 Backup de base de datos

```bash
docker exec demo-hub-postgres-prod pg_dump -U demo_hub_user demo_hub > backup_$(date +%Y%m%d).sql
```

---

Para más contexto del proyecto, ver [README.md](../README.md).
