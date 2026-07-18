# Módulo 13: Android en producción — seguridad, sincronización y calidad

Una app móvil se ejecuta en un dispositivo que puede perderse, restaurarse, quedarse días sin red o recibir intents de otras aplicaciones. El APK puede inspeccionarse y la versión instalada puede permanecer meses. Este módulo endurece el proyecto final considerando esas condiciones en lugar de asumir un dispositivo confiable y siempre conectado.

## Sílabo

1. Amenazas móviles, permisos, componentes y deep links.
2. Keystore, datos sensibles, backups, logs y secretos.
3. Sincronización offline, idempotencia y resolución de conflictos.
4. ANR, crashes, rendimiento y releases graduales.
5. Proyecto: auditoría operativa y de seguridad de la app.

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un incremento pequeño, probado y reproducible del capítulo.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
java --version
./gradlew --version
adb version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
# Android Studio: New Project → Empty Activity → Kotlin + Compose
cd academia-labs/android-app
git init
./gradlew tasks
```

Trabaja dentro de `academia-labs/android-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/android-app/
├─ app/src/main/java/academy/
│  └─ module-13/
├─ tests/
├─ docs/decisions/
├─ evidence/module-13/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. El sistema operativo conecta tu app con entradas externas | `app/src/main/java/academy/module-13/topic-1-el-sistema-operativo-conecta-tu-app-con-entradas-exter.kt` | prueba + salida observable |
| 2. Proteger datos exige conocer copias y ciclo de vida | `app/src/main/java/academy/module-13/topic-2-proteger-datos-exige-conocer-copias-y-ciclo-de-vida.kt` | prueba + salida observable |
| 3. Offline-first necesita un protocolo de cambios | `app/src/main/java/academy/module-13/topic-3-offline-first-necesita-un-protocolo-de-cambios.kt` | prueba + salida observable |
| 4. La calidad se opera por dispositivo y versión | `app/src/main/java/academy/module-13/topic-4-la-calidad-se-opera-por-dispositivo-y-version.kt` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/android-app`:

```bash
./gradlew testDebugUnitTest
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un incremento pequeño, probado y reproducible del capítulo.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula permiso denegado, proceso recreado o dato ausente; verifica que la pantalla conserve un estado comprensible. Guarda en `evidence/module-13/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Android en producción — seguridad, sincronización y calidad** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: El sistema operativo conecta tu app con entradas externas

**Conceptos clave:** sandbox, UID, permission, runtime permission, exported component, intent, PendingIntent, deep link, App Link, validation, Network Security Configuration, cleartext, TLS, WebView y threat model.

Android asigna UID y sandbox, pero componentes declarados pueden abrir fronteras. Activity, service, receiver o provider exportado acepta llamadas externas según manifest y permisos. Declara `android:exported` intencionalmente y exporta solo lo necesario. Un intent recibido es entrada no confiable aunque el tipo Kotlin parezca correcto.

Los permisos se piden cuando la función los necesita, con explicación y alternativa. No solicites contactos si basta Photo Picker o selector del sistema. Maneja rechazo y “no volver a preguntar” sin bloquear el resto de la app. Un permiso concedido no autoriza usos secundarios inesperados; minimización y propósito forman parte del contrato.

```kotlin
fun parseTaskLink(uri: Uri, session: Session): TaskId {
    require(uri.scheme == "https")
    require(uri.host == "tasks.example.com")
    require(uri.pathSegments.size == 2 && uri.pathSegments.first() == "tasks")
    val id = TaskId.parse(uri.pathSegments.last())
    require(session.canRead(id))
    return id
}
```

Un deep link no concede autorización. Valida scheme, host, path, longitud y parámetros; después autentica y autoriza el recurso. Android App Links verificados reducen secuestro de enlaces, pero el servidor sigue protegiendo datos. No ejecutes acciones destructivas directamente al abrir una URL; muestra contexto y confirmación.

`PendingIntent` delega identidad de tu app. Hazlo inmutable salvo necesidad, usa intent explícito y datos mínimos. Un pending intent mutable o implícito puede ser redirigido o alterado.

Network Security Configuration puede desactivar cleartext y acotar autoridades de confianza. No instales un trust manager que acepta todo ni desactives hostname verification para “arreglar” desarrollo. Usa CA de debug solo en configuración debug. Certificate pinning tiene costes de rotación y disponibilidad; aplícalo únicamente con estrategia de backup pins y actualización.

WebView es navegador embebido: evita JavaScript interfaces con contenido no confiable, restringe navegación, file access y mixed content. Prefiere Custom Tabs para contenido web externo.

**Analogía:** el manifest es el plano de puertas de un edificio. El sandbox protege paredes, pero cada puerta exportada necesita propósito, cerradura y validación de quien entra.

**¿Por qué es importante?** porque ataques móviles suelen entrar por intents, enlaces y configuración, sin romper cifrado ni sandbox.

**Casos de uso reales:** deep link a cuenta ajena, receiver exportado, PendingIntent mutable, HTTP accidental, CA de debug en release, WebView con bridge y permiso excesivo.

**Diagrama:**

```text
otra app/web -> intent/deep link -> componente exportado
                                  -> validar forma
                                  -> autenticar/autorizar
                                  -> confirmar efecto
red -> Network Security Config -> TLS/host -> API
```

### Tema 2: Proteger datos exige conocer copias y ciclo de vida

**Conceptos clave:** data classification, minimization, app-private storage, Android Keystore, non-exportable key, user authentication, AES-GCM, DataStore, Room, backup rules, screenshot, clipboard, notification, log, API key, access token y logout.

Clasifica datos antes de cifrar: público, interno, sensible y credencial. No guardar es la defensa más fuerte. El almacenamiento privado limita otras apps, pero backups, dispositivo comprometido, logs o capturas pueden crear copias. Define retención y borrado por cuenta.

Android Keystore mantiene material de clave no exportable y permite exigir autenticación o limitar usos. Guarda claves, no grandes payloads. Cifra con construcción autenticada mantenida, como Tink o AES-GCM correctamente configurado, y conserva versión/nonce con ciphertext. No reutilices nonce con la misma clave.

```kotlin
val generator = KeyGenerator.getInstance(
    KeyProperties.KEY_ALGORITHM_AES,
    "AndroidKeyStore",
)
generator.init(
    KeyGenParameterSpec.Builder(
        "local_sensitive_v1",
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
    )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .build(),
)
val key = generator.generateKey()
```

Una API key dentro de source, resources, BuildConfig o native library puede extraerse del APK. Restríngela en proveedor por package/firma/API/cuota cuando sea posible y mueve privilegios reales al backend. Access tokens son de usuario, cortos y revocables; no contraseñas persistentes.

Configura backup/data extraction rules. Datos cifrados con una clave no restaurable pueden quedar inútiles tras restauración; decide excluirlos o implementar recuperación segura. Prueba backup en otro dispositivo/perfil. Logout debe revocar sesión servidor, cancelar workers, borrar DB/caches/archivos y claves correspondientes sin borrar datos de otra cuenta.

Evita PII/tokens en Logcat, crash reports y analytics. Redacta URLs/headers. Notificaciones aparecen en lock screen: ofrece contenido privado ocultable. `FLAG_SECURE` puede evitar screenshots para pantallas realmente sensibles, pero reduce accesibilidad/soporte y no sustituye threat model. Limpia clipboard o evita copiar secretos.

**Analogía:** cifrar el cajón principal no protege fotocopias que quedaron en backup, logs, notificación o portapapeles. El inventario de copias precede al algoritmo.

**¿Por qué es importante?** porque el teléfono cambia de dueño, se respalda y muestra contenido fuera de la Activity. La privacidad debe sobrevivir al ciclo completo, no solo a Room.

**Casos de uso reales:** token en interceptor log, DB en backup, clave perdida tras restore, notificación en lock screen, screenshot financiero, logout parcial y API key extraída.

**Diagrama:**

```text
dato sensible -> ¿necesario? -> storage privado -> cifrado con key Keystore
                         copias: backup | logs | crash | notification | clipboard
logout -> revoke -> cancel work -> delete data/cache/key -> verify
```

### Tema 3: Offline-first necesita un protocolo de cambios

**Conceptos clave:** source of truth, local-first read, pending mutation, operation ID, outbox, tombstone, version, vector, conflict, last-write-wins, merge, idempotency, WorkManager, unique work, backoff y reconciliation.

La UI lee exclusivamente la fuente local. Una escritura crítica offline se guarda en Room junto con una operación pendiente en la misma transacción. Cada operación tiene UUID estable, baseVersion, payload y estado. WorkManager drena al volver red; reintentos conservan operation ID.

```kotlin
@Transaction
suspend fun renameOffline(taskId: String, title: String, baseVersion: Long) {
    tasks.updateTitle(taskId, title, SyncState.PENDING)
    outbox.insert(
        PendingMutation(
            operationId = UUID.randomUUID().toString(),
            entityId = taskId,
            baseVersion = baseVersion,
            kind = "rename",
            payload = encode(title),
        ),
    )
}
```

El servidor deduplica operation ID y compara versión. `409 Conflict` no es error genérico: activa política. Last-write-wins por timestamp es simple, pero relojes de dispositivo no son autoridad y puede borrar intención. Para campos independientes, merge por campo puede preservar; para texto, conflicto visible; para contadores, operación conmutativa; para saldo, servidor fuerte. Define por dominio.

Las eliminaciones necesitan tombstone hasta que todos los lados reconozcan; borrar fila inmediatamente permite que una copia antigua la resucite. Compacta tombstones con criterio del servidor.

WorkManager ofrece ejecución persistente, no exactamente una vez. Usa unique work para evitar múltiples drenajes, backoff para transitorios y constraints, pero cada mutación sigue siendo idempotente. Un worker puede morir después de confirmación antes de marcar local; al repetir obtiene resultado anterior.

Sincroniza en transacciones locales: respuesta, entidad, versión y eliminación de outbox deben ser coherentes. No marques completada antes de persistir servidor. Conserva estados `pending`, `syncing`, `conflict`, `failed-permanent` visibles a UI. No muestres “guardado” si solo está pendiente sin explicar.

Reconciliación periódica compara cursor/versiones y repara operaciones atascadas. Observa edad/longitud de cola sin IDs como labels. Prueba cambio de cuenta: nunca sincronices outbox de usuario anterior con sesión nueva.

**Analogía:** cada dispositivo trabaja en una libreta. Un número de operación evita copiar dos veces; la versión indica sobre qué edición escribió; el conflicto requiere una regla editorial, no elegir la página con hora mayor a ciegas.

**¿Por qué es importante?** porque “Room + WorkManager” no define qué ocurre si dos dispositivos editan, un ACK se pierde o el usuario cambia de cuenta.

**Casos de uso reales:** tarea creada offline, edición simultánea, delete/resurrection, ACK perdido, worker duplicado, sesión cambiada, cola corrupta y reloj incorrecto.

**Diagrama:**

```text
UI -> Room fuente local + outbox op-42 (una TX)
                          |
                    WorkManager -> API idempotente
                          |          |- accepted + version
                          |          `- conflict + current
                    Room TX: aplicar/limpiar o marcar conflicto
reconciliación -> reparar cursores/operaciones atascadas
```

### Tema 4: La calidad se opera por dispositivo y versión

**Conceptos clave:** main thread, ANR, crash, tombstone, StrictMode, coroutine dispatcher, frame, jank, Macrobenchmark, Baseline Profile, cold start, Android vitals, crash-free users, staged rollout, pre-launch report y rollback.

La UI thread procesa input y frames. I/O, locks, binder lento o cómputo allí causa jank y, si excede umbrales, ANR. `suspend` no garantiza background: una función suspend puede bloquear si ejecuta I/O síncrono. Repositorios deben ser main-safe usando dispatcher apropiado.

StrictMode en debug revela disk/network accidental y recursos. No ignores toda violación; corrige o delimita caso justificado. Para ANR observa traces de todos los hilos: main puede estar esperando un lock poseído por worker. Herramientas de crash de terceros no siempre ven todos los ANR; Android vitals aporta señal de campo.

```kotlin
class FileRepository(
    private val io: CoroutineDispatcher = Dispatchers.IO,
) {
    suspend fun load(): Data = withContext(io) {
        parser.parse(file.readText())
    }
}
```

Macrobenchmark mide startup y flujos fuera del proceso, con múltiples iteraciones y dispositivos representativos. Baseline Profiles precompilan rutas críticas para primeras ejecuciones. Mide cold/warm/hot según pregunta, frames y percentiles; no solo promedio en emulador potente.

Crashes necesitan versión, modelo, Android, estado de app y breadcrumbs mínimos sin PII. Agrupa por causa, no por texto variable. Define SLI como crash-free users/sessions y ANR rate, pero vigila cohortes: una versión puede afectar solo API antigua o fabricante.

Publica en internal/closed, luego staged rollout. Gates incluyen crashes, ANR, startup, batería y flujo de negocio. Detener rollout limita nuevos usuarios; quienes actualizaron conservan versión defectuosa. Prepara hotfix compatible y remote kill switch para función reversible, con controles para no convertirse en configuración insegura.

Rollback de APK no siempre está disponible para usuarios y versionCode debe avanzar. La base local migrada debe ser compatible con hotfix; prueba upgrade desde versiones soportadas, downgrade si política lo permite o forward fix. Conserva backups antes de migraciones destructivas.

**Analogía:** publicar móvil es enviar maquinaria a lugares donde no puedes retirarla de inmediato. Un rollout gradual reduce unidades afectadas, pero exige reparar las ya entregadas.

**¿Por qué es importante?** porque laboratorio no reproduce fabricantes, memoria, red ni versiones instaladas. La calidad real es una distribución por cohortes y release.

**Casos de uso reales:** Room en main, deadlock, ANR solo Android antiguo, cold start, baseline profile inválido, crash por fabricante, rollout detenido y migración no reversible.

**Diagrama:**

```text
commit -> tests/benchmark -> internal -> staged 5% -> vitals por versión/cohorte
                                          |- sano -> ampliar
                                          `- regresión -> detener + hotfix/kill switch
ANR -> thread traces -> bloqueo main -> dueño/recurso -> reproducción -> fix
```

## Revisión oficial de plataforma — julio de 2026

### Android 17: privacidad, compatibilidad y dispositivos grandes

**Android 17** alcanzó estabilidad de plataforma con API 37. Entre los cambios relevantes están **Encrypted Client Hello**, el **Contact Picker** que evita solicitar toda la agenda, límites por aplicación en Keystore, restricciones de URI grants, Certificate Transparency para targets nuevos y reglas de orientación/redimensionado en pantallas grandes. La disponibilidad de una API nueva no elimina la necesidad de fallback por `SDK_INT` ni de probar cambios que afectan a todas las apps.

**Aplicación al proyecto:** reemplaza `READ_CONTACTS` por Contact Picker cuando esté disponible, prueba ECH/fallback en la capa de red, limita el ciclo de claves y ejecuta la suite en teléfono, tablet y proceso actualizado desde una versión anterior.

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

### Proyecto: app resistente a dispositivo, red y release

Trabaja sobre el proyecto 12 con backend de prueba que soporte operation ID y versiones.

1. Dibuja activos, componentes, intents, red, storage, backup y terceros. Prioriza amenazas por impacto/probabilidad.
2. Audita manifest: exported, permissions, providers, backup, cleartext y debuggable. Prueba acceso desde una app/adb no autorizados.
3. Crea deep links válidos/maliciosos: host falso, path traversal lógica, ID ajeno y acción destructiva. Corrige validación/autorización.
4. Mueve una clave local a Keystore y cifra dato de prueba con AEAD. Prueba key invalidada, restore y logout.
5. Revisa logs, analytics, crash, notificaciones, clipboard y screenshots; elimina PII/tokens y documenta retención.
6. Implementa outbox Room en la misma transacción de entidad, WorkManager unique y operation ID estable.
7. Simula ACK perdido, worker muerto, 500, 400, cambio de cuenta y cola duplicada.
8. Ejecuta dos perfiles/dispositivos offline que editan/eliminan lo mismo. Demuestra política de conflicto y tombstone.
9. Introduce I/O y lock en main para provocar jank/ANR controlado. Usa StrictMode y traces para localizarlo y corrige main-safety.
10. Crea Macrobenchmark/startup profile, mide antes/después y prueba dispositivos/API distintos.
11. Diseña rollout 5→25→100 % con gates, alerta, kill switch, migraciones y hotfix de versionCode mayor.

**Verificación:** entrega threat model, comandos adb, test de deep link, ciphertext/Keystore sin revelar claves, prueba de backup/logout, historial de sync/conflictos, trace ANR, benchmark y dashboard simulado por versión. CI ejecuta lint, unit/UI, migraciones Room y pruebas de seguridad reproducibles.

**Errores comunes y soluciones**

- Ocultar API key con ofuscación: restríngela o mueve privilegio al servidor; el APK se inspecciona.
- Exportar para que “funcione”: reduce frontera y agrega intent explícito/permisos/validación.
- Trust manager que acepta todo: usa CA de debug acotada mediante Network Security Config.
- Cifrar DB pero loguear payload: inventaría todas las copias y minimiza.
- Last-write-wins universal: define conflicto por semántica, versiones y experiencia.
- Asumir WorkManager exactly-once: operation ID e idempotencia sobreviven a reejecución.
- Usar `suspend` como prueba de main-safety: mueve bloqueo con dispatcher y mide.
- Detener rollout como rollback: planifica hotfix para instalaciones ya afectadas.

## Ejercicios de evaluación

### Ejercicio 1: secreto en APK

Una clave está en `local.properties` y se copia a BuildConfig solo en CI. ¿Es secreta para usuarios?

<details><summary>Solución razonada</summary>

No aparece en Git, pero queda dentro del artefacto y puede extraerse. Restringe la clave por identidad/cuota y deja operaciones privilegiadas en backend; usa secretos de CI solo para build/signing que no deban llegar al APK.
</details>

### Ejercicio 2: ACK perdido

Servidor aceptó op-42 y la app murió antes de limpiar outbox. ¿Qué ocurre al reiniciar?

<details><summary>Solución razonada</summary>

WorkManager reenvía op-42. El servidor reconoce operation ID y devuelve resultado previo; una transacción local aplica versión y elimina pendiente. Generar op-43 duplicaría intención.
</details>

### Ejercicio 3: ANR indirecto

Main thread espera un `Mutex` y el dueño hace I/O. ¿Dónde está la causa?

<details><summary>Solución razonada</summary>

El stack main muestra espera, pero el hilo/coroutine dueño y la sección crítica larga explican bloqueo. Reduce sección, no sostengas lock durante I/O y mueve operación; analiza todos los hilos.
</details>

## Rúbrica del proyecto

| Criterio | Inicial | Competente | Experto |
|---|---|---|---|
| Superficie | Permisos/componentes amplios | Manifest y links validados | Ataques adb/app y autorización demostrados |
| Datos | Cifra un campo | Keystore, backups y logout coherentes | Copias, rotación, restore y privacidad auditadas |
| Sync | Último write ciego | Outbox/versiones/idempotencia | Conflictos multi-dispositivo y reconciliación probados |
| Calidad | Crash reporter | StrictMode, ANR y benchmark | Cohortes/vitals y causa raíz reproducible |
| Release | Publicación total | Staged rollout y gates | Hotfix, kill switch y migraciones ensayados |

## Bibliografía y fundamento académico

- Android Developers: Security Checklist, Keystore, Cryptography, Network Security Configuration y riesgos de deep links.
- Android Developers: guía de arquitectura offline-first, WorkManager y source of truth.
- Android Developers: Android vitals, ANR, Macrobenchmark y Baseline Profiles.
- OWASP MASVS/MSTG como referencia complementaria de verificación móvil.
- CS2023: Security, HCI, Software Engineering y Specialized Platform Development.
- SWEBOK V4: Construction, Testing, Quality, Security, Architecture y Operations.

Los resultados observables son bloquear una frontera móvil explotable, proteger/eliminar datos en todo su ciclo, converger cambios offline sin duplicación y diagnosticar/limitar una regresión por versión.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://developer.android.com/develop), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 52 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Plataforma | `componentes` · `lifecycle` · `configuration changes` · `intents` · `deep links` · `permisos` · `storage` · `procesos y memoria` | app conductor RutaFlow |
| Compose | `estado y recomposición` · `layout` · `Material 3` · `navegación` · `listas` · `animación` · `adaptive UI` · `semantics` | app conductor RutaFlow |
| Arquitectura | `UDF` · `ViewModel` · `coroutines y Flow` · `repositorios` · `dominio` · `modularización` · `DI` · `errores` | app conductor RutaFlow |
| Datos | `Room` · `DataStore` · `networking` · `paging` · `cache` · `offline-first` · `sync` · `WorkManager` · `conflictos` | app conductor RutaFlow |
| Dispositivo | `location` · `geofencing` · `maps` · `camera` · `scanning` · `sensors` · `Bluetooth` · `notifications` · `foreground services` · `batería` | app conductor RutaFlow |
| Producción | `testing` · `Macrobenchmark` · `Baseline Profiles` · `ANR` · `memoria` · `accesibilidad` · `seguridad` · `Play Integrity` · `rollout` | app conductor RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

## Resumen del módulo

- Manifest, intents y deep links son APIs externas y requieren mínimo privilegio, validación y autorización.
- Keystore protege material de clave; no convierte API keys embebidas en secretos.
- Privacidad incluye backups, logs, crashes, notificaciones, clipboard y logout.
- Offline-first necesita outbox, operation ID, versiones, conflictos, tombstones y reconciliación.
- WorkManager garantiza trabajo persistente, no efecto exactamente una vez.
- `suspend` no garantiza main-safety; ANR requiere analizar todos los hilos.
- Rollout gradual limita alcance, pero las instalaciones afectadas necesitan hotfix compatible.
