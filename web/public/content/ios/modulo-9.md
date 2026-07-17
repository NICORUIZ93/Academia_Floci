# Módulo 9: Testing en iOS

## Sílabo

**Objetivo general**

Probar lógica y vistas con las herramientas nativas de Xcode: XCTest (el framework clásico) y Swift Testing (el framework moderno), incluyendo testing de código async y UI Tests básicos con XCUITest.

**Objetivos específicos**

1. Escribir un test con XCTest para una función pura de la capa de dominio.
2. Reescribir el mismo test con Swift Testing y comparar la sintaxis.
3. Escribir un test de una función async con `await` dentro del test.
4. Escribir un UI Test básico con XCUITest.

**Contenido**

- XCTest: unit tests clásicos.
- Swift Testing (el nuevo framework de pruebas).
- Testing de código `async`/`await`.
- UI Tests básicos.

**Evaluación**

Suite de tests sobre la capa de dominio usando Swift Testing, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: XCTest clásico y Swift Testing

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

**Diagrama:**

```swift
// XCTest
XCTAssertEqual(Calculadora().sumar(2, 3), 5)

// Swift Testing
#expect(Calculadora().sumar(2, 3) == 5)
```

### Tema 2: Testing de código async

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

**Diagrama:**

```swift
@Test func obtieneUsuario() async throws {
    let usuario = try await servicio.obtenerUsuario(id: "1")
    #expect(usuario.nombre == "Ana")
}
```

### Tema 3: UI Tests con XCUITest

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

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

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

## Ejercicios de evaluación

### Ejercicio 1: Ventaja de legibilidad de Swift Testing

**Enunciado:** ¿qué ventaja de legibilidad ofrece Swift Testing sobre XCTest clásico?

**Solución esperada:** reemplaza las múltiples variantes específicas de `XCTAssert` con una única macro `#expect` que acepta cualquier expresión booleana, y no requiere heredar de `XCTestCase`, resultando en una sintaxis considerablemente más concisa y con mejor soporte nativo para tests parametrizados.

**Criterios de éxito:**
- Menciona correctamente la simplificación de `#expect` frente a las múltiples variantes de `XCTAssert`.

### Ejercicio 2: Por qué un UI Test es más lento y frágil

**Enunciado:** ¿por qué un UI Test es más lento y frágil que un unit test de la capa de dominio?

**Solución esperada:** un UI Test lanza la app real completa y simula interacciones contra la UI efectivamente renderizada, considerablemente más costoso que ejecutar lógica pura en memoria; además es más propenso a fallar por razones ajenas a la lógica bajo prueba, como cambios de layout o timing de animaciones.

**Criterios de éxito:**
- Explica correctamente el costo de lanzar la app real y la fragilidad ante factores ajenos a la lógica como razones.

### Ejercicio 3: Simplificación de testing async

**Enunciado:** ¿qué simplifica marcar una función de test como `async` en Swift Testing, comparado con el modelo anterior basado en `XCTestExpectation`?

**Solución esperada:** permite usar `await` directamente dentro del test de forma lineal, sin necesidad de crear manualmente una expectativa, cumplirla dentro de un callback, y esperarla con un timeout configurado explícitamente, un mecanismo considerablemente más verboso y propenso a errores.

**Criterios de éxito:**
- Explica correctamente la eliminación de expectativas manuales como la simplificación.

---

## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Apple, *Swift Language Guide* y *Apple Developer Documentation*.
- Apple, *Human Interface Guidelines* y documentación de accesibilidad.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Swift Testing ofrece una sintaxis más concisa que XCTest clásico, con `#expect` reemplazando las múltiples variantes de `XCTAssert`.
- Marcar un test como `async` permite usar `await` directamente, sin expectativas manuales como en el modelo basado en callbacks.
- Los UI Tests con XCUITest validan flujos completos end-to-end, pero son más lentos y frágiles que los unit tests de la capa de dominio.
- La pirámide de tests recomienda muchos unit tests rápidos y pocos UI Tests reservados para flujos críticos.

**Conceptos aprendidos**

- XCTest: unit tests clásicos.
- Swift Testing.
- Testing de código `async`/`await`.
- UI Tests básicos.

**Próximos pasos**

En el Módulo 10 aprenderás performance con Instruments, accesibilidad con VoiceOver, y las Human Interface Guidelines que hacen que una app "se sienta" nativa.

**Recursos adicionales**

- Documentación oficial de Swift Testing (developer.apple.com/documentation/testing).
