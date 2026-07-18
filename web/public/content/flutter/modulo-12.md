# Módulo 12: Proyecto integrador: app Flutter completa

## Sílabo

**Objetivo general**

Unir widgets, estado, networking y persistencia en una app real multiplataforma, organizando el proyecto por features con Clean Architecture (Domain, Data, Presentation), gestión de estado completa con Riverpod o Bloc, persistencia offline-first, tests de widgets clave, e internacionalización.

**Objetivos específicos**

1. Organizar el proyecto por features en vez de por tipo de archivo.
2. Implementar gestión de estado completa con Riverpod o Bloc, sin `setState` disperso.
3. Implementar persistencia offline-first sincronizada con una API real.
4. Escribir widget tests de las pantallas más críticas.
5. Generar los builds de release para Android e iOS.

**Contenido**

- Arquitectura por features.
- Gestión de estado con Riverpod/Bloc.
- Persistencia offline-first.
- Tests de widgets clave.
- Clean Architecture: capas Domain, Data y Presentation.
- Internacionalización con `intl` y `flutter_localizations`.

**Evaluación**

App Flutter con datos reales, persistencia offline y tests, corriendo en Android e iOS, más tres ejercicios de evaluación.

---

## Comienza desde cero: prepara este capítulo

Este recorrido parte de una carpeta vacía. Al finalizar tendrás **App Flutter con datos reales, persistencia offline y tests, corriendo en Android e iOS, más tres ejercicios de evaluación.** No avances ejecutando comandos que no comprendes: primero identifica la entrada, la transformación y la evidencia que comprobará el resultado.

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
│  └─ module-12/
├─ tests/
├─ docs/decisions/
├─ evidence/module-12/
└─ README.md
```

| Tema | Archivo o decisión | Evidencia mínima |
|---|---|---|
| 1. Arquitectura por features y Clean Architecture | `lib/features/module-12/topic-1-arquitectura-por-features-y-clean-architecture.dart` | prueba + salida observable |
| 2. Uniendo los módulos del track | `lib/features/module-12/topic-2-uniendo-los-modulos-del-track.dart` | prueba + salida observable |
| 3. Cierre del track | `lib/features/module-12/topic-3-cierre-del-track.dart` | prueba + salida observable |

Un ejemplo técnico vive en el archivo indicado y debe tener una prueba. Un tema conceptual vive en `docs/decisions/`: compara opciones usando restricciones medibles; no escribas código decorativo solo para llenar espacio.

### 4. Ejecuta una línea base

Desde `academia-labs/flutter_app`:

```bash
flutter analyze && flutter test
```

**Resultado esperado:** el comando reconoce el proyecto y termina sin errores antes de introducir el cambio del capítulo. Después del incremento, la evidencia debe demostrar: **App Flutter con datos reales, persistencia offline y tests, corriendo en Android e iOS, más tres ejercicios de evaluación.**

Si falla la línea base, no continúes. Localiza el primer mensaje que indique archivo, línea o dependencia; formula una causa y compruébala con un cambio pequeño.

### 5. Provoca un fallo y recupérate

Simula pérdida de red, permiso denegado o widget desmontado; comprueba la recuperación sin errores ocultos. Guarda en `evidence/module-12/` el comando, la salida relevante, tu hipótesis y la corrección. Revierte únicamente el cambio deliberado; no borres todo el proyecto para ocultar la causa.

### 6. Conecta el capítulo con RutaFlow

Aplica el aprendizaje de **Proyecto integrador: app Flutter completa** a un incremento vertical de RutaFlow. Define qué componente produce el dato, qué contrato lo transporta, quién lo consume y cómo observarás un fallo. La entrega final incluye archivo o decisión, prueba, salida, error corregido y una limitación que todavía validarías en producción.

---

## Contenido teórico

### Tema 1: Arquitectura por features y Clean Architecture

**Conceptos clave:** organización por dominio de negocio, no por tipo técnico de archivo.

```
lib/
  features/
    tareas/
      data/          ← repositorio (dio + Hive, módulos 5-6)
      domain/         ← modelos
      presentation/    ← widgets + providers Riverpod (módulo 4)
    auth/
  core/
    router.dart        ← go_router (módulo 3)
    theme.dart
```

Organizar el proyecto por feature (`lib/features/tareas/`, `lib/features/auth/`) en vez de por tipo de archivo (una carpeta única `widgets/` con todos los widgets de la app mezclados, otra `models/` con todos los modelos mezclados) agrupa todo el código relacionado con una funcionalidad específica en un único lugar cohesivo, facilitando enormemente que un desarrollador entienda o modifique una feature completa sin necesidad de saltar entre carpetas dispersas por todo el proyecto que agrupan archivos por su naturaleza técnica en vez de por su propósito de negocio.

Dentro de cada feature, las capas de Clean Architecture (`domain/` con modelos y lógica de negocio pura sin dependencias externas, `data/` con la implementación concreta de repositorios que sí dependen de `dio` y Hive, `presentation/` con los widgets y providers que consumen esas capas inferiores) establecen un flujo de dependencia estricto y unidireccional: la capa `presentation` depende de `domain`, y `data` implementa las interfaces definidas en `domain`, pero `domain` nunca depende de `data` ni de `presentation` directamente, permitiendo que la lógica de negocio central permanezca completamente aislada y testeable sin ninguna dependencia de frameworks externos o detalles de infraestructura específicos.

**Analogía:** organizar por features es como organizar un edificio de oficinas por departamento funcional completo (cada departamento con su propia recepción, archivo y sala de reuniones) en vez de agrupar todas las recepciones de todos los departamentos en un piso, todos los archivos en otro piso distinto: la primera organización mantiene junto todo lo relacionado con un mismo propósito de negocio, facilitando encontrar y modificar cualquier cosa relacionada con ese departamento específico sin recorrer todo el edificio.

**¿Por qué es importante?** Organizar por feature agrupa código relacionado por propósito de negocio en vez de por tipo técnico de archivo, facilitando el mantenimiento; Clean Architecture con capas Domain/Data/Presentation mantiene la lógica de negocio central aislada de detalles de infraestructura, altamente testeable.

**Diagrama:**

```
lib/features/tareas/
  domain/         ← modelos y lógica pura, SIN dependencias externas
  data/           ← implementa interfaces de domain, SÍ depende de dio/Hive
  presentation/   ← widgets + providers, depende de domain
```

### Tema 2: Uniendo los módulos del track

**Conceptos clave:** cada concepto estudiado por separado encaja como parte de un sistema mayor.

```dart
final tareasProvider = FutureProvider<List<Tarea>>((ref) async {
  final repo = ref.watch(tareaRepositoryProvider);
  return repo.obtenerTareas(); // lee de caché local, sincroniza en background
});

class ListaTareasScreen extends ConsumerWidget {
  Widget build(BuildContext context, WidgetRef ref) {
    final tareasAsync = ref.watch(tareasProvider);
    return tareasAsync.when(
      data: (tareas) => ListView(children: tareas.map((t) => TarjetaTarea(tarea: t)).toList()),
      loading: () => CircularProgressIndicator(),
      error: (e, _) => Text('Error: $e'),
    );
  }
}
```

Este proyecto integra directamente cada módulo estudiado a lo largo del track en un único sistema coherente: navegación declarativa con go_router y rutas protegidas (Módulo 3), gestión de estado completa con Riverpod o Bloc sin `setState` disperso (Módulo 4), networking con `dio` y estados explícitos modelados con sealed classes (Módulo 5), persistencia offline-first con Hive o `sqflite` (Módulo 6), y widget tests de las pantallas más críticas (Módulo 9); el método `.when(data:, loading:, error:)` de `AsyncValue` en Riverpod es la forma idiomática de manejar exhaustivamente los tres estados posibles de una operación asíncrona directamente en la UI, reflejando el mismo principio de estados explícitos modelados como un conjunto cerrado ya estudiado en el Módulo 5.

La internacionalización con `intl` y `flutter_localizations` (mencionada en el contenido de este módulo integrador) permite que la app soporte múltiples idiomas de forma estructurada, generando código a partir de archivos de traducción declarativos, un aspecto adicional de pulido profesional que completa una app lista para un público potencialmente internacional, más allá de la funcionalidad central ya integrada del resto del track.

**Analogía:** el proyecto integrador es como el ensamblaje final de un producto donde cada componente estudiado por separado en su propio módulo (navegación, estado, networking, persistencia, testing) se integra en un sistema funcional completo, demostrando que cada pieza individual efectivamente encaja con las demás tal como se diseñó.

**¿Por qué es importante?** Integrar cada módulo del track en un proyecto real demuestra que los conceptos estudiados por separado (navegación, estado, networking, persistencia, testing) se combinan naturalmente en un sistema coherente, reflejando cómo se construyen apps Flutter profesionales reales.

**Código del ejemplo:**

```dart
tareasAsync.when(
  data: (tareas) => ListView(...),
  loading: () => CircularProgressIndicator(),
  error: (e, _) => Text('Error: $e'),
)
```

### Tema 3: Cierre del track

**Conceptos clave:** una sola base de código, apariencia y rendimiento consistentes, el costo de un ecosistema propio.

Flutter cumple su promesa central de forma bastante directa: una sola base de código Dart, con widgets propios que Flutter renderiza directamente con su propio motor gráfico (Skia, el mismo motor mencionado en Compose Multiplatform, Módulo 7 del track de Kotlin Multiplatform), en vez de simplemente envolver componentes nativos de cada plataforma (a diferencia de otros frameworks multiplataforma históricos que traducían hacia widgets nativos subyacentes), corriendo con apariencia y rendimiento consistentes en Android e iOS sin las diferencias sutiles de comportamiento que podrían surgir de depender de implementaciones nativas distintas por plataforma.

El costo de esta consistencia es aprender un ecosistema de widgets completamente propio de Flutter, distinto tanto de las tecnologías web (HTML/CSS/JavaScript) como de cada plataforma nativa (UIKit/SwiftUI en iOS, Views/Compose en Android): un desarrollador que ya domina Compose o SwiftUI reconocerá los mismos principios conceptuales de UI declarativa (estado como fuente de verdad, composición de widgets, reconstrucción en respuesta a cambios), pero necesitará aprender la sintaxis y las convenciones específicas del ecosistema de widgets propio de Flutter para aplicarlos efectivamente.

**Analogía:** Flutter es como un sistema de construcción modular propio que garantiza resultados idénticos sin importar en qué terreno geográfico se construya (renderizado propio consistente), a diferencia de adaptar los materiales de construcción disponibles localmente en cada región (envolver componentes nativos), a cambio de que los constructores deban aprender ese sistema modular específico en vez de reutilizar directamente sus conocimientos previos de construcción tradicional de cada región.

**¿Por qué es importante?** Flutter logra apariencia y rendimiento consistentes en ambas plataformas gracias a renderizar con su propio motor gráfico en vez de envolver componentes nativos, a costa de requerir aprender un ecosistema de widgets propio distinto de la web y de cada plataforma nativa.

**Diagrama:**

```
Flutter = una base de código Dart
        + motor gráfico propio (Skia)
        + widgets propios (NO wrappers de componentes nativos)
        = apariencia y rendimiento consistentes en Android e iOS
```

---

## Proyecto transversal RutaFlow: Entrega offline con outbox

RutaFlow conecta este track con una plataforma completa de paquetería. La implementación de referencia está en `examples/rutaflow/flutter/delivery_outbox.dart`; se estudia como punto de partida pequeño, no como sistema terminado.

### Capacidad y fundamento

La UI confirma localmente una entrega como pendiente y la outbox persiste el comando antes de mostrar éxito. `commandId` permanece estable en cada reintento. El motor solo reintenta errores transitorios; errores de negocio requieren corrección humana. Reloj, API y almacenamiento se inyectan para pruebas deterministas.

### Implementación guiada

1. Copia el contrato y escribe primero casos normales, límite, inválidos y duplicados.
2. Ejecuta la referencia, provoca un fallo y explica el mensaje antes de modificarla.
3. Implementa una mejora pequeña manteniendo nombres de dominio, efectos visibles y errores tipados.
4. Integra con el contrato del track anterior sin compartir tablas, estado mutable ni detalles de framework.
5. Registra la decisión en el README y etiqueta el hito de RutaFlow correspondiente.

### Verificación profesional

Implementa persistencia SQLite, indicador pendiente/error y sincronización al abrir o recuperar red. Prueba cierre del proceso, respuesta perdida, duplicación, backoff, logout y conflicto. Perfila isolate/UI y batería en Android e iOS por separado.

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

**Objetivo del laboratorio:** construir una app Flutter con datos reales, persistencia offline y tests, corriendo en Android e iOS.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Organizar el proyecto por features | Ver Tema 1 | `lib/features/tareas/`, `lib/features/auth/` |
| 2 | Implementar gestión de estado completa | Ver Tema 2 | Riverpod o Bloc, sin `setState` disperso |
| 3 | Implementar persistencia offline-first | Ver Módulo 6 | Sincronizada con una API real |
| 4 | Escribir widget tests de las 2 pantallas más críticas | Ver Módulo 9 | Verificación de comportamiento clave |
| 5 | Generar los builds de release | Ver Módulo 11 | Android e iOS |

**Verificación:** el proyecto se considera exitoso si la app funciona correctamente sin conexión (mostrando el último caché sincronizado), si toda la gestión de estado pasa por Riverpod o Bloc sin `setState` disperso fuera de casos puramente locales, y si los widget tests de las pantallas críticas pasan consistentemente.

**Errores comunes y soluciones**

- **Organizar el proyecto por tipo de archivo en vez de por feature en una app de tamaño real.** Dificulta el mantenimiento; organiza por feature con Clean Architecture interna.
- **Dejar `setState` disperso en features que ya deberían usar Riverpod/Bloc de forma consistente.** Migra toda la gestión de estado compartido al enfoque elegido.
- **Omitir tests de las pantallas más críticas confiando solo en pruebas manuales.** Los widget tests dan confianza repetible antes de cada release.

---

## Ejercicios de evaluación

### Ejercicio 1: Decisión de arquitectura ante un equipo creciente

**Enunciado:** ¿qué decisión de arquitectura cambiarías si el equipo creciera a 5 personas trabajando en paralelo?

**Solución esperada:** una respuesta razonable menciona reforzar los límites entre features (evitando dependencias cruzadas no declaradas entre `features/tareas` y `features/auth`), adoptar convenciones más estrictas de Clean Architecture para minimizar conflictos de merge, o considerar Bloc sobre Riverpod si el equipo valora la estructura explícita basada en eventos para coordinar trabajo paralelo de forma más predecible.

**Criterios de éxito:**
- Propone una consideración arquitectónica razonable relacionada con límites de features o consistencia de convenciones a mayor escala de equipo.

### Ejercicio 2: Parte del ecosistema más distinta a lo conocido

**Enunciado:** ¿qué parte del ecosistema Flutter (widgets, estado, platform channels) te resultó más distinta a lo que conocías de otros frameworks?

**Solución esperada:** una respuesta válida identifica un aspecto específico de Flutter (por ejemplo, el modelo de constraints "go down, sizes go up" del Módulo 2, o la necesidad de `MethodChannel` para integraciones nativas que en otros frameworks podría estar más abstraída) y lo compara razonadamente con el enfoque equivalente en otro framework conocido.

**Criterios de éxito:**
- Identifica un aspecto concreto de Flutter y lo compara de forma razonada con otro framework.

### Ejercicio 3: Costo de la consistencia de Flutter

**Enunciado:** ¿cuál es el costo principal de que Flutter logre apariencia y rendimiento consistentes entre Android e iOS?

**Solución esperada:** requiere aprender un ecosistema de widgets completamente propio de Flutter, distinto tanto de las tecnologías web como de cada plataforma nativa, dado que Flutter renderiza con su propio motor gráfico en vez de envolver componentes nativos de cada sistema operativo.

**Criterios de éxito:**
- Menciona correctamente el aprendizaje de un ecosistema de widgets propio como el costo principal.

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

- Organizar por feature con Clean Architecture (Domain, Data, Presentation) agrupa código por propósito de negocio, manteniendo la lógica central aislada y testeable.
- El proyecto integrador combina navegación, estado, networking, persistencia y testing en un único sistema coherente.
- Flutter logra apariencia y rendimiento consistentes renderizando con su propio motor gráfico, en vez de envolver componentes nativos.
- El costo de esa consistencia es aprender un ecosistema de widgets propio, distinto de la web y de cada plataforma nativa.

**Conceptos aprendidos**

- Arquitectura por features.
- Gestión de estado con Riverpod/Bloc.
- Persistencia offline-first.
- Tests de widgets clave.
- Clean Architecture.
- Internacionalización con `intl` y `flutter_localizations`.

**Próximos pasos**

Con el track de Flutter completo, los mismos principios de arquitectura (estado predecible, offline-first, testing en capas) reaparecerán en cualquier framework de UI declarativa que explores en el futuro, ya sea nativo o multiplataforma.

**Recursos adicionales**

- Guía oficial de arquitectura de apps en Flutter (docs.flutter.dev/app-architecture).
