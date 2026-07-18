# Módulo 3: Servidores HTTP nativos

## Sílabo

**Objetivo general**

Construir un servidor HTTP usando exclusivamente el módulo `http` nativo de Node, entendiendo con precisión qué automatiza un framework como Express antes de depender de él.

**Objetivos específicos**

1. Implementar el modelo request/response del módulo `http` nativo.
2. Implementar routing manual basado en método y URL.
3. Parsear el body de una petición POST acumulando chunks de un stream.
4. Responder con los códigos de estado HTTP apropiados según cada situación.
5. Implementar content negotiation básica según el header `Accept`.

**Contenido**

- Modelo request/response.
- Routing manual.
- Parsing de body y headers.
- Códigos de estado y content negotiation.

**Evaluación**

Un servidor HTTP nativo con 3 rutas y manejo de errores, sin frameworks, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: El modelo request/response

**Conceptos clave:** `createServer`, `IncomingMessage`, `ServerResponse`, request como stream.

`http.createServer(callback)` crea un servidor HTTP que invoca el `callback` proporcionado por cada petición entrante, recibiendo dos objetos: `req` (una instancia de `IncomingMessage`, que representa la petición entrante) y `res` (una instancia de `ServerResponse`, usada para construir y enviar la respuesta). `req` expone propiedades como `req.method` (el verbo HTTP: GET, POST, entre otros) y `req.url` (la ruta solicitada, sin incluir el host ni el protocolo), y es, crucialmente, en sí mismo un stream legible (Módulo 2): el cuerpo de la petición (por ejemplo, el JSON enviado en un POST) no está disponible como un objeto ya parseado desde el inicio, sino que llega progresivamente como chunks de datos binarios a medida que la conexión de red los entrega, requiriendo leerlos explícitamente antes de poder procesarlos.

`res`, el objeto de respuesta, se construye llamando a métodos en una secuencia específica: `res.writeHead(codigoDeEstado, cabeceras)` establece el código de estado HTTP y las cabeceras de la respuesta (debe llamarse antes de escribir cualquier contenido del cuerpo); `res.write(datos)` puede llamarse múltiples veces para escribir el cuerpo de la respuesta progresivamente (útil, por ejemplo, para streaming de una respuesta grande); y `res.end(datosFinales)` finaliza la respuesta, opcionalmente escribiendo un último fragmento de datos antes de cerrar la conexión, señalando al cliente que la respuesta está completa.

Este modelo de bajo nivel, donde tanto la lectura de la petición como la construcción de la respuesta requieren manejo manual explícito, contrasta directamente con la experiencia de usar un framework como Express (Módulo 4), donde `req.body` ya llega parseado automáticamente (gracias a un middleware como `express.json()`) y `res.json(objeto)` encapsula en una sola llamada tanto establecer las cabeceras correctas como serializar y enviar el cuerpo de la respuesta. Construir un servidor con el módulo `http` puro, aunque menos práctico para desarrollo de producción cotidiano, revela exactamente qué trabajo específico automatiza un framework, un conocimiento que facilita depurar comportamientos inesperados incluso cuando se trabaja habitualmente con un framework que abstrae estos detalles.

Escuchar peticiones en un puerto específico se logra con `servidor.listen(puerto)`, tras lo cual el servidor permanece activo indefinidamente, procesando cada nueva conexión entrante mediante el callback registrado en `createServer`, aprovechando el modelo de I/O no bloqueante de Node (Módulo 0) para atender múltiples conexiones concurrentes con el mismo hilo único de JavaScript, sin necesidad de un hilo del sistema operativo dedicado por cada conexión activa.

**Analogía:** el módulo `http` nativo es como recibir correspondencia directamente en un buzón sin ningún servicio de clasificación previo: cada sobre (petición) llega en su forma bruta original, y es responsabilidad de quien lo recibe abrirlo, leer su contenido completo, interpretarlo, y redactar una respuesta apropiada desde cero; un framework como Express es como tener un asistente que ya clasifica, abre y resume automáticamente cada sobre entrante antes de entregártelo, permitiéndote concentrarte directamente en decidir qué responder.

**¿Por qué es importante?** Construir un servidor con `http` puro revela exactamente el trabajo que Express y Fastify automatizan (parsing de body, routing, formato de respuesta), un conocimiento que facilita depurar comportamientos inesperados de esos frameworks al entender qué está ocurriendo realmente por debajo de sus abstracciones.

**Código del ejemplo:**

```js
import { createServer } from "node:http";

const servidor = createServer((req, res) => {
  // req: stream legible (method, url, headers, body como chunks)
  // res: writeHead() → write() (opcional, varias veces) → end()
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hola Node");
});
servidor.listen(3000);
```

### Tema 2: Routing manual

**Conceptos clave:** verificación de método y URL, estado en memoria.

Sin un framework, el routing —decidir qué lógica ejecutar según el método HTTP y la ruta de la petición entrante— se implementa manualmente comparando explícitamente `req.method` y `req.url` contra los valores esperados para cada ruta soportada, típicamente mediante una secuencia de condicionales `if` (o, para un número mayor de rutas, una estructura de datos de mapeo similar al patrón visto en el Módulo 1 del track de JavaScript para reemplazar un `switch` extenso). Cada combinación específica de método y ruta que la aplicación soporta requiere su propia rama de lógica explícita, y cualquier combinación no reconocida debe manejarse explícitamente devolviendo un código de estado 404 (no encontrado), en vez de dejar la petición sin ninguna respuesta.

Mantener un estado simple en memoria (como un array de tareas que crece con cada petición POST y se consulta en cada petición GET) es suficiente para demostrar el patrón completo de un servidor con estado sin necesidad de una base de datos real (que se estudiará en el Módulo 5), aunque es importante entender que este estado en memoria se pierde completamente si el proceso del servidor se reinicia, y no se comparte automáticamente entre múltiples instancias del servidor ejecutándose en paralelo (relevante si se considera clustering, estudiado en el Módulo 8), limitaciones que una base de datos real resuelve pero que son aceptables para el propósito pedagógico de entender el modelo de routing básico en este módulo.

Este ejercicio de routing completamente manual, aunque impracticable para una aplicación de producción con decenas o cientos de rutas (donde la repetición y el riesgo de errores de comparación manual crecerían considerablemente), es precisamente lo que revela el valor concreto que un router de framework (como `express.Router()`, estudiado en el Módulo 4) proporciona: extracción automática de parámetros de ruta (`/tareas/:id`), organización modular de rutas relacionadas, y una sintaxis declarativa mucho más concisa que una cadena larga de condicionales manuales comparando strings.

Comparar explícitamente el código de este servidor manual con el equivalente en Express, línea por línea, es un ejercicio de aprendizaje valioso: cada verificación manual de `req.method === "GET" && req.url === "/tareas"` tiene una contraparte directa y mucho más concisa en Express (`app.get("/tareas", handler)`), haciendo tangible y concreto exactamente cuánto trabajo repetitivo un framework de routing elimina.

**Analogía:** el routing manual es como un recepcionista que debe memorizar y verificar manualmente, mediante una larga lista de instrucciones escritas, exactamente qué hacer para cada combinación específica de "quién pregunta" y "qué pregunta"; un router de framework es como un sistema de derivación automática que, con solo declarar las reglas una vez de forma organizada, dirige automáticamente cada solicitud entrante hacia el procedimiento correcto sin repetir manualmente la lógica de comparación en cada caso.

**¿Por qué es importante?** Implementar routing manual revela exactamente el trabajo repetitivo que un router de framework automatiza, dando una apreciación concreta y bien fundamentada del valor real que aportan esas abstracciones antes de depender de ellas sin cuestionarlas.

**Código del ejemplo:**

```js
if (req.method === "GET" && req.url === "/tareas") { /* ... */ }
else if (req.method === "POST" && req.url === "/tareas") { /* ... */ }
else { res.writeHead(404); res.end("No encontrado"); }
// Express equivalente: app.get("/tareas", ...); app.post("/tareas", ...);
```

### Tema 3: Parsing de body y headers

**Conceptos clave:** acumulación de chunks, `for await...of` sobre un stream, `JSON.parse`.

Como `req` es un stream legible (Tema 1), leer el cuerpo completo de una petición POST requiere acumular explícitamente todos los chunks de datos entrantes antes de poder procesarlos como un todo. El patrón moderno y recomendado usa `for await (const chunk of req)` (aprovechando que los streams de Node son iterables asíncronos, una capacidad de generadores relacionada con el Módulo 6 del track de JavaScript), acumulando cada `chunk` en un array, y una vez que el bucle termina (indicando que el stream ya entregó todos sus datos), combinando esos chunks acumulados con `Buffer.concat(chunks)` para obtener el contenido binario completo, convirtiéndolo finalmente a string y parseándolo como JSON con `JSON.parse()`.

Este proceso debe envolverse en un `try`/`catch` explícito, porque `JSON.parse()` lanza una excepción si el contenido recibido no es JSON válido (por ejemplo, si el cliente envió un cuerpo malformado, o ningún cuerpo en absoluto), un caso que debe traducirse en una respuesta con código de estado 400 (petición incorrecta) en vez de dejar que la excepción se propague sin manejar y potencialmente derribe el proceso del servidor completo, afectando a todas las demás peticiones concurrentes que ese mismo proceso podría estar atendiendo simultáneamente.

Las cabeceras (headers) de la petición están disponibles directamente en `req.headers`, un objeto plano con los nombres de cabecera en minúsculas como claves (independientemente de cómo el cliente los haya escrito originalmente, HTTP normaliza la comparación de nombres de cabecera sin distinguir mayúsculas de minúsculas). Leer `req.headers["content-type"]` o `req.headers.accept` permite tomar decisiones basadas en lo que el cliente indica sobre el formato de los datos que envía o que espera recibir, información esencial tanto para el parsing correcto del body (verificar que el `content-type` efectivamente indica JSON antes de intentar parsearlo como tal) como para la content negotiation del Tema 4.

Este proceso manual de acumulación de chunks es, precisamente, el trabajo exacto que `express.json()` (un middleware, concepto central del Módulo 4) automatiza completamente: verificar el `content-type`, acumular los chunks, parsear el JSON, manejar errores de parsing, y finalmente exponer el resultado ya parseado directamente como `req.body`, sin que el código de cada ruta individual necesite repetir este proceso de bajo nivel cada vez.

**Analogía:** parsear el body manualmente es como recibir un documento importante enviado en fragmentos separados por correo postal en distintos sobres, donde hay que esperar a que lleguen todos los sobres, ensamblarlos en el orden correcto, y solo entonces poder leer el documento completo, verificando además que el resultado ensamblado tenga sentido antes de actuar sobre él.

**¿Por qué es importante?** Entender el proceso manual de acumulación de chunks y parsing de JSON revela por qué el body de una petición HTTP en Node no llega "gratis" ya parseado, y qué trabajo específico automatiza un middleware como `express.json()`.

**Código del ejemplo:**

```js
const chunks = [];
for await (const chunk of req) chunks.push(chunk);
try {
  const datos = JSON.parse(Buffer.concat(chunks).toString());
  // procesar datos...
} catch {
  res.writeHead(400); res.end("JSON inválido");
}
```

### Tema 4: Códigos de estado y content negotiation

**Conceptos clave:** códigos de estado HTTP apropiados, negociación de contenido según `Accept`.

Responder con el código de estado HTTP correcto para cada situación es una parte esencial (y frecuentemente descuidada) de construir una API bien diseñada: `200` (OK) para una consulta exitosa; `201` (Created) específicamente cuando una petición POST crea exitosamente un nuevo recurso, distinguiéndose deliberadamente de un `200` genérico para comunicar con precisión semántica qué ocurrió; `400` (Bad Request) cuando la petición del cliente está mal formada (JSON inválido, campos faltantes); `404` (Not Found) cuando la ruta solicitada no existe; y `500` (Internal Server Error) cuando ocurre un fallo inesperado del lado del servidor no atribuible a un error del cliente. Elegir el código correcto no es un formalismo sin sentido práctico: clientes de la API (incluyendo bibliotecas HTTP automatizadas) frecuentemente toman decisiones de comportamiento basadas en el código de estado recibido (por ejemplo, reintentar automáticamente ante un 503 pero no ante un 400, porque un 400 indica un problema con la petición enviada que un reintento idéntico no resolvería).

Content negotiation es el proceso mediante el cual un servidor decide el formato de la respuesta según lo que el cliente indica que puede aceptar, comunicado mediante la cabecera `Accept` de la petición. Una implementación básica verifica si `req.headers.accept` incluye `"application/json"`, respondiendo en ese formato si es así, o recurriendo a texto plano (`text/plain`) como formato alternativo si el cliente no indica preferencia explícita por JSON, permitiendo que un mismo endpoint sirva tanto a clientes que consumen la API programáticamente (esperando JSON estructurado) como a clientes más simples que simplemente quieren ver una representación textual legible directamente en una herramienta como `curl` sin ninguna cabecera especial.

Establecer correctamente la cabecera `Content-Type` de la respuesta (mediante `res.writeHead(codigo, {"Content-Type": tipo})`) es complementario y necesario junto con content negotiation: comunica explícitamente al cliente cómo debe interpretar el cuerpo de la respuesta recibida, y omitir esta cabecera (o establecerla incorrectamente) puede causar que un cliente interprete incorrectamente datos JSON válidos como texto plano sin estructura, o viceversa, un error de integración sutil pero con consecuencias reales en la interoperabilidad entre el servidor y sus clientes.

Practicar la construcción manual de estas decisiones —qué código de estado corresponde a cada situación, cómo negociar el formato de respuesta según las preferencias del cliente— antes de depender de las convenciones automáticas de un framework consolida un entendimiento preciso de la semántica HTTP subyacente, que sigue siendo directamente relevante incluso al trabajar con un framework que simplifica la sintaxis pero no cambia el significado real de estas decisiones de diseño de API.

**Analogía:** los códigos de estado HTTP son como un sistema estandarizado de semáforos y señales de tráfico que comunican de forma universal e inequívoca el resultado de una interacción (éxito, problema del solicitante, problema del proveedor), permitiendo que cualquier participante del sistema (incluyendo sistemas automatizados que nunca "leen" el contenido real de la respuesta) tome decisiones correctas basándose únicamente en esa señal estandarizada.

**¿Por qué es importante?** Elegir el código de estado HTTP correcto y practicar content negotiation básica son decisiones de diseño de API que comunican significado preciso tanto a humanos como a sistemas automatizados que consumen la API, con consecuencias reales de comportamiento (reintentos, manejo de errores) más allá de una simple formalidad.

**Código del ejemplo:**

```js
const aceptaJson = req.headers.accept?.includes("application/json");
res.writeHead(200, { "Content-Type": aceptaJson ? "application/json" : "text/plain" });
res.end(aceptaJson ? JSON.stringify(dato) : String(dato));

// Códigos según situación:
// 200 consulta OK · 201 recurso creado · 400 petición inválida
// 404 ruta inexistente · 500 fallo inesperado del servidor
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

**Objetivo del laboratorio:** construir un servidor HTTP nativo completo con 3 rutas, manejo de errores y content negotiation, sin usar ningún framework.

**Requisitos previos:** Node.js instalado, `curl` disponible, Módulos 0-2 completados.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Crear el servidor básico | `createServer` respondiendo "Hola Node" en GET / | Arráncalo y verifica con el navegador o `curl` |
| 2 | Agregar routing manual de tareas | GET /tareas devuelve array; POST /tareas agrega elemento | Estado en memoria simple |
| 3 | Parsear el body de un POST | Ver Tema 3 | Acumula chunks y haz `JSON.parse` al final |
| 4 | Responder con códigos de estado correctos | 201 al crear, 404 no encontrado, 400 JSON inválido | Verifica cada caso con `curl` |
| 5 | Implementar content negotiation | Ver Tema 4 | Responde JSON o texto según el header `Accept` |
| 6 | Probar con curl | `curl -X POST -d '{"titulo":"Tarea 1"}' -H "Content-Type: application/json" localhost:3000/tareas` | Verifica la respuesta completa |

**Verificación:** el laboratorio se considera exitoso si las 3 rutas responden con los códigos de estado correctos en cada escenario (éxito, no encontrado, JSON inválido), y si la content negotiation responde correctamente en JSON o texto plano según el header `Accept` enviado.

**Errores comunes y soluciones**

- **Llamar a `res.end()` sin haber llamado antes a `res.writeHead()`.** Esto envía la respuesta con un código de estado 200 por defecto; siempre establece explícitamente el código de estado correcto antes de finalizar la respuesta.
- **Intentar parsear `req.body` directamente sin acumular los chunks primero.** `req` no tiene una propiedad `body` sin un middleware o un manejo manual explícito; recuerda que es un stream, no un objeto ya parseado.
- **Olvidar manejar el caso de ruta no reconocida.** Sin un `else` final explícito, una petición a una ruta inexistente podría quedar sin ninguna respuesta.

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

- `http.createServer` expone `req` (un stream legible con method/url/headers) y `res` (construida con `writeHead`/`write`/`end`).
- El routing manual requiere comparar explícitamente método y URL para cada ruta soportada, revelando el trabajo que un router de framework automatiza.
- El body de una petición debe acumularse manualmente de un stream de chunks antes de poder parsearse como JSON.
- Elegir el código de estado HTTP correcto y practicar content negotiation son decisiones de diseño de API con consecuencias reales de interoperabilidad.

**Conceptos aprendidos**

- El modelo request/response del módulo `http` nativo de Node.
- Routing manual sin framework.
- Parsing manual del body de una petición HTTP.
- Códigos de estado HTTP apropiados y content negotiation básica.

**Próximos pasos**

En el Módulo 4 aprenderás Express y Fastify, dos frameworks que automatizan gran parte de lo construido manualmente en este módulo mediante el patrón de middleware.

**Recursos adicionales**

- Documentación oficial de Node.js: "HTTP" (módulo `node:http`).
- MDN Web Docs: "HTTP response status codes".
