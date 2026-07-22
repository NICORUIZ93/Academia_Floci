# Módulo 13: iOS en producción — seguridad, sincronización y operación

Una app no termina cuando compila ni cuando pasa revisión. En producción recibe enlaces manipulados, pierde conectividad a mitad de una escritura, conserva versiones antiguas y maneja datos en dispositivos que pueden extraviarse. Este módulo convierte el proyecto final en un sistema operable: explicita amenazas, protege datos, sincroniza sin duplicar efectos y aprende de fallos reales.


## Aprende construyendo

### Tema 1: El sandbox reduce superficie, pero no valida intenciones

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema desde cero. Prerrequisitos: macOS, Xcode y Swift; verifica `xcodebuild -version`.
#### Paso 2 · Contexto y caso real
Una app de entregas recibe entradas no confiables; el límite de confianza debe ser explícito.
#### Paso 3 · Teoría, modelo mental y analogía
La analogía es una frontera con controles: validar, autenticar, autorizar y registrar.
#### Paso 4 · Demostración guiada
Crea Sources/SecurityDemo.swift y ejecuta el ejemplo desde una carpeta vacía.
```bash
swift package init --type executable
swift test
```
Resultado esperado: pruebas verdes.
#### Paso 5 · Práctica guiada
Pista: introduce una entrada inválida para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade un caso límite y una prueba de regresión.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: estudiar persistencia. Errores comunes: secretos en logs y permisos excesivos. Fuente oficial: https://developer.apple.com/documentation/security.
**Conceptos clave:** sandbox, entitlement, capability, least privilege, runtime permission, URL scheme, Universal Link, associated domain, input validation, authentication, authorization y threat model.

iOS aísla procesos y exige capacidades firmadas, pero una frontera abierta sigue recibiendo datos no confiables. Audita los entitlements generados, activa únicamente capacidades necesarias y separa configuraciones de desarrollo y producción. Pedir acceso a cámara, fotos, ubicación o contactos requiere propósito concreto, texto comprensible y una ruta alternativa cuando el usuario rechaza el permiso.

Los custom URL schemes pueden ser reclamados por otras apps. Para rutas web sensibles prefiere Universal Links con asociación entre dominio y aplicación. Esa verificación prueba qué app debe abrir el dominio; no demuestra que el usuario pueda leer el recurso. Valida esquema, host, ruta, tamaño y forma de los parámetros; después autentica, autoriza y confirma efectos destructivos.

```swift
enum LinkError: Error { case malformed, forbidden }

func taskID(from url: URL, session: Session) throws -> TaskID {
    guard url.scheme == "https",
          url.host == "tasks.example.com",
          url.pathComponents.count == 3,
          url.pathComponents[1] == "tasks",
          let id = TaskID(rawValue: url.pathComponents[2])
    else { throw LinkError.malformed }
    guard session.canRead(id) else { throw LinkError.forbidden }
    return id
}
```

Construye un modelo de amenazas pequeño antes del código: activos, actores, entradas, fronteras y mitigaciones. Incluye notificaciones, widgets, App Intents, extensiones, pasteboard y contenido remoto. Una extensión comparte menos privilegios, pero un App Group crea almacenamiento compartido que debe tratarse como frontera explícita.

**Analogía:** el sandbox es el perímetro de una biblioteca; un Universal Link es una puerta con dirección verificada. Aun así, el bibliotecario debe comprobar qué libro puede consultar cada visitante.

**¿Por qué es importante?** porque una entrada válida técnicamente puede intentar acceder a otra cuenta o ejecutar una acción inesperada.

**Casos de uso reales:** enlace a un identificador ajeno, permiso solicitado al iniciar sin contexto, URL scheme secuestrado, entitlement sobrante y widget que expone información en pantalla bloqueada.

**Diagrama:**

```text
web/notificación/widget -> frontera iOS -> validar estructura
                                      -> autenticar sesión
                                      -> autorizar recurso
                                      -> confirmar efecto
                                      -> dominio
```

### Tema 2: Proteger datos es controlar todas sus copias

#### Paso 1 · Objetivo y preparación
Al finalizar podrás proteger datos desde cero. Prerrequisitos: macOS, Xcode y Swift; verifica `xcodebuild -version`.
#### Paso 2 · Contexto y caso real
Los datos de una entrega sobreviven copias y pantallas; minimiza cada exposición.
#### Paso 3 · Teoría, modelo mental y analogía
La analogía es una cadena de custodia: cada copia necesita dueño y vencimiento.
#### Paso 4 · Demostración guiada
Crea Sources/PrivacyDemo.swift y ejecuta el ejemplo desde una carpeta vacía.
```bash
swift package init --type executable
swift test
```
Resultado esperado: pruebas verdes.
#### Paso 5 · Práctica guiada
Pista: busca un secreto en logs para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade borrado y prueba de backup.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: estudiar offline. Errores comunes: tokens en texto plano y capturas sensibles. Fuente oficial: https://developer.apple.com/documentation/security.
**Conceptos clave:** clasificación, minimización, Keychain, access class, Data Protection, Secure Enclave, backup, log redaction, screenshot, pasteboard, notification preview, privacy manifest, token y logout.

Clasifica antes de almacenar: público, interno, sensible y credencial. Define retención y borrado. Los tokens no pertenecen a `UserDefaults`; usa Keychain con una accesibilidad coherente con la función. `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` evita migración a otro dispositivo y acceso mientras está bloqueado, aunque puede ser demasiado restrictivo para tareas de fondo. La decisión es de producto y amenaza, no una receta universal.

```swift
func saveToken(_ data: Data, account: String) throws {
    let query: [CFString: Any] = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrService: "com.example.tasks.session",
        kSecAttrAccount: account,
        kSecValueData: data,
        kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    SecItemDelete(query as CFDictionary)
    guard SecItemAdd(query as CFDictionary, nil) == errSecSuccess else {
        throw SessionError.keychainWrite
    }
}
```

Keychain protege secretos pequeños; no es una base de datos. Para archivos y bases locales usa Data Protection apropiada y evita inventar criptografía. Secure Enclave puede proteger operaciones con claves, pero no vuelve seguro un flujo que filtra el resultado en logs o UI. Redacta identificadores, nunca registres tokens y usa `Logger` con privacidad explícita.

Revisa copias involuntarias: backups, cachés, miniaturas, portapapeles, notificaciones, capturas y archivos compartidos. En logout elimina credenciales, memoria derivada y datos por cuenta, cancela tareas y revoca el token en servidor cuando corresponda. Documenta las APIs y SDK que recolectan datos, su finalidad y las declaraciones de privacidad requeridas; la privacidad efectiva debe coincidir con lo comunicado en App Store Connect.

**Analogía:** guardar una joya en una caja fuerte no ayuda si su fotografía, combinación y recibo quedan sobre la mesa.

**¿Por qué es importante?** porque las filtraciones suelen surgir de copias secundarias y telemetría, no del almacén principal.

**Casos de uso reales:** token en preferencias, base incluida en backup, email visible en log, código de acceso en notificación y datos de la cuenta anterior tras cambiar usuario.

**Diagrama:**

```text
dato -> clasificar -> ¿necesario? --no--> no guardar
                    --sí--> Keychain / archivo protegido / base
                              -> retención -> borrado verificable
                              -> logs y UI redactados
```

### Tema 3: Offline-first es un protocolo, no una caché

#### Paso 1 · Objetivo y preparación
Al finalizar podrás sincronizar datos desde cero. Prerrequisitos: macOS, Xcode y Swift; verifica `xcodebuild -version`.
#### Paso 2 · Contexto y caso real
La red se corta durante una entrega; la operación debe ser idempotente.
#### Paso 3 · Teoría, modelo mental y analogía
La analogía es una cola con recibos: cada comando tiene identidad y estado.
#### Paso 4 · Demostración guiada
Crea Sources/SyncDemo.swift y ejecuta el ejemplo desde una carpeta vacía.
```bash
swift package init --type executable
swift test
```
Resultado esperado: pruebas verdes.
#### Paso 5 · Práctica guiada
Pista: repite un comando para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade conflicto, reintento acotado y prueba.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: estudiar operación. Errores comunes: reintentos no idempotentes y relojes sin versión. Fuente oficial: https://developer.apple.com/documentation/foundation/url_loading_system.
**Conceptos clave:** source of truth, outbox, state machine, idempotency key, retry, exponential backoff, jitter, reachability, optimistic UI, version, conflict, tombstone, background task y cancellation.

Leer una caché sin red es útil, pero offline-first exige definir qué ocurre con escrituras. Mantén una fuente local observable y una outbox persistente. Cada operación tiene identidad estable, payload, estado, intentos y próxima fecha. La interfaz confirma que el cambio está pendiente; un worker lo envía y reconcilia la respuesta.

```swift
struct PendingMutation: Codable, Identifiable {
    enum State: String, Codable { case queued, sending, failed }
    let id: UUID                 // también es clave de idempotencia
    let taskID: UUID
    let baseVersion: Int
    let operation: Operation
    var state: State
    var attempts: Int
    var nextAttemptAt: Date
}

actor SyncEngine {
    func drain() async {
        for mutation in await store.readyMutations() {
            guard !Task.isCancelled else { return }
            await sendAndReconcile(mutation)
        }
    }
}
```

Reintentar no garantiza seguridad: si el servidor aplicó el cambio pero la respuesta se perdió, un POST nuevo puede duplicarlo. Envía la misma clave de idempotencia y exige que el servidor recuerde el resultado. Usa backoff con jitter para fallos transitorios, respeta `Retry-After` y no reintentes validación o autorización. `NWPathMonitor` ayuda a decidir cuándo probar, pero “hay red” no significa “el servicio funciona”.

Los conflictos son requisito de dominio. Con versiones, el servidor puede rechazar una escritura sobre estado viejo. Elige política por campo: server-wins para autoridad, client-wins solo si es aceptable, merge para datos compatibles o resolución humana cuando perder una intención sería grave. Las eliminaciones necesitan tombstones para no resucitar registros. `BGTaskScheduler` ofrece oportunidades limitadas, no ejecución garantizada; el flujo debe progresar también al abrir la app.

**Analogía:** la outbox es una oficina postal con comprobantes numerados. Puede reenviar el mismo sobre, pero el receptor sabe que no debe cobrar dos veces.

**¿Por qué es importante?** porque conectividad móvil parcial convierte operaciones aparentemente simples en efectos duplicados, perdidos o fuera de orden.

**Casos de uso reales:** marcar tarea en metro, editar desde dos dispositivos, respuesta perdida después de crear, logout con cola pendiente y migración mientras existe trabajo offline.

**Diagrama:**

```text
UI -> base local -> outbox(queued) -> API + idempotency-key
 ^                                      |
 |            reconciliar/version <-----+
 +-- estado pendiente/error/conflicto
```

### Tema 4: Operar significa detectar, limitar y aprender del fallo

#### Paso 1 · Objetivo y preparación
Al finalizar podrás operar una app desde cero. Prerrequisitos: macOS, Xcode y Swift; verifica `xcodebuild -version`.
#### Paso 2 · Contexto y caso real
Una versión real necesita medir, limitar y revertir cambios.
#### Paso 3 · Teoría, modelo mental y analogía
La analogía es un centro de control: métricas convierten señales en decisiones.
#### Paso 4 · Demostración guiada
Crea Sources/OperationsDemo.swift y ejecuta el ejemplo desde una carpeta vacía.
```bash
swift package init --type executable
swift test
```
Resultado esperado: pruebas verdes.
#### Paso 5 · Práctica guiada
Pista: fuerza una métrica fuera de rango para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade alerta, rollback y prueba de migración.
#### Paso 7 · Cierre y evidencia
Entrega código, salida, fallo y corrección; explica el resultado. Siguiente paso: revisar publicación. Errores comunes: alertas sin acción y logs sin contexto. Fuente oficial: https://developer.apple.com/documentation/metrickit.
**Conceptos clave:** crash, hang, launch time, memory pressure, MetricKit, Instruments, os_signpost, structured logging, SLI, release train, TestFlight, phased release, migration, feature flag y rollback.

“No crashea en mi teléfono” no es evidencia. Define indicadores ligados a experiencia: sesiones sin crash, tasa de hangs, tiempo de arranque, éxito de sincronización y latencia percibida. MetricKit entrega diagnósticos agregados; Instruments permite investigar CPU, memoria, energía, red y bloqueos; signposts delimitan operaciones del dominio sin llenar logs de datos personales.

```swift
import OSLog

let points = OSSignposter(subsystem: "com.example.tasks", category: "sync")

func measuredSync() async throws {
    let state = points.beginInterval("outbox-drain")
    defer { points.endInterval("outbox-drain", state) }
    try await syncEngine.sync()
}
```

Evita trabajo pesado en `MainActor`; mide antes de optimizar y prueba con dispositivos/perfiles realistas. Un hang puede ser peor que un crash porque el usuario no recibe salida clara. Trata memoria y energía como presupuestos: imágenes dimensionadas, paginación, cancelación de tareas y trabajo de fondo limitado.

Cada release necesita migración ensayada con datos de versiones anteriores, compatibilidad de API y plan de contención. TestFlight valida con grupos pequeños; un despliegue gradual reduce exposición, pero no reemplaza observabilidad. Feature flags deben tener propietario y fecha de retiro. Si la base migra de forma irreversible, “volver al binario anterior” puede no funcionar: diseña migraciones expand/contract o restauración explícita.

**Analogía:** operar una app es pilotar con instrumentos. La vista por la ventana ayuda, pero las alarmas, métricas y listas de comprobación permiten reaccionar antes del accidente.

**¿Por qué es importante?** porque todo software real falla; la calidad profesional depende del radio de impacto, detección y recuperación.

**Casos de uso reales:** hang en arranque, fuga de imágenes, migración que falla con datos antiguos, API incompatible y release que aumenta errores de sincronización.

**Diagrama:**

```text
TestFlight -> cohorte pequeña -> métricas sanas? -> despliegue gradual
                                      no -> contener/flag/corregir
producción -> MetricKit/signposts -> reproducir en Instruments -> aprendizaje
```

## Revisión oficial de plataforma — julio de 2026

### Swift 6.2 y actualizaciones SwiftUI de 2026

**Swift 6.2** introduce concurrencia más gradual: aislamiento principal por defecto opcional, ejecución async más intuitiva y `@concurrent` para trabajo realmente concurrente. También mejora Swift Testing, memoria estricta y diagnóstico async. SwiftUI 2026 incorpora `ContentBuilder`, nuevas capacidades de reordenamiento/swipe, caché configurable de AsyncImage y cambios de estado al compilar con toolchains recientes. La versión del compilador y el deployment target son dimensiones distintas.

**Aplicación al proyecto:** activa comprobación de concurrencia en una rama, mueve decodificación CPU-bound a `@concurrent`, agrega una prueba de carrera y documenta disponibilidad/fallback antes de adoptar ContentBuilder o APIs SwiftUI nuevas.


## Laboratorio práctico

Convierte el proyecto del módulo 12 en una entrega preparada para producción.

1. Dibuja activos, entradas y fronteras; registra cinco amenazas con mitigación y prueba.
2. Audita `.entitlements`, permisos y enlaces. Añade pruebas para host, ruta, identificador y autorización.
3. Mueve la sesión a Keychain, redacta logs y documenta qué ocurre en logout, backup y pantalla bloqueada.
4. Implementa una outbox persistente. Simula respuesta perdida, reintento, conflicto de versión, cancelación y cambio de cuenta.
5. Instrumenta sincronización con signposts y perfílala en Instruments. Define cuatro indicadores y umbrales.
6. Prueba una migración con datos de una versión anterior y redacta un release plan con TestFlight, despliegue gradual y contención.

La entrega contiene código, pruebas, capturas del perfil, tabla de amenazas, política de datos y runbook. Una afirmación sin evidencia reproducible cuenta como hipótesis, no como resultado.




## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://developer.apple.com/documentation/swiftui), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 56 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Swift | `value types` · `optionals` · `protocols` · `generics` · `errors` · `collections` · `ARC` · `ownership` · `Swift packages` | app conductor RutaFlow |
| SwiftUI | `View` · `identity` · `state` · `Observation` · `environment` · `layout` · `navigation` · `animations` · `gestures` · `localization` | app conductor RutaFlow |
| Concurrencia | `async/await` · `Task` · `task groups` · `actors` · `MainActor` · `Sendable` · `cancelación` · `AsyncSequence` · `Swift 6 isolation` | app conductor RutaFlow |
| Datos | `URLSession` · `Codable` · `SwiftData y Core Data` · `cache` · `offline-first` · `migrations` · `CloudKit` · `Keychain` · `files` | app conductor RutaFlow |
| Plataforma | `Core Location` · `MapKit` · `background tasks` · `push` · `camera` · `biometrics` · `widgets` · `App Intents` · `UIKit interop` | app conductor RutaFlow |
| Producción | `Swift Testing` · `XCTest` · `UI tests` · `Instruments` · `VoiceOver` · `energy` · `privacy` · `signing` · `TestFlight` · `crashes` | app conductor RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->
