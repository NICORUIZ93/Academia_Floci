# Datos Firehose

**Protocolo:** JSON 1.1
**Punto final:** `http://localhost:4566/`

Floci emula Amazon Data Firehose para la ingestión y entrega de datos en streaming a S3.

## Acciones admitidas

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateDeliveryStream` | Crea una nueva secuencia de entrega |
| `UpdateDestination` | - |
| `DescribeDeliveryStream` | Devuelve metadatos sobre una secuencia |
| `ListDeliveryStreams` | Enumera todas las transmisiones de entrega |
| `DeleteDeliveryStream` | Elimina un flujo de entrega |
| `PutRecord` | Escribe un único registro de datos en la secuencia |
| `PutRecordBatch` | Escribe múltiples registros de datos en la secuencia |
| `TagDeliveryStream` | - |
| `UntagDeliveryStream` | - |
| `ListTagsForDeliveryStream` | - |
<!-- floci:actions:end -->

## Cómo funciona

1. **Almacenamiento en búfer**: los registros entrantes se almacenan en búfer en la memoria.
2. **Vaciado automático**: Floci vacía automáticamente el búfer en S3 después de cada 5 registros para obtener retroalimentación local inmediata.
3. **Formato**: los registros se descargan como NDJSON sin formato (JSON delimitado por nueva línea) al depósito `floci-firehose-results`.

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_FIREHOSE_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplo de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a stream
aws firehose create-delivery-stream --delivery-stream-name my-stream --endpoint-url $AWS_ENDPOINT_URL

# Put a record
aws firehose put-record \
  --delivery-stream-name my-stream \
  --record '{"Data": "{\"id\": 1, \"amount\": 10.5}"}' \
  --endpoint-url $AWS_ENDPOINT_URL
```
