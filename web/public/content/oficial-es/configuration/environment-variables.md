# Referencia de variables de entorno

Floci se configura exclusivamente mediante variables de entorno. Cada opción a continuación se asigna directamente a una variable `FLOCI_*`; no se necesita ningún archivo YAML cuando se ejecuta la imagen Docker publicada.

---

## Mundial

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_BASE_URL` | `http://localhost:4566` | URL base integrada en los campos de respuesta (SQS `QueueUrl`, URL prefirmadas, etc.) |
| `FLOCI_HOSTNAME` | _(ninguno)_ | Anula solo la parte del nombre de host de `FLOCI_BASE_URL`. Establezca el nombre del servicio de redacción (por ejemplo, `floci`) para que otros contenedores puedan acceder a Floci mediante DNS |
| `FLOCI_DEFAULT_REGION` | `us-east-1` | Región AWS utilizada en ARN y respuestas API |
| `FLOCI_DEFAULT_ACCOUNT_ID` | `000000000000` | ID de cuenta alternativa utilizado en los ARN cuando la clave de acceso de la solicitud no tiene exactamente 12 dígitos. Cuando la clave de acceso TIENE 12 dígitos, se utiliza directamente como ID de cuenta; consulte [Aislamiento de cuentas múltiples](./multi-account.md) |
| `FLOCI_DEFAULT_AVAILABILITY_ZONE` | `us-east-1a` | Zona de disponibilidad reportada en EC2 y otras respuestas |
| `FLOCI_MAX_REQUEST_SIZE` | `512` | Tamaño máximo del cuerpo de la solicitud HTTP en megabytes |
| `FLOCI_ECR_BASE_URI` | `public.ecr.aws` | URI base para referencias de imágenes públicas ECR |

---

## Autenticación

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_AUTH_VALIDATE_SIGNATURES` | `false` | Cuando `true`, verifica AWS Signature V4 en cada solicitud. Deja `false` para el desarrollo local |
| `FLOCI_AUTH_PRESIGN_SECRET` | `local-emulator-secret` | Secreto utilizado para firmar y verificar URL prefirmadas |

## Navegador CORS

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SECURITY_EXTRA_CORS_ALLOWED_ORIGINS` | _(ninguno)_ | Los orígenes del navegador separados por comas permitían llamar a Floci directamente. Alias: `EXTRA_CORS_ALLOWED_ORIGINS` |
| `FLOCI_SECURITY_EXTRA_CORS_ALLOWED_HEADERS` | _(ninguno)_ | Nombres de encabezado adicionales para incluir en `Access-Control-Allow-Headers`. Alias: `EXTRA_CORS_ALLOWED_HEADERS` |
| `FLOCI_SECURITY_EXTRA_CORS_EXPOSE_HEADERS` | _(ninguno)_ | Nombres de encabezado adicionales para incluir en `Access-Control-Expose-Headers`. Alias: `EXTRA_CORS_EXPOSE_HEADERS` |
| `FLOCI_SECURITY_DISABLE_CORS_HEADERS` | `false` | Deshabilite los encabezados de respuesta globales CORS de Floci. Alias: `DISABLE_CORS_HEADERS` |
| `FLOCI_SECURITY_CORS_ALLOW_PRIVATE_NETWORK` | `false` | Responda a las comprobaciones previas del acceso a la red privada con `Access-Control-Allow-Private-Network: true`, lo que permite que una página en un origen público/seguro llegue a este backend de loopback. Solo se aplica después de que el origen pase la lista de permitidos anterior. |

---

## TLS / HTTPS

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_TLS_ENABLED` | `false` | Habilite TLS/HTTPS en todos los puntos finales (HTTP permanece disponible simultáneamente) |
| `FLOCI_TLS_CERT_PATH` | _(ninguno)_ | Ruta a un archivo de certificado PEM. Cuando está configurado, desactiva la generación automática |
| `FLOCI_TLS_KEY_PATH` | _(ninguno)_ | Ruta a un archivo de clave privada PEM. Requerido cuando se configura `FLOCI_TLS_CERT_PATH` |
| `FLOCI_TLS_SELF_SIGNED` | `true` | Generar automáticamente y conservar un certificado autofirmado cuando no se proporcionan rutas de certificado/clave |

Consulte [TLS / HTTPS](./tls.md) para ver ejemplos de configuración de SDK y compatibilidad con WebSocket (`wss://`).

---

## Protocolos de cable

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_PROTOCOLS_STRICT_CLAIMING` | `false` | Rechace las solicitudes señaladas por RPC que ningún protocolo de conexión admitido afirme, según la [guía de selección de protocolo de conexión de Smithy] (https://smithy.io/2.0/guides/wire-protocol-selection.html) (por ejemplo, un valor de encabezado `Smithy-Protocol` desconocido o una solicitud `rpc-v2-json` no implementada). Cuando están deshabilitadas, dichas solicitudes se registran y pasan |

---

## Almacenamiento

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_STORAGE_MODE` | `memory` | Backend de almacenamiento global: `memory`, `persistent`, `hybrid` o `wal` |
| `FLOCI_STORAGE_PERSISTENT_PATH` | `./data` | Directorio del lado del contenedor para almacenamiento persistente e híbrido |
| `FLOCI_STORAGE_HOST_PERSISTENT_PATH` | `./data` | Ruta del lado host para montajes de enlace de volumen Docker (datos RDS, OpenSearch, MSK, ECR). Cuando no está configurado, Floci utiliza volúmenes Docker con nombre |
| `FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE` | `false` | Eliminar los volúmenes Docker con nombre inmediatamente cuando se elimine el recurso |
| `FLOCI_STORAGE_WAL_COMPACTION_INTERVAL_MS` | `30000` | Con qué frecuencia (ms) se ejecuta la compactación WAL. Sólo aplica cuando `FLOCI_STORAGE_MODE=wal` |

### Anulaciones de almacenamiento por servicio

Cada servicio puede anular el modo de almacenamiento global y el intervalo de descarga. Reemplace `<SERVICE>` con el nombre del servicio en mayúsculas:

```
FLOCI_STORAGE_SERVICES_<SERVICE>_MODE=hybrid
FLOCI_STORAGE_SERVICES_<SERVICE>_FLUSH_INTERVAL_MS=5000
```

Nombres de servicio disponibles: `SSM`, `SQS`, `S3`, `DYNAMODB`, `SNS`, `LAMBDA`, `CLOUDWATCHLOGS`, `CLOUDWATCHMETRICS`, `SECRETSMANAGER`, `ACM`, `OPENSEARCH`, `RDS`, `ELASTICACHE`, `APPCONFIG`, `APPCONFIGDATA`, `BACKUP`.

Consulte [Modos de almacenamiento](./storage.md) para obtener una explicación completa de cada modo.

---

## Docker Demonio

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_DOCKER_DOCKER_HOST` | `unix:///var/run/docker.sock` | Ruta del socket del demonio Docker o dirección TCP |
| `FLOCI_DOCKER_DOCKER_CONFIG_PATH` | _(ninguno)_ | Ruta a un directorio que contiene `config.json` de Docker para la autenticación del registro |
| `FLOCI_DOCKER_IMAGE_REGISTRY_BASE` | _(ninguno)_ | Base de registro/repositorio opcional para cada imagen Docker que se inicia Floci. Cuando se configura, `postgres:16-alpine` se resuelve como `<base>/postgres:16-alpine` y `public.ecr.aws/docker/library/ubuntu:24.04` se resuelve como `<base>/public.ecr.aws/docker/library/ubuntu:24.04` |
| `FLOCI_DOCKER_LOG_MAX_SIZE` | `10m` | Tamaño máximo de rotación de registros para contenedores generados (por ejemplo, `10m`, `1g`) |
| `FLOCI_DOCKER_LOG_MAX_FILE` | `3` | Número de archivos de registro rotados que se deben conservar para los contenedores generados |
| `FLOCI_DOCKER_RESOURCE_NAMESPACE` | _(ninguno)_ | Prefijo de espacio de nombres opcional para nombres de volúmenes y contenedores Docker secundarios administrados |

### Credenciales de registro

Proporcione credenciales para registros privados (por ejemplo, para imágenes base Lambda). Utilice índices incrementales (`0`, `1`, `2`,…) para múltiples registros:

| Variables | Descripción |
|---|---|
| `FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__SERVER` | Nombre de host del registro (por ejemplo, `ghcr.io`) |
| `FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__USERNAME` | Nombre de usuario del registro |
| `FLOCI_DOCKER_REGISTRY_CREDENTIALS_0__PASSWORD` | Contraseña o token de registro |

---

DNS##

El servidor DNS integrado de Floci siempre resuelve los siguientes sufijos comodín en la IP del contenedor de Floci; no se requiere configuración:

| Sufijo incorporado | Cubiertas |
|---|---|
| `localhost.floci.io` | `localhost.floci.io` y `*.localhost.floci.io` (por ejemplo, `my-bucket.s3.localhost.floci.io`) |
| `localhost.localstack.cloud` | `localhost.localstack.cloud` y `*.localhost.localstack.cloud` (por ejemplo, `my-bucket.s3.localhost.localstack.cloud`) |

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_DNS_EXTRA_SUFFIXES` | _(ninguno)_ | Lista separada por comas de sufijos de nombres de host adicionales para resolver en la IP del contenedor de Floci. Úselo para dominios personalizados además de los integrados anteriormente (por ejemplo, un sufijo interno privado). |

---

## Ganchos de inicialización

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_INIT_HOOKS_SHELL_EXECUTABLE` | `/bin/sh` | Shell utilizado para ejecutar scripts de enlace |
| `FLOCI_INIT_HOOKS_TIMEOUT_SECONDS` | `30` | Tiempo máximo que puede ejecutarse un script de enlace único |
| `FLOCI_INIT_HOOKS_SHUTDOWN_GRACE_PERIOD_SECONDS` | `2` | Tiempo permitido para que se completen los ganchos de parada durante el apagado |

Consulte [Ganchos de inicialización](./initialization-hooks.md) para conocer las fases del ciclo de vida y las convenciones de script.

---

Servicios ##: compartidos

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_DOCKER_NETWORK` | _(ninguno)_ | Nombre de red Docker utilizado por todos los servicios respaldados por contenedores (Lambda, RDS, ElastiCache, ECS, OpenSearch, EKS, MSK). Las anulaciones por servicio tienen prioridad |

---

Servicios ##: principales

### SSM (Almacén de parámetros)

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SSM_ENABLED` | `true` | Habilitar el servicio SSM |
| `FLOCI_SERVICES_SSM_MAX_PARAMETER_HISTORY` | `5` | Número máximo de versiones históricas conservadas por parámetro |

### SQS

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SQS_ENABLED` | `true` | Habilitar el servicio SQS |
| `FLOCI_SERVICES_SQS_DEFAULT_VISIBILITY_TIMEOUT` | `30` | Tiempo de espera de visibilidad de mensajes predeterminado en segundos |
| `FLOCI_SERVICES_SQS_MAX_MESSAGE_SIZE` | `1048576` | Tamaño máximo del cuerpo del mensaje en bytes (1 MB) |
| `FLOCI_SERVICES_SQS_CLEAR_FIFO_DEDUPLICATION_CACHE_ON_PURGE` | `false` | Restablecer la caché de deduplicación cuando se purga una cola FIFO |

### SNS

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SNS_ENABLED` | `true` | Habilitar el servicio SNS |

### S3

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_S3_ENABLED` | `true` | Habilitar el servicio S3 |
| `FLOCI_SERVICES_S3_DEFAULT_PRESIGN_EXPIRY_SECONDS` | `3600` | Caducidad de URL prefirmada predeterminada cuando no se especifica ninguna |

### DynamoDB

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_DYNAMODB_ENABLED` | `true` | Habilitar el servicio DynamoDB |

### Lambda

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_LAMBDA_ENABLED` | `true` | Habilitar el servicio Lambda |
| `FLOCI_SERVICES_LAMBDA_EPHEMERAL` | `false` | Elimine los contenedores Lambda inmediatamente después de cada invocación |
| `FLOCI_SERVICES_LAMBDA_DEFAULT_MEMORY_MB` | `128` | Asignación de memoria predeterminada para funciones que no especifican una |
| `FLOCI_SERVICES_LAMBDA_DEFAULT_TIMEOUT_SECONDS` | `3` | Tiempo de espera de invocación predeterminado en segundos |
| `FLOCI_SERVICES_LAMBDA_RUNTIME_API_BASE_PORT` | `9200` | Primer puerto en el rango de puertos Lambda Runtime API |
| `FLOCI_SERVICES_LAMBDA_RUNTIME_API_MAX_PORT` | `9299` | Último puerto en el rango de puertos Lambda Runtime API |
| `FLOCI_SERVICES_LAMBDA_CODE_PATH` | `./data/lambda-code` | Ruta del contenedor donde se almacenan los ZIP de implementación de Lambda |
| `FLOCI_SERVICES_LAMBDA_POLL_INTERVAL_MS` | `1000` | ¿Con qué frecuencia (ms) los sondeadores de fuentes de eventos SQS y Kinesis verifican si hay mensajes nuevos?
| `FLOCI_SERVICES_LAMBDA_CONTAINER_IDLE_TIMEOUT_SECONDS` | `300` | Segundos de inactividad antes de que se elimine un contenedor Lambda inactivo |
| `FLOCI_SERVICES_LAMBDA_REGION_CONCURRENCY_LIMIT` | `1000` | Máximo de invocaciones simultáneas de Lambda en todas las funciones de una región |
| `FLOCI_SERVICES_LAMBDA_UNRESERVED_CONCURRENCY_MIN` | `100` | Grupo de concurrencia mínimo sin reservas |
| `FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ENABLED` | `false` | Mire los directorios de códigos Lambda para ver cambios y recargarlos sin volver a implementarlos |
| `FLOCI_SERVICES_LAMBDA_HOT_RELOAD_ALLOWED_PATHS` | _(ninguno)_ | Rutas de host separadas por comas que la recarga en caliente puede observar |
| `FLOCI_SERVICES_LAMBDA_DOCKER_NETWORK` | _(ninguno)_ | Red Docker para contenedores Lambda (anula `FLOCI_SERVICES_DOCKER_NETWORK`) |
| `FLOCI_SERVICES_LAMBDA_DOCKER_HOST_OVERRIDE` | _(ninguno)_ | Los contenedores Lambda de IP/host explícitos se utilizan para llegar al tiempo de ejecución API, evitando la detección automática (por ejemplo, Podman sin raíz) |
| `FLOCI_SERVICES_LAMBDA_AWS_CONFIG_PATH` | _(ninguno)_ | Ruta de host montada en enlace de solo lectura en `/opt/aws-config` dentro de contenedores Lambda para un descubrimiento de credenciales real |

### Puerta de enlace API

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_APIGATEWAY_ENABLED` | `true` | Habilite el servicio API Gateway v1 (REST) |
| `FLOCI_SERVICES_APIGATEWAYV2_ENABLED` | `true` | Habilite el servicio API Gateway v2 (HTTP + WebSocket) |

### IAM

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_IAM_ENABLED` | `true` | Habilitar el servicio IAM |
| `FLOCI_SERVICES_IAM_ENFORCEMENT_ENABLED` | `false` | Cuando `true`, aplique políticas de IAM en las llamadas de API. Deje `false` para la mayoría de los escenarios de desarrollo local |
| `FLOCI_SERVICES_IAM_SEED_DEPLOYER_PRINCIPAL` | `false` | Cree un usuario local `floci-deployer` IAM con `AdministratorAccess` y credenciales estáticas `floci`/`floci` |

### KMS

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_KMS_ENABLED` | `true` | Habilitar el servicio KMS |

### Kinesis

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_KINESIS_ENABLED` | `true` | Habilite el servicio de flujos de datos Kinesis |

### Firehose

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_FIREHOSE_ENABLED` | `true` | Habilitar el servicio Kinesis Datos Firehose |

### EventBridge

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_EVENTBRIDGE_ENABLED` | `true` | Habilitar el servicio EventBridge |

### Programador

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SCHEDULER_ENABLED` | `true` | Habilite el servicio Programador EventBridge |
| `FLOCI_SERVICES_SCHEDULER_INVOCATION_ENABLED` | `true` | Cuando `false`, las programaciones se almacenan pero nunca se invocan |
| `FLOCI_SERVICES_SCHEDULER_TICK_INTERVAL_SECONDS` | `10` | Con qué frecuencia (segundos) el programador verifica las programaciones vencidas |

### Registros de CloudWatch

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CLOUDWATCHLOGS_ENABLED` | `true` | Habilite el servicio de Registros CloudWatch |
| `FLOCI_SERVICES_CLOUDWATCHLOGS_MAX_EVENTS_PER_QUERY` | `10000` | Máximo de eventos de registro devueltos por una única llamada `FilterLogEvents` |

### Métricas de CloudWatch

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CLOUDWATCHMETRICS_ENABLED` | `true` | Habilitar el servicio de Métricas CloudWatch |

### Administrador de secretos

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SECRETSMANAGER_ENABLED` | `true` | Habilitar el servicio Secrets Manager |
| `FLOCI_SERVICES_SECRETSMANAGER_DEFAULT_RECOVERY_WINDOW_DAYS` | `30` | Ventana de recuperación predeterminada para secretos eliminados |

### Cognito

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_COGNITO_ENABLED` | `true` | Habilite el servicio de grupos de usuarios de Cognito |

### Funciones de paso

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_STEPFUNCTIONS_ENABLED` | `true` | Habilite el servicio Step Functions |

### CloudFormation

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CLOUDFORMATION_ENABLED` | `true` | Habilitar el servicio CloudFormation |

### ACM (Administrador de certificados)

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ACM_ENABLED` | `true` | Habilitar el servicio ACM |
| `FLOCI_SERVICES_ACM_VALIDATION_WAIT_SECONDS` | `0` | Retraso simulado antes de que un certificado solicitado pase a `ISSUED` |

### SES (Servicio de correo electrónico sencillo)

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SES_ENABLED` | `true` | Habilitar el servicio SES |
| `FLOCI_SERVICES_SES_SMTP_HOST` | _(ninguno)_ | Host de retransmisión SMTP para correo electrónico saliente. Cuando no están configurados, los correos electrónicos se capturan solo en la memoria |
| `FLOCI_SERVICES_SES_SMTP_PORT` | `25` | Puerto de relé SMTP |
| `FLOCI_SERVICES_SES_SMTP_USER` | _(ninguno)_ | Nombre de usuario de SMTP |
| `FLOCI_SERVICES_SES_SMTP_PASS` | _(ninguno)_ | Contraseña SMTP |
| `FLOCI_SERVICES_SES_SMTP_STARTTLS` | `DISABLED` | Modo STARTTLS: `DISABLED`, `OPTIONAL` o `REQUIRED` |

### Tuberías

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_PIPES_ENABLED` | `true` | Habilitar el servicio de Tuberías EventBridge |

---

Servicios ##: respaldados por contenedores

Estos servicios generan contenedores Docker. Requieren acceso al zócalo Docker (`/var/run/docker.sock`).

### ElastiCache

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ELASTICACHE_ENABLED` | `true` | Habilitar el servicio ElastiCache |
| `FLOCI_SERVICES_ELASTICACHE_PROXY_BASE_PORT` | `6379` | Primer puerto en la gama de proxy ElastiCache |
| `FLOCI_SERVICES_ELASTICACHE_PROXY_MAX_PORT` | `6399` | Último puerto en el rango de proxy ElastiCache |
| `FLOCI_SERVICES_ELASTICACHE_DEFAULT_IMAGE` | `valkey/valkey:8` | Imagen Docker predeterminada para clústeres de caché |
| `FLOCI_SERVICES_ELASTICACHE_DOCKER_NETWORK` | _(ninguno)_ | Red Docker para contenedores ElastiCache (anula `FLOCI_SERVICES_DOCKER_NETWORK`) |

### RDS

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_RDS_ENABLED` | `true` | Habilitar el servicio RDS |
| `FLOCI_SERVICES_RDS_MOCK` | `false` | Cuando `true`, los clústeres e instancias de base de datos se crean instantáneamente sin un contenedor real o proxy de autenticación (solo API) |
| `FLOCI_SERVICES_RDS_PROXY_BASE_PORT` | `7001` | Primer puerto en la gama de proxy RDS |
| `FLOCI_SERVICES_RDS_PROXY_MAX_PORT` | `7099` | Último puerto en el rango de proxy RDS |
| `FLOCI_SERVICES_RDS_DEFAULT_POSTGRES_IMAGE` | `postgres:16-alpine` | Imagen predeterminada de PostgreSQL Docker |
| `FLOCI_SERVICES_RDS_DEFAULT_MYSQL_IMAGE` | `mysql:8.0` | Imagen predeterminada de MySQL Docker |
| `FLOCI_SERVICES_RDS_DEFAULT_MARIADB_IMAGE` | `mariadb:11` | Imagen predeterminada de MariaDB Docker |
| `FLOCI_SERVICES_RDS_DOCKER_NETWORK` | _(ninguno)_ | Red Docker para contenedores RDS (anula `FLOCI_SERVICES_DOCKER_NETWORK`) |
| `FLOCI_SERVICES_RDS_DATA_ENABLED` | `true` | Habilite el servicio RDS Datos API. Requiere `FLOCI_SERVICES_RDS_ENABLED=true` |
| `FLOCI_SERVICES_RDS_DATA_TRANSACTION_TTL_SECONDS` | `180` | Tiempo de espera de inactividad, en segundos, antes de que caduquen las transacciones de datos RDS filtradas API |

### OpenSearch

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_OPENSEARCH_ENABLED` | `true` | Habilite el servicio OpenSearch |
| `FLOCI_SERVICES_OPENSEARCH_MOCK` | `false` | Cuando `true`, los dominios se crean instantáneamente sin un contenedor real (solo API) |
| `FLOCI_SERVICES_OPENSEARCH_DEFAULT_IMAGE` | `opensearchproject/opensearch:2` | Imagen Docker para dominios OpenSearch |
| `FLOCI_SERVICES_OPENSEARCH_PROXY_BASE_PORT` | `9400` | Primer puerto en la gama de proxy OpenSearch |
| `FLOCI_SERVICES_OPENSEARCH_PROXY_MAX_PORT` | `9499` | Último puerto en el rango de proxy OpenSearch |
| `FLOCI_SERVICES_OPENSEARCH_KEEP_RUNNING_ON_SHUTDOWN` | `false` | Mantenga los contenedores OpenSearch en funcionamiento cuando Floci se detenga |

### MSK (Transmisión administrada para Kafka)

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_MSK_ENABLED` | `true` | Habilitar el servicio MSK |
| `FLOCI_SERVICES_MSK_MOCK` | `false` | Cuando `true`, los clústeres se crean instantáneamente sin un contenedor Redpanda real |
| `FLOCI_SERVICES_MSK_DEFAULT_IMAGE` | `redpandadata/redpanda:latest` | Imagen Docker para corredores Kafka/Redpanda |

### ECR (Registro de contenedores elásticos)

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ECR_ENABLED` | `true` | Habilitar el servicio ECR |
| `FLOCI_SERVICES_ECR_REGISTRY_IMAGE` | `registry:2` | Imagen Docker para el sidecar de registro ECR |
| `FLOCI_SERVICES_ECR_REGISTRY_CONTAINER_NAME` | `floci-ecr-registry` | Nombre del contenedor sidecar de registro ECR |
| `FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT` | `5100` | Primer puerto en el rango de registro ECR |
| `FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT` | `5199` | Último puerto en el rango de registro ECR |
| `FLOCI_SERVICES_ECR_TLS_ENABLED` | `false` | Habilite TLS para el registro ECR |
| `FLOCI_SERVICES_ECR_KEEP_RUNNING_ON_SHUTDOWN` | `true` | Mantenga el contenedor de registro ECR ejecutándose cuando se detenga Floci |
| `FLOCI_SERVICES_ECR_URI_STYLE` | `hostname` | Estilo de URI del repositorio: `hostname` (`<account>.dkr.ecr.<region>.localhost`) o `path` |
| `FLOCI_SERVICES_ECR_DOCKER_NETWORK` | _(ninguno)_ | Red Docker para el contenedor de registro ECR |

### EKS (Servicio elástico de Kubernetes)

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_EKS_ENABLED` | `true` | Habilitar el servicio EKS |
| `FLOCI_SERVICES_EKS_MOCK` | `false` | Cuando `true`, los clústeres se crean instantáneamente sin un contenedor real |
| `FLOCI_SERVICES_EKS_PROVIDER` | `k3s` | Proveedor de Kubernetes (`k3s`) |
| `FLOCI_SERVICES_EKS_DEFAULT_IMAGE` | `rancher/k3s:latest` | Imagen Docker para clústeres EKS |
| `FLOCI_SERVICES_EKS_API_SERVER_BASE_PORT` | `6500` | Primer puerto de la gama de servidores Kubernetes API |
| `FLOCI_SERVICES_EKS_API_SERVER_MAX_PORT` | `6599` | Último puerto de la gama de servidores Kubernetes API |
| `FLOCI_SERVICES_EKS_KEEP_RUNNING_ON_SHUTDOWN` | `false` | Mantenga los contenedores EKS en funcionamiento cuando Floci se detenga |
| `FLOCI_SERVICES_EKS_DOCKER_NETWORK` | _(ninguno)_ | Red Docker para contenedores EKS |

### ECS (Servicio de contenedor elástico)

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ECS_ENABLED` | `true` | Habilite el servicio ECS |
| `FLOCI_SERVICES_ECS_MOCK` | `false` | Cuando `true`, las tareas se registran pero en realidad no se ejecutan |
| `FLOCI_SERVICES_ECS_DEFAULT_MEMORY_MB` | `512` | Memoria de tarea predeterminada cuando no se especifica en la definición de tarea |
| `FLOCI_SERVICES_ECS_DEFAULT_CPU_UNITS` | `256` | Unidades de CPU de tarea predeterminadas cuando no se especifican en la definición de tarea |
| `FLOCI_SERVICES_ECS_DOCKER_NETWORK` | _(ninguno)_ | Red Docker para contenedores de tareas ECS |

### EC2

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_EC2_ENABLED` | `true` | Habilitar el servicio EC2 |
| `FLOCI_SERVICES_EC2_MOCK` | `false` | Cuando `true`, las instancias se registran en estado pero no se genera ningún contenedor |
| `FLOCI_SERVICES_EC2_IMDS_PORT` | `9169` | Puerto para el punto final del servicio de metadatos de instancia EC2 (IMDS) |
| `FLOCI_SERVICES_EC2_SSH_PORT_RANGE_START` | `2200` | Primer puerto en el rango de puertos SSH para instancias EC2 |
| `FLOCI_SERVICES_EC2_SSH_PORT_RANGE_END` | `2299` | Último puerto en el rango de puertos SSH |

### Athena

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_ATHENA_ENABLED` | `true` | Habilitar el servicio Athena |
| `FLOCI_SERVICES_ATHENA_MOCK` | `false` | Cuando `true`, las consultas se aceptan pero no se ejecutan |
| `FLOCI_SERVICES_ATHENA_DEFAULT_IMAGE` | `floci/floci-duck:latest` | Imagen Docker para el motor de consultas DuckDB |
| `FLOCI_SERVICES_ATHENA_DUCK_URL` | _(ninguno)_ | URL de un servicio DuckDB existente. Cuando se configura, Floci omite la administración del contenedor |

---

Servicios ##: adicionales

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_GLUE_ENABLED` | `true` | Habilitar el servicio Glue |
| `FLOCI_SERVICES_APPSYNC_ENABLED` | `true` | Habilitar el servicio AppSync |
| `FLOCI_SERVICES_BEDROCK_RUNTIME_ENABLED` | `true` | Habilite el servicio de tiempo de ejecución Bedrock |
| `FLOCI_SERVICES_TEXTRACT_ENABLED` | `true` | Habilitar el servicio Textract |
| `FLOCI_SERVICES_TRANSFER_ENABLED` | `true` | Habilitar el servicio de Transferencia Familiar |
| `FLOCI_SERVICES_ROUTE53_ENABLED` | `true` | Habilitar el servicio Ruta 53 |
| `FLOCI_SERVICES_ELBV2_ENABLED` | `true` | Habilitar el servicio ELBv2 (ALB/NLB) |
| `FLOCI_SERVICES_ELBV2_MOCK` | `false` | Cuando `true`, se registran balanceadores de carga pero no se genera ningún contenedor |
| `FLOCI_SERVICES_AUTOSCALING_ENABLED` | `true` | Habilite el servicio Auto Scaling |
| `FLOCI_SERVICES_CODEBUILD_ENABLED` | `true` | Habilitar el servicio CodeBuild |
| `FLOCI_SERVICES_CODEBUILD_DOCKER_NETWORK` | _(ninguno)_ | Red Docker para contenedores de compilación CodeBuild |
| `FLOCI_SERVICES_CODEDEPLOY_ENABLED` | `true` | Habilitar el servicio CodeDeploy |
| `FLOCI_SERVICES_BACKUP_ENABLED` | `true` | Habilite el servicio de copia de seguridad AWS |
| `FLOCI_SERVICES_BACKUP_JOB_COMPLETION_DELAY_SECONDS` | `3` | Retraso simulado antes de la transición de los trabajos de respaldo a `COMPLETED` |
| `FLOCI_SERVICES_APPCONFIG_ENABLED` | `true` | Habilite el servicio AppConfig |
| `FLOCI_SERVICES_APPCONFIGDATA_ENABLED` | `true` | Habilite el servicio de datos AppConfig |
