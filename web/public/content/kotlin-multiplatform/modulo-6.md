## Esquema SQLDelight

```sql
-- Tarea.sq
CREATE TABLE Tarea (
    id TEXT NOT NULL PRIMARY KEY,
    titulo TEXT NOT NULL,
    completada INTEGER NOT NULL DEFAULT 0
);

selectTodas:
SELECT * FROM Tarea;

insertar:
INSERT INTO Tarea(id, titulo, completada) VALUES (?, ?, ?);
```

SQLDelight genera código Kotlin tipado a partir de este archivo `.sq` — si escribes mal el nombre de una columna, el error aparece en tiempo de COMPILACIÓN, no como un crash en producción.

```kotlin
val tareas: List<Tarea> = database.tareaQueries.selectTodas().executeAsList()
```

## Drivers por plataforma

```kotlin
// androidMain
actual fun crearDriver(): SqlDriver = AndroidSqliteDriver(Database.Schema, context, "app.db")

// iosMain
actual fun crearDriver(): SqlDriver = NativeSqliteDriver(Database.Schema, "app.db")
```

Las queries son compartidas (`commonMain`), pero el driver que las ejecuta contra SQLite es específico de cada plataforma — un caso típico de `expect/actual`.

## Migraciones

```sql
-- 2.sqm
ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0;
```

SQLDelight aplica las migraciones en orden según la versión de esquema detectada en el dispositivo del usuario.
