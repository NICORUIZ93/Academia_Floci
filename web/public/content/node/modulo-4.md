# Módulo 4: Express/Fastify — routing y middleware

## Sílabo

**Objetivo general**

Dominar el patrón middleware, la base de casi todos los frameworks web de Node, construyendo una API con Express que incluya logging, validación y manejo de errores centralizado, y comparándola con Fastify.

**Objetivos específicos**

1. Explicar el orden de ejecución de middleware y el rol de `next()`.
2. Organizar rutas relacionadas en routers anidados.
3. Implementar manejo centralizado de errores con un middleware de 4 parámetros.
4. Validar la entrada de una API con una biblioteca de esquemas como Zod.
5. Comparar Express con Fastify en rendimiento y ergonomía de schemas.

**Contenido**

- Middleware: orden de ejecución y `next()`.
- Routers anidados.
- Manejo centralizado de errores.
- Validación de entrada (Zod/Joi).
- `express-validator` como alternativa.
- Diferencias clave Express frente a Fastify: hooks y JSON Schema nativo.

**Evaluación**

Una API REST con middleware de logging, validación y manejo de errores centralizado, más tres ejercicios de evaluación.

---

## Contenido teórico

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

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

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


## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- OpenJS Foundation, *Node.js Documentation*.
- IETF, especificaciones HTTP Semantics, OAuth 2.0 y JSON.
- OWASP Foundation, *Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Un middleware es una función `(req, res, next)` que puede inspeccionar, modificar o detener una petición; el orden de registro determina el orden de ejecución.
- Los routers anidados (`express.Router()`) organizan rutas relacionadas de forma modular, montadas con un prefijo específico.
- Zod valida la entrada declarativamente; un middleware de 4 parámetros centraliza el manejo de errores de toda la aplicación.
- Fastify usa hooks y JSON Schema nativo, ofreciendo mejor rendimiento bruto a cambio de un ecosistema algo menos extenso que Express.

**Conceptos aprendidos**

- El patrón middleware y el rol crítico de `next()`.
- Organización modular de rutas con routers anidados.
- Validación de entrada con Zod y manejo centralizado de errores.
- Diferencias arquitectónicas entre Express y Fastify.

**Próximos pasos**

En el Módulo 5 conectarás tu API a una base de datos real, aprendiendo cuándo un ORM como Prisma ayuda y cuándo estorba, incluyendo pools de conexiones y transacciones.

**Recursos adicionales**

- Documentación oficial de Express ("Using middleware") y de Fastify ("Hooks", "Validation and Serialization").
- Documentación oficial de Zod (zod.dev).
