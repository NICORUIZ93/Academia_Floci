## MediaQuery y LayoutBuilder

```dart
final ancho = MediaQuery.of(context).size.width;

LayoutBuilder(builder: (context, constraints) {
  return constraints.maxWidth > 600
      ? Row(children: [Expanded(child: ListaTareas()), Expanded(child: DetalleTarea())])
      : ListaTareas(); // una sola columna en pantallas angostas
});
```

`MediaQuery` da el tamaño de la pantalla completa; `LayoutBuilder` da las constraints del espacio disponible para ESE widget específico — más preciso cuando el widget no ocupa toda la pantalla.

## Cómo Flutter calcula tamaños

Las constraints fluyen hacia abajo (un padre le dice a su hijo el espacio máximo/mínimo disponible) y los tamaños fluyen hacia arriba (el hijo decide su tamaño dentro de esas constraints y se lo informa al padre) — Flutter llama a esto "constraints go down, sizes go up".

## Breakpoints propios

```dart
enum TipoDispositivo { movil, tablet, escritorio }

TipoDispositivo segunAncho(double ancho) {
  if (ancho < 600) return TipoDispositivo.movil;
  if (ancho < 1024) return TipoDispositivo.tablet;
  return TipoDispositivo.escritorio;
}
```

## SafeArea

```dart
Scaffold(body: SafeArea(child: ContenidoPrincipal()))
```

Evita que el contenido quede oculto detrás del notch, la barra de estado o los controles de gestos del sistema.
