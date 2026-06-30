## El framework generado para iOS

```kotlin
// build.gradle.kts
kotlin {
    listOf(iosX64(), iosArm64(), iosSimulatorArm64()).forEach {
        it.binaries.framework { baseName = "Shared" }
    }
}
```

Compilar el módulo `shared` para iOS genera un `Shared.framework` que Xcode puede importar como cualquier framework nativo.

## Mapeo de tipos

| Kotlin | Swift |
|---|---|
| `String` | `String` |
| `Int`, `Long` | `Int32`, `Int64` |
| `data class` | `class` con propiedades equivalentes |
| `sealed class` | jerarquía de clases, manejable con `switch` |

```swift
import Shared

let usuario = SharedUsuario(nombre: "Ana", edad: 28)
```

## Coroutines desde Swift

```swift
sharedRepository.obtenerTareas { tareas, error in
    if let tareas = tareas { mostrar(tareas) }
}
```

Kotlin/Native expone las funciones `suspend` a Swift como funciones con callback (o, con las librerías más recientes, directamente como `async/await` nativo de Swift).

## CocoaPods vs Swift Package Manager

CocoaPods fue históricamente la forma estándar de distribuir el framework KMP a un proyecto Xcode; Swift Package Manager (SPM) es la alternativa moderna recomendada por Apple, con mejor integración nativa en Xcode.
