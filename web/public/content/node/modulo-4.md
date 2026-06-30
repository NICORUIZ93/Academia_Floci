## El patrón middleware

```js
import express from "express";
const app = express();

app.use(express.json()); // middleware: parsea el body JSON antes de llegar a las rutas

app.use((req, res, next) => { // middleware de logging propio
  const inicio = Date.now();
  res.on("finish", () => console.log(`${req.method} ${req.url} - ${Date.now() - inicio}ms`));
  next(); // sin esto, la request se queda colgada para siempre
});

app.get("/tareas", (req, res) => res.json(tareas));
app.post("/tareas", (req, res) => { tareas.push(req.body); res.status(201).json(req.body); });
```

Cada middleware se ejecuta en el orden en que se declara con `app.use()`. Si uno no llama a `next()`, la cadena se detiene ahí.

## Routers anidados

```js
import { Router } from "express";
const router = Router();
router.get("/", (req, res) => res.json(tareas));
router.post("/", (req, res) => { /* ... */ });

app.use("/tareas", router); // todas las rutas del router viven bajo /tareas
```

## Validación con zod

```js
import { z } from "zod";
const TareaSchema = z.object({ titulo: z.string().min(1), prioridad: z.enum(["baja", "alta"]) });

app.post("/tareas", (req, res) => {
  const resultado = TareaSchema.safeParse(req.body);
  if (!resultado.success) return res.status(400).json({ errores: resultado.error.issues });
  tareas.push(resultado.data);
  res.status(201).json(resultado.data);
});
```

## Manejo centralizado de errores

```js
app.use((err, req, res, next) => { // 4 parámetros: Express lo reconoce como error handler
  console.error(err);
  res.status(500).json({ error: "Algo salió mal" });
});
```
