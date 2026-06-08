# Módulo 13 · Streaming en tiempo real: Kinesis y MSK (Kafka)

## Procesamiento de datos en tiempo real vs por lotes

| | Batch (por lotes) | Stream (en tiempo real) |
|-|-------------------|------------------------|
| Cuándo procesas | Horas/días después | Milisegundos/segundos después |
| Ejemplo | Reporte mensual de ventas | Detección de fraude mientras paga |
| Herramienta AWS | Glue, EMR | Kinesis, MSK |
| Herramienta local | Athena + S3 | Kinesis + Floci |

---

## Amazon Kinesis Data Streams

Kinesis es el sistema de streaming de AWS. Piénsalo como SQS pero para flujos de datos masivos y ordenados.

```bash
eval $(floci env)

# Crea un stream con 2 shards
aws kinesis create-stream \
  --stream-name mi-stream \
  --shard-count 2

# Espera a que esté activo
aws kinesis describe-stream-summary \
  --stream-name mi-stream

# Escribe registros al stream
aws kinesis put-record \
  --stream-name mi-stream \
  --partition-key usuario-alice \
  --data $(echo -n '{"usuario":"alice","evento":"compra","total":59.99,"ts":"2024-01-15T10:30:00Z"}' | base64)

# Escribe múltiples registros de una vez
aws kinesis put-records \
  --stream-name mi-stream \
  --records '[
    {"Data":"eyJ1c3VhcmlvIjoiYm9iIiwiZXZlbnRvIjoidmlzdGEiLCJwcm9kdWN0byI6IkExMjMifQ==","PartitionKey":"usuario-bob"},
    {"Data":"eyJ1c3VhcmlvIjoiYWxpY2UiLCJldmVudG8iOiJjbGljayIsImJ1dHRvbiI6ImNvbXByYXIifQ==","PartitionKey":"usuario-alice"}
  ]'

# Lee registros
SHARD_ID=$(aws kinesis list-shards --stream-name mi-stream --query "Shards[0].ShardId" --output text)

ITERATOR=$(aws kinesis get-shard-iterator \
  --stream-name mi-stream \
  --shard-id $SHARD_ID \
  --shard-iterator-type TRIM_HORIZON \
  --query ShardIterator --output text)

aws kinesis get-records \
  --shard-iterator $ITERATOR \
  --limit 10
```

### Consumidor Python de Kinesis

```python
import boto3, base64, json, time

kinesis = boto3.client("kinesis",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

def publicar_evento(stream_name, usuario, evento):
    kinesis.put_record(
        StreamName=stream_name,
        PartitionKey=f"usuario-{usuario}",
        Data=json.dumps({"usuario": usuario, "evento": evento}).encode()
    )

def consumir_stream(stream_name):
    shards = kinesis.list_shards(StreamName=stream_name)["Shards"]

    for shard in shards:
        iter_resp = kinesis.get_shard_iterator(
            StreamName=stream_name,
            ShardId=shard["ShardId"],
            ShardIteratorType="TRIM_HORIZON"
        )
        iterator = iter_resp["ShardIterator"]

        while True:
            resp = kinesis.get_records(ShardIterator=iterator, Limit=25)
            records = resp["Records"]

            for record in records:
                datos = json.loads(record["Data"].decode())
                print(f"Registro: {datos}")

            iterator = resp.get("NextShardIterator")
            if not records:
                time.sleep(1)

consumir_stream("mi-stream")
```

---

## MSK — Managed Streaming for Kafka

Floci incluye **MSK con Kafka real (Redpanda)**. Es el sistema de streaming más usado en la industria.

```bash
# Crea un cluster MSK
aws kafka create-cluster \
  --cluster-name mi-kafka \
  --kafka-version 3.5.1 \
  --number-of-broker-nodes 3 \
  --broker-node-group-info '{
    "InstanceType":"kafka.m5.large",
    "ClientSubnets":["subnet-12345"]
  }'

# Obtén los brokers
BROKERS=$(aws kafka get-bootstrap-brokers \
  --cluster-arn arn:aws:kafka:us-east-1:000000000000:cluster/mi-kafka/... \
  --query BootstrapBrokerString --output text)
```

### Kafka con CLI (kafka-topics.sh)

```bash
# Si tienes Kafka instalado localmente
BOOTSTRAP="localhost:9092"  # Puerto MSK de Floci

# Crea un topic
kafka-topics.sh --bootstrap-server $BOOTSTRAP \
  --create --topic eventos-usuario --partitions 3 --replication-factor 1

# Lista topics
kafka-topics.sh --bootstrap-server $BOOTSTRAP --list

# Produce mensajes
echo '{"usuario":"alice","evento":"login"}' | \
  kafka-console-producer.sh --bootstrap-server $BOOTSTRAP --topic eventos-usuario

# Consume mensajes
kafka-console-consumer.sh --bootstrap-server $BOOTSTRAP \
  --topic eventos-usuario --from-beginning
```

### Kafka con Python (kafka-python)

```python
from kafka import KafkaProducer, KafkaConsumer
import json

# Productor
producer = KafkaProducer(
    bootstrap_servers=["localhost:9092"],
    value_serializer=lambda v: json.dumps(v).encode()
)

for i in range(10):
    producer.send("eventos-usuario", {
        "usuario": f"usuario-{i}",
        "evento": "compra",
        "total": i * 15.99
    })

producer.flush()
print("10 mensajes enviados")

# Consumidor (en otro proceso)
consumer = KafkaConsumer(
    "eventos-usuario",
    bootstrap_servers=["localhost:9092"],
    auto_offset_reset="earliest",
    group_id="grupo-analitica",
    value_deserializer=lambda v: json.loads(v.decode())
)

for msg in consumer:
    dato = msg.value
    print(f"Offset {msg.offset}: {dato['usuario']} hizo {dato['evento']}")
```

---


## Cuándo usar Streaming vs Cola

| Escenario | Usa |
|-----------|-----|
| Procesar cada mensaje exactamente una vez | SQS |
| Múltiples consumidores leen el mismo flujo | Kinesis / Kafka |
| Necesitas replay (leer mensajes del pasado) | Kinesis / Kafka |
| Análisis en tiempo real | Kinesis + Lambda |
| Alta escala con consumer groups | MSK / Kafka |

## Reto del módulo

1. Crea un Kinesis Data Stream con 2 shards
2. Escribe un productor Python que envíe 20 eventos de click de usuario
3. Escribe un consumidor Python que lea todos los eventos y cuente clics por usuario
4. Crea un cluster MSK y un topic `eventos-usuario` con 3 particiones
5. Produce 10 mensajes con `kafka-console-producer.sh` y consúmelos con `kafka-console-consumer.sh`
6. Compara: ¿cuánto tarda el consumer en Kinesis vs Kafka para leer los mismos 10 mensajes?

## Preguntas de salida

1. ¿Cuándo usarías Kinesis sobre SQSé
2. ¿Qué es un consumer group en Kafka y para qué sirve?
3. ¿Qué diferencia hay entre Kinesis Data Streams y Kinesis Data Firehose?
4. ¿Por qué Kafka mantiene los mensajes después de que el consumidor los lee?
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

