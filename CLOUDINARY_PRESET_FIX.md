# ACCIÓN REQUERIDA: Cambiar Preset de Cloudinary

## Problema Identificado
Tu cuenta de Cloudinary requiere que **todos los uploads usen un upload preset**. Actualmente tu preset "demo-hub" está configurado como **Unsigned**, pero necesitas cambiarlo a **Signed** para que funcione con las credenciales de API.

## Pasos para Arreglar (2 minutos)

1. Ve a tu dashboard de Cloudinary: https://console.cloudinary.com/

2. Navega a: **Settings** → **Upload** → **Upload presets**

3. Busca el preset llamado **"demo-hub"**

4. Haz clic en **"demo-hub"** para editarlo

5. Cambia el **Signing Mode** de `Unsigned` a `Signed`

6. Guarda los cambios

## ¿Por qué es necesario?

- **Unsigned uploads**: No requieren autenticación, cualquiera puede subir archivos
- **Signed uploads**: Requieren API key y secret, más seguro
- Tu cuenta está configurada para requerir presets en todos los uploads
- El código ahora usa el preset "demo-hub" con autenticación (signed mode)

## Verificar que funciona

Una vez que cambies el preset a Signed:
1. El deploy actual ya tiene el código actualizado
2. Intenta subir una imagen en producción
3. Debería funcionar sin errores

## Alternativa (si no quieres cambiar el preset)

Si prefieres crear un preset nuevo:
1. Crea un nuevo preset llamado "demo-hub-signed"
2. Configúralo como **Signed**
3. Actualiza el código en `/lib/storage/cloudinary.ts` línea 50:
   ```typescript
   upload_preset: "demo-hub-signed",
   ```
