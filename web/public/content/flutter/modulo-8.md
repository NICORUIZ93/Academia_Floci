## Animación implícita

```dart
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  width: expandido ? 200 : 100,
  color: expandido ? Colors.blue : Colors.grey,
)
```

Cambia una propiedad y `AnimatedContainer` interpola automáticamente entre el valor anterior y el nuevo.

## Animación explícita

```dart
class _MiAnimacionState extends State<MiAnimacion> with SingleTickerProviderStateMixin {
  late final controller = AnimationController(duration: Duration(seconds: 1), vsync: this);
  late final animacion = Tween<double>(begin: 0, end: 1).animate(controller);

  Widget build(BuildContext context) => FadeTransition(opacity: animacion, child: Text("Hola"));
}
```

Da control total sobre curvas, repetición y composición de múltiples animaciones — a cambio de más código que una animación implícita.

## Flutter DevTools

El panel de Performance graba el tiempo de cada frame; frames que tardan más de ~16ms (a 60fps) causan "jank" (entrecortes) perceptibles. DevTools resalta exactamente qué build/layout/paint consumió ese tiempo.

## const widgets

```dart
const Text("Texto estático") // Flutter sabe que nunca cambia: lo salta en reconstrucciones futuras
```

Marcar widgets que no dependen de estado como `const` permite a Flutter omitirlos por completo durante una reconstrucción del árbol, reduciendo trabajo innecesario.
