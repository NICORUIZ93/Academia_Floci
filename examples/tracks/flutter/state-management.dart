// Gestión de estado (Módulo 4): Provider — patrón representativo de la familia
// ChangeNotifier (también usado por Riverpod internamente en varios providers).
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class Tarea {
  final String id;
  final String titulo;
  final bool completada;
  Tarea({required this.id, required this.titulo, this.completada = false});

  Tarea copyWith({bool? completada}) =>
      Tarea(id: id, titulo: titulo, completada: completada ?? this.completada);
}

// ChangeNotifier: notifica a los widgets suscritos cuando el estado cambia,
// sin acoplar la lógica de negocio a ningún widget específico.
class TareasNotifier extends ChangeNotifier {
  final List<Tarea> _tareas = [];
  List<Tarea> get tareas => List.unmodifiable(_tareas);

  void agregar(String titulo) {
    _tareas.add(Tarea(id: DateTime.now().toIso8601String(), titulo: titulo));
    notifyListeners(); // dispara la reconstrucción de todo widget que escucha este notifier
  }

  void completar(String id) {
    final indice = _tareas.indexWhere((t) => t.id == id);
    if (indice != -1) {
      _tareas[indice] = _tareas[indice].copyWith(completada: true);
      notifyListeners();
    }
  }
}

class AppConProvider extends StatelessWidget {
  const AppConProvider({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => TareasNotifier(),
      child: const PantallaTareas(),
    );
  }
}

class PantallaTareas extends StatelessWidget {
  const PantallaTareas({super.key});

  @override
  Widget build(BuildContext context) {
    // context.watch reconstruye este widget en cada notifyListeners(); usa
    // context.read dentro de callbacks (onPressed) para no suscribirte a cambios.
    final notifier = context.watch<TareasNotifier>();

    return Scaffold(
      body: ListView(
        children: notifier.tareas
            .map((t) => ListTile(
                  title: Text(t.titulo),
                  trailing: t.completada ? const Icon(Icons.check) : null,
                  onTap: () => context.read<TareasNotifier>().completar(t.id),
                ))
            .toList(),
      ),
    );
  }
}
