# Módulo 3: Navegación y rutas

## Sílabo

**Objetivo general**

Estructurar una app con múltiples pantallas usando enrutamiento declarativo con go_router, entendiendo la diferencia frente al modelo imperativo del Navigator 1.0, y configurando parámetros de ruta, guards de autenticación y deep linking.

**Objetivos específicos**

1. Navegar entre pantallas con `Navigator.push`/`pop` (imperativo clásico).
2. Reescribir esa navegación con go_router de forma declarativa.
3. Pasar un parámetro de ruta y leerlo en la pantalla de destino.
4. Configurar un guard (redirect) que bloquee una ruta sin sesión activa.
5. Configurar un deep link.

**Contenido**

- Navigator 1.0 (push/pop) vs 2.0 (declarativo).
- go_router: rutas, parámetros y guards.
- Deep linking.
- Transiciones personalizadas.

**Evaluación**

App con rutas declarativas (go_router), una ruta protegida y deep linking, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: go_router: navegación como función de la URL

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

**Diagrama:**

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (context, state) => ListaTareasScreen()),
  GoRoute(path: '/tareas/:id', builder: (context, state) => DetalleTareaScreen(id: state.pathParameters['id']!)),
]);
context.go('/tareas/42');
```

### Tema 2: Guards y deep linking

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

**Diagrama:**

```dart
GoRoute(
  path: '/admin',
  redirect: (context, state) => estaAutenticado ? null : '/login',
  builder: (context, state) => AdminScreen(),
)
```

### Tema 3: Transiciones personalizadas

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

**Diagrama:**

```dart
CustomTransitionPage(
  child: DetalleScreen(),
  transitionsBuilder: (context, animation, _, child) => FadeTransition(opacity: animation, child: child),
)
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

## Ejercicios de evaluación

### Ejercicio 1: Qué problema resuelve go_router

**Enunciado:** ¿qué problema de navegación declarativa resuelve go_router frente al Navigator 1.0 imperativo?

**Solución esperada:** el Navigator 1.0 gestiona la navegación como una secuencia de operaciones push/pop sobre una pila, sin ninguna representación explícita de en qué URL/ruta se encuentra la app; go_router trata la navegación como una función pura de la URL actual, resolviendo automáticamente el stack correspondiente, un modelo más natural para deep linking y Flutter Web.

**Criterios de éxito:**
- Explica correctamente la ausencia de representación explícita de URL en el Navigator 1.0 como el problema resuelto.

### Ejercicio 2: Por qué el deep linking es más directo con un router declarativo

**Enunciado:** ¿por qué el deep linking es más directo de configurar con un router declarativo?

**Solución esperada:** dado que la navegación ya es una función de la URL, un deep link externo simplemente provee esa URL de entrada al mismo sistema de rutas ya existente, sin requerir un mecanismo paralelo separado de traducción de URLs externas hacia operaciones imperativas de push como sería necesario con el Navigator 1.0.

**Criterios de éxito:**
- Explica correctamente que el deep link reutiliza el mismo mecanismo de navegación basado en URL, sin lógica especial adicional.

### Ejercicio 3: Ventaja de centralizar un guard en la ruta

**Enunciado:** ¿qué ventaja da centralizar un guard de autenticación en la definición de la ruta (`redirect`) en vez de verificarlo manualmente dentro de cada pantalla protegida?

**Solución esperada:** centraliza la lógica de protección en un único lugar mantenible, evitando verificaciones dispersas y propensas a omitirse al agregar una ruta nueva que también debería estar protegida pero que un desarrollador podría olvidar verificar manualmente.

**Criterios de éxito:**
- Explica correctamente la centralización y reducción de omisiones como la ventaja.

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

- go_router trata la navegación como una función pura de la URL actual, en contraste con el modelo imperativo de push/pop del Navigator 1.0.
- Los guards (`redirect`) centralizan la protección de rutas directamente en su definición, evitando verificaciones dispersas.
- El deep linking es directo con go_router porque reutiliza el mismo mecanismo de navegación basado en URL, sin lógica especial adicional.
- Las transiciones personalizadas, usadas deliberadamente, comunican mejor la relación semántica entre pantallas.

**Conceptos aprendidos**

- Navigator 1.0 vs 2.0.
- go_router: rutas, parámetros y guards.
- Deep linking.
- Transiciones personalizadas.

**Próximos pasos**

En el Módulo 4 aprenderás gestión de estado: cuándo `setState` es suficiente, y cuándo pasar a Riverpod o Bloc/Cubit.

**Recursos adicionales**

- Documentación oficial de go_router (pub.dev/packages/go_router).
