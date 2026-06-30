## Spring Initializr

[start.spring.io](https://start.spring.io) genera la estructura base eligiendo starters (web, data-jpa, security, etc.) — cada starter trae el set de dependencias necesarias preconfiguradas.

## application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app
server:
  port: 8080
```

YAML es más legible que `.properties` para configuración anidada, aunque ambos formatos son válidos y Spring Boot los soporta indistintamente.

## Perfiles

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app_dev
```

```bash
java -jar app.jar --spring.profiles.active=dev
```

Cada perfil sobreescribe solo los valores que define, manteniendo el resto del `application.yml` base.

## Estructura por capas

```
src/main/java/com/miapp/
  controller/   ← recibe HTTP, traduce a/desde DTOs
  service/      ← lógica de negocio, sin saber nada de HTTP
  repository/   ← acceso a datos vía Spring Data JPA
  dto/
  entity/
```
