## kotlin.test en commonTest

```kotlin
class ObtenerTareasPendientesUseCaseTest {
    @Test
    fun filtraSoloPendientes() = runTest {
        val repoFake = TareaRepositoryFake(listOf(
            Tarea("1", "A", completada = false),
            Tarea("2", "B", completada = true),
        ))
        val resultado = ObtenerTareasPendientesUseCase(repoFake)()
        assertEquals(1, resultado.size)
    }
}
```

Este test, escrito una sola vez en `commonTest`, corre contra el target Android Y contra el target iOS — confirmando que la lógica se comporta igual en ambas plataformas sin duplicar el esfuerzo de prueba.

## Fakes en vez de mocks

```kotlin
class TareaRepositoryFake(private val datos: List<Tarea>) : TareaRepository {
    override suspend fun obtenerTodas() = datos
}
```

Un fake es una implementación real y simple (no una librería de mocking) — funciona en `commonTest` sin depender de frameworks de mocking que puedan no estar disponibles para todos los targets de Kotlin/Native.

## runTest para coroutines

```kotlin
@Test
fun pruebaConDelay() = runTest {
    val resultado = funcionConDelay() // el delay() interno se "salta" en tiempo virtual, el test corre instantáneo
    assertEquals(esperado, resultado)
}
```
