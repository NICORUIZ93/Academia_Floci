# CloudWatch

Floci admite registros CloudWatch y métricas CloudWatch.

---

## Registros CloudWatch

**Protocolo:** JSON 1.1 (`X-Amz-Target: Logs.*`)
**Punto final:** `POST http://localhost:4566/`

### Acciones admitidas

| Acción | Descripción |
|---|---|
| `CreateLogGroup` | Crear un grupo de registros |
| `DeleteLogGroup` | Eliminar un grupo de registros |
| `DescribeLogGroups` | Listar grupos de registros |
| `CreateLogStream` | Crear una secuencia de registros dentro de un grupo de registros |
| `DeleteLogStream` | Eliminar una secuencia de registro |
| `DescribeLogStreams` | Listar secuencias de registros en un grupo |
| `PutLogEvents` | Escribir eventos de registro en una secuencia |
| `GetLogEvents` | Leer eventos de registro de una secuencia |
| `FilterLogEvents` | Buscar eventos de registro con un patrón de filtro |
| `PutRetentionPolicy` | Establecer retención de registros (días) |
| `DeleteRetentionPolicy` | Eliminar la política de retención de registros |
| `TagLogGroup` | Etiquetar un grupo de registros |
| `UntagLogGroup` | Eliminar etiquetas |
| `ListTagsLogGroup` | Etiquetas de lista |

### Configuración de

| Variables | Predeterminado | Descripción |
|---|---|---|
| `FLOCI_SERVICES_CLOUDWATCHLOGS_ENABLED` | `true` | Habilite o deshabilite el servicio de Registros CloudWatch |
| `FLOCI_SERVICES_CLOUDWATCHLOGS_MAX_EVENTS_PER_QUERY` | `10000` | Máximo de eventos devueltos por llamada `FilterLogEvents` / `GetLogEvents` |

### Ejemplos de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Create a log group and stream
aws logs create-log-group --log-group-name /app/backend --endpoint-url $AWS_ENDPOINT_URL
aws logs create-log-stream \
  --log-group-name /app/backend \
  --log-stream-name 2025/01/app-1 \
  --endpoint-url $AWS_ENDPOINT_URL

# Write log events
TIMESTAMP=$(date +%s%3N)   # milliseconds
aws logs put-log-events \
  --log-group-name /app/backend \
  --log-stream-name 2025/01/app-1 \
  --log-events "[{\"timestamp\":$TIMESTAMP,\"message\":\"Service started\"}]" \
  --endpoint-url $AWS_ENDPOINT_URL

# Read log events
aws logs get-log-events \
  --log-group-name /app/backend \
  --log-stream-name 2025/01/app-1 \
  --endpoint-url $AWS_ENDPOINT_URL

# Search logs
aws logs filter-log-events \
  --log-group-name /app/backend \
  --filter-pattern "ERROR" \
  --endpoint-url $AWS_ENDPOINT_URL

# Set retention
aws logs put-retention-policy \
  --log-group-name /app/backend \
  --retention-in-days 30 \
  --endpoint-url $AWS_ENDPOINT_URL
```

---

## CloudWatch Métricas {#metrics}

**Protocolo:** Consulta (XML) y JSON 1.1 (ambos compatibles)
**Punto final:** `POST http://localhost:4566/`

### Acciones admitidas

| Acción | Descripción |
|---|---|
| `PutMetricData` | Publicar métricas personalizadas |
| `ListMetrics` | Listar métricas disponibles |
| `GetMetricStatistics` | Obtener estadísticas de métricas (promedio, suma, etc.) |
| `GetMetricData` | Consultar métricas con expresiones matemáticas |
| `PutMetricAlarm` | Crear una alarma métrica |
| `DescribeAlarms` | Listar alarmas |
| `DeleteAlarms` | Eliminar alarmas |
| `SetAlarmState` | Establecer manualmente el estado de alarma |

### Ejemplos de

```bash
export AWS_ENDPOINT_URL=http://localhost:4566

# Publish a custom metric
aws cloudwatch put-metric-data \
  --namespace MyApp \
  --metric-data '[{
    "MetricName": "RequestCount",
    "Value": 42,
    "Unit": "Count",
    "Dimensions": [{"Name":"Service","Value":"api"}]
  }]' \
  --endpoint-url $AWS_ENDPOINT_URL

# List metrics
aws cloudwatch list-metrics \
  --namespace MyApp \
  --endpoint-url $AWS_ENDPOINT_URL

# Get statistics
aws cloudwatch get-metric-statistics \
  --namespace MyApp \
  --metric-name RequestCount \
  --dimensions Name=Service,Value=api \
  --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 300 \
  --statistics Sum \
  --endpoint-url $AWS_ENDPOINT_URL

# Create an alarm
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --metric-name ErrorCount \
  --namespace MyApp \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --endpoint-url $AWS_ENDPOINT_URL
```
