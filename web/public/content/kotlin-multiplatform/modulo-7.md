## Compose Multiplatform vs Jetpack Compose

Jetpack Compose es la UI declarativa de Android. **Compose Multiplatform** extiende el mismo modelo de programación (composables, estado, recomposición) a iOS, desktop y web — el mismo código de UI, no solo la lógica de negocio, se ejecuta en múltiples plataformas.

```kotlin
@Composable
fun PantallaTareas(tareas: List<Tarea>) {
    LazyColumn {
        items(tareas) { tarea -> Text(tarea.titulo) }
    }
}
```

Este composable, escrito una sola vez en `commonMain`, renderiza en Android usando el motor nativo de Compose, y en iOS usando Skia (el mismo motor gráfico que usa Compose en Android, embebido).

## Theming compartido

```kotlin
@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = esquemaColoresCompartido, content = content)
}
```

## Navegación multiplataforma

Librerías como Voyager o el Navigation Compose multiplataforma permiten definir el grafo de navegación una sola vez en código compartido.

## Limitaciones en iOS

Compose Multiplatform en iOS es más reciente que en Android — algunas integraciones nativas (notificaciones push, ciertos widgets del sistema) todavía requieren puentes específicos de plataforma o SwiftUI nativo para esas partes puntuales.
