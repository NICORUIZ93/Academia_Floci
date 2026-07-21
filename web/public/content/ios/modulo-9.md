# Módulo 9: Testing en iOS


## Aprende construyendo

### Tema 1: XCTest clásico y Swift Testing

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar una app Swift desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, reglas de entrega deben probarse rápido y una pantalla debe validarse como la usaría una persona, sin red real.

#### Paso 3 · Teoría, modelo mental y analogía
XCTest y Swift Testing organizan aserciones; async tests esperan tareas; XCUITest interactúa con accesibilidad en UI. La analogía es una inspección: prueba pieza, flujo y recorrido real con costes distintos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m9
cd ejemplo-ios-m9
swift package init --type executable
swift test
```
Crea Tests/DeliveryTests.swift con un test de regla y en Xcode añade un UI test que busque un botón por accessibility identifier.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una expectativa para provocar un fallo deliberado; lee la aserción y corrígela. Resultado esperado: tests verdes con mensajes claros.

#### Paso 6 · Práctica independiente
Añade test async con timeout, mock de repositorio, caso offline y recorrido XCUITest de formulario.

#### Paso 7 · Cierre y evidencia
Guarda salida, capturas y logs; como siguiente paso estudia CI. Errores comunes: sleeps fijos, selectores visuales, datos compartidos y tests que dependen de red. Fuentes oficiales: https://developer.apple.com/documentation/xctest y https://developer.apple.com/documentation/testing.
**¿Por qué es importante?** Porque la confianza en una app móvil depende de evidencias repetibles en dispositivos y simuladores.
**Evidencia de aprendizaje:** entrega tests, fallo, corrección y recorrido UI.
**Conceptos clave:** sintaxis más concisa y expresiva, misma capacidad fundamental de verificación.

```swift
import XCTest

final class CalculadoraTests: XCTestCase {
    func testSuma() {
        XCTAssertEqual(Calculadora().sumar(2, 3), 5)
    }
}
```

```swift
import Testing

struct CalculadoraTests {
    @Test func suma() {
        #expect(Calculadora().sumar(2, 3) == 5)
    }
}
```

XCTest, el framework de pruebas clásico de Apple, requiere heredar de `XCTestCase` y usar variantes específicas de aserción (`XCTAssertEqual`, `XCTAssertTrue`, `XCTAssertNil`, cada una para un tipo distinto de comparación); Swift Testing, el framework moderno introducido más recientemente, reemplaza esa API con una sintaxis considerablemente más concisa: cualquier `struct` puede contener tests marcados con `@Test`, y una única macro `#expect` (que acepta cualquier expresión booleana) reemplaza todas las variantes específicas de `XCTAssert`, además de ofrecer mejor soporte nativo para tests parametrizados (ejecutar el mismo test con múltiples conjuntos de datos de entrada) y paralelización de ejecución por defecto, reduciendo el tiempo total de la suite de tests en proyectos grandes.

Esta evolución de framework de testing (de una API más verbosa basada en herencia de clase, hacia una sintaxis más ligera basada en macros) refleja una tendencia similar observada en otros lenguajes hacia frameworks de testing más expresivos y con menos boilerplate, aunque el objetivo fundamental (verificar que el código se comporta según lo esperado) permanece idéntico entre ambos frameworks.

**Analogía:** XCTest es como un formulario de evaluación estandarizado con casillas específicas para cada tipo de verificación (una casilla para "es igual a", otra para "es verdadero", otra para "es nulo"); Swift Testing es como una única pregunta abierta de verificación ("¿esto es cierto?") que se adapta a cualquier tipo de comparación sin necesitar una casilla distinta para cada caso.

**¿Por qué es importante?** Swift Testing ofrece una sintaxis considerablemente más concisa que XCTest clásico, además de mejor soporte para tests parametrizados y paralelización por defecto, aunque ambos frameworks cumplen la misma función fundamental de verificación de comportamiento.

**Código del ejemplo:**

```swift
// XCTest
XCTAssertEqual(Calculadora().sumar(2, 3), 5)

// Swift Testing
#expect(Calculadora().sumar(2, 3) == 5)
```

### Tema 2: Testing de código async

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar una app Swift desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, reglas de entrega deben probarse rápido y una pantalla debe validarse como la usaría una persona, sin red real.

#### Paso 3 · Teoría, modelo mental y analogía
XCTest y Swift Testing organizan aserciones; async tests esperan tareas; XCUITest interactúa con accesibilidad en UI. La analogía es una inspección: prueba pieza, flujo y recorrido real con costes distintos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m9
cd ejemplo-ios-m9
swift package init --type executable
swift test
```
Crea Tests/DeliveryTests.swift con un test de regla y en Xcode añade un UI test que busque un botón por accessibility identifier.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una expectativa para provocar un fallo deliberado; lee la aserción y corrígela. Resultado esperado: tests verdes con mensajes claros.

#### Paso 6 · Práctica independiente
Añade test async con timeout, mock de repositorio, caso offline y recorrido XCUITest de formulario.

#### Paso 7 · Cierre y evidencia
Guarda salida, capturas y logs; como siguiente paso estudia CI. Errores comunes: sleeps fijos, selectores visuales, datos compartidos y tests que dependen de red. Fuentes oficiales: https://developer.apple.com/documentation/xctest y https://developer.apple.com/documentation/testing.
**¿Por qué es importante?** Porque la confianza en una app móvil depende de evidencias repetibles en dispositivos y simuladores.
**Evidencia de aprendizaje:** entrega tests, fallo, corrección y recorrido UI.
**Conceptos clave:** el test mismo puede ser una función suspendible, sin expectativas manuales.

```swift
@Test func obtieneUsuario() async throws {
    let usuario = try await servicio.obtenerUsuario(id: "1")
    #expect(usuario.nombre == "Ana")
}
```

Testear una función `async` (Módulo 4) con Swift Testing simplemente requiere marcar la función de test misma como `async`, permitiendo usar `await` directamente dentro del cuerpo del test exactamente como en cualquier otro contexto asíncrono; esto contrasta con el modelo previo de testing de código asíncrono basado en callbacks, que requería crear manualmente una `XCTestExpectation`, cumplirla explícitamente dentro del callback de la operación asíncrona bajo prueba, y esperar esa expectativa con un timeout configurado manualmente, un mecanismo considerablemente más verboso y propenso a errores (olvidar cumplir la expectativa deja el test colgado hasta que expire el timeout) que simplemente escribir `await` de forma lineal.

Esta simplificación de testing async es directamente análoga a `runTest` en Kotlin (Módulo 9 del track de Kotlin Multiplatform) y a testear hooks async en React con `renderHook` (Módulo 8 del track de React): todos los ecosistemas modernos de testing han convergido hacia permitir que el propio test sea una función asíncrona nativa, en vez de requerir mecanismos indirectos de espera basados en callbacks o expectativas manuales.

**Analogía:** testear código async con `await` directo en el test es como poder simplemente esperar el resultado de un trámite y continuar cuando llega, en vez de tener que configurar de antemano una alarma de tiempo límite y un mecanismo de notificación manual para saber cuándo el trámite efectivamente concluyó.

**¿Por qué es importante?** Marcar el test mismo como `async` permite usar `await` directamente, sin necesidad de expectativas manuales (`XCTestExpectation`) como en el modelo basado en callbacks previo, simplificando considerablemente el testing de código asíncrono.

**Código del ejemplo:**

```swift
@Test func obtieneUsuario() async throws {
    let usuario = try await servicio.obtenerUsuario(id: "1")
    #expect(usuario.nombre == "Ana")
}
```

### Tema 3: UI Tests con XCUITest

#### Paso 1 · Objetivo y preparación
Al finalizar podrás probar una app Swift desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, reglas de entrega deben probarse rápido y una pantalla debe validarse como la usaría una persona, sin red real.

#### Paso 3 · Teoría, modelo mental y analogía
XCTest y Swift Testing organizan aserciones; async tests esperan tareas; XCUITest interactúa con accesibilidad en UI. La analogía es una inspección: prueba pieza, flujo y recorrido real con costes distintos.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m9
cd ejemplo-ios-m9
swift package init --type executable
swift test
```
Crea Tests/DeliveryTests.swift con un test de regla y en Xcode añade un UI test que busque un botón por accessibility identifier.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente una expectativa para provocar un fallo deliberado; lee la aserción y corrígela. Resultado esperado: tests verdes con mensajes claros.

#### Paso 6 · Práctica independiente
Añade test async con timeout, mock de repositorio, caso offline y recorrido XCUITest de formulario.

#### Paso 7 · Cierre y evidencia
Guarda salida, capturas y logs; como siguiente paso estudia CI. Errores comunes: sleeps fijos, selectores visuales, datos compartidos y tests que dependen de red. Fuentes oficiales: https://developer.apple.com/documentation/xctest y https://developer.apple.com/documentation/testing.
**¿Por qué es importante?** Porque la confianza en una app móvil depende de evidencias repetibles en dispositivos y simuladores.
**Evidencia de aprendizaje:** entrega tests, fallo, corrección y recorrido UI.
**Conceptos clave:** simulación de interacciones reales, más lento pero valida el flujo completo end-to-end.

```swift
func testCrearTarea() {
    let app = XCUIApplication()
    app.launch()
    app.buttons["Agregar"].tap()
    app.textFields["titulo"].typeText("Nueva tarea")
    app.buttons["Guardar"].tap()
    XCTAssertTrue(app.staticTexts["Nueva tarea"].exists)
}
```

XCUITest lanza la app real (compilada e instalada, no solo componentes aislados en memoria) y simula interacciones reales de usuario (`tap`, `typeText`) contra la UI efectivamente renderizada, permitiendo validar un flujo completo end-to-end (crear una tarea y verificar que aparece correctamente en la lista) exactamente como lo experimentaría un usuario real; esto lo hace considerablemente más lento y frágil que un unit test de la capa de dominio (que ejecuta lógica pura en memoria sin necesidad de lanzar toda la app ni renderizar ninguna UI real), y más propenso a fallar por razones ajenas a la lógica bajo prueba, como cambios de layout, timing de animaciones, o inestabilidad del simulador.

Esta distinción de velocidad y fragilidad entre unit tests y UI tests refleja la misma "pirámide de tests" estudiada en el track de Spring Boot (Módulo 6 de ese track) y con Espresso en Android (Módulo 9 de ese track): se recomienda tener muchos unit tests rápidos cubriendo la lógica de negocio, y reservar los UI tests end-to-end, más costosos de ejecutar y mantener, para validar únicamente los flujos críticos de la app.

**Analogía:** un UI Test es como una inspección completa de calidad que recorre todo el proceso de fabricación de un producto de principio a fin, tal como lo experimentaría el cliente final; un unit test de la capa de dominio es como verificar un componente aislado en un banco de pruebas de laboratorio — ambos son necesarios, pero el primero es considerablemente más costoso de ejecutar repetidamente.

**¿Por qué es importante?** Un UI Test valida el flujo completo end-to-end tal como lo experimenta el usuario real, pero es más lento y frágil que un unit test de la capa de dominio, que ejecuta lógica pura sin necesidad de lanzar toda la app ni renderizar UI real.

**Diagrama:**

```
Unit tests de dominio (Swift Testing) → rápidos, muchos, base de la pirámide
UI Tests (XCUITest)                   → lentos, pocos, solo flujos críticos end-to-end
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de tests sobre la capa de dominio usando Swift Testing.

**Requisitos previos:** Módulo 8 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir un test con XCTest para una función pura | Ver Tema 1 | Capa de dominio |
| 2 | Reescribirlo con Swift Testing | Ver Tema 1 | `@Test`, `#expect` |
| 3 | Testear una función `async` con `await` en el test | Ver Tema 2 | Sin `XCTestExpectation` |
| 4 | Escribir un UI Test con XCUITest | Ver Tema 3 | Verifica que un botón existe y es tappable |

**Verificación:** el laboratorio se considera exitoso si la suite de Swift Testing pasa correctamente incluyendo al menos un test async, y si el UI Test valida el flujo completo de creación de una tarea de principio a fin.

**Errores comunes y soluciones**

- **Usar `XCTestExpectation` manual para testear código async en vez de marcar el test como `async`.** Simplifica el test con `await` directo.
- **Depender únicamente de UI Tests para verificar lógica de negocio.** Prefiere unit tests rápidos de la capa de dominio para eso; reserva UI Tests para flujos críticos completos.
- **No considerar la fragilidad inherente de los UI Tests al diseñar la suite.** Manténlos acotados a lo esencial, dado su mayor costo de mantenimiento.

---
