# Módulo 12: Proyecto integrador: app Android completa

## Sílabo

**Objetivo general**

Unir Compose, Room, Retrofit, Hilt y testing en una app Android real, integrando arquitectura MVVM con UDF, persistencia offline-first, inyección de dependencias completa y una suite de tests que dé confianza antes de publicar en Play Console.

**Objetivos específicos**

1. Diseñar la arquitectura MVVM completa: UI Compose → ViewModel (StateFlow) → Repositorio → Room + Retrofit.
2. Implementar persistencia offline-first end-to-end.
3. Inyectar todas las dependencias con Hilt, sin instanciación manual.
4. Escribir tests del ViewModel principal y al menos un test de Compose UI.
5. Generar el App Bundle firmado listo para Play Console.

**Contenido**

- Arquitectura MVVM con UDF.
- Persistencia offline-first.
- Inyección de dependencias con Hilt.
- Tests de ViewModel y UI.

**Evaluación**

App Android con Compose, datos reales, persistencia offline y tests, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **App Android con Compose, datos reales, persistencia offline y tests, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-12/
├─ tests/
├─ docs/decisions/
├─ evidence/module-12/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Arquitectura MVVM completa con UDF | `app/src/main/java/academy/module-12/topic-1-arquitectura-mvvm-completa-con-udf.kt` | prueba + salida observable |
| 2. Inyección de dependencias en toda la app | `app/src/main/java/academy/module-12/topic-2-inyeccion-de-dependencias-en-toda-la-app.kt` | prueba + salida observable |
| 3. Cierre del track y próximos pasos | `app/src/main/java/academy/module-12/topic-3-cierre-del-track-y-proximos-pasos.kt` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/android-app`:

```bash
./gradlew testDebugUnitTest
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **App Android con Compose, datos reales, persistencia offline y tests, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula permiso denegado, proceso recreado o dato ausente; verifica que la pantalla conserve un estado comprensible. Guarda en `evidence/module-12/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Proyecto integrador: app Android completa** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Arquitectura MVVM completa con UDF

**Conceptos clave:** cada capa con una única responsabilidad, comunicación en una única dirección.

```
UI (Compose)
  ↕ collectAsStateWithLifecycle / eventos
ViewModel (StateFlow, UDF)
  ↕
Repositorio (offline-first: Room + Retrofit)
  ↕                    ↕
Room (caché local)    Retrofit (API remota)
```

Este proyecto integra directamente cada módulo anterior del track en una única arquitectura coherente: la UI declarativa con state hoisting correcto (Módulo 2) se combina con navegación con argumentos tipados (Módulo 3), UDF completo con `StateFlow` (Módulo 4), persistencia offline-first con Room y `Flow` reactivo (Módulo 6), inyección de dependencias con Hilt en toda la app (Módulo 7), y una suite de tests de ViewModel y Compose UI (Módulo 9), demostrando que cada pieza estudiada de forma aislada encaja como parte de un sistema mayor coherente, no como fragmentos de conocimiento desconectados entre sí.

La clave de esta arquitectura es que cada capa tiene una única responsabilidad y se comunica con las adyacentes en una única dirección predecible: la UI nunca conoce Room ni Retrofit directamente, el ViewModel nunca construye vistas Compose directamente, y el repositorio nunca conoce detalles de UI; esta separación estricta es lo que hace que cada capa sea testeable de forma aislada (Módulo 9) y reemplazable independientemente (por ejemplo, cambiar Retrofit por Ktor Client sin tocar el ViewModel ni la UI).

**Analogía:** esta arquitectura es como una cadena de producción industrial donde cada estación tiene una función clara y bien delimitada, y el producto fluye en una única dirección de estación en estación: ninguna estación necesita conocer los detalles internos de las demás, solo el formato de entrada y salida acordado entre ellas.

**¿Por qué es importante?** Integrar cada módulo del track en una única arquitectura demuestra que los conceptos estudiados por separado (state hoisting, UDF, offline-first, DI, testing) se combinan naturalmente en un sistema real, con cada capa testeable y reemplazable de forma independiente gracias a la separación estricta de responsabilidades.

**Casos de uso reales:**
- Una app de gestión de tareas real publicada en Play Store siguiendo exactamente esta arquitectura MVVM + UDF.
- Onboarding de un desarrollador nuevo al equipo, que entiende el flujo completo con un solo diagrama de capas.
- Estimar el impacto de un cambio (agregar una nueva pantalla) sabiendo exactamente qué capas modificar.

**Diagrama:**

```
UI (Compose)
  ↕ collectAsStateWithLifecycle / eventos
ViewModel (StateFlow, UDF)
  ↕
Repositorio (offline-first: Room + Retrofit)
  ↕                    ↕
Room (caché local)    Retrofit (API remota)
```

### Tema 2: Inyección de dependencias en toda la app

**Conceptos clave:** ningún componente instancia manualmente sus propias dependencias.

```kotlin
@HiltViewModel
class TareasViewModel @Inject constructor(
    private val repo: TareaRepository, // Room + Retrofit por debajo, inyectado por Hilt
) : ViewModel() {
    val tareas: StateFlow<List<Tarea>> = repo.tareas
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun sincronizar() = viewModelScope.launch { repo.sincronizar() }
}
```

En el proyecto integrador, absolutamente ninguna clase instancia manualmente sus propias dependencias: Hilt (Módulo 7) construye el `TareaRepository` (que a su vez encapsula Room y Retrofit por debajo, sin que el `ViewModel` necesite conocer esos detalles), y lo inyecta directamente en el constructor del `ViewModel` vía `@Inject`. `stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())` convierte el `Flow` reactivo del repositorio en un `StateFlow` con un valor inicial garantizado, deteniendo la recolección automáticamente cinco segundos después de que el último observador se desuscriba (por ejemplo, tras una rotación de pantalla que temporalmente no tiene ningún observador activo mientras la nueva Activity termina de inicializarse), evitando reiniciar innecesariamente la recolección ante ese breve hueco.

Esta ausencia total de instanciación manual es lo que permite que, en el módulo de testing (Tema 3), cada dependencia pueda reemplazarse limpiamente por un fake sin modificar ninguna línea del código de producción bajo prueba, cerrando el círculo completo entre arquitectura desacoplada y capacidad real de testear el sistema de forma aislada.

**Analogía:** un sistema completamente inyectado es como una organización donde cada empleado recibe sus herramientas de trabajo ya preparadas por un departamento central de logística, en vez de que cada uno deba fabricar o conseguir sus propias herramientas por su cuenta, permitiendo que ese departamento central sustituya cualquier herramienta específica (por ejemplo, por una versión de práctica durante un entrenamiento) sin que el empleado que la usa note ninguna diferencia en su forma de trabajar.

**¿Por qué es importante?** La ausencia total de instanciación manual, lograda mediante Hilt en cada capa, es precisamente lo que habilita que el sistema completo sea testeable de forma aislada reemplazando dependencias por fakes sin tocar el código de producción.

**Casos de uso reales:**
- Reemplazar `TareaRepository` real por un fake en todos los tests de ViewModels sin modificar ningún ViewModel.
- Cambiar la implementación de red de Retrofit a Ktor Client (Módulo 5 de KMP) sin tocar ViewModels ni UI.
- Auditar en code review que ningún composable o ViewModel instancia `Retrofit`/`Room` directamente con `new`.

**Código del ejemplo:**

```kotlin
@HiltViewModel
class TareasViewModel @Inject constructor(
    private val repo: TareaRepository, // inyectado, nunca instanciado manualmente
) : ViewModel()
```

### Tema 3: Cierre del track y próximos pasos

**Conceptos clave:** una app Android profesional es más que pantallas atractivas.

Una app Android "completa" en el sentido profesional del término no se define únicamente por pantallas visualmente atractivas construidas con Compose: es la combinación deliberada de un flujo de datos predecible (UDF, Módulo 4), resiliencia real ante pérdida de conexión (offline-first, Módulo 6), dependencias desacopladas y testeables en toda la aplicación (Hilt, Módulo 7), y una base de tests (ViewModel + Compose UI, Módulo 9) que otorga confianza genuina antes de publicar cualquier cambio en Play Console (Módulo 11), en vez de depender únicamente de pruebas manuales dispersas y no repetibles antes de cada release.

Reflexionar sobre qué parte específica de este proyecto integrador (Compose, Room, Hilt, o la combinación de los tres) resultó más difícil de integrar correctamente con las demás es un ejercicio valioso para consolidar la comprensión de cómo estas piezas dependen unas de otras en la práctica, más allá de haberlas estudiado individualmente en módulos separados; y considerar qué cambiaría en esta arquitectura si la app debiera escalar a diez pantallas adicionales (¿nuevos módulos Gradle por feature, como se vio en el Módulo 0? ¿un store de estado más centralizado?) prepara el terreno para decisiones arquitectónicas de mayor escala en proyectos reales futuros.

**Analogía:** una app Android completa es como un edificio terminado que no solo se ve bien en la fachada (Compose), sino que además tiene cimientos sólidos que resisten condiciones adversas (offline-first), una instalación eléctrica y de plomería bien organizada y documentada (DI con Hilt), y un historial de inspecciones que certifica su seguridad estructural antes de habilitarlo al público (testing antes de publicar).

**¿Por qué es importante?** Cerrar el track integrando todos los conceptos en un proyecto real consolida que una app profesional requiere la combinación de flujo de datos predecible, resiliencia offline, desacoplamiento testeable, y una base de tests confiable, no solo una UI visualmente atractiva.

**Casos de uso reales:**
- Evaluar en una entrevista técnica si un candidato entiende por qué offline-first y testing importan tanto como el diseño visual.
- Decidir si escalar la app a un proyecto Gradle multi-módulo por feature al llegar a diez pantallas (Módulo 0).
- Usar este proyecto integrador como plantilla de referencia para el siguiente proyecto Android real del equipo.

**Diagrama:**

```
App Android profesional =
  UI atractiva (Compose)
  + flujo de datos predecible (UDF)
  + resiliencia offline (Room + Retrofit)
  + dependencias desacopladas (Hilt)
  + confianza antes de publicar (tests)
```

---

## Proyecto transversal RutaFlow: Ubicación consciente de batería

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/android/LocationPolicy.kt`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

La frecuencia GPS es una política de dominio que combina actividad y batería; no debe quedar dispersa entre callbacks. Una entrega detenida no necesita la precisión de un trayecto activo. La ubicación enviada conserva timestamp, accuracy y secuencia, y el servidor rechaza puntos viejos o imposibles sin asumir fraude automáticamente.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Conecta la política a Fused Location Provider y foreground service solo durante jornada autorizada. Prueba batería baja, permiso aproximado, pérdida de señal, Doze, proceso recreado y logout. Mide consumo en ruta simulada y documenta retención y consentimiento.

El capítulo se completa cuando la evidencia permite a otra persona reproducir el flujo y explicar qué garantías ofrece y cuáles todavía no.

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

**Objetivo del laboratorio:** construir una app Android con Compose, datos reales, persistencia offline y tests.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura MVVM completa | Ver Tema 1 | UI → ViewModel → Repositorio → Room + Retrofit |
| 2 | Implementar persistencia offline-first | Ver Tema 1 | La UI siempre lee de Room |
| 3 | Inyectar todas las dependencias con Hilt | Ver Tema 2 | Sin instanciación manual |
| 4 | Escribir tests de ViewModel y Compose UI | Ver Tema 3 | Con fakes, sin dependencias externas reales |
| 5 | Generar el App Bundle firmado | Ver Módulo 11 | Listo para Play Console |

**Verificación:** el proyecto se considera exitoso si la app funciona correctamente sin conexión (mostrando el último caché sincronizado), si todas sus dependencias están inyectadas vía Hilt sin ninguna instanciación manual, y si la suite de tests pasa consistentemente incluyendo al menos un test de ViewModel y uno de Compose UI.

**Errores comunes y soluciones**

- **Dejar alguna dependencia instanciada manualmente en vez de inyectada.** Rompe la testeabilidad completa del sistema; audita que todo pase por Hilt.
- **Hacer que la UI dependa directamente de la red en vez de Room.** Rompe offline-first; revisa el Módulo 6.
- **Omitir tests de Compose UI, confiando solo en tests de ViewModel.** No cubre la brecha entre estado correcto y renderizado correcto (Módulo 9).

---

## Ejercicios de evaluación

### Ejercicio 1: Decisión de arquitectura ante escalamiento

**Enunciado:** ¿qué decisión de arquitectura cambiarías si la app tuviera que soportar 10 pantallas más?

**Solución esperada:** una respuesta razonable menciona dividir el proyecto en módulos Gradle adicionales por feature (extendiendo el patrón del Módulo 0), y/o introducir un store de estado más centralizado si múltiples pantallas necesitan compartir estado más allá de lo que un `ViewModel` por pantalla puede ofrecer de forma aislada.

**Criterios de éxito:**
- Propone una consideración arquitectónica razonable relacionada con modularización o gestión de estado a mayor escala.

### Ejercicio 2: Parte más difícil de integrar

**Enunciado:** ¿qué parte del proyecto (Compose, Room, Hilt) fue la más difícil de integrar correctamente con las demás?

**Solución esperada:** una respuesta válida identifica una dificultad concreta de integración (por ejemplo, coordinar el scope correcto de Hilt con el ciclo de vida del `ViewModel`, o sincronizar correctamente el `Flow` de Room con el `StateFlow` expuesto) y explica cómo se resolvió.

**Criterios de éxito:**
- Identifica una dificultad de integración específica y razonada, no una respuesta genérica sin justificación.

### Ejercicio 3: Qué define una app Android profesional

**Enunciado:** ¿qué hace que una app Android sea "completa" en el sentido profesional del término, más allá de tener pantallas atractivas con Compose?

**Solución esperada:** la combinación de un flujo de datos predecible (UDF), resiliencia ante pérdida de conexión (offline-first), dependencias desacopladas y testeables (Hilt), y una base de tests que da confianza real antes de publicar, no solo la apariencia visual de la UI.

**Criterios de éxito:**
- Menciona al menos dos de los cuatro pilares (UDF, offline-first, DI, testing) como parte de la definición de "completa".

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

- El proyecto integrador combina UI declarativa, navegación, UDF, offline-first, DI y testing en una única arquitectura coherente.
- Cada capa (UI, ViewModel, Repositorio, Room, Retrofit) tiene una única responsabilidad y se comunica en una única dirección predecible.
- La ausencia total de instanciación manual (todo inyectado vía Hilt) es lo que habilita que el sistema completo sea testeable de forma aislada.
- Una app Android profesional se define por la combinación de flujo predecible, resiliencia offline, desacoplamiento y confianza vía tests, no solo por su UI.

**Conceptos aprendidos**

- Arquitectura MVVM con UDF.
- Persistencia offline-first.
- Inyección de dependencias con Hilt.
- Tests de ViewModel y UI.

**Próximos pasos**

Con el track de Android completo, los mismos principios de arquitectura (UDF, offline-first, DI, testing) reaparecerán en el track de iOS con SwiftUI y Combine/async-await, y en Kotlin Multiplatform si decides compartir lógica de negocio entre ambas plataformas.

**Recursos adicionales**

- Guía oficial de arquitectura de apps Android (developer.android.com/topic/architecture).
