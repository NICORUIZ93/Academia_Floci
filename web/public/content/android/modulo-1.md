# Módulo 1: Ciclo de vida: Activities y ViewModel


## Aprende construyendo

### Tema 1: Ciclo de vida de una Activity

**Conceptos clave:** callbacks predecibles, destrucción y recreación por defecto al rotar.

```
onCreate → onStart → onResume → [en pantalla] → onPause → onStop → onDestroy
```

Cada Activity en Android atraviesa una secuencia predecible de callbacks del ciclo de vida a medida que cambia su visibilidad e interactividad: `onCreate` se ejecuta una única vez al crearse la instancia (donde se infla la UI inicial), `onStart`/`onResume` marcan que la Activity se vuelve visible e interactiva respectivamente, y `onPause`/`onStop`/`onDestroy` marcan la secuencia inversa cuando el usuario navega fuera de ella. Comprender este orden exacto es crítico porque determina en qué momento específico es seguro (o inseguro) realizar ciertas operaciones: iniciar una cámara en `onResume` y liberarla en `onPause` es el patrón correcto, mientras que hacerlo en `onCreate`/`onDestroy` dejaría la cámara activa innecesariamente mientras la app está en background, consumiendo batería sin ningún beneficio para el usuario.

Por defecto, Android **destruye y recrea completamente** la Activity cuando ocurre un cambio de configuración como una rotación de pantalla (el razonamiento histórico es que muchos recursos, como layouts XML alternativos por orientación, requerían recargarse desde cero); esto significa que cualquier variable de estado que viva únicamente en memoria dentro de la Activity o en un composable simple (`var contador by remember { mutableStateOf(0) }` sin persistencia adicional) se pierde por completo en ese proceso de destrucción y recreación, un comportamiento sorprendente para quien no lo conoce y una fuente extremadamente común de bugs reportados como "se resetea la pantalla al girar el teléfono".

**Analogía:** el ciclo de vida de una Activity es como el protocolo de apertura y cierre de una tienda física: hay un orden fijo para abrir (desbloquear, encender luces, poner el cartel de abierto) y otro para cerrar (cartel de cerrado, apagar luces, bloquear), y ciertas operaciones (como activar la alarma) solo tienen sentido en un punto específico de esa secuencia, no en cualquier momento arbitrario.

**¿Por qué es importante?** Conocer el orden exacto del ciclo de vida determina cuándo es seguro iniciar o liberar recursos costosos, y entender que una rotación destruye y recrea la Activity por defecto explica por qué el estado simple se pierde al rotar, motivando la necesidad de `ViewModel`.

**Casos de uso reales:**
- Iniciar la cámara o el GPS en `onResume` y liberarlos en `onPause` para no drenar batería en segundo plano.
- Pausar la reproducción de un video al salir de la pantalla (`onStop`) y reanudarla al volver (`onStart`).
- Diagnosticar el bug clásico de "se resetea el formulario al rotar" identificando dónde vive el estado perdido.

**Diagrama:**

```
onCreate → onStart → onResume → [en pantalla] → onPause → onStop → onDestroy
                                                      ↑
                                        rotación: destruye y recrea todo el ciclo
```

### Tema 2: ViewModel sobrevive a la rotación

**Conceptos clave:** vinculado al `ViewModelStore`, no al ciclo de vida de la Activity individual.

```kotlin
class TareasViewModel : ViewModel() {
    private val _contador = MutableStateFlow(0)
    val contador = _contador.asStateFlow()

    fun incrementar() { _contador.value++ }
}
```

Un `ViewModel` está vinculado internamente al `ViewModelStore` de la Activity (o del NavGraph, en el caso de navegación con Compose), una estructura que Android preserva deliberadamente a través de una recreación por cambio de configuración como la rotación, incluso mientras la instancia de la Activity en sí se destruye y se crea una nueva: cuando el sistema recrea la Activity tras rotar, en vez de crear un `ViewModel` nuevo desde cero, recupera la misma instancia que ya existía antes de la rotación desde ese `ViewModelStore` preservado, de modo que cualquier estado (`StateFlow`, variables normales) que viva dentro del `ViewModel` sobrevive intacto sin ninguna configuración especial adicional por parte del desarrollador.

Esta supervivencia tiene un límite claro y bien definido: el `ViewModelStore` se destruye definitivamente solo cuando la Activity se cierra "de verdad" (el usuario navega hacia atrás desde ella, terminándola explícitamente), no simplemente cuando el dispositivo rota; sin embargo, si el sistema operativo mata el proceso completo de la app por falta de memoria (un escenario más agresivo y menos predecible, común en dispositivos con poca RAM o tras mucho tiempo en background), el `ViewModelStore` en memoria se pierde por completo junto con todo el proceso, y ni siquiera un `ViewModel` puede sobrevivir a eso por sí solo — ese escenario específico requiere `SavedStateHandle` (Tema 3).

**Analogía:** un `ViewModel` es como el registro de un hotel que permanece en la recepción mientras un huésped simplemente cambia de habitación dentro del mismo hotel (rotación): la información no se pierde porque el registro nunca dependió de una habitación específica. Pero si el hotel completo cierra y se demuele (muerte del proceso), ese registro en papel desaparece con el edificio — se necesitaría una copia en una caja fuerte externa (`SavedStateHandle`) para sobrevivir a eso.

**¿Por qué es importante?** Un `ViewModel` sobrevive a rotación porque Android preserva deliberadamente el `ViewModelStore` a través de recreaciones por cambio de configuración, pero no sobrevive a que el sistema mate el proceso completo por falta de memoria, un escenario más agresivo que requiere una capa adicional de persistencia.

**Casos de uso reales:**
- Mantener la lista de tareas ya cargada de red visible tras rotar el dispositivo, sin volver a pedirla al servidor.
- Conservar el estado de scroll y los filtros aplicados en una lista al girar la pantalla.
- Compartir un mismo `ViewModel` entre varios composables de una misma pantalla sin pasar el estado manualmente entre ellos.

**Diagrama:**

```
Rotación:  Activity destruida → recreada → ViewModelStore preservado → mismo ViewModel recuperado
Muerte de proceso: TODO se destruye, incluyendo el ViewModelStore en memoria
```

### Tema 3: SavedStateHandle

**Conceptos clave:** persistencia adicional que sobrevive incluso a la muerte del proceso.

```kotlin
class TareasViewModel(private val savedStateHandle: SavedStateHandle) : ViewModel() {
    var filtro: String
        get() = savedStateHandle["filtro"] ?: ""
        set(value) { savedStateHandle["filtro"] = value }
}
```

`SavedStateHandle` ofrece un nivel de supervivencia estrictamente mayor que el `ViewModel` "normal" descrito en el Tema 2: mientras el `ViewModel` en sí solo sobrevive a recreaciones dentro del mismo proceso (como la rotación), `SavedStateHandle` persiste sus valores en un mecanismo del sistema (similar conceptualmente al `Bundle` de estado que Android ya usaba históricamente para Activities individuales) que sobrevive incluso cuando el sistema mata el proceso completo por falta de memoria, restaurando esos valores automáticamente cuando el usuario regresa a la app y el sistema recrea el proceso desde cero.

Esta distinción entre los dos niveles de supervivencia importa en la práctica al decidir qué guardar dónde: datos que son costosos de recalcular pero no críticos para la experiencia del usuario (una lista completa cacheada) pueden vivir solo en el `ViewModel` normal, mientras que datos pequeños que afectan directamente la continuidad de la experiencia del usuario tras reabrir la app (qué filtro tenía seleccionado, en qué paso de un formulario estaba) son buenos candidatos para `SavedStateHandle`, dado su costo mínimo de serialización y su beneficio directo en la percepción de continuidad de la app.

**Analogía:** `SavedStateHandle` es como una nota adhesiva que un huésped deja pegada en su propia maleta antes de salir del hotel, de modo que incluso si el hotel entero se demuele y se reconstruye desde cero en el mismo terreno, esa nota específica (el estado guardado) puede recuperarse y volver a colocarse en la maleta del huésped al regresar, a diferencia del registro completo de la recepción que sí se pierde con la demolición.

**¿Por qué es importante?** `SavedStateHandle` sobrevive a un escenario más agresivo (muerte completa del proceso) que un `ViewModel` normal (que solo sobrevive rotación), por lo que conviene reservarlo específicamente para datos pequeños que afectan la continuidad percibida por el usuario al reabrir la app.

**Casos de uso reales:**
- Restaurar el paso actual de un formulario multi-pantalla si el sistema mata la app en background y el usuario vuelve horas después.
- Recordar el término de búsqueda escrito para no perderlo si Android recicla el proceso por falta de memoria.
- Guardar el ID del ítem seleccionado en una lista para reabrir exactamente ese detalle tras una interrupción del sistema.

**Diagrama:**

```
ViewModel normal:        sobrevive rotación,        NO sobrevive muerte de proceso
ViewModel + SavedStateHandle: sobrevive rotación,   SÍ sobrevive muerte de proceso (para los valores guardados en él)
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una pantalla que sobreviva a rotación de pantalla sin perder estado, usando `ViewModel`.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Imprimir logs en cada callback del ciclo de vida | Ver Tema 1 | Observa el orden al rotar |
| 2 | Confirmar que un contador simple se pierde al rotar | Ver Tema 1 | Estado en `remember` simple |
| 3 | Mover el contador a un `ViewModel` | Ver Tema 2 | Confirma que sobrevive a rotación |
| 4 | Usar `SavedStateHandle` para el mismo valor | Ver Tema 3 | Sobrevive incluso a muerte de proceso |
| 5 | Identificar el callback correcto para liberar un recurso costoso | Ver Tema 1 | Ej. una cámara: `onResume`/`onPause` |

**Verificación:** el laboratorio se considera exitoso si el contador movido al `ViewModel` conserva su valor tras rotar la pantalla, y si, al simular la muerte del proceso (con la opción de desarrollador correspondiente), el valor guardado en `SavedStateHandle` se restaura correctamente al reabrir la app.

**Errores comunes y soluciones**

- **Guardar estado de UI directamente en la Activity o en `remember` simple sin `ViewModel`.** Se pierde al rotar; muévelo al `ViewModel`.
- **Asumir que `ViewModel` sobrevive a la muerte del proceso igual que a la rotación.** No es así; usa `SavedStateHandle` para ese escenario más agresivo.
- **Iniciar recursos costosos (cámara, sensores) en `onCreate` en vez de `onResume`.** Deja el recurso activo innecesariamente en background.

---
