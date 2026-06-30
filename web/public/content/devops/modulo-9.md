## Tipos de métrica en Prometheus

- **Counter**: solo sube (total de requests, errores acumulados)
- **Gauge**: sube y baja (memoria usada, conexiones activas)
- **Histogram**: distribución de valores (latencias) en buckets

```js
const requestsTotal = new prom.Counter({ name: 'http_requests_total', help: '...' });
app.use((req, res, next) => { res.on('finish', () => requestsTotal.inc()); next(); });
```

## PromQL

```promql
rate(http_requests_total[5m])                       # requests por segundo, promedio últimos 5 min
sum(rate(http_requests_total{status="500"}[5m])) / sum(rate(http_requests_total[5m]))  # tasa de error
```

## Dashboards y alertas

```yaml
# regla de Alertmanager
- alert: TasaErrorAlta
  expr: tasa_error > 0.05
  for: 2m
  annotations: { summary: "Tasa de error sobre el 5% por más de 2 minutos" }
```

## SLI, SLO, SLA

- **SLI** (indicador): la métrica real, ej. "% de requests bajo 200ms"
- **SLO** (objetivo): la meta interna, ej. "99% de requests bajo 200ms"
- **SLA** (acuerdo): el compromiso externo con consecuencias contractuales si se incumple

Un SLO da un lenguaje compartido entre equipos para decidir cuándo algo es "lo suficientemente rápido", en vez de discutir percepciones subjetivas.
