# Módulo 9: Testing multiplataforma


## Aprende construyendo

### Tema 1: kotlin.test en commonTest

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar código KMP compartido desde cero. Prerrequisitos: JDK 17+, Kotlin, Gradle y editor. Verifica java --version y ./gradlew --version.

#### Paso 2 · Contexto y caso real
En un caso real, una regla de entregas debe probarse una vez en commonTest y ejecutarse en los targets sin depender de Android o iOS.

#### Paso 3 · Teoría, modelo mental y analogía
kotlin.test ofrece aserciones multiplataforma; un fake implementa el contrato con comportamiento controlable; runTest avanza tiempo virtual para coroutines. La analogía es un simulador: reemplaza la carretera real por un recorrido repetible y medible.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-kmp-m9
cd ejemplo-kmp-m9
gradle init
mkdir -p shared/src/commonMain/kotlin shared/src/commonTest/kotlin
./gradlew tasks
```
Crea shared/src/commonTest/kotlin/DeliveryTest.kt con una aserción kotlin.test y ejecuta ./gradlew :shared:allTests; documenta source set y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una expectativa para provocar un fallo deliberado de test; lee el diagnóstico y corrígelo. Resultado esperado: pruebas verdes en commonTest y los targets configurados.

#### Paso 6 · Práctica independiente
Implementa un fake repository, un caso async con runTest, avance de tiempo y una prueba de error; evita sleeps reales.

#### Paso 7 · Cierre y evidencia
Guarda Gradle log, tests y código; como siguiente paso automatiza CI. Errores comunes: test específico en commonTest, mock que oculta reglas, delay real y no ejecutar todos los targets. Fuentes oficiales: https://kotlinlang.org/docs/multiplatform-run-tests.html y https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/.
**¿Por qué es importante?** Porque las pruebas compartidas reducen duplicación y detectan regresiones en todas las plataformas.
**Evidencia de aprendizaje:** entrega test, fake, fallo, corrección y salida de Gradle.
**Conceptos clave:** un único test, ejecutado contra ambos targets.

```kotlin
class ObtenerTareasPendientesUseCaseTest {
    @Test
    fun filtraSoloPendientes() = runTest {
        val repoFake = TareaRepositoryFake(listOf(
            Tarea("1", "A", completada = false),
            Tarea("2", "B", completada = true),
        ))
        val resultado = ObtenerTareasPendientesUseCase(repoFake)()
        assertEquals(1, resultado.size)
    }
}
```

Este test, escrito una única vez en el source set `commonTest` (el equivalente de `commonMain` pero para código de pruebas), se compila y ejecuta contra el target Android y contra el target iOS de forma completamente independiente, confirmando que la lógica del caso de uso `ObtenerTareasPendientesUseCase` (Módulo 4) se comporta de forma idéntica en ambas plataformas sin necesidad de duplicar el esfuerzo de escribir y mantener dos suites de pruebas separadas y potencialmente divergentes, una directa consecuencia de que la lógica bajo prueba en sí vive completamente en `commonMain` sin ningún código específico de plataforma que pudiera comportarse de forma distinta entre ambos targets.

Esta capacidad de "escribir una vez, probar en ambas plataformas" es el complemento natural de "escribir una vez, ejecutar en ambas plataformas" (el principio central de KMP estudiado desde el Módulo 3): si la lógica de negocio vive completamente en código compartido, las pruebas de esa lógica también pueden y deben vivir completamente en código compartido, obteniendo automáticamente el mismo beneficio de verificación dual sin trabajo adicional específico por plataforma.

**Analogía:** un test en `commonTest` es como una única inspección de calidad que se aplica automáticamente al producto fabricado en cualquiera de dos fábricas idénticas que siguen exactamente el mismo plano de fabricación, confirmando que ambas fábricas producen resultados consistentes sin necesidad de un inspector distinto y un criterio de evaluación separado para cada fábrica.

**¿Por qué es importante?** Un test escrito una única vez en `commonTest` confirma que la lógica compartida se comporta de forma idéntica en ambas plataformas, sin duplicar el esfuerzo de escribir y mantener suites de pruebas separadas por plataforma.

**Casos de uso reales:**
- Verificar `ObtenerTareasPendientesUseCase` (Módulo 4) una sola vez y confiar en que el resultado es idéntico en Android e iOS.
- Detectar en CI (Módulo 10) si un cambio en `commonMain` rompe la lógica compartida antes de compilar ambas apps completas.
- Cubrir reglas de negocio críticas (cálculo de precios, validaciones) con un único test suite mantenido por un solo equipo.

**Código del ejemplo:**

```kotlin
class ObtenerTareasPendientesUseCaseTest {
    @Test
    fun filtraSoloPendientes() = runTest {
        val repoFake = TareaRepositoryFake(listOf(
            Tarea("1", "A", completada = false),
            Tarea("2", "B", completada = true),
        ))
        val resultado = ObtenerTareasPendientesUseCase(repoFake)()
        assertEquals(1, resultado.size)
    }
}
```

### Tema 2: Fakes en vez de mocks

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar código KMP compartido desde cero. Prerrequisitos: JDK 17+, Kotlin, Gradle y editor. Verifica java --version y ./gradlew --version.

#### Paso 2 · Contexto y caso real
En un caso real, una regla de entregas debe probarse una vez en commonTest y ejecutarse en los targets sin depender de Android o iOS.

#### Paso 3 · Teoría, modelo mental y analogía
kotlin.test ofrece aserciones multiplataforma; un fake implementa el contrato con comportamiento controlable; runTest avanza tiempo virtual para coroutines. La analogía es un simulador: reemplaza la carretera real por un recorrido repetible y medible.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-kmp-m9
cd ejemplo-kmp-m9
gradle init
mkdir -p shared/src/commonMain/kotlin shared/src/commonTest/kotlin
./gradlew tasks
```
Crea shared/src/commonTest/kotlin/DeliveryTest.kt con una aserción kotlin.test y ejecuta ./gradlew :shared:allTests; documenta source set y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una expectativa para provocar un fallo deliberado de test; lee el diagnóstico y corrígelo. Resultado esperado: pruebas verdes en commonTest y los targets configurados.

#### Paso 6 · Práctica independiente
Implementa un fake repository, un caso async con runTest, avance de tiempo y una prueba de error; evita sleeps reales.

#### Paso 7 · Cierre y evidencia
Guarda Gradle log, tests y código; como siguiente paso automatiza CI. Errores comunes: test específico en commonTest, mock que oculta reglas, delay real y no ejecutar todos los targets. Fuentes oficiales: https://kotlinlang.org/docs/multiplatform-run-tests.html y https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/.
**¿Por qué es importante?** Porque las pruebas compartidas reducen duplicación y detectan regresiones en todas las plataformas.
**Evidencia de aprendizaje:** entrega test, fake, fallo, corrección y salida de Gradle.
**Conceptos clave:** implementación real y simple, compatibilidad con todos los targets.

`class TareaRepositoryFake(private val datos: List<Tarea>) : TareaRepository { override suspend fun obtenerTodas() = datos }` es un fake: una implementación real y completa de la interfaz `TareaRepository` (Módulo 4), simplemente con un comportamiento simplificado apropiado específicamente para pruebas (devolver datos predefinidos en memoria, en vez de conectarse a red o base de datos real), en contraste con un mock generado dinámicamente por una librería de mocking (como Mockito, estudiado en el Módulo 9 del track de Java), que construye un objeto simulado en tiempo de ejecución mediante mecanismos como proxies dinámicos o generación de bytecode.

Preferir fakes sobre mocks en el contexto específico de `commonTest` tiene una razón técnica concreta: las librerías de mocking tradicionales dependen frecuentemente de mecanismos específicos de la JVM (como proxies dinámicos o manipulación de bytecode) que simplemente no están disponibles, o se comportan de forma distinta, en los demás targets de Kotlin/Native (como iOS); un fake, al ser código Kotlin ordinario y simple sin ninguna dependencia de mecanismos específicos de un runtime particular, funciona de forma idéntica y sin ninguna limitación especial en absolutamente cualquier target de Kotlin Multiplatform.

**Analogía:** un fake es como un maniquí de práctica completamente funcional para el propósito específico del entrenamiento, construido con materiales simples y universales; un mock generado dinámicamente es como un simulador sofisticado que depende de tecnología especializada disponible únicamente en ciertos laboratorios específicos, no reproducible fácilmente en cualquier ubicación.

**¿Por qué es importante?** Los fakes son código Kotlin ordinario compatible con cualquier target de Kotlin Multiplatform, mientras que las librerías de mocking tradicionales dependen frecuentemente de mecanismos específicos de la JVM no disponibles universalmente en todos los targets, incluyendo iOS.

**Casos de uso reales:**
- `TareaRepositoryFake` reutilizado en decenas de tests de distintos casos de uso, sin depender de una librería de mocking.
- Un `FakeApiClient` que simula respuestas de red exitosas y de error, sin levantar un servidor real ni Floci.
- Fakes compartidos entre el equipo Android y el equipo iOS, ya que ambos ejecutan exactamente los mismos tests de `commonTest`.

**Código del ejemplo:**

```kotlin
class TareaRepositoryFake(private val datos: List<Tarea>) : TareaRepository {
    override suspend fun obtenerTodas() = datos
}
```

### Tema 3: runTest para coroutines

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar código KMP compartido desde cero. Prerrequisitos: JDK 17+, Kotlin, Gradle y editor. Verifica java --version y ./gradlew --version.

#### Paso 2 · Contexto y caso real
En un caso real, una regla de entregas debe probarse una vez en commonTest y ejecutarse en los targets sin depender de Android o iOS.

#### Paso 3 · Teoría, modelo mental y analogía
kotlin.test ofrece aserciones multiplataforma; un fake implementa el contrato con comportamiento controlable; runTest avanza tiempo virtual para coroutines. La analogía es un simulador: reemplaza la carretera real por un recorrido repetible y medible.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-kmp-m9
cd ejemplo-kmp-m9
gradle init
mkdir -p shared/src/commonMain/kotlin shared/src/commonTest/kotlin
./gradlew tasks
```
Crea shared/src/commonTest/kotlin/DeliveryTest.kt con una aserción kotlin.test y ejecuta ./gradlew :shared:allTests; documenta source set y salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una expectativa para provocar un fallo deliberado de test; lee el diagnóstico y corrígelo. Resultado esperado: pruebas verdes en commonTest y los targets configurados.

#### Paso 6 · Práctica independiente
Implementa un fake repository, un caso async con runTest, avance de tiempo y una prueba de error; evita sleeps reales.

#### Paso 7 · Cierre y evidencia
Guarda Gradle log, tests y código; como siguiente paso automatiza CI. Errores comunes: test específico en commonTest, mock que oculta reglas, delay real y no ejecutar todos los targets. Fuentes oficiales: https://kotlinlang.org/docs/multiplatform-run-tests.html y https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/.
**¿Por qué es importante?** Porque las pruebas compartidas reducen duplicación y detectan regresiones en todas las plataformas.
**Evidencia de aprendizaje:** entrega test, fake, fallo, corrección y salida de Gradle.
**Conceptos clave:** tiempo virtual, ejecución instantánea sin esperas reales.

`@Test fun pruebaConDelay() = runTest { val resultado = funcionConDelay(); assertEquals(esperado, resultado) }` envuelve el cuerpo de un test que involucra funciones `suspend` (Módulo 2) en un builder especializado (`runTest`) que gestiona un dispatcher de tiempo virtual: cualquier `delay()` interno invocado dentro del código bajo prueba se "salta" automáticamente sin esperar realmente ese tiempo en el reloj físico real, permitiendo que el test corra instantáneamente (en milisegundos reales de ejecución) incluso si la lógica bajo prueba contiene delays simulados de segundos o minutos completos.

Esta capacidad es crucial para mantener una suite de tests rápida y ágil: sin `runTest` (usando en cambio un builder de coroutines normal, no especializado para testing), cualquier `delay()` real dentro del código bajo prueba efectivamente pausaría la ejecución del test durante ese tiempo real completo, haciendo que una suite con muchos tests de este tipo se vuelva progresivamente más lenta de ejecutar a medida que crece, un problema que el tiempo virtual de `runTest` elimina completamente sin sacrificar la fidelidad de la prueba respecto al comportamiento real de la lógica bajo prueba.

**Analogía:** `runTest` es como un simulador de vuelo que permite probar procedimientos que en la realidad tomarían horas completas, comprimiendo ese tiempo a segundos reales sin alterar la validez de lo que efectivamente se está verificando en el procedimiento simulado.

**¿Por qué es importante?** `runTest` permite que los tests de código con delays simulados corran instantáneamente en tiempo real, manteniendo la suite de pruebas rápida y ágil incluso con lógica que internamente simula esperas prolongadas.

**Casos de uso reales:**
- Testear un mecanismo de reintento con backoff exponencial (varios segundos simulados) en milisegundos reales de test.
- Verificar timeouts de red configurados en el cliente Ktor (Módulo 5) sin esperar el timeout real completo.
- Mantener una suite de cientos de tests rápida en CI (Módulo 10) aunque varios simulen esperas de red o de UI.

**Código del ejemplo:**

```kotlin
@Test
fun pruebaConDelay() = runTest {
    val resultado = funcionConDelay() // el delay() interno se "salta" en tiempo virtual, el test corre instantáneo
    assertEquals(esperado, resultado)
}
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de tests sobre el módulo common que corre igual en Android e iOS.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir un test con `kotlin.test` en `commonTest` | Ver Tema 1 | Sin depender de Android ni iOS |
| 2 | Usar un fake en vez de un mock | Ver Tema 2 | Aísla la prueba |
| 3 | Testear una función suspend con `runTest` | Ver Tema 3 | Tiempo virtual, sin esperas reales |
| 4 | Ejecutar la suite en el target Android y en el target iOS | — | Confirma que ambos pasan |

**Verificación:** el laboratorio se considera exitoso si la misma suite de tests pasa idénticamente al ejecutarse contra ambos targets, y si un test con `delay()` interno corre instantáneamente gracias a `runTest`.

**Errores comunes y soluciones**

- **Usar una librería de mocking dependiente de la JVM en `commonTest`.** Usa fakes, compatibles con cualquier target de Kotlin Multiplatform.
- **Olvidar `runTest` para tests con funciones suspend que usan `delay()`.** Sin él, el test esperaría el tiempo real completo, haciendo la suite lenta.
- **Duplicar la misma prueba por separado para Android e iOS.** Escríbela una única vez en `commonTest`, ejecutable contra ambos targets automáticamente.

---
