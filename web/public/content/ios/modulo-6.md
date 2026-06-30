## @Model

```swift
@Model
class Tarea {
    var titulo: String
    var completada: Bool
    init(titulo: String, completada: Bool = false) {
        self.titulo = titulo
        self.completada = completada
    }
}
```

```swift
// punto de entrada de la app
WindowGroup { ContentView() }
    .modelContainer(for: Tarea.self)
```

## @Query: observación automática

```swift
struct ListaTareasView: View {
    @Query private var tareas: [Tarea] // se actualiza automáticamente cuando los datos cambian
    var body: some View { List(tareas) { Text($0.titulo) } }
}
```

## Insertar y eliminar

```swift
@Environment(\.modelContext) private var context

context.insert(Tarea(titulo: "Nueva tarea"))
context.delete(tarea)
try? context.save()
```

## SwiftData vs Core Data

SwiftData es una capa moderna sobre el mismo motor de Core Data, con sintaxis declarativa de Swift (macros `@Model`, `@Query`) en vez de `NSManagedObject` y `NSFetchRequest` configurados manualmente. Para proyectos nuevos, SwiftData es la opción recomendada; Core Data directo sigue siendo relevante para apps existentes o casos muy específicos de control fino sobre el stack de persistencia.
