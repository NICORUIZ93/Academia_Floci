## docker-compose.yml completo

```yaml
services:
  app:
    build: .
    environment:
      DATABASE_URL: postgres://db:5432/app
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10
  cache:
    image: redis:7
```

`depends_on` con `condition: service_healthy` espera a que el healthcheck pase, no solo a que el contenedor arranque — evita que `app` intente conectarse antes de que `db` esté realmente lista.

## Redes y descubrimiento de servicios

Dentro de la red interna que Compose crea automáticamente, cada servicio resuelve a los demás **por su nombre** (`db`, `cache`) — sin IPs hardcodeadas, sin configuración DNS manual.

## Variables de entorno

```bash
# .env
POSTGRES_PASSWORD=secreto
```

```yaml
environment:
  DATABASE_PASSWORD: ${POSTGRES_PASSWORD}
```

## Perfiles

```yaml
services:
  herramienta-debug:
    profiles: ["debug"]
```

```bash
docker compose --profile debug up   # solo levanta herramienta-debug si se pide explícitamente
```
