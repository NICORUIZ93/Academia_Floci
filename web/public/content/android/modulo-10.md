## Material 3

```kotlin
MaterialTheme(
    colorScheme = lightColorScheme(primary = Color(0xFF3DDC84)),
    typography = Typography(),
) { contenido() }
```

## Detectar recomposición innecesaria

El Layout Inspector de Android Studio puede resaltar qué composables se recomponen y cuántas veces. Una causa común: pasar una lambda nueva en cada render (`onClick = { accion() }`) en vez de una referencia estable, lo que invalida la comparación de "skippability" de Compose.

```kotlin
// Genera una nueva lambda en cada recomposición del padre
Boton(onClick = { viewModel.accion() })

// Más estable: usa una referencia de método si es posible
Boton(onClick = viewModel::accion)
```

## Baseline Profiles

```kotlin
// generado con la herramienta de profiling, incluido en el build
```

Un Baseline Profile precompila las rutas de código más usadas al inicio de la app (AOT en vez de interpretación/JIT en el primer uso) — reduce el tiempo de arranque y los "jank" iniciales perceptibles por el usuario.

## Accesibilidad

```kotlin
Icon(Icons.Default.Delete, contentDescription = "Eliminar tarea") // sin esto, TalkBack no puede describir el ícono
```

Probar la app con TalkBack activado revela rápidamente qué elementos interactivos quedaron sin descripción accesible.
