# Módulo 12: KMP en producción — fronteras, compatibilidad y observabilidad

La app integradora demuestra que el código común compila y funciona. Un producto multiplataforma añade otra responsabilidad: una decisión en `commonMain` se convierte en API para equipos, compiladores y runtimes diferentes. Este módulo enseña a compartir solo lo estable, mantener la frontera consumible y actualizar Android/iOS sin obligarlos a desplegar simultáneamente.

## Sílabo

1. Frontera compartida, API idiomática, errores y cancelación.
2. Memoria Kotlin/Native, recursos, callbacks y retenciones.
3. Compatibilidad binaria, schemas y publicación de artefactos.
4. Seguridad, observabilidad y release coordinado.
5. Proyecto: convertir el módulo compartido en SDK operable.

## Contenido teórico

### Tema 1: La mejor frontera compartida es deliberadamente pequeña

**Conceptos clave:** shared kernel, platform boundary, expect/actual, interface, DTO, domain model, Swift export, Objective-C interop, suspend, Flow, cancellation, error mapping, facade y semantic ownership.

KMP no exige compartir todo. Comparte reglas de negocio, protocolos y datos cuya semántica es común. Mantén navegación, permisos, lifecycle, UI y servicios profundamente nativos detrás de interfaces cuando sus modelos difieren. Si fuerzas una abstracción universal, cada plataforma termina simulando a la otra.

`expect/actual` funciona bien para primitivas pequeñas como reloj o UUID. Para servicios complejos, una interfaz en common y adaptación inyectada hace dependencias visibles y testeables. Una facade exportada evita que cientos de tipos internos se conviertan accidentalmente en contrato Swift.

```kotlin
public interface TaskClient {
    public suspend fun task(id: TaskId): TaskResult
    public fun observeTasks(): Flow<List<TaskSummary>>
}

public sealed interface TaskResult {
    public data class Found(val task: Task) : TaskResult
    public data object NotFound : TaskResult
    public data object Unauthorized : TaskResult
    public data class Unavailable(val retryable: Boolean) : TaskResult
}
```

Una API Kotlin elegante puede exportarse incómoda a Swift: sobrecargas, genéricos, default arguments, sealed hierarchies y nombres de paquetes se mapean con restricciones. Inspecciona la interfaz generada y escribe un wrapper Swift si mejora ergonomía. Swift export promete mapeo más directo, pero si la herramienta usada está en estado Alpha debe permanecer detrás de experimento y no ser requisito único de producción.

No exportes excepciones internas como contrato implícito. Modela resultados esperables y traduce defectos inesperados a una frontera documentada. Conserva causas en telemetría privada. En Swift, comprueba cómo se mapean errores y nullability; el consumidor no debe adivinar.

La cancelación debe cruzar la frontera. Una pantalla Swift que desaparece cancela su `Task`; el adaptador cancela el Job Kotlin. Un callback que ignora cancelación seguirá red, retendrá ViewModel y escribirá estado obsoleto. Para Flow, define lifecycle de colección, backpressure/conflation y hilo de callbacks.

```swift
final class TaskScreenModel: ObservableObject {
    private var observation: Cancellable?

    func start(client: SharedTaskClient) {
        observation = client.observe { [weak self] value, error in
            guard let self else { return }
            self.apply(value, error)
        }
    }

    deinit { observation?.cancel() }
}
```

**Analogía:** el módulo compartido es un tratado entre países. Cuantas más reglas locales intenta imponer, más traductores y excepciones necesita. Un tratado pequeño y estable facilita cooperación.

**¿Por qué es importante?** porque el coste de una API exportada se multiplica entre Kotlin, Swift, Gradle, Xcode, documentación, compatibilidad y soporte.

**Casos de uso reales:** facade de dominio, reloj nativo, permisos, Flow hacia Swift, error HTTP, cancelación de búsqueda, wrapper Swift y migración de interop.

**Diagrama:**

```text
Android UI -> adapter Kotlin --\
                              facade shared -> dominio/repositorios
iOS SwiftUI -> wrapper Swift --/        |
                          interfaces de plataforma (clock, secure store)
cancelación/lifecycle deben cruzar en ambas direcciones
```

### Tema 2: Garbage collection no cierra sockets ni rompe ciclos externos

**Conceptos clave:** shared heap, tracing GC, root, stable reference, callback, closure, ARC, retain cycle, resource ownership, Closeable, pinning, C pointer, dispatcher, thread confinement y leak test.

Kotlin/Native moderno usa heap compartido y GC trazador; objetos pueden accederse desde varios hilos. Esto elimina muchas restricciones del memory manager legacy, pero no vuelve seguro el estado mutable ni administra recursos externos. Coroutines aún ejecutan sobre threads y requieren sincronización para invariantes.

Swift/Objective-C usa ARC. Un ciclo puede cruzar runtimes: Swift model retiene wrapper Kotlin, Kotlin conserva callback, closure captura fuertemente model. Cada runtime ve referencias válidas. Diseña ownership: quién inicia, quién cancela, quién libera y cuándo. Captura débil donde corresponde y ofrece handle cancelable explícito.

Scopes globales y StateFlows de singleton pueden retener pantallas indefinidamente. No uses `GlobalScope`; recibe scope con lifecycle o crea scope propietario con `close/cancel`. Una función suspend termina/cancela con su caller; un producer compartido documenta su vida.

```kotlin
public class TaskSubscription internal constructor(
    private val job: Job,
) : AutoCloseable {
    override fun close() = job.cancel()
}

public fun TaskClient.subscribe(
    scope: CoroutineScope,
    listener: (List<TaskSummary>) -> Unit,
): TaskSubscription = TaskSubscription(
    scope.launch { observeTasks().collect(listener) },
)
```

GC no cierra SQLDelight driver, file descriptor, socket, native handle o C allocation a tiempo. Usa `use`, `try/finally` y ownership explícito. Finalizers/cleaners son respaldo, no flujo normal.

Interop C puede exigir puntear memoria mientras llamada nativa conserva dirección. `usePinned` limita ventana; no guardes puntero después del bloque. Copiar puede ser más seguro que retener buffer Kotlin. Documenta thread affinity de APIs Apple; entrega actualizaciones UI en Main y no bloquees ese dispatcher.

Mide, no repitas mitos. Logs y métricas de GC Kotlin/Native, Instruments, allocations Android y pruebas repetidas revelan retención. Fuerza un escenario 100 veces y compara heap/objetos tras colección, manteniendo en cuenta caches legítimas.

**Analogía:** dos administradores de edificios eliminan habitaciones sin ocupantes, pero un pasillo entre edificios puede mantener ambos ocupados y ninguno sabe que el ciclo ya no sirve. Hace falta cerrar explícitamente el acceso.

**¿Por qué es importante?** porque fugas cross-runtime aparecen tras navegación repetida y son difíciles de atribuir; compilar para iOS no prueba ownership correcto.

**Casos de uso reales:** callback Swift, Flow observado, scope singleton, SQL driver, NSURLSession/Ktor engine, puntero C, listener nativo y ViewModel retenido.

**Diagrama:**

```text
Swift ViewModel -> Kotlin client -> callback closure -> Swift ViewModel
       ARC                GC                  captura fuerte
cancel handle + weak capture + lifecycle -> romper ciclo
GC Kotlin != close(driver/socket/native handle)
```

### Tema 3: Un artefacto compatible necesita más que el mismo número de versión

**Conceptos clave:** source compatibility, binary compatibility, behavioral compatibility, API dump, KLib, ABI, semantic versioning, XCFramework, Maven publication, checksum, schema, migration, serialization y deprecation.

Compatibilidad source significa que el consumidor recompila; binary, que un binario ya compilado enlaza; behavioral, que obtiene significado esperado. Puedes conservar firma y romper comportamiento cambiando orden, threading, valor default o error. Versiona semánticamente, pero documenta también garantías.

La validación binaria del plugin Kotlin genera dumps API y hace fallar `check` ante cambio no aprobado. El soporte para KLib multiplataforma puede depender de versión/estado; úsalo junto a pruebas de compilación reales de consumidores Android y iOS, no como única evidencia.

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        enabled.set(true)
    }
}
```

Revisa el dump como código. Añadir método abstracto a interfaz implementada por apps puede romper; cambiar data class altera `copy/componentN`; exponer dependencia filtra sus tipos. Mantén `internal` por defecto y surface mínima.

Datos persisten más que binarios. SQLDelight migrations deben funcionar desde cada versión soportada en ambas plataformas. `kotlinx.serialization` requiere nombres estables (`@SerialName`), defaults para campos añadidos y política ante desconocidos. Quitar/renombrar enum o campo rompe datos cacheados y mensajes en vuelo.

Publicación Maven produce metadata raíz y artefactos por target; Apple suele consumir XCFramework por SwiftPM/CocoaPods/direct integration. Firma artefactos, publica sources/docs, checksums y coordenadas inmutables. Nunca sobrescribas `1.2.0`. Construir Apple exige runner macOS y Xcode compatible; fija matriz.

No exportes todos los transitive dependencies. Decide static/dynamic framework y export explícito: exportar aumenta superficie/tamaño y puede duplicar símbolos. Prueba una app consumidora desde artefacto remoto, no solo composite build local.

**Analogía:** mantener el mismo conector físico no garantiza voltaje ni protocolo. ABI conserva encaje; contrato conductual conserva que el dispositivo funcione.

**¿Por qué es importante?** porque Android/iOS no actualizan juntos y un SDK roto bloquea equipos distintos o falla solo después de instalar una migración antigua.

**Casos de uso reales:** nueva función abstracta, data class pública, enum serializado, XCFramework, KLib, Maven metadata, migración desde N-2 y dependencia exportada.

**Diagrama:**

```text
API source -> apiDump/apiCheck -> ABI/KLib
                          `-> consumer compile Android + Swift
schemas N-2 -> migraciones -> datos actuales
tag inmutable -> Maven targets + XCFramework -> apps de prueba -> publicar
```

### Tema 4: Un fallo compartido necesita símbolos y contexto de ambas plataformas

**Conceptos clave:** crash, stack trace, symbolication, dSYM, mapping, source map, correlation ID, privacy, breadcrumb, metric, target matrix, canary, staged rollout, compatibility window y rollback.

Un defecto common puede aparecer como stack Kotlin distinto en Android y frames Kotlin/Native en iOS. Conserva mapping de Android y dSYM/debug symbols del framework exacto por versión. Sin símbolos, ofuscación/optimización vuelve grupos inútiles. Incluye versión SDK, app, target, OS y build ID.

La telemetría compartida define eventos semánticos y deja a adaptadores elegir proveedor nativo. No hagas que common dependa directamente de Firebase/Sentry si eso fuerza SDK y privacidad en todas las plataformas. Inyecta interfaz y limita campos.

```kotlin
public interface Diagnostics {
    public fun record(
        event: DiagnosticEvent,
        attributes: Map<String, String> = emptyMap(),
    )
}

public enum class DiagnosticEvent { SYNC_STARTED, SYNC_CONFLICT, SYNC_FAILED }
```

No uses entity/user ID como labels métricos; correlation ID aleatorio permite conectar cliente/backend sin PII. Redacta URL, token, payload y SQL. Consentimiento y retención pueden variar por plataforma/país.

La matriz CI prueba versiones Kotlin/Gradle/JDK/Xcode mínimas soportadas, simuladores y dispositivos representativos. No es viable toda combinación; prioriza límites y consumidores reales. Nightly puede ampliar. Un upgrade de Kotlin/Native requiere revisar tamaño, startup, GC y ABI, no solo tests common.

Publica SDK antes que apps consumidoras, manteniendo ventana compatible. Android staged rollout y TestFlight no son atómicos. El backend acepta versiones antiguas; los nuevos campos son aditivos. Rollback de una app no revierte DB local ni framework ya incorporado. Prepara forward fix y feature flag seguro para aislar funcionalidad compartida.

Un postmortem separa defecto common, manifestación por plataforma, detección, impacto y acciones. La métrica de “porcentaje compartido” no es objetivo; mide lead time, defectos duplicados, tamaño, crashes y satisfacción nativa.

**Analogía:** una misma pieza defectuosa viaja en dos vehículos y produce ruidos distintos. El número de lote y manual de diagnóstico permiten encontrar la causa compartida sin confundir síntomas.

**¿Por qué es importante?** porque optimización y bridges cambian stacks, y releases asíncronos dejan múltiples combinaciones en campo.

**Casos de uso reales:** crash solo iOS, mapping perdido, GC regression, SDK N con app N-2, backend nuevo, feature flag, staged rollout y privacidad de analytics.

**Diagrama:**

```text
common failure -> Android stack + mapping --\
               -> iOS stack + dSYM --------> build ID -> causa compartida
SDK release -> compatibility window -> Android/iOS rollouts independientes
metrics por sdk/app/OS -> promover | detener | forward fix
```

## Revisión oficial de plataforma — julio de 2026

### Kotlin 2.4 y estado real de cada target

La línea revisada es **Kotlin 2.4**. Compose Multiplatform se considera estable en Android, iOS y escritorio; web basado en **Wasm** continúa con un nivel de estabilidad diferente y debe aislarse. **Swift export** mejora la superficie consumida desde Swift, pero requiere revisar tipos compatibles, nombres, errores, concurrencia y evolución binaria. Actualiza Kotlin, Gradle, Android Gradle Plugin, Xcode y bibliotecas kotlinx como una matriz, no como números independientes.

**Aplicación al proyecto:** exporta una API mínima a Swift, prueba compatibilidad de fuente/binario y cancelación, compila todos los targets en CI y etiqueta cualquier uso Wasm con su nivel de estabilidad y fallback.

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

### Proyecto: SDK compartido estable y operable

Evoluciona el módulo `shared` del proyecto 11 como si dos equipos distintos lo consumieran.

1. Lista API pública actual y consumidores. Marca qué debe ser common y mueve dos detalles nativos fuera.
2. Crea facade pequeña y wrappers Android/Swift. Inspecciona headers/API exportada y corrige nombres, nullability y errores.
3. Conecta cancelación de una búsqueda desde Swift Task/Android lifecycle hasta Job/Ktor; prueba respuesta tardía.
4. Introduce un ciclo Swift→Kotlin→callback→Swift y una suscripción no cancelada. Repite navegación, mide y corrige.
5. Audita drivers, clients y handles; añade ownership/close y tests de liberación.
6. Activa API dump/check. Rompe firma, data class e interfaz para comprobar gates.
7. Crea migraciones SQL/JSON desde N-2 con datos reales, enums desconocidos y rollback/forward fix.
8. Publica snapshot Maven y XCFramework/paquete Swift con checksums. Consume desde repositorio en apps mínimas limpias.
9. Configura matriz CI: common, Android, targets Apple, consumidor Swift, ABI y migraciones.
10. Inyecta Diagnostics, provoca el mismo fallo en ambas apps y simboliza con mapping/dSYM.
11. Diseña release SDK→backend→apps con ventana compatible, canary/TestFlight, staged rollout, flag y postmortem.

**Verificación:** entrega diagrama de frontera, superficie API, pruebas de cancelación/retención, dumps ABI, migraciones N-2, coordenadas/artefactos inmutables, builds consumidores y stacks simbolizados. Un cambio incompatible o símbolo ausente debe detener CI/release.

**Errores comunes y soluciones**

- Compartir UI/lifecycle por porcentaje: comparte semántica estable y mide coste total.
- Exportar modelo interno entero: facade y DTO mínimo reducen ABI y acoplamiento.
- Ignorar cancelación Swift: devuelve handle o integra Task y cancela Job/engine.
- Confiar en GC para drivers: ownership y close explícitos.
- Validar solo commonTest: compila/ejecuta consumers reales por target.
- Sobrescribir artefacto publicado: coordenadas inmutables y versión nueva.
- API check verde igual a compatibilidad: añade pruebas conductuales y schemas.
- Crash sin dSYM/mapping: archiva símbolos por build ID antes de distribuir.

## Ejercicios de evaluación

### Ejercicio 1: abstracción costosa

Android e iOS piden flujos de permisos distintos. ¿Debe existir `expect fun requestPermission()` común?

<details><summary>Solución razonada</summary>

Probablemente no como flujo completo: lifecycle, UX y tipos son nativos. Common puede expresar capacidad/resultado de dominio mediante interfaz; cada plataforma implementa y presenta su flujo. `expect/actual` sirve mejor para una primitiva pequeña.
</details>

### Ejercicio 2: ciclo cruzado

Swift ViewModel retiene client Kotlin y este retiene closure que captura ViewModel. ¿Por qué ambos collectors pueden conservarlo?

<details><summary>Solución razonada</summary>

Existe ruta fuerte a través de runtimes. Define propietario, captura weak en Swift, cancela subscription/Job en lifecycle y prueba deinit/heap tras navegación repetida.
</details>

### Ejercicio 3: ABI verde, app rota

La firma `sync(): Result` no cambia, pero ahora callback llega en background y Swift toca UI. ¿Qué compatibilidad se rompió?

<details><summary>Solución razonada</summary>

La ABI sigue igual, pero cambió contrato conductual de threading. Documenta dispatcher, entrega UI en main o exige al adapter hacerlo y añade prueba consumidor. API dump no detecta semántica.
</details>

## Rúbrica del proyecto

| Criterio | Inicial | Competente | Experto |
|---|---|---|---|
| Frontera | Exporta todo | Facade y adapters idiomáticos | Sharing justificado por semántica/coste y consumers reales |
| Concurrencia | Callback sin lifecycle | Cancelación y dispatch documentados | Carreras, respuesta tardía y ownership cross-runtime probados |
| Memoria | Confía en GC | Scopes/recursos cerrados | Retención cruzada medida y eliminada |
| Compatibilidad | SemVer manual | API check y migraciones | ABI, conducta, schemas y N-2 demostrados |
| Operación | Logs genéricos | Símbolos y versión correlacionada | Matriz, rollout asíncrono y forward fix ensayados |

## Bibliografía y fundamento académico

- Kotlin Multiplatform Documentation: source sets, platform APIs, iOS integration y publicación.
- Kotlin/Native Documentation: memory manager, GC metrics e interoperabilidad Swift/Objective-C.
- Kotlin API guidelines: backward compatibility y binary compatibility validation.
- Documentación oficial de coroutines, Ktor, kotlinx.serialization y SQLDelight.
- CS2023: Specialized Platform Development, Software Engineering, PDC y Security.
- SWEBOK V4: Architecture, Design, Construction, Testing, Configuration Management y Operations.

Los resultados observables son reducir una frontera, cancelar/liberar trabajo entre runtimes, detener ruptura ABI/schema, consumir artefactos publicados y diagnosticar un defecto common simbolizado en ambas plataformas.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://kotlinlang.org/docs/multiplatform/get-started.html), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 46 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Kotlin | `null safety` · `data classes` · `sealed types` · `genéricos` · `coroutines` · `Flow` · `serialization` · `time e IO` | sync RutaFlow |
| Estructura | `targets` · `source sets` · `commonMain y commonTest` · `expect/actual` · `Gradle` · `version catalogs` · `convention plugins` | sync RutaFlow |
| Datos | `HTTP client` · `almacenamiento` · `SQLDelight` · `repositorios` · `caché` · `offline-first` · `sincronización` · `errores tipados` | sync RutaFlow |
| UI | `Compose Multiplatform` · `estado` · `recursos` · `localización` · `navegación` · `deep links` · `accesibilidad` · `UI testing` | sync RutaFlow |
| Interop | `Swift export` · `Objective-C` · `UIKit y SwiftUI` · `Android` · `JVM` · `JS y Wasm` · `C interop` · `ownership` | sync RutaFlow |
| Entrega | `XCFramework` · `publicación` · `compatibilidad binaria` · `Hot Reload` · `benchmarks` · `CI multi-target` · `seguridad` | sync RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

## Resumen del módulo

- KMP comparte semántica estable; forzar detalles nativos a common crea abstracciones costosas.
- Una facade pequeña y adapters Swift/Kotlin protegen ergonomía y compatibilidad.
- El heap compartido no elimina carreras ni cierra recursos; ownership y cancelación son explícitos.
- Source, binary y behavioral compatibility son garantías distintas.
- Datos persistentes y mensajes requieren migración aunque la ABI permanezca estable.
- Android e iOS despliegan independientemente; backend/SDK deben mantener ventanas compatibles.
- Símbolos, build IDs y telemetría privada permiten reconocer una causa común con síntomas diferentes.
