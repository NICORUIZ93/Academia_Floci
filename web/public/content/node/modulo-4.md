# Módulo 4: Express/Fastify — routing y middleware


## Aprende construyendo

### Tema 1: Middleware — orden de ejecución y next()

**Conceptos clave:** función middleware, cadena de ejecución, `next()`.

Un middleware en Express es simplemente una función con la firma `(req, res, next)` que se ejecuta en el camino de cualquier petición entrante antes de que llegue al manejador de ruta final, con la capacidad de inspeccionar o modificar `req`/`res`, y de decidir si la petición continúa hacia el siguiente middleware de la cadena invocando `next()`, o si la petición se detiene ahí mismo (por ejemplo, respondiendo directamente con `res.status(401).end()` si detecta que el usuario no está autenticado, sin invocar `next()` en absoluto). `express.json()`, un middleware incluido con Express, resuelve automáticamente el parsing manual del body estudiado en el Módulo 3, exponiendo directamente `req.body` ya parseado a cualquier middleware o ruta que se ejecute después de él en la cadena.

El orden en que se registran los middleware con `app.use()` determina exactamente el orden en que se ejecutan para cada petición entrante, una propiedad crítica de diseño: un middleware de autenticación debe registrarse antes que las rutas que protege (para que pueda rechazar la petición antes de que llegue a esas rutas), y `express.json()` debe registrarse antes que cualquier ruta que dependa de leer `req.body` ya parseado. Olvidar invocar `next()` dentro de un middleware personalizado es un error extremadamente común y con un síntoma característico: la petición se queda "colgada" indefinidamente sin ninguna respuesta, porque la cadena de ejecución nunca continúa hacia el siguiente middleware ni hacia el manejador de ruta final que efectivamente enviaría una respuesta.

Un middleware de logging propio, escuchando el evento `finish` del objeto `res` (que se dispara cuando la respuesta terminó de enviarse) para calcular y registrar el tiempo total de procesamiento de cada petición, ilustra cómo un middleware puede envolver conceptualmente toda la ejecución posterior de la cadena sin bloquearla: invoca `next()` inmediatamente para dejar que el resto de la cadena continúe, pero registra su listener de `finish` antes de eso, capturando efectivamente el momento en que toda la cadena completa (incluyendo el manejador de ruta final) haya terminado de procesar la petición.

**Analogía:** el middleware es como una serie de puntos de control en una línea de ensamblaje, cada uno con la capacidad de inspeccionar, modificar, o incluso detener completamente el paso de un producto hacia la siguiente estación; si un punto de control olvida marcar explícitamente "aprobado, continúa" (`next()`), el producto queda detenido indefinidamente en ese punto, sin llegar jamás a las estaciones siguientes de la línea.

**¿Por qué es importante?** El orden de registro de middleware determina directamente el comportamiento de la aplicación, y olvidar `next()` es la causa más común de peticiones "colgadas" sin respuesta en aplicaciones Express, un error de diagnóstico frecuente para quien aprende el framework.

**Código del ejemplo:**

```js
app.use(express.json());                    // 1: parsea el body
app.use((req, res, next) => {                 // 2: logging propio
  const inicio = Date.now();
  res.on("finish", () => console.log(`${req.method} ${req.url} - ${Date.now()-inicio}ms`));
  next();                                      // sin esto, la request se cuelga
});
app.get("/tareas", (req, res) => res.json(tareas)); // 3: manejador final
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás ordenar middleware de Express, usar `next()` correctamente y diagnosticar una petición detenida. **Prerrequisitos:** Node LTS, npm y una terminal. Este ejemplo independiente comienza desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API necesita registrar solicitudes, parsear JSON y, en ocasiones, detener la cadena por una regla de acceso. El orden importa: validar o leer `req.body` antes de que el middleware correspondiente exista produce resultados confusos.

#### Paso 3 · Teoría y analogía aplicada

Cada middleware es una estación de control. Puede preparar la solicitud y llamar `next()`, o terminar la respuesta si detecta un problema. El evento `finish` permite registrar qué pasó al final sin bloquear la estación siguiente.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto e instala Express:

```bash
mkdir ejemplo-middleware-express
cd ejemplo-middleware-express
npm init -y
npm install express
mkdir src
```

Añade `"type": "module"` a `package.json` y crea `src/server.js`:

```js
import express from "express";

const app = express();

app.use(express.json()); // 1. Debe ir antes de rutas que usan req.body.

app.use((req, res, next) => {
  const inicio = performance.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.path} -> ${res.statusCode} (${(performance.now() - inicio).toFixed(1)} ms)`);
  });
  next(); // 2. Entrega el control al siguiente middleware o ruta.
});

app.use("/privado", (req, res, next) => {
  if (req.get("x-demo-token") !== "aprender") {
    return res.status(401).json({ error: "Falta x-demo-token válido" });
  }
  next();
});

app.post("/eco", (req, res) => res.status(200).json({ recibido: req.body }));
app.get("/privado/mensaje", (_req, res) => res.json({ mensaje: "Acceso permitido" }));

app.listen(3004, "127.0.0.1", () => console.log("API en http://127.0.0.1:3004"));
```

`express.json()` debe estar antes de `POST /eco`; el middleware de logging se ejecuta para cualquier ruta; el middleware `/privado` termina con `401` o llama `next`, nunca ambas cosas. Ejecuta:

```bash
node src/server.js
```

En otra terminal prueba parsing y acceso protegido:

```bash
curl -i -X POST http://127.0.0.1:3004/eco -H "Content-Type: application/json" -d '{"tema":"middleware"}'
curl -i http://127.0.0.1:3004/privado/mensaje
curl -i http://127.0.0.1:3004/privado/mensaje -H "x-demo-token: aprender"
```

**Resultado esperado:** el POST devuelve el objeto recibido; la primera solicitud privada devuelve `401`; la segunda devuelve `200`. La consola del servidor registra cada respuesta con método, ruta, estado y duración.

**Fallo deliberado y diagnóstico:** comenta temporalmente `next()` dentro del logger y envía el POST. La petición queda esperando porque ningún middleware posterior responde. Detén `curl` con `Ctrl+C`, restaura `next()` y reinicia. El diagnóstico es una cadena de middleware interrumpida, no un fallo de Express.

#### Paso 5 · Práctica guiada

Agrega un middleware que incluya `x-request-id` en cada respuesta. **Pista:** usa `res.set("x-request-id", ...)` y llama `next()`; comprueba la cabecera con `curl -i`.

#### Paso 6 · Práctica independiente

Crea un middleware que rechace `Content-Type` distinto a JSON solamente en `POST /eco`. Entrega una solicitud válida y otra con `text/plain`, y explica por qué no conviene aplicar esa regla a un `GET` sin body.

#### Paso 7 · Cierre y conexión

Ya puedes leer y depurar una cadena de middleware. El siguiente tema dividirá rutas en routers independientes, también en un proyecto nuevo desde cero.

**Errores comunes:** registrar `express.json` después de la ruta; olvidar `next`; llamar `next` después de responder; crear middleware global para una regla local; usar logging que imprime secretos del body.

**Fuentes oficiales:** [guía de middleware de Express](https://expressjs.com/en/guide/using-middleware.html), [`express.json`](https://expressjs.com/en/api.html#express.json) y [evento `finish` de Node](https://nodejs.org/api/http.html#event-finish).

### Tema 2: Routers anidados

**Conceptos clave:** `express.Router()`, modularización de rutas, montaje con prefijo.

`express.Router()` crea una instancia de router independiente que agrupa rutas relacionadas (por ejemplo, todas las rutas bajo `/tareas`) en un módulo separado y organizado, en vez de declarar todas las rutas de la aplicación completa directamente sobre el objeto `app` principal, una práctica que se vuelve rápidamente difícil de mantener a medida que una API crece más allá de un puñado de rutas triviales. Un router se comporta, en la mayoría de aspectos relevantes, como una instancia miniatura de la aplicación Express completa, soportando sus propios middleware específicos de ese grupo de rutas y sus propios manejadores para cada verbo HTTP relevante.

Montar un router en la aplicación principal con `app.use("/tareas", router)` establece un prefijo de ruta: todas las rutas definidas dentro de ese router (como `router.get("/")`, que dentro del router representa la ruta raíz de ese grupo) quedan efectivamente disponibles bajo el prefijo `/tareas` completo (`/tareas/` en este ejemplo), permitiendo reorganizar o mover un grupo completo de funcionalidad relacionada simplemente cambiando el prefijo de montaje en un único lugar, sin necesidad de modificar las rutas internas individuales del router mismo.

Esta modularización mediante routers anidados escala naturalmente a aplicaciones con decenas de grupos de rutas relacionadas (usuarios, productos, pedidos, cada uno en su propio archivo con su propio router), facilitando que distintos miembros de un equipo trabajen simultáneamente en distintos routers sin conflictos de código, y facilitando también aplicar middleware específico a un grupo completo de rutas relacionadas (por ejemplo, un middleware de autenticación que solo aplica a las rutas de administración, montado únicamente en el router correspondiente) sin afectar accidentalmente a otras partes de la aplicación que no lo necesitan.

**Analogía:** un router anidado es como un departamento independiente dentro de una organización más grande, con su propio conjunto de procedimientos internos específicos, pero accesible desde fuera a través de un punto de entrada único y consistente (el prefijo de montaje), permitiendo reorganizar la estructura interna del departamento sin afectar cómo el resto de la organización lo contacta desde fuera.

**¿Por qué es importante?** Los routers anidados son la forma estándar y escalable de organizar una API con múltiples grupos de rutas relacionadas, facilitando el trabajo en equipo y la aplicación selectiva de middleware a subconjuntos específicos de rutas.

**Código del ejemplo:**

```js
// routers/tareas.js
const router = Router();
router.get("/", (req, res) => res.json(tareas));
router.post("/", (req, res) => { /* ... */ });
export default router;

// app.js
app.use("/tareas", router); // todas las rutas del router viven bajo /tareas
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás montar un router bajo un prefijo y mantener sus rutas en un archivo separado. **Prerrequisitos:** Node LTS, npm e imports ESM. Este ejemplo independiente inicia en una carpeta vacía.

#### Paso 2 · Contexto y caso real

Cuando una API suma productos, usuarios y pedidos, reunir todas las rutas en `app.js` impide encontrar responsabilidades. Un router organiza un grupo coherente y permite aplicar reglas específicas sin afectar rutas ajenas.

#### Paso 3 · Teoría y analogía aplicada

El `app` es el edificio y un `Router` es un departamento. El prefijo de montaje es la dirección del departamento; dentro de él, `router.get("/")` describe su recepción. Separar archivo no crea una API nueva: sigue siendo el mismo servidor y el mismo ciclo de petición.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto e instala Express:

```bash
mkdir ejemplo-routers-express
cd ejemplo-routers-express
npm init -y
npm install express
mkdir -p src/routers
```

En PowerShell usa `New-Item -ItemType Directory -Force src/routers`. Añade `"type": "module"` a `package.json`. Crea `src/routers/tareas.js`:

```js
import { Router } from "express";

const router = Router();
const tareas = [];

router.get("/", (_req, res) => {
  res.json({ tareas });
});

router.post("/", (req, res) => {
  const titulo = req.body?.titulo?.trim();
  if (!titulo) return res.status(400).json({ error: "titulo es obligatorio" });

  const tarea = { id: tareas.length + 1, titulo };
  tareas.push(tarea);
  res.status(201).json({ tarea });
});

router.get("/:id", (req, res) => {
  const tarea = tareas.find((item) => item.id === Number(req.params.id));
  if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json({ tarea });
});

export default router;
```

Crea `src/app.js`:

```js
import express from "express";
import tareasRouter from "./routers/tareas.js";

const app = express();
app.use(express.json()); // Debe ejecutarse antes del router que lee req.body.
app.use("/api/tareas", tareasRouter); // El router recibe rutas relativas a este prefijo.

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(3005, "127.0.0.1", () => console.log("API en http://127.0.0.1:3005"));
```

`router.post("/")` se expone como `POST /api/tareas`; `req.params.id` existe porque la ruta define `:id`; el arreglo sigue siendo temporal, solo para aprender routing. Ejecuta:

```bash
node src/app.js
```

En otra terminal crea y consulta:

```bash
curl -i -X POST http://127.0.0.1:3005/api/tareas -H "Content-Type: application/json" -d '{"titulo":"Separar routers"}'
curl -i http://127.0.0.1:3005/api/tareas/1
```

**Resultado esperado:** el POST devuelve `201`; la consulta devuelve `200` con la misma tarea. La URL externa incluye `/api/tareas`, aunque dentro del router las rutas sean `"/"` y `"/:id"`.

**Fallo deliberado y diagnóstico:** cambia temporalmente el import a `./routers/tarea.js`. Node reporta `ERR_MODULE_NOT_FOUND`, que identifica un nombre/ruta de archivo incorrecto. Restáuralo y prueba `GET /api/tareas/99`: el `404` ahora es una tarea inexistente, no un archivo ausente.

#### Paso 5 · Práctica guiada

Agrega `router.use` que escriba `Tareas: METHOD PATH` en la consola. **Pista:** regístralo antes de las rutas para que se ejecute en cada solicitud del router, no en toda la aplicación.

#### Paso 6 · Práctica independiente

Crea `src/routers/salud.js`, móntalo en `/api/salud` y responde `GET /` con estado `ok`. Entrega las pruebas de ambos routers y explica por qué no deben importar el objeto `app` principal.

#### Paso 7 · Cierre y conexión

Ya puedes modularizar rutas sin perder el contrato HTTP. El siguiente tema añadirá validación declarativa y un único punto de manejo de errores en otro proyecto nuevo.

**Errores comunes:** olvidar `express.json` antes del router; repetir el prefijo dentro de cada ruta; importar `app` dentro de un router; usar `404` igual para recurso y ruta sin distinguir mensajes; guardar datos reales en arrays.

**Fuentes oficiales:** [Express Router](https://expressjs.com/en/guide/routing.html), [`express.Router`](https://expressjs.com/en/api.html#express.router) y [parámetros de ruta](https://expressjs.com/en/guide/routing.html#route-parameters).

### Tema 3: Validación de entrada con Zod y manejo centralizado de errores

**Conceptos clave:** esquemas de validación, `safeParse`, middleware de error de 4 parámetros.

Validar la entrada de una API antes de procesarla es esencial para rechazar datos malformados con un mensaje de error claro, en vez de dejar que datos inválidos se propaguen hacia la lógica de negocio o la base de datos, donde podrían causar fallos más difíciles de diagnosticar o incluso corromper datos almacenados. Zod, una biblioteca de validación de esquemas ampliamente adoptada en el ecosistema Node moderno, permite declarar la forma esperada de los datos (`z.object({ titulo: z.string().min(1), prioridad: z.enum(["baja","alta"]) })`) y validar un objeto contra ese esquema con `schema.safeParse(datos)`, que devuelve un resultado estructurado indicando éxito (con los datos ya validados y tipados) o fallo (con una lista detallada de qué campos específicos no cumplieron la validación y por qué), permitiendo responder con un `400` que incluya esos detalles específicos, mucho más útil para el cliente que un mensaje de error genérico sin especificar exactamente qué estuvo mal.

Express reconoce un middleware especial de manejo de errores por su firma específica de **cuatro** parámetros (`(err, req, res, next)`, en vez de los tres parámetros normales de un middleware regular), y lo invoca automáticamente cuando cualquier middleware o ruta anterior en la cadena invoca `next(error)` pasando un error explícitamente, o cuando una excepción síncrona no capturada ocurre dentro de un manejador de ruta. Centralizar el manejo de errores en un único middleware de este tipo, registrado al final de toda la cadena de middleware y rutas, evita repetir lógica de manejo de errores (registrar el error, decidir el código de estado apropiado, formatear una respuesta consistente) en cada ruta individual de la aplicación.

Es importante notar que este manejo automático de errores de Express solo captura excepciones síncronas o errores pasados explícitamente a `next(error)`; errores lanzados dentro de código asíncrono (una Promesa rechazada dentro de un manejador de ruta `async`) requieren capturarse explícitamente con `try`/`catch` y pasarse manualmente a `next(error)` (o usar un envoltorio auxiliar que automatice esto), un detalle de manejo de errores asíncronos en Express que sorprende a quien no lo conoce de antemano, dado que Express fue diseñado originalmente en una era anterior a la adopción generalizada de `async`/`await` en el ecosistema Node.

**Analogía:** validar con Zod antes de procesar es como un control de calidad en la entrada de una fábrica que rechaza materiales que no cumplen la especificación, con una lista clara y específica de qué exactamente no cumplió, en vez de dejar pasar cualquier material y descubrir el problema mucho más tarde, en una etapa de producción donde el coste de corregirlo es considerablemente mayor.

**¿Por qué es importante?** Validar con una biblioteca como Zod evita la fragilidad de revisar manualmente cada campo del body, y el manejo centralizado de errores evita duplicar lógica de manejo de errores en cada ruta individual de una API que crece con el tiempo.

**Código del ejemplo:**

```js
const TareaSchema = z.object({ titulo: z.string().min(1), prioridad: z.enum(["baja","alta"]) });
app.post("/tareas", (req, res) => {
  const resultado = TareaSchema.safeParse(req.body);
  if (!resultado.success) return res.status(400).json({ errores: resultado.error.issues });
  tareas.push(resultado.data);
  res.status(201).json(resultado.data);
});
app.use((err, req, res, next) => { // 4 parámetros: Express lo reconoce como error handler
  console.error(err);
  res.status(500).json({ error: "Algo salió mal" });
});
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás validar una entrada con Zod, devolver errores de cliente consistentes y enviar fallos inesperados a un único middleware. **Prerrequisitos:** Node LTS, npm, Express y JSON básico; este ejemplo independiente empieza desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API de tareas debe rechazar datos inválidos antes de guardarlos y no puede exponer internamente cada excepción al cliente. El caso real separa tres responsabilidades: validar el contrato, ejecutar la ruta y formatear fallos inesperados en un lugar auditable.

#### Paso 3 · Teoría y analogía aplicada

Zod funciona como control de calidad en la puerta: `safeParse` no lanza al recibir datos inválidos, entrega un resultado que la ruta convierte en `400`. El middleware de cuatro parámetros es la recepción de incidentes: recibe errores ya inesperados y devuelve un mensaje público sin filtrar detalles internos.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto e instala dependencias:

```bash
mkdir ejemplo-zod-errores
cd ejemplo-zod-errores
npm init -y
npm install express zod
mkdir src
```

Añade `"type": "module"` a `package.json` y crea `src/server.js`:

```js
import express from "express";
import { z } from "zod";

const app = express();
const tareas = [];

const tareaSchema = z.object({
  titulo: z.string().trim().min(3, "titulo debe tener al menos 3 caracteres"),
  prioridad: z.enum(["baja", "media", "alta"]),
});

app.use(express.json());

app.post("/tareas", (req, res, next) => {
  const resultado = tareaSchema.safeParse(req.body);

  if (!resultado.success) {
    // issues contiene ruta y mensaje de cada regla que no se cumplió.
    return res.status(400).json({ error: "Entrada inválida", detalles: resultado.error.issues });
  }

  try {
    const tarea = { id: tareas.length + 1, ...resultado.data };
    tareas.push(tarea);
    return res.status(201).json({ tarea });
  } catch (error) {
    return next(error); // La ruta no decide cómo serializar fallos inesperados.
  }
});

app.get("/fallo-controlado", (_req, _res, next) => {
  next(new Error("Demostración de fallo interno"));
});

app.use((err, _req, res, _next) => {
  console.error("Error interno:", err.message);
  res.status(500).json({ error: "Error interno; consulta el registro del servidor" });
});

app.listen(3006, "127.0.0.1", () => console.log("API en http://127.0.0.1:3006"));
```

`safeParse` permite decidir el `400` sin `try/catch`; `resultado.data` solo existe si cumplió el esquema; `next(error)` salta al handler final, cuya firma de cuatro parámetros es significativa para Express. Ejecuta:

```bash
node src/server.js
```

En otra terminal crea una tarea válida:

```bash
curl -i -X POST http://127.0.0.1:3006/tareas -H "Content-Type: application/json" -d '{"titulo":"Estudiar Zod","prioridad":"alta"}'
```

**Resultado esperado:** devuelve `201` con una tarea validada. La respuesta no incluye campos desconocidos porque el esquema define el contrato de entrada.

**Fallo deliberado y diagnóstico:** envía `{"titulo":"x","prioridad":"urgente"}` con la misma cabecera. Debes obtener `400` con dos detalles: título corto y prioridad no permitida. Luego solicita `/fallo-controlado`: el cliente recibe `500` sin el mensaje interno, mientras la consola muestra `Demostración de fallo interno`.

#### Paso 5 · Práctica guiada

Añade `fechaLimite: z.iso.date().optional()`. **Pista:** prueba primero una fecha ISO válida (`2026-12-01`) y después `01/12/2026`; el segundo caso debe quedar en `400`.

#### Paso 6 · Práctica independiente

Crea `PATCH /tareas/:id` usando un esquema parcial que no permita un body vacío. Entrega una actualización válida, un campo inválido y una tarea inexistente; explica la diferencia entre `400`, `404` y `500`.

#### Paso 7 · Cierre y conexión

Ya puedes convertir contratos de entrada en respuestas claras y centralizar fallos inesperados. El siguiente tema comparará Express con Fastify en dos proyectos nuevos, sin asumir que un benchmark aislado decide la arquitectura.

**Errores comunes:** usar `parse` sin capturar su excepción; devolver `500` para errores de entrada; enviar `err.stack` al cliente; registrar el handler de error antes de las rutas; creer que validar reemplaza reglas de negocio.

**Fuentes oficiales:** [Zod: basic usage](https://zod.dev/basics), [manejo de errores en Express](https://expressjs.com/en/guide/error-handling.html), [estado `400`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/400) y [estado `500`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/500).

### Tema 4: Express frente a Fastify

**Conceptos clave:** hooks, JSON Schema nativo, rendimiento comparativo.

Fastify es una alternativa a Express diseñada desde cero con el rendimiento y la validación de esquemas como prioridades centrales de su arquitectura, en vez de añadidas posteriormente mediante bibliotecas de terceros como en Express. Fastify usa "hooks" (`onRequest`, `preHandler`, entre otros) en vez del modelo de middleware lineal de Express, permitiendo un control más granular y explícito sobre en qué punto exacto del ciclo de vida de una petición se ejecuta cada pieza de lógica adicional, y valida y serializa datos usando JSON Schema de forma nativa e integrada directamente en la definición de cada ruta, en vez de requerir una biblioteca externa separada como Zod integrada manualmente.

Esta integración nativa de JSON Schema en Fastify no es solo una conveniencia sintáctica: Fastify usa el esquema declarado para generar automáticamente una función de serialización altamente optimizada para la respuesta de cada ruta específica, una optimización de rendimiento que contribuye directamente a que Fastify demuestre consistentemente mejor rendimiento bruto (peticiones por segundo) que Express en benchmarks comparativos, especialmente notable en aplicaciones con alto volumen de tráfico donde esa diferencia de rendimiento por petición se acumula significativamente a escala.

La elección entre Express y Fastify en la práctica depende de varios factores más allá del rendimiento bruto: Express tiene un ecosistema de middleware de terceros más extenso y maduro (acumulado durante más años de adopción), y su modelo mental es frecuentemente considerado más simple de aprender inicialmente; Fastify ofrece mejor rendimiento y una experiencia de validación más integrada nativamente, pero con un ecosistema de plugins algo menos extenso que el de Express. Para la mayoría de proyectos nuevos sin requisitos extremos de rendimiento, ambos frameworks son opciones perfectamente viables, y la decisión frecuentemente se reduce a la familiaridad del equipo o a preferencias de ergonomía específicas más que a una diferencia decisiva de capacidades.

**Analogía:** Express es como una cocina tradicional bien equipada con utensilios genéricos ampliamente disponibles y bien conocidos por la mayoría de cocineros; Fastify es como una cocina diseñada específicamente para máxima eficiencia de producción, con equipamiento especializado integrado (JSON Schema nativo) que acelera tareas específicas y repetitivas, a cambio de un ecosistema algo menos extenso de accesorios de terceros disponibles.

**¿Por qué es importante?** Conocer las diferencias arquitectónicas entre Express y Fastify (modelo de hooks frente a middleware lineal, JSON Schema nativo frente a validación externa) permite elegir con criterio informado según las prioridades específicas de un proyecto, en vez de adoptar por defecto la opción más popular sin considerar alternativas.

**Diagrama:**

```
Express: middleware lineal (app.use), validación externa (Zod), ecosistema más extenso
Fastify: hooks granulares (onRequest/preHandler), JSON Schema nativo integrado,
         mejor rendimiento bruto por la serialización optimizada generada del schema
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás crear el mismo endpoint con Express y Fastify, y elegir según contrato, validación y operación, no solo por popularidad. **Prerrequisitos:** Node LTS, npm y conceptos básicos de HTTP. Este ejemplo independiente usa dos proyectos nuevos.

#### Paso 2 · Contexto y caso real

Un equipo debe iniciar una API de catálogo. Express puede ser ideal si el equipo necesita middleware conocido; Fastify puede ayudar cuando quiere schemas de request/response integrados. La decisión debe partir de pruebas y necesidades del producto, no de un número de benchmark aislado.

#### Paso 3 · Teoría y analogía aplicada

Express es una cocina flexible: agregas herramientas mediante middleware. Fastify es una cocina con estaciones y especificaciones integradas: hooks para etapas precisas y JSON Schema para validar/serializar. Ambos pueden entregar el mismo plato; la diferencia es cómo organizan el trabajo y qué garantías declaran cerca de la ruta.

#### Paso 4 · Demostración guiada desde cero

Crea dos proyectos nuevos, uno por framework:

```bash
mkdir ejemplo-express-vs-fastify
cd ejemplo-express-vs-fastify
mkdir express-api fastify-api
cd express-api
npm init -y
npm install express
mkdir src
cd ../fastify-api
npm init -y
npm install fastify
mkdir src
```

En ambos `package.json` añade `"type": "module"`. Crea `express-api/src/server.js`:

```js
import express from "express";

const app = express();
app.use(express.json());

app.get("/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id debe ser un entero positivo" });
  }
  return res.json({ id, nombre: "Cuaderno" });
});

app.listen(3010, "127.0.0.1", () => console.log("Express en http://127.0.0.1:3010"));
```

Crea `fastify-api/src/server.js`:

```js
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/productos/:id", {
  schema: {
    params: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "integer", minimum: 1 } },
    },
    response: {
      200: {
        type: "object",
        required: ["id", "nombre"],
        properties: { id: { type: "integer" }, nombre: { type: "string" } },
      },
    },
  },
}, async (request) => {
  // Fastify valida params antes de invocar este handler.
  return { id: request.params.id, nombre: "Cuaderno" };
});

await app.listen({ port: 3011, host: "127.0.0.1" });
```

Express valida manualmente dentro de la ruta. Fastify declara schema junto con la ruta y valida antes del handler; ambos deben devolver el mismo recurso válido. Arranca cada uno en una terminal distinta:

```bash
node express-api/src/server.js
node fastify-api/src/server.js
```

En otras terminales compara respuestas válidas:

```bash
curl -i http://127.0.0.1:3010/productos/7
curl -i http://127.0.0.1:3011/productos/7
```

**Resultado esperado:** ambos devuelven `200` con `{"id":7,"nombre":"Cuaderno"}`. Fastify además escribe logs estructurados; Express no lo hace hasta que agregas un logger.

**Fallo deliberado y diagnóstico:** solicita `/productos/cero` a ambos servidores. Express devuelve su `400` manual; Fastify devuelve `400` al validar `params` antes del handler. No interpretes este experimento como benchmark: solo prueba que cada framework hace visible la validación en una capa diferente.

#### Paso 5 · Práctica guiada

Agrega una marca de tiempo: en Express con middleware que la ponga en `req`, y en Fastify con un hook `onRequest` que la ponga en `request`. **Pista:** no envíes la marca si no forma parte del schema de respuesta de Fastify.

#### Paso 6 · Práctica independiente

Implementa `POST /productos` en ambos proyectos. En Fastify declara `body` y `response`; en Express usa la validación manual que consideres necesaria. Entrega pruebas válidas e inválidas y una decisión razonada sobre cuál mantendrías para un equipo concreto.

La evidencia demuestra ambas salidas HTTP para el mismo caso válido y explica qué capa valida cada framework.

#### Paso 7 · Cierre y conexión

Ya puedes comparar los dos frameworks por sus contratos y ergonomía. El próximo módulo persistirá datos con una base real, en un nuevo ejemplo que no depende de estos servidores.

**Errores comunes:** comparar rendimiento sin misma carga/versión/configuración; usar Fastify sin schema y esperar validación; olvidar `express.json`; mezclar APIs de plugins de versiones incompatibles; elegir por moda sin considerar habilidades del equipo.

**Fuentes oficiales:** [Express API](https://expressjs.com/en/api.html), [Fastify: getting started](https://fastify.dev/docs/latest/Guides/Getting-Started/), [Fastify validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) y [Fastify hooks](https://fastify.dev/docs/latest/Reference/Hooks/).

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una API REST con Express que incluya middleware de logging, validación con Zod y manejo de errores centralizado, y repetir el ejercicio con Fastify para comparar.

**Requisitos previos:** Node.js instalado, Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear la API base con Express | `GET /tareas`, `POST /tareas` con `express.json()` | Verifica el flujo básico funcionando |
| 2 | Escribir el middleware de logging | Ver Tema 1 | Registra método, ruta y tiempo de respuesta |
| 3 | Organizar rutas en un router separado | Ver Tema 2 | Móntalo con `app.use("/tareas", router)` |
| 4 | Agregar validación con Zod | Ver Tema 3 | Responde 400 con errores específicos si el body no cumple |
| 5 | Implementar manejo centralizado de errores | Middleware de 4 parámetros | Captura errores de cualquier ruta |
| 6 | Repetir con Fastify | Misma funcionalidad completa | Compara rendimiento, ergonomía de schemas y declaración de middleware |

**Verificación:** el laboratorio se considera exitoso si la API Express responde correctamente en los tres escenarios (éxito, validación fallida, error interno), y si la versión Fastify replica la misma funcionalidad usando JSON Schema nativo en vez de Zod.

**Errores comunes y soluciones**

- **Registrar el middleware de manejo de errores antes que las rutas.** Debe registrarse al FINAL de la cadena, después de todas las rutas, para capturar correctamente errores de cualquiera de ellas.
- **No capturar errores de rutas `async` con `try`/`catch`.** Express no captura automáticamente rechazos de Promesas en manejadores `async`; envuelve la lógica en `try`/`catch` y pasa el error a `next(error)` explícitamente.
- **Olvidar que un router necesita su propio middleware si lo requiere.** Un middleware registrado en `app` antes de montar el router aplica a todas las rutas incluyendo el router; uno registrado solo en el router aplica únicamente a ese grupo específico.

---
