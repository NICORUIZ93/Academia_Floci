## Worker threads para trabajo CPU-bound

```js
import { Worker } from "node:worker_threads";

const worker = new Worker("./procesar-imagen.js", { workerData: { ruta: "foto.png" } });
worker.on("message", (resultado) => console.log("listo:", resultado));
```

El event loop principal nunca se bloquea: el trabajo pesado corre en otro hilo con su propia instancia de V8, y se comunican pasando mensajes (no memoria compartida, salvo `SharedArrayBuffer`).

## Cluster: un proceso por núcleo

```js
import cluster from "node:cluster";
import { availableParallelism } from "node:os";

if (cluster.isPrimary) {
  for (let i = 0; i < availableParallelism(); i++) cluster.fork();
} else {
  arrancarServidorExpress(); // cada worker corre su propia copia de la app
}
```

A diferencia de `worker_threads`, cada proceso de `cluster` tiene su propia memoria completamente aislada — Node balancea las conexiones entrantes entre ellos.

## Colas con BullMQ

```js
import { Queue, Worker } from "bullmq";

const colaEmails = new Queue("emails", { connection: { host: "localhost", port: 6379 } });
await colaEmails.add("bienvenida", { destinatario: "ana@ejemplo.com" }, {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
});

new Worker("emails", async (job) => enviarEmail(job.data), { connection: { host: "localhost", port: 6379 } });
```

El endpoint HTTP solo encola el job y responde de inmediato; el envío real ocurre en un proceso worker separado, con reintentos automáticos si falla.
