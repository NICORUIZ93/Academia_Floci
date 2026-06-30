## Arquitectura por features

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

## Uniendo los módulos del track

Este proyecto integra: navegación declarativa con go_router y rutas protegidas (módulo 3), gestión de estado completa con Riverpod o Bloc sin setState disperso (módulo 4), networking con dio y estados explícitos (módulo 5), persistencia offline-first con Hive o sqflite (módulo 6), y widget tests de las pantallas más críticas (módulo 9).

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

## Cierre del track

Flutter cumple su promesa central: una sola base de código Dart, con widgets propios (no wrappers sobre componentes nativos), corriendo con apariencia y rendimiento consistentes en Android e iOS — el costo es aprender un ecosistema de widgets propio, distinto tanto de la web como de cada plataforma nativa.
