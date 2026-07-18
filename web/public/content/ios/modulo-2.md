# Módulo 2: Estado y data flow

## Sílabo

**Objetivo general**

Entender qué property wrapper de estado usar en cada caso, dado que SwiftUI reacciona automáticamente a cambios de estado: `@State` para estado propio, `@Binding` para una referencia al estado de otra vista, `@Observable` para estado compartido entre varias vistas, y `@Environment` para inyección de dependencias sin pasarlas manualmente.

**Objetivos específicos**

1. Usar `@State` para un contador local y verificar el redibujado automático.
2. Pasar ese estado a una vista hija con `@Binding`.
3. Crear una clase `@Observable` compartida entre varias vistas.
4. Inyectar una dependencia vía `@Environment`.

**Contenido**

- `@State`, `@Binding`.
- `@Observable` (Observation framework moderno).
- `@Environment` para inyección de dependencias.
- Identidad vs valor en SwiftUI.

**Evaluación**

Formulario con estado compartido entre vistas padre/hijo usando `@Binding`, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: @State y @Binding

**Conceptos clave:** estado propio de una vista vs referencia mutable al estado de otra.

#### Cómo leer `@State`, `@Binding` y el prefijo `$`

En Swift, `@State` y `@Binding` son **property wrappers**, no decoradores genéricos. Un wrapper define cómo se almacena y se accede a una propiedad mediante `wrappedValue`; el compilador reescribe la declaración y sintetiza almacenamiento auxiliar. En `@State private var contador = 0`, leer o asignar `contador` opera sobre el valor envuelto. La expresión `$contador` accede al `projectedValue` que `State` expone: un `Binding<Int>` capaz de leer y escribir el mismo origen de verdad.

`@Binding var valor: Int` no crea almacenamiento ni copia el entero. Declara que la vista necesita recibir dos operaciones coordinadas —lectura y escritura— sobre un valor poseído en otro lugar. Por eso el inicializador espera `Binding<Int>` y se llama con `$contador`, no con `contador`. El error «Cannot convert value of type 'Int' to expected argument type 'Binding<Int>'» indica precisamente que se pasó el valor actual cuando el hijo necesitaba el vínculo proyectado.

**Decisión:** usa `@State` solo para estado transitorio que la vista posee; usa `@Binding` cuando el hijo debe modificar una fuente de verdad externa. No copies datos de dominio en otro `@State` para “sincronizarlos”: aparecerán dos fuentes de verdad que pueden divergir.

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

`@State` declara una propiedad cuyo valor pertenece exclusivamente a esa vista específica, y cuyo cambio dispara automáticamente un redibujado de esa vista (y de cualquier sub-vista que dependa de ese valor); SwiftUI gestiona el almacenamiento persistente de ese valor entre redibujados por su cuenta, un mecanismo conceptualmente equivalente a `remember { mutableStateOf(...) }` en Jetpack Compose (Módulo 2 del track de Android), ambos resolviendo el mismo problema de "preservar estado local entre recomposiciones/redibujados sucesivos" en sus respectivos frameworks de UI declarativa.

`@Binding`, en contraste, no posee el valor sino que mantiene una referencia hacia el estado de otra vista (típicamente el padre, pasado con el prefijo `$` que crea el Binding a partir de un `@State`): modificar `valor` dentro de `BotonContador` efectivamente modifica el `@State` original en `PantallaContador`, exactamente el mismo principio de state hoisting estudiado en Jetpack Compose (Módulo 2 de Android) y en React (Módulo 2 de React), donde un componente hijo recibe el valor y una forma de notificar cambios, sin poseer el estado él mismo.

**Analogía:** `@State` es como el propietario de una casa que decide directamente sobre sus remodelaciones; `@Binding` es como un apoderado con autorización específica para tomar ciertas decisiones sobre esa misma casa en nombre del propietario, sin ser dueño de ella, pero con capacidad real de modificarla efectivamente.

**¿Por qué es importante?** `@State` posee el valor y pertenece exclusivamente a una vista; `@Binding` es una referencia mutable hacia el estado de otra, permitiendo el mismo patrón de state hoisting que existe en otros frameworks de UI declarativa como Jetpack Compose y React.

**Código del ejemplo:**

```swift
struct PantallaContador: View {
    @State private var contador = 0
    var body: some View { BotonContador(valor: $contador) }
}
struct BotonContador: View {
    @Binding var valor: Int
}
```

### Tema 2: @Observable

**Conceptos clave:** redibujado granular basado en la propiedad específica leída, no en el objeto completo.

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

`@Observable` (el framework de Observation moderno de Swift) reemplaza al patrón anterior `ObservableObject` + `@Published`, con una mejora de rendimiento significativa: SwiftUI, con `@Observable`, solo redibuja las vistas que efectivamente leen la propiedad específica que cambió, en vez de redibujar cualquier vista que simplemente observe el objeto completo (el comportamiento del modelo anterior basado en `@Published`, donde cambiar cualquier propiedad publicada notificaba a todos los observadores del objeto entero, sin distinguir si esa vista específica leía o no esa propiedad en particular).

Esta granularidad de redibujado bajo `@Observable` es análoga a la optimización de "skippability" en Jetpack Compose (Módulo 10 del track de Android), donde Compose evita recomponer un composable si sus parámetros efectivamente relevantes no cambiaron, aunque el mecanismo interno de detección sea distinto (Compose analiza parámetros de entrada, `@Observable` rastrea qué propiedades específicas de un objeto observable se leyeron durante el último `body`).

**Analogía:** `@Observable` es como un sistema de notificaciones que avisa únicamente a quienes se suscribieron específicamente a un tema exacto de interés (una propiedad concreta), en vez de notificar a todos los suscriptores de un canal general cada vez que cualquier tema dentro de ese canal cambia, sin importar si les interesa ese tema específico o no.

**¿Por qué es importante?** `@Observable` mejora el rendimiento al redibujar solo las vistas que leen la propiedad específica que cambió, resolviendo la sobre-notificación del modelo anterior `ObservableObject` + `@Published`, que redibujaba cualquier observador del objeto completo sin distinción.

**Código del ejemplo:**

```swift
@Observable
class TareasViewModel {
    var tareas: [Tarea] = []   // solo las vistas que LEEN `tareas` específicamente se redibujan al cambiar
}
```

### Tema 3: @Environment y identidad vs valor

**Conceptos clave:** inyección de dependencias sin pasar manualmente por cada inicializador.

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

`@Environment` inyecta una dependencia disponible para cualquier vista descendiente en el árbol, sin necesidad de pasarla explícitamente a través de cada inicializador intermedio de vistas que no la usan directamente pero que se encuentran en el camino jerárquico hacia una vista descendiente que sí la necesita (un problema conocido como "prop drilling" en otros ecosistemas de UI declarativa, como React, donde Context API resuelve exactamente el mismo problema, Módulo 5 del track de React); esto es especialmente valioso en apps con árboles de vistas profundos, donde pasar una dependencia manualmente por cada nivel intermedio sería tedioso y añadiría acoplamiento innecesario a vistas que no la consumen directamente.

La distinción entre identidad y valor en SwiftUI (relacionada con el `struct` vs `class` del Módulo 0) determina cómo SwiftUI decide si una vista es "la misma" entre dos renderizados sucesivos o una vista completamente nueva: esta decisión afecta directamente si el estado (`@State`) de esa vista se preserva o se reinicia, un mecanismo importante de entender al trabajar con listas donde el orden o la identidad de los elementos puede cambiar dinámicamente.

**Analogía:** `@Environment` es como la electricidad disponible en cualquier toma de corriente de un edificio entero, sin necesidad de tender un cable manual específico desde la planta de generación hasta cada dispositivo individual que la necesita: cualquier habitación puede simplemente "enchufarse" al servicio ya disponible en el ambiente general.

**¿Por qué es importante?** `@Environment` evita el "prop drilling" de pasar una dependencia manualmente por cada inicializador intermedio, un problema resuelto de forma análoga por Context API en React; la identidad de una vista determina si su estado se preserva o se reinicia entre renderizados sucesivos.

**Código del ejemplo:**

```swift
WindowGroup { ContentView().environment(ServicioAPI()) }
// Cualquier vista descendiente puede leer @Environment(ServicioAPI.self) sin pasar por cada nivel intermedio
```

---

## Criterio transversal de calidad del código

Aplica estas decisiones en todos los ejemplos y en tu entrega:

- usa nombres que expresen intención, dominio y unidades; evita `data`, `temp`, `manager` o `process` cuando exista un término preciso;
- mantén funciones, componentes, clases, consultas y módulos cohesionados alrededor de una responsabilidad comprobable;
- haz visibles las dependencias y los efectos de red, tiempo, archivos, estado y base de datos;
- valida entradas en la frontera y representa errores con contexto, sin ocultar la causa ni registrar secretos;
- elimina duplicación de reglas, no toda repetición textual; una abstracción incorrecta cuesta más que dos líneas parecidas;
- escribe primero la solución más simple que satisface el requisito y refactoriza con pruebas verdes;
- aplica SOLID únicamente cuando exista una necesidad real de cambio, extensión, sustitución o aislamiento.

**SOLID con criterio:** responsabilidad única significa una razón coherente de cambio, no una clase por función. Abierto/cerrado justifica estrategias cuando hay variantes reales. Sustitución exige respetar contratos. Segregación evita obligar a consumidores a depender de operaciones que no usan. Inversión de dependencias protege el dominio frente a detalles externos; no exige crear interfaces para cada objeto.

**Comprobación antes de continuar:** ¿otra persona puede entender los nombres y el flujo?, ¿los casos de error son observables?, ¿una prueba demuestra la regla principal?, ¿cada abstracción aporta más claridad de la que cuesta? Registra una decisión de refactorización y una decisión consciente de *no abstraer*.

## Laboratorio práctico

**Objetivo del laboratorio:** construir un formulario con estado compartido entre vistas padre/hijo usando `@Binding`.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Usar `@State` para un contador local | Ver Tema 1 | Verifica el redibujado al cambiarlo |
| 2 | Pasarlo a una vista hija con `@Binding` | Ver Tema 1 | Modificarlo desde el hijo |
| 3 | Crear una clase `@Observable` compartida | Ver Tema 2 | Entre varias vistas |
| 4 | Inyectar un servicio vía `@Environment` | Ver Tema 3 | En vez de pasarlo manualmente |

**Verificación:** el laboratorio se considera exitoso si modificar el valor desde la vista hija (vía `@Binding`) actualiza correctamente el estado en la vista padre, y si el servicio inyectado vía `@Environment` es accesible desde una vista descendiente sin pasar por inicializadores intermedios.

**Errores comunes y soluciones**

- **Usar `@State` en la vista hija en vez de `@Binding` cuando se necesita modificar el estado del padre.** `@State` crea una copia local independiente; usa `@Binding` para una referencia real.
- **Seguir usando `ObservableObject` + `@Published` en código nuevo.** Prefiere `@Observable` para mejor rendimiento de redibujado granular.
- **Pasar una dependencia manualmente por cada inicializador intermedio.** Usa `@Environment` para evitar el prop drilling.

---


## Rúbrica del proyecto

Esta rúbrica evalúa el laboratorio y los ejercicios como evidencia de dominio, no la mera finalización de pasos.

| Criterio | Peso | Evidencia esperada |
|---|---:|---|
| Comprensión conceptual | 20% | Explica el mecanismo, sus límites y por qué la solución funciona. |
| Implementación funcional | 30% | El artefacto satisface requisitos normales, límite y de error. |
| Verificación | 20% | Incluye pruebas, mediciones o inspecciones reproducibles. |
| Diseño y calidad | 15% | Nombres, estructura, seguridad y mantenibilidad son deliberados. |
| Comunicación profesional | 15% | README, decisiones, comandos y resultados permiten repetir el trabajo. |

Se alcanza competencia con 70/100 y sin cero en implementación o verificación. El nivel experto exige comparar alternativas, justificar trade-offs y reconocer condiciones donde la solución dejaría de ser válida.

## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Apple, *Swift Language Guide* y *Apple Developer Documentation*.
- Apple, *Human Interface Guidelines* y documentación de accesibilidad.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `@State` posee el valor y pertenece a una vista; `@Binding` es una referencia mutable al estado de otra, habilitando state hoisting.
- `@Observable` redibuja solo las vistas que leen la propiedad específica que cambió, mejorando el rendimiento frente a `ObservableObject`/`@Published`.
- `@Environment` inyecta dependencias disponibles para cualquier vista descendiente, evitando el prop drilling.
- La identidad de una vista determina si su estado se preserva o se reinicia entre renderizados sucesivos.

**Conceptos aprendidos**

- `@State`, `@Binding`.
- `@Observable`.
- `@Environment`.
- Identidad vs valor en SwiftUI.

**Próximos pasos**

En el Módulo 3 aprenderás a estructurar una app con múltiples pantallas usando `NavigationStack`, sheets, `TabView` y deep linking.

**Recursos adicionales**

- Documentación oficial del framework Observation (developer.apple.com/documentation/observation).
