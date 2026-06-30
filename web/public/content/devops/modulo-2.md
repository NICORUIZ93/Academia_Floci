## Dockerfile multi-stage

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/index.js"]
```

## Capas y cache

Docker cachea cada instrucción como una capa. Copiar `package.json` ANTES que el resto del código permite que `npm ci` se cachee mientras solo cambies código fuente — reordenar mal las instrucciones invalida el cache en cada build.

## Imágenes base

`alpine` (≈5MB) y `distroless` (sin shell, sin gestor de paquetes) reducen drásticamente el tamaño de imagen y la superficie de ataque comparado con una base completa de Ubuntu/Debian.

## Volúmenes vs bind mounts

```bash
docker run -v datos_app:/data mi-imagen          # volumen gestionado por Docker
docker run -v $(pwd)/src:/app/src mi-imagen       # bind mount: carpeta del host
```

Los volúmenes son la opción recomendada para persistencia en producción; los bind mounts son ideales en desarrollo para reflejar cambios de código en vivo.
