## suspend functions

```kotlin
suspend fun obtenerUsuario(id: String): Usuario {
    delay(1000) // simula una llamada de red, sin bloquear el hilo
    return Usuario(id, "Ana")
}
```

Una función `suspend` solo puede llamarse desde otra función `suspend` o desde un `CoroutineScope` — el compilador garantiza que no la invocas accidentalmente de forma bloqueante.

## Concurrencia estructurada

```kotlin
suspend fun cargarPantalla() = coroutineScope {
    val usuario = async { obtenerUsuario() }
    val pedidos = async { obtenerPedidos() }
    PantallaDatos(usuario.await(), pedidos.await()) // ambas corren en paralelo
}
```

Si el `coroutineScope` se cancela (ej. el usuario navega a otra pantalla), TODAS las coroutines hijas se cancelan automáticamente — no quedan tareas huérfanas corriendo en segundo plano.

## Flow, StateFlow, SharedFlow

```kotlin
fun contarHasta(n: Int): Flow<Int> = flow {
    for (i in 1..n) { delay(100); emit(i) }
}

val estado = MutableStateFlow(EstadoUI.Cargando) // siempre tiene un valor actual, ideal para estado de UI
val eventos = MutableSharedFlow<Evento>()          // sin valor inicial, ideal para eventos puntuales (un solo uso)
```

## Manejo de errores

```kotlin
try {
    obtenerUsuario(id)
} catch (e: Exception) {
    EstadoUI.Error(e.message ?: "Error desconocido")
}
```
