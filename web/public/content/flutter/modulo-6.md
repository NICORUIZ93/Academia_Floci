## shared_preferences: clave-valor simple

```dart
final prefs = await SharedPreferences.getInstance();
await prefs.setBool('tema_oscuro', true);
final temaOscuro = prefs.getBool('tema_oscuro') ?? false;
```

Ideal para configuración pequeña (un booleano, un string) — NO apropiado para listas grandes de objetos estructurados.

## sqflite: SQL relacional

```dart
final db = await openDatabase('app.db', version: 1, onCreate: (db, version) {
  db.execute('CREATE TABLE tarea(id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)');
});

await db.insert('tarea', {'id': '1', 'titulo': 'Comprar leche', 'completada': 0});
final tareas = await db.query('tarea');
```

## Hive: NoSQL embebido

```dart
@HiveType(typeId: 0)
class Tarea extends HiveObject {
  @HiveField(0) String titulo;
  @HiveField(1) bool completada;
}

final box = await Hive.openBox<Tarea>('tareas');
box.add(Tarea(titulo: 'Comprar leche', completada: false));
```

Hive es más simple y rápido para modelos de objetos directos sin relaciones complejas; sqflite (SQL real) es mejor cuando necesitas queries relacionales o joins.

## Offline-first

```dart
Stream<List<Tarea>> get tareas => box.watch().map((_) => box.values.toList());

Future<void> sincronizar() async {
  final remotas = await api.obtenerTareas();
  for (final t in remotas) { box.put(t.id, t); }
}
```
