/**
 * Envuelve HTML fragmentado en un documento HTML completo con Tailwind CSS
 * Para que los demos HTML se rendericen correctamente en iframes
 */
export function wrapHTMLContent(htmlFragment: string): string {
  // Si el HTML ya tiene DOCTYPE, asumimos que está completo
  if (htmlFragment.trim().toLowerCase().startsWith('<!doctype')) {
    return htmlFragment;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo</title>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Configuración de Tailwind -->
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            charcoal: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a',
              950: '#020617',
            }
          }
        }
      }
    }
  </script>

  <style>
    body {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    *, *::before, *::after {
      box-sizing: inherit;
    }
  </style>
</head>
<body>
${htmlFragment}
</body>
</html>`;
}
