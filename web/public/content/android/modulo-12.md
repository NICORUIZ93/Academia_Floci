## Arquitectura MVVM completa

```
UI (Compose)
  ↕ collectAsStateWithLifecycle / eventos
ViewModel (StateFlow, UDF)
  ↕
Repositorio (offline-first: Room + Retrofit)
  ↕                    ↕
Room (caché local)    Retrofit (API remota)
```

## Uniendo los módulos del track

Este proyecto integra: UI declarativa con state hoisting correcto (módulo 2), navegación con argumentos tipados (módulo 3), UDF completo con StateFlow (módulo 4), persistencia offline-first con Room + Flow reactivo (módulo 6), inyección de dependencias con Hilt en toda la app (módulo 7), y tests de ViewModel + Compose UI (módulo 9).

```kotlin
@HiltViewModel
class TareasViewModel @Inject constructor(
    private val repo: TareaRepository, // Room + Retrofit por debajo, inyectado por Hilt
) : ViewModel() {
    val tareas: StateFlow<List<Tarea>> = repo.tareas
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun sincronizar() = viewModelScope.launch { repo.sincronizar() }
}
```

## Cierre del track

Una app Android "completa" en 2025 no es solo pantallas bonitas con Compose: es la combinación de un flujo de datos predecible (UDF), resiliencia ante pérdida de conexión (offline-first), dependencias desacopladas y testeables (Hilt), y una base de tests que da confianza real antes de publicar en Play Console.
