// Persistencia compartida con SQLDelight (Módulo 6): SQL tipado, compartido entre plataformas.
//
// SQLDelight genera código Kotlin a partir de archivos .sq con SQL real — el
// compilador verifica las consultas contra el esquema en tiempo de compilación,
// a diferencia de construir SQL como texto plano y descubrir errores en runtime.

// --- src/commonMain/sqldelight/com/ejemplo/db/Tarea.sq ---
// CREATE TABLE Tarea (
//   id TEXT NOT NULL PRIMARY KEY,
//   titulo TEXT NOT NULL,
//   completada INTEGER NOT NULL DEFAULT 0
// );
//
// selectTodas:
// SELECT * FROM Tarea;
//
// insertar:
// INSERT INTO Tarea(id, titulo, completada) VALUES (?, ?, ?);
//
// marcarCompletada:
// UPDATE Tarea SET completada = 1 WHERE id = ?;

import com.ejemplo.db.AppDatabase
import kotlinx.coroutines.flow.Flow

// El driver (SqlDriver) es la única pieza específica de plataforma: cada una usa
// una implementación distinta (AndroidSqliteDriver, NativeSqliteDriver para iOS),
// pero el resto de este repositorio es 100% código compartido en commonMain.
class TareasRepository(private val db: AppDatabase) {

  fun observarTareas(): Flow<List<com.ejemplo.db.Tarea>> {
    // asFlow() convierte los cambios de la consulta en un Flow reactivo: cualquier
    // insert/update/delete sobre la tabla Tarea emite automáticamente una nueva lista.
    return db.tareaQueries.selectTodas()
      .asFlow()
      .mapToList(kotlinx.coroutines.Dispatchers.IO)
  }

  fun agregar(id: String, titulo: String) {
    db.tareaQueries.insertar(id, titulo, completada = 0)
  }

  fun completar(id: String) {
    db.tareaQueries.marcarCompletada(id)
  }
}
