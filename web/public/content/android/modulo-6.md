# Módulo 6: Persistencia local con Room


## Aprende construyendo

### Tema 1: Entities, DAOs y Database

**Conceptos clave:** SQL tipado y verificado en tiempo de compilación.

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

Room es una capa de abstracción sobre SQLite (el motor de base de datos embebido de Android) que verifica las queries SQL escritas en anotaciones (`@Query("SELECT * FROM Tarea")`) en tiempo de compilación, detectando errores de sintaxis SQL o referencias a columnas inexistentes antes de que la app siquiera se ejecute, en vez de descubrirlos en tiempo de ejecución como ocurriría usando SQLite directamente sin ninguna capa de verificación; una `@Entity` mapea directamente a una tabla, y un `@Dao` (Data Access Object) declara las operaciones permitidas sobre esa tabla como métodos de interfaz, con Room generando la implementación real en tiempo de compilación.

Este mismo patrón de "esquema tipado con generación de código en tiempo de compilación" es análogo a SQLDelight en Kotlin Multiplatform (Módulo 7 de ese track), que persigue exactamente el mismo objetivo (SQL verificado en compilación, sin errores de tipo en tiempo de ejecución) pero de forma multiplataforma, mientras que Room está diseñado específicamente para Android.

**Analogía:** Room es como un traductor certificado que revisa cada instrucción escrita en un idioma (SQL) antes de enviarla a su destinatario final (SQLite), rechazando de antemano cualquier instrucción mal formada o con referencias inexistentes, en vez de dejar que el destinatario descubra el error al intentar ejecutarla.

**¿Por qué es importante?** Room verifica las queries SQL en tiempo de compilación, detectando errores antes de ejecutar la app, y comparte el mismo principio de SQL tipado que SQLDelight en Kotlin Multiplatform, aunque específico para Android.

**Casos de uso reales:**
- Caché local de tareas descargadas de la API, consultable instantáneamente sin esperar a la red.
- Historial de búsquedas recientes guardado en una tabla `Busqueda` local.
- Borrador de un formulario largo persistido en Room para no perderlo si la app se cierra a medias.

**Código del ejemplo:**

```kotlin
@Entity
data class Tarea(@PrimaryKey val id: String, val titulo: String, val completada: Boolean)

@Dao
interface TareaDao {
    @Query("SELECT * FROM Tarea")
    fun observarTodas(): Flow<List<Tarea>>
}
```

### Tema 2: Room + Flow reactivo, y migraciones

**Conceptos clave:** la UI se actualiza automáticamente cuando cambian los datos subyacentes.

Un DAO que devuelve `Flow<List<Tarea>>` en vez de una simple `List<Tarea>` establece una suscripción reactiva sobre la tabla subyacente: Room emite automáticamente una nueva lista completa a través de ese `Flow` cada vez que los datos de la tabla `Tarea` cambian (por una inserción, actualización o eliminación), sin que el desarrollador tenga que volver a consultar manualmente la base de datos ni implementar ningún mecanismo de notificación de cambios por su cuenta; esto encaja directamente con `StateFlow` en el `ViewModel` (Módulo 4), simplemente exponiendo ese `Flow` de Room transformado en un `StateFlow` observado por Compose, cerrando el flujo reactivo completo desde la base de datos hasta la pantalla.

```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0")
    }
}
```

A medida que el esquema de la app evoluciona (agregar una columna nueva a una tabla existente), una migración declara explícitamente cómo transformar los datos existentes de la versión anterior del esquema hacia la nueva, sin perder los datos ya almacenados en el dispositivo del usuario; omitir una migración necesaria (o proveer una incorrecta) provoca que Room lance una excepción en tiempo de ejecución al detectar una discrepancia entre la versión de esquema declarada en el código y la que efectivamente existe en el archivo de base de datos del dispositivo.

**Analogía:** un `Flow` de Room es como una suscripción a las actualizaciones de un tablero público que notifica automáticamente a todos los suscriptores cada vez que cambia algo en él, en vez de que cada interesado tenga que ir a revisar manualmente el tablero de forma periódica; una migración es como una remodelación cuidadosa de un edificio habitado que preserva todo el contenido existente mientras agrega una habitación nueva, en vez de demoler y reconstruir desde cero perdiendo todo lo que había dentro.

**¿Por qué es importante?** Un DAO que devuelve `Flow` mantiene la UI sincronizada automáticamente con los cambios en la base de datos, sin consultas manuales repetidas; las migraciones permiten evolucionar el esquema sin perder los datos ya almacenados en el dispositivo del usuario.

**Casos de uso reales:**
- Una lista de tareas que se actualiza visualmente en el instante en que se inserta una nueva, sin refrescar manualmente.
- Agregar una columna `prioridad` a la tabla `Tarea` en una nueva versión de la app sin borrar tareas existentes del usuario.
- Sincronizar cambios entre dos pantallas distintas que observan la misma tabla, sin comunicarlas explícitamente entre sí.

**Diagrama:**

```
Room table cambia (insert/update/delete) → Flow emite nueva lista → StateFlow del ViewModel se actualiza → UI recompone
```

### Tema 3: Estrategia offline-first

**Conceptos clave:** la UI lee siempre de la fuente local, la red sincroniza en segundo plano.

```kotlin
class TareaRepository(private val dao: TareaDao, private val api: ApiService) {
    val tareas: Flow<List<Tarea>> = dao.observarTodas() // la UI SIEMPRE lee de aquí

    suspend fun sincronizar() {
        val remotas = api.obtenerTareas()
        remotas.forEach { dao.insertar(it.toEntity()) } // sincroniza en background
    }
}
```

Una estrategia offline-first invierte el orden de prioridad habitual entre red y caché local: en vez de que la UI espere directamente a una respuesta de red y solo recurra al caché como respaldo ante un fallo, la UI **siempre** lee del caché local (Room, vía `Flow` reactivo, Tema 2), mientras un proceso de sincronización separado actualiza ese caché en segundo plano con datos frescos de la API; esto significa que la app permanece completamente funcional (mostrando al menos los últimos datos sincronizados) incluso sin conexión a internet, en vez de mostrar una pantalla de error o un estado de carga indefinido como ocurriría con una app que depende directamente de la red en cada renderizado.

Esta estrategia mejora la experiencia de usuario incluso en condiciones de buena conexión: la UI puede mostrar datos instantáneamente desde el caché local (sin esperar ninguna latencia de red) mientras la sincronización ocurre de forma transparente en segundo plano, resultando en una percepción de velocidad considerablemente mayor que esperar activamente una respuesta de red antes de mostrar cualquier contenido.

**Analogía:** offline-first es como un noticiero que siempre muestra las últimas noticias impresas disponibles en el momento (el caché local), mientras un equipo de reporteros trabaja en segundo plano recabando noticias más recientes para la próxima actualización, en vez de dejar la pantalla completamente en blanco cada vez que se espera la llegada de una noticia nueva desde el terreno.

**¿Por qué es importante?** Offline-first mejora la experiencia incluso con buena conexión (datos instantáneos desde el caché local mientras la sincronización ocurre en background) y mantiene la app funcional incluso sin conexión a internet, en vez de depender directamente y de forma bloqueante de la red en cada renderizado.

**Casos de uso reales:**
- Una app de notas que sigue siendo completamente usable en un vuelo sin wifi, mostrando lo último sincronizado.
- Un feed de noticias que carga instantáneamente desde caché al abrir la app, mientras sincroniza en segundo plano.
- Una app de campo (inventario, inspecciones) usada en zonas con cobertura intermitente, que nunca bloquea al usuario.

**Diagrama:**

```
UI ← siempre lee de → Room (Flow reactivo)
                          ↑
                   Repositorio sincroniza en background
                          ↓
                        API remota
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con caché local en Room que funciona sin conexión a internet.

**Requisitos previos:** Módulo 5 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Definir `@Entity Tarea` y `@Dao` con `Flow<List<Tarea>>` | Ver Tema 1 | CRUD tipado y verificado en compilación |
| 2 | Observar el `Flow` desde el `ViewModel` | Ver Tema 2 | Confirma actualización automática de la UI |
| 3 | Agregar una migración de esquema | Ver Tema 2 | Añade columna sin perder datos existentes |
| 4 | Implementar offline-first: UI lee de Room, repositorio sincroniza | Ver Tema 3 | Sincronización en background |

**Verificación:** el laboratorio se considera exitoso si la app muestra datos correctamente incluso con el dispositivo en modo avión (usando el último caché sincronizado), y si la migración de esquema preserva los datos existentes al agregar la nueva columna.

**Errores comunes y soluciones**

- **Hacer que la UI dependa directamente de la respuesta de la API en vez de Room.** Rompe offline-first; la UI debe leer siempre del caché local.
- **Omitir la migración al cambiar el esquema.** Provoca una excepción en tiempo de ejecución por discrepancia de versión de esquema.
- **Devolver `List<Tarea>` en vez de `Flow<List<Tarea>>` desde el DAO.** Pierde la actualización automática reactiva de la UI ante cambios en los datos.

---
