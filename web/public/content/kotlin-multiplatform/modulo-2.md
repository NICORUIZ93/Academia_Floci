# Módulo 2: Coroutines y Flow

## Sílabo

**Objetivo general**

Dominar la concurrencia estructurada de Kotlin como reemplazo de callbacks y threads manuales, incluyendo `suspend` functions, `Flow`/`StateFlow`/`SharedFlow`, y manejo de errores en coroutines.

**Objetivos específicos**

1. Escribir funciones `suspend` que no bloqueen el hilo.
2. Ejecutar coroutines en paralelo con `async`/`await` y combinar sus resultados.
3. Manejar errores dentro de una coroutine con `try`/`catch`.
4. Crear y recolectar un `Flow`.
5. Diferenciar `StateFlow` de un `Flow` normal para representar estado de UI.

**Contenido**

- `suspend` functions y `CoroutineScope`.
- Structured concurrency.
- Flow vs StateFlow vs SharedFlow.
- Manejo de errores en coroutines.
- `Mutex` para exclusión mutua en corrutinas.
- `kotlinx.atomicfu` para estado atómico multiplataforma.

**Evaluación**

Función suspendida que combina dos fuentes de datos con manejo de errores estructurado, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: suspend functions y concurrencia estructurada

**Conceptos clave:** pausable sin bloquear el hilo, cancelación en cascada garantizada.

`suspend fun obtenerUsuario(id: String): Usuario { delay(1000); return Usuario(id, "Ana") }` declara una función que puede "pausarse" en un punto de suspensión (como `delay`, o cualquier operación de I/O asíncrona) sin bloquear el hilo físico subyacente durante esa pausa, liberándolo para realizar otro trabajo mientras tanto, y reanudando la ejecución de la función exactamente donde quedó pausada una vez que la operación asíncrona completa — un modelo conceptualmente similar a `async`/`await` de JavaScript (Módulo 5 del track de JavaScript) o a los virtual threads de Java (Módulo 5 del track de Java), aunque implementado mediante un mecanismo propio del compilador de Kotlin (transformación de continuaciones). Una función `suspend` solo puede invocarse desde otra función `suspend` o desde un `CoroutineScope`, una restricción verificada por el compilador que garantiza que nunca se invoque accidentalmente de forma bloqueante desde código que no está preparado para manejar esa suspensión correctamente.

`suspend fun cargarPantalla() = coroutineScope { val usuario = async { obtenerUsuario() }; val pedidos = async { obtenerPedidos() }; PantallaDatos(usuario.await(), pedidos.await()) }` demuestra concurrencia estructurada: ambas llamadas se ejecutan en paralelo (mediante `async`), pero crucialmente están vinculadas al `coroutineScope` que las contiene, garantizando una propiedad fundamental que ni los threads manuales ni los callbacks tradicionales garantizan por sí solos: si ese `coroutineScope` se cancela por cualquier razón (por ejemplo, porque el usuario navegó a otra pantalla antes de que ambas llamadas completaran), absolutamente todas las coroutines hijas lanzadas dentro de ese scope se cancelan automáticamente en cascada, sin dejar tareas huérfanas ejecutándose en segundo plano de forma descontrolada tras haber perdido toda relevancia.

**Analogía:** una función `suspend` es como un trabajador que puede pausar su tarea actual en un punto específico para atender otra cosa mientras espera un insumo externo, retomando exactamente donde la dejó cuando el insumo llega, en vez de quedarse parado sin hacer nada durante toda la espera; la concurrencia estructurada es como un equipo de trabajo donde, si se cancela el proyecto completo, automáticamente se cancelan todas las subtareas asociadas a ese proyecto sin excepción, sin que ninguna quede olvidada ejecutándose innecesariamente.

**¿Por qué es importante?** La concurrencia estructurada garantiza que la cancelación de un scope padre cancela automáticamente todas sus coroutines hijas, evitando tareas huérfanas ejecutándose sin control, una garantía que threads manuales o callbacks no ofrecen por sí solos.

**Casos de uso reales:**
- Cargar en paralelo perfil de usuario y lista de pedidos al abrir una pantalla, cancelando ambas si el usuario navega antes de que terminen.
- Llamadas de red desde un ViewModel (Módulo 4 del track Android) que se cancelan automáticamente cuando la pantalla se destruye.
- Sincronizar datos remotos con caché local (Módulo 11) sin dejar la sincronización corriendo tras cerrar la app.

**Código del ejemplo:**

```kotlin
suspend fun cargarPantalla() = coroutineScope {
    val usuario = async { obtenerUsuario() }
    val pedidos = async { obtenerPedidos() }
    PantallaDatos(usuario.await(), pedidos.await()) // ambas corren en paralelo
}
```

### Tema 2: Flow, StateFlow y SharedFlow

**Conceptos clave:** flujo asíncrono de múltiples valores, siempre con valor actual frente a eventos puntuales.

`fun contarHasta(n: Int): Flow<Int> = flow { for (i in 1..n) { delay(100); emit(i) } }` define un `Flow`, un flujo asíncrono de múltiples valores emitidos a lo largo del tiempo, conceptualmente análogo a un Observable de RxJS (Módulo 6 del track de Angular) pero construido con las primitivas nativas de coroutines de Kotlin, recolectado mediante `collect` de forma similar a suscribirse a un Observable, con evaluación perezosa (el bloque `flow { ... }` no ejecuta nada hasta que alguien efectivamente recolecta el flujo).

`val estado = MutableStateFlow(EstadoUI.Cargando)` es una especialización de `Flow` que siempre mantiene un valor actual disponible (inicializado obligatoriamente, y consultable en cualquier momento sin necesidad de recolectar primero), ideal específicamente para representar estado de UI (Módulo 1), donde siempre existe un estado "actual" válido que un nuevo observador debe poder consultar inmediatamente al empezar a observar, sin tener que esperar la siguiente emisión futura; `val eventos = MutableSharedFlow<Evento>()`, en cambio, no tiene ningún valor inicial obligatorio y está diseñado para eventos puntuales de un solo uso (una notificación específica, una navegación disparada una única vez), donde no tendría sentido conceptual que un nuevo observador reciba automáticamente el "último evento" al empezar a observar, dado que ese evento ya fue procesado por quien lo recibió originalmente en su momento.

**Analogía:** `Flow` es como una cinta transportadora que entrega elementos sucesivos a quien se conecta a observarla; `StateFlow` es como un panel de estado siempre visible que muestra su valor actual en todo momento, incluso para alguien que recién llega a mirarlo; `SharedFlow` es como un anuncio puntual transmitido una única vez, que alguien que llega tarde simplemente no escuchó y no tiene sentido repetirle automáticamente.

**¿Por qué es importante?** `StateFlow` es apropiado para estado de UI que siempre tiene un valor actual consultable; `SharedFlow` es apropiado para eventos puntuales de un solo uso donde no existe un "valor actual" con sentido de repetirse a nuevos observadores.

**Casos de uso reales:**
- `StateFlow` para el estado observable de un ViewModel Compose (lista de tareas, estado de carga).
- `SharedFlow` para eventos de navegación de un solo disparo ("mostrar este Snackbar una vez") que no deben repetirse al rotar la pantalla.
- `Flow` para observar cambios en una tabla SQLDelight (Módulo 6) y actualizar la UI automáticamente en cada `insert`/`update`.

**Código del ejemplo:**

```kotlin
fun contarHasta(n: Int): Flow<Int> = flow {
    for (i in 1..n) { delay(100); emit(i) }
}
val estado = MutableStateFlow(EstadoUI.Cargando) // siempre tiene un valor actual, ideal para estado de UI
val eventos = MutableSharedFlow<Evento>()          // sin valor inicial, ideal para eventos puntuales (un solo uso)
```

### Tema 3: Manejo de errores y exclusión mutua

**Conceptos clave:** `try`/`catch` alrededor de una llamada suspend, `Mutex` para acceso exclusivo.

Manejar errores dentro de una coroutine sigue el mismo mecanismo estructural de `try`/`catch` de Kotlin (heredado conceptualmente de Java, Módulo 3 del track de Java), aplicado directamente alrededor de una llamada a una función `suspend`: `try { obtenerUsuario(id) } catch (e: Exception) { EstadoUI.Error(e.message ?: "Error desconocido") }` captura cualquier excepción que la operación asíncrona pueda lanzar (incluyendo errores de red simulados o reales), transformándola en un estado explícito y manejable (`EstadoUI.Error`, Módulo 1) en vez de dejar que la excepción se propague sin control hacia capas superiores no preparadas para manejarla específicamente.

`Mutex` (de `kotlinx.coroutines.sync`) proporciona exclusión mutua específicamente diseñada para coroutines, análoga en propósito a `synchronized` de Java (Módulo 5 del track de Java) pero compatible con el modelo de suspensión de coroutines (a diferencia de `synchronized`, que bloquearía el thread físico completo durante toda la sección crítica, potencialmente desperdiciando la eficiencia que las coroutines están diseñadas para ofrecer); `kotlinx.atomicfu` proporciona primitivas de estado atómico multiplataforma (contadores y referencias que pueden modificarse de forma segura entre múltiples coroutines concurrentes sin condiciones de carrera), funcionando de manera consistente en todos los targets de Kotlin Multiplatform (Módulo 3), no solo en la JVM.

**Analogía:** manejar errores de una coroutine con `try`/`catch` es como tener un plan de contingencia explícito para cuando un mensajero no logra completar su encargo, convirtiendo ese fallo en una respuesta manejable en vez de dejar que el problema se propague sin control; `Mutex` es como un único pase de acceso que solo una persona puede sostener a la vez para entrar a una sala específica, garantizando que nunca dos personas modifiquen simultáneamente el mismo recurso dentro de esa sala.

**¿Por qué es importante?** `try`/`catch` alrededor de una llamada suspend transforma errores asíncronos en estados manejables explícitos; `Mutex` proporciona exclusión mutua compatible con el modelo de suspensión de coroutines, evitando el bloqueo de thread físico completo que `synchronized` impondría.

**Casos de uso reales:**
- Capturar errores de red (timeout, sin conexión) y convertirlos en `EstadoUI.Error` con un mensaje legible para el usuario.
- `Mutex` para proteger una caché en memoria compartida entre varias coroutines que la leen y escriben concurrentemente.
- `kotlinx.atomicfu` para un contador de peticiones en curso, consistente en Android, iOS y JVM sin código específico por plataforma.

**Código del ejemplo:**

```kotlin
try {
    obtenerUsuario(id)
} catch (e: Exception) {
    EstadoUI.Error(e.message ?: "Error desconocido")
}
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

**Objetivo del laboratorio:** construir una función suspendida que combina dos fuentes de datos con manejo de errores estructurado.

**Requisitos previos:** Módulos 0-1 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir una función suspend con `delay()` | Ver Tema 1 | Simula una llamada de red |
| 2 | Lanzar dos coroutines en paralelo con `async`/`await` | Ver Tema 1 | Combina sus resultados |
| 3 | Capturar un error con `try`/`catch` alrededor de una llamada suspend | Ver Tema 3 | Transforma el error en un estado explícito |
| 4 | Crear un `Flow` que emita valores periódicamente | Ver Tema 2 | Recolecta con `collect` |
| 5 | Implementar un `StateFlow` para el estado de una pantalla | Ver Tema 2 | Observado desde un componente de UI |

**Verificación:** el laboratorio se considera exitoso si ambas fuentes de datos se cargan en paralelo (no secuencialmente), y si un error simulado en cualquiera de las dos se transforma correctamente en un estado `EstadoUI.Error` manejable, en vez de propagar una excepción sin control.

**Errores comunes y soluciones**

- **Llamar a `await()` inmediatamente después de cada `async` en vez de lanzar ambos primero.** Lanza ambos `async` antes de llamar a `await()` en cualquiera, para que efectivamente corran en paralelo.
- **Usar `SharedFlow` para representar estado de UI persistente.** Usa `StateFlow`, que siempre mantiene un valor actual consultable.
- **Usar `synchronized` dentro de una coroutine para exclusión mutua.** Usa `Mutex`, compatible con el modelo de suspensión de coroutines.

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

- JetBrains, documentación oficial de *Kotlin Multiplatform* y Kotlin Coroutines.
- Google, *Android Developers Documentation*; Apple, *Developer Documentation*.
- Kotlin Foundation, especificación y pautas de compatibilidad de Kotlin.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.


## Resumen del módulo

**Puntos clave**

- Las funciones `suspend` pueden pausarse sin bloquear el hilo físico, reanudando exactamente donde quedaron.
- La concurrencia estructurada garantiza cancelación en cascada de coroutines hijas al cancelar el scope padre.
- `StateFlow` mantiene siempre un valor actual, ideal para estado de UI; `SharedFlow` es apropiado para eventos puntuales.
- `Mutex` proporciona exclusión mutua compatible con la suspensión de coroutines, a diferencia de `synchronized`.

**Conceptos aprendidos**

- `suspend` functions y `CoroutineScope`.
- Concurrencia estructurada.
- Flow, StateFlow y SharedFlow.
- Manejo de errores y `Mutex`.

**Próximos pasos**

En el Módulo 3 aprenderás la arquitectura de un proyecto KMP: source sets, `expect`/`actual`, y Gradle multiplataforma.

**Recursos adicionales**

- Documentación oficial de Kotlin Coroutines (kotlinlang.org/docs/coroutines-overview.html).
