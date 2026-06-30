## Ktor Client multiplataforma

```kotlin
val client = HttpClient {
    install(ContentNegotiation) { json() }
}

@Serializable
data class TareaDTO(val id: String, val titulo: String)

suspend fun obtenerTareas(): List<TareaDTO> =
    client.get("https://api.miapp.com/tareas").body()
```

El mismo `HttpClient` funciona en Android (sobre OkHttp por debajo) y en iOS (sobre Darwin/NSURLSession) — Ktor abstrae el motor HTTP nativo de cada plataforma.

## Manejo de errores de red

```kotlin
sealed class Resultado<out T> {
    data class Exito<T>(val datos: T) : Resultado<T>()
    data class Error(val mensaje: String) : Resultado<Nothing>()
}

suspend fun obtenerTareasSeguro(): Resultado<List<TareaDTO>> = try {
    Resultado.Exito(obtenerTareas())
} catch (e: Exception) {
    Resultado.Error(e.message ?: "Error de red")
}
```

## Interceptores y autenticación

```kotlin
val client = HttpClient {
    install(Auth) {
        bearer { loadTokens { BearerTokens(tokenActual, refreshToken) } }
    }
}
```
