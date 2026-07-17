// Widgets: stateless vs stateful (Módulo 1).
import 'package:flutter/material.dart';

// StatelessWidget: no tiene estado mutable propio — se reconstruye solo cuando
// cambian sus parámetros de entrada (aquí, `titulo`), nunca por sí mismo.
class Titulo extends StatelessWidget {
  final String titulo;
  const Titulo({super.key, required this.titulo});

  @override
  Widget build(BuildContext context) {
    return Text(titulo, style: Theme.of(context).textTheme.headlineSmall);
  }
}

// StatefulWidget: separa la definición del widget (inmutable) de su State
// (mutable) — el framework conserva el objeto State entre reconstrucciones,
// incluso cuando el widget en sí se reconstruye.
class Contador extends StatefulWidget {
  const Contador({super.key});

  @override
  State<Contador> createState() => _ContadorState();
}

class _ContadorState extends State<Contador> {
  int _cuenta = 0;

  void _incrementar() {
    // setState() marca este State como "sucio" y programa un rebuild — mutar
    // _cuenta directamente sin setState() no repinta la UI.
    setState(() {
      _cuenta++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Titulo(titulo: 'Contador'),
        Text('Valor: $_cuenta'),
        ElevatedButton(onPressed: _incrementar, child: const Text('+1')),
      ],
    );
  }
}
