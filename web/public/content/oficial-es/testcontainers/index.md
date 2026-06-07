# Testcontainers

Floci tiene módulos Testcontainers de primera clase para todos los principales lenguajes SDK. Cada módulo inicia un contenedor Floci real antes de que se ejecuten las pruebas y lo desmantela después: sin demonio en ejecución, sin estado compartido, sin conflictos de puertos.

## Módulos disponibles

| Idioma | Paquete | Versión | Registro | Fuente |
|---|---|---|---|---|
| Java | `io.floci:testcontainers-floci` | `1.4.0` | [Central Maven](https://mvnrepository.com/artifact/io.floci/testcontainers-floci) | [GitHub](https://github.com/floci-io/testcontainers-floci) |
| Node.js | `@floci/testcontainers` | `0.1.0` | [npm](https://www.npmjs.com/package/@floci/testcontainers) | [GitHub](https://github.com/floci-io/testcontainers-floci-node) |
| Python | `testcontainers-floci` | `0.1.1` | [PyPI](https://pypi.org/project/testcontainers-floci/) | [GitHub](https://github.com/floci-io/testcontainers-floci-python) |
| Go | — | 🚧 En curso | — | [GitHub](https://github.com/floci-io/testcontainers-floci-go) |

## Cómo funciona

Cada módulo expone una clase `FlociContainer` que envuelve la imagen oficial `floci/floci:latest` Docker. Cuando el contenedor se inicia, espera a que el puerto 4566 esté listo y luego expone:

| Método | Devoluciones |
|---|---|
| `getEndpoint()` | `http://localhost:<mapped-port>` |
| `getRegion()` | `us-east-1` (predeterminado) |
| `getAccessKey()` | `test` |
| `getSecretKey()` | `test` |

Estos valores se pasan directamente a cualquier cliente AWS SDK, sin configuración manual ni variables de entorno.

## Guías de idiomas

- [Java](java.md) — JUnit 5, funda de resorte `@ServiceConnection`
- [Node.js / TypeScript](nodejs.md) — Jest, Vitest
- [Python](python.md) — pytest
- [Go](go.md) — en progreso
