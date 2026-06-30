## Dockerfile multi-stage

```dockerfile
# Etapa 1: build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: producción
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
HEALTHCHECK CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1))"
CMD ["node", "dist/index.js"]
```

La imagen final solo contiene dependencias de producción y el código ya compilado — nada de devDependencies, código fuente sin compilar, ni herramientas de build.

## Variables de entorno por ambiente

```bash
# .env.production
DATABASE_URL=postgres://prod-host/db
LOG_LEVEL=info

# .env.development
DATABASE_URL=postgres://localhost/db
LOG_LEVEL=debug
```

Nunca hardcodees configuración que cambia entre entornos — el contenedor debe ser idéntico en todos los entornos, solo cambian las variables que recibe.

## PM2 vs contenedores

PM2 gestiona procesos Node directamente sobre un servidor (reinicio automático, logs, clustering). En un mundo con contenedores y orquestadores (Docker/Kubernetes), esas responsabilidades las asume el orquestador — `restart: always` en Kubernetes reemplaza gran parte de lo que PM2 hacía antes.

## Zero-downtime deploys

Con al menos dos instancias detrás de un balanceador, actualiza una instancia a la vez: espera a que la nueva pase su healthcheck antes de retirar tráfico de la anterior (rolling update) — los usuarios nunca ven una caída.
