## URLSession con async/await

```swift
let (datos, respuesta) = try await URLSession.shared.data(from: url)
guard let http = respuesta as? HTTPURLResponse, http.statusCode == 200 else {
    throw ErrorRed.servidor
}
let tareas = try JSONDecoder().decode([Tarea].self, from: datos)
```

## Codable

```swift
struct Tarea: Codable, Identifiable {
    let id: String
    let titulo: String
    let completada: Bool
}
```

El compilador genera automáticamente la conformidad a `Codable` si todas las propiedades también lo son — sin escribir parsing manual de JSON.

## Errores tipados

```swift
enum ErrorRed: Error {
    case sinConexion
    case servidor
    case decodificacion
}
```

## Reintentos y cancelación

```swift
func obtenerConReintentos(intentos: Int = 3) async throws -> [Tarea] {
    for intento in 0..<intentos {
        do { return try await obtenerTareas() }
        catch { if intento == intentos - 1 { throw error } }
        try await Task.sleep(for: .seconds(Double(intento + 1)))
    }
    fatalError("inalcanzable")
}
```

```swift
let tarea = Task { try await obtenerTareas() }
// más tarde, si el usuario cancela:
tarea.cancel()
```
