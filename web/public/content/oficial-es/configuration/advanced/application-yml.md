# application.yml Referencia

!!! nota "Solo compilaciones de origen"
    Esta página es para usuarios que construyen Floci desde el código fuente o montan un `application.yml` personalizado en el contenedor. **Si ejecuta la imagen Docker publicada, no necesita este archivo**: todas las configuraciones se configuran a través de las variables de entorno `FLOCI_*`. Consulte la [Referencia de variables de entorno](../environment-variables.md) para obtener la lista completa.

Todas las configuraciones se pueden proporcionar como YAML (en `src/main/resources/application.yml` o montarse como un archivo de configuración) o anularse mediante variables de entorno utilizando el prefijo `FLOCI_` con puntos y guiones reemplazados por guiones bajos.

## Configuración de URL

Floci genera URL absolutas para ciertos campos de respuesta (URL de cola SQS, SNS
puntos finales de suscripción, URL S3 prefirmadas). Dos configuraciones controlan el nombre de host
incrustado en esas URL:

| Configuración | Variable ambiental | Predeterminado | Descripción |
|---|---|---|---|
| `floci.base-url` | `FLOCI_BASE_URL` | `http://localhost:4566` | URL base completa utilizada para crear URL de respuesta. Cambie el esquema, el host y el puerto juntos. |
| `floci.hostname` | `FLOCI_HOSTNAME` | _(ninguno)_ | Anule solo el nombre de host en `base-url`. Útil en Docker Redactar donde no se puede acceder a `localhost` desde otros contenedores. |

Cuando se configura `floci.hostname`, reemplaza solo la parte del host de `base-url`,
dejando el esquema y el puerto sin cambios. La configuración de `FLOCI_HOSTNAME: floci` es
equivalente a cambiar `base-url` de `http://localhost:4566` a
`http://floci:4566`.

**Ejemplo: Docker Configuración de composición de contenedores múltiples:**

```yaml
environment:
  FLOCI_HOSTNAME: floci   # matches the compose service name
```

Consulte [Docker Compose — Redes de múltiples contenedores](../docker-compose.md#multi-container-networking) para ver un ejemplo completo.

## Referencia completa

El bloque a continuación refleja `src/main/resources/application.yml`, es el conjunto efectivo de claves con el que se entrega Floci. Algunas claves admitidas se omiten aquí (por ejemplo, `floci.init-hooks.*`), pero aún se pueden proporcionar a través de YAML o variables de entorno.

```yaml
floci:
  max-request-size: 512              # Max HTTP request body size in MB
  base-url: "http://localhost:4566"  # Used to build response URLs (SQS QueueUrl, SNS endpoints, etc.)
  # hostname: ""                     # When set, overrides the host in base-url for multi-container Docker
  default-region: us-east-1
  default-account-id: "000000000000"

  storage:
    mode: memory                      # memory | persistent | hybrid | wal
    persistent-path: ./data
    wal:
      compaction-interval-ms: 30000
    services:
      ssm:
        flush-interval-ms: 5000
      dynamodb:
        flush-interval-ms: 5000
      sns:
        flush-interval-ms: 5000
      lambda:
        flush-interval-ms: 5000
      cloudwatchlogs:
        flush-interval-ms: 5000
      cloudwatchmetrics:
        flush-interval-ms: 5000
      secretsmanager:
        flush-interval-ms: 5000
      acm:
        flush-interval-ms: 5000
      opensearch:
        flush-interval-ms: 5000

  dns:
    # Extra hostname suffixes resolved to Floci's container IP by the embedded DNS server.
    # The primary suffix (floci.hostname or derived from base-url) is always included.
    # Useful when migrating from LocalStack — Lambda functions that hardcode
    # localhost.localstack.cloud as their endpoint work without code changes.
    # Via env var (comma-separated): FLOCI_DNS_EXTRA_SUFFIXES=localhost.localstack.cloud,other.internal
    # extra-suffixes:
    #   - localhost.localstack.cloud

  auth:
    validate-signatures: false               # Set to true to enforce AWS SigV4 validation
    presign-secret: local-emulator-secret    # HMAC secret for S3 pre-signed URL verification

  tls:
    enabled: false                           # FLOCI_TLS_ENABLED — enable HTTPS on all endpoints
    # cert-path: ""                          # FLOCI_TLS_CERT_PATH — PEM certificate file path
    # key-path: ""                           # FLOCI_TLS_KEY_PATH — PEM private key file path
    self-signed: true                        # FLOCI_TLS_SELF_SIGNED — auto-generate cert when no paths provided

  docker:
    log-max-size: "10m"                      # Max size per container log file before rotation
    log-max-file: "3"                        # Number of rotated log files to retain
    docker-host: unix:///var/run/docker.sock # Docker daemon socket (shared by Lambda, RDS, ElastiCache)
    docker-config-path: ""                   # Path to dir containing Docker's config.json (e.g. /root/.docker)
    registry-credentials: []                 # Per-registry explicit credentials for private registries

  services:
    ssm:
      enabled: true
      max-parameter-history: 5               # Max versions kept per parameter

    sqs:
      enabled: true
      default-visibility-timeout: 30         # Seconds
      max-message-size: 262144               # Bytes (256 KB)
      clear-fifo-deduplication-cache-on-purge: false  # When true, PurgeQueue clears SQS FIFO dedup and SNS FIFO topic dedup for topics subscribed to that queue

    s3:
      enabled: true
      default-presign-expiry-seconds: 3600

    dynamodb:
      enabled: true

    sns:
      enabled: true

    lambda:
      enabled: true
      ephemeral: false                        # true = remove container after each invocation
      default-memory-mb: 128
      default-timeout-seconds: 3
      runtime-api-base-port: 9200             # Port range for Lambda Runtime API
      runtime-api-max-port: 9299
      code-path: ./data/lambda-code           # Where ZIP archives are stored
      poll-interval-ms: 1000
      container-idle-timeout-seconds: 300     # Remove idle containers after this
      region-concurrency-limit: 1000          # Concurrent executions ceiling per region
      unreserved-concurrency-min: 100         # Minimum unreserved capacity PutFunctionConcurrency must leave
      hot-reload:
        enabled: false                        # true = enable bind-mount hot-reload via S3Bucket=hot-reload
        # allowed-paths:                      # Optional allowlist of host paths that may be bind-mounted
        #   - /home/user/projects
        #   - /tmp

    apigateway:
      enabled: true

    apigatewayv2:
      enabled: true

    iam:
      enabled: true
      enforcement-enabled: false        # Set to true to enforce IAM policies on all requests

    elasticache:
      enabled: true
      proxy-base-port: 6379
      proxy-max-port: 6399
      default-image: "valkey/valkey:8"

    rds:
      enabled: true
      proxy-base-port: 7001
      proxy-max-port: 7099
      default-postgres-image: "postgres:16-alpine"
      default-mysql-image: "mysql:8.0"
      default-mariadb-image: "mariadb:11"

    eventbridge:
      enabled: true

    scheduler:
      enabled: true

    cloudwatchlogs:
      enabled: true
      max-events-per-query: 10000

    cloudwatchmetrics:
      enabled: true

    secretsmanager:
      enabled: true
      default-recovery-window-days: 30

    kinesis:
      enabled: true

    kms:
      enabled: true

    cognito:
      enabled: true

    stepfunctions:
      enabled: true

    cloudformation:
      enabled: true

    acm:
      enabled: true
      validation-wait-seconds: 0              # Seconds before transitioning PENDING_VALIDATION → ISSUED

    ses:
      enabled: true
      # smtp-host: mailpit                       # SMTP server for email relay (empty = store only)
      # smtp-port: 1025
      # smtp-user: ""
      # smtp-pass: ""
      # smtp-starttls: DISABLED                  # DISABLED, OPTIONAL, or REQUIRED

    opensearch:
      enabled: true
      mock: false                             # true = metadata only, no Docker (useful for CI)
      default-image: "opensearchproject/opensearch:2"
      proxy-base-port: 9400
      proxy-max-port: 9499
      keep-running-on-shutdown: false         # leave containers running after Floci stops
      # docker network is inherited from floci.services.docker-network

    ec2:
      enabled: true

    ecs:
      enabled: true
      mock: false                             # true = tasks go to RUNNING without Docker (useful for CI)

    appconfig:
      enabled: true

    appconfigdata:
      enabled: true

    ecr:
      enabled: true
      registry-image: "registry:2"
      registry-container-name: floci-ecr-registry
      registry-base-port: 5100
      registry-max-port: 5199
      data-path: ./data/ecr
      tls-enabled: false
      keep-running-on-shutdown: true
      uri-style: hostname                     # hostname | path
```

### Ganchos de inicialización

`floci.init-hooks.*` se acepta como anulación, pero no se declara en el `application.yml` enviado. Consulte [Ganchos de inicialización](../initialization-hooks.md) para obtener la lista completa de claves (`shell-executable`, `timeout-seconds`, `shutdown-grace-period-seconds`) y sus valores predeterminados.

## Límites del servicio

Todas las claves de esta tabla se declaran en `EmulatorConfig` y aceptan anulaciones de variables de entorno mediante el prefijo `FLOCI_`.

| Variables | Predeterminado | Descripción |
|----------------------------------------------|------------------|---------------------------------------------------------------|
| `FLOCI_MAX_REQUEST_SIZE` | `512` | Tamaño máximo del cuerpo de solicitud HTTP en MB |
| `FLOCI_DEFAULT_REGION` | `us-east-1` | Región AWS predeterminada utilizada en ARN y URL de respuesta |
| `FLOCI_DEFAULT_AVAILABILITY_ZONE` | `us-east-1a` | AZ predeterminado informado por EC2, RDS y otros servicios compatibles con AZ |
| `FLOCI_DEFAULT_ACCOUNT_ID` | `000000000000` | ID de cuenta AWS predeterminado utilizado en los ARN |
| `FLOCI_ECR_BASE_URI` | `public.ecr.aws` | URI base utilizada al extraer imágenes de contenedor (por ejemplo, Lambda) |
| `FLOCI_DNS_EXTRA_SUFFIXES` | *(desarmado)* | Los sufijos de nombre de host adicionales separados por comas que el servidor DNS integrado resuelven en la IP del contenedor de Floci. P.ej. `localhost.localstack.cloud,localhost.example.internal` |
| `FLOCI_SERVICES_SSM_MAX_PARAMETER_HISTORY` | `5` | Se mantienen las versiones máximas de parámetros |
| `FLOCI_SERVICES_SQS_DEFAULT_VISIBILITY_TIMEOUT` | `30` | Tiempo de espera de visibilidad predeterminado (segundos) |
| `FLOCI_SERVICES_SQS_MAX_MESSAGE_SIZE` | `262144` | Tamaño máximo de mensaje (bytes) |
| `FLOCI_SERVICES_SQS_CLEAR_FIFO_DEDUPLICATION_CACHE_ON_PURGE` | `false` | Cuando `true`, `PurgeQueue` borra la caché de deduplicación de 5 minutos FIFO para la cola de destino y las entradas de deduplicación de temas FIFO de SNS coincidentes |
| `FLOCI_SERVICES_S3_DEFAULT_PRESIGN_EXPIRY_SECONDS` | `3600` | Caducidad de URL prefirmada |
| `FLOCI_SERVICES_DOCKER_NETWORK` | *(desarmado)* | Red compartida Docker para contenedores Lambda, RDS, ElastiCache |
| `FLOCI_SERVICES_ECS_MOCK` | `false` | Omitir Docker; tareas van directamente a EJECUTAR (útil para CI) |
| `FLOCI_SERVICES_ECS_DOCKER_NETWORK` | *(desarmado)* | Red Docker para contenedores de tareas ECS |
| `FLOCI_SERVICES_ECS_DEFAULT_MEMORY_MB` | `512` | Memoria predeterminada (MB) cuando la definición de tarea la omite |
| `FLOCI_SERVICES_ECS_DEFAULT_CPU_UNITS` | `256` | Unidades de CPU predeterminadas cuando la definición de tarea las omite |
| `FLOCI_SERVICES_IAM_ENFORCEMENT_ENABLED` | `false` | Aplique políticas basadas en identidad IAM en cada solicitud cuando `true` |
| `FLOCI_SERVICES_OPENSEARCH_MOCK` | `false` | Omitir Docker; los dominios aparecen activos inmediatamente (útil para CI) |
| `FLOCI_SERVICES_OPENSEARCH_KEEP_RUNNING_ON_SHUTDOWN` | `false` | Deje los contenedores OpenSearch ejecutándose después de que se detenga Floci |
| `FLOCI_SERVICES_SES_SMTP_HOST` | *(desarmado)* | Host del servidor SMTP para retransmisión de correo electrónico SES (vacío = solo tienda) |
| `FLOCI_SERVICES_SES_SMTP_PORT` | `25` | Puerto del servidor SMTP |
| `FLOCI_SERVICES_SES_SMTP_USER` | *(desarmado)* | Nombre de usuario de autenticación SMTP |
| `FLOCI_SERVICES_SES_SMTP_PASS` | *(desarmado)* | Contraseña de autenticación SMTP |
| `FLOCI_SERVICES_SES_SMTP_STARTTLS` | `DISABLED` | Modo STARTTLS: `DISABLED`, `OPTIONAL` o `REQUIRED` |
| `FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ENABLED` | `false` | Habilite el modo de recarga en caliente de montaje vinculado (`S3Bucket=hot-reload`) |
| `FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ALLOWED_PATHS` | *(desarmado)* | Lista separada por comas de rutas de host permitidas como raíces de montaje enlazado; no establecido = cualquier ruta absoluta |

La política de redireccionamiento SQS por cola (`maxReceiveCount`) se configura en el momento de la creación de la cola a través de `SetQueueAttributes`/`CreateQueue`, no como un valor predeterminado global.

`FLOCI_DEFAULT_AVAILABILITY_ZONE` y `FLOCI_ECR_BASE_URI` se declaran en `EmulatorConfig` pero no en el `application.yml` enviado, por lo que caen a los valores de `@WithDefault` anteriores cuando no están configurados.

## Desactivación de servicios

Configure `enabled: false` para cualquier servicio que no necesite. Los servicios deshabilitados devuelven un `ServiceUnavailableException` en lugar de ignorar las llamadas silenciosamente.

```yaml
floci:
  services:
    cloudformation:
      enabled: false
    stepfunctions:
      enabled: false
```

A través de la variable de entorno: establezca en `false` para cualquier clave `FLOCI_SERVICES_<SERVICE>_ENABLED`. Consulte [Referencia de variables de entorno](../environment-variables.md#services-core) para obtener la lista completa.

## Registro de

Floci utiliza el [registro de Quarkus] estándar (https://quarkus.io/guides/logging). El nivel efectivo predeterminado es `INFO`. Cada servicio registra eventos a nivel de operación en `DEBUG` (ID y recursos de destino) y cargas útiles de solicitud/respuesta completas en `TRACE`, lo que resulta útil para diagnosticar fallas de pruebas basadas en TestContainers.

Floci se envía con `quarkus.log.min-level: TRACE`, por lo que elevar una sola categoría a `TRACE` es suficiente; No es necesario que cambies el nivel mínimo tú mismo.

**Habilite TRACE para un servicio mediante variables de entorno:**

```bash
# SQS: log SendMessage/ReceiveMessage/DeleteMessage bodies and attributes
QUARKUS_LOG_CATEGORY__IO_GITHUB_HECTORVENT_FLOCI_SERVICES_SQS__LEVEL=TRACE

# DynamoDB: log PutItem/GetItem/UpdateItem/DeleteItem items, Query/Scan counts
QUARKUS_LOG_CATEGORY__IO_GITHUB_HECTORVENT_FLOCI_SERVICES_DYNAMODB__LEVEL=TRACE
```

**O en `application.yml`:**

```yaml
quarkus:
  log:
    category:
      "io.github.hectorvent.floci.services.sqs":
        level: TRACE
      "io.github.hectorvent.floci.services.dynamodb":
        level: TRACE
```

**Ejemplo de TestContainers:**

```java
new GenericContainer<>("floci/floci:latest")
    .withExposedPorts(4566)
    .withEnv("QUARKUS_LOG_CATEGORY__IO_GITHUB_HECTORVENT_FLOCI_SERVICES_SQS__LEVEL", "TRACE");
```

La salida de TRACE incluye la carga útil junto con la línea DEBUG existente:

```
DEBUG [SqsService] Sent message aa7b93e7-... to queue .../events
TRACE [SqsService] Sent message aa7b93e7-... to queue .../events body={"eventType":"..."} attributes={source=okta}
```
