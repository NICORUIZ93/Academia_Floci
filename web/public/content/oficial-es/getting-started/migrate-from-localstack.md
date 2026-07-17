# Migrar desde LocalStack

Floci es un reemplazo directo para la comunidad LocalStack. El protocolo de conexión, el puerto, las credenciales y la configuración de SDK son idénticos, por lo que la mayoría de las migraciones solo requieren un intercambio de imágenes. Esta página documenta cada cambio y proporciona un modo de compatibilidad para proyectos que necesitan una transición más suave.

## Modo de compatibilidad

La traducción de variables de entorno LocalStack está **activada de forma predeterminada**. Floci asigna automáticamente las variables LocalStack a sus equivalentes Floci al inicio, para que pueda mantener sus variables de entorno existentes sin cambios:

```yaml title="docker-compose.yml"
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
    environment:
      # These LocalStack vars are automatically translated — no extra config needed:
      PERSISTENCE: "1"                      # → FLOCI_STORAGE_MODE=persistent
      LOCALSTACK_HOST: floci                # → FLOCI_HOSTNAME=floci
      LAMBDA_DOCKER_NETWORK: mynet          # → FLOCI_SERVICES_LAMBDA_DOCKER_NETWORK=mynet
      LAMBDA_REMOVE_CONTAINERS: "1"         # → FLOCI_SERVICES_LAMBDA_EPHEMERAL=true
      DEBUG: "1"                            # → QUARKUS_LOG_LEVEL=DEBUG
```

Las variables Floci establecidas explícitamente siempre ganan: la traducción solo completa los valores que no se han establecido. Para deshabilitar la traducción por completo, configure `LOCALSTACK_PARITY=false`.

A menos que la paridad esté deshabilitada, el registro de inicio también termina con una línea `Ready.` estilo LocalStack (además del propio banner de Floci), por lo que las herramientas que observan el registro del contenedor para detectar el mensaje de preparación de LocalStack, como la estrategia de espera predeterminada de `LocalStackContainer` de Testcontainers, funcionan sin una espera personalizada.

## Migración paso a paso

### 1 — Cambiar la imagen

Elija la variante que se adapte a sus necesidades:

```yaml title="docker-compose.yml"
# Before
image: localstack/localstack

# After — no init scripts, or init scripts that don't call aws / boto3
image: floci/floci:latest

# After — init scripts that use aws CLI or boto3 (AWS CLI + Python 3 + boto3 pre-installed)
image: floci/floci:latest-compat
```

Para fijar una versión específica, reemplace `latest` / `latest-compat` con una etiqueta de versión:

```yaml
image: floci/floci:1.5.11
image: floci/floci:1.5.11-compat
```

El puerto (`4566`), las credenciales (`test` / `test`) y la configuración de AWS SDK no cambian.

### 2: variables de entorno del mapa

| Variable LocalStack | Equivalente Floci | Notas |
|---|---|---|
| `LOCALSTACK_HOST` | `FLOCI_HOSTNAME` | Nombre de host incrustado en las URL de respuesta |
| `LOCALSTACK_HOSTNAME` | `FLOCI_HOSTNAME` | Alias: mismo efecto |
| `PERSISTENCE=1` | `FLOCI_STORAGE_MODE=persistent` | Habilitar la persistencia del disco |
| `PERSIST_STATE=1` | `FLOCI_STORAGE_MODE=persistent` | Alias ​​para `PERSISTENCE` — mismo efecto |
| `EDGE_PORT` | `FLOCI_PORT` | Anulación de puerto de enlace |
| `GATEWAY_LISTEN` | `QUARKUS_HTTP_HOST` | Anulación de dirección de enlace |
| `LS_LOG` / `DEBUG=1` | `QUARKUS_LOG_LEVEL` | Verbosidad del registro |
| `DOCKER_HOST` | `FLOCI_DOCKER_DOCKER_HOST` | Ruta del socket del demonio Docker o dirección TCP |
| `LAMBDA_DOCKER_NETWORK` | `FLOCI_SERVICES_LAMBDA_DOCKER_NETWORK` | Red para contenedores Lambda |
| `DOCKER_NETWORK` | `FLOCI_SERVICES_DOCKER_NETWORK` | Red para todos los contenedores generados |
| `LAMBDA_REMOVE_CONTAINERS=1` | `FLOCI_SERVICES_LAMBDA_EPHEMERAL=true` | Eliminar contenedores Lambda después de la invocación |
| `USE_SSL=1` | `FLOCI_TLS_ENABLED=true` | Habilite TLS/HTTPS: consulte [TLS / HTTPS](../configuration/tls.md) |
| `CUSTOM_SSL_CERT_PATH` | `FLOCI_TLS_CERT_PATH` + `FLOCI_TLS_KEY_PATH` | LocalStack acepta un único PEM combinado; Floci lo acepta en ambos campos |
| `SERVICES` | _(no es necesario)_ | Floci inicia los 58 servicios al instante; no se requiere selección |
| `LAMBDA_EXECUTOR` | _(no es necesario)_ | Floci siempre ejecuta Lambda en contenedores Docker |
| `LAMBDA_REMOTE_DOCKER` | _(no compatible)_ | Utilice `S3Bucket=hot-reload` por función en su lugar; consulte [Lambda](../services/lambda.md) |

### 3: scripts de inicio (no se requieren cambios)

Los scripts de inicio de LocalStack montados en `/etc/localstack/init/` se ejecutan sin cambios en Floci:

```yaml title="docker-compose.yml"
volumes:
  - ./init/ready.d:/etc/localstack/init/ready.d:ro  # works as-is
```

Floci lee tanto `/etc/localstack/init/` (compatible) como `/etc/floci/init/` (nativo). Cuando existe el mismo nombre de archivo en ambos, la copia Floci tiene prioridad.

Para utilizar rutas nativas Floci en el futuro:

```yaml title="docker-compose.yml"
volumes:
  - ./init/ready.d:/etc/floci/init/ready.d:ro
```

Consulte [Ganchos de inicialización] (../configuration/initialization-hooks.md) para conocer el ciclo de vida completo de cuatro fases (`boot`, `start`, `ready`, `stop`) y detalles del tipo de script (`.sh`, `.py`).

### 4: herramientas de script de inicio (imagen compatible)

Si sus scripts de inicio llaman a `aws` o `boto3`, cambie de `localstack/localstack` a `floci/floci:latest-compat`:

```yaml title="docker-compose.yml"
# Before
image: localstack/localstack

# After (includes Python 3, AWS CLI, boto3 — pre-configured for localhost:4566)
image: floci/floci:latest-compat
```

La imagen de compatibilidad preconfigura AWS CLI para comunicarse con `http://localhost:4566`; no se necesita ningún indicador `--endpoint-url` en los scripts:

```sh
# !/bin/sh
aws sqs create-queue --queue-name orders    # no --endpoint-url needed
aws s3 mb s3://assets
```

### 5: puntos finales de salud y estado

Floci sirve al punto final de estado compatible con LocalStack en ambas rutas:

```
GET /_localstack/init   # LocalStack compat path — still works
GET /_floci/init        # native path
```

Si espera a `/_localstack/init` o `/_localstack/health` en CI o scripts, no es necesario ningún cambio.

### 6 — Puntos finales de inspección

| Punto final | Notas |
|---|---|
| `GET /_aws/ses` | Correos electrónicos capturados: idénticos |
| `GET /_aws/ses?id=<id>` | Mensaje único: idéntico |
| `DELETE /_aws/ses` | Borrar buzón — idéntico |
| `GET /_aws/sqs/messages?QueueUrl=<url>` | Vistazo de cola no destructivo: idéntico |
| `DELETE /_aws/sqs/messages?QueueUrl=<url>` | Cola de purga: idéntica |

### 7 — Testcontainers

=== "Java"

    Reemplace el módulo `@LocalStackContainer` por el módulo Floci:

    ```xml title="pom.xml"
    <!-- Before -->
    <dependency>
      <groupId>org.testcontainers</groupId>
      <artifactId>localstack</artifactId>
      <scope>test</scope>
    </dependency>

    <!-- After -->
    <dependency>
      <groupId>io.github.hectorvent</groupId>
      <artifactId>floci-testcontainers</artifactId>
      <version>LATEST</version>
      <scope>test</scope>
    </dependency>
    ```

    Consulte la [guía Java Testcontainers](../testcontainers/java.md) para una configuración completa.

=== "Python"

    Consulte la [guía Python Testcontainers] (../testcontainers/python.md).

=== "Node.js"

    Consulte la [guía Node.js Testcontainers] (../testcontainers/nodejs.md).

=== "Go"

    Consulte la [guía Go Testcontainers] (../testcontainers/go.md).

## Ejemplo completo de antes/después

```yaml title="docker-compose.yml (before — LocalStack)"
services:
  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      LOCALSTACK_HOST: localstack
      PERSISTENCE: "1"
      LAMBDA_DOCKER_NETWORK: myapp_default
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./data:/var/lib/localstack
      - ./init/ready.d:/etc/localstack/init/ready.d:ro
```

```yaml title="docker-compose.yml (after — Floci, minimal change)"
services:
  floci:
    image: floci/floci:latest-compat  # (1)
    ports:
      - "4566:4566"
    environment:
      LOCALSTACK_HOST: floci          # translated automatically — no rename needed
      PERSISTENCE: "1"
      LAMBDA_DOCKER_NETWORK: myapp_default
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./data:/app/data              # (2)
      - ./init/ready.d:/etc/localstack/init/ready.d:ro  # compat path — unchanged
```

1. Cambie a `latest-compat` si sus scripts de inicio usan `aws` o `boto3`.
2. LocalStack almacena datos en `/var/lib/localstack`; Floci utiliza `/app/data`.

## S3 DNS de estilo alojado virtual

Si utiliza el DNS comodín público de LocalStack (`*.s3.localhost.localstack.cloud`) para el direccionamiento de estilo de alojamiento virtual S3, Floci lo admite sin ningún cambio:

```java
// This LocalStack endpoint works unchanged with Floci
S3Client s3 = S3Client.builder()
    .endpointOverride(URI.create("http://s3.localhost.localstack.cloud:4566"))
    .build();
// SDK sends to: my-bucket.s3.localhost.localstack.cloud:4566 → Floci
```

Floci también registra sus propios dominios DNS comodín para el estilo de alojamiento virtual:

| Dominio | Uso |
|---|---|
| `*.s3.localhost.floci.io` | Estilo alojado virtual S3 (`bucket.s3.localhost.floci.io`) |
| `*.localhost.floci.io` | Estilo de subdominio directo (`bucket.localhost.floci.io`) |

La resolución de DNS funciona de manera diferente dependiendo de dónde se ejecuta el cliente:

**Desde la máquina host**: tanto `*.localhost.localstack.cloud` como `*.localhost.floci.io` están registrados en DNS público y se resuelven en `127.0.0.1`. Las solicitudes llegan a Floci a través del enlace del puerto Docker (`4566:4566`) sin configuración adicional.

**Desde el interior de un contenedor Docker**: `127.0.0.1` es el loopback del contenedor, no Floci. El servidor DNS integrado de Floci maneja esto: resuelve `*.localhost.floci.io` y `*.localhost.localstack.cloud` (y los subdominios `*.localhost.localstack.cloud`) en la IP del contenedor de Floci en la red Docker. Los contenedores generados (Lambda, RDS, ElastiCache) se configuran automáticamente para usar Floci como su resolución de DNS, por lo que las URL de S3 alojadas virtualmente funcionan dentro de ellos sin ninguna configuración adicional.

Consulte [S3 → Estilo alojado virtual](../services/s3.md#virtual-hosted-style) para obtener detalles completos y ejemplos de SDK.

## Lo que sigue igual

- Puerto `4566`
- Todas las llamadas AWS SDK y CLI: sin cambios de código
- Credenciales ficticias (`test` / `test`)
- Scripts de inicio en `/etc/localstack/init/` (rutas de compatibilidad)
- Puntos finales `/_localstack/init` y `/_localstack/health`
- Puntos finales de inspección `/_aws/ses` y `/_aws/sqs/messages`
- Montaje de zócalo Docker para Lambda, RDS y ElastiCache

## Diferencias conocidas

| Área | LocalStack | Floci |
|---|---|---|
| Ejecutor Lambda | Configurable (`LAMBDA_EXECUTOR`) | Siempre contenedores Docker |
| `LAMBDA_REMOTE_DOCKER` | Apoyado | No compatible: utilice `S3Bucket=hot-reload` por función en su lugar |
| Selección de servicios | `SERVICES=sqs,s3,...` | Los 58 servicios se inician automáticamente; sin selección |
| Directorio de datos | `/var/lib/localstack` | `/app/data` |
| Variable de registro | `LS_LOG` / `DEBUG` | `QUARKUS_LOG_LEVEL` |
