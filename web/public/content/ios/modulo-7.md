## Publishers y Subscribers

```swift
class BuscadorViewModel: ObservableObject {
    @Published var texto = ""
    private var cancelables = Set<AnyCancellable>()

    init() {
        $texto
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .sink { [weak self] valor in self?.buscar(valor) }
            .store(in: &cancelables)
    }
}
```

`$texto` expone un `Publisher` que emite cada vez que la propiedad `@Published` cambia — `debounce` espera a que el usuario deje de escribir antes de disparar la búsqueda.

## combineLatest

```swift
Publishers.CombineLatest($filtro, $orden)
    .sink { filtro, orden in actualizarLista(filtro, orden) }
    .store(in: &cancelables)
```

Se recalcula cuando CUALQUIERA de los dos publishers emite un nuevo valor.

## Combine vs async/await

Para una secuencia única de pasos asíncronos (cargar datos, luego procesar), `async/await` es más simple de leer. Para **streams continuos** de valores en el tiempo (texto de un campo, ubicación GPS actualizándose), Combine sigue siendo el modelo más natural — muchas APIs de Apple (Core Location, NotificationCenter) todavía exponen Publishers nativamente.
