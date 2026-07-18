# Módulo 4: Concurrencia moderna: async/await

## Sílabo

**Objetivo general**

Reemplazar GCD y callbacks anidados con Swift Concurrency, un modelo de concurrencia estructurado y seguro ante data races, dominando `async`/`await`, actors para aislar estado mutable, `TaskGroup` para concurrencia estructurada, y `@MainActor` para actualizaciones seguras de UI.

**Objetivos específicos**

1. Escribir una función `async` y lanzarla desde una vista con `.task`.
2. Crear un `actor` que encapsule estado mutable compartido.
3. Combinar llamadas asíncronas en paralelo con un `TaskGroup`.
4. Marcar una clase con `@MainActor` y explicar la garantía que ofrece.

**Contenido**

- `async`/`await` y `Task`.
- Actors para aislar estado mutable.
- Structured concurrency (`TaskGroup`).
- `MainActor` y actualización segura de UI.

**Evaluación**

Función `async` que combina dos llamadas de red en paralelo con `TaskGroup`, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: async/await y Task

**Conceptos clave:** código asíncrono que se lee como si fuera síncrono, cancelación automática vinculada al ciclo de vida.

```swift
func obtenerUsuario(id: String) async throws -> Usuario {
    try await Task.sleep(for: .seconds(1)) // simula una llamada de red
    return Usuario(id: id, nombre: "Ana")
}
```

```swift
.task { // se cancela automáticamente si la vista desaparece
    do { usuario = try await obtenerUsuario(id: "1") }
    catch { mostrarError(error) }
}
```

Una función marcada `async` puede suspender su ejecución en un punto de espera (`await`) sin bloquear el hilo que la invoca, y el código que la llama se lee de forma lineal y secuencial exactamente como código síncrono normal, en vez del anidamiento de closures de callback que dominaba el manejo de asincronía en Swift previo a esta característica; este es el mismo principio de "funciones suspendibles que se leen linealmente" compartido con `suspend` en Kotlin (Módulo 2 del track de Kotlin Multiplatform) y con `async`/`await` en JavaScript (Módulo 5 del track de JavaScript), una convergencia entre lenguajes hacia el mismo modelo mental para expresar asincronía de forma legible.

El modificador `.task { }` en una vista SwiftUI lanza una `Task` vinculada automáticamente al ciclo de vida de esa vista específica: si la vista desaparece de la pantalla antes de que la tarea complete, SwiftUI cancela automáticamente esa `Task`, evitando el problema clásico de intentar actualizar el estado de una vista que ya no existe, sin que el desarrollador tenga que gestionar manualmente esa cancelación.

**Analogía:** `async`/`await` es como poder escribir instrucciones de cocina en el orden natural en que ocurren ("hierve el agua, luego agrega la pasta"), en vez de tener que estructurarlas como una cadena de notas de "cuando termines esto, avísame para hacer lo siguiente" (callbacks anidados); `.task` vinculado al ciclo de vida es como cancelar automáticamente un pedido si el cliente que lo hizo ya se retiró del restaurante.

**¿Por qué es importante?** `async`/`await` permite leer código asíncrono de forma lineal, mucho más fácil de razonar que el "callback hell" de versiones anteriores de Swift; `.task` cancela automáticamente su trabajo si la vista desaparece, evitando actualizaciones sobre una vista ya inexistente.

**Código del ejemplo:**

```swift
func obtenerUsuario(id: String) async throws -> Usuario {
    try await Task.sleep(for: .seconds(1))
    return Usuario(id: id, nombre: "Ana")
}
.task { usuario = try await obtenerUsuario(id: "1") }  // cancelado automáticamente si la vista desaparece
```

### Tema 2: Actors para estado mutable seguro

**Conceptos clave:** acceso serializado garantizado por el compilador, sin locks manuales.

```swift
actor CacheTareas {
    private var datos: [String: Tarea] = [:]
    func guardar(_ tarea: Tarea) { datos[tarea.id] = tarea }
}
```

Un `actor` es un tipo de referencia (similar a una `class`) cuyo estado interno mutable está protegido automáticamente por el compilador de Swift contra el acceso concurrente no seguro: dos llamadas concurrentes desde distintas partes del código nunca pueden modificar `datos` simultáneamente de forma que corrompan su estado interno, dado que el compilador serializa automáticamente el acceso al aislamiento del actor, rechazando en tiempo de compilación cualquier intento de acceso directo no seguro desde fuera del actor sin pasar por `await`.

Esta garantía elimina una categoría completa de bugs de concurrencia (data races) sin requerir locks, mutexes o primitivas de sincronización manual explícitas por parte del desarrollador, un enfoque que traslada la responsabilidad de correctitud de concurrencia desde la disciplina manual del programador hacia una verificación automática del compilador, de forma análoga (aunque con mecanismos internos distintos) a `Mutex` en Kotlin Coroutines (Módulo 3 del track de Kotlin Multiplatform), donde también se busca proteger estado mutable compartido de accesos concurrentes inseguros.

**Analogía:** un actor es como una caja fuerte con un único mecanismo de acceso que atiende solicitudes una a la vez en estricto orden de llegada, sin importar cuántas personas intenten acceder simultáneamente: el propio mecanismo (no la disciplina de quienes solicitan acceso) garantiza que nunca dos personas manipulen el contenido al mismo tiempo.

**¿Por qué es importante?** Un actor previene data races (corrupción de estado mutable por acceso concurrente no serializado) que una `class` normal no previene, con la garantía verificada por el compilador en vez de depender de la disciplina manual del desarrollador con locks explícitos.

**Código del ejemplo:**

```swift
actor CacheTareas {
    private var datos: [String: Tarea] = [:]
    func guardar(_ tarea: Tarea) { datos[tarea.id] = tarea }
}
// El compilador exige `await` para acceder desde fuera del actor, serializando el acceso automáticamente
```

### Tema 3: TaskGroup y MainActor

**Conceptos clave:** concurrencia estructurada con recolección de resultados en paralelo, aislamiento garantizado al hilo principal.

```swift
let (usuario, pedidos) = try await withThrowingTaskGroup(of: Any.self) { group in
    group.addTask { try await obtenerUsuario() }
    group.addTask { try await obtenerPedidos() }
    // recolecta ambos resultados en paralelo
}
```

`TaskGroup` (bajo el paraguas de "concurrencia estructurada") lanza múltiples tareas hijas en paralelo dentro de un ámbito bien definido, garantizando que todas ellas completen (o se cancelen) antes de que el bloque del `TaskGroup` retorne, evitando el problema de tareas "huérfanas" que sobreviven más allá del contexto donde fueron creadas, un problema común en modelos de concurrencia no estructurados donde una tarea lanzada podría seguir ejecutándose indefinidamente sin ninguna relación clara con el código que la originó.

```swift
@MainActor
class TareasViewModel: ObservableObject {
    @Published var tareas: [Tarea] = [] // garantizado: solo se modifica desde el hilo principal
}
```

Marcar una clase (o una propiedad específica) con `@MainActor` garantiza, verificado por el compilador, que cualquier acceso a su estado ocurre específicamente en el hilo principal, el único hilo desde el cual es seguro actualizar la UI en UIKit/SwiftUI; esto previene un error extremadamente común en apps con concurrencia (actualizar propiedades observadas por la UI desde un hilo en segundo plano, provocando comportamiento indefinido o crashes intermitentes difíciles de reproducir) al detectarlo en tiempo de compilación en vez de descubrirlo como un bug esporádico en producción.

**Analogía:** un `TaskGroup` es como un supervisor que lanza varios equipos a trabajar en paralelo pero se asegura de que todos hayan terminado (o hayan sido detenidos) antes de dar por cerrado el proyecto completo, sin dejar ningún equipo trabajando sin supervisión después de que el proyecto oficialmente concluyó; `@MainActor` es como una regla de seguridad de fábrica que exige que cierta maquinaria delicada (la UI) solo pueda ser operada por un único operador designado, verificada automáticamente antes de permitir que cualquier otro trabajador intente tocarla.

**¿Por qué es importante?** `TaskGroup` garantiza que las tareas hijas lanzadas en paralelo completen dentro de un ámbito bien definido, evitando tareas huérfanas; `@MainActor` previene, verificado por el compilador, actualizaciones inseguras de UI desde hilos en segundo plano.

**Código del ejemplo:**

```swift
withThrowingTaskGroup(of: Any.self) { group in
    group.addTask { try await obtenerUsuario() }
    group.addTask { try await obtenerPedidos() }
}
// Ambas tareas corren en paralelo, y el bloque no retorna hasta que ambas completen
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

**Objetivo del laboratorio:** construir una función `async` que combina dos llamadas de red en paralelo con `TaskGroup`.

**Requisitos previos:** Módulo 3 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir una función `async` con `Task.sleep` | Ver Tema 1 | Simula una llamada de red |
| 2 | Lanzarla desde una vista con `.task { }` | Ver Tema 1 | Muestra el resultado al llegar |
| 3 | Crear un actor con estado mutable compartido | Ver Tema 2 | Verifica el acceso serializado |
| 4 | Combinar dos llamadas async con `TaskGroup` | Ver Tema 3 | En paralelo, junta ambos resultados |
| 5 | Marcar una clase con `@MainActor` | Ver Tema 3 | Explica la garantía de hilo principal |

**Verificación:** el laboratorio se considera exitoso si las dos llamadas dentro del `TaskGroup` corren efectivamente en paralelo (el tiempo total es aproximadamente el máximo de ambas, no la suma), y si el compilador rechaza cualquier intento de acceso directo no seguro al estado interno del actor desde fuera de él.

**Errores comunes y soluciones**

- **Usar una `class` normal en vez de un `actor` para estado mutable compartido entre tareas concurrentes.** Arriesga data races; usa `actor` para acceso serializado garantizado.
- **Lanzar tareas en secuencia con `await` sucesivos cuando podrían correr en paralelo.** Usa `TaskGroup` para ejecutarlas simultáneamente y reducir el tiempo total.
- **Actualizar el estado de un ViewModel observado por la UI desde un contexto no aislado al hilo principal.** Marca la clase o propiedad con `@MainActor` para prevenir esto en tiempo de compilación.

---



## Bibliografía y fundamento académico

Estas fuentes sustentan los conceptos y deben consultarse para verificar detalles que cambian entre versiones:

- Apple, *Swift Language Guide* y *Apple Developer Documentation*.
- Apple, *Human Interface Guidelines* y documentación de accesibilidad.
- OWASP Foundation, *Mobile Application Security Verification Standard*.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- `async`/`await` permite código asíncrono legible de forma lineal, y `.task` vincula automáticamente la cancelación al ciclo de vida de la vista.
- Un `actor` serializa automáticamente el acceso a su estado interno, previniendo data races sin locks manuales.
- `TaskGroup` ejecuta tareas hijas en paralelo dentro de un ámbito bien definido, garantizando que todas completen antes de retornar.
- `@MainActor` garantiza, verificado por el compilador, que el estado marcado solo se modifica desde el hilo principal.

**Conceptos aprendidos**

- `async`/`await` y `Task`.
- Actors para aislar estado mutable.
- Structured concurrency (`TaskGroup`).
- `MainActor`.

**Próximos pasos**

En el Módulo 5 aprenderás a consumir APIs REST reales con `URLSession`, `Codable` y manejo de errores tipado, construido sobre la concurrencia moderna de este módulo.

**Recursos adicionales**

- Documentación oficial de Swift Concurrency (developer.apple.com/documentation/swift/concurrency).
