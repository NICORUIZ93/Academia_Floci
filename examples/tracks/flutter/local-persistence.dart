// Persistencia local (Módulo 6): SharedPreferences (clave-valor simple) vs
// sqflite (SQLite relacional) — cuándo usar cada uno.
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

// SharedPreferences: apropiado para configuración simple (tema, idioma, flags),
// NO para colecciones grandes de datos estructurados — no tiene consultas,
// solo lectura/escritura de la clave completa cada vez.
class PreferenciasUsuario {
  Future<void> guardarTema(String tema) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('tema', tema);
  }

  Future<String> leerTema() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('tema') ?? 'claro';
  }

  // Para estructuras más complejas, se serializa a JSON manualmente —
  // SharedPreferences en sí solo entiende tipos primitivos.
  Future<void> guardarFiltros(Map<String, dynamic> filtros) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('filtros', jsonEncode(filtros));
  }
}

// sqflite: base de datos relacional real — apropiado cuando necesitas consultas,
// relaciones entre tablas, o simplemente muchos registros (cientos o miles de tareas).
class TareasDatabase {
  Future<Database> _abrir() => openDatabase(
        'tareas.db',
        version: 1,
        onCreate: (db, version) => db.execute(
          'CREATE TABLE tareas(id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)',
        ),
      );

  Future<void> insertar(String id, String titulo) async {
    final db = await _abrir();
    await db.insert('tareas', {'id': id, 'titulo': titulo, 'completada': 0});
  }

  Future<List<Map<String, dynamic>>> listar() async {
    final db = await _abrir();
    return db.query('tareas', orderBy: 'titulo');
  }
}
