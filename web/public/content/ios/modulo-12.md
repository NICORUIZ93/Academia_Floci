## Arquitectura del proyecto integrador

```
Vistas/         ← SwiftUI puro
ViewModels/      ← @Observable, orquesta servicios (módulo 8)
Servicios/        ← URLSession + async/await (módulo 5)
Persistencia/      ← SwiftData (módulo 6)
Dominio/            ← structs/enums puros (módulo 0)
Tests/                ← Swift Testing sobre la capa de dominio (módulo 9)
```

## Uniendo los módulos del track

Este proyecto integra: modelado de dominio seguro con structs y enums (módulo 0), navegación con NavigationStack y al menos un sheet (módulo 3), concurrencia estructurada con async/await y TaskGroup (módulo 4), persistencia local reactiva con SwiftData (módulo 6), arquitectura MVVM con inyección de dependencias (módulo 8), y tests de la capa de dominio con Swift Testing (módulo 9).

```swift
@Observable
class TareasViewModel {
    var tareas: [Tarea] = []
    private let servicio: ServicioTareas
    private let context: ModelContext

    func sincronizar() async {
        guard let remotas = try? await servicio.obtenerTodas() else { return }
        remotas.forEach { context.insert($0) }
        try? context.save()
    }
}
```

## Cierre del track

Una app iOS "completa" combina lo que Swift y SwiftUI hacen especialmente bien: seguridad de tipos desde el diseño del lenguaje, concurrencia estructurada sin callbacks anidados, y una UI declarativa que se mantiene sincronizada con el estado sin código manual de actualización — el resultado se siente, literalmente, "nativo".
