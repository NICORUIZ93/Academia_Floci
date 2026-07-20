# Módulo 8: Interoperabilidad con iOS


## Aprende construyendo

### Tema 1: El framework generado para iOS

**Conceptos clave:** compilación a binario nativo, importable como cualquier framework nativo.

`kotlin { listOf(iosX64(), iosArm64(), iosSimulatorArm64()).forEach { it.binaries.framework { baseName = "Shared" } } }` configura Kotlin/Native (el compilador de Kotlin específico para producir binarios nativos, no bytecode JVM) para compilar el módulo compartido hacia un framework `.framework` completamente nativo para iOS, importable directamente en un proyecto Xcode exactamente de la misma forma en que se importaría cualquier otro framework de terceros escrito originalmente en Objective-C o Swift, sin que el desarrollador iOS necesite ningún conocimiento especial sobre que ese framework en realidad se originó como código Kotlin compilado.

Este proceso de compilación produce un binario real y nativo (no una capa de interpretación ni un puente de comunicación entre runtimes separados), lo que significa que las llamadas entre código Swift y el framework Kotlin compilado tienen un overhead de rendimiento mínimo, comparable al de llamar a cualquier otro framework nativo genuino, en vez de atravesar una capa de traducción entre dos entornos de ejecución completamente distintos como ocurriría con soluciones de interoperabilidad basadas en puentes de comunicación entre procesos separados.

**Analogía:** el framework generado por Kotlin/Native es como un componente fabricado en una fábrica extranjera pero completamente terminado y empaquetado según el estándar local exacto, de modo que se instala e integra sin ninguna adaptación especial, como si hubiera sido fabricado localmente desde el principio.

**¿Por qué es importante?** Kotlin/Native compila el módulo compartido a un binario nativo real, importable en Xcode como cualquier otro framework, con overhead de rendimiento mínimo en las llamadas entre Swift y Kotlin.

**Casos de uso reales:**
- Un equipo iOS que integra el módulo `Shared` en su proyecto Xcode existente sin cambiar su flujo de trabajo habitual.
- Publicar el framework como dependencia interna reutilizable entre varias apps iOS de la misma empresa.
- Medir el impacto en tamaño de binario del framework generado antes de decidir cuánta lógica mover a `commonMain`.

**Código del ejemplo:**

```kotlin
// build.gradle.kts
kotlin {
    listOf(iosX64(), iosArm64(), iosSimulatorArm64()).forEach {
        it.binaries.framework { baseName = "Shared" }
    }
}
```

### Tema 2: Mapeo de tipos Kotlin ↔ Swift

**Conceptos clave:** correspondencia directa de tipos básicos, sealed class como jerarquía manejable con switch.

Los tipos básicos de Kotlin se mapean directamente a sus equivalentes naturales en Swift (`String` a `String`, `Int`/`Long` a `Int32`/`Int64`), y una `data class` de Kotlin se expone hacia Swift como una clase con propiedades equivalentes accesibles de forma natural (`import Shared; let usuario = SharedUsuario(nombre: "Ana", edad: 28)`, con el prefijo `Shared` en el nombre reflejando el `baseName` configurado en el framework, Tema 1). Una `sealed class` de Kotlin (Módulo 1) se expone hacia Swift como una jerarquía de clases regular, manejable con un `switch` de Swift de forma conceptualmente análoga al `when` exhaustivo de Kotlin, aunque Swift no verifica automáticamente la exhaustividad completa contra el conjunto cerrado original de Kotlin de la misma forma estricta en que Kotlin sí la verifica, dado que desde la perspectiva de Swift esa jerarquía es simplemente una jerarquía de clases regular sin el conocimiento especial de que proviene de una sealed class con un conjunto cerrado garantizado.

**Analogía:** el mapeo de tipos es como una traducción directa palabra por palabra para conceptos simples (números, texto), pero que requiere una adaptación estructural más cuidadosa para conceptos más elaborados (una sealed class), donde el idioma de destino (Swift) representa la misma idea con una estructura gramatical distinta que se comporta de forma similar pero no idéntica en cuanto a garantías del compilador.

**¿Por qué es importante?** Los tipos básicos se mapean directamente entre Kotlin y Swift; las sealed classes se exponen como jerarquías de clases regulares manejables con switch, aunque sin la misma garantía estricta de exhaustividad verificada que Kotlin ofrece nativamente.

**Casos de uso reales:**
- Consumir `Tarea` (Módulo 4) directamente desde una vista SwiftUI (Módulo 1 del track iOS) como si fuera un struct nativo de Swift.
- Manejar `Resultado<T>` (Módulo 5) con un `switch` en Swift, replicando el mismo manejo exhaustivo que `when` hace en Kotlin.
- Documentar explícitamente en el equipo qué sealed classes existen, ya que Swift no avisará si falta una rama en el `switch`.

**Diagrama:**

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

### Tema 3: Coroutines desde Swift, y distribución del framework

**Conceptos clave:** funciones suspend expuestas como callback, CocoaPods frente a SPM.

`sharedRepository.obtenerTareas { tareas, error in if let tareas = tareas { mostrar(tareas) } }` demuestra cómo Kotlin/Native expone una función `suspend` (Módulo 2) hacia Swift: dado que Swift, en versiones anteriores a su propio soporte nativo de `async`/`await`, no tenía un concepto directamente equivalente a las funciones suspend de Kotlin, Kotlin/Native genera automáticamente una versión con callback tradicional para cada función suspend expuesta, cambiando la forma en que se invoca (con un cierre/callback que recibe el resultado o el error) en vez de la sintaxis lineal `await` que el mismo código tendría en Kotlin; con librerías más recientes y versiones más nuevas de Swift, esta interoperabilidad puede exponerse directamente como `async`/`await` nativo de Swift, acercando considerablemente la experiencia de uso entre ambos lenguajes.

CocoaPods fue históricamente la forma estándar y más común de distribuir el framework KMP compilado hacia un proyecto Xcode consumidor, integrándose con el sistema de gestión de dependencias específico de CocoaPods; Swift Package Manager (SPM) es la alternativa moderna recomendada actualmente por Apple, con integración nativa directamente dentro de Xcode sin necesidad de herramientas externas adicionales de gestión de dependencias, siendo generalmente la opción preferida para proyectos nuevos, aunque CocoaPods sigue siendo relevante para proyectos existentes que ya lo usan extensamente para otras dependencias.

**Analogía:** exponer una función suspend como callback hacia Swift es como traducir una instrucción que originalmente decía "espera aquí hasta que el resultado esté listo" hacia una instrucción equivalente que dice "cuando el resultado esté listo, ejecuta esta acción específica", logrando el mismo efecto final pero expresado con una sintaxis distinta según las capacidades nativas del idioma de destino.

**¿Por qué es importante?** Kotlin/Native expone funciones suspend hacia Swift mediante callbacks (o `async`/`await` nativo con librerías más recientes); SPM es la alternativa moderna recomendada por Apple para distribuir el framework, con mejor integración nativa en Xcode que CocoaPods.

**Casos de uso reales:**
- Invocar `obtenerTareasPendientesUseCase` (Módulo 4) desde una vista SwiftUI usando `async`/`await` nativo de Swift.
- Migrar la distribución del framework compartido de CocoaPods a SPM en un proyecto iOS existente.
- Envolver el callback generado por Kotlin/Native en una función `async` propia de Swift para integrarlo naturalmente con `Task {}`.

**Código del ejemplo:**

```swift
sharedRepository.obtenerTareas { tareas, error in
    if let tareas = tareas { mostrar(tareas) }
}
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una app SwiftUI que consume el módulo compartido KMP a través del framework generado.

**Requisitos previos:** Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Generar el `.framework` y agregarlo a un proyecto Xcode | Ver Tema 1 | Verifica la importación |
| 2 | Llamar a una función Kotlin desde Swift | Ver Tema 2 | Verifica el tipo resultante |
| 3 | Llamar a una función suspend desde Swift | Ver Tema 3 | Con su callback/async equivalente |
| 4 | Configurar la distribución con Swift Package Manager | Ver Tema 3 | En vez de CocoaPods |

**Verificación:** el laboratorio se considera exitoso si la app SwiftUI consume correctamente los datos y la lógica del módulo compartido, incluyendo al menos una función suspend invocada correctamente desde Swift.

**Errores comunes y soluciones**

- **Asumir que Swift maneja las funciones suspend igual que Kotlin de forma nativa sin ninguna adaptación.** Verifica la forma específica (callback o async/await) según la versión de las librerías usadas.
- **Usar CocoaPods por defecto sin evaluar Swift Package Manager.** SPM es la alternativa moderna recomendada con mejor integración nativa.
- **Esperar verificación de exhaustividad idéntica en Swift para una sealed class de Kotlin.** Swift la trata como una jerarquía de clases regular, sin esa garantía estricta.

---
