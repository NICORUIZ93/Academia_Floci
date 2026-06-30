## Modelos de dominio compartidos

```kotlin
// commonMain
data class Tarea(val id: String, val titulo: String, val completada: Boolean)
```

## Casos de uso independientes de plataforma

```kotlin
class ObtenerTareasPendientesUseCase(private val repositorio: TareaRepository) {
    suspend operator fun invoke(): List<Tarea> =
        repositorio.obtenerTodas().filter { !it.completada }
}
```

El caso de uso depende de la INTERFAZ `TareaRepository`, no de su implementación concreta — puede testearse con un fake, sin tocar red ni base de datos real.

## Repositorio con interfaz común

```kotlin
interface TareaRepository {
    suspend fun obtenerTodas(): List<Tarea>
    suspend fun guardar(tarea: Tarea)
}

class TareaRepositoryImpl(private val api: ApiClient, private val db: TareaDao) : TareaRepository {
    override suspend fun obtenerTodas(): List<Tarea> = db.obtenerTodas() // o sincroniza con api
}
```

## Inyección de dependencias con Koin

```kotlin
val sharedModule = module {
    single<TareaRepository> { TareaRepositoryImpl(get(), get()) }
    factory { ObtenerTareasPendientesUseCase(get()) }
}
```

Koin funciona igual en `commonMain`, resolviendo dependencias sin necesidad de un framework de DI distinto por plataforma.
