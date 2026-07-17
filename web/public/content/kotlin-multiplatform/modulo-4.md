# Módulo 4: Lógica de negocio compartida

## Sílabo

**Objetivo general**

Aprovechar el valor real de KMP: escribir la lógica de negocio una única vez y usarla en ambas plataformas nativas, mediante modelos de dominio compartidos, casos de uso independientes de plataforma, y repositorios con interfaces comunes inyectados con Koin.

**Objetivos específicos**

1. Definir modelos de dominio compartidos en `commonMain`.
2. Implementar un caso de uso que dependa de una interfaz de repositorio, no de su implementación concreta.
3. Definir una interfaz de repositorio con una implementación real y una fake para tests.
4. Configurar Koin para inyectar la implementación correcta por plataforma.

**Contenido**

- Modelos de dominio compartidos.
- Casos de uso (use cases) independientes de plataforma.
- Repositorios con interfaces comunes.
- Inyección de dependencias multiplataforma (Koin).

**Evaluación**

Capa de dominio compartida (modelos + casos de uso) sin código específico de plataforma, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Modelos de dominio y casos de uso

**Conceptos clave:** `data class` compartida, dependencia de interfaz no de implementación.

`data class Tarea(val id: String, val titulo: String, val completada: Boolean)` en `commonMain` representa una entidad central del dominio de la aplicación, sin ninguna dependencia hacia detalles de persistencia, red, o UI de ninguna plataforma específica: es simplemente una estructura de datos inmutable (Módulo 0) que ambas plataformas nativas consumen exactamente de la misma forma, garantizando que "una tarea" signifique exactamente lo mismo en Android y en iOS, sin ninguna posibilidad de que ambas implementaciones diverjan sutilmente en su definición con el tiempo.

`class ObtenerTareasPendientesUseCase(private val repositorio: TareaRepository) { suspend operator fun invoke(): List<Tarea> = repositorio.obtenerTodas().filter { !it.completada } }` encapsula una pieza específica de lógica de negocio (obtener solo las tareas pendientes) como una clase dedicada e independiente, que depende explícitamente de la interfaz `TareaRepository` (Tema 2), no de ninguna implementación concreta específica de esa interfaz — el mismo principio de inversión de dependencias estudiado para Spring en el Módulo 0 del track de Spring Boot, aquí aplicado manualmente en un contexto multiplataforma sin un framework de inversión de control automático, dependiendo de que la implementación concreta se inyecte externamente (Tema 3).

**Analogía:** un modelo de dominio compartido es como una definición única y oficial de un término técnico que todos los departamentos de una empresa usan exactamente de la misma forma, evitando que cada departamento desarrolle su propia interpretación ligeramente distinta con el tiempo; un caso de uso que depende de una interfaz, no de una implementación concreta, es como un procedimiento operativo que especifica qué información necesita sin importarle de qué proveedor específico proviene esa información, siempre que cumpla el formato acordado.

**¿Por qué es importante?** Los modelos de dominio compartidos garantizan una única definición consistente entre plataformas; los casos de uso dependiendo de interfaces (no implementaciones concretas) permiten testear la lógica de negocio de forma aislada, sin necesidad de infraestructura real.

**Casos de uso reales:**
- Modelo `Tarea`/`Usuario`/`Pedido` compartido entre las apps Android e iOS de un mismo producto, evitando que diverjan sutilmente.
- Caso de uso `IniciarSesionUseCase` que valida credenciales igual en ambas plataformas, delegando el almacenamiento seguro a `expect`/`actual` (Módulo 3).
- Reglas de negocio de facturación o descuentos escritas una sola vez y consumidas por Android, iOS y un backend JVM (Módulo 3).

**Diagrama:**

```kotlin
// commonMain
data class Tarea(val id: String, val titulo: String, val completada: Boolean)

class ObtenerTareasPendientesUseCase(private val repositorio: TareaRepository) {
    suspend operator fun invoke(): List<Tarea> =
        repositorio.obtenerTodas().filter { !it.completada }
}
```

### Tema 2: Repositorios con interfaz común

**Conceptos clave:** contrato compartido, implementación real frente a fake.

`interface TareaRepository { suspend fun obtenerTodas(): List<Tarea>; suspend fun guardar(tarea: Tarea) }` define en `commonMain` el contrato completo de acceso a datos que la capa de dominio necesita, sin especificar absolutamente nada sobre cómo esos datos efectivamente se obtienen o se persisten (podría ser una API remota, una base de datos local, o una combinación de ambas sincronizadas entre sí, Módulo 11); `class TareaRepositoryImpl(private val api: ApiClient, private val db: TareaDao) : TareaRepository { override suspend fun obtenerTodas(): List<Tarea> = db.obtenerTodas() }` proporciona una implementación concreta real de ese contrato, combinando fuentes reales de datos.

Definir la interfaz en `commonMain` con al menos dos implementaciones (una real, para producción, y una fake simple para tests, Módulo 9) es lo que hace posible testear `ObtenerTareasPendientesUseCase` (Tema 1) de forma completamente aislada, sin depender de red ni de base de datos real durante las pruebas: el caso de uso, al depender únicamente de la interfaz `TareaRepository`, funciona idénticamente sin importar cuál implementación concreta específica reciba, permitiendo sustituir la implementación real por una fake trivial durante las pruebas sin ningún cambio al código del caso de uso en sí.

**Analogía:** una interfaz de repositorio compartida es como un formulario estándar de solicitud de suministros que cualquier proveedor (real o simulado para efectos de práctica) puede completar de la misma forma exacta, permitiendo entrenar al personal usando un proveedor de práctica sin necesidad de involucrar al proveedor real durante ese entrenamiento.

**¿Por qué es importante?** Definir el repositorio como una interfaz compartida en `commonMain`, con una implementación real y una fake, permite testear la lógica de negocio de forma completamente aislada sin depender de infraestructura real.

**Casos de uso reales:**
- `TareaRepository` con una implementación que combina Ktor (Módulo 5) para red y SQLDelight (Módulo 6) para caché local.
- Un `FakeTareaRepository` en memoria usado en los tests de `commonTest` (Módulo 9) sin tocar red ni base de datos real.
- Cambiar de backend (de REST a GraphQL) implementando una nueva clase que satisface la misma interfaz, sin tocar los casos de uso.

**Diagrama:**

```kotlin
interface TareaRepository {
    suspend fun obtenerTodas(): List<Tarea>
    suspend fun guardar(tarea: Tarea)
}
class TareaRepositoryImpl(private val api: ApiClient, private val db: TareaDao) : TareaRepository {
    override suspend fun obtenerTodas(): List<Tarea> = db.obtenerTodas() // o sincroniza con api
}
```

### Tema 3: Inyección de dependencias multiplataforma con Koin

**Conceptos clave:** un único framework de DI funcionando en todos los targets.

`val sharedModule = module { single<TareaRepository> { TareaRepositoryImpl(get(), get()) }; factory { ObtenerTareasPendientesUseCase(get()) } }` configura Koin (un framework de inyección de dependencias ligero, sin generación de código en tiempo de compilación, a diferencia de otras alternativas del ecosistema Kotlin/Android) para resolver automáticamente la cadena completa de dependencias: declarando que `TareaRepository` se resuelve como una única instancia compartida (`single`) de `TareaRepositoryImpl`, y que `ObtenerTareasPendientesUseCase` se crea nueva cada vez que se solicita (`factory`), inyectando automáticamente el repositorio correspondiente.

Koin funciona de forma idéntica en `commonMain`, resolviendo dependencias sin necesidad de un framework de inyección de dependencias distinto por plataforma, a diferencia de lo que ocurriría si cada plataforma nativa tuviera que gestionar su propio mecanismo de conexión de dependencias por separado (Dagger/Hilt en Android, un patrón de inyección manual distinto en iOS): al declarar el módulo de Koin una única vez en código compartido, ambas plataformas obtienen exactamente la misma configuración de dependencias sin duplicar ese trabajo de conexión.

**Analogía:** Koin es como un directorio de contactos universal que funciona igual en cualquier oficina de la empresa (cualquier plataforma), resolviendo automáticamente quién debe conectarse con quién según las relaciones declaradas una única vez, sin que cada oficina tenga que mantener su propio directorio separado y potencialmente inconsistente con las demás.

**¿Por qué es importante?** Koin permite declarar la configuración de inyección de dependencias una única vez en `commonMain`, funcionando idénticamente en todas las plataformas, sin duplicar esa configuración por separado en cada una.

**Casos de uso reales:**
- Un único `sharedModule` de Koin que resuelve repositorios y casos de uso, consumido tanto por Compose Multiplatform (Módulo 7) como por SwiftUI vía interoperabilidad (Módulo 8).
- Cambiar la implementación de `TareaRepository` (real vs. fake) según el build type sin tocar el código que la consume.
- Evitar mantener configuraciones de Dagger/Hilt (Android) y un inyector manual (iOS) por separado para las mismas dependencias.

**Diagrama:**

```kotlin
val sharedModule = module {
    single<TareaRepository> { TareaRepositoryImpl(get(), get()) }
    factory { ObtenerTareasPendientesUseCase(get()) }
}
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una capa de dominio compartida (modelos + casos de uso) sin código específico de plataforma.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir modelos de dominio en `commonMain` | Ver Tema 1 | `data class` de las entidades centrales |
| 2 | Implementar un caso de uso dependiente de una interfaz | Ver Tema 1 | No de una implementación concreta |
| 3 | Definir la interfaz de repositorio con dos implementaciones | Ver Tema 2 | Una real, una fake para tests |
| 4 | Configurar Koin para inyectar la implementación correcta | Ver Tema 3 | Por plataforma |

**Verificación:** el laboratorio se considera exitoso si ningún archivo de la capa de dominio (`commonMain`) contiene código específico de Android o iOS, y si el caso de uso puede probarse con la implementación fake del repositorio sin ninguna infraestructura real.

**Errores comunes y soluciones**

- **Hacer que el caso de uso dependa de la implementación concreta del repositorio.** Depende siempre de la interfaz, no de la implementación específica.
- **Duplicar la configuración de inyección de dependencias por plataforma.** Declara el módulo de Koin una única vez en `commonMain`.
- **Filtrar código específico de plataforma dentro de un modelo de dominio.** Mantén los modelos de dominio completamente independientes de detalles de plataforma.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué depender de una interfaz facilita testear

**Enunciado:** ¿por qué definir el caso de uso contra una interfaz de repositorio (no una implementación) facilita testear la lógica?

**Solución esperada:** al depender únicamente de la interfaz, el caso de uso funciona idénticamente sin importar qué implementación concreta reciba, permitiendo sustituir la implementación real por una fake trivial durante las pruebas (sin red ni base de datos real), sin ningún cambio necesario en el código del caso de uso en sí.

**Criterios de éxito:**
- Explica correctamente la sustitución transparente de implementaciones (real por fake) como el beneficio para testabilidad.

### Ejercicio 2: Proporción de lógica compartible

**Enunciado:** ¿qué porcentaje de una app típica suele ser lógica de negocio compartible vs UI específica de plataforma?

**Solución esperada:** cualquier estimación razonable con justificación; una respuesta común señala que gran parte de la lógica de negocio, networking y persistencia (con frecuencia 50-80% del código total dependiendo de la app) es compartible, mientras que la UI y ciertas integraciones nativas específicas permanecen como código específico de plataforma.

**Criterios de éxito:**
- Da una estimación razonable con una justificación coherente sobre qué tipo de código es compartible frente a específico.

### Ejercicio 3: Ventaja de Koin multiplataforma

**Enunciado:** ¿qué ventaja da usar Koin en `commonMain` frente a un framework de DI distinto por plataforma?

**Solución esperada:** permite declarar la configuración completa de inyección de dependencias una única vez en código compartido, funcionando idénticamente en todas las plataformas, evitando duplicar y potencialmente desincronizar esa configuración entre implementaciones distintas por plataforma.

**Criterios de éxito:**
- Explica correctamente la evitación de duplicación y desincronización como ventaja de Koin multiplataforma.

---

## Resumen del módulo

**Puntos clave**

- Los modelos de dominio compartidos garantizan una definición única y consistente entre plataformas.
- Los casos de uso dependen de interfaces de repositorio, no de implementaciones concretas, facilitando testabilidad aislada.
- Definir el repositorio como interfaz compartida permite una implementación real y una fake para tests.
- Koin permite declarar inyección de dependencias una única vez en `commonMain`, funcionando en todas las plataformas.

**Conceptos aprendidos**

- Modelos de dominio compartidos.
- Casos de uso independientes de plataforma.
- Repositorios con interfaces comunes.
- Inyección de dependencias con Koin.

**Próximos pasos**

En el Módulo 5 aprenderás networking compartido con Ktor Client: consumo de APIs HTTP, serialización, y manejo de errores de red.

**Recursos adicionales**

- Documentación oficial de Koin (insert-koin.io).
