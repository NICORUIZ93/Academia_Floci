# Módulo 11: Publicación en App Store


## Aprende construyendo

### Tema 1: Certificados y provisioning profiles

#### Paso 1 · Objetivo y preparación
Al finalizar podrás preparar una distribución iOS desde cero. Prerrequisitos: macOS, Xcode, Apple Developer y un proyecto SwiftUI. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas debe firmarse, probarse con usuarios y publicar metadata coherente sin exponer certificados ni secretos.

#### Paso 3 · Teoría, modelo mental y analogía
Certificado identifica al firmante y provisioning profile autoriza combinación de equipo, bundle y capacidades. Archive produce un artefacto; TestFlight distribuye una versión; metadata comunica cambios y privacidad. La analogía es una cadena de custodia: identidad, permiso, paquete y registro son controles distintos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m11
cd ejemplo-ios-m11
swift package init --type executable
swift test
```
En Xcode crea Sources/App.swift en una app iOS, configura bundle identifier, firma automática y ejecuta Product > Archive; documenta el esquema y versión.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el bundle identifier o capability para provocar un fallo deliberado de firma; lee el diagnóstico y corrígelo. Resultado esperado: archive válido y exportable.

#### Paso 6 · Práctica independiente
Añade build number, changelog, privacidad, grupo TestFlight y checklist de rollback; valida que no haya secretos en el repositorio.

#### Paso 7 · Cierre y evidencia
Guarda archive, logs, metadata y checklist; como siguiente paso estudia automatización CI. Errores comunes: certificados compartidos, versionar secretos, olvidar privacy manifest y subir sin probar restore. Fuentes oficiales: https://developer.apple.com/help/account/ y https://developer.apple.com/testflight/.
**¿Por qué es importante?** Porque una aplicación no termina al compilar: debe poder firmarse, distribuirse y explicarse.
**Evidencia de aprendizaje:** entrega archive, diagnóstico, metadata y checklist; explica el resultado y conserva la salida.
**Conceptos clave:** distinción entre desarrollo y distribución, vínculo entre identidad, app y dispositivos autorizados.

Un certificado de **desarrollo** firma builds destinados a correr en dispositivos físicos específicamente registrados durante el desarrollo activo, permitiendo probar la app en un iPhone o iPad real del propio equipo antes de cualquier distribución más amplia; un certificado de **distribución** firma builds destinados a TestFlight y a la App Store, un nivel de firma distinto que autoriza la distribución más allá del círculo cerrado de dispositivos de desarrollo registrados manualmente. El provisioning profile vincula estos tres elementos en un único artefacto: el certificado (la identidad criptográfica del desarrollador o la organización), el App ID (el identificador único de la app específica), y, en el caso de perfiles de desarrollo, la lista explícita de dispositivos físicos autorizados a instalar ese build.

Xcode, con la opción "Automatically manage signing" habilitada, gestiona automáticamente la mayor parte de esta configuración para proyectos individuales o equipos pequeños, generando y renovando certificados y perfiles según sea necesario sin intervención manual constante; equipos más grandes o con requisitos de firma más específicos (por ejemplo, distribución empresarial interna fuera de la App Store pública) suelen gestionar estos artefactos manualmente con mayor control.

**Analogía:** un certificado de desarrollo es como un pase de acceso temporal válido únicamente para un grupo específico de personas ya identificadas de antemano; un certificado de distribución es como una autorización de circulación pública más amplia, válida para cualquier destinatario que la reciba a través de un canal oficial de distribución (TestFlight, App Store), sin necesidad de registrar de antemano a cada destinatario individual.

**¿Por qué es importante?** Distinguir certificado de desarrollo de certificado de distribución determina qué builds pueden correr únicamente en dispositivos registrados manualmente frente a builds distribuibles más ampliamente a través de TestFlight o la App Store.

**Diagrama:**

```
Certificado de desarrollo   → builds para dispositivos registrados manualmente durante desarrollo
Certificado de distribución → builds para TestFlight y App Store
Provisioning profile        → vincula certificado + App ID + dispositivos autorizados
```

### Tema 2: Archivar, subir y TestFlight

#### Paso 1 · Objetivo y preparación
Al finalizar podrás preparar una distribución iOS desde cero. Prerrequisitos: macOS, Xcode, Apple Developer y un proyecto SwiftUI. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas debe firmarse, probarse con usuarios y publicar metadata coherente sin exponer certificados ni secretos.

#### Paso 3 · Teoría, modelo mental y analogía
Certificado identifica al firmante y provisioning profile autoriza combinación de equipo, bundle y capacidades. Archive produce un artefacto; TestFlight distribuye una versión; metadata comunica cambios y privacidad. La analogía es una cadena de custodia: identidad, permiso, paquete y registro son controles distintos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m11
cd ejemplo-ios-m11
swift package init --type executable
swift test
```
En Xcode crea Sources/App.swift en una app iOS, configura bundle identifier, firma automática y ejecuta Product > Archive; documenta el esquema y versión.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el bundle identifier o capability para provocar un fallo deliberado de firma; lee el diagnóstico y corrígelo. Resultado esperado: archive válido y exportable.

#### Paso 6 · Práctica independiente
Añade build number, changelog, privacidad, grupo TestFlight y checklist de rollback; valida que no haya secretos en el repositorio.

#### Paso 7 · Cierre y evidencia
Guarda archive, logs, metadata y checklist; como siguiente paso estudia automatización CI. Errores comunes: certificados compartidos, versionar secretos, olvidar privacy manifest y subir sin probar restore. Fuentes oficiales: https://developer.apple.com/help/account/ y https://developer.apple.com/testflight/.
**¿Por qué es importante?** Porque una aplicación no termina al compilar: debe poder firmarse, distribuirse y explicarse.
**Evidencia de aprendizaje:** entrega archive, diagnóstico, metadata y checklist; explica el resultado y conserva la salida.
**Conceptos clave:** proceso formal de empaquetado, validación beta con impacto limitado antes de producción.

```
Product → Archive → Distribute App → App Store Connect
```

Archivar la app en Xcode (`Product → Archive`) produce un artefacto de build de release completamente optimizado y firmado con el certificado de distribución, listo para subirse a través del asistente de distribución directamente hacia App Store Connect, el portal centralizado donde Apple procesa, valida y eventualmente distribuye ese build hacia testers o hacia la App Store pública.

Tras subir el build, este se procesa automáticamente en App Store Connect y queda disponible en TestFlight para testers internos (miembros del propio equipo de desarrollo, hasta 100 personas, sin ninguna revisión previa de Apple requerida para este grupo específico) o testers externos (público más amplio fuera del equipo, que sí requiere pasar por una revisión beta de Apple, más ligera y rápida que la revisión completa exigida para la App Store pública); probar exhaustivamente con TestFlight antes de enviar la app a la revisión completa de la App Store permite detectar problemas (crashes, bugs de UX, malas primeras impresiones) con un grupo controlado y de impacto limitado, evitando que esos mismos problemas se descubran directamente en producción frente a la totalidad de usuarios potenciales.

**Analogía:** TestFlight es como una función de preestreno limitada antes del estreno oficial en cines: permite recoger reacciones y corregir problemas con una audiencia reducida y controlada, antes de exponer la obra completa al público general en el estreno definitivo (la App Store).

**¿Por qué es importante?** Probar con TestFlight antes de enviar a revisión de la App Store detecta problemas con un grupo controlado de impacto limitado, evitando que esos mismos problemas se descubran directamente en producción frente a la totalidad de usuarios potenciales.

**Diagrama:**

```
Xcode Archive → App Store Connect → TestFlight (testers internos/externos) → revisión de Apple → App Store pública
```

### Tema 3: Metadata y versionado

#### Paso 1 · Objetivo y preparación
Al finalizar podrás preparar una distribución iOS desde cero. Prerrequisitos: macOS, Xcode, Apple Developer y un proyecto SwiftUI. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas debe firmarse, probarse con usuarios y publicar metadata coherente sin exponer certificados ni secretos.

#### Paso 3 · Teoría, modelo mental y analogía
Certificado identifica al firmante y provisioning profile autoriza combinación de equipo, bundle y capacidades. Archive produce un artefacto; TestFlight distribuye una versión; metadata comunica cambios y privacidad. La analogía es una cadena de custodia: identidad, permiso, paquete y registro son controles distintos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m11
cd ejemplo-ios-m11
swift package init --type executable
swift test
```
En Xcode crea Sources/App.swift en una app iOS, configura bundle identifier, firma automática y ejecuta Product > Archive; documenta el esquema y versión.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el bundle identifier o capability para provocar un fallo deliberado de firma; lee el diagnóstico y corrígelo. Resultado esperado: archive válido y exportable.

#### Paso 6 · Práctica independiente
Añade build number, changelog, privacidad, grupo TestFlight y checklist de rollback; valida que no haya secretos en el repositorio.

#### Paso 7 · Cierre y evidencia
Guarda archive, logs, metadata y checklist; como siguiente paso estudia automatización CI. Errores comunes: certificados compartidos, versionar secretos, olvidar privacy manifest y subir sin probar restore. Fuentes oficiales: https://developer.apple.com/help/account/ y https://developer.apple.com/testflight/.
**¿Por qué es importante?** Porque una aplicación no termina al compilar: debe poder firmarse, distribuirse y explicarse.
**Evidencia de aprendizaje:** entrega archive, diagnóstico, metadata y checklist; explica el resultado y conserva la salida.
**Conceptos clave:** información obligatoria para la revisión, dos identificadores con propósitos distintos.

App Store Connect requiere completar metadata específica antes de que Apple revise la app: descripción y palabras clave (relevantes para el descubrimiento en la búsqueda de la App Store), capturas de pantalla por cada tamaño de dispositivo soportado, una política de privacidad (obligatoria sin excepción para cualquier app publicada), y la clasificación de edad junto con las respuestas del cuestionario de privacidad que declara explícitamente qué datos recolecta la app y con qué propósito, información que Apple usa para mostrar la etiqueta de privacidad visible a los usuarios antes de descargar la app.

```
CFBundleShortVersionString: 1.3.0   ← versión visible (semver)
CFBundleVersion: 42                  ← número de build, debe incrementar en cada subida
```

`CFBundleShortVersionString` (la versión visible al usuario, típicamente semver) y `CFBundleVersion` (el número de build interno, que debe incrementarse estrictamente en cada subida a App Store Connect) cumplen roles análogos a `versionName` y `versionCode` en Android (Módulo 11 de ese track): uno comunica de forma legible la magnitud del cambio al usuario, el otro es el mecanismo técnico interno que la plataforma usa para ordenar builds inequívocamente y rechazar subidas no incrementales.

**Analogía:** la metadata de App Store Connect es como el expediente completo requerido antes de una inspección oficial: sin cada documento obligatorio (política de privacidad, declaración de qué se recolecta), la inspección ni siquiera puede comenzar formalmente; `CFBundleVersion` es como el número de serie interno incremental de cada lote de producción, mientras `CFBundleShortVersionString` es el nombre comercial visible al consumidor final.

**¿Por qué es importante?** La metadata obligatoria (especialmente la política de privacidad y el cuestionario de privacidad) es un requisito no negociable antes de la revisión; el versionado dual (build interno incremental, versión visible semver) cumple roles distintos y complementarios, igual que en Android.

**Diagrama:**

```
CFBundleShortVersionString: "1.3.0"   → visible al usuario, semver
CFBundleVersion: "42"                  → SIEMPRE incremental, uso interno de Apple
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** subir un build a TestFlight listo para pruebas internas.

**Requisitos previos:** Módulo 10 completado, cuenta de desarrollador de Apple.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Configurar certificado de distribución y provisioning profile | Ver Tema 1 | En la cuenta de desarrollador |
| 2 | Archivar y subir a App Store Connect | `Product → Archive` | Ver Tema 2 |
| 3 | Configurar un grupo de pruebas en TestFlight | App Store Connect | Agregarse como tester |
| 4 | Completar la metadata básica | Ver Tema 3 | Descripción, capturas, política de privacidad |
| 5 | Incrementar el número de build antes de subir | Ver Tema 3 | `CFBundleVersion` |

**Verificación:** el laboratorio se considera exitoso si el build se procesa correctamente en App Store Connect y queda disponible en TestFlight para el grupo de pruebas internas configurado, sin errores de validación de metadata o firma.

**Errores comunes y soluciones**

- **Firmar con un certificado de desarrollo en vez de distribución para subir a TestFlight.** TestFlight requiere específicamente un certificado de distribución.
- **Olvidar incrementar `CFBundleVersion` antes de una nueva subida.** App Store Connect rechaza el build si no es estrictamente mayor al ya subido.
- **Omitir la política de privacidad o el cuestionario de privacidad.** Son requisitos obligatorios antes de que la revisión pueda proceder.

---
