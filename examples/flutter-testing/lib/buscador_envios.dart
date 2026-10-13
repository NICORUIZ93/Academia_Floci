import 'package:flutter/material.dart';
typedef Buscar = Future<String> Function(String guia);
class BuscadorEnvios extends StatefulWidget {
  final Buscar buscar;
  const BuscadorEnvios({super.key, required this.buscar});
  @override
  State<BuscadorEnvios> createState() => _BuscadorEnviosState();
}
class _BuscadorEnviosState extends State<BuscadorEnvios> {
  final controller = TextEditingController();
  bool cargando = false;
  String resultado = '';
  Future<void> ejecutar() async {
    setState(() { cargando = true; resultado = ''; });
    try {
      final respuesta = await widget.buscar(controller.text);
      if (mounted) setState(() { resultado = respuesta; });
    } catch (_) {
      if (mounted) setState(() { resultado = 'No se pudo cargar'; });
    } finally {
      if (mounted) setState(() { cargando = false; });
    }
  }
  @override
  void dispose() { controller.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => Column(children: [
    TextField(controller: controller),
    IconButton(onPressed: cargando ? null : ejecutar, icon: const Icon(Icons.search)),
    if (cargando) const CircularProgressIndicator(),
    Text(resultado),
  ]);
}
class ListaEnvios extends StatelessWidget {
  final List<String> envios;
  const ListaEnvios({super.key, required this.envios});
  @override
  Widget build(BuildContext context) => envios.isEmpty ? const Text('Sin envíos')
    : Column(children: envios.map((envio) => Text(envio)).toList());
}
