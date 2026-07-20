# Módulo 8: Animaciones y rendimiento


## Aprende construyendo

### Tema 1: Animaciones implícitas vs explícitas

**Conceptos clave:** interpolación automática frente a control total sobre curvas y composición.

```dart
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  width: expandido ? 200 : 100,
  color: expandido ? Colors.blue : Colors.grey,
)
```

`AnimatedContainer` (una animación implícita) simplemente interpola automáticamente entre el valor anterior y el nuevo cada vez que una de sus propiedades cambia (aquí, `width` y `color`), sin que el desarrollador escriba ningún código explícito de control de la animación: cambiar el valor de entrada es suficiente para disparar una transición suave automática.

```dart
class _MiAnimacionState extends State<MiAnimacion> with SingleTickerProviderStateMixin {
  late final controller = AnimationController(duration: Duration(seconds: 1), vsync: this);
  late final animacion = Tween<double>(begin: 0, end: 1).animate(controller);

  Widget build(BuildContext context) => FadeTransition(opacity: animacion, child: Text("Hola"));
}
```

Una animación explícita con `AnimationController` y `Tween` da control total sobre curvas de interpolación no lineales, repetición (loop, reverse), y composición de múltiples animaciones sincronizadas entre sí, a cambio de considerablemente más código que una animación implícita; esta elección es apropiada cuando la animación implícita simple no puede expresar el comportamiento deseado (por ejemplo, una secuencia coreografiada de múltiples animaciones distintas disparándose en momentos relativos específicos entre sí, o una animación que debe pausarse y reanudarse programáticamente en respuesta a eventos externos).

**Analogía:** una animación implícita es como encender un regulador de luz que interpola automáticamente la intensidad entre el nivel anterior y el nuevo sin necesidad de programar manualmente esa transición; una animación explícita es como un sistema de iluminación teatral completamente programable, capaz de coreografiar secuencias complejas y sincronizadas de múltiples luces, a cambio de requerir mucho más trabajo de configuración inicial.

**¿Por qué es importante?** Una animación implícita es suficiente cuando basta con interpolar automáticamente entre dos valores; se necesita el control de una explícita para curvas no lineales, repetición controlada, o composición de múltiples animaciones coordinadas entre sí.

**Código del ejemplo:**

```dart
AnimatedContainer(duration: Duration(milliseconds: 300), width: expandido ? 200 : 100)  // implícita
AnimationController(duration: Duration(seconds: 1), vsync: this)                          // explícita
```

### Tema 2: Flutter DevTools y detección de jank

**Conceptos clave:** medición objetiva de tiempo de frame, no percepción subjetiva.

El panel de Performance de Flutter DevTools graba el tiempo real que toma renderizar cada frame individual de la app; a 60fps, cada frame dispone de aproximadamente 16 milisegundos para completarse (construcción, layout, pintura), y cualquier frame que exceda ese presupuesto de tiempo causa "jank" (un entrecorte visual perceptible por el usuario, una pausa o salto brusco en una animación o scroll que debería percibirse como fluido); DevTools resalta exactamente qué fase específica del renderizado (build, layout, o paint) consumió ese tiempo excesivo en el frame problemático, permitiendo diagnosticar con precisión dónde optimizar en vez de adivinar basándose en percepción visual subjetiva, el mismo principio de medición objetiva frente a percepción subjetiva estudiado con Instruments en iOS (Módulo 10 de ese track) y el Layout Inspector en Android (Módulo 10 de ese track).

Grabar una sesión real sobre una interacción específica de scroll o animación (en vez de simplemente confiar en la impresión general de que "se ve fluido" durante desarrollo) revela problemas concretos y medibles, especialmente relevante dado que el hardware de desarrollo suele ser considerablemente más potente que los dispositivos de gama media o baja donde efectivamente correrá la app en manos de usuarios reales.

**Analogía:** Flutter DevTools es como un cronómetro de precisión que mide el tiempo exacto de cada etapa de una línea de ensamblaje, revelando exactamente en qué estación específica se acumula un retraso que ralentiza toda la línea, en vez de simplemente observar que "el proceso general se siente algo lento" sin poder señalar la causa concreta.

**¿Por qué es importante?** DevTools mide objetivamente el tiempo real de cada frame y señala exactamente qué fase del renderizado causó un frame perdido, permitiendo diagnósticos precisos de rendimiento en vez de depender de percepción visual subjetiva durante desarrollo.

**Diagrama:**

```
Frame a 60fps  → presupuesto ~16ms
Frame que excede ese presupuesto → jank perceptible
DevTools señala: ¿build, layout, o paint consumió el tiempo excedido?
```

### Tema 3: const widgets, RepaintBoundary y shouldRepaint

**Conceptos clave:** widgets que Flutter puede omitir por completo durante una reconstrucción.

```dart
const Text("Texto estático") // Flutter sabe que nunca cambia: lo salta en reconstrucciones futuras
```

Marcar un widget que no depende de ningún estado mutable como `const` (verificado por el compilador de Dart, que garantiza que ese widget es efectivamente inmutable en tiempo de compilación) le comunica a Flutter que ese widget específico nunca necesita reconstruirse en respuesta a cambios posteriores, permitiendo que Flutter lo omita por completo durante una reconstrucción del árbol que lo contiene, reduciendo trabajo innecesario de forma medible, especialmente en árboles de widgets grandes con muchos elementos estáticos repetidos (como iconos o textos fijos dentro de una lista larga que se reconstruye frecuentemente por otras razones).

`RepaintBoundary` aísla una porción del árbol de renderizado en su propia capa de pintura independiente, de modo que cambios visuales dentro de esa porción no fuerzan repintar el resto del árbol circundante que no cambió, útil específicamente para widgets que se animan o actualizan frecuentemente rodeados de contenido estático que no debería repintarse innecesariamente en cada frame de esa animación; `shouldRepaint` (un método que se implementa al crear un `CustomPainter` propio) permite controlar explícitamente si una repintura personalizada es realmente necesaria comparando el estado anterior contra el nuevo, evitando repinturas costosas cuando el resultado visual sería idéntico de todas formas.

**Analogía:** un widget `const` es como una pieza de decoración fija atornillada permanentemente a la pared que un equipo de mantenimiento sabe que nunca necesita revisar en cada inspección de rutina, ahorrando ese tiempo de verificación innecesario; `RepaintBoundary` es como una pared divisoria que aísla el ruido y la actividad de renovación de una habitación específica, evitando que esa actividad perturbe innecesariamente a las habitaciones adyacentes que no están siendo renovadas.

**¿Por qué es importante?** Marcar un widget como `const` permite a Flutter omitirlo por completo durante reconstrucciones futuras, reduciendo trabajo innecesario de forma medible; `RepaintBoundary` aísla repinturas frecuentes evitando que afecten innecesariamente al resto del árbol de renderizado circundante.

**Código del ejemplo:**

```dart
const Text("Texto estático")   // omitido por completo en reconstrucciones futuras
RepaintBoundary(child: WidgetQueAnimaFrecuentemente())  // aísla su repintura del resto del árbol
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una animación fluida propia auditada con DevTools sin frames perdidos.

**Requisitos previos:** Módulo 7 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Implementar una animación implícita con `AnimatedContainer` | Ver Tema 1 | Interpolación automática |
| 2 | Implementar la misma animación explícita con `AnimationController` | Ver Tema 1 | Compara el control que da cada enfoque |
| 3 | Grabar el rendimiento con DevTools | Ver Tema 2 | Identifica frames perdidos en scroll |
| 4 | Marcar widgets estáticos como `const` | Ver Tema 3 | Mide la reducción de rebuilds con DevTools |

**Verificación:** el laboratorio se considera exitoso si la sesión grabada en DevTools tras las optimizaciones aplicadas no muestra frames que excedan el presupuesto de ~16ms durante la interacción auditada, y si marcar widgets como `const` reduce medible mente el número de rebuilds registrados.

**Errores comunes y soluciones**

- **Usar una animación explícita cuando una implícita simple sería suficiente.** Prefiere `AnimatedContainer` u otros widgets implícitos para casos simples de interpolación directa.
- **No grabar una sesión real con DevTools, confiando solo en percepción visual.** Mide objetivamente el tiempo de frame antes de asumir que el rendimiento es adecuado.
- **Omitir `const` en widgets estáticos dentro de listas largas.** Aumenta trabajo innecesario de reconstrucción; márcalos como `const` cuando sea posible.

---
