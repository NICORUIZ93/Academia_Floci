# SQS

**Protocolo:** Consulta (XML) y JSON 1.0 (ambos compatibles)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateQueue` | Crear una cola estándar o FIFO |
| `DeleteQueue` | Eliminar una cola |
| `ListQueues` | Listar todas las colas |
| `GetQueueUrl` | Buscar una URL de cola por nombre |
| `GetQueueAttributes` | Obtener atributos de configuración de cola |
| `SendMessage` | Enviar un mensaje a una cola |
| `ReceiveMessage` | Encuesta para mensajes |
| `DeleteMessage` | Confirmar y eliminar un mensaje |
| `DeleteMessageBatch` | Eliminar varios mensajes a la vez |
| `SendMessageBatch` | Envía hasta 10 mensajes en una llamada |
| `ChangeMessageVisibility` | Ampliar o restablecer el tiempo de espera de visibilidad de un mensaje |
| `ChangeMessageVisibilityBatch` | Cambiar la visibilidad de varios mensajes |
| `SetQueueAttributes` | Actualizar configuración de cola |
| `TagQueue` | Agregar etiquetas a una cola |
| `UntagQueue` | Eliminar etiquetas de una cola |
| `ListQueueTags` | Listar etiquetas en una cola |
| `PurgeQueue` | Eliminar todos los mensajes en una cola |
| `ListDeadLetterSourceQueues` | Encuentre colas que utilicen esta cola como DLQ |
| `StartMessageMoveTask` | Iniciar una tarea de redireccionamiento DLQ |
| `ListMessageMoveTasks` | Listar tareas de redireccionamiento DLQ |
| `CancelMessageMoveTask` | - |
| `AddPermission` | - |
| `RemovePermission` | - |
<!-- floci:actions:end -->

## Punto final de inspección local

Para afirmaciones de prueba y depuración, Floci expone un punto final compatible con LocalStack que le permite echar un vistazo al contenido de la cola sin consumir mensajes:

| Método | Camino | Descripción |
|---|---|---|
| `GET` | `/_aws/sqs/messages?QueueUrl=<url>` | Listar todos los mensajes en la cola (no destructivo) |
| `DELETE` | `/_aws/sqs/messages?QueueUrl=<url>` | Purgar todos los mensajes de la cola |

`GET` devuelve todos los mensajes actualmente en la cola, incluidos los mensajes en tránsito, sin cambiar los tiempos de espera de visibilidad ni avanzar los recuentos de recepción. No elimina mensajes.

`DELETE` es equivalente a `PurgeQueue` y elimina todos los mensajes.

### Forma de respuesta

```json
{
  "messages": [
    {
      "MessageId": "abc123",
      "MD5OfBody": "...",
      "Body": "{\"event\":\"order.placed\"}",
      "ReceiptHandle": null,
      "Attributes": {
        "SentTimestamp": "1714000000000",
        "ApproximateReceiveCount": "0"
      },
      "MessageAttributes": {}
    }
  ]
}
```

`ReceiptHandle` es `null` para mensajes que aún no se han recibido. Los mensajes FIFO incluyen `MessageGroupId`, `MessageDeduplicationId` y `SequenceNumber` en `Attributes` cuando se configuran.

### Ejemplo

```bash
QUEUE_URL="http://localhost:4566/000000000000/orders"

# Peek at messages without consuming them
curl "http://localhost:4566/_aws/sqs/messages?QueueUrl=$QUEUE_URL"

# Purge the queue
curl -X DELETE "http://localhost:4566/_aws/sqs/messages?QueueUrl=$QUEUE_URL"
```

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SQS_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_SERVICES_SQS_DEFAULT_VISIBILITY_TIMEOUT` | `30` | Tiempo de espera de visibilidad de mensajes predeterminado (segundos) |
| `FLOCI_SERVICES_SQS_MAX_MESSAGE_SIZE` | `1048576` | Tamaño máximo de mensaje en bytes (1 MB) |
| `FLOCI_SERVICES_SQS_CLEAR_FIFO_DEDUPLICATION_CACHE_ON_PURGE` | `false` | Cuando `true`, `PurgeQueue` también borra la caché de deduplicación FIFO de la cola y cualquier tema FIFO de SNS suscrito a ella |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a standard queue
aws sqs create-queue --queue-name orders --endpoint-url $AWS_ENDPOINT_URL

# Create a FIFO queue
aws sqs create-queue \
  --queue-name orders.fifo \
  --attributes FifoQueue=true \
  --endpoint-url $AWS_ENDPOINT_URL

# Send a message
QUEUE_URL="$AWS_ENDPOINT_URL/000000000000/orders"
aws sqs send-message \
  --queue-url $QUEUE_URL \
  --message-body '{"event":"order.placed","id":"abc123"}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Receive messages
aws sqs receive-message \
  --queue-url $QUEUE_URL \
  --max-number-of-messages 10 \
  --endpoint-url $AWS_ENDPOINT_URL

# Delete a message (replace RECEIPT_HANDLE with the value from ReceiveMessage)
aws sqs delete-message \
  --queue-url $QUEUE_URL \
  --receipt-handle "RECEIPT_HANDLE" \
  --endpoint-url $AWS_ENDPOINT_URL

# Set up a dead-letter queue
DLQ_ARN=$(aws sqs get-queue-attributes \
  --queue-url $AWS_ENDPOINT_URL/000000000000/orders-dlq \
  --attribute-names QueueArn \
  --query Attributes.QueueArn \
  --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

aws sqs set-queue-attributes \
  --queue-url $QUEUE_URL \
  --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":3}\"}" \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Formato de URL de cola

```
http://localhost:4566/000000000000/<queue-name>
```