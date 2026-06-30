## NavigationStack

```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
```

```swift
path.append(tarea) // navega programáticamente, sin depender de NavigationLink anidados
```

`NavigationPath` permite manipular el stack de navegación (push, pop, pop to root) desde código, útil para deep linking o flujos complejos.

## Sheets y full screen covers

```swift
.sheet(isPresented: $mostrarFormulario) { FormularioTareaView() }       // modal parcial, dismissible deslizando
.fullScreenCover(isPresented: $mostrarOnboarding) { OnboardingView() } // cubre toda la pantalla, ideal para flujos obligatorios
```

## TabView

```swift
TabView {
    NavigationStack { InicioView() }.tabItem { Label("Inicio", systemImage: "house") }
    NavigationStack { TareasView() }.tabItem { Label("Tareas", systemImage: "checklist") }
}
```

## Deep linking

```swift
.onOpenURL { url in
    if let id = extraerID(de: url) { path.append(Tarea(id: id)) }
}
```
