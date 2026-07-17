# Kinesis

**Protocolo:** JSON 1.1 (`X-Amz-Target: Kinesis_20131202.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateStream` | Crear una transmisión |
| `DeleteStream` | Eliminar una secuencia |
| `ListStreams` | Listar todas las transmisiones |
| `DescribeStream` | Obtenga detalles de la transmisión e información sobre fragmentos |
| `DescribeStreamSummary` | Descripción de transmisión ligera |
| `RegisterStreamConsumer` | Registre un consumidor fan-out mejorado |
| `DeregisterStreamConsumer` | Eliminar un consumidor |
| `DescribeStreamConsumer` | Obtenga detalles del consumidor |
| `ListStreamConsumers` | Listar consumidores para una transmisión |
| `SubscribeToShard` | Suscríbase a un fragmento para una distribución mejorada |
| `AddTagsToStream` | Etiquetar una transmisión |
| `RemoveTagsFromStream` | Eliminar etiquetas |
| `ListTagsForStream` | Etiquetas de lista |
| `StartStreamEncryption` | Habilite el cifrado KMS |
| `StopStreamEncryption` | Deshabilitar el cifrado |
| `SplitShard` | Dividir un fragmento en dos |
| `MergeShards` | Fusionar dos fragmentos adyacentes |
| `PutRecord` | Escribir un solo registro |
| `PutRecords` | Escribe hasta 500 registros |
| `GetShardIterator` | Obtenga un iterador para leer |
| `GetRecords` | Leer registros de un fragmento |
| `ListShards` | - |
| `IncreaseStreamRetentionPeriod` | Incrementar la retención hasta 8760 horas (365 días) |
| `DecreaseStreamRetentionPeriod` | Disminuye la retención hasta 24 horas |
| `EnableEnhancedMonitoring` | - |
| `DisableEnhancedMonitoring` | - |
| `UpdateStreamMode` | - |
<!-- floci:actions:end -->

## Direccionamiento de flujo

La mayoría de las acciones aceptan `StreamName` o `StreamARN` para identificar una transmisión. Cuando se proporcionan ambos, `StreamName` tiene prioridad. `CreateStream` solo acepta `StreamName`.

```bash
# By name
aws kinesis describe-stream --stream-name events --endpoint-url $AWS_ENDPOINT_URL

# By ARN
aws kinesis describe-stream --stream-arn arn:aws:kinesis:us-east-1:000000000000:stream/events --endpoint-url $AWS_ENDPOINT_URL
```

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_KINESIS_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

## Distribución mejorada (EFO)

`SubscribeToShard` utiliza un modelo de instantánea y cierre: el servidor devuelve un lote de registros como una respuesta binaria EventStream y cierra la conexión. El SDK se vuelve a suscribir automáticamente utilizando el `ContinuationSequenceNumber` desde el último registro entregado. Se admiten los cinco tipos de `StartingPosition`: `TRIM_HORIZON`, `LATEST`, `AT_SEQUENCE_NUMBER`, `AFTER_SEQUENCE_NUMBER`, `AT_TIMESTAMP`.

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
STREAM=my-stream

# Register a consumer
aws kinesis register-stream-consumer \
  --stream-arn $(aws kinesis describe-stream --stream-name $STREAM \
      --query StreamDescription.StreamARN --output text) \
  --consumer-name my-consumer

# Subscribe (AWS CLI streams events to stdout)
aws kinesis subscribe-to-shard \
  --consumer-arn <consumer-arn> \
  --shard-id shardId-000000000000 \
  --starting-position Type=TRIM_HORIZON
```

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a stream
aws kinesis create-stream \
  --stream-name events \
  --shard-count 2 \
  --endpoint-url $AWS_ENDPOINT_URL

# Put a record
aws kinesis put-record \
  --stream-name events \
  --partition-key "user-123" \
  --data '{"event":"page_view","page":"/home"}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Get a shard iterator
SHARD_ID=$(aws kinesis describe-stream \
  --stream-name events \
  --query 'StreamDescription.Shards[0].ShardId' --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

ITERATOR=$(aws kinesis get-shard-iterator \
  --stream-name events \
  --shard-id $SHARD_ID \
  --shard-iterator-type TRIM_HORIZON \
  --query ShardIterator --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Read records
aws kinesis get-records \
  --shard-iterator $ITERATOR \
  --endpoint-url $AWS_ENDPOINT_URL
```