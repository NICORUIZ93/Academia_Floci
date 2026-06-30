## De una vista "gorda" a MVVM

```swift
// Antes: la vista hace fetching, validación y formateo
struct TareasView: View {
    @State private var tareas: [Tarea] = []
    var body: some View {
        List(tareas) { /* ... */ }
            .task { tareas = try? await URLSession.shared... }
    }
}

// Después: la vista solo describe la UI
struct TareasView: View {
    @State private var viewModel = TareasViewModel()
    var body: some View {
        List(viewModel.tareas) { /* ... */ }
            .task { await viewModel.cargar() }
    }
}

@Observable
class TareasViewModel {
    var tareas: [Tarea] = []
    private let servicio: ServicioTareas

    init(servicio: ServicioTareas = ServicioTareasReal()) { self.servicio = servicio }

    func cargar() async {
        tareas = (try? await servicio.obtenerTodas()) ?? []
    }
}
```

## Capas del proyecto

```
Vistas/        ← SwiftUI puro, sin lógica de negocio
ViewModels/     ← @Observable, orquesta llamadas y expone estado
Servicios/      ← networking, persistencia
Dominio/        ← modelos puros (structs/enums)
```

## Inyección por inicializador

Pasar el servicio en el inicializador (con un valor por defecto para producción) permite sustituirlo por un fake en tests, sin singletons globales difíciles de testear.

## Cuándo MVVM no alcanza

Para apps muy grandes con flujos de navegación complejos, equipos suelen agregar una capa de "casos de uso" entre ViewModel y Servicios, o adoptar TCA (The Composable Architecture) para un manejo de estado más estructurado.
