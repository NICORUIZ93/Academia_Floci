## Un servidor sin frameworks

```js
import { createServer } from "node:http";

const tareas = [];

const servidor = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/tareas") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(tareas));
  }

  if (req.method === "POST" && req.url === "/tareas") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    try {
      const tarea = JSON.parse(Buffer.concat(chunks).toString());
      tareas.push(tarea);
      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(tarea));
    } catch {
      res.writeHead(400);
      return res.end("JSON inválido");
    }
  }

  res.writeHead(404);
  res.end("No encontrado");
});

servidor.listen(3000);
```

## Lo que esto revela sobre los frameworks

Express, Fastify y similares automatizan exactamente este patrón: parsear el body, hacer match de rutas, manejar errores de forma consistente. Construirlo a mano una vez ayuda a leer su código fuente sin que parezca magia.

## Content negotiation básica

```js
const aceptaJson = req.headers.accept?.includes("application/json");
res.writeHead(200, { "Content-Type": aceptaJson ? "application/json" : "text/plain" });
res.end(aceptaJson ? JSON.stringify(dato) : String(dato));
```
