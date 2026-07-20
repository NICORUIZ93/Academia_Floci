# Módulo 4: Estado con StateFlow y Compose


## Aprende construyendo

### Tema 1: StateFlow en el ViewModel

**Conceptos clave:** estado observable, siempre con un valor actual disponible.

```kotlin
class TareasViewModel(private val repo: TareaRepository) : ViewModel() {
    private val _estado = MutableStateFlow<EstadoUI>(EstadoUI.Cargando)
    val estado: StateFlow<EstadoUI> = _estado.asStateFlow()

    fun cargar() = viewModelScope.launch {
        _estado.value = try { EstadoUI.Exito(repo.obtenerTareas()) } catch (e: Exception) { EstadoUI.Error(e.message) }
    }
}
```

`StateFlow` es un tipo especial de `Flow` (el tipo de flujo reactivo estudiado en profundidad en el Módulo 2 del track de Kotlin Multiplatform) que garantiza tener siempre un valor actual disponible de inmediato para cualquier nuevo observador, a diferencia de un `Flow` genérico que podría no emitir nada hasta que ocurra algún evento futuro; esta garantía lo hace especialmente apto para representar "el estado actual de la pantalla" (`EstadoUI.Cargando`, `EstadoUI.Exito`, `EstadoUI.Error`), un valor que siempre debe existir y estar disponible para renderizar la UI en cualquier momento, no solo en respuesta a un evento puntual.

El patrón `_estado` privado mutable (`MutableStateFlow`) expuesto públicamente como `estado` de solo lectura (`StateFlow`) es una convención deliberada de encapsulación: el `ViewModel` controla exclusivamente cuándo y cómo cambia el estado internamente, mientras que cualquier consumidor externo (la UI de Compose) solo puede leerlo, nunca mutarlo directamente, reforzando desde el tipo mismo la dirección única del flujo de datos que se completa en el Tema 3.

**Analogía:** `StateFlow` es como un tablero de anuncios público que siempre muestra algún mensaje actual visible para cualquiera que lo mire por primera vez (nunca está vacío), en contraste con un sistema de mensajería que solo entrega mensajes nuevos a partir del momento en que alguien se suscribe, sin garantizar ningún mensaje inicial disponible de inmediato.

**¿Por qué es importante?** `StateFlow` garantiza un valor actual siempre disponible, apropiado para representar el estado de una pantalla completa; la convención de exponerlo como mutable privado y de solo lectura público refuerza la dirección única del flujo de datos (UDF).

**Casos de uso reales:**
- Estado de carga/éxito/error de una lista de tareas que la UI observa y renderiza sin lógica adicional.
- Estado del carrito de compras en una app de e-commerce, consultable en cualquier momento desde cualquier pantalla.
- Contador de elementos no leídos que cualquier pantalla puede observar con el valor correcto desde el primer instante.

**Código del ejemplo:**

```kotlin
class TareasViewModel(private val repo: TareaRepository) : ViewModel() {
    private val _estado = MutableStateFlow<EstadoUI>(EstadoUI.Cargando)
    val estado: StateFlow<EstadoUI> = _estado.asStateFlow()  // solo lectura hacia afuera
}
```

### Tema 2: collectAsStateWithLifecycle y UDF

**Conceptos clave:** recolección consciente del ciclo de vida, flujo de datos en una única dirección.

```kotlin
@Composable
fun PantallaTareas(viewModel: TareasViewModel) {
    val estado by viewModel.estado.collectAsStateWithLifecycle()
    when (estado) {
        is EstadoUI.Cargando -> Spinner()
        is EstadoUI.Exito -> ListaTareas((estado as EstadoUI.Exito).datos)
        is EstadoUI.Error -> MensajeError()
    }
}
```

`collectAsStateWithLifecycle` observa un `StateFlow` de forma "consciente del ciclo de vida" (lifecycle-aware): pausa automáticamente la recolección cuando la Activity va a background (por ejemplo, tras `onStop`) y la reanuda al volver a foreground, ahorrando recursos de CPU y memoria que se desperdiciarían recolectando actualizaciones de un `Flow` mientras la UI ni siquiera es visible para el usuario; esto contrasta con `collectAsState` (la versión más simple y anterior), que sigue recolectando de forma continua sin ninguna consideración del ciclo de vida, un comportamiento menos eficiente que Google ha desaconsejado en apps de producción desde la introducción de la versión consciente del ciclo de vida.

```
Usuario hace click → ViewModel.accion() → actualiza StateFlow → Compose recompone con el nuevo estado
```

UDF (Unidirectional Data Flow) es el principio arquitectónico que generaliza el state hoisting del Módulo 2 hacia la relación completa entre `ViewModel` y UI: el estado fluye en una única dirección, desde el `ViewModel` hacia la UI (vía `StateFlow`), y las intenciones del usuario fluyen en la dirección contraria, desde la UI hacia el `ViewModel` (vía llamadas a funciones), nunca al revés — la UI nunca modifica el `StateFlow` directamente, solo notifica una intención (`viewModel.accion()`) y espera a que el `ViewModel` decida cómo y si actualizar el estado en respuesta.

**Analogía:** `collectAsStateWithLifecycle` es como un asistente que deja de tomar notas activamente cuando la sala de reuniones está vacía (app en background) y retoma automáticamente al volver alguien a la sala, en vez de seguir tomando notas de una sala vacía sin ningún propósito; UDF es como una cadena de mando militar donde las órdenes fluyen estrictamente de arriba hacia abajo y los reportes de estado fluyen estrictamente de abajo hacia arriba, sin que un subordinado emita órdenes directamente a sus pares sin pasar por la cadena.

**¿Por qué es importante?** `collectAsStateWithLifecycle` evita desperdiciar recursos recolectando actualizaciones mientras la UI no es visible; UDF hace que el flujo de datos de toda la pantalla sea predecible y fácil de razonar, con una única fuente de verdad (el `ViewModel`) controlando todos los cambios de estado.

**Casos de uso reales:**
- Ahorrar batería pausando la recolección de un `StateFlow` de ubicación en tiempo real cuando la app pasa a background.
- Depurar un bug de "estado inconsistente" verificando que ningún composable mute el `StateFlow` directamente, violando UDF.
- Onboarding de un desarrollador nuevo al equipo explicando el flujo con una sola regla: clicks bajan, estado sube.

**Diagrama:**

```
Usuario hace click → ViewModel.accion() → actualiza StateFlow → Compose recompone con el nuevo estado
        ↑______________________________________________________________|
                    (la UI nunca modifica el estado directamente)
```

### Tema 3: SharedFlow para eventos de un solo uso

**Conceptos clave:** eventos que no deben repetirse en una recomposición, a diferencia del estado persistente.

```kotlin
private val _eventos = MutableSharedFlow<Evento>()
val eventos = _eventos.asSharedFlow()

// en la UI, dentro de un LaunchedEffect:
LaunchedEffect(Unit) { viewModel.eventos.collect { evento -> mostrarSnackbar(evento) } }
```

Un evento como "mostrar un Snackbar" tiene una naturaleza fundamentalmente distinta al estado representado por `StateFlow`: un `StateFlow` siempre tiene un valor actual que cualquier nuevo observador recibe de inmediato (Tema 1), lo cual es exactamente el comportamiento correcto para "el estado actual de la lista de tareas", pero sería incorrecto para un evento de un solo uso como "mostrar un mensaje de éxito", dado que una recomposición posterior (por ejemplo, tras rotar la pantalla) volvería a entregar ese mismo valor "actual" a un nuevo observador, mostrando el Snackbar repetidamente sin que haya ocurrido ningún evento nuevo real.

`SharedFlow` (sin la garantía de "valor actual siempre disponible" que tiene `StateFlow`) modela correctamente esta semántica de "evento efímero, no estado persistente": cada emisión se entrega una única vez a los observadores activos en ese momento, sin quedar retenida como un valor "actual" que un observador nuevo recibiría automáticamente al suscribirse más tarde, evitando exactamente el problema de repetición descrito.

**Analogía:** `StateFlow` es como un letrero permanente que muestra el estado actual de un semáforo (cualquiera que lo mire en cualquier momento ve el color vigente); `SharedFlow` para eventos es como el sonido de una campana que suena una única vez en el momento exacto del evento — quien no estaba escuchando en ese instante simplemente no la escucha, y no hay forma de "recuperar" ese sonido pasado consultando en un momento posterior.

**¿Por qué es importante?** Modelar un evento de "mostrar Snackbar" con `SharedFlow` en vez de `StateFlow` evita que ese evento se repita incorrectamente en una recomposición posterior, dado que `SharedFlow` no retiene un "último valor" que un nuevo observador recibiría automáticamente.

**Casos de uso reales:**
- Mostrar un Snackbar de "Tarea guardada" exactamente una vez, sin que reaparezca al rotar la pantalla.
- Disparar una navegación de un solo uso ("ir a la pantalla de éxito") tras completar un pago.
- Emitir un evento de error puntual de red que se muestra una vez, sin quedar "pegado" como estado persistente.

**Código del ejemplo:**

```kotlin
private val _eventos = MutableSharedFlow<Evento>()
val eventos = _eventos.asSharedFlow()

LaunchedEffect(Unit) { viewModel.eventos.collect { evento -> mostrarSnackbar(evento) } }
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una pantalla con UDF completo: eventos de usuario → `ViewModel` → `StateFlow` → UI.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Exponer un `StateFlow<EstadoUI>` desde un `ViewModel` | Ver Tema 1 | `_estado` privado, `estado` público |
| 2 | Observarlo con `collectAsStateWithLifecycle` | Ver Tema 2 | En vez de `collectAsState` simple |
| 3 | Implementar el flujo UDF completo | Ver Tema 2 | Click → ViewModel → StateFlow → recomposición |
| 4 | Emitir un evento de un solo uso con `SharedFlow` | Ver Tema 3 | Ej. mostrar un Snackbar |
| 5 | Verificar la pausa automática de recolección en background | Ver Tema 2 | Con `collectAsStateWithLifecycle` |

**Verificación:** el laboratorio se considera exitoso si un evento emitido con `SharedFlow` se muestra exactamente una vez (no se repite tras rotar la pantalla), y si toda actualización de estado sigue el flujo UDF completo sin que la UI modifique el `StateFlow` directamente.

**Errores comunes y soluciones**

- **Usar `StateFlow` para un evento de un solo uso como un Snackbar.** El evento se repetiría en una recomposición posterior; usa `SharedFlow`.
- **Usar `collectAsState` simple en vez de `collectAsStateWithLifecycle`.** Desperdicia recursos recolectando mientras la app está en background.
- **Modificar el estado directamente desde la UI en vez de notificar una intención al `ViewModel`.** Rompe UDF; toda mutación de estado debe pasar por el `ViewModel`.

---
