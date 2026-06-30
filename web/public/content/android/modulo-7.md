## Configuración básica

```kotlin
@HiltAndroidApp
class MiApp : Application()

@HiltViewModel
class TareasViewModel @Inject constructor(private val repo: TareaRepository) : ViewModel()
```

## @Provides para dependencias externas

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit = Retrofit.Builder().baseUrl(URL).build()
}
```

No puedes anotar una clase de una librería externa (`Retrofit`) con `@Inject` — `@Provides` le dice a Hilt cómo construirla.

## @Binds para interfaces

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindTareaRepository(impl: TareaRepositoryImpl): TareaRepository
}
```

## Scopes

`@Singleton` (vive mientras la app vive), `@ViewModelScoped` (vive mientras el ViewModel vive) — elegir el scope correcto evita recrear objetos costosos innecesariamente o, al contrario, retener objetos más tiempo del necesario.

## Testing con Hilt

```kotlin
@HiltAndroidTest
@UninstallModules(NetworkModule::class) // reemplaza el módulo real por uno de test
class TareasFlowTest { /* ... */ }
```
