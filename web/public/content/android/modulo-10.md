# Módulo 10: Performance, Material 3 y accesibilidad


## Aprende construyendo

### Tema 1: Detectar y corregir recomposición innecesaria

**Conceptos clave:** estabilidad de parámetros, skippability de un composable.

El Layout Inspector de Android Studio puede resaltar visualmente qué composables se recomponen y con qué frecuencia durante una sesión de uso normal de la app; una causa extremadamente común de recomposición innecesaria es pasar una lambda nueva en cada recomposición del padre (`onClick = { accion() }`), dado que Compose compara los parámetros de un composable para decidir si puede "saltarse" (skip) una recomposición innecesaria, y una lambda recreada en cada llamada rompe esa comparación de igualdad, invalidando la optimización de "skippability" incluso si el resultado visual sería idéntico.

```kotlin
// Genera una nueva lambda en cada recomposición del padre
Boton(onClick = { viewModel.accion() })

// Más estable: usa una referencia de método si es posible
Boton(onClick = viewModel::accion)
```

Anotar una clase de datos con `@Stable` o `@Immutable` le comunica explícitamente al compilador de Compose que esa clase cumple ciertas garantías (sus propiedades no cambian tras la construcción, o cambian de forma que Compose puede observar), permitiendo optimizaciones de recomposición más agresivas que las que Compose aplicaría por defecto ante un tipo cuya estabilidad no puede inferir automáticamente; `derivedStateOf` evita recalcular un valor derivado en cada recomposición cuando ese valor no cambió realmente, aun si alguno de sus inputs cambió de referencia pero no de valor efectivo.

**Analogía:** una lambda recreada en cada recomposición es como entregar una llave físicamente distinta cada vez aunque abra exactamente la misma puerta: el sistema de seguridad (Compose) no puede confirmar que es "la misma llave de antes" solo mirando su identidad física, así que trata cada entrega como potencialmente nueva y repite la verificación completa innecesariamente.

**¿Por qué es importante?** Identificar y corregir causas de recomposición innecesaria (como lambdas recreadas) mejora directamente el rendimiento percibido de la app, especialmente en pantallas con scroll o listas largas donde recomposiciones excesivas son más perceptibles.

**Casos de uso reales:**
- Diagnosticar por qué una `LazyColumn` de cientos de ítems tiene scroll con tirones (jank) usando el Layout Inspector.
- Marcar un modelo de UI con `@Immutable` para que Compose optimice agresivamente una lista que rara vez cambia.
- Reemplazar lambdas inline por referencias de método en botones dentro de listas largas y medir la mejora real.

**Código del ejemplo:**

```kotlin
Boton(onClick = { viewModel.accion() })   // nueva lambda cada recomposición
Boton(onClick = viewModel::accion)          // referencia estable, más skippable
```

### Tema 2: Baseline Profiles y ciclo de efectos

**Conceptos clave:** precompilación de rutas críticas, sincronización entre el mundo de Compose y el imperativo.

Un Baseline Profile precompila ahead-of-time (AOT) las rutas de código más usadas al inicio de la app, en vez de dejar que el sistema las interprete o compile just-in-time (JIT) en el primer uso real por parte de cada usuario; esto reduce el tiempo de arranque percibido y el "jank" (tirones visuales) inicial, especialmente notorio en las primeras interacciones tras instalar la app, cuando el sistema todavía no ha tenido oportunidad de optimizar esas rutas de código mediante el compilador JIT normal.

`SideEffect` ejecuta un bloque de código en cada recomposición exitosa, útil para sincronizar estado de Compose hacia un sistema externo no consciente de Compose; `DisposableEffect` ejecuta una acción de limpieza cuando el composable sale de composición (análogo a un `onCleanup` en un framework reactivo), apropiado para liberar listeners o recursos registrados manualmente; `rememberUpdatedState` captura la referencia más reciente de un valor dentro de un efecto de larga duración sin reiniciar ese efecto cada vez que el valor cambia, resolviendo el problema de "closures capturando un valor obsoleto" dentro de un `LaunchedEffect` con clave estable.

**Analogía:** un Baseline Profile es como precalentar un horno antes de que lleguen los primeros clientes de un restaurante, en vez de esperar a que el primer pedido dispare el proceso de calentamiento desde frío; `DisposableEffect` es como la instrucción de apagar las luces y cerrar la puerta al final del turno, ejecutada automáticamente sin que el empleado deba recordarlo manualmente cada vez.

**¿Por qué es importante?** Un Baseline Profile mejora directamente el tiempo de arranque percibido por el usuario; los efectos (`SideEffect`, `DisposableEffect`, `rememberUpdatedState`) son las herramientas correctas para sincronizar Compose con sistemas externos sin fugas de recursos ni closures obsoletos.

**Casos de uso reales:**
- Generar un Baseline Profile para acelerar el arranque en frío de la app tras una instalación nueva desde Play Store.
- Usar `DisposableEffect` para registrar y desregistrar un listener de sensores (acelerómetro, GPS) sin fugas de memoria.
- Usar `rememberUpdatedState` en un `LaunchedEffect` de larga duración que necesita el callback más reciente sin reiniciarse.

**Diagrama:**

```
Sin Baseline Profile: interpretación/JIT en el primer uso → arranque más lento
Con Baseline Profile: rutas críticas precompiladas AOT → arranque más rápido
```

### Tema 3: Accesibilidad e interop con Views

**Conceptos clave:** la app debe ser usable con tecnologías asistivas, no solo visualmente atractiva.

```kotlin
Icon(Icons.Default.Delete, contentDescription = "Eliminar tarea") // sin esto, TalkBack no puede describir el ícono
```

Un elemento interactivo sin texto visible (un ícono usado como botón) requiere `contentDescription` explícito para que TalkBack (el lector de pantalla de Android) pueda comunicarle a un usuario con discapacidad visual qué hace ese elemento antes de interactuar con él; probar la app activamente con TalkBack habilitado revela rápidamente qué elementos quedaron sin descripción accesible, una verificación que raramente se detecta simplemente mirando la pantalla de forma visual sin usar la herramienta de accesibilidad real.

`AndroidView` permite embeber una View clásica del sistema de Views tradicional (no Compose) dentro de un árbol de Compose, útil durante una migración incremental o para integrar una librería de terceros que aún no ofrece una versión Compose nativa; `ComposeView` hace lo inverso, embebiendo contenido Compose dentro de una jerarquía de Views clásica, el patrón típico durante una migración progresiva de una app existente hacia Compose sin reescribir toda la UI de una sola vez.

**Analogía:** la accesibilidad es como instalar rampas y señalización en braille en un edificio público: no es un adorno opcional sino un requisito para que el edificio sea genuinamente utilizable por todos sus visitantes potenciales, no solo por quienes no tienen ninguna limitación física.

**¿Por qué es importante?** La accesibilidad no es "opcional" sino parte del estándar de una app profesional, dado que excluye a usuarios reales con discapacidades visuales u otras si se omite; `AndroidView`/`ComposeView` permiten una migración incremental entre los dos sistemas de UI sin reescribir la app completa de golpe.

**Casos de uso reales:**
- Auditar una app con TalkBack activado antes de un release y corregir íconos sin `contentDescription`.
- Embeber un `MapView` clásico de Google Maps (sin versión Compose nativa) dentro de una pantalla Compose con `AndroidView`.
- Migrar progresivamente una app grande basada en Views clásicas a Compose, pantalla por pantalla, sin un rewrite completo.

**Diagrama:**

```
AndroidView   → embebe una View clásica DENTRO de Compose
ComposeView   → embebe Compose DENTRO de una jerarquía de Views clásica (típico en migraciones)
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** realizar una auditoría de performance de una pantalla con el Layout Inspector y aplicar al menos una mejora.

**Requisitos previos:** Módulo 9 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Aplicar un `MaterialTheme` 3 completo | Ver Tema 1 | Colores, tipografía, formas |
| 2 | Detectar recomposiciones innecesarias | Layout Inspector | En una pantalla con scroll |
| 3 | Corregir al menos una causa | Ver Tema 1 | Ej. lambda recreada en cada render |
| 4 | Agregar `contentDescription` a íconos interactivos | Ver Tema 3 | Soporte de TalkBack |
| 5 | Generar un Baseline Profile | Ver Tema 2 | Documenta qué optimiza |

**Verificación:** el laboratorio se considera exitoso si el Layout Inspector muestra una reducción medible en recomposiciones tras la corrección aplicada, y si TalkBack describe correctamente todos los elementos interactivos sin texto visible.

**Errores comunes y soluciones**

- **Pasar lambdas nuevas en cada recomposición sin necesidad.** Usa referencias de método estables cuando sea posible.
- **Omitir `contentDescription` en íconos interactivos.** Sin él, TalkBack no puede describir el elemento al usuario.
- **Asumir que la accesibilidad es un paso final opcional.** Intégrala desde el desarrollo inicial, no como una auditoría de último momento.

---
