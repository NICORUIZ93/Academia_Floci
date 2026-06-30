## Ciclo de vida de una Activity

```
onCreate → onStart → onResume → [en pantalla] → onPause → onStop → onDestroy
```

Al rotar la pantalla, por defecto Android **destruye y recrea** la Activity — cualquier variable local en la UI se pierde, a menos que el estado viva en algo que sobreviva ese ciclo.

## ViewModel sobrevive a la rotación

```kotlin
class TareasViewModel : ViewModel() {
    private val _contador = MutableStateFlow(0)
    val contador = _contador.asStateFlow()

    fun incrementar() { _contador.value++ }
}
```

El `ViewModel` está vinculado al `ViewModelStore` de la Activity/NavGraph, que sobrevive a la recreación por rotación — solo se destruye cuando la pantalla se cierra de verdad (el usuario navega atrás, no cuando solo rota el dispositivo).

## SavedStateHandle

```kotlin
class TareasViewModel(private val savedStateHandle: SavedStateHandle) : ViewModel() {
    var filtro: String
        get() = savedStateHandle["filtro"] ?: ""
        set(value) { savedStateHandle["filtro"] = value }
}
```

A diferencia del ViewModel "normal" (que sobrevive rotación pero NO a que el sistema mate el proceso por falta de memoria), `SavedStateHandle` persiste el valor incluso en ese escenario más agresivo, restaurándolo cuando el usuario vuelve a la app.
