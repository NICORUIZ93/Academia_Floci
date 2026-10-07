# Cloud Runbooks — Troubleshooting Operacional

Guías paso-a-paso para diagnosticar y resolver problemas comunes en servicios AWS, Azure y GCP usados por RutaFlow. Cada runbook está basado en incidentes reales observados en operación.

---

## Runbook 1: DynamoDB Throttling

### Síntomas
- Errores `ProvisionedThroughputExceededException` en escrituras
- Latencia de respuesta > 2 segundos en queries
- `ConsumedWriteCapacityUnits` cercano o igual a `ProvisionedWriteCapacityUnits`
- Aplicación ralentizada intermitentemente durante picos de tráfico

### Diagnosis

**Paso 1: Verificar capacidad actual**
```bash
aws dynamodb describe-table --table-name RutaFlow-Tasks \
  --query 'Table.BillingModeSummary.BillingMode' \
  --output text
```
Salida esperada: `PROVISIONED` o `PAY_PER_REQUEST`

**Paso 2: Si PROVISIONED, revisar capacidad reservada**
```bash
aws dynamodb describe-table --table-name RutaFlow-Tasks \
  --query 'Table.ProvisionedThroughput' \
  --output json
```
Salida esperada:
```json
{
  "ReadCapacityUnits": 100,
  "WriteCapacityUnits": 50,
  "LastUpdateToPayPerRequestDateTime": "2026-10-06T..."
}
```

**Paso 3: Revisar métricas de consumo en CloudWatch**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=RutaFlow-Tasks \
  --start-time 2026-10-06T10:00:00Z \
  --end-time 2026-10-06T12:00:00Z \
  --period 60 \
  --statistics Sum,Average \
  --output table
```
Si `Sum` toca o supera `ProvisionedWriteCapacityUnits * 60 segundos`, hay throttling.

**Paso 4: Inspeccionar patrón de acceso**
Habilitar DynamoDB Streams y Analytics (gratuito durante 7 días):
```bash
aws dynamodb describe-table --table-name RutaFlow-Tasks \
  --query 'Table.StreamSpecification' \
  --output json
```

### Solución

**Root cause más común:** Capacidad reservada insuficiente en horarios pico + burst de escrituras simultáneas (ej. guardado de múltiples tareas en paralelo).

**Fix inmediato (escalado manual):**
```bash
# Aumentar capacidad al triple por 24 horas
aws dynamodb update-table \
  --table-name RutaFlow-Tasks \
  --provisioned-throughput ReadCapacityUnits=300,WriteCapacityUnits=150
```
Esperar ~1 min a que el cambio se propague. Verificar:
```bash
aws dynamodb describe-table --table-name RutaFlow-Tasks \
  --query 'Table.TableStatus' --output text
```
Salida esperada: `ACTIVE`

**Fix permanente: Cambiar a PAY_PER_REQUEST (sin límite, pago por uso)**
```bash
aws dynamodb update-table \
  --table-name RutaFlow-Tasks \
  --billing-mode PAY_PER_REQUEST
```
⚠️ Costo: aumenta si hay alto volumen consistente. Validar primero con analytics.

**Fix permanente alternativo: Auto-scaling**
```bash
# Registrar tabla en Application Auto Scaling
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id table/RutaFlow-Tasks \
  --scalable-dimension dynamodb:table:WriteCapacityUnits \
  --min-capacity 50 \
  --max-capacity 500

# Crear policy de scaling (escala +50% si usa >70% capacidad, baja -30% si usa <30%)
aws application-autoscaling put-scaling-policy \
  --policy-name rutaflow-tasks-write-scaling \
  --service-namespace dynamodb \
  --resource-id table/RutaFlow-Tasks \
  --scalable-dimension dynamodb:table:WriteCapacityUnits \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    TargetValue=70.0,PredefinedMetricSpecification={PredefinedMetricType=DynamoDBWriteCapacityUtilization},ScaleOutCooldown=60,ScaleInCooldown=300
```

### Validación
```bash
# Verificar que throttling desapareció
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name UserErrors \
  --dimensions Name=TableName,Value=RutaFlow-Tasks \
  --start-time 2026-10-06T12:00:00Z \
  --end-time 2026-10-06T14:00:00Z \
  --period 60 \
  --statistics Sum \
  --output table
```
Salida esperada: `0`

### Prevención
- Monitorear `ProvisionedThroughput` usage > 80% como alertas en CloudWatch
- Usar DynamoDB autoscaling desde el inicio para tables de producción
- Revisar patrón de acceso mensualmente (¿hay picos predecibles?)
- Considerar GSI (Global Secondary Indexes) para queries complejas que estarían haciéndose full-scan

---

## Runbook 2: Lambda Cold Starts

### Síntomas
- Primera invocación de Lambda tardía (>2-5 segundos)
- Latencia inconsistente en API Gateway (algunos requests toman 3-5s, otros <500ms)
- Cloudwatch Logs muestra duración variable entre "Init Duration" y "Duration"
- Errores de timeout ocasionales tras horas sin invocaciones

### Diagnosis

**Paso 1: Revisar si hay cold starts en logs**
```bash
aws logs tail /aws/lambda/RutaFlow-APIHandler --follow
```
Buscar líneas con `REPORT RequestId` que muestren `Init Duration`:
```
REPORT RequestId: abc-def Duration: 4521.32 ms  Init Duration: 3254.41 ms  Billed Duration: 4600 ms
```
Si `Init Duration` > 1000ms, hay cold start.

**Paso 2: Revisar concurrencia reservada**
```bash
aws lambda get-function-concurrency --function-name RutaFlow-APIHandler
```
Si devuelve error `ResourceNotFoundException`, no hay límite explícito — el Lambda usa la cuota regional.

**Paso 3: Revisar tamaño de función y dependencias**
```bash
aws lambda get-function --function-name RutaFlow-APIHandler \
  --query 'Configuration.[Runtime,CodeSize,MemorySize,EphemeralStorage]' \
  --output json
```
Salida esperada:
```json
[
  "python3.12",
  5242880,
  256,
  512
]
```
CodeSize > 50MB = probable cold start lento.

**Paso 4: Revisar variable de entorno VPC (si está configurada)**
```bash
aws lambda get-function --function-name RutaFlow-APIHandler \
  --query 'Configuration.VpcConfig' --output json
```
Si tiene `SubnetIds` y `SecurityGroupIds`, hay overhead de ENI (hasta +1 segundo).

### Solución

**Root cause más común:** Tamaño de función grande + tiempo de inicialización de librerías pesadas (AWS SDK, ORM).

**Fix inmediato: Aumentar memoria (reduce tiempo de CPU durante init)**
```bash
aws lambda update-function-configuration \
  --function-name RutaFlow-APIHandler \
  --memory-size 512  # Duplicar memoria, duplica velocidad de CPU
```

**Fix permanente: Code optimization**
1. Mover inicializaciones fuera del handler (lazy loading):
```python
# ❌ ANTES: inicializa SIEMPRE
import boto3
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    table = dynamodb.Table('RutaFlow-Tasks')
    # ...

# ✅ DESPUÉS: inicializa solo si es necesario
dynamodb = None

def get_dynamodb():
    global dynamodb
    if dynamodb is None:
        import boto3
        dynamodb = boto3.resource('dynamodb')
    return dynamodb

def lambda_handler(event, context):
    table = get_dynamodb().Table('RutaFlow-Tasks')
    # ...
```

2. Reducir dependencias — usar AWS Lambda Powertools en lugar de múltiples librerías.

**Fix permanente alternativo: Provisioned Concurrency (mantener "warm")**
```bash
# Reservar 10 instancias de Lambda siempre activas
aws lambda put-provisioned-concurrency-config \
  --function-name RutaFlow-APIHandler \
  --provisioned-concurrent-executions 10 \
  --qualifier LIVE
```
⚠️ Costo: $0.015/hora/instancia = $3.60/día para 10 instancias.

### Validación
```bash
# Medir cold start después de cambios
aws logs filter-log-events \
  --log-group-name /aws/lambda/RutaFlow-APIHandler \
  --filter-pattern "Init Duration" \
  --start-time $(($(date +%s) * 1000 - 3600000)) \
  --output json | jq '.events[] | select(.message | contains("Init Duration"))'
```
Si no hay líneas, cold starts reducidos.

### Prevención
- Monitores CloudWatch: alarma si `Duration > 2000ms AND (InitDuration OR Errors)`
- Usar Lambda@Edge o CloudFront para cachear respuestas estáticas
- Ping periódico a Lambda si es crítico (e.g., cron cada 5 min)

---

## Runbook 3: S3 Lifecycle Policy Failures

### Síntomas
- Archivos viejos no se borran automáticamente
- Transición a Glacier nunca sucede
- Cloudtrail muestra errores `InvalidArgument` o regla simplemente no ejecuta
- Billing mensual incluye storage de objetos que deberían haber sido archivados

### Diagnosis

**Paso 1: Verificar política está activa**
```bash
aws s3api get-bucket-lifecycle-configuration --bucket rutaflow-data
```
Salida esperada: JSON con reglas. Si error `NoSuchLifecycleConfiguration`, no hay política.

**Paso 2: Validar sintaxis de regla (error común: formato incorrecto de fecha)**
```bash
aws s3api get-bucket-lifecycle-configuration --bucket rutaflow-data \
  --query 'Rules[0]' --output json
```
Buscar `Filter`, `Status` (debe ser "Enabled"), `Expiration` o `Transitions`.

**Paso 3: Revisar si hay conflicto con control de versión**
```bash
aws s3api get-bucket-versioning --bucket rutaflow-data
```
Si `Status: Enabled`, la política debe especificar `NoncurrentVersionExpiration` para versiones antiguas.

**Paso 4: Verificar si objetos cumplen el filtro**
```bash
# Listar objetos y ver cuándo se crearon
aws s3api list-objects-v2 --bucket rutaflow-data \
  --query 'Contents[?LastModified < `2026-08-06`].[Key,LastModified]' \
  --output table
```
Si hay objetos antiguos, la política debe aplicarles.

### Solución

**Root cause más común:** Política escrita con filtro incorrecto o regla deshabilitada (`Status: Disabled`).

**Fix inmediato: Habilitar regla si está deshabilitada**
```bash
aws s3api put-bucket-lifecycle-configuration --bucket rutaflow-data \
  --lifecycle-configuration '{
    "Rules": [
      {
        "Id": "ArchiveOldData",
        "Status": "Enabled",
        "Filter": {"Prefix": "backups/"},
        "Transitions": [
          {
            "Days": 30,
            "StorageClass": "GLACIER"
          }
        ],
        "Expiration": {
          "Days": 365
        }
      }
    ]
  }'
```

**Fix si versioning está activo:**
```bash
aws s3api put-bucket-lifecycle-configuration --bucket rutaflow-data \
  --lifecycle-configuration '{
    "Rules": [
      {
        "Id": "ArchiveAndDeleteOld",
        "Status": "Enabled",
        "Filter": {"Prefix": ""},
        "Transitions": [
          {
            "Days": 30,
            "StorageClass": "GLACIER"
          }
        ],
        "Expiration": {
          "Days": 365
        },
        "NoncurrentVersionTransitions": [
          {
            "NoncurrentDays": 7,
            "StorageClass": "GLACIER"
          }
        ],
        "NoncurrentVersionExpiration": {
          "NoncurrentDays": 30
        }
      }
    ]
  }'
```

**Validación:** S3 ejecuta Lifecycle tasks una vez cada 24 horas. Para testing inmediato, crear un objeto con fecha anterior:
```bash
# Crear objeto con fecha falsificada (simulación)
echo "test" | aws s3api put-object --bucket rutaflow-data --key "old-file.txt" \
  --metadata "creation-date=2026-01-01T00:00:00Z"
```
Esperar 24 horas o forzar revisión en consola AWS.

### Prevención
- Alerta mensual: revisar `BucketSizeBytes` por StorageClass en CloudWatch
- Validar política con `aws s3api get-bucket-lifecycle-configuration` antes de cambios
- Documentar cada regla: "archivos de backup → Glacier después de 30d, borrar después de 1 año"

---

## Runbook 4: API Gateway 403 Errors (CORS + Autenticación)

### Síntomas
- Cliente recibe `403 Forbidden` aunque recurso existe
- Navegador muestra `CORS policy: Access-Control-Allow-Origin` error
- Requests con `Authorization: Bearer <token>` rechazan aunque token es válido
- Mismo request funciona con `curl` pero no en navegador

### Diagnosis

**Paso 1: Diferenciar CORS de autenticación**
```bash
# Request con curl: evita CORS
curl -H "Authorization: Bearer $TOKEN" \
  https://api.rutaflow.dev/tasks
```
Si funciona con curl pero no en navegador, es CORS.

**Paso 2: Si es CORS, revisar configuración**
```bash
# Verificar método permite OPTIONS (preflight)
curl -X OPTIONS https://api.rutaflow.dev/tasks \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -v
```
Buscar en respuesta:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,PUT,DELETE
Access-Control-Max-Age: 3600
```
Si faltan headers, CORS está mal configurada.

**Paso 3: Si es autenticación, revisar Authorizer**
```bash
aws apigateway get-authorizers --rest-api-id abc123xyz
```
Salida esperada:
```json
{
  "items": [
    {
      "id": "auth123",
      "name": "CognitoAuth",
      "type": "COGNITO_USER_POOLS",
      "identitySource": "method.request.header.Authorization"
    }
  ]
}
```

**Paso 4: Validar token contra Cognito**
```bash
aws cognito-idp get-user --access-token $TOKEN \
  --user-pool-id us-east-1_ABC123xyz
```
Si error `NotAuthorizedException`, token expiró o es inválido.

### Solución

**Fix si es CORS:**
```bash
# Actualizar método para responder a OPTIONS
aws apigateway put-method --rest-api-id abc123xyz \
  --resource-id res123 \
  --http-method OPTIONS \
  --authorization-type NONE

# Agregar response CORS
aws apigateway put-method-response --rest-api-id abc123xyz \
  --resource-id res123 --http-method OPTIONS \
  --status-code 200 \
  --response-models '{}' \
  --response-parameters 'method.response.header.Access-Control-Allow-Headers=true,method.response.header.Access-Control-Allow-Methods=true,method.response.header.Access-Control-Allow-Origin=true'

# Mock integration para OPTIONS
aws apigateway put-integration --rest-api-id abc123xyz \
  --resource-id res123 --http-method OPTIONS \
  --type MOCK \
  --request-templates '{"application/json": "{\"statusCode\": 200}"}'

aws apigateway put-integration-response --rest-api-id abc123xyz \
  --resource-id res123 --http-method OPTIONS \
  --status-code 200 \
  --response-parameters 'method.response.header.Access-Control-Allow-Headers='"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key'"'"',method.response.header.Access-Control-Allow-Methods='"'"'GET,POST,PUT,DELETE,OPTIONS'"'"',method.response.header.Access-Control-Allow-Origin='"'"'*'"'"'' \
  --response-templates '{"application/json": ""}'
```

**Fix si es autenticación:**
```python
# En Lambda Authorizer, verificar token
import boto3
import json

cognito = boto3.client('cognito-idp')

def lambda_handler(event, context):
    token = event['authorizationToken'].replace('Bearer ', '')
    
    try:
        user = cognito.get_user(AccessToken=token, UserPoolId='us-east-1_ABC123xyz')
        
        return {
            'principalId': user['Username'],
            'policyDocument': {
                'Version': '2012-10-17',
                'Statement': [
                    {
                        'Action': 'execute-api:Invoke',
                        'Effect': 'Allow',
                        'Resource': event['methodArn']
                    }
                ]
            }
        }
    except cognito.exceptions.NotAuthorizedException:
        raise Exception('Unauthorized')
```

### Validación
```bash
# Request que debería funcionar
curl -X POST https://api.rutaflow.dev/tasks \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  -v
```
Esperar `200 OK` (no `403`).

### Prevención
- Revisar "Authorizers" en API Gateway cada 6 meses (tokens expiran, Cognito usa versiones nuevas)
- Test CORS con `preflight OPTIONS` en smoke tests
- Logs: habilitar CloudWatch Logs en API Gateway (nivel `ERROR` mínimo)

---

## Runbook 5: EventBridge Rule Matching Failures

### Síntomas
- Eventos generados pero rules no disparan
- Target (Lambda, SQS) nunca se invoca
- Cloudtrail muestra eventos enviados pero "Matched Rules: 0"
- Pattern en rule parece correcto pero no hace match

### Diagnosis

**Paso 1: Verificar que regla está habilitada**
```bash
aws events describe-rule --name "RutaFlow-TaskCreated"
```
Salida esperada: `"State": "ENABLED"` (no `DISABLED`).

**Paso 2: Revisar patrón de evento (JSON tiene formato estricto)**
```bash
aws events describe-rule --name "RutaFlow-TaskCreated" \
  --query 'EventPattern' --output json
```
Salida esperada (ejemplo):
```json
{
  "source": ["custom.rutaflow"],
  "detail-type": ["Task Created"],
  "detail": {
    "userId": ["user123"],
    "priority": [{"numeric": [">", 5]}]
  }
}
```

**Paso 3: Comparar evento real con patrón**
```bash
# Enviar evento de prueba
aws events put-events --entries '[{
  "Source": "custom.rutaflow",
  "DetailType": "Task Created",
  "Detail": "{\"userId\":\"user123\",\"priority\":7,\"taskId\":\"t-123\"}"
}]'
```

**Paso 4: Verificar target está configurado**
```bash
aws events list-targets-by-rule --rule "RutaFlow-TaskCreated"
```
Si lista vacía, no hay target; evento se descarta silenciosamente.

### Solución

**Root cause más común:** JSON case-sensitive en patrón — `"Source"` no es lo mismo que `"source"`.

**Fix: Corregir patrón exacto**
```bash
aws events put-rule --name "RutaFlow-TaskCreated" \
  --event-pattern '{
    "source": ["custom.rutaflow"],
    "detail-type": ["Task Created"]
  }' \
  --state ENABLED \
  --description "Trigger cuando se crea tarea"
```

**Fix si pattern tiene variables de numéricas/fechas:**
```bash
aws events put-rule --name "RutaFlow-HighPriorityTasks" \
  --event-pattern '{
    "source": ["custom.rutaflow"],
    "detail-type": ["Task Created"],
    "detail": {
      "priority": [{"numeric": [">", 5]}],
      "createdAt": [{"prefix": "2026-10"}]
    }
  }' \
  --state ENABLED
```

**Fix si target no existe:**
```bash
# Agregar Lambda como target
aws events put-targets --rule "RutaFlow-TaskCreated" \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:123456789:function:ProcessTask","RoleArn"="arn:aws:iam::123456789:role/EventBridgeRole"

# Dar permisos a Lambda
aws lambda add-permission --function-name ProcessTask \
  --statement-id AllowEventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:us-east-1:123456789:rule/RutaFlow-TaskCreated"
```

### Validación
```bash
# Test end-to-end: enviar evento, verificar Lambda ejecuta
aws events put-events --entries '[{
  "Source": "custom.rutaflow",
  "DetailType": "Task Created",
  "Detail": "{\"priority\":8}"
}]'

# Revisar logs Lambda después de 10 segundos
aws logs tail /aws/lambda/ProcessTask --follow
```

### Prevención
- Mantener archivo JSON con ejemplos de eventos reales (input format)
- Test de matching en "Event replay" sección de EventBridge console
- CI check: validar JSON pattern es válido antes de deploy

---

## Runbook 6: SQS Message Visibility Timeout Issues

### Síntomas
- Mensajes se reenvían múltiples veces (duplicados en aplicación)
- Consumer crashea pero reinicia antes de que vuelva a intentar
- Visibility Timeout demasiado corto para worker lento
- Bajo rendimiento sin errores obvios (deadlock de reintentos)

### Diagnosis

**Paso 1: Revisar configuración actual**
```bash
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/RutaFlow-Tasks \
  --attribute-names All --output json
```
Buscar `VisibilityTimeout` (default 30s), `MessageRetentionPeriod`, `ReceiveMessageWaitTimeSeconds`.

**Paso 2: Monitorear tasa de reintento**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/SQS \
  --metric-name NumberOfMessagesSent \
  --dimensions Name=QueueName,Value=RutaFlow-Tasks \
  --start-time 2026-10-06T10:00:00Z \
  --end-time 2026-10-06T12:00:00Z \
  --period 60 \
  --statistics Sum
```
Si `NumberOfMessagesSent` > `NumberOfMessagesReceived`, hay reintentos.

**Paso 3: Revisar Dead Letter Queue (DLQ) si existe**
```bash
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/RutaFlow-Tasks \
  --attribute-names RedrivePolicy \
  --output json
```
Si `maxReceiveCount: 3`, mensaje va a DLQ después de 3 intentos fallidos.

### Solución

**Fix inmediato: Aumentar Visibility Timeout**
```bash
# Si worker típico toma 60 segundos, usar 90s buffer
aws sqs set-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/RutaFlow-Tasks \
  --attributes VisibilityTimeout=90
```

**Fix si proceso es variable (a veces 10s, a veces 5 min):**
```python
# En Lambda consumer, extender timeout dinámicamente
import boto3
sqs = boto3.client('sqs')

def process_message(message_body, receipt_handle, queue_url):
    remaining_seconds = 40  # tiempo restante estimado
    
    if remaining_seconds < 10:
        # Pedir más tiempo
        sqs.change_message_visibility(
            QueueUrl=queue_url,
            ReceiptHandle=receipt_handle,
            VisibilityTimeout=120
        )
    
    # Procesar mensaje...
    sqs.delete_message(
        QueueUrl=queue_url,
        ReceiptHandle=receipt_handle
    )
```

**Fix si hay duplicados: Implementar idempotency**
```python
# Guardar deduplicación key en DynamoDB
import hashlib
dynamodb = boto3.resource('dynamodb')
dedup_table = dynamodb.Table('RutaFlow-ProcessedMessages')

message_id = hashlib.sha256(message_body.encode()).hexdigest()

try:
    dedup_table.put_item(
        Item={'message_id': message_id, 'processed_at': int(time.time())},
        ConditionExpression='attribute_not_exists(message_id)'
    )
    # Procesar mensaje
except dedup_table.meta.client.exceptions.ConditionalCheckFailedException:
    # Ya fue procesado, ignorar
    print("Mensaje duplicado, ignorando")
```

### Validación
```bash
# Enviar mensaje de prueba
aws sqs send-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/RutaFlow-Tasks \
  --message-body '{"taskId":"test-123"}'

# Verificar que se procesa sin duplicados
aws sqs receive-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/RutaFlow-Tasks \
  --wait-time-seconds 5
```

### Prevención
- Monitorear `ApproximateNumberOfMessagesNotVisible` → si alto, visibility timeout corto
- DLQ obligatoria con `maxReceiveCount: 2` para enviar basura a investigar
- Logs en consumer: timestamp de recepción + timestamp de finalización

---

## Runbook 7: RDS Connection Pooling Exhaustion

### Síntomas
- Conexión rechazada aunque recurso no está saturado: "too many connections"
- Algunos requests fallan con timeout, otros funcionan
- Aplicación abre conexiones pero nunca las cierra (connection leak)
- Performance degrada lentamente a lo largo del día

### Diagnosis

**Paso 1: Revisar conexiones activas en BD**
```bash
# Conectar a BD y ejecutar
mysql -h rutaflow-db.cxyz.us-east-1.rds.amazonaws.com -u admin -p \
  -e "SHOW PROCESSLIST LIMIT 20;"
```
Si hay muchos `Sleep` (idle), hay leak de conexiones.

**Paso 2: Revisar parámetro `max_connections` de BD**
```bash
aws rds describe-db-instances --db-instance-identifier rutaflow-db \
  --query 'DBInstances[0].DBParameterGroups[0].DBParameterGroupName' \
  --output text
# Salida: default.mysql8.0

aws rds describe-db-parameters \
  --db-parameter-group-name default.mysql8.0 \
  --query 'Parameters[?ParameterName==`max_connections`]' \
  --output json
```
Típico: `max_connections: 750` (depende de tipo de instancia).

**Paso 3: Revisar pool size en aplicación**
```bash
# Buscar config de connection pool en código
grep -r "max-pool-size\|maxConnections\|pool_size" . --include="*.py" --include="*.js" --include="*.java"
```

**Paso 4: Monitorear conexiones desde CloudWatch**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=rutaflow-db \
  --start-time 2026-10-06T10:00:00Z \
  --end-time 2026-10-06T12:00:00Z \
  --period 60 \
  --statistics Average,Maximum
```

### Solución

**Root cause más común:** Pool size demasiado pequeño o conexiones no se cierran.

**Fix inmediato: Aumentar BD max_connections**
```bash
# Crear custom parameter group
aws rds create-db-parameter-group \
  --db-parameter-group-name rutaflow-large \
  --db-parameter-group-family mysql8.0 \
  --description "RutaFlow con conexiones aumentadas"

# Aumentar límite
aws rds modify-db-parameter-group-options \
  --db-parameter-group-name rutaflow-large \
  --parameters ParameterName=max_connections,ParameterValue=1000,ApplyMethod=immediate

# Aplicar a instancia
aws rds modify-db-instance --db-instance-identifier rutaflow-db \
  --db-parameter-group-name rutaflow-large \
  --apply-immediately
```

**Fix permanente: Reducir pool size si está excesivo**
```python
# Python SQLAlchemy
from sqlalchemy import create_engine
engine = create_engine(
    'mysql+pymysql://user:password@rutaflow-db:3306/tasks',
    pool_size=5,  # máximo 5 conexiones simultáneas
    max_overflow=10,  # hasta 10 extra si todas están en uso
    pool_recycle=3600  # reciclar cada hora
)

# En aplicación, asegurar cierre de conexiones
with engine.connect() as conn:
    result = conn.execute("SELECT * FROM tasks")  # auto-close al salir
```

**Fix si hay leak: Añadir logging de pool**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('sqlalchemy.pool')
logger.setLevel(logging.DEBUG)

# Ahora verás qué sucede con conexiones
```

### Validación
```bash
# Después de cambios, verificar max_connections ha bajado significativamente
mysql -h rutaflow-db.cxyz.us-east-1.rds.amazonaws.com -u admin -p \
  -e "SHOW PROCESSLIST;" | wc -l
```
Debe bajar.

### Prevención
- Dashboard CloudWatch: gráfico `DatabaseConnections` con alerta si > 80% de max
- Auditoría trimestral de pool config vs. carga real
- Connection timeout en aplicación (e.g., 30s) para evitar espera infinita

---

## Runbook 8: VPC NAT Gateway Costs

### Síntomas
- Billing de NAT Gateway inesperadamente alto ($32+ por mes por AZ)
- Datos procesados muestran tráfico de egreso inesperado
- Recurso NAT no está siendo usado pero sigue cobrando

### Diagnosis

**Paso 1: Revisar uso de NAT Gateway**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/NatGateway \
  --metric-name BytesOutToDestination \
  --dimensions Name=NatGatewayId,Value=natgw-abc123 \
  --start-time 2026-10-01T00:00:00Z \
  --end-time 2026-10-06T00:00:00Z \
  --period 86400 \
  --statistics Sum \
  --output table
```
Si cero bytes, NAT no está en uso.

**Paso 2: Revisar qué subredes usan este NAT**
```bash
aws ec2 describe-route-tables \
  --filters "Name=route.nat-gateway-id,Values=natgw-abc123" \
  --query 'RouteTables[*].[SubnetId,Tags[?Key==`Name`].Value|[0]]' \
  --output table
```

**Paso 3: Revisar si hay alternativa NAT más barata (NAT Instance)**
```bash
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=*nat*" \
  --query 'Reservations[*].Instances[*].[InstanceId,InstanceType]' \
  --output table
```

### Solución

**Fix si NAT no está en uso: Borrar**
```bash
# Desasociar de route table primero
aws ec2 replace-route --route-table-id rtb-abc123 \
  --destination-cidr-block 0.0.0.0/0 \
  --nat-gateway-id natgw-abc123  # o cambiar a --instance-id i-xxx

# Liberar Elastic IP
aws ec2 release-address --allocation-id eipalloc-abc123

# Borrar NAT
aws ec2 delete-nat-gateway --nat-gateway-id natgw-abc123
```

**Fix si NAT está en uso pero costo es alto: Usar NAT Instance (mucho más barato)**
```bash
# Crear AMI NAT (amzn2-ami-hvm-*-x86_64-gp2)
aws ec2 run-instances \
  --image-id ami-nat-xxxxxx \
  --instance-type t3.nano \
  --subnet-id subnet-private \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=NatInstance}]'

# Actualizar route table para usar instance en lugar de NAT
aws ec2 replace-route --route-table-id rtb-abc123 \
  --destination-cidr-block 0.0.0.0/0 \
  --instance-id i-nat-instance
```
Costo: ~$0.03/hora vs $0.045/hora NAT Gateway + data processing.

**Fix si quieres mantener NAT pero reducir egress:**
- Usar VPC Endpoints para S3, DynamoDB (egreso a estos servicios es gratis)
- Usar CloudFront para cachear static content
- Compresión en tránsito (gzip)

### Prevención
- Revisar billing monthly: columna "NAT Gateway" debe crecer proporcionalmente con carga real
- Si carga es constante, NAT Instance es siempre más barato
- Reservar capacity si VAG es esencial (reduce $/hora 40%)

---

## Runbook 9: CloudFormation Stack Drift

### Síntomas
- Cambios manuales en consola no se reflejan en stack
- Destroy falla: "Resource still exists"
- Código de infraestructura y realidad desincronizado
- Diff muestra cambios que ya se hicieron

### Diagnosis

**Paso 1: Detectar drift**
```bash
aws cloudformation detect-stack-drift --stack-name RutaFlow-Prod
# Esperar 2-3 minutos
aws cloudformation describe-stack-drift-detection-status \
  --stack-drift-detection-id abc-xyz-123
```
Salida esperada:
```
"StackDriftStatus": "DRIFTED"  # o "IN_SYNC"
"DriftedStackResourceCount": 3
```

**Paso 2: Revisar cuáles recursos driftaron**
```bash
aws cloudformation describe-stack-resource-drifts \
  --stack-name RutaFlow-Prod \
  --query 'StackResourceDrifts[?ResourceStatus==`MODIFIED`]'
```
Muestra qué cambió manualmente.

### Solución

**Fix: Importar drift de vuelta a stack (resync)**
```bash
# Opción 1: Reapply stack (sobreescribe todos los cambios manuales)
aws cloudformation update-stack --stack-name RutaFlow-Prod \
  --template-body file://template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=prod

# Opción 2: Drift import (más manual, requiere actualizar template.yaml)
# Editar template.yaml para que coincida con la realidad actual
# Luego:
aws cloudformation update-stack --stack-name RutaFlow-Prod \
  --template-body file://template.yaml
```

**Mejor: Evitar drift (enforce CloudFormation)**
```bash
# Usar CloudFormation Service Role sin permisos directos a AWS
# En IAM, restringir cambios manuales:
{
  "Effect": "Deny",
  "Action": [
    "dynamodb:UpdateTable",
    "lambda:UpdateFunctionConfiguration",
    "rds:ModifyDBInstance"
  ],
  "Resource": "*",
  "Condition": {
    "StringNotEquals": {
      "aws:PrincipalArn": "arn:aws:iam::123456789:role/CloudFormationRole"
    }
  }
}
```

### Prevención
- Ejecutar drift detection cada viernes (programar EventBridge + Lambda)
- Alert si drift > 0
- Documentar por qué manual change fue necesario (commit a Git con feature-flag)

---

## Runbook 10: IAM Principal Confusion

### Síntomas
- Lambda no puede invocar DynamoDB: "User: arn:aws:iam::123456789:role/Lambda is not authorized"
- Rol parece tener permiso pero falla de todas formas
- Cambios en policy toman mucho tiempo en reflejarse
- Cross-account access no funciona

### Diagnosis

**Paso 1: Identificar principal ejecutando acción**
```bash
# Revisar Cloudtrail para quién hizo la request
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceType,AttributeValue=AWS::Lambda::Function \
  --start-time 2026-10-06T10:00:00Z \
  --max-results 5
```
Buscar campo `PrincipalId` en eventos.

**Paso 2: Revisar policy del rol**
```bash
aws iam get-role-policy --role-name LambdaExecutionRole \
  --policy-name DynamoDBAccess
```

**Paso 3: Revisar Trust Relationship (asume role policy)**
```bash
aws iam get-role --role-name LambdaExecutionRole \
  --query 'Role.AssumeRolePolicyDocument'
```
Debe incluir:
```json
{
  "Effect": "Allow",
  "Principal": {
    "Service": "lambda.amazonaws.com"
  },
  "Action": "sts:AssumeRole"
}
```

**Paso 4: Revisar Resource-Based Policy en recurso**
```bash
# Si es DynamoDB
aws dynamodb get-item --table-name RutaFlow-Tasks \
  # DynamoDB no usa resource-based policy; usa IAM role del caller

# Si es SQS
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/RutaFlow-Tasks \
  --attribute-names Policy
```

### Solución

**Root cause más común:** Trust Relationship falta el principal.

**Fix: Actualizar Trust Relationship**
```bash
aws iam update-assume-role-policy \
  --role-name LambdaExecutionRole \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'
```

**Fix si cross-account: Crear externa ID**
```bash
# Account A (origen): role asume role en Account B
aws iam update-assume-role-policy \
  --role-name CrossAccountRole \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::111111111111:role/AccountARole"
        },
        "Action": "sts:AssumeRole",
        "Condition": {
          "StringEquals": {
            "sts:ExternalId": "unique-external-id-12345"
          }
        }
      }
    ]
  }'

# En Account A, code llama:
sts.assume_role(
    RoleArn="arn:aws:iam::222222222222:role/CrossAccountRole",
    RoleSessionName="CrossAccountSession",
    ExternalId="unique-external-id-12345"
)
```

**Fix si policy caching: Forzar refresh**
```bash
# Esperar 5-15 minutos (AWS cachea policies)
# O, crear nueva versión de policy:
aws iam put-role-policy --role-name LambdaExecutionRole \
  --policy-name DynamoDBAccessV2 \
  --policy-document file://policy.json

# Borrar versión vieja
aws iam delete-role-policy --role-name LambdaExecutionRole \
  --policy-name DynamoDBAccess
```

### Validation
```bash
# Simular permiso (sin ejecutar realmente)
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789:role/LambdaExecutionRole \
  --action-names dynamodb:GetItem dynamodb:PutItem \
  --resource-arns arn:aws:dynamodb:us-east-1:123456789:table/RutaFlow-Tasks
```
Salida: `EvalDecision: allowed` (no `implicitDeny`).

### Prevention
- Review IAM policies monthly (least privilege audit)
- Use IAM Access Analyzer to find "public" roles
- Use externals IDs for all cross-account access

---

## Runbook 11: CloudWatch Metrics Not Appearing

### Síntomas
- Aplicación envía métricas pero no aparecen en dashboard
- CloudWatch Logs sí aparecen, métricas no
- Métrica desaparece después de 15 minutos inactividad
- Custom metrics nunca se crean aunque código lo intenta

### Diagnosis

**Paso 1: Verificar que métrica se está enviando**
```bash
# Revisar si métrica existe
aws cloudwatch list-metrics \
  --namespace Custom/RutaFlow \
  --metric-name TaskProcessingTime
```
Si no aparece, nunca se envió data.

**Paso 2: Revisar IAM permiso para PutMetricData**
```bash
# Revisar policy del rol/usuario
aws iam get-user-policy --user-name app-user \
  --policy-name CloudWatchAccess
```
Debe incluir:
```json
{
  "Effect": "Allow",
  "Action": ["cloudwatch:PutMetricData"],
  "Resource": "*"
}
```

**Paso 3: Revisar logs de la aplicación**
```bash
# Si error 403 o 401 al enviar métrica
grep -i "unauthorized\|403\|metrics" app.log | head -5
```

**Paso 4: Verificar formato de métrica es correcto**
```python
# Test: enviar métrica de prueba
import boto3
cloudwatch = boto3.client('cloudwatch', region_name='us-east-1')

cloudwatch.put_metric_data(
    Namespace='Custom/RutaFlow',
    MetricData=[
        {
            'MetricName': 'TestMetric',
            'Value': 100.0,
            'Unit': 'None',
            'Timestamp': datetime.utcnow()
        }
    ]
)

# Esperar 1 minuto, revisar
aws cloudwatch list-metrics --namespace Custom/RutaFlow \
  --metric-name TestMetric
```

### Solución

**Root cause más común:** Permiso IAM falta o formato de métrica incorrecto.

**Fix: Agregar permiso IAM**
```bash
aws iam put-user-policy --user-name app-user \
  --policy-name CloudWatchMetrics \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics"
        ],
        "Resource": "*"
      }
    ]
  }'
```

**Fix si formato está mal:**
```python
# ❌ ANTES: formato incorrecto
cloudwatch.put_metric_data(
    Namespace='Custom/RutaFlow',
    MetricData=[
        {
            'MetricName': 'Task Processing Time',  # no puede tener espacios
            'Value': None,  # Value obligatorio
        }
    ]
)

# ✅ DESPUÉS: formato correcto
cloudwatch.put_metric_data(
    Namespace='Custom/RutaFlow',
    MetricData=[
        {
            'MetricName': 'TaskProcessingTime',
            'Value': 1234.56,  # obligatorio, numérico
            'Unit': 'Milliseconds',  # o 'None', 'Seconds', etc
            'Timestamp': datetime.utcnow()
        }
    ]
)
```

### Validation
```bash
# Revisar métrica fue creada
aws cloudwatch list-metrics --namespace Custom/RutaFlow

# Revisar valor fue grabado
aws cloudwatch get-metric-statistics \
  --namespace Custom/RutaFlow \
  --metric-name TaskProcessingTime \
  --start-time 2026-10-06T10:00:00Z \
  --end-time 2026-10-06T12:00:00Z \
  --period 60 \
  --statistics Average,Maximum
```

### Prevention
- Test: unit test que verifica put_metric_data funciona
- Monitorar "PutMetricData" errors en Lambda Cloudwatch logs
- Usar CloudWatch Insights para queries: `fields @timestamp, @message | filter @message like /cloudwatch/ | stats count()`

---

## Runbook 12: CI/CD CodePipeline Stage Timeout

### Síntomas
- Stage (Build, Deploy) toma >30 minutos sin hacer nada visible
- Aplicación se queda esperando feedback de CI/CD
- Pipeline cancela automáticamente
- Logs no muestran qué está lento

### Diagnosis

**Paso 1: Revisar ejecución más reciente**
```bash
aws codepipeline list-pipeline-executions \
  --pipeline-name RutaFlow-Pipeline \
  --max-results 5
```

**Paso 2: Revisar qué stage tardó**
```bash
aws codepipeline get-pipeline-state \
  --pipeline-name RutaFlow-Pipeline \
  --query 'stageStates[*].[stageName,latestExecution.status,latestExecution.lastUpdated]'
```

**Paso 3: Revisar logs del stage específico (ej Build)**
```bash
# Si es CodeBuild
aws codebuild batch-get-builds --ids arn:aws:codebuild:us-east-1:123456789:build/RutaFlow-Build/abc123
```
Buscar `phases.build.endTime - phases.build.startTime`.

**Paso 4: Revisar si hay problema de recursos**
```bash
# Si CodeBuild, revisar si hay queue de builds
aws codebuild list-builds-for-project --project-name RutaFlow-Build
```
Si muchos `IN_PROGRESS`, computadora está saturada.

### Solución

**Root cause más común:** Descarga lenta de dependencias (npm install, maven), tests lentos.

**Fix: Aumentar timeout del stage**
```bash
# Actualizar pipeline
aws codepipeline get-pipeline --pipeline-name RutaFlow-Pipeline > pipeline.json
# Editar pipeline.json: agregar "timeoutInMinutes": 60 en stage
aws codepipeline update-pipeline --cli-input-json file://pipeline.json
```

**Fix: Cachear dependencias en CodeBuild**
```yaml
# buildspec.yml
version: 0.2
cache:
  paths:
    - '/root/.m2/**/*'  # Maven cache
    - '/root/.npm/**/*'  # NPM cache
phases:
  install:
    commands:
      - npm ci  # Instalar desde cache si existe
```

**Fix: Paralelizar tests**
```bash
# En CodeBuild, ejecutar tests en paralelo (si hay múltiples workers)
npm test -- --workers 4
```

**Fix: Usar build artifact caching**
```bash
# En CodeBuild buildspec.yml
artifacts:
  cache:
    - /root/.cache/npm-packages
```

### Validation
```bash
# Trigger pipeline y medir time
aws codepipeline start-pipeline-execution --pipeline-name RutaFlow-Pipeline
# Esperar + revisar
aws codepipeline list-pipeline-executions --pipeline-name RutaFlow-Pipeline --max-results 1
```

### Prevention
- Monitorear "Build Duration" en CloudWatch (alerta si > 30 min)
- Mantener `buildspec.yml` con cache strategy
- Revisar logs CodeBuild mensualmente: ¿qué fase toma más tiempo?

---

## Runbook 13: Multi-Region Replication Lag

### Síntomas
- Datos replicados a región secundaria tardan > 10 minutos
- Cross-region failover es inconsistente (algunas tablas han replicado, otras no)
- DynamoDB Global Tables muestra "Replicas recovering"
- Cliente ve datos viejos en región secundaria

### Diagnosis

**Paso 1: Revisar replication status**
```bash
aws dynamodb describe-table --table-name RutaFlow-Tasks \
  --query 'Table.Replicas[*].[RegionName,ReplicaStatus]'
```
Salida esperada: `['us-east-1', 'ACTIVE']`, `['eu-west-1', 'ACTIVE']`.

**Paso 2: Revisar replication latency en CloudWatch**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ReplicationLatency \
  --dimensions Name=TableName,Value=RutaFlow-Tasks Name=ReceivingRegion,Value=eu-west-1 \
  --start-time 2026-10-06T10:00:00Z \
  --end-time 2026-10-06T12:00:00Z \
  --period 60 \
  --statistics Average,Maximum
```

**Paso 3: Revisar si hay throttling en región primaria**
```bash
# Si primaria throttle, replicación también se ralentiza
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name UserErrors \
  --dimensions Name=TableName,Value=RutaFlow-Tasks \
  --start-time 2026-10-06T10:00:00Z \
  --end-time 2026-10-06T12:00:00Z \
  --period 60 \
  --statistics Sum
```

### Solución

**Root cause más común:** Primaria está throttling → replicación se atrasa.

**Fix: Aumentar capacidad en primaria**
```bash
aws dynamodb update-table \
  --table-name RutaFlow-Tasks \
  --billing-mode PAY_PER_REQUEST  # Cambiar a pay-per-request (sin throttling)
```

**Fix si replicación está "recovering":**
```bash
# Esperar 5-10 minutos, luego revisar
aws dynamodb describe-table --table-name RutaFlow-Tasks \
  --query 'Table.Replicas[*].ReplicaStatus'

# Si sigue "RECOVERING", puede ser problem de network
# Revisar VPC endpoints para DynamoDB en región secundaria
aws ec2 describe-vpc-endpoints \
  --filters "Name=service-name,Values=*dynamodb*"
```

**Fix si quieres garantizar low-latency replica:**
```bash
# Usar DAX (DynamoDB Accelerator) en región secundaria
aws dax create-cluster \
  --cluster-name rutaflow-dax-eu \
  --node-type dax.r4.large \
  --replication-factor 3
```

### Validation
```bash
# Escribir en primaria, verificar aparece en secundaria
aws dynamodb put-item --table-name RutaFlow-Tasks \
  --region us-east-1 \
  --item '{"taskId":{"S":"test-multi-region"},"title":{"S":"Test"}}'

# Después de 1 segundo, revisar en segundaria
sleep 1
aws dynamodb get-item --table-name RutaFlow-Tasks \
  --region eu-west-1 \
  --key '{"taskId":{"S":"test-multi-region"}}'
```
Debe retornar el item.

### Prevention
- Alerta si `ReplicationLatency > 5000ms` (más de 5 segundos)
- Monthly report: "Average replication lag by region"

---

## Runbook 14: KMS Key Rotation and Secrets Rotation

### Síntomas
- Secrets expiran pero aplicación sigue usando viejos
- Key rotation falla silenciosamente
- Aplicación no puede decrypt data después de key rotation
- Billing muestra keys que no están en uso

### Diagnosis

**Paso 1: Revisar rotation status de key**
```bash
aws kms describe-key --key-id arn:aws:kms:us-east-1:123456789:key/abc-123 \
  --query 'KeyMetadata.[KeyState,KeyRotationEnabled,CreationDate]'
```

**Paso 2: Revisar historial de rotations**
```bash
aws kms get-key-rotation-status --key-id arn:aws:kms:us-east-1:123456789:key/abc-123
```
Si `KeyRotationEnabled: false`, no está rotando.

**Paso 3: Revisar qué secrets usan esta key**
```bash
aws secretsmanager list-secrets \
  --query 'SecretList[?KmsKeyId==`arn:aws:kms:us-east-1:123456789:key/abc-123`]'
```

**Paso 4: Revisar si secret está configurado para auto-rotate**
```bash
aws secretsmanager describe-secret --secret-id RutaFlow-DBPassword \
  --query 'RotationEnabled'
```

### Solución

**Fix: Habilitar key rotation automática**
```bash
aws kms enable-key-rotation --key-id arn:aws:kms:us-east-1:123456789:key/abc-123
```

**Fix: Habilitar secret rotation automática**
```bash
# Crear Lambda function que rota secret
aws secretsmanager rotate-secret \
  --secret-id RutaFlow-DBPassword \
  --rotation-rules '{
    "AutomaticallyAfterDays": 30,
    "Duration": "3h",
    "ScheduleExpression": "rate(30 days)"
  }' \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789:function:RotateSecret
```

**Validación que rotación funciona:**
```python
# Lambda rotation function debe cumplir este pattern:
import boto3
secrets_client = boto3.client('secretsmanager')

def lambda_handler(event, context):
    # Paso 1: create new secret version
    secret = secrets_client.get_secret_value(SecretId=event['SecretId'])
    # Generar nuevo password
    new_password = generate_password()
    
    # Paso 2: set new secret en aplicación (update BD password, etc)
    db.update_password(new_password)
    
    # Paso 3: finish rotation (marcar versión como CURRENT)
    secrets_client.update_secret_version_stage(
        SecretId=event['SecretId'],
        VersionStage='AWSCURRENT',
        MoveToVersionId=new_version_id,
        RemoveFromVersionId=current_version_id
    )
```

### Prevention
- Alerta semanal: revisar qué secrets no tienen rotation activo
- Policy: "Todas los secrets deben rotarse cada 30 días"
- Audit: comando `aws secretsmanager list-secrets --filters Key=rotation_enabled,Values=false` debe retornar lista vacía

---

## Runbook 15: Cost Optimization — Unattached Resources

### Síntomas
- Billing de EC2 alta pero instancias bajas
- EBS volumes sin usar siguen cobrando
- Elastic IPs "flotantes" sin recursos asociados
- NAT Gateways en subnets que no las usan

### Diagnosis

**Paso 1: Encontrar Elastic IPs no asociadas**
```bash
aws ec2 describe-addresses \
  --query 'Addresses[?AssociationId==null].[PublicIp,AllocationId]'
```

**Paso 2: Encontrar EBS volumes unattached**
```bash
aws ec2 describe-volumes \
  --filters "Name=status,Values=available" \
  --query 'Volumes[*].[VolumeId,Size,AvailabilityZone,State]'
```

**Paso 3: Encontrar EC2 instances paradas (pero no terminadas)**
```bash
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=stopped" \
  --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,LaunchTime]'
```

**Paso 4: Encontrar NAT Gateways sin tráfico**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/NatGateway \
  --metric-name BytesOutToDestination \
  --start-time 2026-10-01T00:00:00Z \
  --end-time 2026-10-06T00:00:00Z \
  --period 432000  # 5 days
  --statistics Sum
```
Si Sum = 0, NAT no está siendo usado.

### Solución

**Fix: Borrar Elastic IP no asociadas**
```bash
aws ec2 release-address --allocation-id eipalloc-abc123
```
Ahorro: $0.005/hora = $36/año por IP.

**Fix: Borrar EBS volumes no usados**
```bash
# Revisar que volume no está en snapshots
aws ec2 describe-snapshots --owner-ids self \
  --query "Snapshots[?VolumeId=='vol-abc123']"

# Si no hay snapshots, borrar
aws ec2 delete-volume --volume-id vol-abc123
```
Ahorro: $0.10/mes por GB (típico 100GB = $10/mes).

**Fix: Terminar (no solo parar) instancias que no se usan**
```bash
# Revisar última actividad
aws ec2 describe-instances --instance-ids i-abc123 \
  --query 'Reservations[0].Instances[0].[LaunchTime,StateTransitionReason]'

# Si parada >1 mes, terminar
aws ec2 terminate-instances --instance-ids i-abc123
```
Ahorro: depende de tipo (t3.large = $0.08/hora = ~$60/mes).

**Fix: Usar Reserved Instances o Savings Plans para instancias que siempre corren**
```bash
# Calcular ROI
# On-demand: t3.large = $0.08/hora = ~$700/año
# 1-year Reserved: ~$500/año = 28% ahorro
```

### Prevention
- Mensual: ejecutar diagnóstico anterior → documentar recursos no usados
- Tagging: etiquetar recursos con "Owner" y "Purpose" → borrar si Owner no existe
- CloudTrail: alertas si EC2 está stopped >30 días

---

**Next Steps:**
1. Run `./scripts/validate.sh` after adding any Cloud content
2. Monitor CloudWatch dashboards for trending costs
3. Review this runbook quarterly as infrastructure changes

