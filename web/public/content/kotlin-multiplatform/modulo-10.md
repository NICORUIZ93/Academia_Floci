# Módulo 10: CI/CD para KMP

## Sílabo

**Objetivo general**

Automatizar el build y la distribución de un proyecto que compila a múltiples plataformas, con pipelines Gradle multiplataforma, distribución a TestFlight/Play Console, y Fastlane.

**Objetivos específicos**

1. Configurar un pipeline de CI que compile el módulo compartido para ambos targets en cada push.
2. Agregar la ejecución de tests de `commonTest` como parte obligatoria del pipeline.
3. Configurar Fastlane para automatizar build y firma.
4. Documentar cómo extender el pipeline para distribución automática a TestFlight y Play Console.

**Contenido**

- Pipeline Gradle multiplataforma en CI.
- Distribución a TestFlight/Play Console.
- Fastlane para automatizar releases.
- Versionado compartido entre apps.

**Evaluación**

Pipeline CI que compila el módulo compartido para Android e iOS en cada push, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Pipeline CI que compila el módulo compartido para Android e iOS en cada push, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

### 1. Comprueba las herramientas

Los comandos funcionan en macOS, Linux y WSL. En PowerShell usa el equivalente indicado por la herramienta.

```bash
java --version
./gradlew --version
```

Si un comando no existe, detente e instala esa herramienta desde su sitio oficial. Cierra y abre la terminal después de modificar `PATH`. Las versiones deben ser compatibles entre sí antes de crear archivos.

### 2. Crea o recupera el proyecto del track

```bash
# Crea el proyecto con el asistente oficial de Kotlin Multiplatform
cd academia-labs/kmp-app
git init
./gradlew tasks
```

Trabaja dentro de `academia-labs/kmp-app`. Si ya existe, no lo vuelvas a generar: entra en la carpeta, confirma `git status` y continúa sobre una rama propia.

### 3. Ubica cada tema antes de escribir

```text
academia-labs/kmp-app/
├─ shared/src/commonMain/kotlin/
│  └─ module-10/
├─ tests/
├─ docs/decisions/
├─ evidence/module-10/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Pipeline Gradle multiplataforma en CI | `shared/src/commonMain/kotlin/module-10/topic-1-pipeline-gradle-multiplataforma-en-ci.kt` | prueba + salida observable |
| 2. Fastlane | `shared/src/commonMain/kotlin/module-10/topic-2-fastlane.kt` | prueba + salida observable |
| 3. Versionado compartido | `shared/src/commonMain/kotlin/module-10/topic-3-versionado-compartido.kt` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/kmp-app`:

```bash
./gradlew :shared:allTests
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Pipeline CI que compila el módulo compartido para Android e iOS en cada push, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Introduce un dato nulo o caso específico de plataforma; commonTest debe hacerlo visible. Guarda en `evidence/module-10/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **CI/CD para KMP** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Pipeline Gradle multiplataforma en CI

**Conceptos clave:** validar ambos targets en cada push, runner macOS requerido para iOS.

```yaml
jobs:
  test-common:
    steps:
      - run: ./gradlew :shared:allTests   # corre commonTest en ambos targets
  build-android:
    steps:
      - run: ./gradlew :androidApp:assembleDebug
  build-ios:
    runs-on: macos-latest   # builds de iOS requieren un runner macOS
    steps:
      - run: ./gradlew :shared:linkDebugFrameworkIosArm64
```

Un pipeline de CI para un proyecto KMP necesita validar explícitamente ambos targets en cada push (no solo uno), dado que un cambio de código que compila perfectamente para Android puede fallar de forma completamente inesperada al compilar para iOS (por ejemplo, si usa accidentalmente una API no disponible en `commonMain` para todos los targets, Módulo 3), un problema que solo se detectaría ejecutando efectivamente el build de ambos targets, no asumiendo que un build exitoso en un target garantiza éxito en el otro. Un detalle técnico importante: compilar para targets de iOS requiere específicamente un runner de CI que ejecute macOS (dado que las herramientas de compilación de Apple, como el propio Xcode toolchain, solo están disponibles en ese sistema operativo), a diferencia del build de Android, que puede ejecutarse en cualquier runner Linux estándar más económico.

Validar ambos targets en cada push individual (no solo antes de un release) detecta regresiones de plataforma específica inmediatamente después de que se introducen, cuando el contexto del cambio todavía está fresco y es fácil de diagnosticar, en vez de descubrir días o semanas después, justo antes de un release planificado, que algún cambio intermedio rompió silenciosamente el build de una plataforma específica sin que nadie lo notara durante todo ese tiempo intermedio.

**Analogía:** validar ambos targets en cada push es como hacer una prueba de manejo de un vehículo en ambos tipos de terreno (ciudad y montaña) cada vez que se modifica algo del motor, en vez de probarlo solo en un terreno y asumir que funcionará igual de bien en el otro, descubriendo el problema real recién cuando efectivamente se necesita conducir en el terreno no probado.

**¿Por qué es importante?** Validar ambos targets en cada push detecta regresiones específicas de plataforma inmediatamente tras introducirse, con contexto fresco para diagnosticar, en vez de descubrirlas tardíamente justo antes de un release planificado.

**Casos de uso reales:**
- Detectar en un pull request que un cambio en `commonMain` rompe la compilación de iOS antes de hacer merge.
- Ejecutar `commonTest` (Módulo 9) en cada push para atrapar regresiones de lógica compartida temprano.
- Presupuestar el costo de CI sabiendo que los runners macOS para iOS son más caros que los runners Linux para Android.

**Configuración del ejemplo:**

```yaml
jobs:
  test-common:
    steps:
      - run: ./gradlew :shared:allTests   # corre commonTest en ambos targets
  build-android:
    steps:
      - run: ./gradlew :androidApp:assembleDebug
  build-ios:
    runs-on: macos-latest   # builds de iOS requieren un runner macOS
    steps:
      - run: ./gradlew :shared:linkDebugFrameworkIosArm64
```

### Tema 2: Fastlane

**Conceptos clave:** automatización de pasos de release tediosos y propensos a error.

```ruby
# fastlane/Fastfile
lane :beta do
  build_app(scheme: "MiApp")
  upload_to_testflight
end
```

Fastlane automatiza una secuencia de pasos manuales de release que, realizados a mano en cada ciclo, son tanto tediosos como propensos a error humano: firma de código con los certificados y perfiles de aprovisionamiento correctos, incremento consistente del número de build entre releases sucesivos, y la subida efectiva hacia plataformas de distribución (TestFlight para iOS, un track interno o de producción de Play Console para Android), todo reducido a un único comando (`fastlane beta`) que ejecuta la secuencia completa de forma consistente y repetible cada vez, sin depender de que una persona recuerde correctamente cada paso individual en el orden correcto.

Esta automatización es particularmente valiosa en un contexto multiplataforma como KMP, donde el proceso de release involucra necesariamente dos plataformas de distribución completamente distintas (App Store Connect para iOS, Google Play Console para Android), cada una con su propio conjunto de requisitos, formatos, y pasos específicos de configuración, un proceso manual combinado considerablemente más propenso a errores u omisiones que automatizar cada mitad del proceso con Fastlane de forma independiente pero coordinada.

**Analogía:** Fastlane es como un asistente automatizado que ejecuta consistentemente toda una checklist compleja de preparación antes de un evento importante, en el orden correcto y sin omitir ningún paso, en vez de depender de que una persona recuerde manualmente cada elemento específico de esa checklist cada vez que se repite el proceso.

**¿Por qué es importante?** Fastlane automatiza pasos de release tediosos y propensos a error humano (firma, versionado, subida a las plataformas de distribución) en un único comando consistente y repetible.

**Casos de uso reales:**
- Publicar una nueva build a TestFlight automáticamente al mergear a la rama `release`, sin intervención manual.
- Subir simultáneamente builds de Android e iOS de la misma versión en un único paso de CI coordinado.
- Evitar el error humano clásico de subir a producción una build firmada con el certificado de desarrollo equivocado.

**Código del ejemplo:**

```ruby
lane :beta do
  build_app(scheme: "MiApp")
  upload_to_testflight
end
```

### Tema 3: Versionado compartido

**Conceptos clave:** mismo número de versión entre ambas apps, evitando confusión.

Mantener el número de versión sincronizado entre la app Android y la app iOS, típicamente centralizado en un archivo de configuración compartido leído por ambos pipelines de build respectivos, evita la confusión concreta de no saber con certeza qué versión específica del módulo compartido corre efectivamente cada plataforma en un momento dado, un problema particularmente relevante al diagnosticar un bug reportado por un usuario: sin versionado sincronizado, sería necesario primero determinar qué versión específica de la lógica compartida corresponde a la versión de la app reportada por el usuario en cada plataforma, una complejidad adicional evitable centralizando el versionado desde el origen.

**Analogía:** el versionado compartido es como asegurarse de que todas las sucursales de una franquicia sigan exactamente la misma edición del manual de operaciones central, evitando la confusión de que distintas sucursales operen simultáneamente según versiones distintas y potencialmente incompatibles del mismo manual base.

**¿Por qué es importante?** Sincronizar el versionado entre ambas plataformas evita la confusión de no saber con certeza qué versión del módulo compartido corre cada plataforma, simplificando el diagnóstico de bugs reportados por usuarios.

**Casos de uso reales:**
- Un usuario reporta un bug desde la app iOS 2.3.1; el equipo identifica de inmediato qué versión de `commonMain` corresponde.
- Coordinar un release simultáneo donde Android e iOS despliegan la misma versión del módulo compartido el mismo día.
- Auditar en logs de crash qué versión del módulo compartido estaba activa en el momento del fallo.

**Diagrama:**

```
Archivo de versión compartido → leído por el pipeline de build de Android y de iOS
Evita: "¿qué versión del módulo compartido corre esta versión específica de cada app?"
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

**Objetivo del laboratorio:** construir un pipeline CI que compile el módulo compartido para Android e iOS en cada push.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Configurar el pipeline que compile ambos targets | Ver Tema 1 | En cada push |
| 2 | Agregar `commonTest` como paso obligatorio | Ver Tema 1 | Debe pasar para continuar |
| 3 | Configurar Fastlane para Android | Ver Tema 2 | Build y firma automatizados |
| 4 | Documentar la extensión hacia TestFlight/Play Console | Ver Tema 2 | Subida automática |

**Verificación:** el laboratorio se considera exitoso si el pipeline falla correctamente ante un cambio que rompe el build de cualquiera de los dos targets, y si Fastlane ejecuta el build y la firma de la app Android con un único comando.

**Errores comunes y soluciones**

- **Validar solo un target en CI, asumiendo que el otro compilará igual.** Valida explícitamente ambos targets en cada push.
- **Usar un runner Linux estándar para builds de iOS.** Los builds de iOS requieren específicamente un runner macOS.
- **Desincronizar el número de versión entre las apps Android e iOS.** Centraliza el versionado en un archivo compartido leído por ambos pipelines.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué validar ambos targets en cada push

**Enunciado:** ¿por qué validar ambos targets en CI en cada push, y no solo antes de un release?

**Solución esperada:** validar en cada push detecta regresiones específicas de plataforma inmediatamente después de introducirse, con el contexto del cambio todavía fresco y fácil de diagnosticar, en vez de descubrir el problema días o semanas después, justo antes de un release planificado, cuando ya es más difícil rastrear qué cambio intermedio específico rompió el build.

**Criterios de éxito:**
- Explica correctamente la detección temprana con contexto fresco como razón de validar en cada push.

### Ejercicio 2: Qué automatiza Fastlane

**Enunciado:** ¿qué automatiza Fastlane que sería tedioso hacer manualmente en cada release?

**Solución esperada:** firma de código con certificados y perfiles correctos, incremento consistente del número de build, y la subida efectiva a las plataformas de distribución (TestFlight, Play Console), todo reducido a un único comando consistente y repetible.

**Criterios de éxito:**
- Menciona correctamente al menos dos de los tres pasos automatizados (firma, versionado, subida) como lo que Fastlane automatiza.

### Ejercicio 3: Necesidad de un runner macOS para iOS

**Enunciado:** ¿por qué un pipeline de CI para KMP necesita un runner macOS específicamente para compilar el target de iOS?

**Solución esperada:** las herramientas de compilación necesarias para producir binarios de iOS (el toolchain de Xcode de Apple) solo están disponibles en macOS, a diferencia del build de Android, que puede ejecutarse en cualquier runner Linux estándar más económico.

**Criterios de éxito:**
- Explica correctamente la dependencia del toolchain de Xcode exclusivo de macOS como razón de esa necesidad.

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

- JetBrains, documentación oficial de *Kotlin Multiplatform* y Kotlin Coroutines.
- Google, *Android Developers Documentation*; Apple, *Developer Documentation*.
- Kotlin Foundation, especificación y pautas de compatibilidad de Kotlin.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Un pipeline CI para KMP debe validar explícitamente ambos targets (Android e iOS) en cada push, no asumir éxito en uno a partir del otro.
- Los builds de iOS requieren específicamente un runner macOS por el toolchain de Xcode.
- Fastlane automatiza firma, versionado y subida a las plataformas de distribución en un único comando.
- El versionado compartido entre apps evita confusión sobre qué versión del módulo compartido corre cada plataforma.

**Conceptos aprendidos**

- Pipeline Gradle multiplataforma en CI.
- Distribución a TestFlight/Play Console.
- Fastlane.
- Versionado compartido.

**Próximos pasos**

En el Módulo 11, el proyecto integrador final, unirás lógica, networking, persistencia y UI compartida en una app real para Android e iOS.

**Recursos adicionales**

- Documentación oficial de Fastlane (docs.fastlane.tools).
