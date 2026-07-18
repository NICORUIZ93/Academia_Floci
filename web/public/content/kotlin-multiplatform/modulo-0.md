# Módulo 0: Fundamentos de Kotlin

## Sílabo

**Objetivo general**

Dominar la sintaxis concisa y null-safe de Kotlin como base reutilizable en Android, backend y desarrollo multiplataforma.

**Objetivos específicos**

1. Declarar variables con `val`/`var` y entender cuándo el compilador exige cada una.
2. Manejar valores nulos explícitamente con `?`, `!!` y el operador Elvis.
3. Usar `data class` para modelos concisos con igualdad estructural.
4. Escribir funciones de extensión.
5. Usar `when` como expresión que devuelve un valor.

**Contenido**

- `val`/`var`, null safety (`?`, `!!`, `?:`).
- `data class` y sintaxis concisa.
- Funciones de extensión.
- `when` como expresión.

**Evaluación**

Programa de consola sin un solo `NullPointerException` posible (null safety real), más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Programa de consola sin un solo `NullPointerException` posible (null safety real), más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
java --version
./gradlew --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
# Crea el proyecto con el asistente oficial de Kotlin Multiplatform
cd academia-labs/kmp-app
git init
./gradlew tasks
```

Trabaja dentro de `academia-labs/kmp-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/kmp-app/
├─ shared/src/commonMain/kotlin/
│  └─ module-0/
├─ tests/
├─ docs/decisions/
├─ evidence/module-0/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Null safety real | `shared/src/commonMain/kotlin/module-0/topic-1-null-safety-real.kt` | prueba + salida observable |
| 2. data class y funciones de extensión | `shared/src/commonMain/kotlin/module-0/topic-2-data-class-y-funciones-de-extension.kt` | prueba + salida observable |
| 3. when como expresión | `shared/src/commonMain/kotlin/module-0/topic-3-when-como-expresion.kt` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/kmp-app`:

```bash
./gradlew :shared:allTests
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Programa de consola sin un solo `NullPointerException` posible (null safety real), más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Introduce un dato nulo o caso específico de plataforma; commonTest debe hacerlo visible. Guarda en `evidence/module-0/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Fundamentos de Kotlin** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Antes de comenzar: entorno Kotlin Multiplatform

Kotlin Multiplatform combina herramientas de varias plataformas. Para empezar instala **JDK 21**, Git e **IntelliJ IDEA** con el plugin Kotlin. Para Android necesitarás Android Studio; para compilar el destino iOS necesitarás obligatoriamente un Mac con Xcode.

| Sistema | Qué puedes desarrollar | Instalación mínima |
|---|---|---|
| Windows | commonMain, JVM, Android y Desktop | JDK 21, IntelliJ/Android Studio, Git |
| macOS | Todos los destinos, incluido iOS | JDK 21, Xcode, Android Studio, Git |
| Linux | commonMain, JVM, Android y Desktop | OpenJDK 21, IntelliJ/Android Studio, Git |

Verifica `java --version` y `git --version`. En macOS abre Xcode una vez y acepta su licencia; comprueba `xcodebuild -version`. Crea un proyecto desde el asistente **Kotlin Multiplatform** de Android Studio/IntelliJ y ejecuta primero el destino Desktop o Android. Usa siempre el Gradle Wrapper incluido:

```bash
./gradlew tasks          # macOS/Linux
.\gradlew.bat tasks      # Windows
```

Si Gradle no encuentra Java, configura `JAVA_HOME` hacia el JDK, no hacia una JRE. No intentes resolver problemas de lógica común y de toolchain iOS al mismo tiempo: haz funcionar primero `commonTest`, después cada plataforma por separado.

## Contenido teórico

### Tema 1: Null safety real

**Conceptos clave:** tipos nullable distintos de los no-nullable, verificación en compilación.

Kotlin distingue en su sistema de tipos entre `String` (que nunca puede contener `null`, garantizado por el compilador) y `String?` (explícitamente nullable, indicando que la variable puede legítimamente no tener valor), una distinción que el compilador impone estrictamente: no es posible asignar un valor potencialmente nulo a una variable de tipo no-nullable sin manejar explícitamente esa posibilidad, y no es posible acceder directamente a un miembro de una variable nullable sin antes verificar o manejar el caso de que sea `null`, eliminando en tiempo de compilación toda una categoría de errores que en otros lenguajes (como Java sin anotaciones adicionales) solo se manifestarían como una excepción en tiempo de ejecución.

`apodo?.length` (safe call) devuelve `null` automáticamente si `apodo` es `null`, sin lanzar ninguna excepción; `apodo!!.length` (non-null assertion) fuerza el acceso directo, asumiendo bajo responsabilidad explícita del desarrollador que la variable efectivamente no es `null` en ese punto, lanzando una excepción si esa suposición resulta incorrecta (por lo que debe usarse con cautela, típicamente solo cuando existe una certeza real y verificable de que el valor no será nulo); `val largo = apodo?.length ?: 0` (operador Elvis) combina el safe call con un valor por defecto explícito para el caso `null`, una forma extremadamente común y idiomática de manejar valores potencialmente ausentes con un reemplazo razonable.

**Analogía:** el sistema de tipos nullable de Kotlin es como exigir una etiqueta explícita en cada paquete indicando si podría estar vacío o no, obligando a verificar esa etiqueta antes de abrir el paquete asumiendo que contiene algo; sin esa distinción, cualquier paquete podría estar vacío sin ninguna advertencia previa, descubriéndose la sorpresa solo al abrirlo.

**¿Por qué es importante?** El null safety de Kotlin elimina en tiempo de compilación una categoría completa de errores de referencia nula que en otros lenguajes solo se detectarían como una excepción en tiempo de ejecución, potencialmente en producción.

**Casos de uso reales:**
- Respuestas de API donde un campo opcional (`usuario.telefono: String?`) puede legítimamente no venir en el JSON.
- Resultados de búsqueda en una base de datos local (Room, SQLDelight) que pueden no encontrar ningún registro.
- Parámetros de configuración con valor por defecto vía operador Elvis (`puerto ?: 8080`) en vez de lanzar una excepción.

**Código del ejemplo:**

```kotlin
var nombre: String = "Ana"     // nunca puede ser null
var apodo: String? = null       // explícitamente nullable

apodo?.length                   // safe call: null si apodo es null, sin crashear
apodo!!.length                  // fuerza el acceso — lanza excepción si es null (úsalo con cuidado)
val largo = apodo?.length ?: 0  // operador Elvis: valor por defecto si es null
```

### Tema 2: data class y funciones de extensión

**Conceptos clave:** generación automática de igualdad estructural, agregar comportamiento sin herencia.

`data class Persona(val nombre: String, val edad: Int)` genera automáticamente, a partir de esta única declaración concisa, implementaciones de `equals()` (comparación por valor de todos los componentes, no por identidad de referencia), `hashCode()` (consistente con esa igualdad), `toString()` (una representación legible con todos los campos), y `copy()` (`ana.copy(edad = 29)`, produciendo una nueva instancia con los mismos valores excepto los explícitamente sobrescritos), el mismo conjunto de capacidades generadas automáticamente por los records de Java (Módulo 7 del track de Java), reflejando una convergencia de diseño entre ambos lenguajes hacia reducir el boilerplate de modelos de datos inmutables.

Las funciones de extensión (`fun String.esEmailValido(): Boolean = this.contains("@") && this.contains(".")`) permiten agregar nuevos métodos a una clase existente (incluso clases de la librería estándar, como `String`, sobre las que normalmente no se tendría control para modificar directamente) sin necesidad de heredar de ella ni de modificar su código fuente original, resueltas en realidad en tiempo de compilación como funciones estáticas que reciben el receptor como primer argumento implícito, ofreciendo la conveniencia sintáctica de un método miembro sin los inconvenientes de la herencia real.

**Analogía:** `data class` es como un formulario preimpreso con toda la lógica de comparación y copia ya incluida automáticamente, sin tener que redactarla manualmente cada vez; una función de extensión es como agregar una nueva capacidad a una herramienta ya fabricada sin tener que rediseñar la herramienta original desde cero, simplemente adjuntándole una nueva función adicional utilizable con la misma sintaxis natural.

**¿Por qué es importante?** `data class` elimina el boilerplate de modelos de datos inmutables; las funciones de extensión permiten agregar comportamiento a clases existentes (incluso de terceros) sin necesidad de herencia ni de modificar su código fuente.

**Casos de uso reales:**
- Modelos de dominio (`data class Tarea(...)`) que se comparan, copian y depuran (`toString`) constantemente en tests y logs.
- Funciones de extensión de validación (`String.esEmailValido()`) reutilizables en toda la app sin heredar de `String`.
- `copy()` para actualizar inmutablemente un solo campo de un estado de UI sin reconstruir el objeto completo a mano.

**Código del ejemplo:**

```kotlin
data class Persona(val nombre: String, val edad: Int)
val ana = Persona("Ana", 28)
val anaCumpleanos = ana.copy(edad = 29) // copia inmutable con un campo cambiado

fun String.esEmailValido(): Boolean = this.contains("@") && this.contains(".")
"ana@ejemplo.com".esEmailValido() // true
```

### Tema 3: when como expresión

**Conceptos clave:** devolver un valor directamente, reemplazo conciso de cadenas if/else if.

`val descripcion = when (edad) { in 0..12 -> "niño"; in 13..17 -> "adolescente"; else -> "adulto" }` usa `when` no como una simple estructura de control que ejecuta código sin devolver nada, sino como una expresión que directamente produce y devuelve un valor, asignable inmediatamente a una variable, eliminando la necesidad de declarar una variable mutable de antemano y asignarla condicionalmente dentro de cada rama de una cadena tradicional de `if`/`else if`, un patrón considerablemente más verboso e imperativo para expresar exactamente la misma decisión de selección entre múltiples alternativas.

Esta capacidad de `when` como expresión se combina naturalmente con sealed classes (Módulo 1) para lograr verificación de exhaustividad por el compilador, de forma análoga al switch exhaustivo sobre sealed interfaces estudiado en el Módulo 7 del track de Java: cuando el `when` opera sobre un tipo con un conjunto cerrado y conocido de posibilidades, el compilador puede verificar que todas esas posibilidades están cubiertas, sin necesidad de una rama `else` como respaldo genérico.

**Analogía:** `when` como expresión es como un clasificador automático que directamente entrega la etiqueta correspondiente según la categoría detectada, en vez de un proceso paso a paso donde primero se determina la categoría y luego, en un paso separado, se asigna manualmente la etiqueta correspondiente a una variable ya existente.

**¿Por qué es importante?** `when` como expresión permite expresar de forma concisa y directa una decisión de selección entre múltiples alternativas, devolviendo directamente el valor resultante sin la ceremonia adicional de una cadena tradicional de `if`/`else if` con asignación manual.

**Casos de uso reales:**
- Mapear un código de estado HTTP a un mensaje de error legible para el usuario.
- Decidir qué Composable mostrar según un rango de tamaño de pantalla (`when { ancho < 600 -> ...; else -> ... }`).
- Clasificar una entrada de usuario en categorías (edad, nivel de suscripción, rol) para aplicar reglas de negocio distintas.

**Código del ejemplo:**

```kotlin
val descripcion = when (edad) {
    in 0..12 -> "niño"
    in 13..17 -> "adolescente"
    else -> "adulto"
}
```

---

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con crea `academia-kmp` con el asistente oficial Kotlin Multiplatform en una carpeta vacía y ejecuta `git init`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | dominio común y targets. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | red, datos e integración nativa. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | compatibilidad y operación multi-target. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.

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

**Objetivo del laboratorio:** construir un programa de consola sin un solo `NullPointerException` posible.

**Requisitos previos:** conocimientos generales de programación (cualquier lenguaje de tipado estático es útil).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Declarar variables con `val`/`var` | — | Explica cuándo el compilador exige cada una |
| 2 | Declarar una variable nullable y usarla sin verificar | Ver Tema 1 | Observa el error de compilación |
| 3 | Usar el operador Elvis para un valor por defecto | Ver Tema 1 | `?:` |
| 4 | Crear una `data class` y verificar `copy()`/`equals` | Ver Tema 2 | Compara instancias por valor |
| 5 | Escribir una función de extensión | Ver Tema 2 | Agrega comportamiento sin heredar |
| 6 | Reemplazar una cadena if/else con `when` | Ver Tema 3 | Como expresión que devuelve un valor |

**Verificación:** el laboratorio se considera exitoso si el programa completo compila sin ningún uso injustificado de `!!`, y si cada acceso a un valor nullable está correctamente manejado con safe call o el operador Elvis.

**Errores comunes y soluciones**

- **Usar `!!` para evitar el manejo explícito de null.** Reserva `!!` solo para casos con certeza real verificable; usa `?.`/`?:` en el resto.
- **Escribir una cadena larga de if/else en vez de `when`.** Usa `when` como expresión para mayor concisión.
- **Olvidar que `data class` genera `equals` por valor, no por referencia.** Aprovecha esa igualdad estructural en vez de comparar manualmente campo por campo.

---

## Ejercicios de evaluación

### Ejercicio 1: String vs String?

**Enunciado:** ¿por qué Kotlin distingue entre `String` y `String?` en el sistema de tipos?

**Solución esperada:** esta distinción permite que el compilador verifique en tiempo de compilación si una variable puede legítimamente ser `null`, obligando a manejar explícitamente ese caso (con safe call, Elvis, o verificación explícita) antes de acceder a sus miembros, eliminando una categoría completa de errores de referencia nula que de otro modo solo se detectarían en tiempo de ejecución.

**Criterios de éxito:**
- Explica correctamente la verificación en compilación como la razón de esta distinción de tipos.

### Ejercicio 2: Qué evita el null safety de Kotlin

**Enunciado:** ¿qué evita en la práctica el null safety de Kotlin que Java no evita por defecto?

**Solución esperada:** evita que el código compile si existe una posibilidad no manejada de acceder a un miembro de una referencia nula, forzando a manejar explícitamente ese caso antes de compilar; Java, sin anotaciones adicionales de nulabilidad, permite que ese mismo código compile sin advertencia, y el error solo se manifiesta como un `NullPointerException` en tiempo de ejecución.

**Criterios de éxito:**
- Explica correctamente la detección en compilación (Kotlin) frente a la detección solo en ejecución (Java sin anotaciones).

### Ejercicio 3: Exhaustividad de when sin else

**Enunciado:** ¿por qué `when` sobre una sealed class no necesita una rama `else` para ser exhaustivo?

**Solución esperada:** una sealed class restringe explícitamente qué subtipos existen; el compilador conoce ese conjunto cerrado y completo de posibilidades, y puede verificar que el `when` cubre todos los casos posibles sin necesidad de una rama `else` genérica como respaldo.

**Criterios de éxito:**
- Explica correctamente la restricción del conjunto de subtipos de una sealed class como razón de la exhaustividad verificable.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- JetBrains, documentación oficial de *Kotlin Multiplatform* y Kotlin Coroutines.
- Google, *Android Developers Documentation*; Apple, *Developer Documentation*.
- Kotlin Foundation, especificación y pautas de compatibilidad de Kotlin.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Kotlin distingue tipos nullable de no-nullable en el sistema de tipos, verificado en tiempo de compilación.
- `data class` genera automáticamente `equals`, `hashCode`, `toString` y `copy()`.
- Las funciones de extensión agregan comportamiento a clases existentes sin herencia.
- `when` como expresión devuelve directamente un valor, más conciso que una cadena de if/else.

**Conceptos aprendidos**

- Null safety con `?`, `!!` y `?:`.
- `data class` y funciones de extensión.
- `when` como expresión.

**Próximos pasos**

En el Módulo 1 aprenderás programación funcional en Kotlin: lambdas, scope functions, sealed classes, y colecciones funcionales.

**Recursos adicionales**

- Documentación oficial de Kotlin (kotlinlang.org/docs): "Null Safety" y "Data Classes".
- Ejemplos de código ejecutables de este track, en Kotlin: carpeta [`examples/tracks/kotlin-multiplatform/`](https://github.com/NICORUIZ93/Academia_Floci/tree/main/examples/tracks/kotlin-multiplatform) del repositorio — `coroutines-flow.kt` (Módulo 2), `expect-actual.kt` (Módulos 3-4), `ktor-client.kt` (Módulo 5), `sqldelight-persistence.kt` (Módulo 6).
