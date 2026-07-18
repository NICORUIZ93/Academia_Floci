# Módulo 5: Networking con URLSession

## Sílabo

**Objetivo general**

Consumir APIs REST reales con `URLSession` sobre `async`/`await`, parsear JSON automáticamente con `Codable`, y manejar errores con tipos propios, incluyendo reintentos y cancelación de tareas en curso.

**Objetivos específicos**

1. Hacer una petición GET con `URLSession.shared.data(from:)` usando `async`/`await`.
2. Definir un `struct Codable` y decodificarlo con `JSONDecoder`.
3. Definir un enum de error propio y lanzar el caso apropiado según el código HTTP.
4. Implementar cancelación de una `Task` en curso.
5. Agregar reintentos con backoff simple.

**Contenido**

- `URLSession` con `async`/`await`.
- `Codable` para parsear JSON.
- Manejo de errores con tipos propios.
- Reintentos y cancelación de tareas.

**Evaluación**

Cliente de red que consume una API real con manejo de errores tipado, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: URLSession con async/await y Codable

**Conceptos clave:** petición de red como función suspendible, parsing generado automáticamente.

```swift
let (datos, respuesta) = try await URLSession.shared.data(from: url)
guard let http = respuesta as? HTTPURLResponse, http.statusCode == 200 else {
    throw ErrorRed.servidor
}
let tareas = try JSONDecoder().decode([Tarea].self, from: datos)
```

`URLSession.shared.data(from:)` con `async`/`await` (Módulo 4) realiza una petición de red completa como una única expresión suspendible, devolviendo tanto los datos crudos como la respuesta HTTP completa (incluyendo el código de estado), permitiendo verificar explícitamente ese código antes de intentar procesar los datos, en vez de asumir optimistamente que la petición tuvo éxito solo porque no lanzó una excepción de red.

```swift
struct Tarea: Codable, Identifiable {
    let id: String
    let titulo: String
    let completada: Bool
}
```

El compilador de Swift genera automáticamente la conformidad completa a `Codable` para cualquier `struct` cuyas propiedades sean todas ellas también `Codable` (los tipos básicos como `String`, `Bool`, `Int` ya lo son de forma nativa), eliminando por completo la necesidad de escribir parsing manual de JSON campo por campo, un contraste marcado con el manejo de JSON en versiones más antiguas de Objective-C/Swift, donde cada campo debía extraerse y convertirse manualmente desde un diccionario genérico no tipado.

**Analogía:** `Codable` es como un traductor automático certificado que convierte fielmente un documento en un formato genérico (JSON) hacia una estructura tipada específica en el idioma de destino, sin que el receptor tenga que traducir manualmente palabra por palabra cada campo del documento original.

**¿Por qué es importante?** `Codable` elimina gran parte del parsing manual de JSON necesario en versiones anteriores de Objective-C/Swift, generando automáticamente la conformidad completa siempre que todas las propiedades del `struct` también sean `Codable`.

**Código del ejemplo:**

```swift
let (datos, respuesta) = try await URLSession.shared.data(from: url)
let tareas = try JSONDecoder().decode([Tarea].self, from: datos)
```

### Tema 2: Errores tipados

**Conceptos clave:** categorías explícitas de fallo, mensajes específicos por caso.

```swift
enum ErrorRed: Error {
    case sinConexion
    case servidor
    case decodificacion
}
```

Modelar los errores de red con un enum propio que conforma al protocolo `Error` (en vez de propagar un `NSError` genérico, el mecanismo de error más antiguo y menos expresivo de Objective-C) permite comunicar exactamente qué categoría de fallo ocurrió mediante el sistema de tipos, y el `switch` sobre ese enum en el punto de manejo del error puede ser verificado exhaustivamente por el compilador (Módulo 0), obligando a considerar cada categoría de fallo posible de forma explícita, en vez de tratar todo error genéricamente con un mensaje único y poco informativo para el usuario o para el desarrollador que depura el problema.

Esta distinción de categorías de error (`sinConexion` frente a `servidor` frente a `decodificacion`) es directamente análoga a distinguir `IOException` de `HttpException` en Android (Módulo 5 del track de Android): ambos casos separan explícitamente "la petición nunca llegó a completarse" de "la petición completó pero con un resultado de error", permitiendo mensajes y estrategias de recuperación específicas para cada categoría.

**Analogía:** un enum de error propio es como un formulario de reporte de incidencias con categorías predefinidas específicas (falla de conexión, error del servidor, dato corrupto), en vez de una única casilla genérica de "algo salió mal" que no ayuda a decidir la acción de seguimiento apropiada para cada tipo distinto de problema.

**¿Por qué es importante?** Modelar errores con un enum propio frente a propagar `NSError` genérico permite un manejo específico y verificado exhaustivamente por el compilador para cada categoría de fallo, comunicando mensajes más útiles y precisos que un error genérico indiferenciado.

**Código del ejemplo:**

```swift
enum ErrorRed: Error {
    case sinConexion
    case servidor
    case decodificacion
}
```

### Tema 3: Reintentos y cancelación

**Conceptos clave:** resiliencia ante fallos transitorios, control explícito del ciclo de vida de una tarea en curso.

```swift
func obtenerConReintentos(intentos: Int = 3) async throws -> [Tarea] {
    for intento in 0..<intentos {
        do { return try await obtenerTareas() }
        catch { if intento == intentos - 1 { throw error } }
        try await Task.sleep(for: .seconds(Double(intento + 1)))
    }
    fatalError("inalcanzable")
}
```

Reintentar una petición ante un fallo transitorio (una interrupción momentánea de red, un timeout ocasional) con una espera creciente entre cada intento (backoff simple: esperar más tiempo en cada reintento sucesivo) mejora la resiliencia de la app frente a problemas de red temporales, sin reintentar indefinidamente ni sobrecargar un servidor que podría estar experimentando dificultades momentáneas, dado que cada reintento espera progresivamente más tiempo antes del siguiente intento.

```swift
let tarea = Task { try await obtenerTareas() }
// más tarde, si el usuario cancela:
tarea.cancel()
```

Cancelar explícitamente una `Task` en curso (por ejemplo, cuando el usuario inicia una nueva búsqueda antes de que la anterior complete) evita procesar y mostrar un resultado obsoleto que ya no corresponde a la intención actual del usuario, un problema conocido como "race condition de UI" donde una respuesta tardía de una petición anterior podría sobrescribir incorrectamente el resultado de una petición más reciente si ambas se procesan sin ningún mecanismo de cancelación explícita.

**Analogía:** reintentar con backoff es como intentar llamar nuevamente a alguien que no contestó, esperando cada vez un poco más entre intento e intento en vez de marcar repetidamente sin pausa, dando oportunidad a que la razón temporal de la falta de respuesta se resuelva por sí sola; cancelar una tarea en curso es como retirar explícitamente un pedido anterior al hacer uno nuevo, evitando que ambos pedidos lleguen fuera de orden y generen confusión sobre cuál es el resultado vigente.

**¿Por qué es importante?** Los reintentos con backoff mejoran la resiliencia ante fallos transitorios de red sin sobrecargar el servidor; cancelar tareas obsoletas evita procesar resultados desactualizados que ya no corresponden a la intención actual del usuario.

**Código del ejemplo:**

```swift
let tarea = Task { try await obtenerTareas() }
tarea.cancel() // evita procesar un resultado que ya no es relevante
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

**Objetivo del laboratorio:** construir un cliente de red que consume una API real con manejo de errores tipado.

**Requisitos previos:** Módulo 4 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Petición GET con `URLSession` + `async`/`await` | Ver Tema 1 | Contra una API pública |
| 2 | Definir un `struct Codable` para la respuesta | Ver Tema 1 | Decodificar con `JSONDecoder` |
| 3 | Definir un enum de error propio | Ver Tema 2 | Según código de estado HTTP |
| 4 | Implementar cancelación de una Task en curso | Ver Tema 3 | Al iniciar una nueva búsqueda |
| 5 | Agregar reintentos con backoff simple | Ver Tema 3 | Ante error transitorio |

**Verificación:** el laboratorio se considera exitoso si la app maneja correctamente cada categoría de error de forma distinta (mostrando un mensaje específico según el caso del enum), y si iniciar una nueva búsqueda cancela correctamente cualquier petición anterior en curso.

**Errores comunes y soluciones**

- **Asumir éxito solo porque la petición no lanzó una excepción de red.** Verifica explícitamente el código de estado HTTP de la respuesta.
- **Propagar un error genérico sin categorías específicas.** Modela un enum de error propio para mensajes y manejo específicos por caso.
- **No cancelar una Task anterior al iniciar una nueva búsqueda.** Arriesga mostrar un resultado obsoleto que llega fuera de orden.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué elimina Codable

**Enunciado:** ¿por qué `Codable` elimina gran parte del parsing manual de JSON que existía antes en Objective-C/Swift clásico?

**Solución esperada:** el compilador genera automáticamente la conformidad completa a `Codable` para cualquier `struct` cuyas propiedades sean todas también `Codable`, sin necesidad de extraer y convertir manualmente cada campo desde un diccionario genérico no tipado como se hacía anteriormente.

**Criterios de éxito:**
- Explica correctamente la generación automática de conformidad como razón de la eliminación del parsing manual.

### Ejercicio 2: Ventaja de un enum de error propio

**Enunciado:** ¿qué ventaja da modelar errores con un enum propio frente a propagar `NSError` genérico?

**Solución esperada:** permite un manejo específico y verificado exhaustivamente por el compilador para cada categoría de fallo (sin conexión, error del servidor, error de decodificación), comunicando mensajes más útiles y precisos que un error genérico indiferenciado.

**Criterios de éxito:**
- Menciona correctamente el manejo específico por categoría verificado por el compilador como la ventaja.

### Ejercicio 3: Por qué cancelar una tarea en curso

**Enunciado:** ¿por qué es importante cancelar una `Task` en curso al iniciar una nueva búsqueda?

**Solución esperada:** evita que una respuesta tardía de la petición anterior sobrescriba incorrectamente el resultado de la petición más reciente, un problema de "race condition de UI" que ocurre si ambas peticiones se procesan sin ningún mecanismo de cancelación explícita.

**Criterios de éxito:**
- Explica correctamente la prevención de resultados obsoletos sobrescribiendo resultados recientes.

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

- `URLSession.shared.data(from:)` con `async`/`await` permite verificar explícitamente el código de estado HTTP antes de procesar la respuesta.
- `Codable` genera automáticamente el parsing de JSON para cualquier `struct` con propiedades también `Codable`.
- Un enum de error propio comunica categorías específicas de fallo, verificadas exhaustivamente por el compilador.
- Reintentos con backoff mejoran la resiliencia ante fallos transitorios; cancelar tareas obsoletas evita resultados desactualizados.

**Conceptos aprendidos**

- `URLSession` con `async`/`await`.
- `Codable`.
- Manejo de errores con tipos propios.
- Reintentos y cancelación de tareas.

**Próximos pasos**

En el Módulo 6 aprenderás a persistir datos localmente con SwiftData, el framework moderno de Apple construido sobre Core Data.

**Recursos adicionales**

- Documentación oficial de URLSession (developer.apple.com/documentation/foundation/urlsession).
