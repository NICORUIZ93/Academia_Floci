## async/await

```swift
func obtenerUsuario(id: String) async throws -> Usuario {
    try await Task.sleep(for: .seconds(1)) // simula una llamada de red
    return Usuario(id: id, nombre: "Ana")
}
```

```swift
.task { // se cancela automáticamente si la vista desaparece
    do { usuario = try await obtenerUsuario(id: "1") }
    catch { mostrarError(error) }
}
```

## Actors: estado mutable seguro

```swift
actor CacheTareas {
    private var datos: [String: Tarea] = [:]
    func guardar(_ tarea: Tarea) { datos[tarea.id] = tarea }
}
```

El compilador garantiza que el acceso al estado interno de un actor está serializado — dos llamadas concurrentes nunca corrompen `datos` simultáneamente, sin necesidad de locks manuales.

## TaskGroup: concurrencia estructurada

```swift
let (usuario, pedidos) = try await withThrowingTaskGroup(of: Any.self) { group in
    group.addTask { try await obtenerUsuario() }
    group.addTask { try await obtenerPedidos() }
    // recolecta ambos resultados en paralelo
}
```

## @MainActor

```swift
@MainActor
class TareasViewModel: ObservableObject {
    @Published var tareas: [Tarea] = [] // garantizado: solo se modifica desde el hilo principal
}
```
