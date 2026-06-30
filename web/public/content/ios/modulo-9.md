## XCTest clásico

```swift
import XCTest

final class CalculadoraTests: XCTestCase {
    func testSuma() {
        XCTAssertEqual(Calculadora().sumar(2, 3), 5)
    }
}
```

## Swift Testing (el framework moderno)

```swift
import Testing

struct CalculadoraTests {
    @Test func suma() {
        #expect(Calculadora().sumar(2, 3) == 5)
    }
}
```

Sintaxis más concisa (`#expect` en vez de las múltiples variantes de `XCTAssert`), mejor soporte para tests parametrizados y paralelización por defecto.

## Testing de código async

```swift
@Test func obtieneUsuario() async throws {
    let usuario = try await servicio.obtenerUsuario(id: "1")
    #expect(usuario.nombre == "Ana")
}
```

El test simplemente marca la función como `async` — sin necesidad de expectativas manuales (`XCTestExpectation`) como en el modelo basado en callbacks.

## UI Tests

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
