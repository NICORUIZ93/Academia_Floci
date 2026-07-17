# EventBridge

**Protocolo:** JSON 1.1 (`X-Amz-Target: AmazonEventBridge.*`)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

<!-- floci:actions:start -->
| Acción | Descripción |
| --- | --- |
| `CreateEventBus` | Crear un bus de eventos personalizado |
| `DeleteEventBus` | Eliminar un bus de eventos |
| `DescribeEventBus` | Obtenga detalles del autobús del evento |
| `UpdateEventBus` | Actualizar la descripción del bus de eventos, la clave KMS, la configuración de mensajes fallidos o la configuración de registro |
| `ListEventBuses` | Listar todos los autobuses para eventos |
| `PutRule` | Crear o actualizar una regla con un patrón de programación o evento |
| `DeleteRule` | Eliminar una regla |
| `DescribeRule` | Obtener detalles de la regla |
| `ListRules` | Lista de reglas |
| `EnableRule` | Habilitar una regla deshabilitada |
| `DisableRule` | Deshabilitar una regla |
| `PutTargets` | Agregar objetivos a una regla |
| `RemoveTargets` | Eliminar objetivos de una regla |
| `ListTargetsByRule` | Listar objetivos para una regla |
| `PutEvents` | Publicar eventos personalizados en un bus de eventos |
| `TestEventPattern` | Probar si un evento de muestra coincide con un patrón determinado (no se dispara ningún objetivo) |
| `ListTagsForResource` | - |
| `TagResource` | - |
| `UntagResource` | - |
| `PutPermission` | - |
| `RemovePermission` | - |
| `CreateArchive` | - |
| `DescribeArchive` | - |
| `UpdateArchive` | - |
| `DeleteArchive` | - |
| `ListArchives` | - |
| `StartReplay` | - |
| `DescribeReplay` | - |
| `CancelReplay` | - |
| `ListReplays` | - |
<!-- floci:actions:end -->

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_EVENTBRIDGE_ENABLED` | `true` | Activar o desactivar el servicio |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a custom event bus
aws events create-event-bus \
  --name my-bus \
  --endpoint-url $AWS_ENDPOINT_URL

# Create a rule matching a pattern
aws events put-rule \
  --name order-placed-rule \
  --event-bus-name my-bus \
  --event-pattern '{"source":["com.myapp"],"detail-type":["OrderPlaced"]}' \
  --state ENABLED \
  --endpoint-url $AWS_ENDPOINT_URL

# Add a Lambda target
aws events put-targets \
  --rule order-placed-rule \
  --event-bus-name my-bus \
  --targets '[{
    "Id": "process-order",
    "Arn": "arn:aws:lambda:us-east-1:000000000000:function:process-order"
  }]' \
  --endpoint-url $AWS_ENDPOINT_URL

# Publish an event
aws events put-events \
  --entries '[{
    "Source": "com.myapp",
    "DetailType": "OrderPlaced",
    "Detail": "{\"orderId\":\"123\",\"amount\":99.99}",
    "EventBusName": "my-bus"
  }]' \
  --endpoint-url $AWS_ENDPOINT_URL
```

## Bus de eventos predeterminado

EventBridge incluye un bus de eventos predeterminado (`default`) que acepta eventos de los servicios AWS. Los autobuses personalizados son para sus propios eventos de aplicación.

```bash
# List rules on the default bus
aws events list-rules --endpoint-url $AWS_ENDPOINT_URL

# Send to default bus
aws events put-events \
  --entries '[{"Source":"myapp","DetailType":"test","Detail":"{}"}]' \
  --endpoint-url $AWS_ENDPOINT_URL
```
