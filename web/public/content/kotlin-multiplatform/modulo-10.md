# Módulo 10: CI/CD para KMP


## Aprende construyendo

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
