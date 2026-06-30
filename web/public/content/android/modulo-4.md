## StateFlow en el ViewModel

```kotlin
class TareasViewModel(private val repo: TareaRepository) : ViewModel() {
    private val _estado = MutableStateFlow<EstadoUI>(EstadoUI.Cargando)
    val estado: StateFlow<EstadoUI> = _estado.asStateFlow()

    fun cargar() = viewModelScope.launch {
        _estado.value = try { EstadoUI.Exito(repo.obtenerTareas()) } catch (e: Exception) { EstadoUI.Error(e.message) }
    }
}
```

## Observar con collectAsStateWithLifecycle

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

`collectAsStateWithLifecycle` pausa la recolección automáticamente cuando la app va a background, ahorrando recursos — `collectAsState` simple sigue recolectando siempre.

## UDF: Unidirectional Data Flow

```
Usuario hace click → ViewModel.accion() → actualiza StateFlow → Compose recompone con el nuevo estado
```

El estado fluye en una sola dirección: la UI nunca modifica el estado directamente, solo notifica intenciones al ViewModel.

## SharedFlow para eventos de un solo uso

```kotlin
private val _eventos = MutableSharedFlow<Evento>()
val eventos = _eventos.asSharedFlow()

// en la UI, dentro de un LaunchedEffect:
LaunchedEffect(Unit) { viewModel.eventos.collect { evento -> mostrarSnackbar(evento) } }
```
