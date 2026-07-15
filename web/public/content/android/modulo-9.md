# Módulo 9: Testing en Android

## Sílabo

**Objetivo general**

Probar lógica, ViewModels y UI con las herramientas estándar del ecosistema Android, distinguiendo cuándo un test de ViewModel con fakes es suficiente y cuándo se necesita un test de UI o un flujo end-to-end completo.

**Objetivos específicos**

1. Escribir un test de ViewModel con un repositorio fake, verificando el `StateFlow`.
2. Usar `runTest` para probar lógica suspend sin esperas reales.
3. Escribir un test de Compose UI con `ComposeTestRule`.
4. Escribir un test end-to-end con Espresso.
5. Documentar cuándo preferir un fake sobre un mock.

**Contenido**

- JUnit + Coroutines Test para ViewModels.
- Compose UI Testing.
- Espresso para flujos end-to-end.
- Fakes vs mocks en Android.

**Evaluación**

Suite de tests: ViewModel con coroutines test + al menos un test de Compose UI, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Testing de ViewModels con fakes y runTest

**Conceptos clave:** rapidez y determinismo frente a dependencias reales.

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

Probar un `ViewModel` con un repositorio fake (una implementación real y simple de la interfaz `TareaRepository`, que devuelve datos predefinidos en memoria en vez de consultar una API real o una base de datos Room real) es considerablemente más rápido y confiable que probarlo contra la API real: el test corre en milisegundos sin depender de la disponibilidad de un servidor externo, sin latencia de red variable, y sin el riesgo de que el test falle por una razón ajena a la lógica bajo prueba (el servidor está caído, la conexión de red del entorno de CI es inestable), un principio idéntico al de los fakes en `commonTest` de Kotlin Multiplatform (Módulo 9 de ese track).

`runTest` (la misma herramienta de tiempo virtual estudiada en el Módulo 9 de Kotlin Multiplatform) permite que funciones `suspend` con `delay()` interno se ejecuten instantáneamente en el test, sin esperar el tiempo real completo, manteniendo la suite de tests de ViewModels rápida incluso cuando la lógica bajo prueba simula esperas o reintentos con backoff.

**Analogía:** testear un ViewModel con un repositorio fake es como practicar un procedimiento médico en un maniquí de entrenamiento en vez de en un paciente real: se puede repetir tantas veces como sea necesario, de forma rápida y sin riesgos externos, verificando exactamente la técnica bajo práctica sin depender de factores fuera de control.

**¿Por qué es importante?** Probar un ViewModel con un repositorio fake es más rápido y confiable que con la API real, dado que elimina la dependencia de factores externos (disponibilidad del servidor, latencia de red) que podrían hacer fallar el test por razones ajenas a la lógica bajo prueba.

**Diagrama:**

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

### Tema 2: Compose UI Testing

**Conceptos clave:** verificar lo que efectivamente se renderiza, no solo el estado interno.

```kotlin
@get:Rule val composeTestRule = createComposeRule()

@Test
fun muestraElTituloDeLaTarea() {
    composeTestRule.setContent { TarjetaTarea(titulo = "Comprar leche", completada = false) }
    composeTestRule.onNodeWithText("Comprar leche").assertIsDisplayed()
}
```

Un test de ViewModel (Tema 1) verifica que la lógica de estado sea correcta (que `viewModel.estado.value` contenga los datos esperados), pero no verifica que ese estado efectivamente se traduzca en la UI renderizada correcta: un composable con un bug de renderizado (mostrando el campo equivocado, o con una condición de visibilidad invertida) podría pasar un test de ViewModel perfectamente válido mientras la pantalla real se ve incorrecta para el usuario. `ComposeTestRule` renderiza el composable bajo prueba en un entorno de test controlado y permite hacer aserciones sobre nodos específicos de la UI resultante (`onNodeWithText(...).assertIsDisplayed()`), cerrando esa brecha entre "el estado es correcto" y "la UI muestra correctamente ese estado".

Esta distinción entre lo que cubre un test de ViewModel y lo que cubre adicionalmente un test de Compose UI es análoga a la que existe en React entre testear un hook personalizado de forma aislada (Módulo 8 del track de React, con `renderHook`) y testear el componente completo con React Testing Library: ambos niveles son necesarios, verificando aspectos complementarios del mismo sistema.

**Analogía:** un test de ViewModel es como verificar que los ingredientes correctos entraron a la cocina; un test de Compose UI es como verificar que el plato que efectivamente llega a la mesa del cliente se ve como se esperaba — ambas verificaciones son necesarias, porque un error en el proceso de preparación (el "renderizado") podría arruinar un plato hecho con los ingredientes correctos.

**¿Por qué es importante?** Un test de Compose UI cubre la brecha entre "el estado interno es correcto" y "la UI efectivamente renderizada refleja ese estado correctamente para el usuario", algo que un test de ViewModel por sí solo no puede garantizar.

**Diagrama:**

```kotlin
@get:Rule val composeTestRule = createComposeRule()

@Test
fun muestraElTituloDeLaTarea() {
    composeTestRule.setContent { TarjetaTarea(titulo = "Comprar leche", completada = false) }
    composeTestRule.onNodeWithText("Comprar leche").assertIsDisplayed()
}
```

### Tema 3: Espresso y fakes vs mocks

**Conceptos clave:** validación de flujos completos de usuario, código Kotlin ordinario frente a proxies generados.

```kotlin
@Test
fun creaUnaTareaYLaVeEnLaLista() {
    onView(withId(R.id.botonAgregar)).perform(click())
    onView(withId(R.id.campoTitulo)).perform(typeText("Nueva tarea"))
    onView(withId(R.id.botonGuardar)).perform(click())
    onView(withText("Nueva tarea")).check(matches(isDisplayed()))
}
```

Espresso simula interacciones reales de usuario (clicks, escritura de texto) contra la app instalada en un dispositivo o emulador, ejecutando el flujo completo de principio a fin exactamente como lo experimentaría un usuario real; esto lo hace apropiado para validar recorridos completos que involucran múltiples pantallas y componentes trabajando juntos (crear una tarea y verificar que aparece correctamente en la lista), un nivel de cobertura que ni un test de ViewModel aislado ni un test de Compose UI de un único composable pueden ofrecer por sí solos, dado que ambos prueban unidades individuales, no el sistema integrado completo.

Preferir un fake (una implementación real y simple, código Kotlin ordinario) sobre un mock (un objeto simulado generado dinámicamente por una librería como Mockito) es apropiado cuando se quiere una implementación reutilizable entre múltiples tests con comportamiento consistente y fácil de razonar, o cuando se necesita compatibilidad multiplataforma (Kotlin Multiplatform, Módulo 9 de ese track); un mock puede ser más conveniente para verificar interacciones puntuales muy específicas (¿se llamó este método exactamente una vez con estos argumentos?) sin necesidad de mantener una implementación fake completa para un caso de uso muy acotado.

**Analogía:** Espresso es como un inspector de calidad que recorre el proceso completo de fabricación de principio a fin, verificando el producto final tal como llega al cliente, en vez de inspeccionar únicamente una pieza aislada en un banco de pruebas; un fake es como un modelo de práctica funcional reutilizable en múltiples ejercicios de entrenamiento, mientras que un mock es como una simulación puntual configurada para verificar un único gesto específico en un ejercicio particular.

**¿Por qué es importante?** Espresso cubre flujos completos end-to-end que ningún test unitario aislado puede cubrir por sí solo; elegir entre fake y mock depende de si se necesita una implementación reutilizable y consistente (fake) o una verificación puntual de interacciones específicas (mock).

**Diagrama:**

```
Test de ViewModel      → verifica la lógica de estado aislada
Test de Compose UI     → verifica el renderizado de un composable aislado
Test de Espresso (E2E) → verifica el flujo completo de usuario a través de múltiples pantallas
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de tests: ViewModel con coroutines test + al menos un test de Compose UI.

**Requisitos previos:** Módulo 8 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Test de ViewModel con repositorio fake | Ver Tema 1 | Verifica el `StateFlow` tras una acción |
| 2 | Usar `runTest` para lógica suspend | Ver Tema 1 | Sin esperas reales |
| 3 | Test de Compose UI con `ComposeTestRule` | Ver Tema 2 | Verifica texto en pantalla tras un click |
| 4 | Test end-to-end con Espresso | Ver Tema 3 | Flujo completo de la app |
| 5 | Documentar cuándo preferir fake sobre mock | Ver Tema 3 | Para un repositorio en tus tests |

**Verificación:** el laboratorio se considera exitoso si la suite incluye al menos un test de ViewModel (con `runTest` y fake), un test de Compose UI, y un test end-to-end con Espresso, todos pasando consistentemente.

**Errores comunes y soluciones**

- **Depender de la API real en un test de ViewModel.** Hace el test lento y frágil ante fallas externas; usa un fake.
- **Confiar únicamente en tests de ViewModel sin ningún test de UI.** No cubre la brecha entre estado correcto y renderizado correcto.
- **Usar Espresso para verificar lógica unitaria aislada.** Es más lento y menos apropiado que un test de ViewModel para ese propósito; reserva Espresso para flujos completos.

---

## Ejercicios de evaluación

### Ejercicio 1: Rapidez y confiabilidad de un repositorio fake

**Enunciado:** ¿por qué probar un ViewModel con un repositorio fake es más rápido y confiable que con la API real?

**Solución esperada:** el test corre en milisegundos sin depender de la disponibilidad de un servidor externo ni de latencia de red variable, eliminando el riesgo de que el test falle por razones ajenas a la lógica bajo prueba.

**Criterios de éxito:**
- Explica correctamente la eliminación de dependencias externas como razón de rapidez/confiabilidad.

### Ejercicio 2: Qué cubre un test de Compose UI adicionalmente

**Enunciado:** ¿qué cubre un test de Compose UI que un test de ViewModel solo no cubre?

**Solución esperada:** verifica que el estado correcto efectivamente se traduzca en la UI renderizada correcta, cerrando la brecha entre "el estado interno es correcto" y "la UI que ve el usuario refleja ese estado correctamente".

**Criterios de éxito:**
- Explica correctamente la verificación del renderizado real como lo adicional que cubre.

### Ejercicio 3: Cuándo preferir un fake sobre un mock

**Enunciado:** ¿cuándo preferirías un fake sobre un mock para un repositorio en tus tests?

**Solución esperada:** cuando se quiere una implementación reutilizable entre múltiples tests con comportamiento consistente y fácil de razonar, o cuando se necesita compatibilidad multiplataforma; un mock puede ser más conveniente para verificar interacciones puntuales muy específicas sin mantener una implementación fake completa.

**Criterios de éxito:**
- Explica correctamente la reutilización/consistencia como razón para preferir un fake.

---

## Resumen del módulo

**Puntos clave**

- Un repositorio fake hace que los tests de ViewModel sean rápidos y confiables, sin dependencias externas.
- `runTest` permite testear lógica suspend con esperas simuladas de forma instantánea.
- Un test de Compose UI cubre la brecha entre estado correcto y renderizado correcto para el usuario.
- Espresso valida flujos completos end-to-end que ningún test unitario aislado cubre por sí solo.

**Conceptos aprendidos**

- JUnit + Coroutines Test para ViewModels.
- Compose UI Testing.
- Espresso para flujos end-to-end.
- Fakes vs mocks en Android.

**Próximos pasos**

En el Módulo 10 aprenderás performance, Material 3 y accesibilidad: cómo detectar y corregir recomposiciones innecesarias, y por qué la accesibilidad es parte del estándar profesional.

**Recursos adicionales**

- Documentación oficial de testing en Compose (developer.android.com/jetpack/compose/testing).
