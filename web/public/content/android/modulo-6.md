## Entity, DAO y Database

```kotlin
@Entity
data class Tarea(@PrimaryKey val id: String, val titulo: String, val completada: Boolean)

@Dao
interface TareaDao {
    @Query("SELECT * FROM Tarea")
    fun observarTodas(): Flow<List<Tarea>> // reactivo: emite de nuevo cuando la tabla cambia

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertar(tarea: Tarea)
}

@Database(entities = [Tarea::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun tareaDao(): TareaDao
}
```

## Migraciones

```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0")
    }
}
```

## Offline-first

```kotlin
class TareaRepository(private val dao: TareaDao, private val api: ApiService) {
    val tareas: Flow<List<Tarea>> = dao.observarTodas() // la UI SIEMPRE lee de aquí

    suspend fun sincronizar() {
        val remotas = api.obtenerTareas()
        remotas.forEach { dao.insertar(it.toEntity()) } // sincroniza en background
    }
}
```

La UI nunca espera directamente a la red — lee del caché local (reactivo vía Flow) mientras la sincronización ocurre por separado.
