# Módulo 7: Inyección de dependencias con Hilt

## Sílabo

**Objetivo general**

Desacoplar las dependencias de una app Android usando Hilt, el estándar de la industria construido sobre Dagger, entendiendo módulos, scopes y cómo reemplazar dependencias reales por fakes en tests.

**Objetivos específicos**

1. Anotar la `Application` y un `ViewModel` para habilitar Hilt.
2. Inyectar un repositorio en un `ViewModel` con `@Inject` en el constructor.
3. Usar `@Provides` para dependencias que no se pueden anotar directamente.
4. Usar `@Binds` para mapear una interfaz a su implementación.
5. Configurar un módulo de test que reemplace una dependencia real por un fake.

**Contenido**

- Hilt: módulos y componentes.
- `@Inject`, `@Provides`, `@Binds`.
- Scopes de Hilt (`ViewModelScoped`, `SingletonComponent`).
- Testing con Hilt.
- Koin como alternativa más ligera a Hilt.

**Evaluación**

App con todas sus dependencias (repos, servicios) inyectadas vía Hilt, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Configuración básica de Hilt

**Conceptos clave:** generación de código en tiempo de compilación, grafo de dependencias completo.

```kotlin
@HiltAndroidApp
class MiApp : Application()

@HiltViewModel
class TareasViewModel @Inject constructor(private val repo: TareaRepository) : ViewModel()
```

Hilt (construido sobre Dagger, el framework de inyección de dependencias original de Google basado en generación de código en tiempo de compilación) requiere anotar la clase `Application` con `@HiltAndroidApp` para inicializar el contenedor de dependencias raíz de toda la app, y cada `ViewModel` que participe con `@HiltViewModel`, permitiendo que Hilt construya automáticamente sus dependencias al instanciarlo (aquí, `TareaRepository`) simplemente marcando el constructor con `@Inject`, sin que el desarrollador tenga que escribir manualmente el código de construcción de esa dependencia en ningún lugar.

Este enfoque resuelve un problema de acoplamiento concreto: sin inyección de dependencias, cada clase que necesita un `TareaRepository` tendría que saber exactamente cómo construirlo (qué implementación concreta usar, qué dependencias necesita esa implementación a su vez), duplicando ese conocimiento de construcción en cada punto de uso y dificultando enormemente cambiar la implementación real más adelante (por ejemplo, para pruebas); con Hilt, ese conocimiento de construcción vive en un único lugar centralizado (los módulos, Tema 2), y cualquier clase que declare la dependencia con `@Inject` simplemente la recibe ya construida.

**Analogía:** Hilt es como un servicio de entrega centralizado que sabe exactamente cómo fabricar y entregar cada componente que un empleado necesita para su trabajo, en vez de que cada empleado tenga que fabricar sus propias herramientas desde cero conociendo todos los detalles de manufactura.

**¿Por qué es importante?** Hilt resuelve el acoplamiento de que cada clase deba conocer cómo construir sus propias dependencias, centralizando ese conocimiento y permitiendo cambiar implementaciones (por ejemplo, para tests) sin modificar el código que las consume.

**Casos de uso reales:**
- Inyectar `TareaRepository` en varios ViewModels sin que ninguno sepa si internamente usa Retrofit, Room o ambos.
- Cambiar de un backend REST a GraphQL reemplazando solo el módulo de red, sin tocar los ViewModels consumidores.
- Reducir el boilerplate de construir manualmente un grafo de 10+ dependencias interconectadas en una app grande.

**Diagrama:**

```kotlin
@HiltAndroidApp
class MiApp : Application()

@HiltViewModel
class TareasViewModel @Inject constructor(private val repo: TareaRepository) : ViewModel()
```

### Tema 2: @Provides y @Binds

**Conceptos clave:** dos formas de declarar cómo construir una dependencia, según si la clase es propia o externa.

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit = Retrofit.Builder().baseUrl(URL).build()
}
```

`@Provides` se usa cuando la dependencia es una clase externa que no se puede anotar directamente con `@Inject` en su propio constructor (como `Retrofit`, definida en una librería de terceros): un método dentro de un `@Module` describe explícitamente cómo construir esa instancia, y Hilt invoca ese método cada vez que algo necesita esa dependencia (o una única vez, si está marcada `@Singleton`, cacheando el resultado).

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindTareaRepository(impl: TareaRepositoryImpl): TareaRepository
}
```

`@Binds` se usa específicamente para mapear una interfaz (`TareaRepository`) a su implementación concreta (`TareaRepositoryImpl`), cuando esa implementación concreta sí puede anotarse con `@Inject` en su propio constructor: en vez de escribir un método `@Provides` que simplemente invoque el constructor de `TareaRepositoryImpl` manualmente, `@Binds` es una declaración más eficiente (no genera código adicional de invocación) que simplemente le dice a Hilt "cuando alguien pida `TareaRepository`, entrega una instancia de `TareaRepositoryImpl`", manteniendo el resto del código de la app dependiendo únicamente de la interfaz `TareaRepository`, nunca de la implementación concreta directamente.

**Analogía:** `@Provides` es como una receta explícita que alguien debe seguir paso a paso para fabricar un componente externo que no vino con instrucciones propias de ensamblaje; `@Binds` es simplemente una etiqueta que dice "cuando pidan este tipo de producto genérico, entrega esta marca específica", sin necesidad de una receta completa porque el producto ya sabe fabricarse a sí mismo.

**¿Por qué es importante?** `@Provides` permite construir dependencias externas no anotables directamente; `@Binds` mapea eficientemente una interfaz a su implementación cuando esta última ya es constructible por Hilt, manteniendo el resto de la app desacoplado de la implementación concreta.

**Casos de uso reales:**
- Proveer una instancia única de `Retrofit` o `AppDatabase` (Room) compartida por toda la app con `@Provides` + `@Singleton`.
- Mapear `TareaRepository` a `TareaRepositoryImpl` con `@Binds`, cambiando la implementación real sin tocar consumidores.
- Proveer un `OkHttpClient` configurado con los interceptores del Módulo 5 de forma centralizada para toda la app.

**Diagrama:**

```kotlin
@Provides fun provideRetrofit(): Retrofit = Retrofit.Builder().baseUrl(URL).build()  // clase externa
@Binds abstract fun bindTareaRepository(impl: TareaRepositoryImpl): TareaRepository   // interfaz propia
```

### Tema 3: Scopes y testing con Hilt

**Conceptos clave:** tiempo de vida controlado por scope, reemplazo de módulos reales por fakes en tests.

`@Singleton` vincula una dependencia al `SingletonComponent`, viviendo mientras la app entera vive (una única instancia compartida en toda la aplicación); `@ViewModelScoped` vincula una dependencia al ciclo de vida de un `ViewModel` específico (una nueva instancia por cada `ViewModel`, destruida cuando ese `ViewModel` se destruye). Elegir el scope correcto evita dos problemas opuestos: recrear innecesariamente un objeto costoso de construir en cada uso (si se declara con un scope demasiado corto), o retener en memoria un objeto más tiempo del necesario, previniendo que se libere cuando ya no hace falta (si se declara con un scope demasiado amplio).

```kotlin
@HiltAndroidTest
@UninstallModules(NetworkModule::class) // reemplaza el módulo real por uno de test
class TareasFlowTest { /* ... */ }
```

`@UninstallModules` permite reemplazar por completo un módulo de producción (como `NetworkModule`, que construye un `Retrofit` real apuntando a un servidor real) por un módulo de test equivalente que provee, en cambio, un fake o un cliente apuntando a un servidor de pruebas, sin modificar ninguna línea del código de producción bajo prueba: el `ViewModel` sigue recibiendo su dependencia inyectada exactamente igual, sin saber (ni necesitar saber) que en el contexto de test proviene de un módulo distinto.

**Analogía:** los scopes de Hilt son como distintos tipos de contrato de alquiler: uno de larga duración para toda la vida del edificio (`@Singleton`), y uno de corto plazo que se renueva junto con cada inquilino específico (`@ViewModelScoped`); `@UninstallModules` es como reemplazar temporalmente el proveedor real de un servicio por un proveedor de práctica durante un simulacro, sin que el resto de la organización note ningún cambio en su forma de solicitar ese servicio.

**¿Por qué es importante?** Elegir el scope correcto evita recrear objetos costosos innecesariamente o retenerlos más tiempo del necesario; `@UninstallModules` permite testear con dependencias fake sin modificar el código de producción bajo prueba.

**Casos de uso reales:**
- Marcar `AppDatabase` como `@Singleton` para evitar abrir múltiples conexiones a la misma base de datos SQLite.
- Reemplazar `NetworkModule` por un módulo de test que apunta a un servidor de pruebas (o a Floci, Módulo 1 del track Cloud) en tests instrumentados.
- Detectar en code review un `@Singleton` innecesario en una dependencia que debería vivir solo mientras dura una pantalla.

**Diagrama:**

```
@Singleton         → vive mientras la app vive
@ViewModelScoped   → vive mientras el ViewModel específico vive

@UninstallModules(NetworkModule::class) → reemplaza el módulo real por uno de test
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

**Objetivo del laboratorio:** construir una app con todas sus dependencias (repos, servicios) inyectadas vía Hilt.

**Requisitos previos:** Módulo 6 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Anotar `Application` y un `ViewModel` con Hilt | Ver Tema 1 | `@HiltAndroidApp`, `@HiltViewModel` |
| 2 | Inyectar un repositorio con `@Inject` en el constructor | Ver Tema 1 | Sin instanciación manual |
| 3 | Crear un `@Module` con `@Provides` para Retrofit | Ver Tema 2 | Clase externa no anotable |
| 4 | Usar `@Binds` para mapear interfaz a implementación | Ver Tema 2 | Repositorio propio |
| 5 | Configurar un módulo de test con `@UninstallModules` | Ver Tema 3 | Reemplaza dependencia real por fake |

**Verificación:** el laboratorio se considera exitoso si ninguna clase de la app instancia manualmente sus dependencias (todo llega vía constructor inyectado por Hilt), y si el test instrumentado corre correctamente con el módulo real reemplazado por uno de test.

**Errores comunes y soluciones**

- **Usar `@Provides` para una clase que ya se puede anotar con `@Inject` directamente.** Prefiere `@Inject` en el constructor cuando sea posible; usa `@Provides` solo para clases externas.
- **Elegir `@Singleton` para una dependencia que debería vivir solo mientras un `ViewModel` específico vive.** Retiene el objeto más tiempo del necesario; usa `@ViewModelScoped`.
- **Instanciar manualmente una dependencia dentro de una clase en vez de inyectarla.** Reintroduce el acoplamiento que Hilt está diseñado para evitar.

---

## Ejercicios de evaluación

### Ejercicio 1: Problema de acoplamiento que resuelve Hilt

**Enunciado:** ¿qué problema de acoplamiento resuelve Hilt frente a instanciar dependencias manualmente en cada clase?

**Solución esperada:** sin Hilt, cada clase que necesita una dependencia debe conocer exactamente cómo construirla, duplicando ese conocimiento en cada punto de uso y dificultando cambiar la implementación real más adelante; Hilt centraliza ese conocimiento de construcción en módulos, y las clases simplemente reciben la dependencia ya construida.

**Criterios de éxito:**
- Explica correctamente la centralización del conocimiento de construcción como la solución de Hilt.

### Ejercicio 2: Cuándo usar @Provides en vez de @Inject directo

**Enunciado:** ¿cuándo usarías `@Provides` en vez de `@Inject` directo en el constructor?

**Solución esperada:** cuando la dependencia es una clase externa (de una librería de terceros) que no se puede modificar para anotar su propio constructor con `@Inject`, requiriendo en cambio un método `@Provides` dentro de un `@Module` que describa explícitamente cómo construirla.

**Criterios de éxito:**
- Menciona correctamente clases externas no anotables como el caso de uso de `@Provides`.

### Ejercicio 3: Elección correcta de scope

**Enunciado:** ¿qué riesgo hay al elegir un scope de Hilt demasiado amplio (como `@Singleton`) para una dependencia que solo debería vivir mientras un `ViewModel` específico vive?

**Solución esperada:** el objeto se retiene en memoria más tiempo del necesario (mientras la app entera vive, no solo mientras el `ViewModel` correspondiente existe), previniendo que se libere cuando ya no hace falta y potencialmente reteniendo estado obsoleto entre distintas instancias de ese `ViewModel`.

**Criterios de éxito:**
- Explica correctamente la retención innecesaria en memoria como el riesgo de un scope demasiado amplio.

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

- Google, *Android Developers Documentation* y guías de arquitectura de aplicaciones.
- JetBrains, *Kotlin Language Documentation*.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Hilt centraliza el conocimiento de construcción de dependencias, evitando que cada clase deba saber cómo construir las suyas.
- `@Provides` construye dependencias externas no anotables; `@Binds` mapea eficientemente una interfaz a su implementación propia.
- El scope correcto (`@Singleton` vs `@ViewModelScoped`) evita recrear objetos innecesariamente o retenerlos más tiempo del necesario.
- `@UninstallModules` permite reemplazar dependencias reales por fakes en tests sin modificar el código de producción.

**Conceptos aprendidos**

- Hilt: módulos y componentes.
- `@Inject`, `@Provides`, `@Binds`.
- Scopes de Hilt.
- Testing con Hilt.
- Koin como alternativa más ligera.

**Próximos pasos**

En el Módulo 8 aprenderás a ejecutar trabajo en segundo plano que sobrevive incluso si la app se cierra, usando WorkManager.

**Recursos adicionales**

- Documentación oficial de Hilt (developer.android.com/training/dependency-injection/hilt-android).
