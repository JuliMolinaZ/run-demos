# ⚡ Despliegue Rápido - Servidor Remoto

## 🚀 Despliegue en 1 Comando

```bash
./scripts/deploy-remote.sh
```

## 📋 Antes del Primer Despliegue

### 1. Configurar Variables de Entorno en el Servidor

```bash
# Conectarse al servidor
ssh root@143.110.229.234

# Crear directorio y clonar (si es primera vez)
mkdir -p /opt/demo-hub
cd /opt/demo-hub
git clone https://github.com/JuliMolinaZ/run-demos.git .

# Crear .env.production
cp .env.production.example .env.production
nano .env.production
```

**Configura estas variables críticas:**
```env
POSTGRES_PASSWORD=tu_password_seguro
NEXTAUTH_SECRET=tu_secret_key
ENCRYPTION_KEY=tu_encryption_key
NEXTAUTH_URL=http://143.110.229.234:3001
APP_PORT=3001
```

### 2. Generar Claves Secretas

```bash
# En tu máquina local
openssl rand -base64 32  # Para NEXTAUTH_SECRET
openssl rand -base64 32  # Para ENCRYPTION_KEY
```

## 🎯 Despliegue

```bash
# Desde tu máquina local
./scripts/deploy-remote.sh
```

O usando npm:

```bash
npm run deploy:remote
```

## ✅ Verificación

```bash
# Verificar que la aplicación está corriendo
curl http://143.110.229.234:3001/api/health

# Ver logs
ssh root@143.110.229.234 'cd /opt/demo-hub && docker-compose -f docker-compose.prod.yml logs -f'
```

## 🔄 Actualizar Después de Push

```bash
# 1. Hacer push a GitHub
git push origin main

# 2. Desplegar
./scripts/deploy-remote.sh
```

## 📍 Acceso

- **Aplicación**: http://143.110.229.234:3001
- **Health Check**: http://143.110.229.234:3001/api/health

---

**¡Listo para desplegar! 🚀**

