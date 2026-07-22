# Módulo 3: Navegación y rutas


## Aprende construyendo

### Tema 1: go_router: navegación como función de la URL

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart y editor. Verifica flutter doctor y dart --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app navega, conserva estado y consume una API sin perder contexto cuando cambia de pantalla o falla la red.

#### Paso 3 · Teoría, modelo mental y analogía
La solución separa UI, estado, navegación y datos; cada capa debe tener un contrato y una forma de recuperarse. La analogía es una central logística móvil: cada estación recibe entradas, produce salidas y registra fallos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-avanzado
cd ejemplo-flutter-avanzado
flutter create app
cd app
flutter pub get
flutter run
```
Crea lib/features/deliveries/ con el archivo específico del tema y conecta una pantalla mínima; documenta la ruta, comando y resultado.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una dependencia, ruta o entrada para provocar un fallo deliberado; lee el diagnóstico de Flutter y corrígelo. Resultado esperado: app estable con estado visible.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, prueba de widget, validación de accesibilidad y una decisión documentada entre alternativas.

#### Paso 7 · Cierre y evidencia
Guarda estructura, logs, captura y test; como siguiente paso integra el tema con networking. Errores comunes: estado global sin ownership, navegación sin fallback, errores silenciosos y lógica en build. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app Flutter mantenible necesita fronteras explícitas entre vista, estado y datos.
**Evidencia de aprendizaje:** entrega código, ejecución, fallo, corrección y prueba.
**Conceptos clave:** la URL es la fuente de verdad, no una pila de operaciones push/pop imperativas.

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (context, state) => ListaTareasScreen()),
  GoRoute(
    path: '/tareas/:id',
    builder: (context, state) => DetalleTareaScreen(id: state.pathParameters['id']!),
  ),
]);
```

```dart
context.go('/tareas/42'); // navegación declarativa, la URL es la fuente de verdad
```

El `Navigator` 1.0 (el modelo original de Flutter) gestiona la navegación de forma imperativa: `Navigator.push(context, MaterialPageRoute(builder: ...))` agrega una página al stack, y `Navigator.pop(context)` la retira, un modelo directo pero que trata la navegación como una secuencia de operaciones sobre una pila, sin ninguna representación explícita de "en qué URL/ruta se encuentra la app en este momento"; go_router (construido sobre el Navigator 2.0, la API declarativa introducida posteriormente) invierte este modelo, tratando la navegación como una función pura de la URL actual: `context.go('/tareas/42')` simplemente declara la ruta de destino deseada, y go_router determina automáticamente qué stack de páginas corresponde a esa URL, reconstruyéndolo según sea necesario.

Este modelo declarativo es considerablemente más natural para deep linking (Tema 2) y para Flutter Web (donde la URL del navegador debe reflejar fielmente el estado de navegación de la app, algo que el modelo imperativo de push/pop no maneja naturalmente sin sincronización manual adicional entre el stack interno y la barra de direcciones del navegador).

**Analogía:** el Navigator 1.0 imperativo es como dar instrucciones paso a paso de movimiento ("avanza dos pasos, gira a la derecha") sin ninguna referencia a una dirección absoluta; go_router declarativo es como simplemente indicar una dirección postal completa de destino ("Calle Principal 42") y dejar que el sistema de navegación determine automáticamente la ruta completa necesaria para llegar allí, sin importar desde dónde se partió.

**¿Por qué es importante?** go_router resuelve el problema de que el Navigator 1.0 imperativo no tiene ninguna representación explícita de "en qué ruta está la app", un problema crítico específicamente para deep linking y Flutter Web, donde la URL debe ser la fuente de verdad sincronizada del estado de navegación.

**Código del ejemplo:**

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (context, state) => ListaTareasScreen()),
  GoRoute(path: '/tareas/:id', builder: (context, state) => DetalleTareaScreen(id: state.pathParameters['id']!)),
]);
context.go('/tareas/42');
```

### Tema 2: Guards y deep linking

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart y editor. Verifica flutter doctor y dart --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app navega, conserva estado y consume una API sin perder contexto cuando cambia de pantalla o falla la red.

#### Paso 3 · Teoría, modelo mental y analogía
La solución separa UI, estado, navegación y datos; cada capa debe tener un contrato y una forma de recuperarse. La analogía es una central logística móvil: cada estación recibe entradas, produce salidas y registra fallos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-avanzado
cd ejemplo-flutter-avanzado
flutter create app
cd app
flutter pub get
flutter run
```
Crea lib/features/deliveries/ con el archivo específico del tema y conecta una pantalla mínima; documenta la ruta, comando y resultado.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una dependencia, ruta o entrada para provocar un fallo deliberado; lee el diagnóstico de Flutter y corrígelo. Resultado esperado: app estable con estado visible.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, prueba de widget, validación de accesibilidad y una decisión documentada entre alternativas.

#### Paso 7 · Cierre y evidencia
Guarda estructura, logs, captura y test; como siguiente paso integra el tema con networking. Errores comunes: estado global sin ownership, navegación sin fallback, errores silenciosos y lógica en build. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app Flutter mantenible necesita fronteras explícitas entre vista, estado y datos.
**Evidencia de aprendizaje:** entrega código, ejecución, fallo, corrección y prueba.
**Conceptos clave:** protección declarativa de rutas, deep linking sin lógica especial adicional.

```dart
GoRoute(
  path: '/admin',
  redirect: (context, state) => estaAutenticado ? null : '/login',
  builder: (context, state) => AdminScreen(),
)
```

Un `redirect` declarado directamente en la definición de la ruta intercepta cualquier intento de navegar a esa ruta y decide, según una condición (típicamente el estado de autenticación), si permitir la navegación (devolviendo `null`) o redirigir hacia otra ruta en su lugar (devolviendo la ruta de destino alternativa, como `/login`); esta protección declarativa centraliza la lógica de guard directamente en la definición de la ruta, en vez de dispersar verificaciones manuales de autenticación repetidas en cada widget de pantalla protegida, un enfoque más mantenible y menos propenso a que se olvide proteger una ruta nueva agregada posteriormente.

Con go_router, un link externo (`miapp://tareas/42`) simplemente navega a la ruta correspondiente usando exactamente el mismo mecanismo que la navegación interna dentro de la app, sin ninguna lógica especial adicional de manejo de deep links por separado: dado que la navegación ya es una función de la URL (Tema 1), un deep link es simplemente otra forma de proveer esa URL de entrada al sistema de rutas ya existente, en vez de requerir un mecanismo paralelo de traducción de URLs externas hacia operaciones imperativas de push, como sería necesario con el Navigator 1.0.

**Analogía:** un guard con `redirect` es como un control de acceso automatizado en la entrada de un edificio que verifica credenciales antes de permitir el paso, redirigiendo automáticamente a quienes no las tienen hacia la recepción en vez de dejarlos entrar; el deep linking con go_router es como que cualquier dirección postal válida (interna o proveniente de una fuente externa) se procese exactamente por el mismo sistema de entrega, sin un canal de procesamiento separado según el origen de la dirección.

**¿Por qué es importante?** Los guards declarativos centralizan la protección de rutas directamente en su definición, evitando verificaciones dispersas y propensas a omisión; el deep linking es más directo de configurar con un router declarativo porque la navegación ya es una función de la URL, sin requerir un mecanismo paralelo separado.

**Código del ejemplo:**

```dart
GoRoute(
  path: '/admin',
  redirect: (context, state) => estaAutenticado ? null : '/login',
  builder: (context, state) => AdminScreen(),
)
```

### Tema 3: Transiciones personalizadas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar este tema Flutter desde cero. Prerrequisitos: Flutter SDK, Dart y editor. Verifica flutter doctor y dart --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, la app navega, conserva estado y consume una API sin perder contexto cuando cambia de pantalla o falla la red.

#### Paso 3 · Teoría, modelo mental y analogía
La solución separa UI, estado, navegación y datos; cada capa debe tener un contrato y una forma de recuperarse. La analogía es una central logística móvil: cada estación recibe entradas, produce salidas y registra fallos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-flutter-avanzado
cd ejemplo-flutter-avanzado
flutter create app
cd app
flutter pub get
flutter run
```
Crea lib/features/deliveries/ con el archivo específico del tema y conecta una pantalla mínima; documenta la ruta, comando y resultado.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una dependencia, ruta o entrada para provocar un fallo deliberado; lee el diagnóstico de Flutter y corrígelo. Resultado esperado: app estable con estado visible.

#### Paso 6 · Práctica independiente
Añade loading/empty/error, prueba de widget, validación de accesibilidad y una decisión documentada entre alternativas.

#### Paso 7 · Cierre y evidencia
Guarda estructura, logs, captura y test; como siguiente paso integra el tema con networking. Errores comunes: estado global sin ownership, navegación sin fallback, errores silenciosos y lógica en build. Fuentes oficiales: https://docs.flutter.dev/ y https://api.flutter.dev/.
**¿Por qué es importante?** Porque una app Flutter mantenible necesita fronteras explícitas entre vista, estado y datos.
**Evidencia de aprendizaje:** entrega código, ejecución, fallo, corrección y prueba.
**Conceptos clave:** control explícito sobre la animación de transición entre pantallas.

```dart
GoRoute(
  path: '/detalle',
  pageBuilder: (context, state) => CustomTransitionPage(
    child: DetalleScreen(),
    transitionsBuilder: (context, animation, _, child) => FadeTransition(opacity: animation, child: child),
  ),
)
```

`pageBuilder` en vez del `builder` simple permite envolver la pantalla de destino en un `CustomTransitionPage`, especificando explícitamente cómo debe animarse la transición de entrada y salida de esa ruta (aquí, un fundido de opacidad en vez de la transición de deslizamiento estándar por defecto); esto es apropiado cuando la transición predeterminada de la plataforma no comunica correctamente la relación semántica entre dos pantallas (por ejemplo, un fundido puede comunicar mejor "esto reemplaza completamente el contexto anterior" que un deslizamiento lateral, que sugiere más bien "esto es un paso más profundo dentro del mismo flujo").

Personalizar transiciones de forma consistente en puntos clave de la app (no en absolutamente todas las rutas, lo que podría resultar en una experiencia inconsistente y confusa) refuerza la comunicación visual de la estructura de navegación percibida por el usuario, un detalle de pulido que distingue una app cuidadosamente diseñada de una que simplemente usa las transiciones por defecto sin ninguna consideración deliberada.

**Analogía:** una transición personalizada es como elegir deliberadamente el tipo de puerta apropiado para cada tipo de tránsito en un edificio (una puerta giratoria para tránsito continuo casual, una puerta de seguridad con verificación para un área restringida), comunicando visualmente la naturaleza de cada transición específica en vez de usar el mismo tipo de puerta genérica en todas partes sin ninguna distinción.

**¿Por qué es importante?** Las transiciones personalizadas, aplicadas deliberadamente en puntos clave, comunican mejor la relación semántica entre pantallas que la transición por defecto genérica, un detalle de pulido perceptible por el usuario aunque sutil.

**Código del ejemplo:**

```dart
CustomTransitionPage(
  child: DetalleScreen(),
  transitionsBuilder: (context, animation, _, child) => FadeTransition(opacity: animation, child: child),
)
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con rutas declarativas (go_router), una ruta protegida y deep linking.

**Requisitos previos:** Módulo 2 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Navegar con `Navigator.push`/`pop` clásico | — | Estilo imperativo |
| 2 | Reescribir con go_router declarativo | Ver Tema 1 | Rutas definidas centralmente |
| 3 | Pasar un parámetro de ruta | Ver Tema 1 | Leerlo en la pantalla de destino |
| 4 | Configurar un guard (redirect) | Ver Tema 2 | Bloquea acceso sin sesión activa |
| 5 | Configurar un deep link | Ver Tema 2 | Abre directamente una pantalla específica |

**Verificación:** el laboratorio se considera exitoso si la ruta protegida redirige correctamente a un usuario sin sesión activa, y si el deep link configurado navega directamente a la pantalla correspondiente sin pasos manuales adicionales.

**Errores comunes y soluciones**

- **Mezclar Navigator 1.0 imperativo con go_router declarativo sin necesidad.** Prefiere consistencia con el modelo declarativo salvo casos muy puntuales.
- **Verificar autenticación manualmente dentro de cada widget de pantalla protegida.** Centraliza esa lógica en un `redirect` de la ruta.
- **Aplicar transiciones personalizadas inconsistentemente en toda la app sin criterio.** Resérvalas para puntos clave donde comunican mejor la relación semántica entre pantallas.

---
