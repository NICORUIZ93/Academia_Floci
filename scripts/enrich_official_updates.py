#!/usr/bin/env python3
"""Inserta de forma idempotente la revisión oficial de julio de 2026."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = "## Revisión oficial de plataforma — julio de 2026"
UPDATES = {
    "javascript/modulo-13.md": """### ECMAScript vivo, propuestas y fechas modernas

La referencia estable del curso es **ECMAScript 2026**. La especificación viva de TC39 ya incorpora propuestas terminadas para la siguiente edición, pero una propuesta solo se enseña como parte del lenguaje cuando alcanza **Stage 4**; etapas anteriores se estudian como experimentos y nunca como requisito de producción. `Temporal` resuelve fechas, horas, zonas y duraciones con tipos explícitos, evitando mutaciones y ambigüedades habituales de `Date`. Antes de usarlo verifica soporte del runtime o selecciona un polyfill mantenido, mide su coste y prueba cambios de zona y horario de verano.

**Aplicación al proyecto:** reemplaza una fecha logística modelada como string por `Temporal.Instant` más zona de presentación; prueba un cambio de horario y documenta fallback. Revisa también ECMA-402 para internacionalización y registra la edición consultada en el README.
""",
    "node/modulo-13.md": """### Línea LTS, línea Current y APIs del runtime

Producción debe partir de **Node.js 24 LTS** mientras **Node.js 26** se evalúa como línea Current. Node 26 habilita `Temporal` por defecto y actualiza V8, Undici y deprecaciones; eso no justifica migrar sin probar dependencias, imágenes, rendimiento y observabilidad. Distingue API estable, experimental y retirada leyendo notas de la versión mayor y cada release de seguridad. El soporte nativo de TypeScript no reemplaza comprobación de tipos ni todas las transformaciones de un compilador.

**Aplicación al proyecto:** ejecuta contratos y benchmarks en una matriz 24/26, prueba fechas con Temporal, convierte deprecaciones en fallo controlado de CI y conserva Node 24 como runtime de despliegue hasta aprobar la evidencia.
""",
    "angular/modulo-14.md": """### Angular v22 y adopción según estabilidad

La documentación activa corresponde a **Angular v22**. La ruta moderna prioriza signals, control flow integrado, componentes standalone y operación **zoneless**, pero la migración se ejecuta con `ng update` y la guía oficial, no reescribiendo la aplicación. El roadmap distingue estable, developer preview y experimental. **Web MCP** aparece como experimental: sirve para explorar integración con herramientas, pero no debe convertirse en dependencia crítica ni confundirse con una garantía estable.

**Aplicación al proyecto:** actualiza una copia mediante la guía 21→22, ejecuta migraciones y pruebas, compara detección de cambios zoneless, revisa compatibilidad Node/TypeScript/RxJS y registra APIs experimentales en un ADR con salida reversible.
""",
    "react/modulo-13.md": """### React 19.2, Compiler y seguridad de Server Components

**React 19.2** incorpora `Activity`, `useEffectEvent`, `cacheSignal`, Performance Tracks y capacidades de pre-render parcial. `useEffectEvent` separa lógica no reactiva de un efecto sin mentir al linter; no es una forma general de omitir dependencias. **React Compiler** 1.0 puede reducir memorización manual, pero primero exige código conforme a las reglas de React y mediciones. Las aplicaciones con React Server Components deben usar una versión parcheada —19.0.1, 19.1.2, 19.2.1 o posterior— por avisos oficiales de seguridad.

**Aplicación al proyecto:** elimina una memorización especulativa y compara Performance Tracks, modela una pantalla conservada con Activity, migra un callback de efecto a useEffectEvent y añade un gate que rechace versiones vulnerables de paquetes RSC.
""",
    "java/modulo-14.md": """### Java LTS frente a entregas semestrales

La base de producción recomendada para el curso es **Java 25 LTS**; **JDK 26** sirve para estudiar la evolución semestral sin confundir previews con contratos permanentes. JDK 26 incorpora el cliente **HTTP/3**, mejoras AOT/GC y nuevas iteraciones preview/incubator de concurrencia estructurada, patrones, PEM y Vector API. Una preview requiere flags, puede cambiar y no debe filtrarse a una API pública estable.

**Aplicación al proyecto:** compila y prueba en 25 y 26, experimenta HTTP/3 contra un servidor compatible con fallback medido, registra JEP/estado de cada función y evita publicar artefactos que necesiten preview salvo decisión explícita.
""",
    "spring-boot/modulo-13.md": """### Spring Boot 4.1 y actualización con compatibilidad comprobada

**Spring Boot 4.1** añade soporte de **Spring gRPC**, mejoras de OpenTelemetry, configuración renovada de Jackson y mitigación SSRF en clientes HTTP mediante `InetAddressFilter`. Adoptar una versión mayor exige revisar release notes, Java mínimo, cambios de namespaces, starters, observabilidad y dependencias administradas. La protección SSRF complementa validación y egress; no convierte URLs suministradas por usuarios en confiables.

**Aplicación al proyecto:** migra una rama, añade una prueba que bloquee loopback/metadatos cloud mediante InetAddressFilter, instrumenta una llamada gRPC y compara trazas HTTP/gRPC antes de promover el cambio.
""",
    "kotlin-multiplatform/modulo-12.md": """### Kotlin 2.4 y estado real de cada target

La línea revisada es **Kotlin 2.4**. Compose Multiplatform se considera estable en Android, iOS y escritorio; web basado en **Wasm** continúa con un nivel de estabilidad diferente y debe aislarse. **Swift export** mejora la superficie consumida desde Swift, pero requiere revisar tipos compatibles, nombres, errores, concurrencia y evolución binaria. Actualiza Kotlin, Gradle, Android Gradle Plugin, Xcode y bibliotecas kotlinx como una matriz, no como números independientes.

**Aplicación al proyecto:** exporta una API mínima a Swift, prueba compatibilidad de fuente/binario y cancelación, compila todos los targets en CI y etiqueta cualquier uso Wasm con su nivel de estabilidad y fallback.
""",
    "android/modulo-13.md": """### Android 17: privacidad, compatibilidad y dispositivos grandes

**Android 17** alcanzó estabilidad de plataforma con API 37. Entre los cambios relevantes están **Encrypted Client Hello**, el **Contact Picker** que evita solicitar toda la agenda, límites por aplicación en Keystore, restricciones de URI grants, Certificate Transparency para targets nuevos y reglas de orientación/redimensionado en pantallas grandes. La disponibilidad de una API nueva no elimina la necesidad de fallback por `SDK_INT` ni de probar cambios que afectan a todas las apps.

**Aplicación al proyecto:** reemplaza `READ_CONTACTS` por Contact Picker cuando esté disponible, prueba ECH/fallback en la capa de red, limita el ciclo de claves y ejecuta la suite en teléfono, tablet y proceso actualizado desde una versión anterior.
""",
    "ios/modulo-13.md": """### Swift 6.2 y actualizaciones SwiftUI de 2026

**Swift 6.2** introduce concurrencia más gradual: aislamiento principal por defecto opcional, ejecución async más intuitiva y `@concurrent` para trabajo realmente concurrente. También mejora Swift Testing, memoria estricta y diagnóstico async. SwiftUI 2026 incorpora `ContentBuilder`, nuevas capacidades de reordenamiento/swipe, caché configurable de AsyncImage y cambios de estado al compilar con toolchains recientes. La versión del compilador y el deployment target son dimensiones distintas.

**Aplicación al proyecto:** activa comprobación de concurrencia en una rama, mueve decodificación CPU-bound a `@concurrent`, agrega una prueba de carrera y documenta disponibilidad/fallback antes de adoptar ContentBuilder o APIs SwiftUI nuevas.
""",
    "flutter/modulo-13.md": """### Flutter 3.44, Dart 3.12.2 y migraciones controladas

La documentación estable revisada refleja **Flutter 3.44** y **Dart 3.12.2**. Dart 3.12 añade **private named parameters** y conserva `dot shorthand`, introducido en 3.10; una sintaxis más corta no debe ocultar tipos en lugares ambiguos. Flutter publica cambios incompatibles y guías de migración por separado de las notas de parches. Verifica las versiones realmente acopladas con `flutter --version`, porque Flutter incluye su propio SDK de Dart. Actualiza SDK, Gradle/AGP, CocoaPods/Xcode y plugins con una matriz de dispositivos y plataformas.

**Aplicación al proyecto:** ejecuta `flutter analyze`, pruebas y builds antes/después, migra un caso legible a dot shorthand, revisa breaking changes desde la versión origen y conserva rollback del lockfile y artefactos firmados.
""",
    "devops/modulo-14.md": """### Kubernetes 1.36, OpenTelemetry 1.59 y herramientas con ciclo propio

La revisión usa **Kubernetes 1.36** y **OpenTelemetry 1.59** como referencias, pero clusters gestionados, `kubectl`, APIs y add-ons no avanzan necesariamente juntos. Revisa deprecaciones y APIs removidas antes de subir una versión menor. OpenTelemetry define señales, SDK, OTLP y convenciones; no es el backend. **Terraform** y sus providers tienen ciclos separados: fija restricciones, lockfile y prueba el plan con cada actualización.

**Aplicación al proyecto:** escanea manifiestos por APIs obsoletas, prueba skew soportado de kubectl, valida Collector/configuración y semantic conventions, y ejecuta plan más pruebas de política antes de actualizar provider o core.
""",
    "cloud/modulo-32.md": """### Nube de evolución continua y vigilancia de retiros

No existe una versión única de AWS, Azure o Google Cloud. La revisión periódica consulta **AWS What's New**, **Azure Updates** y **Google Cloud release notes**, además de avisos de seguridad, cuotas, precios, regiones y retiros. Una novedad en preview no se convierte en arquitectura base; primero se valida disponibilidad regional, SLA, límites, IaC, observabilidad, coste, portabilidad y plan de salida. El laboratorio Floci/StackPort enseña contratos, pero las diferencias con el proveedor real se mantienen documentadas.

**Aplicación al proyecto:** selecciona tres servicios usados, registra fecha/estado/región, identifica un retiro o cambio incompatible, ejecuta pruebas contra emulador y entorno real acotado, y abre una decisión de migración con coste y rollback.
""",
}

changed = 0
for relative, body in UPDATES.items():
    path = ROOT / "web" / "public" / "content" / relative
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        continue
    anchor = "## Laboratorio práctico"
    if anchor not in text:
        raise RuntimeError(f"{path}: falta {anchor}")
    section = f"{MARKER}\n\n{body.strip()}\n\n"
    path.write_text(text.replace(anchor, section + anchor, 1), encoding="utf-8")
    changed += 1

print(f"Actualizaciones oficiales: {changed} módulos enriquecidos.")
