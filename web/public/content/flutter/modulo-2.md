# Módulo 2: Layout y diseño responsive


## Aprende construyendo

### Tema 1: MediaQuery vs LayoutBuilder

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar layouts Flutter adaptables desde cero. Prerrequisitos: Flutter SDK y emulador. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas debe funcionar en teléfonos, tabletas y orientación horizontal sin contenido cortado.

#### Paso 3 · Teoría, modelo mental y analogía
MediaQuery describe entorno global; LayoutBuilder responde al espacio del padre; constraints fluyen de arriba abajo y sizes de abajo arriba. SafeArea respeta zonas del sistema. La analogía es amueblar una habitación: primero conoces límites, después eliges distribución.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-m2
cd ejemplo-flutter-m2
flutter create app
cd app
flutter run
```
Crea lib/responsive_delivery.dart con MediaQuery, LayoutBuilder y breakpoint; pruébalo en dos tamaños de emulador.

#### Paso 5 · Práctica guiada
Pista: fuerza deliberadamente un ancho infinito para provocar un fallo deliberado de constraints; lee el error y corrígelo con Expanded o límites. Resultado esperado: layout estable.

#### Paso 6 · Práctica independiente
Añade SafeArea, orientación, texto grande y una prueba golden o captura comparativa.

#### Paso 7 · Cierre y evidencia
Guarda capturas de tamaños, código y diagnóstico; como siguiente paso estudia navegación. Errores comunes: Expanded fuera de Flex, MediaQuery en exceso, hardcodear píxeles y olvidar SafeArea. Fuentes oficiales: https://docs.flutter.dev/ui/layout/constraints y https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html.
**¿Por qué es importante?** Porque responsive es una propiedad funcional, no un ajuste final.
**Evidencia de aprendizaje:** entrega layouts, fallo de constraints, corrección y comparativa.
**Conceptos clave:** tamaño de la pantalla completa frente a espacio disponible para un widget específico.

```dart
final ancho = MediaQuery.of(context).size.width;

LayoutBuilder(builder: (context, constraints) {
  return constraints.maxWidth > 600
      ? Row(children: [Expanded(child: ListaTareas()), Expanded(child: DetalleTarea())])
      : ListaTareas(); // una sola columna en pantallas angostas
});
```

`MediaQuery.of(context).size` da el tamaño de la pantalla física completa del dispositivo, independientemente de cuánto espacio ocupe efectivamente el widget que consulta esa información; `LayoutBuilder` en cambio da las constraints del espacio específicamente disponible para ese widget en particular dentro de su posición actual en el árbol, lo que resulta considerablemente más preciso cuando el widget bajo consideración no ocupa la pantalla completa (por ejemplo, un panel lateral dentro de un layout más amplio), dado que ese panel podría tener un espacio disponible completamente distinto al ancho total de la pantalla del dispositivo.

Elegir incorrectamente entre ambos mecanismos es una fuente común de bugs sutiles de responsive design: usar `MediaQuery` para decidir el layout de un widget anidado profundamente dentro de otros contenedores puede producir decisiones de layout incorrectas si ese widget específico no ocupa realmente el ancho completo de la pantalla, mientras que `LayoutBuilder` siempre refleja el espacio real y específico disponible para ese widget en su contexto actual.

**Analogía:** `MediaQuery` es como preguntar "¿cuál es el tamaño total del edificio completo?"; `LayoutBuilder` es como preguntar "¿cuál es el tamaño específico de esta habitación en la que me encuentro ahora?" — ambas preguntas son válidas, pero la segunda es la relevante para decidir cómo distribuir el mobiliario dentro de esa habitación específica, no del edificio entero.

**¿Por qué es importante?** `LayoutBuilder` es más preciso que `MediaQuery` cuando el widget que decide su layout no ocupa toda la pantalla, dado que refleja el espacio real y específico disponible para ese widget en su posición actual del árbol, no el tamaño total del dispositivo.

**Código del ejemplo:**

```dart
MediaQuery.of(context).size.width       // tamaño de la PANTALLA completa
LayoutBuilder(builder: (context, constraints) => ...)  // espacio disponible para ESTE widget específico
```

### Tema 2: Cómo Flutter calcula tamaños

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar layouts Flutter adaptables desde cero. Prerrequisitos: Flutter SDK y emulador. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas debe funcionar en teléfonos, tabletas y orientación horizontal sin contenido cortado.

#### Paso 3 · Teoría, modelo mental y analogía
MediaQuery describe entorno global; LayoutBuilder responde al espacio del padre; constraints fluyen de arriba abajo y sizes de abajo arriba. SafeArea respeta zonas del sistema. La analogía es amueblar una habitación: primero conoces límites, después eliges distribución.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-m2
cd ejemplo-flutter-m2
flutter create app
cd app
flutter run
```
Crea lib/responsive_delivery.dart con MediaQuery, LayoutBuilder y breakpoint; pruébalo en dos tamaños de emulador.

#### Paso 5 · Práctica guiada
Pista: fuerza deliberadamente un ancho infinito para provocar un fallo deliberado de constraints; lee el error y corrígelo con Expanded o límites. Resultado esperado: layout estable.

#### Paso 6 · Práctica independiente
Añade SafeArea, orientación, texto grande y una prueba golden o captura comparativa.

#### Paso 7 · Cierre y evidencia
Guarda capturas de tamaños, código y diagnóstico; como siguiente paso estudia navegación. Errores comunes: Expanded fuera de Flex, MediaQuery en exceso, hardcodear píxeles y olvidar SafeArea. Fuentes oficiales: https://docs.flutter.dev/ui/layout/constraints y https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html.
**¿Por qué es importante?** Porque responsive es una propiedad funcional, no un ajuste final.
**Evidencia de aprendizaje:** entrega layouts, fallo de constraints, corrección y comparativa.
**Conceptos clave:** constraints fluyen hacia abajo, tamaños fluyen hacia arriba.

Flutter resuelve el layout de todo el árbol de widgets siguiendo un protocolo estricto conocido como "constraints go down, sizes go up": un widget padre le comunica a cada hijo el rango de tamaños permitido (mínimo y máximo de ancho y alto, las "constraints"), y cada hijo, dentro de ese rango permitido, decide su propio tamaño final y se lo informa de vuelta a su padre; el padre nunca dicta directamente el tamaño exacto de un hijo (salvo que las constraints mínima y máxima coincidan exactamente), y un hijo nunca puede ignorar las constraints recibidas de su padre para elegir un tamaño fuera de ese rango permitido.

Este protocolo unidireccional y predecible (información de restricción fluyendo hacia abajo, información de tamaño resultante fluyendo hacia arriba) es lo que permite que Flutter calcule el layout completo de un árbol arbitrariamente complejo en una única pasada eficiente, sin necesidad de múltiples iteraciones de ajuste entre padres e hijos como podría requerir un sistema de layout menos estructurado; entender este protocolo explica comportamientos que de otra forma parecerían contraintuitivos, como por qué un `Container` sin restricciones explícitas de tamaño puede comportarse de forma distinta según el contexto exacto en el que se encuentre anidado.

**Analogía:** el protocolo de constraints de Flutter es como una cadena de encargos de fabricación donde cada nivel superior especifica un rango aceptable de dimensiones para la pieza que solicita (no exactamente una única medida fija), y cada fabricante en un nivel inferior decide la medida exacta final dentro de ese rango permitido, comunicando de vuelta esa decisión final hacia quien hizo el encargo original.

**¿Por qué es importante?** Entender el protocolo "constraints go down, sizes go up" explica de forma predecible por qué un widget termina con el tamaño final que tiene, permitiendo diagnosticar problemas de layout inesperados razonando sobre qué constraints recibió realmente cada widget de su padre.

**Diagrama:**

```
Padre → constraints (min/max ancho, min/max alto) → Hijo
Hijo → tamaño final elegido dentro de esas constraints → Padre
```

### Tema 3: Breakpoints propios y SafeArea

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar layouts Flutter adaptables desde cero. Prerrequisitos: Flutter SDK y emulador. Verifica flutter doctor.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas debe funcionar en teléfonos, tabletas y orientación horizontal sin contenido cortado.

#### Paso 3 · Teoría, modelo mental y analogía
MediaQuery describe entorno global; LayoutBuilder responde al espacio del padre; constraints fluyen de arriba abajo y sizes de abajo arriba. SafeArea respeta zonas del sistema. La analogía es amueblar una habitación: primero conoces límites, después eliges distribución.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-m2
cd ejemplo-flutter-m2
flutter create app
cd app
flutter run
```
Crea lib/responsive_delivery.dart con MediaQuery, LayoutBuilder y breakpoint; pruébalo en dos tamaños de emulador.

#### Paso 5 · Práctica guiada
Pista: fuerza deliberadamente un ancho infinito para provocar un fallo deliberado de constraints; lee el error y corrígelo con Expanded o límites. Resultado esperado: layout estable.

#### Paso 6 · Práctica independiente
Añade SafeArea, orientación, texto grande y una prueba golden o captura comparativa.

#### Paso 7 · Cierre y evidencia
Guarda capturas de tamaños, código y diagnóstico; como siguiente paso estudia navegación. Errores comunes: Expanded fuera de Flex, MediaQuery en exceso, hardcodear píxeles y olvidar SafeArea. Fuentes oficiales: https://docs.flutter.dev/ui/layout/constraints y https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html.
**¿Por qué es importante?** Porque responsive es una propiedad funcional, no un ajuste final.
**Evidencia de aprendizaje:** entrega layouts, fallo de constraints, corrección y comparativa.
**Conceptos clave:** categorización explícita de rangos de pantalla, protección contra elementos físicos del dispositivo.

```dart
enum TipoDispositivo { movil, tablet, escritorio }

TipoDispositivo segunAncho(double ancho) {
  if (ancho < 600) return TipoDispositivo.movil;
  if (ancho < 1024) return TipoDispositivo.tablet;
  return TipoDispositivo.escritorio;
}
```

Definir breakpoints propios como una función pura que mapea un ancho de pantalla a una categoría explícita (`móvil`, `tablet`, `escritorio`) centraliza esa lógica de categorización en un único lugar reutilizable en toda la app, en vez de dispersar comparaciones numéricas ad hoc (`if (ancho > 600)`) repetidas de forma inconsistente en cada widget que necesita tomar una decisión de layout responsive, un riesgo de inconsistencia que crece a medida que la app agrega más pantallas con lógica responsive propia.

```dart
Scaffold(body: SafeArea(child: ContenidoPrincipal()))
```

`SafeArea` evita que el contenido de la app quede oculto detrás de elementos físicos o del sistema operativo que ocupan espacio en los bordes de la pantalla: el notch de la cámara frontal, la barra de estado del sistema, o los controles de gestos de navegación en la parte inferior; `SafeArea` importa más en algunos dispositivos que en otros precisamente porque estos elementos varían considerablemente entre modelos (un dispositivo con notch pronunciado necesita más inset superior que uno sin notch, y dispositivos con controles de gestos en vez de botones físicos necesitan más inset inferior).

**Analogía:** los breakpoints propios son como categorías de talla de ropa estandarizadas (pequeña, mediana, grande) definidas una única vez y reutilizadas consistentemente en todo un catálogo, en vez de que cada prenda individual defina sus propios rangos de medida ad hoc de forma potencialmente inconsistente; `SafeArea` es como el margen de seguridad que respeta el marco de una ventana al colgar una cortina, evitando que la tela quede atrapada o cubierta por elementos estructurales del marco mismo.

**¿Por qué es importante?** Centralizar los breakpoints en una función reutilizable evita inconsistencias de comparaciones numéricas dispersas; `SafeArea` importa de forma variable según el dispositivo específico dado que los elementos físicos y del sistema que invaden los bordes de pantalla (notch, controles de gestos) difieren considerablemente entre modelos.

**Código del ejemplo:**

```dart
enum TipoDispositivo { movil, tablet, escritorio }
TipoDispositivo segunAncho(double ancho) {
  if (ancho < 600) return TipoDispositivo.movil;
  if (ancho < 1024) return TipoDispositivo.tablet;
  return TipoDispositivo.escritorio;
}
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una pantalla que se adapta correctamente entre un teléfono y una tablet.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Adaptar el padding según el ancho con `MediaQuery` | Ver Tema 1 | Tamaño de pantalla completa |
| 2 | Mostrar layouts distintos con `LayoutBuilder` | Ver Tema 1 | Espacio específico del widget |
| 3 | Definir al menos 2 breakpoints propios | Ver Tema 3 | Función reutilizable |
| 4 | Envolver la pantalla con `SafeArea` | Ver Tema 3 | Verifica notch y barra de estado |

**Verificación:** el laboratorio se considera exitoso si la pantalla muestra correctamente una columna en teléfono y dos columnas lado a lado en tablet, y si el contenido no queda oculto detrás del notch o la barra de estado en ningún dispositivo probado.

**Errores comunes y soluciones**

- **Usar `MediaQuery` para decidir el layout de un widget anidado que no ocupa toda la pantalla.** Prefiere `LayoutBuilder` para el espacio real disponible de ese widget específico.
- **Dispersar comparaciones numéricas de breakpoints ad hoc en cada widget.** Centraliza la lógica en una función reutilizable.
- **Omitir `SafeArea` asumiendo que todos los dispositivos tienen los mismos insets.** Verifica en dispositivos con notch pronunciado y controles de gestos.

---
