// Networking compartido con Ktor Client (Módulo 5): un cliente HTTP, tres plataformas.
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable

@Serializable
data class Tarea(val id: String, val titulo: String, val completada: Boolean)

// Este cliente vive en commonMain: el mismo código hace peticiones HTTP reales
// en Android (motor OkHttp), iOS (motor Darwin/NSURLSession) y Desktop/JVM (motor CIO),
// sin que el código de negocio sepa ni le importe cuál está usando cada plataforma.
class TareasApi(private val baseUrl: String) {
  private val client = HttpClient {
    install(ContentNegotiation) {
      json() // serializa/deserializa JSON automáticamente hacia las data class @Serializable
    }
  }

  suspend fun listarTareas(): List<Tarea> {
    return client.get("$baseUrl/tareas").body()
  }

  suspend fun crearTarea(titulo: String): Tarea {
    return client.post("$baseUrl/tareas") {
      contentType(io.ktor.http.ContentType.Application.Json)
      setBody(mapOf("titulo" to titulo))
    }.body()
  }

  fun cerrar() {
    client.close()
  }
}
