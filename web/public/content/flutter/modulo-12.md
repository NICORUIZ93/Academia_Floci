# Módulo 12: Proyecto integrador: app Flutter completa


## Aprende construyendo

### Tema 1: Arquitectura por features y Clean Architecture

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, editor y, si corresponde, Xcode/Android Studio. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app debe probarse, tematizarse, publicarse y operarse con datos reales sin perder accesibilidad ni rendimiento.

#### Paso 3 · Teoría, modelo mental y analogía
El tema conecta una responsabilidad concreta con una frontera verificable: pruebas, diseño, release, arquitectura o producción. La analogía es una operación logística completa: preparación, control, transporte, entrega y seguimiento.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-final
cd ejemplo-flutter-final
flutter create app
cd app
flutter pub get
flutter test
```
Crea lib/features/example/ y el archivo principal del tema; ejecuta la prueba o build correspondiente y documenta la salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración, expectativa o dependencia para provocar un fallo deliberado; diagnostica y corrígelo. Resultado esperado: build/test reproducible y experiencia visible.

#### Paso 6 · Práctica independiente
Añade un caso de error, una prueba de accesibilidad, medición de rendimiento y documentación de la decisión técnica.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, captura, logs y test; como siguiente paso integra el resultado en un proyecto completo. Errores comunes: probar solo el camino feliz, publicar debug, ignorar Semantics y no medir release. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app profesional se prueba, se publica y se opera con evidencia.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, editor y, si corresponde, Xcode/Android Studio. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app debe probarse, tematizarse, publicarse y operarse con datos reales sin perder accesibilidad ni rendimiento.

#### Paso 3 · Teoría, modelo mental y analogía
El tema conecta una responsabilidad concreta con una frontera verificable: pruebas, diseño, release, arquitectura o producción. La analogía es una operación logística completa: preparación, control, transporte, entrega y seguimiento.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-final
cd ejemplo-flutter-final
flutter create app
cd app
flutter pub get
flutter test
```
Crea lib/features/example/ y el archivo principal del tema; ejecuta la prueba o build correspondiente y documenta la salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración, expectativa o dependencia para provocar un fallo deliberado; diagnostica y corrígelo. Resultado esperado: build/test reproducible y experiencia visible.

#### Paso 6 · Práctica independiente
Añade un caso de error, una prueba de accesibilidad, medición de rendimiento y documentación de la decisión técnica.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, captura, logs y test; como siguiente paso integra el resultado en un proyecto completo. Errores comunes: probar solo el camino feliz, publicar debug, ignorar Semantics y no medir release. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app profesional se prueba, se publica y se opera con evidencia.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
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

#### Paso 1 · Objetivo y preparación
Al finalizar podrás aplicar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart, editor y, si corresponde, Xcode/Android Studio. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app debe probarse, tematizarse, publicarse y operarse con datos reales sin perder accesibilidad ni rendimiento.

#### Paso 3 · Teoría, modelo mental y analogía
El tema conecta una responsabilidad concreta con una frontera verificable: pruebas, diseño, release, arquitectura o producción. La analogía es una operación logística completa: preparación, control, transporte, entrega y seguimiento.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-final
cd ejemplo-flutter-final
flutter create app
cd app
flutter pub get
flutter test
```
Crea lib/features/example/ y el archivo principal del tema; ejecuta la prueba o build correspondiente y documenta la salida.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una configuración, expectativa o dependencia para provocar un fallo deliberado; diagnostica y corrígelo. Resultado esperado: build/test reproducible y experiencia visible.

#### Paso 6 · Práctica independiente
Añade un caso de error, una prueba de accesibilidad, medición de rendimiento y documentación de la decisión técnica.

#### Paso 7 · Cierre y evidencia
Guarda código, comandos, captura, logs y test; como siguiente paso integra el resultado en un proyecto completo. Errores comunes: probar solo el camino feliz, publicar debug, ignorar Semantics y no medir release. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app profesional se prueba, se publica y se opera con evidencia.
**Evidencia de aprendizaje:** entrega proyecto aislado, resultado, fallo, corrección, prueba y medición.
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
