# Módulo 7: Compose Multiplatform — UI compartida

## Sílabo

**Objetivo general**

Compartir no solo lógica sino también UI declarativa entre Android, iOS y desktop con Compose Multiplatform, entendiendo su relación con Jetpack Compose y sus limitaciones actuales en iOS.

**Objetivos específicos**

1. Crear una pantalla con Compose Multiplatform en `commonMain`.
2. Ejecutar esa misma pantalla en Android e iOS.
3. Definir un theme compartido entre plataformas.
4. Implementar navegación multiplataforma.
5. Reconocer limitaciones actuales de Compose Multiplatform en iOS.

**Contenido**

- Compose Multiplatform vs Jetpack Compose.
- Theming compartido.
- Navegación multiplataforma.
- Limitaciones actuales en iOS.
- Compose Multiplatform para Desktop y Web.

**Evaluación**

Pantalla compartida en Compose Multiplatform renderizada en Android e iOS, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **Pantalla compartida en Compose Multiplatform renderizada en Android e iOS, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-7/
├─ tests/
├─ docs/decisions/
├─ evidence/module-7/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Compose Multiplatform vs Jetpack Compose | `shared/src/commonMain/kotlin/module-7/topic-1-compose-multiplatform-vs-jetpack-compose.kt` | prueba + salida observable |
| 2. Theming y navegación compartidos | `shared/src/commonMain/kotlin/module-7/topic-2-theming-y-navegacion-compartidos.kt` | prueba + salida observable |
| 3. Limitaciones en iOS y otros targets | `shared/src/commonMain/kotlin/module-7/topic-3-limitaciones-en-ios-y-otros-targets.kt` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/kmp-app`:

```bash
./gradlew :shared:allTests
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **Pantalla compartida en Compose Multiplatform renderizada en Android e iOS, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Introduce un dato nulo o caso específico de plataforma; commonTest debe hacerlo visible. Guarda en `evidence/module-7/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Compose Multiplatform — UI compartida** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Compose Multiplatform vs Jetpack Compose

**Conceptos clave:** mismo modelo de programación extendido a más plataformas, Skia como motor gráfico embebido.

#### Contrato técnico de `@Composable` en código compartido

En `commonMain`, `@Composable` conserva el mismo significado de compilación que en Jetpack Compose: el plugin de Compose transforma la función para integrarla en el runtime de composición y rastrear estado. No significa «componente Android» y tampoco selecciona por sí sola un motor gráfico. El target determina el backend y el artefacto final; la función compartida expresa la estructura declarativa que ese backend renderizará.

Esto establece una frontera útil: UI y estado visual portable pueden vivir en `commonMain`, mientras una capacidad exclusiva —por ejemplo, permisos, cámara o integración con una API de iOS— debe entrar mediante una abstracción común y una implementación de plataforma. Marcar una función con `@Composable` no vuelve portable una dependencia Android incluida dentro de ella; si se importa `android.*` desde `commonMain`, la compilación del target iOS falla antes de renderizar nada.

Jetpack Compose es la UI declarativa moderna específica de Android (composables, estado, recomposición); Compose Multiplatform extiende exactamente ese mismo modelo de programación hacia iOS, desktop y web, permitiendo que el mismo código de UI (no solo la lógica de negocio, como en los módulos anteriores) se ejecute en múltiples plataformas: `@Composable fun PantallaTareas(tareas: List<Tarea>) { LazyColumn { items(tareas) { tarea -> Text(tarea.titulo) } } }`, escrito una única vez en `commonMain`, renderiza en Android usando el motor nativo de Compose ya integrado en el sistema, y en iOS usando Skia (el mismo motor gráfico de renderizado de bajo nivel que usa Compose internamente en Android, aquí embebido directamente en la aplicación iOS en vez de depender de UIKit nativo para el renderizado de estos composables específicos).

Esta extensión representa un salto conceptual más allá de compartir solo lógica de negocio (Módulos 4-6): mientras la lógica compartida siempre fue la promesa central y más consolidada de KMP, compartir la UI en sí es una capacidad más reciente y ambiciosa, que reduce aún más la duplicación de trabajo entre plataformas a costa de renunciar a que la UI de cada plataforma luzca y se comporte exactamente según las convenciones nativas específicas de cada sistema operativo (a menos que se invierta esfuerzo adicional en adaptar el diseño visual según la plataforma detectada en tiempo de ejecución).

**Analogía:** Compose Multiplatform es como un mismo equipo de diseño y construcción que ensambla estructuras visualmente idénticas en distintas ciudades usando el mismo conjunto de herramientas y materiales, en vez de contratar equipos completamente separados en cada ciudad que construyen estructuras funcionalmente equivalentes pero con métodos y materiales distintos entre sí.

**¿Por qué es importante?** Compose Multiplatform extiende el modelo de programación de Jetpack Compose a iOS y otras plataformas, compartiendo no solo lógica sino también el código de UI en sí, mediante Skia como motor gráfico embebido común.

**Casos de uso reales:**
- Una startup con equipo pequeño que necesita una app Android + iOS con presupuesto y tiempo de desarrollo limitados.
- Herramientas internas de empresa donde la consistencia visual exacta entre plataformas importa más que seguir cada convención nativa.
- Prototipos y MVPs donde iterar rápido en una única base de código de UI vale más que la integración nativa profunda.

**Código del ejemplo:**

```kotlin
@Composable
fun PantallaTareas(tareas: List<Tarea>) {
    LazyColumn {
        items(tareas) { tarea -> Text(tarea.titulo) }
    }
}
```

### Tema 2: Theming y navegación compartidos

**Conceptos clave:** un único esquema de diseño, grafo de navegación declarado una vez.

`@Composable fun AppTheme(content: @Composable () -> Unit) { MaterialTheme(colorScheme = esquemaColoresCompartido, content = content) }` define un theme (colores, tipografía, formas) una única vez en código compartido, aplicado consistentemente sin importar en qué plataforma se renderice, garantizando coherencia visual exacta entre Android e iOS sin necesidad de definir y sincronizar manualmente dos sistemas de diseño paralelos y potencialmente divergentes con el tiempo.

Librerías de navegación compatibles con KMP (como Voyager, o el Navigation Compose multiplataforma) permiten definir el grafo completo de navegación de la aplicación (qué pantallas existen, cómo se conectan entre sí, qué parámetros se pasan entre ellas) una única vez en código compartido, en vez de mantener dos implementaciones de navegación completamente separadas y potencialmente divergentes (Navigation Compose específico de Android, y algún mecanismo de navegación nativo de SwiftUI en iOS), reduciendo aún más la duplicación de trabajo entre plataformas.

**Analogía:** un theme compartido es como un manual de identidad visual corporativa único aplicado consistentemente en todas las sucursales de una empresa, sin importar en qué ciudad específica se encuentre cada una; un grafo de navegación compartido es como un mapa único del recorrido completo de un edificio, válido y consistente para cualquier visitante sin importar por cuál entrada específica haya ingresado.

**¿Por qué es importante?** Theming y navegación compartidos garantizan coherencia visual y de flujo exacta entre plataformas, definidos una única vez en vez de mantener implementaciones paralelas potencialmente divergentes.

**Casos de uso reales:**
- Aplicar modo oscuro/claro de forma idéntica en Android e iOS desde una única definición de `ColorScheme`.
- Rebranding de la app (cambio de paleta de colores corporativa) editando un solo archivo en vez de dos temas nativos separados.
- Flujo de onboarding con varias pantallas navegables, definido una vez y consistente en ambas plataformas.

**Código del ejemplo:**

```kotlin
@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = esquemaColoresCompartido, content = content)
}
```

### Tema 3: Limitaciones en iOS y otros targets

**Conceptos clave:** madurez desigual entre plataformas, integraciones nativas puntuales.

Compose Multiplatform en iOS es considerablemente más reciente que en Android (donde Jetpack Compose lleva más tiempo consolidado como la UI recomendada por defecto), lo que significa que ciertas integraciones con capacidades nativas específicas del sistema operativo (notificaciones push nativas, ciertos widgets específicos del sistema, algunas APIs de accesibilidad particulares) todavía pueden requerir puentes específicos de plataforma adicionales, o en algunos casos recurrir directamente a SwiftUI nativo para esas partes puntuales de la interfaz donde la integración nativa profunda es más crítica que la reutilización de código compartido.

Compose Multiplatform también se extiende más allá de dispositivos móviles hacia desktop (Windows, macOS, Linux) y web (mediante WebAssembly), ampliando el alcance potencial de UI compartida más allá de la combinación Android/iOS estudiada específicamente en este track, aunque cada target adicional trae su propio conjunto de consideraciones y madurez relativa específica que evaluar antes de adoptarlo en un proyecto real.

**Analogía:** las limitaciones actuales de Compose Multiplatform en iOS son como una traducción de un idioma a otro que captura fielmente la mayor parte del contenido original, pero donde ciertas expresiones idiomáticas muy específicas y locales todavía requieren una adaptación manual especializada en vez de una traducción directa y automática.

**¿Por qué es importante?** Reconocer las limitaciones actuales de Compose Multiplatform en iOS (madurez menor que en Android, ciertas integraciones nativas que requieren puentes específicos) evita asumir que absolutamente toda la UI puede compartirse sin ninguna consideración específica de plataforma.

**Casos de uso reales:**
- Usar SwiftUI nativo para un widget de pantalla de inicio en iOS mientras el resto de la app usa Compose Multiplatform.
- Evaluar si una integración de pago nativa (Apple Pay/Google Pay) necesita un puente `expect`/`actual` puntual (Módulo 3) en vez de UI compartida.
- Decidir conscientemente no adoptar el target Web todavía por su madurez relativa menor frente a Android/iOS.

**Diagrama:**

```
Android: Compose Multiplatform sobre el motor nativo de Compose ya consolidado
iOS: Compose Multiplatform sobre Skia embebido — más reciente, ciertos casos requieren SwiftUI nativo
Desktop / Web: targets adicionales con su propia madurez relativa a evaluar
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

**Objetivo del laboratorio:** construir una pantalla compartida en Compose Multiplatform renderizada en Android e iOS.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear una pantalla simple en `commonMain` | Ver Tema 1 | No en `androidMain` |
| 2 | Ejecutarla en un emulador Android y un simulador iOS | — | Verifica la renderización en ambos |
| 3 | Definir un theme compartido | Ver Tema 2 | Colores y tipografía |
| 4 | Implementar navegación entre dos pantallas | Ver Tema 2 | Con una librería compatible con KMP |
| 5 | Documentar una limitación real encontrada en iOS | Ver Tema 3 | Comparado con Android |

**Verificación:** el laboratorio se considera exitoso si la misma pantalla, escrita una única vez, se renderiza correctamente tanto en el emulador Android como en el simulador iOS, con el mismo theme aplicado consistentemente en ambos.

**Errores comunes y soluciones**

- **Escribir la pantalla en `androidMain` en vez de `commonMain`.** Solo el código en `commonMain` se comparte entre plataformas.
- **Definir dos sistemas de diseño separados por plataforma.** Comparte el theme en código común para garantizar coherencia visual.
- **Asumir que absolutamente toda integración nativa está disponible igual en iOS que en Android.** Verifica la madurez específica de cada integración antes de asumir paridad completa.

---

## Ejercicios de evaluación

### Ejercicio 1: Ganancia y riesgo de compartir UI

**Enunciado:** ¿qué gana un equipo al compartir UI (no solo lógica) entre Android e iOS, y qué riesgo asume?

**Solución esperada:** gana una reducción considerable de duplicación de trabajo de construcción de interfaz entre plataformas, con coherencia visual garantizada por diseño; asume el riesgo de que la UI no luzca ni se comporte exactamente según las convenciones nativas específicas de cada sistema operativo, a menos que se invierta esfuerzo adicional en adaptaciones específicas de plataforma.

**Criterios de éxito:**
- Menciona correctamente la reducción de duplicación como ganancia y la posible pérdida de convenciones nativas específicas como riesgo.

### Ejercicio 2: Por qué Compose Multiplatform es más limitado en iOS

**Enunciado:** ¿por qué Compose Multiplatform en iOS es relativamente más nuevo/limitado que en Android?

**Solución esperada:** Jetpack Compose lleva más tiempo consolidado como la UI recomendada por defecto en Android; su extensión hacia iOS mediante Compose Multiplatform es una capacidad más reciente, por lo que ciertas integraciones con capacidades nativas específicas de iOS todavía requieren puentes adicionales o, en algunos casos, recurrir a SwiftUI nativo.

**Criterios de éxito:**
- Explica correctamente la mayor madurez relativa de Android como razón de la diferencia actual de soporte.

### Ejercicio 3: Alcance de Compose Multiplatform más allá de móvil

**Enunciado:** ¿a qué otros targets, además de Android e iOS, se extiende Compose Multiplatform?

**Solución esperada:** desktop (Windows, macOS, Linux) y web (mediante WebAssembly), ampliando el alcance de UI compartida más allá de la combinación de plataformas móviles.

**Criterios de éxito:**
- Menciona correctamente desktop y/o web como targets adicionales de Compose Multiplatform.

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

- Compose Multiplatform extiende el modelo de Jetpack Compose a iOS, desktop y web, compartiendo también código de UI.
- Theming y navegación compartidos garantizan coherencia visual y de flujo entre plataformas.
- Compose Multiplatform en iOS es más reciente y limitado que en Android, requiriendo puentes específicos para ciertas integraciones nativas.

**Conceptos aprendidos**

- Compose Multiplatform vs Jetpack Compose.
- Theming y navegación compartidos.
- Limitaciones actuales en iOS y otros targets.

**Próximos pasos**

En el Módulo 8 aprenderás interoperabilidad con iOS: el framework generado, mapeo de tipos Kotlin-Swift, y consumo de coroutines desde Swift.

**Recursos adicionales**

- Documentación oficial de Compose Multiplatform (jetbrains.com/lp/compose-multiplatform).
