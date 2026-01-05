# 🔒 Política de Seguridad

## Archivos que NUNCA deben subirse

Los siguientes archivos **NUNCA** deben ser commitados al repositorio:

- ✅ `.env` - Variables de entorno locales
- ✅ `.env.production` - Variables de producción
- ✅ `.env.local` - Variables locales
- ✅ `*.key` - Claves privadas
- ✅ `*.pem` - Certificados
- ✅ `node_modules/` - Dependencias
- ✅ `.next/` - Build de Next.js
- ✅ `*.log` - Archivos de log

## Verificación Pre-Commit

Antes de hacer commit, ejecuta:

```bash
./scripts/pre-commit-check.sh
```

Este script verifica que no haya:
- Archivos `.env` en el staging area
- Credenciales hardcodeadas
- `node_modules` o `.next` en el staging area

## Variables de Entorno

Todas las variables de entorno deben estar en:
- `.env.production` (para producción)
- `.env.local` (para desarrollo local)

**NUNCA** hardcodees credenciales en el código.

## Si accidentalmente subiste algo sensible

1. **Inmediatamente** rota todas las credenciales expuestas
2. Elimina el archivo del historial de Git:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.production" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Fuerza push (¡CUIDADO!):
   ```bash
   git push origin --force --all
   ```

## Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:
1. NO crees un issue público
2. Contacta al equipo de desarrollo directamente
3. Proporciona detalles del problema encontrado

---

**Recuerda**: La seguridad es responsabilidad de todos. 🛡️

