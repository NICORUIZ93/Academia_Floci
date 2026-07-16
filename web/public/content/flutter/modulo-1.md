# Módulo 1: Widgets: stateless vs stateful

## Sílabo

**Objetivo general**

Entender que "en Flutter todo es un widget", dominando la distinción entre `StatelessWidget` y `StatefulWidget`, el árbol de widgets y su reconstrucción, los widgets de layout fundamentales, y cuándo una `Key` estable es realmente necesaria.

**Objetivos específicos**

1. Crear un `StatelessWidget` que reciba datos por constructor, sin estado interno.
2. Crear un `StatefulWidget` con un contador local y observar `setState()`.
3. Construir un layout combinando `Row`, `Column` y `Stack`.
4. Reordenar una lista de widgets con estado sin `Key` y corregir el bug con una `Key` apropiada.
5. Distinguir "rebuild" de Flutter de "re-render" de React.

**Contenido**

- `StatelessWidget` vs `StatefulWidget`.
- Árbol de widgets y reconstrucción (rebuild).
- Widgets de layout (`Row`, `Column`, `Stack`).
- Keys: cuándo importan.
- `initState()`, `dispose()` y `didUpdateWidget()`.
- `Expanded`, `Flexible`, `SizedBox` y `AspectRatio`.

**Evaluación**

Pantalla compuesta por widgets propios reutilizables, con estado local mínimo, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: StatelessWidget vs StatefulWidget

**Conceptos clave:** widget sin estado propio frente a widget con estado mutable y ciclo de vida.

```dart
class TarjetaTarea extends StatelessWidget {
  final String titulo;
  const TarjetaTarea({required this.titulo, super.key});
  Widget build(BuildContext context) => Text(titulo);
}

class Contador extends StatefulWidget {
  State<Contador> createState() => _ContadorState();
}

class _ContadorState extends State<Contador> {
  int valor = 0;
  Widget build(BuildContext context) => ElevatedButton(
    onPressed: () => setState(() => valor++), // dispara la reconstrucción de este widget
    child: Text("$valor"),
  );
}
```

Un `StatelessWidget` describe su UI únicamente en función de los datos que recibe por constructor (`titulo` en `TarjetaTarea`), sin ningún estado mutable propio: si sus datos de entrada nunca cambian, ese widget nunca necesita reconstruirse por sí mismo, aunque sí puede reconstruirse si su padre lo hace con datos nuevos; un `StatefulWidget` separa la definición del widget (`Contador`, inmutable) de un objeto `State` asociado (`_ContadorState`) que sí mantiene estado mutable (`valor`) y persiste a través de reconstrucciones sucesivas del widget que lo contiene.

`setState()` es la señal explícita que le comunica a Flutter "el estado de este `State` cambió, por favor reconstruye este widget (y sus hijos) con los nuevos valores": Flutter compara eficientemente el nuevo árbol de widgets resultante contra el árbol anterior (un proceso llamado "reconciliación", conceptualmente análogo a la reconciliación del DOM virtual en React, Módulo 1 del track de React) y aplica al árbol de renderizado real únicamente los cambios efectivamente necesarios, no una reconstrucción completa desde cero de toda la interfaz visual subyacente.

**Analogía:** un `StatelessWidget` es como una fotografía impresa que muestra exactamente lo que se le entregó para imprimir, sin poder cambiar por sí misma; un `StatefulWidget` con su `State` asociado es como una pantalla digital que puede actualizar su contenido internamente en respuesta a nueva información, mientras mantiene su identidad como el mismo dispositivo físico a través de esas actualizaciones sucesivas.

**¿Por qué es importante?** La distinción entre `StatelessWidget` y `StatefulWidget` determina si un widget puede mantener estado mutable propio persistente entre reconstrucciones; `setState()` es el mecanismo explícito que dispara la reconstrucción eficiente del árbol de widgets tras un cambio de estado.

**Diagrama:**

```dart
class Contador extends StatefulWidget {
  State<Contador> createState() => _ContadorState();
}
class _ContadorState extends State<Contador> {
  int valor = 0;
  // setState() dispara la reconstrucción; `valor` persiste entre reconstrucciones
}
```

### Tema 2: Layout con Row, Column y Stack, y ciclo de vida

**Conceptos clave:** contenedores de layout combinables, hooks del ciclo de vida de un StatefulWidget.

```dart
Column(children: [
  Row(children: [Text("Izquierda"), Spacer(), Text("Derecha")]),
  Stack(children: [Image.asset("fondo.png"), Text("Superpuesto")]),
])
```

`Row`, `Column` y `Stack` son los tres contenedores de layout fundamentales de Flutter: apilan hijos horizontalmente, verticalmente, y superpuestos entre sí respectivamente, exactamente el mismo conjunto mínimo de primitivas de layout estudiado en Jetpack Compose (`Row`/`Column`/`Box`, Módulo 2 del track de Android) y en SwiftUI (`HStack`/`VStack`/`ZStack`, Módulo 1 del track de iOS), reflejando una convergencia consistente entre los frameworks de UI declarativa móvil más importantes hacia el mismo conjunto de primitivas combinables.

`initState()` se ejecuta una única vez cuando el `State` se inserta por primera vez en el árbol, apropiado para inicializar recursos (suscripciones, controladores de animación); `dispose()` se ejecuta cuando el `State` se remueve permanentemente del árbol, apropiado para liberar esos mismos recursos, evitando fugas de memoria; `didUpdateWidget()` se ejecuta cuando el widget se reconstruye con una nueva configuración (nuevos parámetros del constructor) pero el mismo objeto `State` persiste, permitiendo reaccionar a cambios de configuración sin perder el estado interno acumulado hasta ese momento. `Expanded` y `Flexible` distribuyen espacio disponible proporcionalmente entre hijos de un `Row`/`Column`; `SizedBox` fija dimensiones exactas; `AspectRatio` mantiene una proporción específica entre ancho y alto.

**Analogía:** `Row`, `Column` y `Stack` son como los tres tipos básicos de disposición de mobiliario en una habitación (en fila, apilado, superpuesto), combinables para construir cualquier distribución compleja; `initState()`/`dispose()` son como el protocolo de apertura y cierre de un local comercial (encender/apagar sistemas al inicio y fin de operación), mientras `didUpdateWidget()` es como ajustar la configuración interna del local ante un cambio de horario sin cerrar y reabrir el negocio por completo.

**¿Por qué es importante?** `Row`/`Column`/`Stack` son las primitivas combinables de cualquier layout Flutter, compartidas conceptualmente con Compose y SwiftUI; los hooks del ciclo de vida (`initState`, `dispose`, `didUpdateWidget`) son el mecanismo correcto para gestionar recursos y reaccionar a cambios de configuración sin fugas de memoria.

**Diagrama:**

```dart
Column(children: [
  Row(children: [Text("Izquierda"), Spacer(), Text("Derecha")]),
  Stack(children: [Image.asset("fondo.png"), Text("Superpuesto")]),
])
```

### Tema 3: Keys

**Conceptos clave:** identidad estable de un widget a través de reconstrucciones, especialmente al reordenar.

```dart
ListView(children: items.map((item) => TarjetaTarea(key: ValueKey(item.id), titulo: item.titulo)).toList())
```

Sin una `Key` estable, Flutter identifica widgets del mismo tipo dentro de una lista principalmente por su posición en esa lista durante la reconciliación; si la lista se reordena (por ejemplo, el usuario arrastra un elemento a una nueva posición) y esos widgets mantienen estado interno propio (como el estado marcado/desmarcado de un checkbox dentro de cada elemento), Flutter puede confundir qué estado interno pertenece a qué elemento visual tras el reordenamiento, dado que sin una `Key` la única señal de identidad disponible es la posición, no el contenido lógico del elemento. Proveer una `ValueKey(item.id)` (basada en un identificador único y estable del dato subyacente) le da a Flutter una señal de identidad explícita e independiente de la posición, permitiendo reconciliar correctamente cada widget con su estado interno correspondiente sin importar en qué posición se encuentre tras un reordenamiento.

`ValueKey`, `ObjectKey`, `UniqueKey` y `GlobalKey` son las variantes especializadas: `ValueKey` compara por igualdad de un valor (típico para IDs primitivos), `ObjectKey` compara por identidad de un objeto completo, `UniqueKey` genera una identidad siempre distinta (forzando que Flutter nunca reconcilie ese widget con uno anterior), y `GlobalKey` permite acceder al estado de un widget específico desde cualquier lugar del árbol, útil para casos avanzados como validación de formularios distribuidos en múltiples widgets.

**Analogía:** una `Key` es como un número de identificación personal que acompaña a alguien independientemente del orden en que se forme una fila: sin ese identificador, un sistema que solo rastrea "la tercera persona de la fila" confundiría la identidad de las personas si la fila se reordena, mientras que con el identificador estable, el sistema reconoce correctamente a cada persona sin importar su posición actual.

**¿Por qué es importante?** Una `Key` estable es necesaria específicamente cuando se reordena una lista de widgets con estado interno propio, evitando que Flutter confunda qué estado pertenece a qué elemento tras el reordenamiento; sin reordenamiento ni estado interno relevante, una `Key` explícita suele ser innecesaria.

**Diagrama:**

```dart
items.map((item) => TarjetaTarea(key: ValueKey(item.id), titulo: item.titulo)).toList()
// La Key vincula el widget a la IDENTIDAD del dato, no a su posición en la lista
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una pantalla compuesta por widgets propios reutilizables, con estado local mínimo.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un `StatelessWidget` sin estado interno | Ver Tema 1 | Recibe datos por constructor |
| 2 | Crear un `StatefulWidget` con un contador local | Ver Tema 1 | Observa `setState()` |
| 3 | Combinar `Row`, `Column` y `Stack` | Ver Tema 2 | Layout completo |
| 4 | Reordenar una lista con estado sin `Key`, luego corregir | Ver Tema 3 | Observa el bug, corrígelo con `ValueKey` |
| 5 | Documentar rebuild vs re-render | Ver Tema 1 | En tus propias palabras |

**Verificación:** el laboratorio se considera exitoso si la lista con checkboxes mantiene correctamente el estado de cada elemento tras reordenarse, gracias a una `Key` apropiada, y si el `StatefulWidget` reconstruye correctamente su UI al invocar `setState()`.

**Errores comunes y soluciones**

- **Mantener lógica compleja o estado innecesario en un `StatelessWidget`.** Si necesita estado mutable propio, conviértelo en `StatefulWidget`.
- **Omitir una `Key` en una lista reordenable con widgets de estado interno.** Provoca confusión de estado entre elementos tras reordenar; usa `ValueKey` con un identificador estable.
- **Realizar inicialización costosa directamente en `build()` en vez de `initState()`.** `build()` puede ejecutarse múltiples veces; usa `initState()` para inicialización única.

---

## Ejercicios de evaluación

### Ejercicio 1: Cuándo se necesita realmente una Key

**Enunciado:** ¿cuándo necesitas realmente una `Key`, más allá de "Flutter lo pide"?

**Solución esperada:** cuando se reordena una lista de widgets del mismo tipo que mantienen estado interno propio (como un checkbox), sin una `Key` estable Flutter puede confundir qué estado interno corresponde a qué elemento tras el reordenamiento, dado que por defecto identifica los widgets principalmente por su posición.

**Criterios de éxito:**
- Explica correctamente el reordenamiento de listas con estado interno como el caso concreto donde una `Key` es necesaria.

### Ejercicio 2: Por qué un StatelessWidget puede ser dinámico

**Enunciado:** ¿por qué un `StatelessWidget` puede seguir siendo "dinámico" si sus datos vienen de un padre que sí tiene estado?

**Solución esperada:** un `StatelessWidget` no mantiene estado propio, pero se reconstruye automáticamente cuando su padre (que sí tiene estado, vía `StatefulWidget`) le pasa datos nuevos como parámetros de constructor; la dinámica proviene del padre, no del `StatelessWidget` en sí mismo.

**Criterios de éxito:**
- Explica correctamente que la dinámica proviene de la reconstrucción impulsada por el padre con nuevos datos.

### Ejercicio 3: Rebuild vs re-render

**Enunciado:** ¿qué diferencia hay entre "rebuild" (Flutter) y "re-render" (React)?

**Solución esperada:** ambos términos describen el mismo principio fundamental: volver a ejecutar la función/método que describe la UI en respuesta a un cambio de estado, y reconciliar el resultado contra el árbol anterior para aplicar únicamente los cambios necesarios al renderizado real, aunque cada framework usa terminología distinta para el mismo concepto.

**Criterios de éxito:**
- Reconoce correctamente que ambos términos describen el mismo principio de reconciliación, con terminología distinta por framework.

---

## Resumen del módulo

**Puntos clave**

- `StatelessWidget` no mantiene estado propio; `StatefulWidget` separa la definición del widget de un `State` mutable persistente.
- `Row`, `Column` y `Stack` son las primitivas de layout combinables, compartidas conceptualmente con Compose y SwiftUI.
- Los hooks del ciclo de vida (`initState`, `dispose`, `didUpdateWidget`) gestionan recursos correctamente sin fugas de memoria.
- Una `Key` estable es necesaria al reordenar listas de widgets con estado interno propio, evitando confusión de identidad.

**Conceptos aprendidos**

- `StatelessWidget` vs `StatefulWidget`.
- Árbol de widgets y reconstrucción.
- Widgets de layout.
- Keys.
- Ciclo de vida (`initState`, `dispose`, `didUpdateWidget`).
- `Expanded`, `Flexible`, `SizedBox`, `AspectRatio`.

**Próximos pasos**

En el Módulo 2 aprenderás a adaptar tu UI a teléfonos, tablets y web desde un mismo código, usando `MediaQuery`, `LayoutBuilder` y breakpoints.

**Recursos adicionales**

- Documentación oficial de widgets de Flutter (docs.flutter.dev/ui/widgets-intro).
