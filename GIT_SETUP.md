# 🔒 Configuración Segura de Git

## ✅ Verificaciones de Seguridad Implementadas

### 1. `.gitignore` Mejorado
- ✅ Todos los archivos `.env*` están excluidos (excepto `.example`)
- ✅ `node_modules/` excluido
- ✅ `.next/` excluido
- ✅ Archivos de log excluidos
- ✅ Archivos temporales excluidos

### 2. Scripts de Verificación
- ✅ `scripts/pre-commit-check.sh` - Verifica antes de cada commit
- ✅ `scripts/safe-git-init.sh` - Inicialización segura de Git
- ✅ GitHub Actions workflow para verificación automática

### 3. Documentación
- ✅ `SECURITY.md` - Política de seguridad
- ✅ Este archivo con instrucciones

## 🚀 Inicialización Segura del Repositorio

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar script de inicialización segura
./scripts/safe-git-init.sh

# Agregar remote
git remote add origin https://github.com/JuliMolinaZ/run-demos.git

# Verificar que todo esté bien
git status

# Hacer push
git push -u origin main
```

### Opción 2: Manual (Paso a Paso)

```bash
# 1. Verificar que no haya archivos .env
ls -la .env*  # No debería mostrar .env o .env.production

# 2. Inicializar Git
git init

# 3. Configurar branch
git branch -M main

# 4. Agregar archivos
git add .

# 5. Verificar qué se va a commitear (IMPORTANTE)
git status

# 6. Si ves archivos .env, eliminarlos del staging:
git reset HEAD .env .env.production .env.local

# 7. Hacer commit
git commit -m "Initial commit: RUN Demo Hub"

# 8. Agregar remote
git remote add origin https://github.com/JuliMolinaZ/run-demos.git

# 9. Verificar una vez más
git status

# 10. Hacer push
git push -u origin main
```

## 🔍 Verificación Pre-Commit

Antes de cada commit, ejecuta:

```bash
./scripts/pre-commit-check.sh
```

Este script verifica:
- ✅ No hay archivos `.env` en staging
- ✅ No hay credenciales hardcodeadas
- ✅ No hay `node_modules` o `.next` en staging

## ⚠️ Archivos que NUNCA deben subirse

- ❌ `.env`
- ❌ `.env.production`
- ❌ `.env.local`
- ❌ `node_modules/`
- ❌ `.next/`
- ❌ `*.log`
- ❌ `*.key`, `*.pem`
- ❌ Cualquier archivo con credenciales

## ✅ Archivos que SÍ deben subirse

- ✅ `.env.example` (plantilla)
- ✅ `.env.production.example` (plantilla)
- ✅ Todo el código fuente
- ✅ `package.json` y `package-lock.json`
- ✅ `Dockerfile` y `docker-compose*.yml`
- ✅ Documentación (README, DEPLOY, etc.)

## 🛡️ Si accidentalmente subiste algo sensible

1. **INMEDIATAMENTE** rota todas las credenciales expuestas
2. Elimina del historial (consulta `SECURITY.md`)
3. Fuerza push (¡CUIDADO! Solo si es necesario)

## 📋 Checklist Antes de Push

- [ ] Ejecuté `./scripts/pre-commit-check.sh` sin errores
- [ ] Verifiqué `git status` y no hay archivos `.env`
- [ ] No hay credenciales hardcodeadas en el código
- [ ] `node_modules/` y `.next/` están en `.gitignore`
- [ ] Revisé los archivos que se van a commitear

---

**¡Repositorio seguro y listo! 🔒**

