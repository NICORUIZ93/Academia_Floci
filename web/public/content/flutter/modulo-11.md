# Módulo 11: Publicación en App Store y Google Play

## Sílabo

**Objetivo general**

Llevar una sola base de código Flutter a las dos tiendas de aplicaciones principales, generando builds de release separados para Android e iOS, configurando iconos y splash screens consistentes, y automatizando ambos builds con un pipeline de CI/CD.

**Objetivos específicos**

1. Generar un build de release para Android con `flutter build appbundle`.
2. Generar un build de release para iOS con `flutter build ipa`.
3. Configurar el ícono de la app y el splash screen.
4. Configurar un pipeline básico que automatice ambos builds.

**Contenido**

- Build de release para Android (App Bundle).
- Build de release para iOS (Archive).
- Configuración de iconos y splash screens.
- CI/CD con Codemagic/Fastlane.

**Evaluación**

Builds de release generados para Android e iOS listos para subir a sus tiendas, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Builds de release para cada plataforma

**Conceptos clave:** una sola base de código, pero artefactos de build específicos y separados por tienda.

```bash
flutter build appbundle --release
```

`flutter build appbundle` genera el mismo formato `.aab` (App Bundle) requerido por Google Play Console, exactamente el mismo artefacto y las mismas ventajas ya estudiadas en el track de Android nativo (Módulo 11 de ese track): Play genera automáticamente APKs optimizados por dispositivo a partir de ese único bundle.

```bash
flutter build ipa --release
```

`flutter build ipa` requiere específicamente un entorno macOS con Xcode instalado (dado que, igual que en el desarrollo nativo de iOS, el toolchain de compilación para producir binarios iOS solo está disponible en macOS), y genera un archivo `.ipa` firmado con los certificados y provisioning profiles configurados (Módulo 11 del track de iOS), listo para subir a App Store Connect exactamente por el mismo proceso que una app iOS nativa.

Esta necesidad de generar dos artefactos de build completamente distintos y específicos de cada plataforma, a pesar de compartir una única base de código Dart, ilustra un matiz importante sobre el alcance real de "una sola base de código" en Flutter: la unificación ocurre a nivel del código fuente de la app (Dart, widgets, lógica de negocio), pero el proceso final de empaquetado, firma y distribución sigue requiriendo pasos específicos e inevitablemente distintos para cada tienda de aplicaciones, dado que Google Play y App Store tienen requisitos de formato, firma y proceso de revisión completamente independientes entre sí.

**Analogía:** generar builds separados para Android e iOS desde una única base de código Dart es como imprimir el mismo documento maestro en dos formatos de papel completamente distintos requeridos por dos oficinas de archivo diferentes, cada una con sus propias especificaciones de encuadernado y presentación, aunque el contenido intelectual del documento en sí sea exactamente el mismo en ambos casos.

**¿Por qué es importante?** Aunque el código Dart es compartido, cada tienda requiere un artefacto de build específico y un proceso de firma completamente distinto, reflejando que la unificación de Flutter ocurre a nivel de código fuente, no a nivel del proceso de publicación en sí.

**Prueba en terminal:**

```bash
flutter build appbundle --release   # → .aab para Google Play Console
flutter build ipa --release          # → .ipa para App Store Connect (requiere macOS/Xcode)
```

### Tema 2: Iconos y splash screens

**Conceptos clave:** configuración declarativa que genera automáticamente los múltiples formatos requeridos por cada plataforma.

```yaml
# pubspec.yaml
flutter_launcher_icons:
  image_path: "assets/icon.png"
flutter_native_splash:
  image: "assets/splash.png"
```

```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

Los paquetes `flutter_launcher_icons` y `flutter_native_splash` toman una única imagen fuente declarada en `pubspec.yaml` y generan automáticamente todas las variantes de tamaño y formato específicas que cada plataforma requiere (múltiples resoluciones de ícono para distintas densidades de pantalla en Android, los formatos específicos de Apple para iOS), evitando que el desarrollador tenga que producir y mantener manualmente cada una de esas variantes por separado, un proceso considerablemente más tedioso y propenso a inconsistencias si se hiciera manualmente para cada plataforma y cada resolución requerida.

**Analogía:** estos paquetes son como un servicio de impresión que recibe un único diseño maestro y produce automáticamente todas las variantes de tamaño y formato requeridas por distintos tipos de soporte (tarjetas, carteles, pancartas), sin que el diseñador original tenga que adaptar manualmente el diseño a cada formato de salida específico.

**¿Por qué es importante?** Generar automáticamente las variantes de ícono y splash screen requeridas por cada plataforma a partir de una única imagen fuente evita el trabajo manual tedioso y propenso a inconsistencias de producir cada variante por separado.

**Prueba en terminal:**

```bash
dart run flutter_launcher_icons        # genera todas las variantes de ícono por plataforma
dart run flutter_native_splash:create  # genera el splash screen nativo por plataforma
```

### Tema 3: CI/CD con Codemagic o Fastlane

**Conceptos clave:** pipeline automatizado con pasos específicos por plataforma, a pesar del código compartido.

```yaml
# codemagic.yaml
workflows:
  android-release:
    scripts:
      - flutter build appbundle --release
    artifacts:
      - build/**/outputs/**/*.aab
```

Codemagic (un servicio de CI/CD especializado específicamente en apps Flutter) o Fastlane (la misma herramienta de automatización de release estudiada en Kotlin Multiplatform, Módulo 10 de ese track) automatizan la secuencia completa de build, firma y distribución para ambas plataformas, reduciendo el proceso manual de publicación a un pipeline configurado una única vez y ejecutado consistentemente en cada release; sin embargo, una sola base de código Flutter no elimina la necesidad de pasos **separados** dentro de ese mismo pipeline para Android e iOS (firma con credenciales distintas, builds con herramientas distintas, subida a portales de distribución distintos), dado que la unificación de Flutter opera exclusivamente a nivel del código fuente de la app, no a nivel de las herramientas y procesos de publicación de cada tienda, que permanecen inevitablemente específicos de cada plataforma.

Este matiz es importante para calibrar expectativas realistas sobre "una sola base de código": Flutter reduce drásticamente el esfuerzo de desarrollo de la lógica y UI de la app compartida entre plataformas, pero no elimina por completo el trabajo de configuración específico de publicación que cada tienda de aplicaciones exige de forma independiente entre sí.

**Analogía:** un pipeline de CI/CD para Flutter es como una línea de producción centralizada que fabrica el mismo producto base para dos mercados distintos, pero que igual necesita estaciones de empaquetado y etiquetado separadas y específicas para cada mercado de destino, dado que cada uno exige su propio formato de presentación final e inevitablemente distinto.

**¿Por qué es importante?** Automatizar ambos builds con un solo pipeline ahorra el esfuerzo manual repetido de cada release, pero no elimina la necesidad de pasos específicos y separados por plataforma dentro de ese pipeline, dado que cada tienda exige su propio proceso de firma y distribución independiente.

**Configuración del ejemplo:**

```yaml
workflows:
  android-release:
    scripts: [flutter build appbundle --release]
    artifacts: [build/**/outputs/**/*.aab]
  ios-release:
    scripts: [flutter build ipa --release]
    artifacts: [build/ios/**/*.ipa]
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

**Objetivo del laboratorio:** generar builds de release para Android e iOS listos para subir a sus tiendas.

**Requisitos previos:** Módulo 10 completado, macOS con Xcode para el build de iOS.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Generar el build de release para Android | `flutter build appbundle --release` | `.aab` para Play Console |
| 2 | Generar el build de release para iOS | `flutter build ipa --release` | Requiere macOS/Xcode |
| 3 | Configurar ícono y splash screen | Ver Tema 2 | `flutter_launcher_icons`/`flutter_native_splash` |
| 4 | Configurar un pipeline básico | Ver Tema 3 | Codemagic o Fastlane |

**Verificación:** el laboratorio se considera exitoso si ambos builds (`.aab` e `.ipa`) se generan correctamente sin errores, y si el ícono y splash screen se aplican consistentemente en ambas plataformas.

**Errores comunes y soluciones**

- **Intentar generar el build de iOS sin macOS/Xcode disponible.** Requiere específicamente ese entorno; usa una máquina macOS o un runner de CI con macOS.
- **Producir manualmente cada variante de ícono por plataforma y resolución.** Usa `flutter_launcher_icons` para generarlas automáticamente.
- **Asumir que un solo pipeline elimina toda la especificidad de plataforma.** El pipeline igual necesita pasos separados de firma y distribución por tienda.

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

- Google, *Flutter Documentation* y guías de arquitectura y rendimiento.
- Google, *Dart Language Documentation* y *Effective Dart*.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `flutter build appbundle` genera el mismo `.aab` requerido por Google Play; `flutter build ipa` requiere macOS/Xcode, igual que iOS nativo.
- Aunque el código Dart es compartido, cada tienda requiere un artefacto de build y un proceso de firma completamente específico.
- `flutter_launcher_icons`/`flutter_native_splash` generan automáticamente las variantes requeridas por cada plataforma a partir de una única imagen fuente.
- Un pipeline de CI/CD reduce el esfuerzo manual repetido, pero igual necesita pasos separados y específicos por plataforma.

**Conceptos aprendidos**

- Build de release para Android (App Bundle).
- Build de release para iOS (Archive).
- Configuración de iconos y splash screens.
- CI/CD con Codemagic/Fastlane.

**Próximos pasos**

En el Módulo 12, el proyecto integrador final, unirás widgets, estado, networking y persistencia en una app real multiplataforma completa.

**Recursos adicionales**

- Documentación oficial de builds de release en Flutter (docs.flutter.dev/deployment).
