# Módulo 2: Signals — el nuevo modelo de reactividad

## Sílabo

**Objetivo general**

Entender signals como el modelo de reactividad moderno de Angular, que reemplaza gran parte del rol histórico de Zone.js, dominando `signal()`, `computed()` y `effect()` como el nuevo modelo mental fundamental.

**Objetivos específicos**

1. Crear y actualizar signals con `set()`, `update()` y `mutate()`.
2. Derivar estado con `computed()` y explicar por qué se recalcula solo cuando es necesario.
3. Usar `effect()` para efectos secundarios reactivos.
4. Explicar cuándo preferir un signal frente a un Observable de RxJS.
5. Explicar el camino hacia la detección de cambios zoneless.

**Contenido**

- `signal()`, `computed()` y `effect()`.
- Mutación frente a actualización inmutable.
- Signals frente a Observables: cuándo usar cada uno.
- Camino hacia zoneless change detection.
- `WritableSignal`: `update()`, `set()`, `mutate()`, `asReadonly()`.
- `linkedSignal` para estado derivado y reseteable.
- `model()` para two-way binding basado en signals.

**Evaluación**

Un componente con estado derivado completamente con signals y `computed`, sin RxJS, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un componente con estado derivado completamente con signals y `computed`, sin RxJS, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
node --version
npm --version
npx ng version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
npx @angular/cli@latest new academia-labs/angular-app --standalone --routing --style=scss
cd academia-labs/angular-app
git init
```

Trabaja dentro de `academia-labs/angular-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/angular-app/
├─ src/app/features/
│  └─ module-2/
├─ tests/
├─ docs/decisions/
├─ evidence/module-2/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. signal(), computed() y effect() | `src/app/features/module-2/topic-1-signal-computed-y-effect.ts` | prueba + salida observable |
| 2. Mutación frente a actualización inmutable | `src/app/features/module-2/topic-2-mutacion-frente-a-actualizacion-inmutable.ts` | prueba + salida observable |
| 3. Signals frente a Observables | `src/app/features/module-2/topic-3-signals-frente-a-observables.ts` | prueba + salida observable |
| 4. Hacia zoneless change detection | `src/app/features/module-2/topic-4-hacia-zoneless-change-detection.ts` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/angular-app`:

```bash
npm test -- --watch=false && npm start
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un componente con estado derivado completamente con signals y `computed`, sin RxJS, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula un estado vacío o un error HTTP y comprueba que la interfaz muestre recuperación y no una pantalla ambigua. Guarda en `evidence/module-2/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Signals — el nuevo modelo de reactividad** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: signal(), computed() y effect()

**Conceptos clave:** estado reactivo síncrono, derivación memoizada, efectos secundarios.

Un signal es un contenedor de valor reactivo: `signal(0)` crea un signal con valor inicial `0`, leído invocándolo como función (`contador()`), y actualizado con `.set(nuevoValor)` (reemplazo directo) o `.update(actual => nuevoValor)` (calculado a partir del valor actual). A diferencia de una variable de clase ordinaria, leer un signal dentro de un contexto reactivo (una plantilla, un `computed()`, un `effect()`) registra automáticamente una dependencia: Angular sabe exactamente qué partes de la aplicación dependen de ese signal específico, y puede notificarlas de forma precisa y eficiente cuando cambia, sin necesidad de revisar exhaustivamente toda la aplicación en busca de cambios potenciales.

`computed(() => contador() * 2)` deriva un nuevo signal de solo lectura a partir de uno o más signals existentes, con una propiedad de memoización importante: solo se recalcula cuando alguno de los signals de los que depende efectivamente cambia, y el resultado se cachea entre esos recálculos, de modo que leer un `computed()` múltiples veces sin que sus dependencias hayan cambiado no repite el cálculo, simplemente devuelve el valor ya cacheado de la última vez que se calculó. Esta memoización automática es un beneficio de rendimiento obtenido sin ningún esfuerzo adicional del desarrollador, en contraste con la memoización manual estudiada en el Módulo 10 del track de JavaScript, que requería implementar explícitamente el caché.

`effect(() => console.log("contador cambió a", contador()))` ejecuta una función con efectos secundarios cada vez que cualquiera de los signals leídos dentro de ella cambia, siendo la herramienta apropiada específicamente para efectos secundarios (registrar logs, sincronizar con `localStorage`, disparar una petición de red) que no producen directamente un valor derivado (para eso está `computed()`), sino que reaccionan al cambio ejecutando alguna acción externa al propio grafo de signals. Es importante no abusar de `effect()` para lógica que en realidad podría expresarse como un `computed()`: si el propósito es derivar un valor, `computed()` es la herramienta correcta y más eficiente; `effect()` debería reservarse genuinamente para efectos secundarios que no producen un valor a leer posteriormente.

**Analogía:** un signal es como un marcador electrónico visible en una fábrica que muestra el conteo actual de piezas producidas; un `computed()` es como un panel secundario que siempre muestra automáticamente el doble de ese conteo, actualizándose únicamente cuando el marcador principal cambia, sin que nadie tenga que recalcularlo manualmente; un `effect()` es como una alarma que suena automáticamente cada vez que el marcador alcanza cierto umbral, una acción externa disparada por el cambio, no un valor derivado a consultar después.

**¿Por qué es importante?** Signals ofrecen un modelo de reactividad síncrono, preciso y memoizado automáticamente, donde Angular sabe exactamente qué depende de qué, sentando las bases conceptuales para todo el resto del modelo de reactividad moderno de Angular estudiado en los módulos siguientes.

**Código del ejemplo:**

```ts
const contador = signal(0);
const doble = computed(() => contador() * 2); // memoizado, solo recalcula si contador cambia
contador.set(5);
contador.update(v => v + 1);
effect(() => console.log('contador cambió a', contador())); // efecto secundario reactivo
```

### Tema 2: Mutación frente a actualización inmutable

**Conceptos clave:** por qué mutar in-place no notifica cambios, `update()` con nueva referencia.

Un signal detecta cambios comparando referencias (de forma similar al mecanismo de detección de cambios por referencia estudiado conceptualmente en el Módulo 4 del track de JavaScript al hablar de inmutabilidad): si el valor almacenado en un signal es un array o un objeto, y se muta directamente ese array u objeto sin reemplazarlo por una referencia nueva (`tareas().push(nuevaTarea)`, modificando el array existente in-place), el signal no detecta ningún cambio, porque la referencia al array sigue siendo exactamente la misma antes y después de la mutación, y Angular (y cualquier `computed()`/`effect()` que dependa de ese signal) nunca se entera de que su contenido interno cambió.

La forma correcta es siempre actualizar con una nueva referencia: `tareas.update(lista => [...lista, nuevaTarea])` crea un array completamente nuevo (usando spread, como se estudió en el Módulo 4 del track de JavaScript) que incluye todos los elementos anteriores más el nuevo, y asigna esa nueva referencia al signal mediante `update()`, lo que sí dispara correctamente la notificación de cambio hacia cualquier parte de la aplicación que dependa de ese signal, porque la referencia efectivamente cambió de un array a otro distinto.

Este requisito de inmutabilidad no es una limitación arbitraria de Angular, sino una consecuencia directa y deliberada de cómo los signals detectan cambios de forma eficiente: comparar referencias es una operación extremadamente rápida (una simple comparación de igualdad), mucho más barata que comparar profundamente el contenido completo de una estructura de datos compleja en cada posible cambio; a cambio de esa eficiencia, el desarrollador debe adoptar la disciplina de siempre reemplazar (nunca mutar in-place) el valor almacenado en un signal cuando ese valor es una estructura de datos compuesta como un array u objeto.

**Analogía:** mutar un array dentro de un signal es como tachar y reescribir directamente sobre un documento oficial ya archivado sin generar una nueva copia: el archivo permanece siendo "el mismo documento" según su número de referencia oficial, y nadie que consulte solo ese número de referencia se entera de que el contenido cambió; actualizar con `update()` y spread es como archivar una copia completamente nueva con un número de referencia distinto, y notificar activamente a todos los interesados que ahora existe una versión más reciente a consultar.

**¿Por qué es importante?** Entender que los signals detectan cambios por referencia (no por contenido profundo) es esencial para evitar el bug extremadamente común de mutar in-place una estructura de datos dentro de un signal y no entender por qué la interfaz de usuario no se actualiza en respuesta.

**Código del ejemplo:**

```ts
const tareas = signal<Tarea[]>([]);
// MAL: mutar in-place no notifica a Angular del cambio
tareas().push(nuevaTarea);
// BIEN: nueva referencia, Angular detecta el cambio
tareas.update(lista => [...lista, nuevaTarea]);
```

### Tema 3: Signals frente a Observables

**Conceptos clave:** estado síncrono frente a flujos asíncronos complejos, `toSignal`/`toObservable`.

Signals están diseñados específicamente para modelar estado síncrono: un valor concreto que existe en un momento dado y que se lee directamente, sin necesidad de suscribirse explícitamente ni de gestionar manualmente el ciclo de vida de esa suscripción. RxJS (estudiado en profundidad en el Módulo 6) sigue siendo la herramienta correcta y necesaria para flujos verdaderamente asíncronos y complejos: combinar múltiples fuentes de datos que emiten a lo largo del tiempo, cancelar una petición en curso cuando llega una nueva (`switchMap`), o aplicar debounce sobre eventos de entrada del usuario, capacidades de composición temporal que el modelo de signals, deliberadamente más simple y síncrono, no está diseñado para cubrir directamente.

Esta distinción no es una competencia donde una tecnología "gana" sobre la otra de forma absoluta, sino una división de responsabilidades complementaria: usar signals para representar el estado actual de la aplicación (qué tareas existen ahora, cuál está seleccionada ahora) y RxJS para modelar y componer los flujos de eventos asíncronos que eventualmente producen actualizaciones de ese estado (una búsqueda con debounce que eventualmente actualiza un signal con los resultados obtenidos). `toSignal()` y `toObservable()` son los puentes bidireccionales oficiales entre ambos mundos: `toSignal(observable$)` convierte un Observable en un signal de solo lectura (leyendo su valor más reciente emitido de forma síncrona), y `toObservable(unSignal)` hace la conversión inversa, permitiendo integrar ambos modelos sin necesidad de reescribir completamente la lógica existente de un lado al elegir el otro.

Comparar la misma pieza de estado implementada primero con un `BehaviorSubject` de RxJS y luego con un signal equivalente (un ejercicio instructivo de comparación directa) suele revelar que la versión con signals requiere considerablemente menos código repetitivo para el caso común de estado simple leído directamente (sin necesidad de gestionar manualmente una suscripción, sin necesidad de recordar desuscribirse en `ngOnDestroy`), mientras que para flujos genuinamente complejos con múltiples operadores de composición temporal, RxJS sigue ofreciendo una expresividad que los signals, por diseño, no intentan replicar.

**Analogía:** un signal es como un termómetro digital que muestra directamente la temperatura actual en el momento en que lo consultas; un Observable de RxJS es como un sistema de monitoreo climático completo que registra, combina y procesa continuamente múltiples fuentes de datos meteorológicos a lo largo del tiempo, produciendo análisis derivados más complejos que un simple valor puntual actual.

**¿Por qué es importante?** Elegir correctamente entre signals (estado síncrono simple) y RxJS (flujos asíncronos complejos con composición temporal) según la naturaleza real del problema evita tanto la sobrecomplicación de usar RxJS donde un signal simple bastaría, como la limitación de forzar signals en escenarios que genuinamente requieren la composición temporal que RxJS ofrece.

**Código del ejemplo:**

```ts
// Signal: estado síncrono simple, leído directamente
const seleccionado = signal<Tarea | null>(null);

// RxJS: flujo asíncrono con composición temporal (debounce, cancelación)
busqueda$.pipe(debounceTime(300), switchMap(texto => api.buscar(texto)));

// Puentes bidireccionales:
const resultadosSignal = toSignal(resultados$, { initialValue: [] });
const observableDeVuelta = toObservable(unSignal);
```

### Tema 4: Hacia zoneless change detection

**Conceptos clave:** Zone.js histórico, detección de cambios basada en signals, precisión frente a fuerza bruta.

Angular tradicionalmente dependía de Zone.js, una biblioteca que "parchaba" (intercepta) prácticamente cualquier API asíncrona del navegador (eventos, `setTimeout`, promesas, peticiones HTTP) para que Angular pudiera saber que "algo pudo haber cambiado" cada vez que cualquiera de esas operaciones asíncronas se completaba, disparando entonces una revisión completa de detección de cambios sobre toda la aplicación (o una porción significativa de ella) para verificar qué, si acaso, efectivamente cambió como resultado. Este enfoque, aunque funcional y responsable en gran medida del éxito histórico de Angular en simplificar la detección de cambios sin requerir gestión manual explícita, es deliberadamente de "fuerza bruta": revisa mucho más de lo estrictamente necesario en cada ciclo, porque Zone.js solo sabe que "algo asíncrono ocurrió en algún lugar", no exactamente qué cambió específicamente ni qué partes concretas de la interfaz dependen de ese cambio específico.

Con el modelo de signals, Angular tiene información precisa y exacta de qué signal cambió y qué partes específicas de la plantilla leen ese signal en particular, eliminando la necesidad de la aproximación de fuerza bruta de Zone.js: cuando un signal cambia, Angular puede actualizar exactamente las partes de la interfaz que dependen de él, sin necesidad de revisar el resto de la aplicación que no tiene ninguna relación con ese cambio específico. Esta precisión es lo que hace viable, para una aplicación construida completamente sobre signals (sin depender de mecanismos que Zone.js interceptaba para funcionar), eliminar Zone.js por completo del bundle de la aplicación (el modo "zoneless"), reduciendo el tamaño del bundle final y, potencialmente, mejorando el rendimiento al eliminar por completo el overhead de interceptar cada operación asíncrona del navegador.

Adoptar zoneless no es simplemente activar una bandera de configuración sin ninguna otra consideración: requiere que el estado de la aplicación esté modelado consistentemente con signals (o con APIs que Angular sabe rastrear directamente sin depender de Zone.js), de modo que Angular tenga la información precisa que necesita para saber cuándo actualizar la interfaz sin la red de seguridad de fuerza bruta que Zone.js proporcionaba anteriormente; código que dependa de mutaciones directas sin pasar por signals, o de mecanismos asíncronos que Angular no rastrea nativamente sin Zone.js, podría no disparar actualizaciones de interfaz correctamente en modo zoneless sin las adaptaciones correspondientes.

**Analogía:** Zone.js es como un sistema de vigilancia que revisa cada habitación completa de un edificio entero cada vez que se detecta cualquier tipo de movimiento en cualquier parte, sin saber exactamente dónde ocurrió ni qué cambió específicamente; el modelo basado en signals es como un sistema de sensores individuales colocados exactamente en cada punto relevante, que notifican con precisión exacta cuál sensor específico se activó y qué área específica necesita atención, sin necesidad de revisar el edificio completo cada vez.

**¿Por qué es importante?** El modelo de signals hace posible eliminar Zone.js del bundle de una aplicación, reduciendo su tamaño y el overhead de interceptar cada operación asíncrona, una dirección clara hacia la que Angular moderno está evolucionando activamente.

**Diagrama:**

```
Con Zone.js (histórico):     Cualquier evento/timer/petición → revisión de TODA la app
Zoneless (basado en signals): signal específico cambia → actualiza SOLO lo que depende de él
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

**Objetivo del laboratorio:** construir un componente con estado completamente derivado mediante signals y `computed`, comparándolo explícitamente con la alternativa basada en RxJS.

**Requisitos previos:** Módulos 0-1 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un signal contador con dos botones | `update()` y `set()` | Verifica ambos mecanismos de actualización |
| 2 | Derivar un `computed()` doble | Ver Tema 1 | Verifica que se recalcula solo cuando el contador cambia |
| 3 | Usar `effect()` para loguear cambios | Ver Tema 1 | Observa exactamente cuándo se dispara |
| 4 | Convertir una mutación in-place a inmutable | `push()` vs `update()` con spread | Verifica que solo la segunda notifica el cambio |
| 5 | Comparar con un `BehaviorSubject` equivalente | Mismo estado con RxJS | Mide líneas de código y claridad de cada enfoque |

**Verificación:** el laboratorio se considera exitoso si el `computed()` demuestra visiblemente que solo se recalcula cuando su dependencia real cambia (verificable con un log dentro de la función del computed), y si la comparación con `BehaviorSubject` documenta explícitamente las diferencias observadas.

**Errores comunes y soluciones**

- **Mutar un array o objeto dentro de un signal con métodos in-place (`push`, `splice`).** Siempre usa `update()` con una nueva referencia (spread) en su lugar.
- **Usar `effect()` para derivar un valor que en realidad debería ser un `computed()`.** Reserva `effect()` genuinamente para efectos secundarios, no para producir valores a leer después.
- **Forzar RxJS para estado simple síncrono que un signal expresaría más simplemente.** Evalúa si realmente necesitas composición temporal antes de rechazar signals por defecto.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué push() no dispara la actualización

**Enunciado:** explica exactamente por qué `tareas().push(nuevaTarea)` dentro de un signal no dispara la actualización de la interfaz de usuario.

**Solución esperada:** los signals detectan cambios comparando la referencia del valor almacenado, no su contenido profundo; `push()` muta el array existente in-place, sin crear una nueva referencia, así que desde la perspectiva del signal, "nada cambió" (la referencia sigue siendo idéntica antes y después), y por tanto no se notifica a ningún `computed()` o `effect()` que dependa de ese signal.

**Criterios de éxito:**
- Explica correctamente que la detección es por referencia, no por contenido profundo.

### Ejercicio 2: Cuándo preferirías RxJS sobre un signal

**Enunciado:** describe un escenario concreto donde preferirías un Observable de RxJS sobre un signal simple.

**Solución esperada:** un escenario razonable: un buscador que debe esperar una pausa en la escritura del usuario (debounce), cancelar automáticamente la petición anterior si el usuario sigue escribiendo (switchMap), y combinar el resultado con otro flujo de datos (como un filtro seleccionado por separado); esta composición temporal de múltiples operadores es precisamente lo que RxJS está diseñado para expresar, y que un signal simple, por diseño síncrono, no cubre directamente sin recurrir de todas formas a RxJS por debajo.

**Criterios de éxito:**
- Da un escenario que genuinamente requiere composición temporal (debounce, cancelación, combinación de flujos).

### Ejercicio 3: Diseñar un computed derivado

**Enunciado:** dado un signal `tareas` con una lista de tareas (cada una con una propiedad `completada: boolean`), escribe un `computed()` que derive cuántas tareas están pendientes.

**Solución esperada:**
```ts
const tareas = signal<Tarea[]>([]);
const pendientes = computed(() => tareas().filter(t => !t.completada).length);
```

**Criterios de éxito:**
- Usa `computed()` correctamente, derivando del signal `tareas` sin necesidad de un `effect()` innecesario.

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

- `signal()` crea estado reactivo síncrono; `computed()` deriva valores memoizados automáticamente; `effect()` ejecuta efectos secundarios reactivos.
- Los signals detectan cambios por referencia, no por contenido profundo: mutar in-place no dispara actualizaciones, siempre hay que reemplazar con una nueva referencia.
- Signals modelan estado síncrono simple; RxJS sigue siendo necesario para flujos asíncronos complejos con composición temporal.
- El modelo de signals hace posible eliminar Zone.js (modo zoneless), reduciendo el bundle y el overhead de interceptar operaciones asíncronas del navegador.

**Conceptos aprendidos**

- `signal()`, `computed()` y `effect()` como el modelo fundamental de reactividad.
- La importancia de la inmutabilidad al actualizar signals con estructuras de datos compuestas.
- Cuándo preferir signals frente a RxJS.
- El camino de Angular hacia la detección de cambios zoneless.

**Próximos pasos**

En el Módulo 3 aprenderás servicios e inyección de dependencias: `@Injectable`, la función `inject()`, la jerarquía de inyectores, y tokens de inyección personalizados.

**Recursos adicionales**

- Documentación oficial de Angular: "Signals" y "Zoneless change detection".
