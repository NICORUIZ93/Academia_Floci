# Módulo 8: Patrones asíncronos avanzados

## Sílabo

**Objetivo general**

Escalar una aplicación Node más allá de una sola instancia y un solo hilo, usando Worker Threads para trabajo CPU-bound, el módulo cluster para aprovechar múltiples núcleos, y colas de trabajo para procesamiento en background.

**Objetivos específicos**

1. Mover una tarea CPU-bound a un Worker Thread sin bloquear el Event Loop principal.
2. Usar el módulo `cluster` para balancear peticiones entre múltiples procesos.
3. Configurar una cola de trabajo con BullMQ y Redis para procesamiento en background.
4. Configurar reintentos automáticos con backoff exponencial para jobs que fallan.

**Contenido**

- Worker threads para CPU-bound.
- Cluster module y balanceo entre procesos.
- Colas de trabajo con BullMQ + Redis.
- Procesamiento en background.
- `pm2` en modo cluster y `--max-old-space-size`.
- Heap snapshots y detección de memory leaks.

**Evaluación**

Una cola de procesamiento en background (envío de emails) con reintentos y backoff, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Una cola de procesamiento en background (envío de emails) con reintentos y backoff, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
mkdir -p academia-labs/node-api/src
cd academia-labs/node-api
npm init -y
npm install fastify
npm install -D typescript tsx @types/node
git init
```

Trabaja dentro de `academia-labs/node-api`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/node-api/
├─ src/
│  └─ module-8/
├─ tests/
├─ docs/decisions/
├─ evidence/module-8/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Worker Threads para trabajo CPU-bound | `src/module-8/topic-1-worker-threads-para-trabajo-cpu-bound.ts` | prueba + salida observable |
| 2. Cluster module y balanceo entre procesos | `src/module-8/topic-2-cluster-module-y-balanceo-entre-procesos.ts` | prueba + salida observable |
| 3. Colas de trabajo con BullMQ | `src/module-8/topic-3-colas-de-trabajo-con-bullmq.ts` | prueba + salida observable |
| 4. PM2, memory leaks y heap snapshots | `src/module-8/topic-4-pm2-memory-leaks-y-heap-snapshots.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/node-api`:

```bash
npm test && npm run dev
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Una cola de procesamiento en background (envío de emails) con reintentos y backoff, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Envía una entrada inválida o desconecta una dependencia; verifica estado HTTP, cuerpo y log con contexto. Guarda en `evidence/module-8/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Patrones asíncronos avanzados** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Worker Threads para trabajo CPU-bound

**Conceptos clave:** hilo separado con su propia instancia de V8, `workerData`, paso de mensajes.

Un Worker Thread de Node ejecuta JavaScript en un hilo genuinamente separado, cada uno con su propia instancia completa de V8 (a diferencia de los Web Workers del navegador estudiados en el Módulo 10 del track de JavaScript, que comparten conceptualmente el mismo principio de aislamiento pero en un contexto distinto), permitiendo ejecutar cómputo intensivo de CPU (procesar una imagen grande, realizar cálculos matemáticos pesados, comprimir datos) sin bloquear el Event Loop del hilo principal, que permanece libre para seguir atendiendo otras peticiones concurrentes de la aplicación mientras el Worker procesa en paralelo.

Crear un Worker (`new Worker("./procesar-imagen.js", { workerData: {...} })`) le pasa datos iniciales mediante `workerData`, y la comunicación posterior entre el hilo principal y el Worker ocurre mediante paso de mensajes asíncronos (`worker.postMessage()` para enviar, el evento `message` para recibir), exactamente el mismo modelo de comunicación que los Web Workers del navegador, reflejando que ambos comparten el mismo principio fundamental: sin memoria compartida por defecto entre hilos (salvo mediante `SharedArrayBuffer` para casos avanzados específicos que requieren compartir memoria explícitamente), cada hilo opera de forma aislada, comunicándose exclusivamente mediante mensajes serializables.

Identificar correctamente qué trabajo es genuinamente CPU-bound (y por tanto candidato apropiado para un Worker Thread) frente a I/O-bound (que ya se beneficia del modelo no bloqueante nativo de Node sin necesitar ningún Worker adicional, como se estudió en el Módulo 0) es la decisión de diseño central: mover trabajo de I/O (como una consulta a base de datos) a un Worker Thread no aporta ningún beneficio real, porque ese trabajo ya no bloquea el hilo principal en absoluto gracias a libuv; los Worker Threads solo aportan valor real para cómputo síncrono y pesado que, de otro modo, monopolizaría el único hilo de JavaScript disponible durante toda su ejecución.

**Analogía:** un Worker Thread es como contratar temporalmente a un especialista externo con su propio taller completo y separado para realizar una tarea de manufactura pesada específica, comunicándose con la oficina principal únicamente mediante pedidos y entregas formales (mensajes), sin que el especialista tenga acceso directo a los archivos internos de la oficina principal, y sin que su trabajo pesado interrumpa la atención normal a los clientes que la oficina principal sigue recibiendo mientras tanto.

**¿Por qué es importante?** Los Worker Threads son la herramienta correcta y específica para cómputo pesado CPU-bound que, de otro modo, bloquearía perceptiblemente el Event Loop principal, sin aportar ningún beneficio para trabajo I/O-bound que Node ya maneja de forma no bloqueante de forma nativa.

**Código del ejemplo:**

```js
import { Worker } from "node:worker_threads";
const worker = new Worker("./procesar-imagen.js", { workerData: { ruta: "foto.png" } });
worker.on("message", (resultado) => console.log("listo:", resultado));
// El event loop principal NUNCA se bloquea; el trabajo pesado corre en otro hilo
```

### Tema 2: Cluster module y balanceo entre procesos

**Conceptos clave:** un proceso por núcleo, memoria aislada, balanceo automático de conexiones.

El módulo `cluster` permite bifurcar múltiples procesos Node completamente independientes (cada uno ejecutando una copia idéntica de la aplicación), típicamente uno por núcleo de CPU disponible (`os.availableParallelism()`), aprovechando así todos los núcleos del servidor, algo que un único proceso Node de un solo hilo no puede hacer por sí solo (recordando que el hilo único de JavaScript de un proceso Node individual, por diseño, solo puede aprovechar un núcleo de CPU a la vez para ejecutar código JavaScript, aunque libuv internamente use un pool de hilos para I/O). El proceso primario (`cluster.isPrimary`) bifurca los procesos trabajadores con `cluster.fork()`, y cada proceso trabajador ejecuta de forma independiente la aplicación completa (por ejemplo, arrancando su propia instancia del servidor Express).

A diferencia de los Worker Threads del Tema 1, cada proceso de `cluster` tiene memoria completamente aislada del sistema operativo (son procesos genuinamente separados, no hilos dentro del mismo proceso), lo que significa que no pueden compartir estado en memoria directamente entre sí (una variable global en un proceso trabajador no es visible para otro proceso trabajador distinto): cualquier estado que necesite compartirse entre los procesos trabajadores del cluster (como una sesión de usuario, o una caché compartida) debe externalizarse hacia un almacén compartido accesible por todos, como Redis, en vez de asumir que el estado en memoria de un proceso trabajador es accesible desde otro.

Node balancea automáticamente las conexiones entrantes entre los procesos trabajadores del cluster (típicamente mediante un algoritmo round-robin en la mayoría de sistemas operativos), permitiendo que una aplicación aproveche efectivamente todos los núcleos de CPU disponibles del servidor para atender tráfico concurrente, multiplicando la capacidad de throughput total del servidor de forma proporcional (aproximadamente) al número de núcleos disponibles, especialmente beneficioso quando la carga incluye trabajo de cómputo real además de I/O puro.

**Analogía:** el cluster module es como abrir múltiples sucursales idénticas de la misma tienda, cada una con su propio personal y su propio inventario completamente independiente, con un sistema central que dirige automáticamente a cada cliente entrante hacia una sucursal disponible; a diferencia de un Worker Thread (como un especialista dentro de la misma sucursal), estas sucursales no comparten directamente su inventario interno entre sí, requiriendo un almacén central compartido si necesitan coordinar información entre ellas.

**¿Por qué es importante?** El módulo cluster permite que una aplicación Node aproveche todos los núcleos de CPU de un servidor, multiplicando su capacidad de throughput, a costa de requerir externalizar cualquier estado compartido hacia un almacén accesible por todos los procesos, dado el aislamiento completo de memoria entre ellos.

**Código del ejemplo:**

```js
import cluster from "node:cluster";
import { availableParallelism } from "node:os";

if (cluster.isPrimary) {
  for (let i = 0; i < availableParallelism(); i++) cluster.fork(); // un proceso por núcleo
} else {
  arrancarServidorExpress(); // cada worker corre su propia copia, con memoria AISLADA
}
```

### Tema 3: Colas de trabajo con BullMQ

**Conceptos clave:** desacoplar trabajo pesado del ciclo request-response, jobs, reintentos con backoff.

Una cola de trabajo desacopla el procesamiento de una tarea potencialmente lenta o costosa (enviar un email, generar un reporte, procesar un pago) del ciclo síncrono de request-response de una petición HTTP: en vez de que el manejador de la ruta ejecute directamente esa tarea lenta (haciendo que el cliente espere todo ese tiempo antes de recibir una respuesta), el manejador simplemente encola un "job" describiendo el trabajo a realizar, y responde inmediatamente al cliente confirmando que la solicitud fue recibida, mientras el procesamiento real ocurre de forma completamente asíncrona en un proceso worker separado que consume jobs de la cola a su propio ritmo.

BullMQ, una biblioteca de colas de trabajo para Node respaldada por Redis (una base de datos en memoria de alto rendimiento) como almacén subyacente de los jobs, expone una API para encolar jobs (`cola.add("bienvenida", {destinatario: "..."}, {opciones})`) y para procesarlos en un worker separado (`new Worker("emails", async (job) => enviarEmail(job.data))`), que puede ejecutarse incluso en un proceso completamente distinto del que encola los jobs (habilitando escalar el procesamiento de la cola de forma independiente de la API que la alimenta, añadiendo más workers de procesamiento sin necesidad de escalar proporcionalmente la capacidad de la API misma).

Configurar reintentos automáticos con backoff exponencial (`{attempts: 3, backoff: {type: "exponential", delay: 1000}}`) hace que un job que falla (por ejemplo, porque el servicio externo de envío de email está temporalmente no disponible) se reintente automáticamente un número limitado de veces, con una espera creciente entre cada intento sucesivo (el mismo principio de backoff estudiado en el Módulo 6 del track de JavaScript aplicado ahora a jobs de background en vez de peticiones de red directas), aumentando significativamente la resiliencia del sistema ante fallos transitorios sin requerir intervención manual, mientras evita reintentar indefinidamente ante un fallo permanente que ningún reintento resolvería.

**Analogía:** una cola de trabajo es como un servicio de tintorería que recibe tu ropa, te entrega inmediatamente un recibo de confirmación (la respuesta rápida de la API), y procesa el lavado real (el trabajo pesado) en su propio taller interno a su propio ritmo, sin que tengas que esperar de pie en el mostrador hasta que la ropa esté completamente lista.

**¿Por qué es importante?** Las colas de trabajo mejoran drásticamente la latencia percibida por el cliente al desacoplar trabajo pesado del ciclo de respuesta inmediata, y el backoff exponencial en reintentos aumenta la resiliencia del sistema ante fallos transitorios de servicios externos.

**Código del ejemplo:**

```js
const colaEmails = new Queue("emails", { connection: { host: "localhost", port: 6379 } });
await colaEmails.add("bienvenida", { destinatario: "ana@ejemplo.com" }, {
  attempts: 3, backoff: { type: "exponential", delay: 1000 },
});
// El endpoint HTTP responde de inmediato; el envío real ocurre en un worker separado
```

### Tema 4: PM2, memory leaks y heap snapshots

**Conceptos clave:** gestión de procesos, `--max-old-space-size`, snapshots de heap.

PM2 es un gestor de procesos para aplicaciones Node que, en un modelo de despliegue previo a la adopción generalizada de contenedores y orquestadores, proporcionaba reinicio automático ante fallos, logs centralizados y su propia forma de clustering integrado directamente sobre un servidor. En un mundo con Docker y Kubernetes (estudiados en el track DevOps), muchas de estas responsabilidades las asume el propio orquestador (`restart: always` en Kubernetes reemplaza gran parte de lo que PM2 gestionaba antes directamente sobre el sistema operativo), aunque PM2 sigue siendo relevante en despliegues que no usan contenedores, o como herramienta de desarrollo local para gestionar múltiples procesos fácilmente.

`--max-old-space-size` es un flag de V8 (accesible mediante `node --max-old-space-size=4096 script.js`) que ajusta el límite de memoria asignado a la "generación vieja" del heap (el modelo de recolección generacional estudiado en el Módulo 5 del track de JavaScript), relevante para procesos Node que necesitan manejar volúmenes de datos considerables en memoria y que, sin este ajuste, podrían alcanzar el límite por defecto de V8 y fallar con un error de memoria agotada, incluso en un servidor con considerablemente más RAM física disponible de la que V8 usaría por defecto sin este ajuste explícito.

Un heap snapshot captura el estado completo de la memoria del heap de un proceso Node en un momento específico, permitiendo inspeccionar exactamente qué objetos están ocupando memoria y, comparando dos snapshots tomados en momentos distintos durante la ejecución normal de la aplicación, identificar objetos que crecen de forma sostenida y sospechosa en cantidad entre ambos snapshots (una señal característica de una fuga de memoria, el mismo concepto de "referencias mantenidas innecesariamente vivas" estudiado en el Módulo 5 del track de JavaScript, ahora aplicado al diagnóstico específico de un proceso de servidor Node de larga duración). Herramientas como Chrome DevTools (conectadas vía `--inspect`, Módulo 7) permiten tomar y comparar heap snapshots directamente sobre un proceso Node en ejecución, sin necesidad de herramientas adicionales especializadas más allá de las ya disponibles en el navegador.

**Analogía:** PM2 es como un supervisor de turno que reinicia automáticamente una máquina que se detiene inesperadamente; un heap snapshot es como una fotografía detallada del inventario completo de un almacén en un momento específico, y comparar dos fotografías tomadas en momentos distintos revela qué categorías de artículos se están acumulando sospechosamente sin ser retirados nunca, una señal de que algo en el proceso de gestión del almacén no está liberando correctamente el espacio que ya no necesita.

**¿Por qué es importante?** Entender PM2 en contraste con las responsabilidades que asume un orquestador de contenedores, y saber usar heap snapshots para diagnosticar fugas de memoria reales en un proceso Node de larga duración, son habilidades operativas esenciales para mantener aplicaciones Node saludables en producción.

**Prueba en terminal:**

```bash
node --max-old-space-size=4096 servidor.js   # ajusta el límite de memoria de V8
# Chrome DevTools (--inspect) → pestaña Memory → tomar snapshot A → esperar → snapshot B
# comparar A vs B: ¿qué tipo de objeto creció sospechosamente entre ambos?
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

**Objetivo del laboratorio:** mover trabajo CPU-bound a un Worker Thread, aprovechar múltiples núcleos con cluster, y desacoplar trabajo pesado con una cola BullMQ.

**Requisitos previos:** Docker (para Redis), Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Identificar una tarea CPU-bound | Ej. procesar una imagen grande | Muévela a un `worker_thread` |
| 2 | Verificar que el event loop principal no se bloquea | Petición concurrente mientras el worker procesa | Confirma que la API sigue respondiendo normalmente |
| 3 | Configurar cluster | Ver Tema 2 | Un proceso por núcleo, verifica el balanceo de requests |
| 4 | Levantar Redis y configurar BullMQ | `docker run redis`, `new Queue(...)` | Encola un job de "enviar email" |
| 5 | Configurar reintentos con backoff | Ver Tema 3 | Simula un fallo del servicio de email y verifica los reintentos |
| 6 | Medir la diferencia de latencia | Endpoint que encola vs uno que procesa síncronamente | Compara los tiempos de respuesta reales |

**Verificación:** el laboratorio se considera exitoso si el endpoint que usa la cola responde considerablemente más rápido que el equivalente síncrono, y si los reintentos con backoff se ejecutan correctamente ante un fallo simulado del servicio externo.

**Errores comunes y soluciones**

- **Mover trabajo I/O-bound (como una consulta a base de datos) a un Worker Thread.** Esto no aporta ningún beneficio real; Node ya maneja I/O de forma no bloqueante de forma nativa.
- **Asumir que el estado en memoria se comparte entre procesos de cluster.** Cada proceso tiene memoria aislada; externaliza cualquier estado compartido hacia Redis u otro almacén accesible por todos.
- **No limitar el número de reintentos en una cola de trabajo.** Sin un límite (`attempts`), un job que falla permanentemente podría reintentarse indefinidamente sin ningún beneficio real.

---

## Ejercicios de evaluación

### Ejercicio 1: Worker Thread frente a cola de trabajo

**Enunciado:** explica cuándo un Worker Thread es la herramienta correcta y cuándo una cola de trabajo lo es, con un ejemplo de cada caso.

**Solución esperada:** un Worker Thread es apropiado para cómputo pesado que debe completarse como parte de la misma petición HTTP en curso (por ejemplo, procesar una imagen subida y devolver el resultado procesado en la misma respuesta); una cola de trabajo es apropiada cuando el trabajo puede procesarse de forma completamente asíncrona sin que el cliente necesite esperar el resultado inmediato en la misma petición (por ejemplo, enviar un email de confirmación tras un registro, donde el cliente solo necesita saber que el registro se completó, no esperar a que el email termine de enviarse).

**Criterios de éxito:**
- Da un ejemplo correcto y bien justificado para cada herramienta.

### Ejercicio 2: Por qué cluster no comparte memoria

**Enunciado:** explica por qué el módulo `cluster` no comparte memoria entre procesos como sí lo hace, en cierto sentido, un `worker_thread` dentro del mismo proceso.

**Solución esperada:** cada proceso de `cluster` es un proceso del sistema operativo genuinamente independiente, con su propio espacio de memoria completamente aislado por el propio sistema operativo; un `worker_thread`, en cambio, es un hilo dentro del mismo proceso, y aunque tampoco comparte memoria directamente por defecto (se comunica por mensajes, igual que cluster), técnicamente puede compartir memoria explícitamente mediante `SharedArrayBuffer`, una capacidad que procesos completamente separados del sistema operativo no tienen de la misma forma directa.

**Criterios de éxito:**
- Explica correctamente que cluster usa procesos del sistema operativo genuinamente separados, con aislamiento de memoria impuesto por el propio sistema operativo.

### Ejercicio 3: Diagnosticar una fuga de memoria con heap snapshots

**Enunciado:** un proceso Node de larga duración muestra un uso de memoria que crece constantemente sin estabilizarse. Describe el proceso que seguirías con heap snapshots para diagnosticar la causa.

**Solución esperada:** tomaría un primer heap snapshot en un momento dado, dejaría el proceso ejecutándose normalmente durante un tiempo, tomaría un segundo snapshot, y compararía ambos usando Chrome DevTools para identificar qué tipo específico de objeto creció de forma sospechosa en cantidad entre ambos snapshots; esa categoría de objeto sería el punto de partida para investigar qué parte del código mantiene referencias innecesarias a esos objetos, impidiendo que el recolector de basura los libere.

**Criterios de éxito:**
- Describe correctamente el proceso de tomar y comparar dos snapshots en momentos distintos.
- Explica que el objetivo es identificar qué tipo de objeto crece sospechosamente para investigar las referencias que lo mantienen vivo.

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

- Los Worker Threads ejecutan cómputo CPU-bound en un hilo separado sin bloquear el Event Loop principal, comunicándose por mensajes.
- El módulo cluster bifurca procesos completamente aislados en memoria, uno por núcleo, con balanceo automático de conexiones.
- BullMQ desacopla trabajo pesado del ciclo request-response mediante una cola respaldada por Redis, con reintentos configurables por backoff.
- PM2 gestiona procesos Node fuera de un contexto de contenedores; heap snapshots permiten diagnosticar fugas de memoria comparando el estado del heap en distintos momentos.

**Conceptos aprendidos**

- Worker Threads para trabajo CPU-bound genuino.
- El módulo cluster y el aislamiento de memoria entre procesos.
- Colas de trabajo con BullMQ y reintentos con backoff exponencial.
- PM2, ajuste de memoria de V8, y diagnóstico de fugas con heap snapshots.

**Próximos pasos**

En el Módulo 9 aprenderás observabilidad en producción: logging estructurado, correlation IDs, manejo de excepciones no capturadas, y graceful shutdown.

**Recursos adicionales**

- Documentación oficial de Node.js: "Worker threads" y "Cluster".
- Documentación oficial de BullMQ (docs.bullmq.io).
