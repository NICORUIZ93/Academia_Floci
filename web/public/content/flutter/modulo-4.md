## setState: el punto de partida

Suficiente para estado simple y local a un solo widget. Se vuelve incómodo cuando varios widgets distantes necesitan compartir y reaccionar al mismo estado.

## Riverpod

```dart
final contadorProvider = StateProvider<int>((ref) => 0);

class PantallaContador extends ConsumerWidget {
  Widget build(BuildContext context, WidgetRef ref) {
    final contador = ref.watch(contadorProvider);
    return ElevatedButton(
      onPressed: () => ref.read(contadorProvider.notifier).state++,
      child: Text("$contador"),
    );
  }
}
```

Riverpod verifica los providers en tiempo de COMPILACIÓN (a diferencia de Provider, que depende del árbol de widgets en runtime) — errores de "provider no encontrado" se detectan antes de ejecutar la app.

## Bloc/Cubit: estado basado en eventos

```dart
class ContadorCubit extends Cubit<int> {
  ContadorCubit() : super(0);
  void incrementar() => emit(state + 1);
}

BlocBuilder<ContadorCubit, int>(
  builder: (context, contador) => Text("$contador"),
)
```

Bloc fuerza una separación explícita entre "qué pasó" (evento) y "cómo cambia el estado" (en respuesta) — predecible y fácil de testear, a cambio de más ceremonia que Riverpod para casos simples.

## Cuándo usar cada uno

`setState` para estado puramente local. Riverpod para la mayoría de apps (balance entre simplicidad y robustez). Bloc para equipos grandes que valoran una estructura muy explícita y testing exhaustivo del flujo de eventos.
