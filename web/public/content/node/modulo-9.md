# Módulo 9: Observabilidad y manejo de errores en producción

## Sílabo

**Objetivo general**

Diagnosticar un proceso Node en producción basándose en evidencia (logs estructurados, correlation IDs) en vez de adivinar, implementando manejo robusto de excepciones y apagado ordenado (graceful shutdown).

**Objetivos específicos**

1. Reemplazar `console.log` por logging estructurado en formato JSON con Pino.
2. Implementar un correlation ID por petición para rastrear su ciclo de vida completo.
3. Manejar excepciones no capturadas y rechazos de promesas sin `catch`.
4. Implementar un endpoint de health check y graceful shutdown ante `SIGTERM`.
5. Comparar REST, GraphQL y gRPC como estilos de diseño de API.

**Contenido**

- Logging estructurado (pino/winston).
- Correlation ID por request.
- Manejo de excepciones no capturadas.
- Health checks y graceful shutdown.
- `process.on("unhandledRejection")`.
- Diseño de APIs: REST frente a GraphQL (Apollo Server) frente a gRPC.

**Evaluación**

Una API con logging estructurado, correlation ID y apagado controlado, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Logging estructurado

**Conceptos clave:** logs en JSON frente a texto libre, indexación y filtrado.

`console.log` con mensajes de texto libre es adecuado para desarrollo local, pero se vuelve rápidamente insuficiente en producción, donde los logs de una aplicación real necesitan ser indexados, filtrados y correlacionados por herramientas de agregación de logs (Datadog, CloudWatch, Grafana Loki, mencionadas también en el Módulo 10 del track DevOps), capacidades que dependen de que cada línea de log tenga una estructura consistente y parseable, no texto libre arbitrario donde cada desarrollador elige su propio formato inconsistente de mensaje.

Pino es una biblioteca de logging para Node diseñada específicamente para producir logs estructurados en formato JSON con overhead de rendimiento mínimo (una consideración de diseño deliberada, dado que el logging ocurre en el camino crítico de cada petición de una aplicación de alto tráfico): `log.info({usuarioId: 42, accion: "crear_tarea"}, "Tarea creada")` produce una línea JSON con campos estructurados (`usuarioId`, `accion`) además del mensaje descriptivo, en vez de un string de texto libre donde esa misma información estaría incrustada de forma no estructurada y difícil de consultar programáticamente después.

Esta estructura consistente permite que un sistema de agregación de logs realice consultas precisas como "todos los logs donde `usuarioId` es 42 durante la última hora", algo prácticamente imposible de hacer de forma confiable sobre logs de texto libre sin una estructura consistente subyacente. Adoptar logging estructurado desde el inicio de un proyecto (en vez de migrar `console.log` disperso hacia un formato estructurado más adelante, un esfuerzo de refactorización considerable en un proyecto ya grande) es una práctica recomendada que paga dividendos considerables el día que se necesita diagnosticar un incidente real de producción bajo presión de tiempo.

**Analogía:** los logs de texto libre son como notas manuscritas dispersas en distintos formatos personales de cada empleado; los logs estructurados en JSON son como un formulario estandarizado con campos fijos y consistentes que cualquier sistema automatizado puede procesar, filtrar y buscar de forma confiable, sin depender de interpretar el estilo personal de redacción de cada autor individual.

**¿Por qué es importante?** Los logs estructurados en JSON son indexables y consultables de forma confiable por herramientas de agregación, una capacidad esencial para diagnosticar incidentes reales de producción que el texto libre de `console.log` no proporciona de forma consistente.

**Diagrama:**

```js
import pino from "pino";
const log = pino();
log.info({ usuarioId: 42, accion: "crear_tarea" }, "Tarea creada");
// {"level":30,"time":...,"usuarioId":42,"accion":"crear_tarea","msg":"Tarea creada"}
```

### Tema 2: Correlation ID por request

**Conceptos clave:** rastreo de una petición específica, `req.log` con contexto adjunto.

Un correlation ID es un identificador único generado al inicio de cada petición entrante (típicamente con `randomUUID()` del módulo `crypto` core, estudiado en el Módulo 0), adjuntado a cada línea de log producida durante el procesamiento de esa petición específica, permitiendo reconstruir después el rastro completo de una petición individual filtrando por su correlation ID único, incluso en un sistema con alto volumen de tráfico donde miles de peticiones concurrentes producen logs entrelazados en el mismo flujo de salida.

Implementar esto con un middleware (recordando el patrón middleware del Módulo 4) que genera el correlation ID al inicio de cada petición y crea un logger "hijo" con ese contexto ya adjunto (`req.log = log.child({correlationId: req.correlationId})`) permite que cualquier código posterior en la cadena de procesamiento de esa petición use `req.log` en vez de el logger global, garantizando automáticamente que cada línea de log que se produzca durante esa petición específica incluya el correlation ID correspondiente, sin necesidad de pasarlo manualmente como parámetro adicional a cada función que registra un log.

Este mecanismo se vuelve especialmente valioso en arquitecturas de microservicios (mencionadas en el Módulo 12 del track DevOps), donde una única petición de usuario puede atravesar múltiples servicios distintos; propagar el mismo correlation ID a través de las cabeceras de las peticiones internas entre servicios permite reconstruir el rastro completo de esa petición a través de todo el sistema distribuido, no solo dentro de un único servicio aislado, una capacidad de diagnóstico indispensable en sistemas distribuidos complejos donde un problema puede originarse en cualquier punto de una cadena de servicios interconectados.

**Analogía:** un correlation ID es como un número de seguimiento único asignado a un paquete en el momento de su envío, que permite rastrear exactamente ese paquete específico a través de cada etapa de su viaje (almacén, transporte, entrega), sin confundirlo con ningún otro paquete que esté viajando simultáneamente por el mismo sistema logístico.

**¿Por qué es importante?** El correlation ID es la herramienta fundamental que permite reconstruir el rastro completo de una petición específica entre el volumen masivo de logs concurrentes de un sistema de producción real, particularmente indispensable en arquitecturas distribuidas de microservicios.

**Diagrama:**

```js
app.use((req, res, next) => {
  req.correlationId = randomUUID();
  req.log = log.child({ correlationId: req.correlationId }); // adjunto automáticamente
  next();
});
// cada log de esta request específica incluye el mismo correlationId
```

### Tema 3: Excepciones no capturadas y graceful shutdown

**Conceptos clave:** `uncaughtException`, `unhandledRejection`, `SIGTERM`, apagado ordenado.

Una excepción no capturada (`uncaughtException`) deja el proceso Node en un estado potencialmente corrupto e impredecible: alguna operación quedó a medias, algún recurso podría no haberse liberado correctamente, y continuar ejecutando el proceso normalmente después de un error de este tipo es arriesgado. La práctica recomendada es registrar un handler global (`process.on("uncaughtException", handler)`) que registre el error con la máxima información posible antes de terminar deliberadamente el proceso (`process.exit(1)`), en vez de intentar "seguir funcionando" tras un estado potencialmente corrupto, confiando en que el orquestador (Kubernetes, PM2) reinicie automáticamente un nuevo proceso limpio.

`process.on("unhandledRejection", handler)` cumple un rol equivalente para Promesas rechazadas sin ningún `.catch()` que las maneje, un escenario que, sin este handler global, produciría solo una advertencia en la consola sin terminar el proceso, dejando potencialmente un bug silencioso sin resolver indefinidamente en producción. Registrar ambos handlers globales, y decidir deliberadamente terminar el proceso en respuesta a ellos (en vez de simplemente registrarlos y continuar), es una práctica de robustez recomendada, aunque la solución real siempre es corregir el código para que esos casos de error se manejen apropiadamente en su origen, no depender permanentemente de estos handlers globales como red de seguridad de última instancia.

Graceful shutdown (apagado ordenado) responde a `SIGTERM` (la señal estándar que un orquestador envía para solicitar la terminación ordenada de un proceso, por ejemplo durante un despliegue de rolling update): en vez de terminar abruptamente el proceso, dejando peticiones en curso interrumpidas a la mitad, el proceso deja de aceptar nuevas conexiones (`servidor.close()`), espera a que las peticiones ya en curso terminen de procesarse completamente, cierra las conexiones a bases de datos y otros recursos externos de forma ordenada, y solo entonces termina el proceso definitivamente, garantizando que ningún cliente experimente una respuesta interrumpida abruptamente durante un despliegue rutinario o un escalado normal de la aplicación.

**Analogía:** una excepción no capturada es como un incendio pequeño en una parte del edificio: la respuesta prudente es evacuar completamente el edificio de forma controlada (terminar el proceso deliberadamente) en vez de intentar seguir operando normalmente con un riesgo desconocido latente. Graceful shutdown es como cerrar una tienda de forma ordenada al final del día: se deja de admitir nuevos clientes, se atiende completamente a los que ya están dentro, y solo entonces se cierran las puertas definitivamente, en vez de apagar las luces abruptamente con clientes todavía dentro comprando.

**¿Por qué es importante?** Manejar excepciones no capturadas terminando deliberadamente el proceso evita continuar en un estado corrupto impredecible; graceful shutdown evita que despliegues rutinarios o escalados normales corten peticiones de usuarios reales a la mitad.

**Diagrama:**

```js
process.on("uncaughtException", (err) => { log.fatal(err); process.exit(1); });
process.on("unhandledRejection", (err) => { log.fatal(err); process.exit(1); });
process.on("SIGTERM", async () => {
  servidor.close(() => process.exit(0)); // deja de aceptar, termina las en curso
  await cerrarConexionesDB();
});
```

### Tema 4: REST, GraphQL y gRPC

**Conceptos clave:** estilos de diseño de API, sobreconsulta/subconsulta, contratos tipados, RPC binario.

REST, el estilo dominante estudiado a lo largo de este track, estructura una API alrededor de recursos identificados por URLs, con verbos HTTP estándar (GET, POST, PUT, DELETE) expresando la acción sobre esos recursos, y es ampliamente comprendido, cacheable de forma nativa por infraestructura HTTP estándar, pero puede sufrir de "sobreconsulta" (devolver más campos de los que un cliente específico realmente necesita) o "subconsulta" (requerir múltiples peticiones separadas para ensamblar la información completa que una vista específica necesita, cuando esos datos relacionados viven en recursos REST distintos).

GraphQL, implementado en Node típicamente con Apollo Server, resuelve directamente ambos problemas permitiendo que el cliente especifique exactamente qué campos necesita en una única petición (eliminando tanto la sobreconsulta como la subconsulta), a costa de una complejidad adicional en el servidor para resolver esas consultas flexibles de forma eficiente, y de perder parte de la cacheabilidad HTTP nativa y simple que REST ofrece por defecto (dado que, técnicamente, GraphQL típicamente usa un único endpoint POST para todas las consultas, dificultando el cacheo HTTP estándar basado en URLs distintas).

gRPC, un framework de RPC (llamada a procedimiento remoto) desarrollado por Google, usa Protocol Buffers (un formato binario compacto y eficiente, en contraste con el JSON textual de REST y GraphQL) y define contratos de servicio fuertemente tipados mediante archivos `.proto`, siendo particularmente popular para comunicación de alto rendimiento entre microservicios internos de una organización (donde el rendimiento binario y los contratos estrictamente tipados son especialmente valiosos), aunque menos apropiado para APIs consumidas directamente por navegadores web (que no soportan HTTP/2 con streaming bidireccional de la misma forma directa que gRPC requiere, sin una capa adicional de traducción).

**Analogía:** REST es como pedir en un restaurante con un menú de platos fijos predefinidos (cada endpoint devuelve una forma fija de datos); GraphQL es como un buffet donde el cliente elige exactamente qué ingredientes específicos quiere en su plato, ni más ni menos; gRPC es como un sistema de comunicación interno ultra eficiente entre departamentos de la misma empresa, optimizado para velocidad y contratos estrictos, pero no diseñado pensando en clientes externos casuales.

**¿Por qué es importante?** Elegir entre REST, GraphQL y gRPC según las necesidades reales del proyecto (simplicidad y cacheo HTTP nativo, flexibilidad de consulta del cliente, o rendimiento binario entre microservicios internos) es una decisión de arquitectura de API con implicaciones concretas de rendimiento y complejidad.

**Diagrama:**

```
REST:    URLs por recurso, verbos HTTP, cacheable nativamente, riesgo de sobre/subconsulta
GraphQL: un endpoint, el cliente pide exactamente los campos que necesita, sin sobreconsulta
gRPC:    binario (Protocol Buffers), contratos .proto tipados, ideal para microservicios internos
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** integrar logging estructurado con correlation ID, manejo robusto de excepciones y graceful shutdown en la API construida en módulos anteriores.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Reemplazar `console.log` por Pino | Ver Tema 1 | Configura logs en formato JSON estructurado |
| 2 | Agregar correlation ID por request | Ver Tema 2 | Verifica que aparece en todos los logs de esa request específica |
| 3 | Provocar una excepción no capturada intencional | `process.on("uncaughtException", ...)` | Verifica que se registra antes de cerrar el proceso |
| 4 | Implementar el endpoint `/health` | Verifica conexión a la base de datos antes de responder 200 | Útil para healthchecks de Kubernetes/Docker |
| 5 | Implementar graceful shutdown | Ver Tema 3 | Responde a `SIGTERM` cerrando ordenadamente |
| 6 | Simular una caída abrupta sin graceful shutdown | Compara qué pasa con requests en curso | Documenta la diferencia observada |

**Verificación:** el laboratorio se considera exitoso si todos los logs de una misma petición comparten el mismo correlation ID, y si el proceso responde ordenadamente a `SIGTERM` completando peticiones en curso antes de terminar, verificado comparando explícitamente contra el comportamiento sin graceful shutdown.

**Errores comunes y soluciones**

- **Seguir usando `console.log` de texto libre en producción.** Migra a logging estructurado con Pino desde el inicio del proyecto.
- **No registrar un handler para `unhandledRejection`.** Sin él, una Promesa rechazada sin manejar solo produce una advertencia silenciosa, dejando el bug sin resolver indefinidamente.
- **Terminar el proceso abruptamente ante `SIGTERM` sin esperar peticiones en curso.** Implementa graceful shutdown explícitamente para evitar cortar respuestas a mitad de camino durante despliegues rutinarios.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué el correlation ID es esencial

**Enunciado:** explica por qué el correlation ID es esencial para diagnosticar un error en producción, en un sistema con miles de peticiones concurrentes.

**Solución esperada:** sin un correlation ID, los logs de miles de peticiones concurrentes se entremezclan en el mismo flujo de salida, haciendo prácticamente imposible reconstruir el rastro completo de una petición específica que falló; con un correlation ID único por petición, se puede filtrar exactamente los logs correspondientes a esa petición específica, reconstruyendo su rastro completo de principio a fin sin interferencia de las demás peticiones concurrentes.

**Criterios de éxito:**
- Explica correctamente el problema de logs entremezclados sin correlation ID.
- Explica cómo el correlation ID resuelve ese problema mediante filtrado preciso.

### Ejercicio 2: Error capturado frente a no capturado

**Enunciado:** explica qué diferencia hay, en términos de qué debes hacer, entre un error capturado (manejado con `try`/`catch`) y uno no capturado.

**Solución esperada:** un error capturado se maneja explícitamente en el punto donde ocurre (mostrando un mensaje al usuario, reintentando, usando un valor por defecto), permitiendo que el proceso continúe funcionando normalmente de forma segura; un error no capturado deja el proceso en un estado potencialmente corrupto e impredecible, y la respuesta correcta es registrar el error con la máxima información posible y terminar deliberadamente el proceso, confiando en que el orquestador reinicie una instancia limpia, en vez de intentar continuar funcionando tras un estado de corrupción desconocida.

**Criterios de éxito:**
- Distingue correctamente el manejo local (capturado) del manejo global con terminación deliberada (no capturado).

### Ejercicio 3: Por qué importa el graceful shutdown

**Enunciado:** describe un escenario concreto donde la ausencia de graceful shutdown causaría un problema real para un usuario, durante una operación rutinaria de la infraestructura (no un fallo).

**Solución esperada:** durante un despliegue de rolling update (Módulo 5 del track DevOps), Kubernetes envía `SIGTERM` a una instancia antigua mientras un usuario tiene una petición en curso hacia esa instancia específica; sin graceful shutdown, esa petición se corta abruptamente a mitad de procesamiento, y el usuario recibe un error inesperado durante lo que debería ser una operación de despliegue completamente transparente para él.

**Criterios de éxito:**
- Describe correctamente un escenario de operación rutinaria (no un fallo) donde la ausencia de graceful shutdown afecta a un usuario real.

---

## Resumen del módulo

**Puntos clave**

- El logging estructurado en JSON con Pino es indexable y consultable de forma confiable, a diferencia del texto libre de `console.log`.
- Un correlation ID único por petición permite reconstruir el rastro completo de esa petición específica entre logs concurrentes masivos.
- Excepciones no capturadas y rechazos de Promesas sin manejar deben registrarse y, generalmente, terminar deliberadamente el proceso.
- Graceful shutdown responde ordenadamente a `SIGTERM`, completando peticiones en curso antes de terminar el proceso.
- REST, GraphQL y gRPC son estilos de diseño de API con trade-offs distintos de flexibilidad, cacheo y rendimiento.

**Conceptos aprendidos**

- Logging estructurado con Pino.
- Correlation ID y su propagación por petición.
- Manejo de excepciones no capturadas y rechazos sin manejar.
- Health checks y graceful shutdown.
- Panorama comparativo de REST, GraphQL y gRPC.

**Próximos pasos**

En el Módulo 10 aprenderás los errores de seguridad más comunes en APIs Node (inyección SQL, XSS, falta de rate limiting) y cómo mitigarlos sistemáticamente.

**Recursos adicionales**

- Documentación oficial de Pino (getpino.io).
- Documentación oficial de Node.js: "process" (eventos `uncaughtException`, `unhandledRejection`, señales).
- Documentación de Apollo Server y de gRPC (grpc.io) para quien quiera profundizar en alternativas a REST.
