# Módulo 3: Navegación


## Aprende construyendo

### Tema 1: NavigationStack y NavigationPath

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir navegación SwiftUI desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas navega de lista a detalle, abre hojas de confirmación y puede recuperar una URL profunda.

#### Paso 3 · Teoría, modelo mental y analogía
NavigationStack mantiene una pila tipada; sheets presentan una tarea modal; TabView separa áreas; deep links convierten una URL en estado de navegación. La analogía es una ruta física: hay pasos, desvíos y una dirección que debe poder reconstruirse.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m3
cd ejemplo-ios-m3
swift package init --type executable
swift run
```
Crea una app SwiftUI en Xcode con NavigationStack, ruta DeliveryDetail y una sheet; documenta cada destino y acción.

#### Paso 5 · Práctica guiada
Pista: inserta deliberadamente un destino sin case para provocar un fallo deliberado de navegación; observa el retorno y corrígelo. Resultado esperado: cada ruta llega a una vista válida.

#### Paso 6 · Práctica independiente
Añade deep link, TabView, formulario validado y restauración de ruta al relanzar.

#### Paso 7 · Cierre y evidencia
Guarda mapa de rutas, capturas y URL de prueba; como siguiente paso estudia persistencia. Errores comunes: rutas sin tipo, sheets anidadas, deep links no validados y estado de navegación duplicado. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/navigationstack y https://developer.apple.com/documentation/swiftui.
**¿Por qué es importante?** Porque la navegación es estado y contrato de producto, no solo botones.
**Evidencia de aprendizaje:** entrega rutas, deep link, sheet, fallo y corrección.
**Conceptos clave:** navegación declarada por tipo de dato, manipulable programáticamente.

```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
```

`NavigationStack` gestiona un stack de navegación completo, con `.navigationDestination(for:)` declarando qué vista corresponde a cada tipo de dato que se agregue al stack (aquí, `Tarea`); esto reemplaza el modelo más antiguo de `NavigationView` con `NavigationLink` anidados directamente en cada vista, que requería estructurar la jerarquía de navegación de forma implícita a través de la composición de vistas, dificultando la navegación programática o los flujos complejos que no siguen simplemente el camino natural de taps del usuario.

```swift
path.append(tarea) // navega programáticamente, sin depender de NavigationLink anidados
```

`NavigationPath` (o un array tipado equivalente) permite manipular el stack de navegación completo desde código imperativo: agregar (`append`), quitar (`removeLast`), o resetear completamente el stack (asignando un array vacío), habilitando casos de uso que serían difíciles de expresar con `NavigationLink` puro, como responder a un deep link entrante navegando directamente varios niveles de profundidad de una sola vez, o implementar un flujo de "volver al inicio" desde cualquier punto profundo del stack.

**Analogía:** `NavigationStack` con `NavigationPath` es como un sistema de coordenadas GPS que permite saltar directamente a cualquier punto de una ruta con instrucciones programáticas explícitas, en vez de depender únicamente de seguir letrero por letrero (`NavigationLink`) el camino predefinido de una sola dirección posible.

**¿Por qué es importante?** `NavigationPath` habilita navegación programática y flujos complejos (deep linking, resetear el stack completo) que serían difíciles de expresar con el modelo anterior basado únicamente en `NavigationLink` anidados dentro de cada vista.

**Código del ejemplo:**

```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
path.append(tarea) // push programático
```

### Tema 2: Sheets, full screen covers y TabView

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir navegación SwiftUI desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas navega de lista a detalle, abre hojas de confirmación y puede recuperar una URL profunda.

#### Paso 3 · Teoría, modelo mental y analogía
NavigationStack mantiene una pila tipada; sheets presentan una tarea modal; TabView separa áreas; deep links convierten una URL en estado de navegación. La analogía es una ruta física: hay pasos, desvíos y una dirección que debe poder reconstruirse.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m3
cd ejemplo-ios-m3
swift package init --type executable
swift run
```
Crea una app SwiftUI en Xcode con NavigationStack, ruta DeliveryDetail y una sheet; documenta cada destino y acción.

#### Paso 5 · Práctica guiada
Pista: inserta deliberadamente un destino sin case para provocar un fallo deliberado de navegación; observa el retorno y corrígelo. Resultado esperado: cada ruta llega a una vista válida.

#### Paso 6 · Práctica independiente
Añade deep link, TabView, formulario validado y restauración de ruta al relanzar.

#### Paso 7 · Cierre y evidencia
Guarda mapa de rutas, capturas y URL de prueba; como siguiente paso estudia persistencia. Errores comunes: rutas sin tipo, sheets anidadas, deep links no validados y estado de navegación duplicado. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/navigationstack y https://developer.apple.com/documentation/swiftui.
**¿Por qué es importante?** Porque la navegación es estado y contrato de producto, no solo botones.
**Evidencia de aprendizaje:** entrega rutas, deep link, sheet, fallo y corrección.
**Conceptos clave:** dos niveles de intensidad de presentación modal, cada uno apropiado para un tipo distinto de interrupción.

```swift
.sheet(isPresented: $mostrarFormulario) { FormularioTareaView() }       // modal parcial, dismissible deslizando
.fullScreenCover(isPresented: $mostrarOnboarding) { OnboardingView() } // cubre toda la pantalla, ideal para flujos obligatorios
```

Un `.sheet()` presenta contenido modal parcial (típicamente deslizable hacia abajo para descartar, dejando visible parte del contexto anterior), apropiado para acciones complementarias o formularios que el usuario puede abandonar fácilmente sin perder su contexto de navegación previo; un `.fullScreenCover()` cubre la pantalla completa sin ningún gesto de descarte trivial disponible por defecto, apropiado para flujos que el desarrollador considera deliberadamente obligatorios o que requieren la atención completa del usuario sin distracción del contexto anterior (un onboarding inicial, un flujo de autenticación crítico).

```swift
TabView {
    NavigationStack { InicioView() }.tabItem { Label("Inicio", systemImage: "house") }
    NavigationStack { TareasView() }.tabItem { Label("Tareas", systemImage: "checklist") }
}
```

Anidar un `NavigationStack` independiente dentro de cada pestaña de una `TabView` establece exactamente el mismo patrón de stacks de navegación independientes por sección estudiado en Android (Módulo 3 del track de Android): cada pestaña mantiene su propio historial de navegación, de modo que cambiar de pestaña y regresar preserva el punto exacto donde el usuario quedó en cada una, cumpliendo con la misma expectativa de UX consolidada en apps móviles de ambas plataformas.

**Analogía:** un sheet es como abrir un cajón parcialmente para consultar algo rápido sin perder de vista el resto de la habitación; un full screen cover es como entrar a una sala separada donde la puerta se cierra completamente, apropiada cuando la actividad requiere concentración total sin ninguna distracción del contexto anterior.

**¿Por qué es importante?** Elegir entre sheet y full screen cover comunica al usuario la intensidad esperada de la interrupción (complementaria y descartable vs obligatoria y de atención completa); anidar un `NavigationStack` por pestaña preserva el historial independiente de cada sección, la misma expectativa de UX de Android.

**Diagrama:**

```
TabView
├── Inicio  → NavigationStack propio
└── Tareas  → NavigationStack propio (independiente del de Inicio)
```

### Tema 3: Deep linking y controles de formulario

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir navegación SwiftUI desde cero. Prerrequisitos: macOS, Xcode y Swift. Verifica xcodebuild -version.

#### Paso 2 · Contexto y caso real
En un caso real, una app de entregas navega de lista a detalle, abre hojas de confirmación y puede recuperar una URL profunda.

#### Paso 3 · Teoría, modelo mental y analogía
NavigationStack mantiene una pila tipada; sheets presentan una tarea modal; TabView separa áreas; deep links convierten una URL en estado de navegación. La analogía es una ruta física: hay pasos, desvíos y una dirección que debe poder reconstruirse.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-ios-m3
cd ejemplo-ios-m3
swift package init --type executable
swift run
```
Crea una app SwiftUI en Xcode con NavigationStack, ruta DeliveryDetail y una sheet; documenta cada destino y acción.

#### Paso 5 · Práctica guiada
Pista: inserta deliberadamente un destino sin case para provocar un fallo deliberado de navegación; observa el retorno y corrígelo. Resultado esperado: cada ruta llega a una vista válida.

#### Paso 6 · Práctica independiente
Añade deep link, TabView, formulario validado y restauración de ruta al relanzar.

#### Paso 7 · Cierre y evidencia
Guarda mapa de rutas, capturas y URL de prueba; como siguiente paso estudia persistencia. Errores comunes: rutas sin tipo, sheets anidadas, deep links no validados y estado de navegación duplicado. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/navigationstack y https://developer.apple.com/documentation/swiftui.
**¿Por qué es importante?** Porque la navegación es estado y contrato de producto, no solo botones.
**Evidencia de aprendizaje:** entrega rutas, deep link, sheet, fallo y corrección.
**Conceptos clave:** entrada externa mapeada directamente a un punto específico de navegación.

```swift
.onOpenURL { url in
    if let id = extraerID(de: url) { path.append(Tarea(id: id)) }
}
```

`.onOpenURL` captura una URL entrante (desde una notificación, un link compartido, o un esquema de URL personalizado registrado por la app) y permite reaccionar programáticamente extrayendo la información relevante y navegando directamente al punto correspondiente del `NavigationPath`, el mismo principio de deep linking estudiado en Android (Módulo 3 de ese track) aplicado aquí con las APIs nativas de SwiftUI: una entrada externa lleva al usuario directamente al contenido relevante, en vez de aterrizar en la pantalla principal de la app requiriendo navegación manual adicional.

`Form`, `Picker`, `DatePicker`, `Toggle` y `Slider` son los controles de entrada estándar de SwiftUI para construir formularios completos de forma declarativa, cada uno vinculado a una propiedad de estado mediante un `Binding` (con el prefijo `$`); `.swipeActions()` agrega acciones reveladas mediante gesto de deslizamiento sobre una fila de una lista (eliminar, marcar como completada), y `.onDelete()` habilita el gesto estándar de eliminación por deslizamiento en modo edición de una `List`, ambos patrones de interacción esperados por convención en apps iOS nativas.

**Analogía:** `.onOpenURL` es como un sistema de recepción de correspondencia que lee automáticamente la dirección exacta escrita en cada sobre entrante y lo entrega directamente en la oficina correspondiente del edificio, en vez de dejarlo en la recepción general para que alguien lo redirija manualmente después.

**¿Por qué es importante?** El deep linking mediante `.onOpenURL` lleva al usuario directamente al contenido relevante desde una entrada externa; los controles estándar de formulario y los gestos de swipe/delete cumplen con las convenciones de interacción esperadas en apps iOS nativas.

**Código del ejemplo:**

```swift
.onOpenURL { url in
    if let id = extraerID(de: url) { path.append(Tarea(id: id)) }
}
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con navegación tipo stack, una tab bar y al menos un sheet modal.

**Requisitos previos:** Módulo 2 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Construir un `NavigationStack` de al menos 3 niveles | Ver Tema 1 | Lista → detalle → sub-detalle |
| 2 | Usar `NavigationPath` para navegar programáticamente | Ver Tema 1 | Sin depender solo de `NavigationLink` |
| 3 | Presentar un `.sheet()` y un `.fullScreenCover()` | Ver Tema 2 | Explica cuándo usar cada uno |
| 4 | Construir una `TabView` con 3 pestañas | Ver Tema 2 | Cada una con su propio `NavigationStack` |
| 5 | Configurar `.onOpenURL` para deep linking | Ver Tema 3 | Navega directamente a la pantalla relevante |

**Verificación:** el laboratorio se considera exitoso si navegar profundamente en una pestaña y cambiar a otra mediante la tab bar preserva ese historial al regresar, y si abrir una URL configurada navega directamente a la pantalla correspondiente sin pasos manuales adicionales.

**Errores comunes y soluciones**

- **Usar un full screen cover para una acción complementaria que el usuario debería poder descartar fácilmente.** Prefiere un sheet para ese caso.
- **Compartir un único `NavigationStack` entre todas las pestañas de una `TabView`.** Anida uno independiente por pestaña para preservar el historial de cada una.
- **Olvidar registrar el esquema de URL en el proyecto para que `.onOpenURL` reciba las llamadas.** Configúralo en la configuración del target antes de probar el deep link.

---
