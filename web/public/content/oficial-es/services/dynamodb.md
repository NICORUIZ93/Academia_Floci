# DynamoDB

**Protocolo:** JSON 1.1 (`X-Amz-Target: DynamoDB_20120810.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

| Acción | Descripción |
|---|---|
| `CreateTable` | Crear una tabla con índices |
| `DeleteTable` | Eliminar una tabla |
| `DescribeTable` | Obtener metadatos de la tabla |
| `ListTables` | Listar todas las tablas |
| `UpdateTable` | Actualizar rendimiento, índices y flujos |
| `PutItem` | Escribir un artículo |
| `GetItem` | Leer un elemento por clave principal |
| `DeleteItem` | Eliminar un elemento |
| `UpdateItem` | Actualizar parcialmente un elemento |
| `Query` | Consulta por clave de partición con filtro opcional |
| `Scan` | Escaneo completo de la tabla con filtro opcional |
| `BatchWriteItem` | Escriba/elimine hasta 25 elementos en tablas |
| `BatchGetItem` | Leer hasta 100 elementos en tablas |
| `TransactWriteItems` | Transacción de escritura ACID |
| `TransactGetItems` | Transacción de lectura ACID |
| `DescribeTimeToLive` | Obtener configuración TTL |
| `UpdateTimeToLive` | Activar/desactivar TTL en una mesa |
| `TagResource` | Etiquetar una mesa |
| `UntagResource` | Eliminar etiquetas |
| `ListTagsOfResource` | Etiquetas de lista |
| `DescribeContinuousBackups` | Obtenga la configuración de respaldo de PITR |
| `UpdateContinuousBackups` | Activar/desactivar PITR |
| `DescribeKinesisStreamingDestination` | Listar destinos de streaming Kinesis |
| `EnableKinesisStreamingDestination` | Habilite la transmisión Kinesis para una mesa |
| `DisableKinesisStreamingDestination` | Deshabilitar la transmisión Kinesis para una mesa |
| `ExportTableToPointInTime` | Exportar datos de la tabla a S3 como gzip NDJSON |
| `DescribeExport` | Obtener estado de exportación y metadatos |
| `ListExports` | Exportaciones de lista, opcionalmente filtradas por tabla ARN |

## transmite {#streams}

Las transmisiones DynamoDB se admiten a través de un destino independiente (`DynamoDBStreams_20120810`):

| Acción | Descripción |
|---|---|
| `ListStreams` | Listar todas las transmisiones |
| `DescribeStream` | Obtener información sobre transmisiones y fragmentos |
| `GetShardIterator` | Obtener un iterador de fragmentos |
| `GetRecords` | Leer registros de transmisión desde un fragmento |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_DYNAMODB_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_STORAGE_SERVICES_DYNAMODB_MODE` | *(predeterminado global)* | Anulación del modo de almacenamiento para DynamoDB (`memory`, `persistent`, `hybrid`, `wal`) |
| `FLOCI_STORAGE_SERVICES_DYNAMODB_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga para modos de almacenamiento `hybrid`/`wal` (milisegundos) |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a table
aws dynamodb create-table \
  --table-name Users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $AWS_ENDPOINT_URL

# Put an item
aws dynamodb put-item \
  --table-name Users \
  --item '{"userId":{"S":"u1"},"name":{"S":"Alice"},"age":{"N":"30"}}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Get an item
aws dynamodb get-item \
  --table-name Users \
  --key '{"userId":{"S":"u1"}}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Query (partition key)
aws dynamodb query \
  --table-name Users \
  --key-condition-expression "userId = :id" \
  --expression-attribute-values '{":id":{"S":"u1"}}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Scan with filter
aws dynamodb scan \
  --table-name Users \
  --filter-expression "age > :min" \
  --expression-attribute-values '{":min":{"N":"25"}}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Enable TTL
aws dynamodb update-time-to-live \
  --table-name Users \
  --time-to-live-specification Enabled=true,AttributeName=expiresAt \
  --endpoint-url $AWS_ENDPOINT_URL

# Enable Streams
aws dynamodb update-table \
  --table-name Users \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Índices secundarios globales

```bash
aws dynamodb create-table \
  --table-name Orders \
  --attribute-definitions \
    AttributeName=orderId,AttributeType=S \
    AttributeName=customerId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --global-secondary-indexes '[{
    "IndexName": "CustomerIndex",
    "KeySchema": [{"AttributeName":"customerId","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"}
  }]' \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Exportar a S3

Exporte datos de la tabla a un depósito S3 como NDJSON comprimido con gzip (formato DynamoDB JSON):

```bash
# Create a bucket to receive the export
aws s3 mb s3://my-exports --endpoint-url $AWS_ENDPOINT_URL

# Start an export
EXPORT_ARN=$(aws dynamodb export-table-to-point-in-time \
  --table-arn arn:aws:dynamodb:us-east-1:000000000000:table/Users \
  --s3-bucket my-exports \
  --s3-prefix exports \
  --export-format DYNAMODB_JSON \
  --query ExportDescription.ExportArn --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Poll until COMPLETED
aws dynamodb describe-export \
  --export-arn $EXPORT_ARN \
  --query ExportDescription.ExportStatus \
  --endpoint-url $AWS_ENDPOINT_URL

# List exports for a table
aws dynamodb list-exports \
  --table-arn arn:aws:dynamodb:us-east-1:000000000000:table/Users \
  --endpoint-url $AWS_ENDPOINT_URL
```

La exportación escribe en `s3://<bucket>/<prefix>/AWSDynamoDB/<exportId>/data/` como uno o más archivos `.json.gz`, junto con `manifest-summary.json` y `manifest-files.json`: el mismo diseño que las exportaciones reales de AWS DynamoDB.
```