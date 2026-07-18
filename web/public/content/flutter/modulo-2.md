# Módulo 2: Layout y diseño responsive

## Sílabo

**Objetivo general**

Adaptar la UI a teléfonos, tablets y web desde un mismo código base, entendiendo cómo Flutter calcula tamaños mediante constraints, cuándo usar `MediaQuery` frente a `LayoutBuilder`, y cómo definir breakpoints propios para distintos rangos de pantalla.

**Objetivos específicos**

1. Usar `MediaQuery` para adaptar el padding según el ancho de pantalla.
2. Usar `LayoutBuilder` para mostrar layouts distintos en teléfono y tablet.
3. Definir al menos 2 breakpoints propios.
4. Envolver una pantalla con `SafeArea`.

**Contenido**

- `MediaQuery` y `LayoutBuilder`.
- Constraints: cómo Flutter calcula tamaños.
- Breakpoints para distintos tamaños de pantalla.
- `SafeArea` e insets.

**Evaluación**

Pantalla que se adapta correctamente entre un teléfono y una tablet, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: MediaQuery vs LayoutBuilder

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

- `MediaQuery` da el tamaño de la pantalla completa; `LayoutBuilder` da el espacio específico disponible para el widget que lo consulta.
- Flutter calcula tamaños con el protocolo "constraints go down, sizes go up" en una única pasada eficiente.
- Centralizar breakpoints en una función reutilizable evita comparaciones numéricas inconsistentes dispersas por el código.
- `SafeArea` protege el contenido de elementos físicos y del sistema que varían considerablemente entre dispositivos.

**Conceptos aprendidos**

- `MediaQuery` y `LayoutBuilder`.
- Constraints y cálculo de tamaños.
- Breakpoints para distintos tamaños de pantalla.
- `SafeArea` e insets.

**Próximos pasos**

En el Módulo 3 aprenderás a estructurar una app con múltiples pantallas usando enrutamiento declarativo con go_router.

**Recursos adicionales**

- Documentación oficial de layouts adaptables de Flutter (docs.flutter.dev/ui/adaptive-responsive).
