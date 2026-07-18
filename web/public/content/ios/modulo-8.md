# Módulo 8: Arquitectura MVVM

## Sílabo

**Objetivo general**

Organizar una app SwiftUI de tamaño real sin mezclar lógica de negocio con vistas, separando en capas claras (vista, ViewModel, servicios/dominio), inyectando dependencias por inicializador en vez de singletons globales, y reconociendo cuándo MVVM simple deja de ser suficiente.

**Objetivos específicos**

1. Extraer la lógica de una vista "gorda" a un `@Observable` ViewModel.
2. Separar el proyecto en capas: Vistas, ViewModels, Servicios/Repositorios.
3. Inyectar un servicio en el ViewModel a través de su inicializador.
4. Documentar un caso donde MVVM simple no alcanza.

**Contenido**

- ViewModel observable en SwiftUI.
- Separación de capas (vista, dominio, datos).
- Inyección de dependencias en SwiftUI.
- Cuándo MVVM es suficiente y cuándo no.

**Evaluación**

App reestructurada en capas (vista/viewmodel/datos) con dependencias inyectadas, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: De una vista "gorda" a MVVM

**Conceptos clave:** la vista solo describe la UI, el ViewModel orquesta la lógica.

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

Una vista "gorda" que mezcla directamente la lógica de fetching de red, validación y formateo de datos con la descripción de la UI se vuelve progresivamente más difícil de mantener y, crucialmente, imposible de testear de forma aislada sin renderizar la vista completa; extraer esa lógica a un `@Observable` ViewModel (Módulo 2) deja a la vista con la única responsabilidad de describir cómo se ve el estado actual, mientras el ViewModel orquesta toda la lógica de negocio, exactamente el mismo problema y la misma solución arquitectónica estudiada de forma independiente en Android con `ViewModel` (Módulo 4 de ese track) y en React con hooks personalizados (Módulo 3 del track de React): separar "cómo se ve" de "cómo se comporta" es un principio arquitectónico universal en UI declarativa moderna, expresado con herramientas distintas según la plataforma.

**Analogía:** una vista gorda es como un mesero que además de servir la mesa también cocina, factura y gestiona el inventario simultáneamente: funciona en un restaurante muy pequeño, pero se vuelve insostenible a medida que el negocio crece; separar esas responsabilidades en roles distintos (cocina, caja, servicio) es exactamente lo que MVVM logra entre vista y ViewModel.

**¿Por qué es importante?** Separar la lógica de negocio de la vista resuelve el problema concreto de testeabilidad (no se puede testear lógica de negocio sin renderizar toda la UI) y mantenibilidad (una vista con múltiples responsabilidades mezcladas crece de forma difícil de razonar).

**Código del ejemplo:**

```swift
struct TareasView: View {
    @State private var viewModel = TareasViewModel()  // la vista solo describe UI
    var body: some View { List(viewModel.tareas) { /* ... */ } }
}
```

### Tema 2: Capas del proyecto e inyección por inicializador

**Conceptos clave:** límites explícitos de responsabilidad, dependencias sustituibles en tests.

```
Vistas/        ← SwiftUI puro, sin lógica de negocio
ViewModels/     ← @Observable, orquesta llamadas y expone estado
Servicios/      ← networking, persistencia
Dominio/        ← modelos puros (structs/enums)
```

Organizar el proyecto en carpetas que reflejan explícitamente estas responsabilidades (en vez de agrupar archivos únicamente por pantalla o por tipo de archivo sin distinción de capa) hace visible la arquitectura directamente en la estructura del proyecto, facilitando que cualquier desarrollador nuevo entienda rápidamente dónde debería vivir código nuevo según su responsabilidad, y reforzando la disciplina de no mezclar responsabilidades entre capas.

Pasar el servicio en el inicializador del ViewModel (con un valor por defecto apuntando a la implementación real para producción, `ServicioTareasReal()`) en vez de acceder a un singleton global permite sustituir esa dependencia por un fake en tests sin ninguna configuración global adicional, simplemente construyendo el ViewModel con un servicio distinto en el contexto de test; esto es el mismo principio de inyección por constructor estudiado en Spring Boot (Módulo 0 del track de Spring Boot) y en Hilt para Android (Módulo 7 de ese track), evitando el acoplamiento rígido y la dificultad de testeo que introducen los singletons globales accedidos directamente desde cualquier punto del código.

**Analogía:** organizar el proyecto en carpetas por capa es como tener un edificio con señalización clara de qué sucede en cada piso (recepción, oficinas, almacén), en vez de un espacio abierto sin ninguna distinción visual de función; inyectar por inicializador es como entregarle a cada empleado sus herramientas específicas al contratarlo, en vez de que cada uno deba buscar y tomar herramientas de un almacén común compartido sin ningún control sobre cuáles recibe.

**¿Por qué es importante?** La organización explícita en capas hace visible la arquitectura en la estructura del proyecto; la inyección por inicializador permite sustituir dependencias por fakes en tests sin singletons globales difíciles de testear.

**Código del ejemplo:**

```swift
init(servicio: ServicioTareas = ServicioTareasReal()) { self.servicio = servicio }
// En producción: usa el default real
// En tests: TareasViewModel(servicio: ServicioTareasFake())
```

### Tema 3: Cuándo MVVM no alcanza

**Conceptos clave:** MVVM simple funciona bien hasta cierta escala; escalas mayores requieren capas adicionales.

Para apps muy grandes con flujos de navegación complejos y lógica de negocio sustancial compartida entre múltiples ViewModels, equipos suelen agregar una capa explícita de "casos de uso" (use cases) entre el ViewModel y los Servicios, cada caso de uso encapsulando una única operación de negocio bien definida (reutilizable entre distintos ViewModels que necesiten esa misma operación), en vez de duplicar esa lógica directamente dentro de cada ViewModel individual; alternativamente, algunos equipos adoptan TCA (The Composable Architecture), una arquitectura de terceros que estructura el estado y las acciones de la app de forma más explícita y testeable a gran escala, a costa de una curva de aprendizaje y un boilerplate inicial mayor que el MVVM simple estudiado en este módulo.

Reconocer cuándo MVVM simple empieza a quedarse corto (ViewModels que crecen desmesuradamente, lógica de negocio duplicada entre varios ViewModels, dificultad para razonar sobre flujos de estado complejos que involucran múltiples pantallas coordinadas) es una habilidad tan importante como saber implementar MVVM correctamente desde el principio, dado que introducir complejidad arquitectónica adicional antes de necesitarla genuinamente también tiene un costo de mantenimiento que conviene evitar mientras no sea necesario.

**Analogía:** MVVM simple es como la organización adecuada para un restaurante de tamaño mediano con roles claros (cocina, servicio, caja); a medida que el negocio crece hasta convertirse en una cadena con múltiples sucursales, se vuelve necesario agregar capas adicionales de coordinación (una oficina central de operaciones, procesos estandarizados entre sucursales) que serían un exceso de burocracia innecesaria para el restaurante original pequeño.

**¿Por qué es importante?** Reconocer los límites de MVVM simple evita tanto la sub-arquitectura (ViewModels sobrecargados con lógica duplicada) como la sobre-arquitectura (introducir TCA o capas de casos de uso antes de que la complejidad real de la app lo justifique).

**Diagrama:**

```
MVVM simple:        Vista ↔ ViewModel ↔ Servicio
MVVM + casos de uso: Vista ↔ ViewModel ↔ Caso de Uso ↔ Servicio (lógica de negocio reutilizable entre ViewModels)
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

**Objetivo del laboratorio:** reestructurar una app en capas (vista/viewmodel/datos) con dependencias inyectadas.

**Requisitos previos:** Módulo 7 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Extraer lógica de una vista gorda a un ViewModel | Ver Tema 1 | `@Observable`, sin lógica en la vista |
| 2 | Separar el proyecto en carpetas por capa | Ver Tema 2 | Vistas, ViewModels, Servicios, Dominio |
| 3 | Inyectar un servicio por inicializador | Ver Tema 2 | No un singleton global |
| 4 | Documentar un caso donde MVVM no alcanza | Ver Tema 3 | Ej. casos de uso o TCA |

**Verificación:** el laboratorio se considera exitoso si ninguna vista contiene lógica de fetching, validación o formateo directamente en su `body`, y si el ViewModel puede construirse en un test con un servicio fake sin ninguna configuración global adicional.

**Errores comunes y soluciones**

- **Dejar lógica de fetching o validación directamente en el `body` de una vista.** Extráela a un ViewModel dedicado.
- **Acceder a un servicio mediante un singleton global (`ServicioTareas.shared`) en vez de inyectarlo.** Dificulta sustituirlo en tests; inyéctalo por inicializador.
- **Adoptar TCA u otra arquitectura compleja antes de que la app la necesite genuinamente.** Introduce complejidad y boilerplate innecesario prematuramente.

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

- Extraer lógica de negocio de una vista gorda a un `@Observable` ViewModel resuelve problemas de testeabilidad y mantenibilidad.
- Organizar el proyecto en capas explícitas (Vistas, ViewModels, Servicios, Dominio) hace visible la arquitectura en la estructura del código.
- Inyectar dependencias por inicializador (no singletons globales) permite sustituirlas fácilmente por fakes en tests.
- MVVM simple es suficiente hasta cierta escala; apps grandes suelen agregar casos de uso o adoptar arquitecturas como TCA.

**Conceptos aprendidos**

- ViewModel observable en SwiftUI.
- Separación de capas.
- Inyección de dependencias en SwiftUI.
- Cuándo MVVM es suficiente y cuándo no.

**Próximos pasos**

En el Módulo 9 aprenderás a testear lógica y vistas con XCTest y el nuevo framework Swift Testing, incluyendo testing de código async y UI Tests básicos.

**Recursos adicionales**

- Guía de arquitectura de apps de Apple (developer.apple.com/documentation/xcode/architecting-your-app).
