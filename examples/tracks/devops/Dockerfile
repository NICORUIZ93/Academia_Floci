# Docker — imágenes y buenas prácticas (Módulo 2): build multi-stage para una
# API Node.js — la imagen final no incluye devDependencies ni el código fuente
# de TypeScript, solo el JavaScript compilado y las dependencias de producción.

# --- Stage 1: build ---
FROM node:20-alpine AS build
WORKDIR /app

# Copiar solo los manifiestos primero: Docker cachea esta capa y solo la
# invalida (reinstala dependencias) cuando package*.json cambia, no en cada
# cambio de código fuente.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: producción ---
FROM node:20-alpine AS production
WORKDIR /app

# --omit=dev evita instalar devDependencies (linters, bundlers, tipos) que la
# imagen final no necesita para ejecutar la app.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Solo se copia el resultado del build del stage anterior, no el código fuente
# completo ni node_modules de desarrollo — la imagen final es mucho más pequeña.
COPY --from=build /app/dist ./dist

# Ejecutar como usuario sin privilegios, no como root — principio de mínimo
# privilegio también dentro del contenedor.
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]
