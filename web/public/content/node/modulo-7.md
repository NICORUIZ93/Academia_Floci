## Tests de integración con Supertest

```js
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("GET /tareas", () => {
  it("devuelve 200 y un array", async () => {
    const respuesta = await request(app).get("/tareas");
    expect(respuesta.status).toBe(200);
    expect(Array.isArray(respuesta.body)).toBe(true);
  });
});
```

Supertest hace requests HTTP reales contra tu app Express **sin necesidad de levantar un puerto** — prueba el comportamiento real, no solo funciones aisladas.

## Testcontainers: base de datos real y efímera

```js
import { PostgreSqlContainer } from "@testcontainers/postgresql";

let contenedor;
beforeAll(async () => {
  contenedor = await new PostgreSqlContainer().start();
  process.env.DATABASE_URL = contenedor.getConnectionUri();
});
afterAll(() => contenedor.stop());
```

Cada corrida de tests levanta un PostgreSQL real en Docker, completamente aislado, y lo destruye al terminar — sin compartir estado entre ejecuciones ni depender de una base "de pruebas" compartida que alguien puede ensuciar.

## CI con GitHub Actions

```yaml
- run: npm ci
- run: npm test
```

Combinado con Testcontainers, el pipeline de CI levanta su propia base de datos real en cada ejecución, sin configuración manual de infraestructura.
