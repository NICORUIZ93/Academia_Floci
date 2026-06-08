# Módulo 17 · Proyecto final: aplicación multi-cloud de producción

## Lo que vas a construir

Una aplicación completa de **gestión de tareas colaborativas** que usa los tres proveedores de nube simultáneamente, con todos los patrones que aprendiste en este curso.

### Arquitectura objetivo

```
Cliente (web/mobile)
        │
        ▼
  Route53 → ALB
        │
        ▼
  API Gateway (HTTP)
        │
  ┌─────┴──────────────────────┐
  │                            │
  ▼                            ▼
Lambda: API Tareas      Lambda: Autenticación
  │                            │
  ├─ DynamoDB (Tareas)         └─ Cognito (Usuarios)
  ├─ ElastiCache (Caché)
  ├─ SQS (Notificaciones)
  └─ S3 (Adjuntos)
        │
        ▼
  SNS → SQS Correo → Lambda Email
      └─ SQS Push → Lambda Notificación Push

STREAMS:
  DynamoDB Streams → Kinesis → Lambda Analítica → S3 Data Lake
                                                 → Athena Consultas

AZURE (floci-az):
  Azure Blob Storage ← Backup diario desde S3

GCP (floci-gcp):
  GCP Pub/Sub ← Eventos de dominio globales
  GCP Firestore ← Sincronización offline
```

---

## Fase 1: Infraestructura base con CloudFormation

```bash
eval $(floci env)
eval $(floci az env)
export PUBSUB_EMULATOR_HOST=localhost:4588
export FIRESTORE_EMULATOR_HOST=localhost:4588

cat > infra-base.yaml << 'EOF'
AWSTemplateFormatVersion: "2010-09-09"
Description: Infraestructura base del proyecto final

Resources:
  # Almacenamiento
  BucketAdjuntos:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: proyecto-final-adjuntos
      VersioningConfiguration:
        Status: Enabled

  BucketDataLake:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: proyecto-final-datalake

  # Base de datos
  TablaTareas:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: TareasProyecto
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
        - AttributeName: estado
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      BillingMode: PAY_PER_REQUEST
      GlobalSecondaryIndexes:
        - IndexName: estado-index
          KeySchema:
            - AttributeName: estado
              KeyType: HASH
          Projection:
            ProjectionType: ALL
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES

  # Messaging
  ColaNotificaciones:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: proyecto-notificaciones
      VisibilityTimeout: 60

  TopicEventos:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: proyecto-eventos

  # Secrets
  SecretoApp:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: proyecto-final/config
      SecretString: '{"jwt_secret":"super-secreto-2024","api_version":"v1"}'

Outputs:
  TablaARN:
    Value: !GetAtt TablaTareas.Arn
  StreamARN:
    Value: !GetAtt TablaTareas.StreamArn
  TopicARN:
    Value: !Ref TopicEventos
  ColaURL:
    Value: !Ref ColaNotificaciones
EOF

aws cloudformation create-stack \
  --stack-name proyecto-final-infra \
  --template-body file://infra-base.yaml \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation wait stack-create-complete --stack-name proyecto-final-infra
echo "Infraestructura base lista"
```

---

## Fase 2: API de Tareas (Lambda + API Gateway)

```python
# api_tareas.py — Lambda principal
import boto3, json, os
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb",
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:4566"),
    region_name="us-east-1", aws_access_key_id="test", aws_secret_access_key="test")

sns = boto3.client("sns",
    endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "http://localhost:4566"),
    region_name="us-east-1", aws_access_key_id="test", aws_secret_access_key="test")

TABLE_NAME = os.environ.get("TABLA_NOMBRE", "TareasProyecto")
TOPIC_ARN = os.environ.get("TOPIC_ARN", "")

def handler(event, context):
    metodo = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    path = event.get("rawPath", "")
    path_params = event.get("pathParameters") or {}
    body = json.loads(event.get("body") or "{}")
    query = event.get("queryStringParameters") or {}

    # Extrae usuario del token JWT (simplificado para el laboratorio)
    usuario = event.get("headers", {}).get("x-usuario", "anonimo")

    table = dynamodb.Table(TABLE_NAME)

    try:
        # GET /tareas
        if path == "/tareas" and metodo == "GET":
            estado = query.get("estado")
            if estado:
                resp = table.query(
                    IndexName="estado-index",
                    KeyConditionExpression=Key("estado").eq(estado)
                )
            else:
                resp = table.query(
                    KeyConditionExpression=Key("PK").eq(f"USER#{usuario}")
                )
            return {"statusCode": 200, "body": json.dumps(resp["Items"])}

        # POST /tareas
        elif path == "/tareas" and metodo == "POST":
            if not body.get("titulo"):
                return {"statusCode": 400, "body": json.dumps({"error": "titulo es requerido"})}

            import uuid
            tarea_id = str(uuid.uuid4())[:8]
            tarea = {
                "PK": f"USER#{usuario}",
                "SK": f"TAREA#{tarea_id}",
                "id": tarea_id,
                "titulo": body["titulo"],
                "descripcion": body.get("descripcion", ""),
                "estado": "pendiente",
                "usuario": usuario,
                "prioridad": body.get("prioridad", "normal")
            }

            table.put_item(Item=tarea)

            # Notifica via SNS
            if TOPIC_ARN:
                sns.publish(
                    TopicArn=TOPIC_ARN,
                    Message=json.dumps({"tipo": "TAREA_CREADA", "tarea": tarea}),
                    Subject="Nueva tarea creada"
                )

            return {"statusCode": 201, "body": json.dumps(tarea)}

        # GET /tareas/{id}
        elif "/tareas/" in path and metodo == "GET":
            tarea_id = path_params.get("id") or path.split("/")[-1]
            resp = table.get_item(Key={"PK": f"USER#{usuario}", "SK": f"TAREA#{tarea_id}"})
            if "Item" not in resp:
                return {"statusCode": 404, "body": json.dumps({"error": "Tarea no encontrada"})}
            return {"statusCode": 200, "body": json.dumps(resp["Item"])}

        # PATCH /tareas/{id}
        elif "/tareas/" in path and metodo == "PATCH":
            tarea_id = path_params.get("id") or path.split("/")[-1]
            nuevo_estado = body.get("estado")
            if nuevo_estado not in ["pendiente", "en_progreso", "completada", "cancelada"]:
                return {"statusCode": 422, "body": json.dumps({"error": "Estado inválido"})}

            table.update_item(
                Key={"PK": f"USER#{usuario}", "SK": f"TAREA#{tarea_id}"},
                UpdateExpression="SET estado = :e",
                ExpressionAttributeValues={":e": nuevo_estado}
            )
            return {"statusCode": 200, "body": json.dumps({"actualizado": True})}

        # DELETE /tareas/{id}
        elif "/tareas/" in path and metodo == "DELETE":
            tarea_id = path_params.get("id") or path.split("/")[-1]
            table.delete_item(Key={"PK": f"USER#{usuario}", "SK": f"TAREA#{tarea_id}"})
            return {"statusCode": 204, "body": ""}

        return {"statusCode": 404, "body": json.dumps({"error": "Ruta no encontrada"})}

    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
```

---

## Fase 3: Backup automático a Azure

```python
# backup_azure.py — Lambda que copia datos de DynamoDB a Azure Blob
import boto3, json
from azure.storage.blob import BlobServiceClient
from datetime import datetime

dynamodb = boto3.resource("dynamodb", endpoint_url="http://localhost:4566",
    region_name="us-east-1", aws_access_key_id="test", aws_secret_access_key="test")

CONN_STR = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBI+LGos6/1==;BlobEndpoint=http://localhost:4577/devstoreaccount1;"

def handler(event, context):
    table = dynamodb.Table("TareasProyecto")
    resp = table.scan()
    tareas = resp["Items"]

    # Serializa
    datos = json.dumps(tareas, default=str)

    # Sube a Azure Blob
    cliente = BlobServiceClient.from_connection_string(CONN_STR)
    contenedor = cliente.get_container_client("backups-aws")
    try:
        contenedor.create_container()
    except:
        pass

    fecha = datetime.utcnow().strftime("%Y/%m/%d")
    nombre_blob = f"{fecha}/tareas-backup.json"
    contenedor.upload_blob(nombre_blob, datos.encode(), overwrite=True)

    return {
        "statusCode": 200,
        "body": json.dumps({"backup": nombre_blob, "registros": len(tareas)})
    }
```

---

## Fase 4: Eventos globales con GCP Pub/Sub

```python
# eventos_gcp.py — publica eventos de dominio a GCP Pub/Sub
import os, json
os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:4588"

from google.cloud import pubsub_v1

publisher = pubsub_v1.PublisherClient()
PROJECT = "floci-local"
TOPIC = "eventos-tareas"

topic_path = publisher.topic_path(PROJECT, TOPIC)

def publicar_evento(tipo, datos):
    try:
        publisher.create_topic(request={"name": topic_path})
    except:
        pass

    evento = json.dumps({"tipo": tipo, "datos": datos, "origen": "aws"}).encode()
    future = publisher.publish(topic_path, evento)
    msg_id = future.result()
    return msg_id

# Desde la Lambda de tareas:
# publicar_evento("TAREA_COMPLETADA", {"tarea_id": "abc", "usuario": "alice"})
```

---

## Fase 5: Pruebas de integración end-to-end

```python
#!/usr/bin/env python3
# test_integracion.py
import requests, json, boto3, time

BASE = "http://localhost:4566/restapis/{api_id}/dev/_user_request_"
HEADERS = {"x-usuario": "alice", "Content-Type": "application/json"}

def test_ciclo_completo():
    print("=== Test de ciclo completo de tarea ===")

    # 1. Crea tarea
    resp = requests.post(f"{BASE}/tareas", headers=HEADERS,
        json={"titulo": "Tarea de prueba E2E", "prioridad": "alta"})
    assert resp.status_code == 201, f"Error creando: {resp.text}"
    tarea = resp.json()
    tarea_id = tarea["id"]
    print(f"✓ Tarea creada: {tarea_id}")

    # 2. Verifica que existe
    resp = requests.get(f"{BASE}/tareas/{tarea_id}", headers=HEADERS)
    assert resp.status_code == 200
    print("✓ Tarea encontrada")

    # 3. Actualiza estado
    resp = requests.patch(f"{BASE}/tareas/{tarea_id}", headers=HEADERS,
        json={"estado": "completada"})
    assert resp.status_code == 200
    print("✓ Estado actualizado a 'completada'")

    # 4. Verifica en DynamoDB directamente
    time.sleep(0.5)
    dynamo = boto3.resource("dynamodb", endpoint_url="http://localhost:4566",
        region_name="us-east-1", aws_access_key_id="test", aws_secret_access_key="test")
    table = dynamo.Table("TareasProyecto")
    item = table.get_item(Key={"PK": "USER#alice", "SK": f"TAREA#{tarea_id}"})
    assert item["Item"]["estado"] == "completada"
    print("✓ DynamoDB actualizado correctamente")

    # 5. Elimina la tarea
    resp = requests.delete(f"{BASE}/tareas/{tarea_id}", headers=HEADERS)
    assert resp.status_code == 204
    print("✓ Tarea eliminada")

    print("\n=== ✓ Todos los tests pasaron ===")

if __name__ == "__main__":
    test_ciclo_completo()
```

---

## Checklist de producción

Antes de considerar una aplicación lista para producción, verifica:

**Seguridad**
- [ ] Ninguna credencial en el código (usa Secrets Manager)
- [ ] Todos los roles IAM con mínimo privilegio
- [ ] HTTPS en todos los endpoints (ACM + ALB)
- [ ] Validación de input en cada Lambda

**Disponibilidad**
- [ ] Health checks en el Target Group
- [ ] Multi-AZ en RDS y ElastiCache
- [ ] DLQ configurada en todas las colas SQS
- [ ] Reintentos con backoff exponencial en las Lambdas

**Observabilidad**
- [ ] Logs estructurados en JSON a CloudWatch
- [ ] Métricas de latencia y errores
- [ ] Alarmás configuradas
- [ ] Dashboard con los KPIs del servicio

**CI/CD**
- [ ] Pipeline automatizado: commit → tests → deploy
- [ ] Smoke tests tras cada despliegue
- [ ] Estrategia Blue/Green o Canary
- [ ] Rollback automático si los smoke tests fallan

---

## Reto final

**Construye y despliega la aplicación completa:**

1. Despliega la infraestructura con CloudFormation
2. Empaqueta y despliega la Lambda de API
3. Crea el API Gateway y conecta las rutas
4. Ejecuta los tests de integración E2E
5. Configura el backup automático a Azure Blob
6. Publica eventos a GCP Pub/Sub cuando se completa una tarea
7. Despliega CloudWatch con métricas y al menos una alarma

**Criterios de éxito:**
- Los 5 métodos HTTP de la API funcionan correctamente
- El backup llega a Azure Blob con el JSON de tareas
- Los eventos aparecen en el topic de GCP Pub/Sub
- Las métricas de latencia se publican en CloudWatch
- Los tests E2E pasan todos

---

## Lo que has aprendido

Llegaste de cero al siguiente nivel de conocimiento:

| Módulo | Lo que aprendiste |
|--------|-----------------|
| 0 | Instalar y configurar Floci (AWS + Azure + GCP) |
| 1 | Almacenamiento de objetos en los 3 proveedores |
| 2 | Colas de mensajes: SQS, Service Bus, Pub/Sub |
| 3 | NoSQL: DynamoDB, Cosmos DB, Firestore |
| 4 | Funciones serverless: Lambda, Azure Functions |
| 5 | API Gateway y diseño de APIs REST |
| 6 | IAM, Secrets Manager, KMS — seguridad |
| 7 | SNS, EventBridge, Cognito — eventos y auth |
| 8 | CloudFormation — infraestructura como código |
| 9 | RDS (PostgreSQL real) + ElastiCache (Redis real) |
| 10 | ECS, ECR, EKS — contenedores |
| 11 | CloudWatch — logs, métricas y alarmás |
| 12 | Step Functions — flujos de trabajo complejos |
| 13 | Kinesis, MSK, Athena — streaming y analítica |
| 14 | VPC, Route53, ALB — redes |
| 15 | CodeBuild, CodeDeploy, CI/CD |
| 16 | Bedrock, Textract, Transcribe — IA |
| 17 | Proyecto final multi-cloud de producción |

**Felicitaciones. Estás listo para trabajar con la nube en producción.**
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

