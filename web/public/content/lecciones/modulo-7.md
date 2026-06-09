# Módulo 7 · Mensajería Pub/Sub: SNS y EventBridge

## Arquitecturas orientadas a eventos

En una arquitectura orientada a eventos, los componentes se comunican publicando y reaccionando a eventos, no llamándose directamente. Esto hace el sistema más resiliente: si un consumidor falla, el evento persiste.

| Servicio | Propósito |
|---------|-----------|
| **SNS** | Fan-out: un mensaje llega a N suscriptores simultáneamente |
| **EventBridge** | Bus de eventos corporativo: reglas + patrones + scheduling |
| **Cognito** | Autenticación de usuarios |

---

## SNS — Simple Notification Service

SNS es un servicio de publicación-suscripción (pub/sub). Diferente a SQS (que es una cola 1:1), SNS envía el mismo mensaje a **todos los suscriptores a la vez**.

```bash
eval $(floci env)

# Crea un topic SNS
TOPIC_ARN=$(aws sns create-topic \
  --name mi-topic \
  --query TopicArn --output text)

echo "Topic ARN: $TOPIC_ARN"

# Suscribe un email (en Floci no envía emails reales, pero simula la suscripción)
aws sns subscribe \
  --topic-arn $TOPIC_ARN \
  --protocol email \
  --notification-endpoint alice@ejemplo.com

# Suscribe una cola SQS al topic (fan-out: SNS → múltiples SQS)
QUEUE_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name mi-cola --query QueueUrl --output text) \
  --attribute-names QueueArn \
  --query Attributes.QueueArn --output text)

aws sns subscribe \
  --topic-arn $TOPIC_ARN \
  --protocol sqs \
  --notification-endpoint $QUEUE_ARN

# Publica un mensaje (llega a TODOS los suscriptores)
aws sns publish \
  --topic-arn $TOPIC_ARN \
  --message "Pedido completado" \
  --subject "Notificacion de sistema"

# Lista suscripciones
aws sns list-subscriptions-by-topic --topic-arn $TOPIC_ARN

# Lista topics
aws sns list-topics
```

### Patrón SNS → SQS (fan-out)

```
Evento de pedido
       │
       ▼
  SNS Topic (pedidos)
  ┌────┴────┐
  │         │
  ▼         ▼
 SQS       SQS
(correo) (inventario)
  │         │
  ▼         ▼
Lambda   Lambda
(envía    (actualiza
 email)    stock)
```

```python
import boto3, json

sns = boto3.client("sns",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

def notificar_pedido(topic_arn, pedido_id, total):
    sns.publish(
        TopicArn=topic_arn,
        Message=json.dumps({
            "pedido_id": pedido_id,
            "total": total,
            "estado": "completado"
        }),
        MessageAttributes={
            "tipo_evento": {
                "DataType": "String",
                "StringValue": "PEDIDO_COMPLETADO"
            }
        }
    )
```

---

## EventBridge — bus de eventos corporativo

EventBridge es más poderoso que SNS: permite filtrar eventos con reglas complejas y tiene scheduler integrado.

```bash
# Crea un event bus personalizado
aws events create-event-bus --name mi-bus-eventos

# Publica un evento personalizado
aws events put-events \
  --entries '[{
    "Source":"com.miapp.pedidos",
    "DetailType":"PedidoCompletado",
    "Detail":"{\"pedidoId\":\"123\",\"total\":59.99,\"usuario\":\"alice\"}",
    "EventBusName":"mi-bus-eventos"
  }]'

# Crea una regla que capture eventos de pedidos
aws events put-rule \
  --name captura-pedidos \
  --event-bus-name mi-bus-eventos \
  --event-pattern '{
    "source": ["com.miapp.pedidos"],
    "detail-type": ["PedidoCompletado"]
  }' \
  --state ENABLED

# Conecta la regla con una Lambda (target)
RULE_ARN=$(aws events describe-rule \
  --name captura-pedidos \
  --event-bus-name mi-bus-eventos \
  --query RuleArn --output text)

aws events put-targets \
  --rule captura-pedidos \
  --event-bus-name mi-bus-eventos \
  --targets '[{
    "Id":"1",
    "Arn":"arn:aws:lambda:us-east-1:000000000000:function:mi-funcion"
  }]'
```

### EventBridge Scheduler — cron en la nube

```bash
# Ejecuta una Lambda cada 5 minutos
aws scheduler create-schedule \
  --name tarea-periodica \
  --schedule-expression "rate(5 minutes)" \
  --target '{"Arn":"arn:aws:lambda:us-east-1:000000000000:function:mi-funcion","RoleArn":"arn:aws:iam::000000000000:role/rol-scheduler","Input":"{\"tipo\":\"limpieza\"}"}' \
  --flexible-time-window '{"Mode":"OFF"}'

# Cron específico: cada día a las 9am UTC (lunes a viernes)
aws scheduler create-schedule \
  --name reporte-diario \
  --schedule-expression "cron(0 9 ? * MON-FRI *)" \
  --target '{"Arn":"arn:aws:lambda:us-east-1:000000000000:function:generar-reporte","RoleArn":"arn:aws:iam::000000000000:role/rol-scheduler","Input":"{}"}'
```

---


## Comparación de mensajería en los tres proveedores

| | SNS (AWS) | Event Grid (Azure) | Pub/Sub (GCP) |
|-|-----------|--------------------|---------------|
| Fan-out | Topic → N suscriptores | Topic → N handlers | Topic → N subscriptions |
| Scheduling | EventBridge Scheduler | Logic Apps | Cloud Scheduler |
| Bus de eventos | EventBridge | Event Hubs | Eventarc |

## Reto del módulo

1. Crea un topic SNS y suscribe dos colas SQS distintas al mismo topic
2. Publica un mensaje al topic y verifica que llega a **ambas** colas (fan-out)
3. Crea un Event Bus personalizado en EventBridge con una regla que filtre por `source: "mi.app"`
4. Envía un evento al bus y verifica que la Lambda objetivo se invoca
5. Configura un EventBridge Scheduler que invoque tu Lambda cada 1 minuto

## Preguntas de salida

1. ¿Cuál es la diferencia entre SNS y SQS?
2. ¿Por qué el patrón SNS + SQS (fan-out a colas) es más robusto que SNS solo?
3. ¿Cuándo usarías EventBridge en lugar de SNS?
4. ¿Qué ventaja tiene EventBridge Scheduler sobre un cron en EC2?
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

