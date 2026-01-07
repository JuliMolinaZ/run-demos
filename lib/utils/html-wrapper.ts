/**
 * Limpia el HTML removiendo líneas en blanco excesivas y espacios innecesarios
 */
function cleanHTML(html: string): string {
  return html
    // Remover líneas completamente vacías (solo espacios/tabs)
    .replace(/^\s*[\r\n]/gm, '')
    // Remover múltiples líneas en blanco consecutivas
    .replace(/(\r?\n){3,}/g, '\n\n')
    // Remover espacios en blanco al final de las líneas
    .replace(/[ \t]+$/gm, '')
    // Trim general
    .trim();
}

/**
 * Envuelve HTML fragmentado en un documento HTML completo con Tailwind CSS
 * Para que los demos HTML se rendericen correctamente en iframes
 */
export function wrapHTMLContent(htmlFragment: string): string {
  // Si el HTML ya tiene DOCTYPE, asumimos que está completo
  if (htmlFragment.trim().toLowerCase().startsWith('<!doctype')) {
    return htmlFragment;
  }

  // Limpiar HTML antes de envolver
  const cleanedHTML = cleanHTML(htmlFragment);

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
    /* Reset completo y estilos base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Clases personalizadas comunes */
    .container {
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    @media (min-width: 640px) {
      .container {
        max-width: 640px;
      }
    }

    @media (min-width: 768px) {
      .container {
        max-width: 768px;
      }
    }

    @media (min-width: 1024px) {
      .container {
        max-width: 1024px;
      }
    }

    @media (min-width: 1280px) {
      .container {
        max-width: 1280px;
      }
    }

    @media (min-width: 1536px) {
      .container {
        max-width: 1536px;
      }
    }

    /* Clases comunes para demos */
    .yard-slot {
      min-height: 60px;
      border: 2px solid;
      transition: all 0.2s ease;
    }

    .yard-slot:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* Animaciones */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    /* Evitar saltos de línea innecesarios */
    p:empty, div:empty:not(.yard-slot):not([class*="h-"]):not([class*="w-"]) {
      display: none;
    }

    /* Mejores defaults para imágenes */
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
${cleanedHTML}
</body>
</html>`;
}
