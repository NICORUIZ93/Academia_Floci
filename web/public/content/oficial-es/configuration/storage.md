# Modos de almacenamiento

Floci admite cuatro backends de almacenamiento. Puede establecer un valor predeterminado global y anularlo por servicio.

## Modos

| Modo | Los datos sobreviven al reinicio | Escribir rendimiento | Caso de uso |
|---|---|---|---|
| `memory` | No | Más rápido | Pruebas unitarias, canalizaciones de CI |
| `persistent` | Sí | Escritura en disco síncrona en cada cambio | Desarrollo con estado duradero |
| `hybrid` | Sí | Lecturas en memoria, descarga asíncrona al disco | Desarrollo local general |
| `wal` | Sí | Registro de escritura anticipada de solo adición con compactación | Cargas de trabajo de alta escritura |

## Configuración global de

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_STORAGE_MODE` | `memory` | Backend de almacenamiento (`memory`, `persistent`, `hybrid`, `wal`) |
| `FLOCI_STORAGE_PERSISTENT_PATH` | `./data` | Directorio base para todos los datos persistentes |
| `FLOCI_STORAGE_WAL_COMPACTION_INTERVAL_MS` | `30000` | Intervalo de compactación WAL (milisegundos) |

!!! nota "Código predeterminado versus predeterminado enviado"
    El Java `@WithDefault` para `storage.mode` es `hybrid`, pero la imagen Docker publicada se envía con `memory` configurado en `application.yml`. Al ejecutar la imagen de archivo obtendrá `memory` a menos que configure `FLOCI_STORAGE_MODE`.

## Anulación por servicio de

Cuando no está configurado para un servicio, hereda `FLOCI_STORAGE_MODE`. Anule solo cuando necesite un comportamiento diferente para un servicio específico.

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_STORAGE_SERVICES_SSM_MODE` | incumplimiento global | Modo de almacenamiento SSM |
| `FLOCI_STORAGE_SERVICES_SSM_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga SSM (ms) |
| `FLOCI_STORAGE_SERVICES_SQS_MODE` | incumplimiento global | Modo de almacenamiento SQS |
| `FLOCI_STORAGE_SERVICES_S3_MODE` | incumplimiento global | Modo de almacenamiento S3 |
| `FLOCI_STORAGE_SERVICES_DYNAMODB_MODE` | incumplimiento global | Modo de almacenamiento DynamoDB |
| `FLOCI_STORAGE_SERVICES_DYNAMODB_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga DynamoDB (ms) |
| `FLOCI_STORAGE_SERVICES_SNS_MODE` | incumplimiento global | Modo de almacenamiento SNS |
| `FLOCI_STORAGE_SERVICES_SNS_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga SNS (ms) |
| `FLOCI_STORAGE_SERVICES_LAMBDA_MODE` | incumplimiento global | Modo de almacenamiento Lambda |
| `FLOCI_STORAGE_SERVICES_LAMBDA_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga Lambda (ms) |
| `FLOCI_STORAGE_SERVICES_CLOUDWATCHLOGS_MODE` | incumplimiento global | CloudWatch Modo de almacenamiento de registros |
| `FLOCI_STORAGE_SERVICES_CLOUDWATCHLOGS_FLUSH_INTERVAL_MS` | `5000` | CloudWatch Intervalo de descarga de registros (ms) |
| `FLOCI_STORAGE_SERVICES_CLOUDWATCHMETRICS_MODE` | incumplimiento global | CloudWatch Modo de almacenamiento de métricas |
| `FLOCI_STORAGE_SERVICES_CLOUDWATCHMETRICS_FLUSH_INTERVAL_MS` | `5000` | CloudWatch Intervalo de descarga de métricas (ms) |
| `FLOCI_STORAGE_SERVICES_SECRETSMANAGER_MODE` | incumplimiento global | Modo de almacenamiento de Secrets Manager |
| `FLOCI_STORAGE_SERVICES_SECRETSMANAGER_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga de Secrets Manager (ms) |
| `FLOCI_STORAGE_SERVICES_ACM_MODE` | incumplimiento global | Modo de almacenamiento ACM |
| `FLOCI_STORAGE_SERVICES_ACM_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga ACM (ms) |
| `FLOCI_STORAGE_SERVICES_OPENSEARCH_MODE` | incumplimiento global | Modo de almacenamiento OpenSearch |
| `FLOCI_STORAGE_SERVICES_OPENSEARCH_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga OpenSearch (ms) |
| `FLOCI_STORAGE_SERVICES_RDS_MODE` | incumplimiento global | Modo de almacenamiento de metadatos RDS (ver nota a continuación) |

!!! nota "modo de almacenamiento RDS"
    `FLOCI_STORAGE_SERVICES_RDS_MODE` controla la propia persistencia de metadatos de Floci para RDS, no la
    Volúmenes de contenedores de base de datos. En todos los modos, cada instancia de base de datos o clúster obtiene un volumen Docker con nombre.
    (`floci-rds-{volumeId}`). En el modo `memory`, el volumen se elimina automáticamente cuando el
    se elimina la instancia. En otros modos, el volumen se conserva a menos que
    `FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE=true`.

## Perfiles recomendados

=== "CI rápido"

    Todo en la memoria: inicio y ejecución de pruebas más rápidos posibles:

    ```bash
    FLOCI_STORAGE_MODE=memory
    ```

=== "Desarrollo local"

    Híbrido: sobrevive a los reinicios sin ralentizar las escrituras:

    ```bash
    FLOCI_STORAGE_MODE=hybrid
    FLOCI_STORAGE_PERSISTENT_PATH=/app/data
    ```

    Docker Componer:

    ```yaml
    volumes:
      - floci-data:/app/data
    environment:
      FLOCI_STORAGE_MODE: hybrid
      FLOCI_STORAGE_PERSISTENT_PATH: /app/data
    ```

=== "Desarrollo duradero"

    Persistente: cada escritura se realiza inmediatamente en el disco:

    ```bash
    FLOCI_STORAGE_MODE=persistent
    FLOCI_STORAGE_PERSISTENT_PATH=/app/data
    ```

    Docker Componer:

    ```yaml
    volumes:
      - floci-data:/app/data
    environment:
      FLOCI_STORAGE_MODE: persistent
      FLOCI_STORAGE_PERSISTENT_PATH: /app/data
    ```

=== "Mixto"

    Mantenga la mayoría de los servicios en la memoria, persista solo DynamoDB y S3:

    ```bash
    FLOCI_STORAGE_MODE=memory
    FLOCI_STORAGE_SERVICES_DYNAMODB_MODE=persistent
    FLOCI_STORAGE_SERVICES_S3_MODE=hybrid
    FLOCI_STORAGE_PERSISTENT_PATH=/app/data
    ```

## Almacenamiento de contenedores (RDS, OpenSearch, MSK, ECR)

Los servicios que generan contenedores Docker (registro RDS, OpenSearch, MSK, ECR) necesitan un volumen para su
datos. Floci administra esto automáticamente usando **volúmenes Docker con nombre**: sin configuración adicional
requerido.

### Cómo funciona

Cada recurso obtiene un `volumeId` (una cadena hexadecimal de 6 caracteres, por ejemplo, `a1b2c3`) generado en el momento de la creación.
tiempo y se almacena en el modelo de recursos. Tanto el nombre del contenedor como el nombre del volumen utilizan este sufijo:

```
floci-rds-a1b2c3         # RDS instance container and volume
floci-opensearch-b4c5d6  # OpenSearch domain container and volume
floci-msk-e7f8a9         # MSK cluster container and volume
floci-ecr-registry-data  # ECR shared registry volume (singleton)
```

Los volúmenes están etiquetados como `floci=true` para que pueda administrarlos con los comandos estándar Docker:

```bash
# List all Floci-managed volumes
docker volume ls --filter label=floci=true

# Remove all Floci-managed volumes (destructive)
docker volume prune --filter label=floci=true
```

### Ciclo de vida del volumen

De forma predeterminada, los volúmenes sobreviven a la eliminación de recursos, coincidiendo con el comportamiento real de AWS.

| `FLOCI_STORAGE_MODE` | Volumen al eliminar recursos |
|---|---|
| `memory` | **Siempre eliminado**: el modo de memoria no implica persistencia entre reinicios |
| `persistent` / `hybrid` / `wal` | Retenido (predeterminado): eliminar con `FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE=true` |

```bash
# Remove named volumes immediately when a resource is deleted (useful in CI with persistent mode)
FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE=true
```

### Modo de ruta de host (avanzado)

Establezca `FLOCI_STORAGE_HOST_PERSISTENT_PATH` en una **ruta de host absoluta** para usar montajes vinculados en su lugar
de volúmenes nombrados. Esto sólo es necesario cuando debe acceder a los datos del contenedor directamente desde el
sistema de archivos host.

```bash
FLOCI_STORAGE_HOST_PERSISTENT_PATH=/absolute/host/path/data
```

!!! advertencia
    `FLOCI_STORAGE_HOST_PERSISTENT_PATH` debe ser una ruta absoluta (comenzando con `/`). Volumen
    Los nombres y rutas relativas no son compatibles y se ignorarán silenciosamente, recurriendo a
    modo de volumen con nombre.
