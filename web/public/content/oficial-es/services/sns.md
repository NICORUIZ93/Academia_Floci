# SNS

**Protocolo:** Consulta (XML) y JSON 1.0 (ambos compatibles)
**Punto final:** `POST http://localhost:4566/`

## Acciones compatibles con

| Acción | Descripción |
|---|---|
| `CreateTopic` | Crear un tema |
| `DeleteTopic` | Eliminar un tema |
| `ListTopics` | Listar todos los temas |
| `GetTopicAttributes` | Obtener configuración del tema |
| `SetTopicAttributes` | Actualizar configuración del tema |
| `Subscribe` | Suscribir un punto final (SQS, HTTP, Lambda, correo electrónico) |
| `Unsubscribe` | Eliminar una suscripción |
| `ListSubscriptions` | Listar todas las suscripciones |
| `ListSubscriptionsByTopic` | Listar suscripciones para un tema específico |
| `GetSubscriptionAttributes` | Obtener configuración de suscripción |
| `SetSubscriptionAttributes` | Actualizar configuración de suscripción |
| `ConfirmSubscription` | Confirmar una suscripción pendiente |
| `Publish` | Publicar un mensaje en un tema |
| `PublishBatch` | Publica hasta 10 mensajes en una llamada |
| `TagResource` | Etiquetar un tema |
| `UntagResource` | Eliminar etiquetas de un tema |
| `ListTagsForResource` | Listar etiquetas sobre un tema |
| `CreatePlatformApplication` | Cree una aplicación de plataforma push móvil (iOS o Android) |
| `DeletePlatformApplication` | Eliminar una aplicación de plataforma y sus puntos finales |
| `GetPlatformApplicationAttributes` | Leer atributos de la aplicación de plataforma |
| `SetPlatformApplicationAttributes` | Actualizar los atributos de la aplicación de la plataforma (por ejemplo, `Enabled`) |
| `ListPlatformApplications` | Listado de aplicaciones de plataforma en la región |
| `CreatePlatformEndpoint` | Registre un token de dispositivo en una aplicación de plataforma |
| `DeleteEndpoint` | Eliminar un punto final de plataforma |
| `GetEndpointAttributes` | Leer atributos de punto final |
| `SetEndpointAttributes` | Actualizar los atributos del punto final (por ejemplo, `Enabled=false` para simular la caducidad del token) |
| `ListEndpointsByPlatformApplication` | Listar puntos finales en una aplicación de plataforma |

## Configuración

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_SNS_ENABLED` | `true` | Activar o desactivar el servicio |
| `FLOCI_STORAGE_SERVICES_SNS_MODE` | *(predeterminado global)* | Anulación del modo de almacenamiento para SNS (`memory`, `persistent`, `hybrid`, `wal`) |
| `FLOCI_STORAGE_SERVICES_SNS_FLUSH_INTERVAL_MS` | `5000` | Intervalo de descarga para modos de almacenamiento `hybrid`/`wal` (milisegundos) |

## Ejemplos

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a topic
TOPIC_ARN=$(aws sns create-topic --name notifications \
  --query TopicArn --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

# Subscribe an SQS queue
QUEUE_ARN=$(aws sqs get-queue-attributes \
  --queue-url $AWS_ENDPOINT_URL/000000000000/orders \
  --attribute-names QueueArn \
  --query Attributes.QueueArn --output text \
  --endpoint-url $AWS_ENDPOINT_URL)

aws sns subscribe \
  --topic-arn $TOPIC_ARN \
  --protocol sqs \
  --notification-endpoint $QUEUE_ARN \
  --endpoint-url $AWS_ENDPOINT_URL

# Publish a message
aws sns publish \
  --topic-arn $TOPIC_ARN \
  --message '{"event":"user.registered"}' \
  --endpoint-url $AWS_ENDPOINT_URL

# Fan-out: publish and verify the SQS queue received the message
aws sqs receive-message \
  --queue-url $AWS_ENDPOINT_URL/000000000000/orders \
  --endpoint-url $AWS_ENDPOINT_URL
```

## SNS → SQS Distribución

Floci admite distribución real de SNS → SQS. Cuando publica en un tema, todas las colas suscritas a SQS reciben el mensaje inmediatamente.

Protocolos de suscripción admitidos:
- `sqs`: entrega a una cola Floci SQS
- `lambda`: invoca una función Floci Lambda
- `http` / `https`: publicaciones en un punto final HTTP

## Pulsador móvil (simulado)

Floci se burla del push móvil SNS para iOS y Android. No hay ninguna conexión APNS o FCM real.
realizado: cada envío se captura en la memoria para que las pruebas puedan afirmar lo que se habría enviado.

**Plataformas compatibles:** `APNS`, `APNS_SANDBOX`, `GCM`, `FCM`. Cualquier otra plataforma
el valor devuelve `InvalidParameter`.

### Flujo de extremo a extremo

```bash
APP_ARN=$(aws sns create-platform-application \
  --name ios-app --platform APNS \
  --attributes PlatformCredential=fake-cert \
  --endpoint-url http://localhost:4566 --query PlatformApplicationArn --output text)

ENDPOINT_ARN=$(aws sns create-platform-endpoint \
  --platform-application-arn $APP_ARN \
  --token ios-device-token-abc \
  --endpoint-url http://localhost:4566 --query EndpointArn --output text)

# Plain string payload
aws sns publish --target-arn $ENDPOINT_ARN --message '{"aps":{"alert":"hi"}}' \
  --endpoint-url http://localhost:4566

# Platform-specific payloads with MessageStructure=json
aws sns publish --target-arn $ENDPOINT_ARN --message-structure json \
  --message '{"default":"fallback","APNS":"{\"aps\":{\"alert\":\"ios\"}}","GCM":"{\"notification\":{\"body\":\"android\"}}"}' \
  --endpoint-url http://localhost:4566
```

Cuando `MessageStructure="json"`, Floci elige la clave que coincide con la plataforma del terminal
(`APNS`, `APNS_SANDBOX`, `GCM` o `FCM`), recurriendo a `default`. el sobre
debe ser un objeto JSON y debe incluir `default`; de lo contrario, `InvalidParameter`.

### Inspeccionando impulsos capturados

```bash
# All captured pushes (newest first), or filtered by endpoint
curl http://localhost:4566/_aws/sns/push-notifications
curl "http://localhost:4566/_aws/sns/push-notifications?EndpointArn=$ENDPOINT_ARN"

# Reset between tests
curl -X DELETE http://localhost:4566/_aws/sns/push-notifications
```

### Simulando tokens caducados

Dos formas de hacer que `Publish` falle con `EndpointDisabledException`:

1. **Explícito**: llame a `SetEndpointAttributes` con `Enabled=false`. Coincide con el
   Flujo real de AWS después de una falla asíncrona de APNS/FCM.
2. **Sentinel**: cree un punto final cuyo token contenga `EXPIRED`
   (no distingue entre mayúsculas y minúsculas). Floci lo marca como `Enabled=false` en el momento de la creación, por lo que el primero
   la publicación falla. Le permite seguir el camino infeliz con una sola llamada a API.

### Códigos de error

| Acción | Condición | Código de error | HTTP |
|---|---|---|---|
| `CreatePlatformApplication` | Falta `Name` | `InvalidParameter` | 400 |
| `CreatePlatformApplication` | `Platform` no compatible (por ejemplo, `WNS`, `ADM`) | `InvalidParameter` | 400 |
| `CreatePlatformEndpoint` | Falta `Token` | `InvalidParameter` | 400 |
| `CreatePlatformEndpoint` | Desconocido `PlatformApplicationArn` | `NotFound` | 404 |
| `CreatePlatformEndpoint` | Mismo `Token`, diferente `CustomUserData` o atributos | `InvalidParameter` | 400 |
| `CreatePlatformEndpoint` | Aplicación de plataforma deshabilitada | `PlatformApplicationDisabledException` | 400 |
| `Publish` | Punto final desconocido ARN | `NotFound` | 404 |
| `Publish` | `TargetArn` es una aplicación de plataforma ARN | `InvalidParameter` | 400 |
| `Publish` | Punto final `Enabled=false` | `EndpointDisabledException` | 400 |
| `Publish` | Aplicación de plataforma `Enabled=false` | `PlatformApplicationDisabledException` | 400 |
| `Publish` | A `MessageStructure=json` le falta la clave `default` | `InvalidParameter` | 400 |
| `Publish` | El mensaje `MessageStructure=json` no es válido JSON | `InvalidParameter` | 400 |
| `GetPlatformApplicationAttributes` | Desconocido ARN | `NotFound` | 404 |
| `GetEndpointAttributes` | Desconocido ARN | `NotFound` | 404 |
| `SetEndpointAttributes` | Desconocido ARN | `NotFound` | 404 |

`DeletePlatformApplication` y `DeleteEndpoint` son idempotentes: tienen éxito
silenciosamente si el recurso no existe, coincidiendo con el comportamiento real de SNS.