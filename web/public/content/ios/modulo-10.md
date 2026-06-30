## Instruments

Xcode incluye Instruments con plantillas como Time Profiler (qué función consume más CPU), Allocations (uso de memoria) y Core Animation (frames perdidos). Grabar una sesión real revela cuellos de botella que "se siente fluido en el simulador" no revela.

## VoiceOver

```swift
Image(systemName: "trash")
    .accessibilityLabel("Eliminar tarea")
```

Sin `accessibilityLabel`, VoiceOver lee elementos sin texto como "imagen" genérica, inútil para un usuario con discapacidad visual. Navegar tu propia app solo con VoiceOver activado (deslizando, sin mirar la pantalla) expone rápidamente estos huecos.

## Human Interface Guidelines

Apple documenta convenciones esperadas: tamaño mínimo de áreas táctiles (44x44pt), iconografía SF Symbols consistente, patrones de navegación estándar. Seguirlas hace que una app "se sienta nativa" más allá de simplemente usar SwiftUI.

## Dynamic Type y dark mode

```swift
Text("Título").font(.title) // escala automáticamente con la configuración de tamaño de texto del usuario

.preferredColorScheme(.dark) // para previsualizar dark mode explícitamente
```

Probar la app en el tamaño de texto más grande disponible en Ajustes de Accesibilidad revela rápidamente layouts que se rompen con texto largo.
