## Arquitectura del proyecto integrador

```
shared/src/
  commonMain/kotlin/
    dominio/        ← modelos + casos de uso (módulo 4)
    data/           ← TareaRepositoryImpl (Ktor + SQLDelight, módulos 5-6)
  commonTest/        ← tests con fakes (módulo 9)
androidApp/           ← UI Compose o Jetpack Compose nativo
iosApp/                ← UI SwiftUI consumiendo Shared.framework (módulo 8)
```

## Uniendo los módulos del track

Este proyecto integra: lógica de negocio compartida con casos de uso testeables (módulo 4), sincronización de datos remotos vía Ktor con caché local en SQLDelight (módulos 5-6), UI nativa o Compose Multiplatform consumiendo esa capa compartida (módulo 7), interoperabilidad con una app SwiftUI real (módulo 8), y un pipeline de CI que valida ambos targets en cada push (módulo 10).

```kotlin
class TareaRepositoryImpl(
    private val api: HttpClient,
    private val db: Database,
) : TareaRepository {
    override suspend fun obtenerTodas(): List<Tarea> = try {
        val remotas = api.get("/tareas").body<List<TareaDTO>>()
        db.tareaQueries.transaction { remotas.forEach { guardarLocal(it) } }
        db.tareaQueries.selectTodas().executeAsList()
    } catch (e: Exception) {
        db.tareaQueries.selectTodas().executeAsList() // fallback offline a la caché local
    }
}
```

## Cierre del track

KMP no reemplaza el desarrollo nativo completo: la promesa realista es compartir la lógica de negocio, networking y persistencia (donde la duplicación entre Android e iOS es pura redundancia) mientras la UI puede seguir siendo nativa donde más importa la experiencia específica de cada plataforma.
