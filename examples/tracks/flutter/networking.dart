// Networking (Módulo 5): paquete http con serialización JSON manual.
import 'dart:convert';
import 'package:http/http.dart' as http;

class Tarea {
  final String id;
  final String titulo;

  Tarea({required this.id, required this.titulo});

  // fromJson/toJson manuales: sin build_runner ni codegen, apropiado para
  // proyectos pequeños o al enseñar el mecanismo antes de automatizarlo
  // con json_serializable en proyectos más grandes.
  factory Tarea.fromJson(Map<String, dynamic> json) =>
      Tarea(id: json['id'] as String, titulo: json['titulo'] as String);

  Map<String, dynamic> toJson() => {'titulo': titulo};
}

class TareasApi {
  final String baseUrl;
  TareasApi(this.baseUrl);

  Future<List<Tarea>> listarTareas() async {
    final respuesta = await http.get(Uri.parse('$baseUrl/tareas'));

    if (respuesta.statusCode != 200) {
      throw Exception('Error HTTP ${respuesta.statusCode}');
    }

    final lista = jsonDecode(respuesta.body) as List<dynamic>;
    return lista.map((json) => Tarea.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<Tarea> crearTarea(String titulo) async {
    final respuesta = await http.post(
      Uri.parse('$baseUrl/tareas'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'titulo': titulo}),
    );

    if (respuesta.statusCode != 201) {
      throw Exception('Error HTTP ${respuesta.statusCode}');
    }
    return Tarea.fromJson(jsonDecode(respuesta.body) as Map<String, dynamic>);
  }
}
