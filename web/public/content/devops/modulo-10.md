## Logs estructurados

```json
{"level":"error","service":"api","correlationId":"abc-123","msg":"timeout conectando a db"}
```

Un log en JSON se puede filtrar e indexar por campo (`service`, `level`, `correlationId`) — un log de texto libre solo se puede buscar por substring.

## Pipeline ELK / EFK

```
App → Filebeat/Fluentd (recolecta) → Elasticsearch/Loki (almacena e indexa) → Kibana/Grafana (visualiza)
```

## Loki: una alternativa más ligera

A diferencia de Elasticsearch, Loki **no indexa el contenido completo de cada log** — solo indexa metadata (labels, como `service` o `nivel`). Esto lo hace mucho más barato de operar a cambio de búsquedas de texto libre algo más lentas, ideal cuando ya tienes Grafana para métricas.

## Correlation ID entre servicios

```js
const correlationId = req.headers['x-correlation-id'] || randomUUID();
// se propaga en cada llamada saliente a otros servicios
fetch(urlServicioB, { headers: { 'x-correlation-id': correlationId } });
```

Buscar ese único ID en el sistema centralizado de logs reconstruye el camino completo de una request a través de múltiples servicios — sin esto, correlacionar manualmente logs de distintos servicios por timestamp es lento y propenso a error.
