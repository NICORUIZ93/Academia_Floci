# Módulo 11: Publicación en Google Play

## Sílabo

**Objetivo general**

Llevar la app del emulador a usuarios reales: firmarla correctamente, generar un App Bundle, subirla a un track de pruebas en Play Console, y entender el versionado semántico y las políticas relevantes de la plataforma.

**Objetivos específicos**

1. Generar una keystore y configurar la firma de release.
2. Generar un Android App Bundle (`.aab`) firmado.
3. Subir el `.aab` a un track de pruebas internas en Play Console.
4. Definir `versionCode` y `versionName` con versionado semántico.
5. Revisar políticas relevantes de Google Play para la app.

**Contenido**

- Firma de la app y App Bundles.
- Play Console: tracks de release.
- Versionado semántico de la app.
- Políticas de Google Play.

**Evaluación**

App Bundle firmado, listo para subir a un track de pruebas internas en Play Console, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Firma de la app

**Conceptos clave:** identidad criptográfica de la app, requisito de Play para actualizaciones.

```kotlin
android {
    signingConfigs {
        create("release") {
            storeFile = file("keystore.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "mi-app"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
}
```

Firmar una app con una keystore establece su identidad criptográfica: Google Play (y Android en general) usa esa firma para verificar que una actualización futura de la app efectivamente proviene del mismo desarrollador que la publicó originalmente, rechazando cualquier intento de subir una actualización firmada con una clave distinta. Leer las credenciales de firma desde variables de entorno (`System.getenv(...)`) en vez de hardcodearlas directamente en el archivo `build.gradle.kts` evita que esas credenciales sensibles queden expuestas en el control de versiones del proyecto, un principio de seguridad idéntico al de mantener secretos fuera del código fuente en cualquier stack (variables de entorno, gestores de secretos en CI/CD).

Perder la keystore original de una app ya publicada es un problema grave y en gran medida irreversible: sin acceso a esa misma clave de firma, no es posible publicar una actualización de la misma app existente en Play Store bajo el mismo listado, forzando en el peor caso a publicar la app como una entrada completamente nueva, perdiendo todo el historial de reseñas, instalaciones y posicionamiento acumulado.

**Analogía:** la firma de una app es como el sello notarial único de un documento oficial: cualquier "actualización" del documento sin ese mismo sello exacto se rechaza como potencialmente fraudulenta, y perder el sello original hace imposible certificar futuras versiones bajo la misma identidad legal.

**¿Por qué es importante?** La firma verifica que las actualizaciones futuras provienen del mismo desarrollador original; perder la keystore es en gran medida irreversible y puede forzar a republicar la app desde cero, perdiendo todo el historial acumulado.

**Casos de uso reales:**
- Configurar el CI (Fastlane, Módulo 10 de Kotlin Multiplatform) para firmar automáticamente cada build de release.
- Guardar una copia de respaldo segura de la keystore en un gestor de secretos de la empresa, no en el laptop de una sola persona.
- Rotar las credenciales de firma tras la salida de un desarrollador que tenía acceso a ellas.

**Código del ejemplo:**

```kotlin
signingConfigs {
    create("release") {
        storeFile = file("keystore.jks")
        storePassword = System.getenv("KEYSTORE_PASSWORD")  // nunca hardcodeado en el repo
    }
}
```

### Tema 2: App Bundle vs APK

**Conceptos clave:** optimización de descarga por dispositivo, generada por Play a partir de un único artefacto.

```bash
./gradlew bundleRelease   # genera app-release.aab
```

Google Play requiere subir un **App Bundle** (`.aab`) en vez de un APK universal tradicional: a partir de ese único bundle, Play genera automáticamente APKs optimizados y específicos para cada combinación de arquitectura de CPU, idioma y densidad de pantalla del dispositivo de cada usuario que descarga la app, reduciendo significativamente el tamaño de descarga real que recibe cada usuario individual comparado con un APK universal que tendría que incluir recursos para todas las configuraciones posibles simultáneamente, sin poder saber de antemano cuáles necesitará específicamente cada dispositivo.

Este modelo de "un artefacto de build, múltiples artefactos de distribución optimizados" traslada la responsabilidad de optimización de tamaño desde el desarrollador (que históricamente debía generar y mantener manualmente APKs separados por configuración, o aceptar un APK universal más pesado) hacia la infraestructura de Google Play, simplificando el proceso de build mientras mejora el resultado final para el usuario.

**Analogía:** un App Bundle es como enviar el molde maestro completo de un producto a un centro de distribución que fabrica localmente la versión exacta que cada tienda regional necesita (el idioma, el empaque, las especificaciones locales), en vez de fabricar de antemano una única versión universal que deba contener todas las variantes posibles simultáneamente, aumentando innecesariamente su tamaño y costo de envío.

**¿Por qué es importante?** Google Play requiere un App Bundle en vez de un APK universal porque permite generar APKs optimizados por dispositivo a partir de un único artefacto, reduciendo el tamaño de descarga real para cada usuario sin trasladar esa responsabilidad de optimización al desarrollador.

**Casos de uso reales:**
- Reducir el tamaño de descarga de una app con recursos en 10 idiomas, entregando solo el idioma del dispositivo del usuario.
- Auditar el tamaño real de descarga por configuración con el Android Studio App Bundle Explorer antes de un release.
- Detectar que un recurso pesado innecesario se incluye en todas las variantes por un error de configuración del bundle.

**Diagrama:**

```
app-release.aab (un único artefacto)
        ↓ Google Play genera automáticamente
APK optimizado para (ARM64, español, xxhdpi)
APK optimizado para (x86, inglés, hdpi)
... (por cada combinación de dispositivo real)
```

### Tema 3: Versionado, tracks y políticas

**Conceptos clave:** dos identificadores con propósitos distintos, validación gradual antes de producción.

```kotlin
android {
    defaultConfig {
        versionCode = 12        // entero, SIEMPRE incremental, lo usa Play internamente
        versionName = "1.3.0"   // string visible al usuario, semver
    }
}
```

`versionCode` es un entero que debe incrementarse estrictamente en cada release subido a Play Console (Play lo usa internamente para determinar cuál de dos builds es "más nueva", rechazando un upload con un `versionCode` menor o igual al ya publicado); `versionName` es un string libre, visible directamente al usuario en la ficha de la app, típicamente siguiendo versionado semántico (`MAJOR.MINOR.PATCH`) para comunicar de forma legible la magnitud de los cambios de cada release. Ambos importan por razones distintas y complementarias: `versionCode` es el mecanismo técnico que Play usa para ordenar releases inequívocamente, mientras `versionName` es el mecanismo comunicativo dirigido a humanos.

```
Pruebas internas → Pruebas cerradas → Pruebas abiertas → Producción
```

Cada track de Play Console permite validar la app progresivamente con un grupo cada vez más amplio de usuarios reales antes del lanzamiento completo a producción, detectando problemas (crashes, malas reseñas tempranas, bugs específicos de ciertos dispositivos) con un impacto limitado antes de exponer la app a la totalidad de la base de usuarios potenciales; revisar las políticas de Google Play sobre permisos sensibles, la sección de Data Safety (privacidad de datos declarada) y contenido apropiado es esencial dado que Play rechaza o suspende activamente apps que las violan, incluso después de una publicación exitosa inicial.

**Analogía:** `versionCode` es como el número de serie interno incremental de un producto industrial, usado por la fábrica para rastrear inequívocamente cuál lote es más reciente; `versionName` es como el nombre comercial de la versión que ve el consumidor en la caja; los tracks de Play son como fases sucesivas de un ensayo clínico (grupo pequeño controlado, grupo intermedio, público general), cada una reduciendo el riesgo antes de la aprobación completa.

**¿Por qué es importante?** `versionCode` y `versionName` cumplen roles distintos (ordenamiento técnico interno vs comunicación legible al usuario); los tracks de Play Console permiten detectar problemas con impacto limitado antes del lanzamiento completo; las políticas de Play pueden causar rechazo o suspensión incluso después de una publicación inicial exitosa.

**Casos de uso reales:**
- Publicar una nueva versión mayor primero a "Pruebas cerradas" con el equipo interno antes de exponerla a producción.
- Detectar un crash específico de un fabricante de dispositivo concreto en pruebas abiertas antes del rollout completo.
- Revisar la sección Data Safety antes de cada release para evitar un rechazo automático de Play por permisos no declarados.

**Diagrama:**

```
versionCode: 11 → 12 → 13 ...  (entero, SIEMPRE incremental, uso interno de Play)
versionName: "1.2.0" → "1.3.0" ... (string semver, visible al usuario)
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

**Objetivo del laboratorio:** generar un App Bundle firmado, listo para subir a un track de pruebas internas en Play Console.

**Requisitos previos:** Módulo 10 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Generar una keystore y configurar la firma | Ver Tema 1 | `signingConfigs` en `build.gradle.kts` |
| 2 | Generar el `.aab` firmado | `./gradlew bundleRelease` | En vez de un APK universal |
| 3 | Subir el `.aab` a pruebas internas | Play Console | Primer track de validación |
| 4 | Definir `versionCode`/`versionName` con semver | Ver Tema 3 | Incremental y legible respectivamente |
| 5 | Revisar al menos 3 políticas relevantes | Ver Tema 3 | Privacidad, permisos, contenido |

**Verificación:** el laboratorio se considera exitoso si el `.aab` generado está correctamente firmado con la keystore de release, y si se sube exitosamente al track de pruebas internas de Play Console sin errores de validación.

**Errores comunes y soluciones**

- **Hardcodear las credenciales de la keystore en `build.gradle.kts`.** Léelas desde variables de entorno para no exponerlas en el control de versiones.
- **Olvidar incrementar `versionCode` en un nuevo release.** Play rechaza el upload si no es estrictamente mayor al ya publicado.
- **Ignorar la sección de Data Safety antes de publicar.** Puede causar rechazo o suspensión de la app en revisión.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué un App Bundle en vez de un APK universal

**Enunciado:** ¿por qué Google Play requiere un App Bundle en vez de un APK universal?

**Solución esperada:** a partir de un único bundle, Play genera automáticamente APKs optimizados para cada combinación de arquitectura, idioma y densidad de pantalla del dispositivo del usuario, reduciendo el tamaño de descarga real comparado con un APK universal que debería incluir recursos para todas las configuraciones posibles simultáneamente.

**Criterios de éxito:**
- Explica correctamente la generación de APKs optimizados por dispositivo como razón.

### Ejercicio 2: Diferencia entre versionCode y versionName

**Enunciado:** ¿qué diferencia hay entre `versionCode` y `versionName`, y por qué ambos importan?

**Solución esperada:** `versionCode` es un entero estrictamente incremental usado internamente por Play para ordenar releases inequívocamente y rechazar uploads no incrementales; `versionName` es un string visible al usuario (típicamente semver) que comunica la magnitud del cambio de forma legible para humanos.

**Criterios de éxito:**
- Distingue correctamente el propósito técnico interno de `versionCode` frente al propósito comunicativo de `versionName`.

### Ejercicio 3: Propósito de los tracks de Play Console

**Enunciado:** ¿qué propósito cumplen los tracks progresivos de Play Console (pruebas internas → cerradas → abiertas → producción)?

**Solución esperada:** permiten validar la app con un grupo cada vez más amplio de usuarios reales antes del lanzamiento completo, detectando problemas (crashes, bugs específicos de dispositivos) con un impacto limitado antes de exponer la app a la totalidad de la base de usuarios potenciales.

**Criterios de éxito:**
- Explica correctamente la validación progresiva con impacto limitado como propósito de los tracks.

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

- La firma de la app establece su identidad criptográfica; perder la keystore original es en gran medida irreversible.
- Un App Bundle permite a Play generar APKs optimizados por dispositivo, reduciendo el tamaño de descarga real.
- `versionCode` (incremental, uso interno) y `versionName` (semver, visible al usuario) cumplen roles distintos y complementarios.
- Los tracks de Play Console permiten validación progresiva antes del lanzamiento completo; las políticas de Play pueden causar rechazo o suspensión.

**Conceptos aprendidos**

- Firma de la app y App Bundles.
- Play Console: tracks de release.
- Versionado semántico de la app.
- Políticas de Google Play.

**Próximos pasos**

En el Módulo 12, el proyecto integrador final, unirás Compose, Room, Retrofit, Hilt y testing en una app Android real y completa.

**Recursos adicionales**

- Documentación oficial de Play Console (support.google.com/googleplay/android-developer).
