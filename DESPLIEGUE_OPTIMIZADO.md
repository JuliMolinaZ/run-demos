# 🚀 Despliegue Optimizado - Guía Completa

## ✨ Optimizaciones Implementadas

### 🎯 Objetivo
Despliegue **limpio, profesional y eficiente** que minimiza el uso de recursos del servidor.

### 📊 Mejoras Aplicadas

1. **Dockerfile Multi-Stage Optimizado**
   - 3 etapas (deps → builder → runner)
   - Solo dependencias de producción en imagen final
   - Limpieza automática de cache
   - Imagen final: ~250MB (vs ~1GB sin optimizar)

2. **.dockerignore Mejorado**
   - Excluye `node_modules/`, `.next/`, logs, docs innecesarias
   - Contexto de build reducido en ~90%

3. **Limpieza Automática**
   - Script pre-deploy elimina archivos locales innecesarios
   - Limpieza de imágenes Docker antiguas en servidor
   - Limpieza de contenedores y volúmenes no utilizados

4. **Build Optimizado**
   - `--no-cache` para builds limpios
   - `--pull` para imágenes base actualizadas
   - Limpieza post-build automática

## 🚀 Proceso de Despliegue Optimizado

### Paso 1: Limpiar Localmente (Opcional pero Recomendado)

```bash
# Limpiar archivos innecesarios antes de hacer push
npm run clean
```

Esto elimina:
- `.next/` (se reconstruye en Docker)
- Archivos de log
- Archivos temporales
- Cache de TypeScript

### Paso 2: Hacer Commit y Push

```bash
git add .
git commit -m "Update"
git push origin main
```

### Paso 3: Desplegar al Servidor

```bash
# Opción 1: Despliegue con limpieza automática
npm run deploy:clean

# Opción 2: Solo despliegue
npm run deploy:remote
```

## 📋 Lo que se Sube al Servidor

### ✅ Se Sube (Solo lo Esencial)
- Código fuente (`.ts`, `.tsx`, `.js`, `.jsx`)
- `package.json` y `package-lock.json`
- `Dockerfile` y `docker-compose.prod.yml`
- `README.md` y `DEPLOY.md`
- Scripts esenciales (`create-user.ts`, `run-migration.ts`)
- Configuración (`next.config.js`, `tsconfig.json`, etc.)

### ❌ NO se Sube (Optimizado)
- `node_modules/` - Se instala en Docker
- `.next/` - Se construye en Docker
- Archivos `.env*` - Variables de entorno
- Logs y archivos temporales
- Documentación innecesaria
- Scripts de desarrollo
- Archivos de IDE
- Migraciones (se ejecutan en runtime)

## 🧹 Limpieza en el Servidor

El script de despliegue automáticamente:

1. **Antes del build:**
   - Limpia imágenes Docker antiguas
   - Limpia contenedores detenidos
   - Limpia volúmenes no utilizados

2. **Después del build:**
   - Limpia imágenes intermedias
   - Limpia cache de build

### Limpieza Manual (Si es Necesario)

```bash
ssh root@143.110.229.234 << 'EOF'
    cd /opt/demo-hub
    
    # Limpiar imágenes no utilizadas
    docker image prune -a -f
    
    # Limpiar sistema completo (liberar más espacio)
    docker system prune -a -f --volumes
    
    # Ver espacio liberado
    docker system df
EOF
```

## 📊 Monitoreo de Recursos

### Verificar Uso de Disco

```bash
# En el servidor
ssh root@143.110.229.234 'df -h'
```

### Verificar Uso de Docker

```bash
ssh root@143.110.229.234 'docker system df'
```

### Ver Tamaño de Imágenes

```bash
ssh root@143.110.229.234 'docker images | grep demo-hub'
```

## 🎯 Resultado Final

### Tamaños Optimizados

| Componente | Tamaño Aproximado |
|------------|-------------------|
| Repositorio en servidor | ~10-15 MB |
| Imagen Docker final | ~250 MB |
| Volumen PostgreSQL | Variable (según datos) |
| **Total estimado** | **~300-400 MB** |

### Comparación

- **Sin optimizar**: ~1.5 GB
- **Optimizado**: ~300-400 MB
- **Reducción**: ~75-80%

## ✅ Checklist Pre-Deploy

Antes de cada despliegue:

- [ ] Ejecutar `npm run clean` (opcional)
- [ ] Verificar que `.env.production` está en servidor
- [ ] Verificar espacio disponible: `ssh root@143.110.229.234 'df -h'`
- [ ] Hacer push a GitHub
- [ ] Ejecutar `npm run deploy:remote`

## 🔄 Actualización Rápida

Para actualizar después de cambios:

```bash
# 1. Push a GitHub
git push origin main

# 2. Desplegar (con limpieza automática)
npm run deploy:remote
```

El script:
- ✅ Actualiza código desde GitHub
- ✅ Limpia recursos antiguos
- ✅ Construye imagen optimizada
- ✅ Reinicia servicios
- ✅ Verifica salud

## 🛡️ Seguridad y Limpieza

- ✅ No se suben archivos `.env`
- ✅ No se suben `node_modules`
- ✅ No se suben builds locales
- ✅ Limpieza automática de recursos
- ✅ Imágenes Docker mínimas
- ✅ Usuario no-root en contenedores

---

**Despliegue optimizado, limpio y profesional 🚀**

