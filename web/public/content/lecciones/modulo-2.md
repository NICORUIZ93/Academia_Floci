# Módulo 2 · Colas de mensajes: SQS, Azure Service Bus y GCP Pub/Sub

## ¿Por qué necesitamos colas?

Imagina una tienda online: el usuario hace un pedido y el sistema debe enviar un correo, actualizar el inventario y notificar al almacén. Si lo haces de forma síncrona y el servicio de correo falla, el pedido falla. Las **colas de mensajes** desacoplan: el productor manda el mensaje a la cola y cada consumidor lo procesa cuando puede. Si el correo falla, el mensaje espera en la cola.

| AWS | Azure | GCP |
|-----|-------|-----|
| SQS (Simple Queue Service) | Service Bus (puerto 4577 / AMQP 5673) | Cloud Pub/Sub (puerto 4588) |

---

## Conceptos clave

**Visibility timeout**: cuando un consumidor recibe un mensaje, este se vuelve invisible por X segundos. Si lo procesa bien, lo elimina. Si falla, reaparece. Por eso **un mensaje puede llegar dos veces**.

**Receipt Handle**: token único que necesitas para eliminar un mensaje después de procesarlo.

**Dead Letter Queue (DLQ)**: si un mensaje falla N veces, va a la DLQ. Así no bloqueas la cola principal.

**Idempotencia**: tu código debe poder ejecutar la misma operación dos veces sin duplicar efectos.

---

## AWS SQS con Floci

```bash
eval $(floci env)

# Crea una cola estándar
aws sqs create-queue --queue-name mi-cola

# Guarda la URL
QUEUE_URL=$(aws sqs get-queue-url --queue-name mi-cola --query QueueUrl --output text)

# Envía un mensaje
aws sqs send-message \
  --queue-url $QUEUE_URL \
  --message-body '{"id":"001","titulo":"Aprender SQS","estado":"pendiente"}'

# Recibe el mensaje (observa el ReceiptHandle)
aws sqs receive-message --queue-url $QUEUE_URL --max-number-of-messages 1

# Guarda el ReceiptHandle y elimina el mensaje
RECEIPT=$(aws sqs receive-message --queue-url $QUEUE_URL --query "Messages[0].ReceiptHandle" --output text)
aws sqs delete-message --queue-url $QUEUE_URL --receipt-handle "$RECEIPT"
```

### Cola FIFO (orden garantizado)
```bash
aws sqs create-queue \
  --queue-name pedidos.fifo \
  --attributes FifoQueue=true,ContentBasedDeduplication=true

FIFO_URL=$(aws sqs get-queue-url --queue-name pedidos.fifo --query QueueUrl --output text)

aws sqs send-message \
  --queue-url $FIFO_URL \
  --message-body "Paso 1 del pedido" \
  --message-group-id "cliente-alice"

aws sqs send-message \
  --queue-url $FIFO_URL \
  --message-body "Paso 2 del pedido" \
  --message-group-id "cliente-alice"
```

### Dead Letter Queue
```bash
# 1. Crea la DLQ
aws sqs create-queue --queue-name mi-cola-dlq

DLQ_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name mi-cola-dlq --query QueueUrl --output text) \
  --attribute-names QueueArn \
  --query Attributes.QueueArn --output text)

# 2. Enlaza con maxReceiveCount=2 (va a DLQ si falla 2 veces)
aws sqs set-queue-attributes \
  --queue-url $QUEUE_URL \
  --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":\\\"2\\\"}\"}"
```

### Long polling (eficiente, no desperdicia llamadas)
```bash
aws sqs receive-message \
  --queue-url $QUEUE_URL \
  --wait-time-seconds 20   # Espera hasta 20s si no hay mensajes
```

### Consumidor Python idempotente
```python
import boto3

sqs = boto3.client("sqs",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

queue_url = sqs.get_queue_url(QueueName="mi-cola")["QueueUrl"]

while True:
    resp = sqs.receive_message(QueueUrl=queue_url, MaxNumberOfMessages=1, WaitTimeSeconds=10)
    msgs = resp.get("Messages", [])
    if not msgs:
        continue

    msg = msgs[0]
    body = msg["Body"]
    receipt = msg["ReceiptHandle"]

    # Lógica idempotente: verifica si ya procesaste este mensaje
    print(f"Procesando: {body}")

    # Solo elimina si el procesamiento tuvo éxito
    sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt)
```

---

## GCP Pub/Sub con Floci-gcp

Pub/Sub es diferente: usa **topics** y **subscriptions**. Múltiples suscripciones pueden recibir el mismo mensaje (fan-out).

```bash
export PUBSUB_EMULATOR_HOST=localhost:4588

# Crea topic y suscripción
gcloud pubsub topics create mi-topic
gcloud pubsub subscriptions create mi-sub --topic mi-topic

# Publica un mensaje
gcloud pubsub topics publish mi-topic --message "Hola Pub/Sub"

# Lee mensajes
gcloud pubsub subscriptions pull mi-sub --auto-ack --limit 10
```

```python
import os
os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:4588"

from google.cloud import pubsub_v1

project = "floci-local"
publisher = pubsub_v1.PublisherClient()
subscriber = pubsub_v1.SubscriberClient()

topic_path = publisher.topic_path(project, "mi-topic")
sub_path = subscriber.subscription_path(project, "mi-sub")

# Publicar
publisher.create_topic(request={"name": topic_path})
future = publisher.publish(topic_path, b"Hola desde Python!")
future.result()

# Suscribirse y leer
subscriber.create_subscription(request={"name": sub_path, "topic": topic_path})
response = subscriber.pull(request={"subscription": sub_path, "max_messages": 5})
for msg in response.received_messages:
    print(msg.message.data.decode())
    subscriber.acknowledge(request={"subscription": sub_path, "ack_ids": [msg.ack_id]})
```

---

## Azure Service Bus con Floci-az

```bash
eval $(floci az env)
```

```python
from azure.servicebus import ServiceBusClient, ServiceBusMessage

# La connection string apunta al AMQP de Floci-az (puerto 5673)
conn_str = "Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=test=="

with ServiceBusClient.from_connection_string(conn_str) as client:
    sender = client.get_queue_sender("mi-cola-azure")
    with sender:
        sender.send_messages(ServiceBusMessage("Hola Azure Service Bus"))

    receiver = client.get_queue_receiver("mi-cola-azure", max_wait_time=5)
    with receiver:
        for msg in receiver:
            print(str(msg))
            receiver.complete_message(msg)
```

---

## Comparación

| | SQS (AWS) | Service Bus (Azure) | Pub/Sub (GCP) |
|-|-----------|---------------------|---------------|
| Modelo | Cola 1:1 | Cola o Topic | Topic/Subscription |
| Orden garantizado | Solo FIFO | Con Sessions | No por defecto |
| Múltiples consumidores | No (cola) | Con Topics | Sí (varias suscripciones) |
| Retención | 14 días | 14 días | 7 días |

---

## Reto del módulo

1. Crea una cola SQS y envía 5 mensajes JSON de tareas
2. Escribe un consumidor Python que procese y elimine cada mensaje
3. Configura una DLQ con `maxReceiveCount=2` y fuerza 2 fallos para ver el mensaje en la DLQ
4. (Bonus) Replica el mismo flujo con GCP Pub/Sub usando Floci-gcp

## Preguntas de salida

1. ¿Por qué un mensaje SQS puede llegar dos veces?
2. ¿Qué diferencia hay entre una cola SQS y un topic SNS/Pub/Sub?
3. ¿Cuándo usar FIFO y cuándo estándar?
4. ¿Qué es idempotencia y por qué es obligatoria en consumidores de colas?
## Verificación del aprendizaje

Antes de marcar este módulo como completado, confirma esto con evidencia propia:

1. **Lo puedo explicar en una frase.** Escribe qué problema resuelve este módulo y para qué lo usarías en una aplicación real.
2. **Lo ejecuté, no solo lo leí.** Guarda el comando principal que corriste y una salida real de tu terminal.
3. **Lo puedo verificar.** Consulta el recurso con AWS CLI, Azure CLI, GCP CLI o StackPort cuando aplique. La evidencia debe mostrar nombre, estado o contenido del recurso.
4. **Entiendo un fallo común.** Provoca o identifica un error sencillo, copia el mensaje completo y explica cómo lo diagnosticaste.
5. **Sé cuándo avanzar.** Avanza solo si puedes repetir el laboratorio desde una carpeta limpia sin depender de copiar a ciegas.

Evidencia mínima sugerida:

```text
Comando ejecutado:
Salida obtenida:
Qué significa la salida:
Error o duda encontrada:
Cómo la resolví:
```

