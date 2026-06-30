## La protocolo View

```swift
struct TarjetaTarea: View {
    let titulo: String
    var body: some View {
        Text(titulo).padding().background(Color.blue.opacity(0.1))
    }
}
```

Cualquier tipo que implemente `View` (con una propiedad computada `body`) puede componerse dentro de otras vistas — el mismo patrón de composición en toda la UI.

## Orden de modificadores

```swift
Text("Hola").padding().background(Color.blue)   // padding queda DENTRO del fondo azul
Text("Hola").background(Color.blue).padding()    // padding queda FUERA, el fondo no lo cubre
```

Cada modificador envuelve la vista anterior en una nueva vista — el orden determina el resultado visual exacto.

## Layout con stacks

```swift
VStack(spacing: 8) {
    HStack { Text("Izquierda"); Spacer(); Text("Derecha") }
    ZStack { Image("fondo"); Text("Superpuesto") }
}
```

## Previews

```swift
#Preview {
    TarjetaTarea(titulo: "Comprar leche")
}
```

Renderiza la vista en el canvas de Xcode sin compilar ni correr la app completa — iteración casi instantánea.
