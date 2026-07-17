// Networking con Retrofit (Módulo 5): interfaz declarativa sobre OkHttp.
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

data class TareaDto(val id: String, val titulo: String, val completada: Boolean)
data class CrearTareaRequest(val titulo: String)

// Retrofit genera la implementación de esta interfaz en tiempo de ejecución:
// cada método anotado se traduce a una petición HTTP real, con las suspend
// functions integrándose directamente con coroutines (sin callbacks manuales).
interface TareasApi {
  @GET("tareas")
  suspend fun listarTareas(): List<TareaDto>

  @GET("tareas/{id}")
  suspend fun obtenerTarea(@Path("id") id: String): TareaDto

  @POST("tareas")
  suspend fun crearTarea(@Body request: CrearTareaRequest): TareaDto
}

object RetrofitClient {
  private val retrofit = Retrofit.Builder()
    .baseUrl("https://api.ejemplo.com/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

  val tareasApi: TareasApi = retrofit.create(TareasApi::class.java)
}

// Uso desde un ViewModel (dentro de viewModelScope.launch, ver stateflow-viewmodel.kt):
//
// try {
//   val tareas = RetrofitClient.tareasApi.listarTareas()
// } catch (e: retrofit2.HttpException) {
//   // código de estado HTTP de error (4xx/5xx)
// } catch (e: java.io.IOException) {
//   // fallo de red (sin conexión, timeout)
// }
