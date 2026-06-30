## @State y @Binding

```swift
struct PantallaContador: View {
    @State private var contador = 0 // estado propio de esta vista
    var body: some View {
        BotonContador(valor: $contador) // $ crea un Binding hacia el estado del padre
    }
}

struct BotonContador: View {
    @Binding var valor: Int // referencia al estado del padre, no una copia
    var body: some View {
        Button("Sumar: \(valor)") { valor += 1 }
    }
}
```

## @Observable (Observation framework)

```swift
@Observable
class TareasViewModel {
    var tareas: [Tarea] = []
}

struct PantallaTareas: View {
    @State private var viewModel = TareasViewModel()
    var body: some View { List(viewModel.tareas) { Text($0.titulo) } }
}
```

`@Observable` (Swift moderno) reemplaza `ObservableObject` + `@Published`, con mejor rendimiento: SwiftUI solo redibuja las vistas que leen específicamente la propiedad que cambió, no toda vista que observa el objeto.

## @Environment

```swift
struct MiApp: App {
    var body: some Scene {
        WindowGroup { ContentView().environment(ServicioAPI()) }
    }
}

struct ContentView: View {
    @Environment(ServicioAPI.self) var servicio // inyectado sin pasar por cada inicializador
}
```
