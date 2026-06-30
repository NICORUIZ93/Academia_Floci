## Test de ViewModel con repositorio fake

```kotlin
class TareasViewModelTest {
    @Test
    fun cargaTareasCorrectamente() = runTest {
        val viewModel = TareasViewModel(TareaRepositoryFake(listOf(tareaDePrueba)))
        viewModel.cargar()
        assertEquals(EstadoUI.Exito(listOf(tareaDePrueba)), viewModel.estado.value)
    }
}
```

Un fake (implementación real simple, no una librería de mocking) es rápido y predecible — el test no depende de red real ni de un servidor de prueba.

## Compose UI Testing

```kotlin
@get:Rule val composeTestRule = createComposeRule()

@Test
fun muestraElTituloDeLaTarea() {
    composeTestRule.setContent { TarjetaTarea(titulo = "Comprar leche", completada = false) }
    composeTestRule.onNodeWithText("Comprar leche").assertIsDisplayed()
}
```

## Espresso para flujos end-to-end

```kotlin
@Test
fun creaUnaTareaYLaVeEnLaLista() {
    onView(withId(R.id.botonAgregar)).perform(click())
    onView(withId(R.id.campoTitulo)).perform(typeText("Nueva tarea"))
    onView(withId(R.id.botonGuardar)).perform(click())
    onView(withText("Nueva tarea")).check(matches(isDisplayed()))
}
```

Espresso simula interacciones reales de usuario contra la app instalada en un dispositivo/emulador — útil para validar el flujo completo, no solo unidades aisladas.
