# Multi-stage build optimizado para producción - Imagen mínima
FROM node:20-alpine AS base

# Instalar solo dependencias de runtime necesarias
RUN apk add --no-cache libc6-compat

# Etapa 1: Instalar dependencias (todas, para build)
FROM base AS deps
WORKDIR /app

# Copiar solo archivos de dependencias para mejor cache
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (dev + prod) para el build
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Etapa 2: Build de la aplicación
FROM base AS builder
WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Copiar código fuente
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build optimizado
RUN npm run build && \
    npm prune --production && \
    rm -rf .next/cache

# Etapa 3: Imagen final mínima
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Instalar solo wget para healthcheck (mínimo necesario)
RUN apk add --no-cache wget && \
    rm -rf /var/cache/apk/*

# Copiar solo archivos necesarios para runtime
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Limpiar archivos innecesarios
RUN rm -rf /tmp/* /var/tmp/*

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck optimizado
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

