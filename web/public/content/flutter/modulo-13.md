# Módulo 13: Flutter en producción — seguridad, isolates y operación

Compartir código no comparte automáticamente garantías. Flutter entrega una interfaz común sobre sistemas con permisos, almacenamiento y ciclos de vida diferentes. Este módulo endurece el proyecto integrador: examina fronteras nativas, elimina bloqueos del isolate de UI, modela sincronización y prepara releases que puedan observarse y contenerse.

## Sílabo

1. Fronteras nativas, plugins, enlaces y permisos.
2. Secretos, almacenamiento y privacidad por plataforma.
3. Isolates, frame budget, memoria y rendimiento medible.
4. Sincronización, observabilidad y releases seguros.

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Un incremento pequeño, probado y reproducible del capítulo.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
flutter doctor -v
flutter --version
git --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
flutter create --org com.academia academia-labs/flutter_app
cd academia-labs/flutter_app
git init
flutter pub get
```

Trabaja dentro de `academia-labs/flutter_app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/flutter_app/
├─ lib/features/
│  └─ module-13/
├─ tests/
├─ docs/decisions/
├─ evidence/module-13/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Una API Dart puede terminar en una frontera nativa | `lib/features/module-13/topic-1-una-api-dart-puede-terminar-en-una-frontera-nativa.dart` | prueba + salida observable |
| 2. Los secretos no pertenecen al binario | `lib/features/module-13/topic-2-los-secretos-no-pertenecen-al-binario.dart` | prueba + salida observable |
| 3. Fluidez se mide contra el presupuesto de cada frame | `lib/features/module-13/topic-3-fluidez-se-mide-contra-el-presupuesto-de-cada-frame.dart` | prueba + salida observable |
| 4. Producción exige protocolo, telemetría y contención | `lib/features/module-13/topic-4-produccion-exige-protocolo-telemetria-y-contencion.dart` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/flutter_app`:

```bash
flutter analyze && flutter test
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Un incremento pequeño, probado y reproducible del capítulo.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula pérdida de red, permiso denegado o widget desmontado; comprueba la recuperación sin errores ocultos. Guarda en `evidence/module-13/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Flutter en producción — seguridad, isolates y operación** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Una API Dart puede terminar en una frontera nativa

**Conceptos clave:** sandbox, permission, entitlement, manifest, plugin, platform channel, deep link, Universal Link, App Link, validation, authentication, authorization y threat model.

Un plugin ejecuta código Android/iOS con capacidades reales. Audita mantenedor, actividad, dependencias, permisos y código nativo; elimina plugins no usados. Revisa `AndroidManifest.xml`, entitlements y descripciones de privacidad resultantes del build, no solo `pubspec.yaml`. Pide permisos en contexto y conserva una ruta útil al rechazo.

Todo link o mensaje de channel es entrada no confiable. Valida esquema, host, ruta, tipos, tamaños y rangos; luego autentica y autoriza el recurso. Un App Link o Universal Link verifica asociación de dominio, no propiedad del dato.

```dart
TaskId parseTaskLink(Uri uri, Session session) {
  if (uri.scheme != 'https' || uri.host != 'tasks.example.com') {
    throw const FormatException('Origen inválido');
  }
  if (uri.pathSegments.length != 2 || uri.pathSegments.first != 'tasks') {
    throw const FormatException('Ruta inválida');
  }
  final id = TaskId.parse(uri.pathSegments.last);
  if (!session.canRead(id)) throw const ForbiddenException();
  return id;
}
```

**Analogía:** Flutter es un intérprete común entre dos edificios; cada puerta nativa conserva su propia cerradura y reglamento.

**¿Por qué es importante?** porque el código multiplataforma hereda la superficie de ambas plataformas y de cada plugin.

**Casos de uso reales:** plugin abandonado, permiso sobrante, deep link a cuenta ajena, channel que acepta una ruta arbitraria y clave incluida en el bundle.

**Diagrama:**

```text
Dart -> plugin/channel -> Android/iOS capability
entrada externa -> validar -> autenticar -> autorizar -> dominio
```

### Tema 2: Los secretos no pertenecen al binario

**Conceptos clave:** data classification, minimization, Keychain, Android Keystore, secure storage, backup, log redaction, screenshot, clipboard, token rotation, logout y privacy manifest.

Una clave compilada puede extraerse; ningún `.env` empacado es bóveda. El cliente puede contener identificadores públicos, pero una credencial con autoridad debe vivir en servidor. Para tokens de usuario usa un plugin mantenido que delegue a Keychain/Keystore y configura accesibilidad, backup y autenticación según amenaza. Conserva datos grandes en almacenamiento privado con cifrado mantenido y política de retención.

```dart
abstract interface class SessionVault {
  Future<void> writeRefreshToken(String token);
  Future<String?> readRefreshToken();
  Future<void> clear();
}

Future<void> logout(SessionVault vault, LocalDatabase db) async {
  await syncEngine.cancel();
  await vault.clear();
  await db.deleteCurrentAccountData();
  state.invalidateSession();
}
```

Revisa copias: logs, analytics, crash reports, backups, notificaciones y capturas. Redacta por defecto y documenta qué SDK recoge qué dato y con qué propósito. Prueba cambio de cuenta y restauración; borrar un token sin borrar caché puede exponer la sesión anterior.

**Analogía:** el almacén seguro es una caja fuerte, pero el dato también deja huellas en recibos, cámaras y papeleras.

**¿Por qué es importante?** porque la mayoría de exposiciones ocurren en copias secundarias o configuración, no rompiendo cifrado.

**Casos de uso reales:** API key en assets, token en preferencias, email en crash report, base restaurada en otro dispositivo y datos persistentes tras logout.

**Diagrama:**

```text
dato -> ¿necesario? -> clasificar -> vault/base protegida
                              -> retención/borrado
                              -> logs/telemetría redactados
```

### Tema 3: Fluidez se mide contra el presupuesto de cada frame

**Conceptos clave:** event loop, UI isolate, frame budget, jank, raster thread, isolate, `compute`, transfer cost, allocation, image cache, DevTools, timeline y benchmark.

El isolate principal procesa eventos y construye UI. Una transformación CPU-bound larga impide responder aunque use `Future`: `async` libera durante espera, no paraleliza cálculo. Mueve parseo o compresión suficientemente pesada a otro isolate, enviando datos transferibles y resultados pequeños. No crees isolates para operaciones diminutas: copiar mensajes y coordinar también cuesta.

```dart
List<Task> decodeTasks(String body) =>
    (jsonDecode(body) as List)
        .cast<Map<String, Object?>>()
        .map(Task.fromJson)
        .toList(growable: false);

Future<List<Task>> decodeOffUi(String body) => compute(decodeTasks, body);
```

Perfila en modo profile y dispositivo representativo. Usa Performance/CPU/Memory views para localizar frames lentos, rebuilds, asignaciones y retenciones. Dimensiona imágenes, pagina listas, usa builders perezosos y cancela streams/controladores. `const` puede reducir trabajo, pero no corrige un algoritmo caro ni una imagen gigante.

**Analogía:** el isolate de UI es una caja única de supermercado; enviar un inventario enorme allí bloquea a todos, pero abrir otra caja para un caramelo tampoco compensa.

**¿Por qué es importante?** porque una app correcta que pierde frames o agota memoria sigue siendo una app defectuosa para el usuario.

**Casos de uso reales:** JSON grande al navegar, thumbnails a resolución completa, lista sin paginación, stream no cancelado y animación evaluada solo en debug.

**Diagrama:**

```text
evento -> UI isolate -> build/layout/paint -> frame
             | trabajo CPU grande
             +-> worker isolate -> resultado pequeño -> estado
```

### Tema 4: Producción exige protocolo, telemetría y contención

**Conceptos clave:** source of truth, outbox, idempotency key, version conflict, backoff, connectivity, background execution, symbol file, crash-free sessions, feature flag, staged rollout, migration y rollback.

Offline-first requiere fuente local y outbox persistente. Una mutación conserva UUID estable, versión base, intento y siguiente fecha. El servidor deduplica la clave; cambiarla al reintentar puede duplicar efectos. La conectividad solo dispara intentos: no prueba disponibilidad. Define políticas de conflicto por dominio y muestra estados pendiente, fallido o en conflicto.

```dart
final class PendingMutation {
  PendingMutation(this.id, this.entityId, this.baseVersion, this.payload);
  final String id; // clave de idempotencia estable
  final String entityId;
  final int baseVersion;
  final Map<String, Object?> payload;
  int attempts = 0;
}
```

Publica símbolos para interpretar crashes ofuscados y separa versión/build por plataforma. Mide sesiones sin crash, errores de sync, arranque y frames lentos sin capturar datos personales. Ensaya migraciones con bases antiguas. Despliega por cohortes, observa y detén; un feature flag limita una función, pero requiere propietario y eliminación. Android e iOS pueden necesitar estrategias distintas y ambas deben constar en el runbook.

**Analogía:** un release es un puente abierto por carriles mientras sensores vigilan carga; no una cinta que se corta para todo el tráfico.

**¿Por qué es importante?** porque la capacidad de detectar y contener un fallo determina su impacto real.

**Casos de uso reales:** escritura duplicada, crash sin símbolos, migración incompatible, rollout detenido y comportamiento diferente entre tiendas.

**Diagrama:**

```text
local DB -> outbox -> API/idempotencia -> reconciliar
build -> pruebas -> cohorte -> métricas -> ampliar o contener
```

## Revisión oficial de plataforma — julio de 2026

### Flutter 3.44, Dart 3.11 y migraciones controladas

La documentación estable revisada refleja **Flutter 3.44** y **Dart 3.11**. Dart 3.11 consolida tooling alrededor de **dot shorthand**, introducido en 3.10; una sintaxis más corta no debe ocultar tipos en lugares ambiguos. Flutter publica cambios incompatibles y guías de migración por separado de las notas de parches. Actualiza SDK, Gradle/AGP, CocoaPods/Xcode y plugins con una matriz de dispositivos y plataformas.

**Aplicación al proyecto:** ejecuta `flutter analyze`, pruebas y builds antes/después, migra un caso legible a dot shorthand, revisa breaking changes desde la versión origen y conserva rollback del lockfile y artefactos firmados.

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

1. Audita plugins, permisos, entitlements y manifest; registra cinco amenazas y pruebas negativas.
2. Implementa `SessionVault`, logout completo y política de redacción. Verifica cambio de cuenta.
3. Perfila una carga CPU-bound; mueve solo el cuello probado a isolate y compara frames/tiempo/memoria.
4. Construye una outbox y simula respuesta perdida, conflicto, cancelación y reconexión.
5. Genera builds con símbolos, prueba una migración y redacta rollout/rollback para ambas tiendas.

Entrega código, tests, captura de DevTools, tabla antes/después, threat model y runbook reproducible.

## Ejercicios de evaluación

1. Explica por qué envolver un parseo pesado en `Future` no evita jank.
2. Diseña el contrato idempotente de “crear pedido” cuando se pierde la respuesta.
3. Clasifica tema visual, refresh token y adjunto médico, indicando almacén, backup y borrado.

### Soluciones orientativas

1. El cálculo sigue ejecutándose en el mismo isolate; `Future` modela finalización, no paralelismo. Se requiere reducir trabajo o usar otro isolate.
2. El cliente conserva UUID y el servidor almacena UUID→resultado; el mismo reintento devuelve el resultado original.
3. Tema en preferencias; token en Keychain/Keystore; adjunto privado protegido, con retención mínima, backup deliberado y borrado por cuenta.

## Rúbrica del proyecto

| Criterio | Peso | Evidencia |
|---|---:|---|
| Seguridad multiplataforma | 25% | Fronteras, permisos, plugins y secretos auditados con pruebas. |
| Rendimiento | 20% | Perfil reproducible y mejora medida, sin optimización por intuición. |
| Integridad offline | 25% | Outbox, idempotencia y conflictos demostrados. |
| Operabilidad | 20% | Métricas, símbolos, migración y contención. |
| Comunicación | 10% | Runbook y decisiones con límites explícitos. |

## Bibliografía y fundamento académico

- Flutter Documentation, *Performance best practices*, *Concurrency and isolates* y *Security*.
- Dart Documentation, *Concurrency in Dart* y *Effective Dart*.
- Android Developers, *App security best practices*; Apple Developer, *Security and Privacy*.
- OWASP, *Mobile Application Security Verification Standard*.
- Kleppmann, M., *Designing Data-Intensive Applications*.
- Beyer et al., *Site Reliability Engineering*.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://docs.flutter.dev/), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 53 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Dart | `null safety` · `types` · `classes y mixins` · `collections` · `futures` · `streams` · `isolates` · `records` · `patterns` · `extensions` | app conductor RutaFlow |
| UI | `widget-element-render object` · `constraints` · `state` · `navigation` · `forms` · `Material y Cupertino` · `animation` · `gestures` | app conductor RutaFlow |
| Arquitectura | `views y view models` · `repositories` · `services` · `domain` · `DI` · `explicit states` · `error handling` | app conductor RutaFlow |
| Datos | `HTTP` · `serialization` · `SQLite` · `files` · `secure storage` · `cache` · `offline-first` · `outbox` · `sync` · `deep links` | app conductor RutaFlow |
| Plataforma | `platform channels` · `FFI` · `plugins` · `add-to-app` · `web y desktop` · `location` · `maps` · `background` · `notifications` | app conductor RutaFlow |
| Producción | `unit/widget/integration tests` · `golden tests` · `DevTools` · `performance` · `accessibility` · `l10n` · `security` · `flavors` · `stores` | app conductor RutaFlow |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en una vertical RutaFlow. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

## Resumen del módulo

Flutter reduce duplicación de interfaz, no elimina fronteras nativas. Una entrega experta audita plugins y permisos, protege todas las copias, mantiene el isolate de UI libre, sincroniza mediante contratos idempotentes y publica con telemetría, migraciones y contención verificables.
