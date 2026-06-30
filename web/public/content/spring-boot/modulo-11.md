## Dockerfile por capas

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/dependency/ ./
COPY target/classes/ ./
ENTRYPOINT ["java", "-cp", ".", "com.miapp.Main"]
```

Spring Boot soporta empaquetado por capas (`spring-boot:build-image`) que separa dependencias (cambian poco) del código de la app (cambia en cada commit) — así Docker solo necesita re-subir la capa de código en cada deploy, no el JAR completo.

## GraalVM native image

```bash
./mvnw -Pnative native:compile
./target/mi-app   # arranca en milisegundos, no segundos
```

Compila la app a un binario nativo en vez de bytecode JVM — arranque casi instantáneo y menor footprint de memoria, a cambio de un build más lento y algunas limitaciones (reflection requiere configuración explícita).

## Variables de entorno en producción

```bash
docker run -e SPRING_PROFILES_ACTIVE=prod -e DATABASE_URL=$DB_URL mi-app
```

## Health checks para Kubernetes

```yaml
livenessProbe: { httpGet: { path: /actuator/health/liveness, port: 8080 } }
readinessProbe: { httpGet: { path: /actuator/health/readiness, port: 8080 } }
```
