# Módulo 3: Arquitectura de un proyecto KMP

## Sílabo

**Objetivo general**

Entender cómo un mismo código Kotlin termina ejecutándose en Android e iOS, dominando source sets, el mecanismo `expect`/`actual`, y la configuración de Gradle multiplataforma.

**Objetivos específicos**

1. Explorar la estructura de carpetas de un proyecto KMP (`commonMain`, `androidMain`, `iosMain`).
2. Declarar una función `expect` en código común e implementarla como `actual` por plataforma.
3. Configurar Gradle multiplataforma con los targets necesarios.
4. Explicar por qué el código en `commonMain` no puede usar APIs específicas de plataforma directamente.

**Contenido**

- Source sets: `commonMain`, `androidMain`, `iosMain`.
- `expect`/`actual`: declarar e implementar por plataforma.
- Gradle multiplataforma.
- Targets disponibles (JVM, Native, JS).

**Evaluación**

Proyecto KMP con un módulo compartido que compila para Android e iOS, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Source sets

**Conceptos clave:** código compartido frente a específico de plataforma, misma jerarquía de compilación.

Un proyecto KMP organiza su código en source sets distintos según su alcance de compilación: `commonMain` contiene código compilado para absolutamente todas las plataformas de destino configuradas, sin ninguna dependencia de APIs específicas de una plataforma particular; `androidMain` e `iosMain` contienen código que se compila únicamente para su plataforma correspondiente, pudiendo usar libremente APIs específicas de esa plataforma (clases de Android SDK en `androidMain`, o Foundation/UIKit de iOS en `iosMain`) que simplemente no existen ni tienen sentido en las demás plataformas de destino.

Esta separación estructural refleja directamente el propósito central de KMP: maximizar la cantidad de código que vive en `commonMain` (lógica de negocio, modelos de dominio, casos de uso, que no tienen ninguna razón real para diferir entre plataformas) mientras se aísla en los source sets específicos de plataforma únicamente el código que genuinamente necesita interactuar con APIs nativas particulares de cada sistema operativo (acceso a sensores, notificaciones push nativas, ciertos widgets de UI del sistema).

**Analogía:** los source sets son como plantas de un edificio con distinto alcance de acceso: la planta baja (`commonMain`) es accesible y compartida por todos los visitantes sin importar a qué departamento específico se dirijan después; los pisos superiores específicos (`androidMain`, `iosMain`) contienen recursos particulares accesibles únicamente para quienes efectivamente necesitan esos recursos específicos de ese departamento particular.

**¿Por qué es importante?** Maximizar el código en `commonMain` y aislar en source sets específicos solo lo que genuinamente necesita APIs de plataforma particular es el mecanismo estructural central que permite a KMP compartir la mayor cantidad posible de lógica entre plataformas.

**Casos de uso reales:**
- Lógica de validación de formularios y reglas de negocio compartidas entre la app Android y la app iOS de una misma empresa.
- Modelos de dominio y llamadas de red en `commonMain`, mientras las notificaciones push nativas viven en `androidMain`/`iosMain`.
- Equipos que migran progresivamente lógica duplicada de dos apps nativas separadas hacia un único `commonMain`.

**Diagrama:**

```
shared/src/
  commonMain/   ← código compartido por TODAS las plataformas
  androidMain/   ← código específico de Android
  iosMain/        ← código específico de iOS
```

### Tema 2: expect/actual

**Conceptos clave:** declarar el contrato en común, implementarlo por plataforma.

`expect fun nombrePlataforma(): String` (declarado en `commonMain`) establece un contrato: código en `commonMain` puede llamar a esta función confiando en que existe una implementación concreta, sin necesitar saber cómo se implementa específicamente en cada plataforma; `actual fun nombrePlataforma(): String = "Android ${android.os.Build.VERSION.SDK_INT}"` (en `androidMain`) y `actual fun nombrePlataforma(): String = UIDevice.currentDevice.systemName()` (en `iosMain`) proporcionan la implementación real y específica para cada plataforma respectiva, cada una usando libremente APIs propias de su plataforma que no estarían disponibles en `commonMain`.

Este mecanismo resuelve un problema que una simple interfaz común no resolvería igual de bien: una interfaz normal requeriría que alguna capa superior decida explícitamente, en tiempo de ejecución o mediante inyección de dependencias, qué implementación concreta usar; `expect`/`actual` es resuelto directamente por el compilador de Kotlin en tiempo de compilación específico para cada target, sin ninguna ceremonia adicional de selección de implementación en tiempo de ejecución — al compilar para Android, el compilador automáticamente vincula cada declaración `expect` con su `actual` correspondiente de `androidMain`, y análogamente para iOS, de forma transparente y sin overhead adicional de indirección en tiempo de ejecución.

**Analogía:** `expect`/`actual` es como una especificación técnica universal de un enchufe eléctrico que cada país implementa físicamente según su propio estándar local, sin que el aparato que usa ese enchufe (el código en `commonMain`) necesite saber ni importarle los detalles específicos de la implementación eléctrica de cada país particular, simplemente confía en que el enchufe correcto para su ubicación actual estará disponible.

**¿Por qué es importante?** `expect`/`actual` resuelve la vinculación entre contrato e implementación específica de plataforma en tiempo de compilación, sin la ceremonia de selección en tiempo de ejecución que una interfaz común con inyección de dependencias requeriría.

**Casos de uso reales:**
- Obtener un identificador único de dispositivo (`Settings.Secure.ANDROID_ID` vs `UIDevice.identifierForVendor`) con una sola función común.
- Acceder al almacenamiento seguro de credenciales (Keystore en Android, Keychain en iOS) tras una API `expect` común.
- Formatear fechas usando la API nativa de cada plataforma sin que `commonMain` conozca los detalles de ninguna de las dos.

**Código del ejemplo:**

```kotlin
// commonMain
expect fun nombrePlataforma(): String

// androidMain
actual fun nombrePlataforma(): String = "Android ${android.os.Build.VERSION.SDK_INT}"

// iosMain
actual fun nombrePlataforma(): String = UIDevice.currentDevice.systemName()
```

### Tema 3: Gradle multiplataforma y targets disponibles

**Conceptos clave:** configuración de targets, alcance más allá de Android/iOS.

`kotlin { androidTarget(); iosX64(); iosArm64(); iosSimulatorArm64(); sourceSets { commonMain.dependencies { implementation("io.ktor:ktor-client-core:2.3.0") } } }` configura explícitamente qué targets de compilación están habilitados para el proyecto (Android, y las tres variantes de iOS necesarias para cubrir dispositivos físicos de distintas arquitecturas y el simulador), además de declarar dependencias específicamente en el bloque `commonMain.dependencies`, garantizando que esa dependencia (Ktor, Módulo 5) esté disponible para todo el código compartido, no solo para una plataforma particular.

KMP no se limita conceptualmente a la combinación Android/iOS: también puede compilar a JVM (útil para compartir lógica con un backend Spring Boot, por ejemplo), a JS/WebAssembly (para ejecutarse en un navegador web), y a Native para sistemas de escritorio (Linux, Windows, macOS), lo que significa que, en teoría, la misma lógica de negocio escrita una única vez en `commonMain` podría alimentar simultáneamente un backend, una aplicación web, y dos aplicaciones móviles nativas, aunque en la práctica cada proyecto real elige específicamente qué combinación de targets tiene sentido según sus necesidades concretas, no necesariamente todos los targets disponibles simultáneamente.

**Analogía:** configurar los targets de Gradle es como decidir para qué mercados específicos se fabricará un producto (definiendo qué adaptaciones regionales concretas son necesarias), mientras que el diseño central del producto (el código en `commonMain`) permanece el mismo sin importar cuántos mercados distintos finalmente se decida atender.

**¿Por qué es importante?** KMP no se limita a Android/iOS; puede compilar a JVM, JS/Wasm y Native para escritorio, permitiendo en principio que la misma lógica de negocio alimente backend, web y múltiples aplicaciones móviles nativas desde un único código fuente compartido.

**Casos de uso reales:**
- Compartir la validación de reglas de negocio entre el backend Spring Boot (target JVM) y las apps móviles.
- Añadir un target Desktop (Compose Multiplatform) para una versión de escritorio de la misma app sin reescribir la lógica.
- Elegir deliberadamente NO compilar a todos los targets disponibles cuando el proyecto real solo necesita Android + iOS.

**Código del ejemplo:**

```kotlin
kotlin {
    androidTarget()
    iosX64(); iosArm64(); iosSimulatorArm64()
    sourceSets {
        commonMain.dependencies {
            implementation("io.ktor:ktor-client-core:2.3.0")
        }
    }
}
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** construir un proyecto KMP con un módulo compartido que compila para Android e iOS.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un proyecto KMP desde la plantilla oficial | — | Explora `commonMain`/`androidMain`/`iosMain` |
| 2 | Escribir una función `expect` en `commonMain` | Ver Tema 2 | Que dependa de una implementación por plataforma |
| 3 | Implementar `actual` en `androidMain` e `iosMain` | Ver Tema 2 | Con código distinto en cada una |
| 4 | Compilar para el target Android | — | Verifica el `.aar` generado |
| 5 | Compilar para el target iOS | — | Verifica el `.framework` generado |

**Verificación:** el laboratorio se considera exitoso si el proyecto compila correctamente para ambos targets, y si la función `expect`/`actual` devuelve el valor correcto y específico de cada plataforma al ejecutarse en cada una.

**Errores comunes y soluciones**

- **Intentar usar una API específica de Android directamente en `commonMain`.** Ese código no compilaría para iOS; usa `expect`/`actual` para aislar lo específico de plataforma.
- **Olvidar declarar todos los targets de iOS necesarios (x64, arm64, simulador).** Cada uno cubre un caso distinto (dispositivo físico de arquitecturas distintas, simulador).
- **Declarar una dependencia solo en un source set específico cuando se necesita en `commonMain`.** Verifica en qué bloque de `sourceSets` corresponde declarar cada dependencia según su alcance.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- JetBrains, documentación oficial de *Kotlin Multiplatform* y Kotlin Coroutines.
- Google, *Android Developers Documentation*; Apple, *Developer Documentation*.
- Kotlin Foundation, especificación y pautas de compatibilidad de Kotlin.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Los source sets (`commonMain`, `androidMain`, `iosMain`) separan código compartido de código específico de plataforma.
- `expect`/`actual` vincula un contrato declarado en común con su implementación específica de plataforma en tiempo de compilación.
- Gradle multiplataforma configura explícitamente qué targets de compilación están habilitados.
- KMP no se limita a Android/iOS; también compila a JVM, JS/Wasm y Native de escritorio.

**Conceptos aprendidos**

- Source sets de un proyecto KMP.
- `expect`/`actual`.
- Configuración de Gradle multiplataforma.
- Targets disponibles más allá de Android/iOS.

**Próximos pasos**

En el Módulo 4 aprenderás lógica de negocio compartida: modelos de dominio, casos de uso, repositorios con interfaces comunes, e inyección de dependencias con Koin.

**Recursos adicionales**

- Documentación oficial de Kotlin Multiplatform (kotlinlang.org/docs/multiplatform.html).
