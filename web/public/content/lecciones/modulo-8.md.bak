# Módulo 8 · Observabilidad: CloudWatch, logs y métricas

## ¿Qué es observabilidad?

Observabilidad es la capacidad de entender el estado interno de un sistema a partir de sus salidas externas. Se compone de tres pilares:

1. **Logs** — registro de eventos discretos (qué pasó y cuándo)
2. **Métricas** — valores numéricos en el tiempo (CPU, latencia, errores por segundo)
3. **Trazas** — seguimiento de una petición a través de múltiples servicios

**CloudWatch** es el servicio principal de AWS para los tres pilares.

---

## CloudWatch Logs

```bash
eval $(floci env)

# Crea un grupo de logs
aws logs create-log-group --log-group-name /mi-app/api

# Crea un stream dentro del grupo
aws logs create-log-stream \
  --log-group-name /mi-app/api \
  --log-stream-name servidor-1

# Escribe logs
TIMESTAMP=$(date +%s000)  # Milisegundos
aws logs put-log-events \
  --log-group-name /mi-app/api \
  --log-stream-name servidor-1 \
  --log-events "[
    {\"timestamp\":$TIMESTAMP,\"message\":\"INFO: Servidor iniciado en puerto 8080\"},
    {\"timestamp\":$((TIMESTAMP+1000)),\"message\":\"INFO: GET /tareas - 200 - 12ms\"},
    {\"timestamp\":$((TIMESTAMP+2000)),\"message\":\"ERROR: Timeout en DynamoDB - GET /tareas/999\"}
  ]"

# Lee los últimos logs
aws logs get-log-events \
  --log-group-name /mi-app/api \
  --log-stream-name servidor-1 \
  --limit 50

# Busca logs con un patrón
aws logs filter-log-events \
  --log-group-name /mi-app/api \
  --filter-pattern "ERROR"

# CloudWatch Insights — consultas tipo SQL sobre logs
aws logs start-query \
  --log-group-name /mi-app/api \
  --start-time $(($(date +%s) - 3600)) \
  --end-time $(date +%s) \
  --query-string "fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20"
```

### Logging estructurado desde Python

```python
import logging
import json
import boto3
from datetime import datetime

# Logger para CloudWatch
cw = boto3.client("logs",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test"
)

class CloudWatchHandler(logging.Handler):
    def __init__(self, group, stream):
        super().__init__()
        self.group = group
        self.stream = stream
        self.seq_token = None

    def emit(self, record):
        msg = {
            "nivel": record.levelname,
            "mensaje": record.getMessage(),
            "modulo": record.module,
            "linea": record.lineno,
            "timestamp_iso": datetime.utcnow().isoformat()
        }

        kwargs = {
            "logGroupName": self.group,
            "logStreamName": self.stream,
            "logEvents": [{"timestamp": int(datetime.utcnow().timestamp() * 1000),
                           "message": json.dumps(msg)}]
        }
        if self.seq_token:
            kwargs["sequenceToken"] = self.seq_token

        resp = cw.put_log_events(**kwargs)
        self.seq_token = resp.get("nextSequenceToken")

# Configura el logger
logger = logging.getLogger("mi-app")
logger.addHandler(CloudWatchHandler("/mi-app/api", "servidor-1"))
logger.setLevel(logging.DEBUG)

# Uso
def procesar_tarea(tarea_id, usuario):
    logger.info(f"Procesando tarea {tarea_id} para {usuario}")
    try:
        # ... lógica ...
        logger.debug(f"Tarea {tarea_id} completada exitosamente")
    except Exception as e:
        logger.error(f"Error procesando tarea {tarea_id}: {str(e)}", exc_info=True)
        raise
```

---

## CloudWatch Métricas y Alarmas

```bash
# Publica una métrica personalizada
aws cloudwatch put-metric-data \
  --namespace "MiApp" \
  --metric-name "TareasCompletadas" \
  --unit Count \
  --value 5 \
  --dimensions Servicio=api,Entorno=produccion

# Publica múltiples métricas
aws cloudwatch put-metric-data \
  --namespace "MiApp" \
  --metric-data '[
    {"MetricName":"Latencia","Value":45,"Unit":"Milliseconds"},
    {"MetricName":"Errores","Value":0,"Unit":"Count"},
    {"MetricName":"Peticiones","Value":127,"Unit":"Count"}
  ]'

# Crea una alarma cuando errores > 10 en 5 minutos
aws cloudwatch put-metric-alarm \
  --alarm-name "alarma-errores-api" \
  --alarm-description "Más de 10 errores en 5 minutos" \
  --namespace "MiApp" \
  --metric-name "Errores" \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:000000000000:alertas

# Ve el estado de las alarmas
aws cloudwatch describe-alarms \
  --query "MetricAlarms[*].[AlarmName,StateValue,StateReason]" \
  --output table

# Lee métricas históricas
aws cloudwatch get-metric-statistics \
  --namespace "MiApp" \
  --metric-name "Peticiones" \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum Average
```

### Métricas automáticas de Lambda

```bash
# CloudWatch tiene métricas automáticas de Lambda sin configuración
aws cloudwatch get-metric-statistics \
  --namespace "AWS/Lambda" \
  --metric-name "Invocations" \
  --dimensions Name=FunctionName,Value=mi-funcion \
  --start-time $(date -u -d "1 hour ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v-1H +"%Y-%m-%dT%H:%M:%SZ") \
  --end-time $(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --period 300 \
  --statistics Sum
```

---

## Dashboard — visualización

```bash
# Crea un dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "mi-app-dashboard" \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "title": "Peticiones por hora",
          "metrics": [["MiApp","Peticiones"]],
          "period": 3600,
          "stat": "Sum"
        }
      },
      {
        "type": "metric",
        "properties": {
          "title": "Latencia promedio",
          "metrics": [["MiApp","Latencia"]],
          "period": 300,
          "stat": "Average"
        }
      }
    ]
  }'
```

---

## Log Insights — consultas sobre logs

```
# Ejemplos de consultas CloudWatch Insights

# Errores por ruta en la última hora
fields @timestamp, @message
| filter @message like /ERROR/
| parse @message "* * *" as nivel, ruta, codigo
| stats count(*) as total by ruta
| sort total desc

# Latencia promedio por endpoint
fields @timestamp, @message
| parse @message "* ms" as latencia
| stats avg(latencia) as promedio by bin(5m)
```

---

## Comparación de observabilidad

| | AWS | Azure | GCP |
|-|-----|-------|-----|
| Logs | CloudWatch Logs | Azure Monitor Logs | Cloud Logging |
| Métricas | CloudWatch Metrics | Azure Monitor Metrics | Cloud Monitoring |
| Trazas | AWS X-Ray | Application Insights | Cloud Trace |
| Dashboards | CloudWatch Dashboards | Azure Dashboards | Cloud Monitoring |

---

## Reto del módulo

1. Crea un grupo de logs `/mi-app/api` y escribe 10 eventos incluyendo 2 errores
2. Usa `filter-log-events` para encontrar solo los errores
3. Publica métricas de latencia (aleatoria entre 10-200ms) y errores
4. Crea una alarma cuando latencia promedio > 100ms
5. Escribe la función Python de logging estructurado y verifica que el JSON llega a CloudWatch

## Preguntas de salida

1. ¿Por qué el logging estructurado (JSON) es mejor que texto libre?
2. ¿Qué diferencia hay entre logs y métricas?
3. ¿Qué es una traza y cuándo la necesitas?
4. ¿Qué hace `sequenceToken` en CloudWatch y por qué importa?
