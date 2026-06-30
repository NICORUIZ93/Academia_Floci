## Logging estructurado con Pino

```js
import pino from "pino";
const log = pino();

log.info({ usuarioId: 42, accion: "crear_tarea" }, "Tarea creada");
// {"level":30,"time":...,"usuarioId":42,"accion":"crear_tarea","msg":"Tarea creada"}
```

Logs en JSON (no texto libre) se pueden indexar, filtrar y correlacionar en herramientas como Datadog, CloudWatch o Grafana Loki.

## Correlation ID por request

```js
import { randomUUID } from "node:crypto";

app.use((req, res, next) => {
  req.correlationId = randomUUID();
  req.log = log.child({ correlationId: req.correlationId });
  next();
});
```

Cada log de esa request incluye el mismo `correlationId` — así puedes seguir el rastro completo de UNA petición específica entre múltiples servicios.

## Excepciones no capturadas

```js
process.on("uncaughtException", (err) => {
  log.fatal(err, "Excepción no capturada — cerrando proceso");
  process.exit(1); // no sigas corriendo en un estado posiblemente corrupto
});
```

## Graceful shutdown

```js
process.on("SIGTERM", async () => {
  servidor.close(() => process.exit(0)); // deja de aceptar conexiones nuevas, termina las en curso
  await cerrarConexionesDB();
});
```

Sin esto, un despliegue (`docker stop`, escalado de Kubernetes) puede cortar requests a la mitad.
