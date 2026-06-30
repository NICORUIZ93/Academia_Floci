## Retrofit con coroutines

```kotlin
interface ApiService {
    @GET("tareas")
    suspend fun obtenerTareas(): List<TareaDTO>
}

val retrofit = Retrofit.Builder()
    .baseUrl("https://api.miapp.com/")
    .addConverterFactory(MoshiConverterFactory.create())
    .build()
```

```kotlin
viewModelScope.launch {
    try {
        val tareas = apiService.obtenerTareas()
        _estado.value = EstadoUI.Exito(tareas)
    } catch (e: HttpException) {
        _estado.value = EstadoUI.Error("Error ${e.code()}")
    } catch (e: IOException) {
        _estado.value = EstadoUI.Error("Sin conexión")
    }
}
```

## Interceptores de OkHttp

```kotlin
val client = OkHttpClient.Builder()
    .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY })
    .addInterceptor { chain ->
        chain.proceed(chain.request().newBuilder().addHeader("Authorization", "Bearer $token").build())
    }
    .build()
```

Separar errores de red (`IOException`, sin conexión) de errores HTTP (`HttpException`, el servidor respondió pero con error) permite mostrar mensajes específicos y útiles al usuario en vez de un genérico "algo salió mal".
