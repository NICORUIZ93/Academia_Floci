// Persistencia local con Room (Módulo 6): Entity + DAO + Database.
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "tareas")
data class TareaEntity(
  @PrimaryKey val id: String,
  val titulo: String,
  val completada: Boolean
)

@Dao
interface TareaDao {
  // Room genera la implementación de estos métodos a partir del SQL anotado,
  // verificando la consulta contra el esquema en tiempo de compilación (kapt/ksp).
  @Query("SELECT * FROM tareas ORDER BY titulo")
  fun observarTodas(): Flow<List<TareaEntity>> // Flow: se re-emite automáticamente en cada cambio

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertar(tarea: TareaEntity)

  @Query("UPDATE tareas SET completada = 1 WHERE id = :id")
  suspend fun marcarCompletada(id: String)

  @Delete
  suspend fun eliminar(tarea: TareaEntity)
}

@Database(entities = [TareaEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
  abstract fun tareaDao(): TareaDao
}

// Construcción típica (una sola instancia, normalmente vía inyección de dependencias — ver Hilt):
//
// val db = Room.databaseBuilder(context, AppDatabase::class.java, "app-db").build()
