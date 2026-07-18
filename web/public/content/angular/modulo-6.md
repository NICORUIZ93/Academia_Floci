# Módulo 6: RxJS esencial para Angular

## Sílabo

**Objetivo general**

Dominar lo esencial de RxJS que Angular sigue requiriendo para flujos asíncronos complejos: operadores clave, manejo correcto de suscripciones sin fugas de memoria, y el puente entre Observables y signals.

**Objetivos específicos**

1. Diferenciar Observable de Promise en cuanto a cancelación y múltiples emisiones.
2. Usar `debounceTime`, `distinctUntilChanged`, `switchMap` y `combineLatest` correctamente.
3. Usar el `async` pipe y `takeUntilDestroyed` para evitar fugas de memoria por suscripciones.
4. Convertir entre Observables y signals con `toSignal`/`toObservable`.
5. Diferenciar `mergeMap`, `concatMap` y `exhaustMap`.

**Contenido**

- Observable frente a Promise.
- Operadores clave: `map`, `switchMap`, `debounceTime`, `combineLatest`.
- Manejo de suscripciones (`async` pipe, `takeUntilDestroyed`).
- `toSignal`/`toObservable` como puente con Signals.
- `Subject`, `BehaviorSubject`, `ReplaySubject` y `AsyncSubject`.
- `mergeMap`, `concatMap`, `exhaustMap` y `shareReplay`.

**Evaluación**

Un buscador con debounce y cancelación de peticiones previas usando `switchMap`, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Observable frente a Promise

**Conceptos clave:** múltiples emisiones, cancelación nativa, evaluación perezosa.

Una Promesa (estudiada en profundidad en el Módulo 5 del track de JavaScript) representa un único valor futuro, resuelto o rechazado exactamente una vez; un Observable de RxJS representa un flujo que puede emitir múltiples valores a lo largo del tiempo (cero, uno, o infinitos valores sucesivos), y que se puede cancelar explícitamente en cualquier momento simplemente desuscribiéndose, una capacidad que las Promesas nativas de JavaScript no ofrecen directamente (una vez creada, una Promesa no puede cancelarse; como mucho, se puede ignorar su resultado, pero la operación subyacente sigue ejecutándose de todas formas, salvo mecanismos externos adicionales como `AbortController`, estudiado en el Módulo 6 del track de JavaScript).

Otra diferencia importante es la evaluación perezosa: un Observable no comienza a ejecutar su lógica productora hasta que alguien se suscribe explícitamente a él (`observable.subscribe(...)`); una Promesa, en cambio, comienza a ejecutarse inmediatamente en el momento de su creación, independientemente de si alguien está interesado en su resultado o no. Esta diferencia hace que un mismo Observable pueda suscribirse múltiples veces, potencialmente disparando su lógica productora una vez por cada suscripción independiente (a menos que se use un operador como `shareReplay`, Tema 4, para compartir una única ejecución entre múltiples suscriptores), mientras que una Promesa, al ejecutarse una única vez en su creación, siempre entrega el mismo resultado a cualquier código que la consulte después, sin importar cuántas veces se consulte.

Esta capacidad de emitir múltiples valores a lo largo del tiempo es precisamente lo que hace a los Observables la herramienta apropiada para modelar flujos de eventos continuos (clics del usuario, cambios de valor de un input mientras el usuario escribe, mensajes entrantes de un WebSocket), casos donde una Promesa de un único valor simplemente no encaja conceptualmente, siendo esta la razón fundamental por la que Angular sigue apoyándose en RxJS para ciertos casos, en vez de haber sido completamente reemplazado por signals, que están diseñados deliberadamente para el caso más simple de estado síncrono puntual, no para flujos continuos de eventos a lo largo del tiempo.

**Analogía:** una Promesa es como pedir un solo paquete que llegará exactamente una vez, en un momento futuro determinado, sin posibilidad de cancelar el envío una vez iniciado; un Observable es como suscribirse a una revista con entregas periódicas continuas a lo largo del tiempo, que puedes cancelar en cualquier momento (desuscribiéndote) para dejar de recibir más entregas futuras.

**¿Por qué es importante?** Entender que los Observables modelan flujos de múltiples valores cancelables (a diferencia de las Promesas, de un único valor no cancelable) explica por qué RxJS sigue siendo necesario en Angular para casos que involucran eventos continuos o cancelación explícita de operaciones en curso.

**Diagrama:**

```
Promise: UN valor futuro, no cancelable, se ejecuta inmediatamente al crearse
Observable: MÚLTIPLES valores posibles a lo largo del tiempo, cancelable
            (desuscribiéndose), evaluación perezosa (empieza al suscribirse)
```

### Tema 2: Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest

**Conceptos clave:** transformación y combinación de flujos, cancelación automática con switchMap.

`debounceTime(300)`, aplicado sobre el flujo de cambios de valor de un input (`valueChanges`), espera 300 milisegundos de inactividad antes de dejar pasar el valor más reciente hacia el resto de la cadena de operadores, exactamente el mismo concepto de debounce estudiado en el Módulo 10 del track de JavaScript, ahora expresado como un operador componible dentro de una cadena de RxJS. `distinctUntilChanged()`, colocado inmediatamente después, filtra valores consecutivos idénticos al anterior, evitando disparar una nueva búsqueda si el usuario borra y vuelve a escribir exactamente el mismo texto sin cambio neto real en el valor.

`switchMap(texto => this.api.buscar(texto))` transforma cada valor emitido (el texto de búsqueda) en un nuevo Observable interno (la petición HTTP de búsqueda correspondiente), con una propiedad crucial: si llega un nuevo valor antes de que el Observable interno anterior haya completado, `switchMap` cancela automáticamente ese Observable interno anterior (equivalente conceptual a `AbortController` del Módulo 6 del track de JavaScript, pero gestionado automáticamente por el operador sin código manual de cancelación), garantizando que solo la respuesta correspondiente a la búsqueda más reciente se propague hacia adelante, resolviendo exactamente el mismo problema de condición de carrera de respuestas desordenadas discutido en ese módulo.

`combineLatest([filtro$, orden$])` combina el valor más reciente de múltiples Observables, re-emitiendo un nuevo valor combinado cada vez que cualquiera de las fuentes emite (no solo cuando todas emiten simultáneamente), apropiado para recalcular una lista derivada que depende de múltiples criterios independientes (un filtro y un criterio de orden, por ejemplo) que pueden cambiar de forma independiente entre sí, sin necesidad de coordinar manualmente cuándo cada uno cambió respecto al otro.

**Analogía:** `debounceTime` es como esperar a que alguien termine completamente de hablar antes de responder, en vez de interrumpir a mitad de frase; `switchMap` es como colgar inmediatamente una llamada telefónica en curso en cuanto llega una llamada más urgente y prioritaria, atendiendo siempre solo la más reciente; `combineLatest` es como un panel de control que recalcula automáticamente un valor combinado cada vez que cualquiera de sus indicadores de entrada individuales cambia.

**¿Por qué es importante?** `switchMap` cancela automáticamente la petición anterior cuando el usuario dispara una nueva, resolviendo el problema clásico de condiciones de carrera en buscadores en vivo sin necesidad de gestión manual de cancelación.

**Código del ejemplo:**

```ts
resultados = toSignal(
  this.busqueda.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(texto => this.api.buscar(texto)) // cancela la petición anterior automáticamente
  ),
  { initialValue: [] }
);
```

### Tema 3: Manejo de suscripciones sin fugas de memoria

**Conceptos clave:** `async` pipe, `takeUntilDestroyed`, fugas de memoria por suscripciones huérfanas.

Suscribirse manualmente a un Observable con `.subscribe(...)` dentro de un componente crea una responsabilidad explícita de desuscribirse eventualmente (típicamente en `ngOnDestroy`, Módulo 1) para evitar una fuga de memoria: si el componente se destruye pero la suscripción sigue activa, el callback de esa suscripción puede seguir ejecutándose (por ejemplo, intentando actualizar una propiedad de un componente que ya no existe visualmente), manteniendo además una referencia activa que impide que el recolector de basura (Módulo 5 del track de JavaScript) libere la memoria del componente ya destruido, un problema que se agrava considerablemente en aplicaciones con muchos componentes creándose y destruyéndose dinámicamente durante la navegación normal del usuario.

El `async` pipe, usado directamente en la plantilla (`{{ observable$ | async }}` o `@for (item of items$ | async; ...)`), resuelve este problema de forma completamente automática y transparente: se suscribe al Observable cuando el componente se renderiza, y crucialmente se desuscribe automáticamente cuando el componente se destruye, sin ningún código manual de limpieza necesario en `ngOnDestroy`, siendo la razón principal por la que se recomienda preferir el `async` pipe sobre `subscribe()` manual en cualquier caso donde el valor del Observable simplemente necesite mostrarse en la plantilla.

`takeUntilDestroyed()`, un operador más reciente diseñado específicamente para casos donde sí se necesita una suscripción manual explícita (por ejemplo, para ejecutar lógica imperativa en respuesta a cada emisión, no solo para mostrar un valor en la plantilla), automatiza la misma limpieza que el `async` pipe ofrece de forma transparente: aplicado dentro del `pipe()` de un Observable, completa automáticamente ese Observable cuando el componente (o servicio, en un contexto de inyección apropiado) se destruye, eliminando la necesidad de gestionar manualmente un `Subject` de destrucción y de llamarlo explícitamente dentro de `ngOnDestroy`, un patrón considerablemente más verboso que se usaba anteriormente para lograr el mismo resultado antes de que `takeUntilDestroyed` existiera como operador dedicado.

**Analogía:** una suscripción manual sin desuscripción es como dejar una línea telefónica abierta indefinidamente incluso después de que la persona que la atendía ya se retiró del edificio, siguiendo consumiendo recursos sin que nadie esté realmente escuchando del otro lado; el `async` pipe y `takeUntilDestroyed` son como un sistema que cuelga automáticamente la línea en el momento exacto en que la persona correspondiente se retira, sin requerir que nadie recuerde hacerlo manualmente cada vez.

**¿Por qué es importante?** El `async` pipe evita la fuga de memoria clásica de un `subscribe()` sin `unsubscribe()` de forma completamente automática; `takeUntilDestroyed` extiende esa misma automatización a los casos donde una suscripción manual explícita es genuinamente necesaria.

**Código del ejemplo:**

```html
<!-- async pipe: se suscribe Y se desuscribe automáticamente -->
@for (item of resultados$ | async; track item.id) { <li>{{ item.nombre }}</li> }
```
```ts
// takeUntilDestroyed: para suscripciones manuales que sí son necesarias
this.eventos$.pipe(takeUntilDestroyed()).subscribe(evento => this.procesar(evento));
```

### Tema 4: Subjects y operadores de aplanamiento avanzados

**Conceptos clave:** `Subject`, `BehaviorSubject`, `mergeMap`/`concatMap`/`exhaustMap`, `shareReplay`.

Un `Subject` es simultáneamente un Observable y un "emisor" activo: a diferencia de un Observable normal creado con una función productora, un `Subject` permite invocar `.next(valor)` externamente para emitir un nuevo valor manualmente hacia cualquier suscriptor actualmente activo, siendo útil como puente entre código imperativo (eventos del DOM, callbacks de terceros) y el mundo declarativo de RxJS. `BehaviorSubject` extiende `Subject` con un valor inicial obligatorio y la propiedad de recordar siempre el último valor emitido, entregándolo inmediatamente a cualquier nuevo suscriptor que se una después de que ya hubo emisiones anteriores (en vez de que ese nuevo suscriptor tenga que esperar a la siguiente emisión futura para recibir algo). `ReplaySubject` extiende esta idea recordando un número configurable de emisiones pasadas (no solo la última), y `AsyncSubject` solo emite el último valor, y únicamente cuando el Subject se completa formalmente, nunca antes.

`mergeMap`, `concatMap` y `exhaustMap` son alternativas a `switchMap` (Tema 2) para el mismo problema general de transformar cada valor emitido en un nuevo Observable interno, pero con estrategias distintas ante emisiones superpuestas: `mergeMap` ejecuta todos los Observables internos en paralelo simultáneamente, sin cancelar ninguno (apropiado cuando cada operación es independiente y todas deben completarse, como enviar múltiples notificaciones simultáneas); `concatMap` ejecuta los Observables internos en estricta secuencia, uno después de que el anterior completa (apropiado cuando el orden de ejecución importa genuinamente, como guardar cambios en un orden específico); `exhaustMap` ignora completamente nuevas emisiones mientras un Observable interno anterior sigue en curso (apropiado para prevenir doble envío accidental de un formulario, ignorando clics adicionales del botón de envío mientras la petición anterior todavía está en proceso).

`shareReplay()` convierte un Observable "frío" (que ejecuta su lógica productora de forma independiente para cada nueva suscripción) en uno "caliente" que comparte una única ejecución subyacente entre múltiples suscriptores, cacheando además un número configurable de emisiones pasadas para entregarlas inmediatamente a cualquier suscriptor nuevo que llegue después, útil para evitar disparar la misma petición HTTP costosa múltiples veces cuando varios componentes distintos se suscriben independientemente al mismo Observable de datos compartido.

**Analogía:** `mergeMap` es como atender simultáneamente a todos los clientes que llegan, sin hacer esperar a ninguno por el otro; `concatMap` es como atender a los clientes estrictamente en el orden de llegada, uno completamente después del anterior; `exhaustMap` es como un empleado que, mientras atiende a un cliente, simplemente ignora a cualquier otro que intente interrumpir hasta terminar con el actual. `shareReplay` es como una única presentación grabada que múltiples espectadores pueden ver, compartiendo la misma grabación en vez de que el presentador tenga que repetir la presentación completa para cada espectador individual.

**¿Por qué es importante?** Elegir el operador de aplanamiento correcto (`switchMap`/`mergeMap`/`concatMap`/`exhaustMap`) según la semántica real deseada ante emisiones superpuestas es una decisión de diseño con consecuencias concretas de comportamiento; `shareReplay` evita ejecuciones redundantes costosas al compartir una única fuente entre múltiples suscriptores.

**Diagrama:**

```
switchMap:  cancela el anterior, solo importa el más reciente (buscadores)
mergeMap:   ejecuta todos en paralelo, sin cancelar ninguno (notificaciones independientes)
concatMap:  ejecuta en estricta secuencia, uno tras otro (orden importa)
exhaustMap: ignora nuevas emisiones mientras una sigue en curso (prevenir doble envío)
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

**Objetivo del laboratorio:** construir un buscador con debounce y cancelación automática de peticiones previas, y practicar el manejo correcto de suscripciones.

**Requisitos previos:** Módulos 0-5 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear el buscador con debounce | Ver Tema 2 | `debounceTime(300)` + `distinctUntilChanged()` |
| 2 | Usar `switchMap` para las peticiones | Ver Tema 2 | Verifica que cancela la anterior automáticamente |
| 3 | Combinar filtro y orden con `combineLatest` | Ver Tema 2 | Recalcula al cambiar cualquiera de las dos fuentes |
| 4 | Usar el `async` pipe en la plantilla | Ver Tema 3 | Explica por qué evita fugas de memoria |
| 5 | Convertir el resultado a signal | `toSignal()` | Úsalo en un `computed()` posterior |

**Verificación:** el laboratorio se considera exitoso si el buscador cancela correctamente peticiones anteriores al escribir rápido (verificable en la pestaña Network, viendo peticiones canceladas), y si no hay ninguna fuga de memoria verificable tras destruir y recrear el componente repetidamente.

**Errores comunes y soluciones**

- **Usar `subscribe()` manual sin desuscribirse en `ngOnDestroy`.** Prefiere el `async` pipe, o usa `takeUntilDestroyed()` si necesitas una suscripción manual explícita.
- **Usar `mergeMap` donde `switchMap` sería lo correcto.** Si solo te interesa la respuesta más reciente (como en un buscador), usa `switchMap` para cancelar automáticamente las anteriores.
- **Olvidar `distinctUntilChanged()` tras `debounceTime`.** Sin él, valores idénticos consecutivos disparan búsquedas redundantes innecesarias.

---

## Ejercicios de evaluación

### Ejercicio 1: switchMap frente a mergeMap

**Enunciado:** explica por qué `switchMap` cancela la petición anterior y `mergeMap` no, con un ejemplo de cuándo cada uno es apropiado.

**Solución esperada:** `switchMap` está diseñado específicamente para descartar el Observable interno anterior en cuanto llega una nueva emisión, apropiado cuando solo la respuesta más reciente importa (un buscador, donde una respuesta desactualizada de una búsqueda anterior ya no es relevante); `mergeMap` ejecuta todos los Observables internos en paralelo sin cancelar ninguno, apropiado cuando cada operación es independiente y todas deben completarse (por ejemplo, enviar varias notificaciones simultáneamente sin que una cancele a otra).

**Criterios de éxito:**
- Explica correctamente el comportamiento de cancelación de `switchMap` frente a la ejecución paralela de `mergeMap`.
- Da un ejemplo apropiado para cada uno.

### Ejercicio 2: Fuga de memoria evitada por el async pipe

**Enunciado:** explica qué fuga de memoria evita el `async` pipe que un `subscribe()` manual sin `unsubscribe()` no evita.

**Solución esperada:** un `subscribe()` manual sin desuscripción mantiene la suscripción activa incluso después de que el componente se destruye, manteniendo referencias activas que impiden que el recolector de basura libere la memoria del componente, y potencialmente ejecutando código que intenta actualizar un componente que ya no existe; el `async` pipe se desuscribe automáticamente cuando el componente se destruye, eliminando ambos problemas sin código manual adicional.

**Criterios de éxito:**
- Explica correctamente que la desuscripción automática del `async` pipe previene tanto la referencia persistente como la ejecución sobre un componente ya destruido.

### Ejercicio 3: Elegir el operador de aplanamiento correcto

**Enunciado:** un botón de "Enviar pedido" dispara una petición HTTP; el usuario podría hacer clic varias veces rápidamente por error antes de que la primera petición complete. ¿Qué operador de aplanamiento usarías para prevenir un envío duplicado, y por qué?

**Solución esperada:** `exhaustMap`, porque ignora completamente nuevas emisiones (clics adicionales) mientras el Observable interno anterior (la petición en curso) todavía no ha completado, previniendo efectivamente el envío duplicado sin necesidad de deshabilitar manualmente el botón mientras la petición está en curso.

**Criterios de éxito:**
- Elige correctamente `exhaustMap` y justifica en términos de ignorar emisiones mientras una operación anterior sigue en curso.

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

- Google, *Angular Documentation* y guías oficiales de accesibilidad, seguridad y rendimiento.
- ReactiveX, *RxJS Documentation*.
- W3C, *Web Content Accessibility Guidelines (WCAG)*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Los Observables modelan flujos de múltiples valores cancelables y de evaluación perezosa, a diferencia de las Promesas de un único valor.
- `debounceTime`, `distinctUntilChanged` y `switchMap` son la combinación estándar para buscadores en vivo con cancelación automática.
- El `async` pipe y `takeUntilDestroyed` evitan fugas de memoria por suscripciones sin desuscribir automáticamente.
- `mergeMap`, `concatMap` y `exhaustMap` ofrecen estrategias distintas ante emisiones superpuestas; `shareReplay` comparte una única ejecución entre múltiples suscriptores.

**Conceptos aprendidos**

- Diferencias fundamentales entre Observable y Promise.
- Operadores clave de transformación y combinación de flujos.
- Manejo correcto de suscripciones sin fugas de memoria.
- Subjects y operadores avanzados de aplanamiento.

**Próximos pasos**

En el Módulo 7 aprenderás HttpClient e interceptores: consumo tipado de APIs reales, interceptores funcionales para autenticación, y manejo centralizado de errores HTTP.

**Recursos adicionales**

- Documentación oficial de RxJS (rxjs.dev) y de Angular: "RxJS interop" (`toSignal`/`toObservable`).
