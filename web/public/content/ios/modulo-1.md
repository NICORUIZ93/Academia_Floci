# Módulo 1: SwiftUI: vistas y layout declarativo


## Aprende construyendo

### Tema 1: El protocolo View y composición

**Conceptos clave:** cualquier tipo que describe su UI mediante `body` es componible en cualquier lugar.

```swift
struct TarjetaTarea: View {
    let titulo: String
    var body: some View {
        Text(titulo).padding().background(Color.blue.opacity(0.1))
    }
}
```

Cualquier tipo que implemente el protocolo `View` (con una propiedad computada `body` que describe su contenido) puede componerse dentro de otra vista exactamente de la misma forma en que se usaría cualquier vista nativa de SwiftUI (`Text`, `Button`), sin ninguna distinción especial de "vista de sistema" frente a "vista propia": este es el mismo principio de composición sobre herencia que rige el ecosistema de componentes de React (Módulo 1 del track de React), donde la unidad fundamental de construcción de UI es un componente que se compone dentro de otros, no una jerarquía de clases heredadas.

`some View` en la firma de retorno de `body` es un tipo opaco: le dice al compilador "este método devuelve algún tipo concreto que conforma a `View`, pero no revelo cuál específicamente", permitiendo que SwiftUI optimice internamente el tipo de retorno exacto (que en la práctica suele ser un tipo genérico anidado muy complejo, compuesto por las vistas internas usadas) sin que el desarrollador tenga que escribir ese tipo explícitamente ni que cambie la interfaz pública de la vista si su implementación interna cambia.

**Analogía:** el protocolo `View` es como un certificado universal que cualquier elemento de construcción puede portar (un ladrillo, un panel prefabricado, una estructura completa ya ensamblada), permitiendo que un arquitecto los combine libremente en un plano mayor sin preocuparse por si cada elemento individual es "básico" o "compuesto" — todos se integran según el mismo estándar.

**¿Por qué es importante?** El protocolo `View` unifica vistas nativas de SwiftUI y vistas propias bajo el mismo mecanismo de composición, permitiendo construir UIs complejas a partir de piezas pequeñas y reutilizables sin ninguna distinción especial entre ellas.

**Código del ejemplo:**

```swift
struct TarjetaTarea: View {
    let titulo: String
    var body: some View {
        Text(titulo).padding().background(Color.blue.opacity(0.1))
    }
}
```

### Tema 2: Orden de modificadores y layout con stacks

**Conceptos clave:** cada modificador envuelve la vista anterior en una nueva vista, el orden determina el resultado.

```swift
Text("Hola").padding().background(Color.blue)   // padding queda DENTRO del fondo azul
Text("Hola").background(Color.blue).padding()    // padding queda FUERA, el fondo no lo cubre
```

Cada modificador en SwiftUI (`.padding()`, `.background()`) no muta la vista original en el sentido imperativo, sino que envuelve la vista anterior produciendo una nueva vista compuesta: `.padding().background(Color.blue)` aplica primero el padding y luego coloca el fondo azul alrededor de ese resultado ya expandido (por lo que el fondo cubre también el espacio del padding), mientras que `.background(Color.blue).padding()` coloca el fondo azul ajustado exactamente al tamaño original del texto, y luego agrega el padding por fuera de ese fondo ya fijado (por lo que el padding queda sin cubrir por el color). Esta diferencia visual, sorprendente para quien no conoce el mecanismo subyacente, se explica completamente entendiendo que cada modificador construye una capa adicional envolviendo la anterior, en el orden exacto en que se escriben.

`VStack`, `HStack` y `ZStack` son los tres contenedores de layout fundamentales: apilan contenido verticalmente, horizontalmente, y superpuesto respectivamente, combinables libremente para construir cualquier estructura visual compleja, de forma directamente análoga a `Column`, `Row` y `Box` en Jetpack Compose (Módulo 2 del track de Android), reflejando que ambos ecosistemas de UI declarativa moderna convergieron hacia el mismo conjunto mínimo de primitivas de layout componibles.

**Analogía:** los modificadores encadenados son como capas sucesivas de envoltorio aplicadas a un regalo: envolver primero con papel y luego meter en una caja produce un resultado distinto (la caja cubre el papel completo) que meter primero en una caja pequeña y luego envolver esa caja con papel (el papel se ajusta solo al tamaño exacto de la caja) — el orden de aplicación cambia físicamente el resultado final.

**¿Por qué es importante?** Entender que cada modificador envuelve la vista anterior en una nueva capa explica por qué el orden cambia el resultado visual, un comportamiento que sorprende a quien no conoce este mecanismo subyacente pero que se vuelve predecible una vez internalizado.

**Código del ejemplo:**

```swift
VStack(spacing: 8) {
    HStack { Text("Izquierda"); Spacer(); Text("Derecha") }
    ZStack { Image("fondo"); Text("Superpuesto") }
}
```

### Tema 3: Previews, LazyVGrid/ScrollView y property wrappers

**Conceptos clave:** iteración casi instantánea sin recompilar la app completa.

```swift
#Preview {
    TarjetaTarea(titulo: "Comprar leche")
}
```

El sistema de Previews de Xcode renderiza una vista directamente en el canvas del editor sin necesidad de compilar y ejecutar la app completa en el simulador o dispositivo, reduciendo drásticamente el ciclo de iteración al diseñar o ajustar una vista específica: un cambio en el código de la vista se refleja casi instantáneamente en el canvas, comparado con el tiempo considerablemente mayor que tomaría recompilar toda la app y navegar manualmente hasta esa pantalla específica en el simulador para verificar el mismo cambio visual.

`LazyVGrid` y `ScrollView` combinados permiten renderizar listas y grillas potencialmente largas de forma eficiente: `LazyVGrid` (el prefijo "lazy" indicando que solo se crean las vistas de las celdas efectivamente visibles, no todas de antemano) organiza contenido en una grilla de columnas configurables dentro de un `ScrollView` que provee el desplazamiento; `didSet`/`willSet` son observadores de propiedad que ejecutan código antes o después de que una propiedad cambie de valor, útiles para reaccionar a cambios de estado fuera del modelo de property wrappers de SwiftUI (`@State`, `@Observable`), y un `@propertyWrapper` personalizado permite encapsular lógica reutilizable de validación o transformación de un valor detrás de una sintaxis de anotación simple, similar en espíritu a los decoradores de otros lenguajes.

**Analogía:** el sistema de Previews es como poder ver el resultado de un ajuste de diseño de interiores en un modelo a escala instantáneo, en vez de tener que construir la habitación completa a tamaño real cada vez que se quiere probar un cambio de disposición de muebles.

**¿Por qué es importante?** El sistema de Previews acelera drásticamente la iteración de diseño de una vista específica, evitando el costo de recompilar y navegar manualmente en la app completa para cada ajuste visual menor.

**Código del ejemplo:**

```swift
#Preview {
    TarjetaTarea(titulo: "Comprar leche")
}
// Renderiza en el canvas de Xcode, sin compilar ni correr la app completa
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una pantalla SwiftUI compuesta a partir de al menos 3 vistas reutilizables propias.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `TarjetaTarea` con un título como parámetro | Ver Tema 1 | Componerla dentro de otra vista |
| 2 | Aplicar dos modificadores en distinto orden | Ver Tema 2 | `.padding().background()` vs inverso |
| 3 | Combinar `VStack`, `HStack` y `ZStack` | Ver Tema 2 | Layout completo |
| 4 | Usar el sistema de Previews | Ver Tema 3 | Iterar sin recompilar toda la app |
| 5 | Extraer una sub-vista reutilizable | Ver Tema 1 | A partir de código repetido en dos pantallas |

**Verificación:** el laboratorio se considera exitoso si la pantalla final está compuesta por al menos 3 vistas propias reutilizables (no un único `body` monolítico), y si el Preview renderiza correctamente sin necesidad de correr la app en el simulador.

**Errores comunes y soluciones**

- **Escribir toda la UI en un único `body` extenso sin extraer sub-vistas.** Dificulta la reutilización y la legibilidad; extrae vistas propias cuando el código se repite o crece demasiado.
- **Confundir el orden de `.padding()`/`.background()` esperando el mismo resultado sin importar el orden.** Recuerda que cada modificador envuelve la vista anterior; el orden importa.
- **Usar `VStack`/`HStack` regulares para listas potencialmente largas.** Prefiere `LazyVGrid`/`ScrollView` con carga perezosa para eficiencia.

---
