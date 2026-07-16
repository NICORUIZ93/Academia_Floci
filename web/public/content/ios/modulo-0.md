# Módulo 0: Fundamentos de Swift

## Sílabo

**Objetivo general**

Dominar los fundamentos de Swift que lo distinguen de la mayoría de los lenguajes mainstream: seguridad ante `nil` incorporada desde el diseño del sistema de tipos, la distinción entre value types y reference types, protocolos con extensiones, y enums con valores asociados como herramienta de modelado de estado.

**Objetivos específicos**

1. Declarar una variable opcional y manejar el caso `nil` explícitamente.
2. Desenvolver un optional de forma segura con `if let`, `guard let` y `??`.
3. Distinguir `struct` (value type) de `class` (reference type) mediante un experimento de copia.
4. Definir un protocolo y hacer que dos tipos distintos lo implementen.
5. Modelar un estado con un enum con valores asociados.

**Contenido**

- Optionals y unwrapping seguro.
- `struct` vs `class`: value types vs reference types.
- Protocolos y extensiones.
- Enums con valores asociados.

**Evaluación**

Modelo de dominio usando structs, enums con valores asociados y sin force-unwrap, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Optionals y unwrapping seguro

**Conceptos clave:** ausencia de valor modelada en el sistema de tipos, no como un valor especial oculto.

```swift
var nombre: String? = nil // explícitamente puede no tener valor

if let nombreDesenvuelto = nombre {
    print(nombreDesenvuelto) // solo accesible aquí dentro, ya seguro
}

let saludo = nombre ?? "Invitado" // nil coalescing: valor por defecto
```

Swift incorpora la ausencia de valor directamente en el sistema de tipos mediante el modificador `?`: `String?` y `String` son tipos formalmente distintos para el compilador, de modo que intentar usar un `String?` donde se espera un `String` sin desenvolverlo primero produce un error de compilación, no un crash en tiempo de ejecución. Esta decisión de diseño previene por completo la categoría de errores conocida en otros lenguajes como `NullPointerException` (Java, estudiado en el Módulo 3 de ese track) o `undefined is not a function` (JavaScript): en Swift, el compilador rechaza el código antes de que pueda ejecutarse, en vez de descubrir el problema en producción cuando un valor inesperadamente ausente causa un fallo.

`if let` desenvuelve el optional de forma segura y condicional (el bloque solo se ejecuta si hay un valor presente); `guard let` desenvuelve de forma temprana con una salida obligatoria en caso de `nil` (apropiado para validaciones al inicio de una función); `??` (nil coalescing) provee un valor por defecto en una única expresión cuando el optional es `nil`. Todas estas son alternativas seguras al "force unwrap" (`nombre!`), que sí puede provocar un crash en tiempo de ejecución si el valor resulta ser `nil`, y que por eso se reserva para casos donde se tiene certeza absoluta (verificada por el propio programador, no por el compilador) de que el valor nunca será `nil` en ese punto específico del código.

**Analogía:** un optional es como una caja que declara explícitamente en su etiqueta si puede estar vacía o no; abrirla con `if let` es revisar con cuidado antes de asumir que contiene algo, mientras que forzar la apertura con `!` es asumir a ciegas que hay contenido, arriesgándose a una sorpresa desagradable si la caja resulta estar vacía.

**¿Por qué es importante?** El sistema de optionals de Swift previene la categoría completa de errores de "acceder a un valor ausente" detectándolos en tiempo de compilación, en vez de dejar que se manifiesten como crashes en producción como ocurre en lenguajes sin este mecanismo incorporado al sistema de tipos.

**Diagrama:**

```swift
var nombre: String? = nil
if let nombreDesenvuelto = nombre { print(nombreDesenvuelto) }
let saludo = nombre ?? "Invitado"
```

### Tema 2: struct vs class

**Conceptos clave:** copia independiente vs instancia compartida.

```swift
struct Punto { var x: Int; var y: Int }     // value type: se copia al asignar
class Contador { var valor = 0 }              // reference type: se comparte la misma instancia

var p1 = Punto(x: 1, y: 1)
var p2 = p1
p2.x = 99 // p1.x sigue siendo 1 — son copias independientes
```

Un `struct` es un value type: cada asignación (`var p2 = p1`) crea una copia completamente independiente, de modo que modificar `p2` nunca afecta a `p1`; una `class` es un reference type: una asignación equivalente simplemente copia una referencia hacia la misma instancia subyacente en memoria, de modo que modificar el objeto a través de cualquiera de las dos variables afecta a ambas por igual, dado que en realidad apuntan al mismo objeto. Esta distinción, poco común como default en otros lenguajes mainstream (donde todo objeto es típicamente reference type salvo tipos primitivos), es una decisión de diseño deliberada de Swift que empuja hacia modelos de datos inmutables y predecibles por defecto (usando `struct` para la mayoría de los modelos de dominio) reservando `class` específicamente para casos donde la identidad compartida y la mutación observada desde múltiples lugares es intencional (como un `ViewModel` observado por varias vistas).

Esta elección tiene consecuencias prácticas directas en el razonamiento sobre el código: un `struct` pasado a una función nunca puede ser mutado inesperadamente por esa función de forma que afecte al llamador (a menos que se declare explícitamente como `inout`), mientras que una `class` pasada de la misma forma sí podría ser mutada por la función receptora, afectando también al llamador original, dado que ambos comparten la misma instancia subyacente.

**Analogía:** un `struct` es como fotocopiar un documento antes de entregarlo: cualquier anotación que el receptor haga en su copia nunca aparece en el original; una `class` es como entregar el documento original directamente: cualquier anotación que el receptor haga sí modifica ese mismo documento que el remitente sigue teniendo en su poder.

**¿Por qué es importante?** Elegir `struct` para un modelo de datos previene mutaciones inesperadas compartidas entre distintas partes del código, mientras que `class` es apropiada cuando la identidad compartida y la observación de mutaciones desde múltiples lugares es exactamente el comportamiento deseado.

**Diagrama:**

```swift
struct Punto { var x: Int; var y: Int }   // value type: copia independiente
class Contador { var valor = 0 }            // reference type: instancia compartida
```

### Tema 3: Protocolos y enums con valores asociados

**Conceptos clave:** contrato de comportamiento compartido entre tipos no relacionados; estado modelado como un conjunto cerrado de casos con datos propios.

```swift
protocol Describible {
    func describir() -> String
}

extension Int: Describible {
    func describir() -> String { "El número es \(self)" }
}
```

Un protocolo declara un contrato de comportamiento (métodos y propiedades requeridas) que cualquier tipo puede adoptar, incluso tipos que Swift ya define de antemano (`Int`, mediante una extensión, sin necesidad de modificar el código fuente original de `Int`); esto habilita un patrón de composición de comportamiento sin depender de jerarquías de herencia rígidas, permitiendo que tipos completamente no relacionados entre sí (un `Int` y un `struct` propio) compartan el mismo contrato `Describible` de forma uniforme.

```swift
enum Resultado {
    case exito(String)
    case error(mensaje: String, codigo: Int)
}

switch resultado {
case .exito(let datos): print(datos)
case .error(let mensaje, let codigo): print("\(mensaje) (\(codigo))")
}
```

Un enum con valores asociados modela un estado como un conjunto cerrado y exhaustivo de casos posibles, cada uno pudiendo llevar consigo datos propios específicos de ese caso (`exito` lleva un `String`, `error` lleva un `mensaje` y un `codigo`); el compilador de Swift verifica la exhaustividad de un `switch` sobre ese enum, obligando a manejar explícitamente todos los casos posibles (o proveer un caso `default` deliberado), lo que hace que agregar un nuevo caso al enum en el futuro genere errores de compilación en cada `switch` existente que no lo contemple, forzando una actualización consciente en vez de un comportamiento silenciosamente incorrecto. Este mismo patrón de "modelado de estado con casos cerrados y verificación de exhaustividad" es análogo a las sealed classes de Kotlin (Módulo 1 del track de Kotlin Multiplatform), aunque con la diferencia de que Swift verifica la exhaustividad de forma nativa e incorporada al lenguaje sin necesidad de configuración adicional.

**Analogía:** un protocolo es como un certificado de competencia que cualquier profesional puede obtener independientemente de su formación original, permitiendo agrupar a profesionales de trasfondos completamente distintos bajo un mismo estándar reconocido de habilidad; un enum con valores asociados es como un formulario con un menú desplegable de opciones fijas, donde cada opción seleccionada revela campos adicionales específicos de esa elección, y el sistema exige completar la sección correspondiente sin importar cuál se haya elegido.

**¿Por qué es importante?** Los protocolos permiten composición de comportamiento entre tipos no relacionados sin depender de herencia rígida; los enums con valores asociados modelan estado de forma exhaustiva y verificada por el compilador, previniendo casos no manejados que pasarían desapercibidos en un modelo menos estricto.

**Diagrama:**

```swift
enum Resultado {
    case exito(String)
    case error(mensaje: String, codigo: Int)
}
// El compilador exige manejar TODOS los casos en un switch, o un default explícito
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir un modelo de dominio usando structs, enums con valores asociados y sin force-unwrap.

**Requisitos previos:** Xcode instalado, conocimientos básicos de programación.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Declarar un optional y usarlo sin desenvolver | Ver Tema 1 | Observa el error del compilador |
| 2 | Desenvolver con `if let`, `guard let` y `??` | Ver Tema 1 | Formas seguras, sin force-unwrap |
| 3 | Crear un `struct` y una `class`, comparar copias | Ver Tema 2 | Value type vs reference type |
| 4 | Definir un protocolo y dos implementaciones | Ver Tema 3 | Tipos no relacionados compartiendo contrato |
| 5 | Modelar un estado con un enum con valores asociados | Ver Tema 3 | `switch` exhaustivo |

**Verificación:** el laboratorio se considera exitoso si el código no contiene ningún force-unwrap (`!`) innecesario, y si el `switch` sobre el enum modelado maneja explícitamente todos los casos posibles sin un `default` genérico que oculte casos no considerados.

**Errores comunes y soluciones**

- **Usar force-unwrap (`!`) por comodidad en vez de `if let`/`guard let`.** Arriesga un crash en producción; resérvalo solo para certeza absoluta verificada manualmente.
- **Usar `class` por defecto para modelos de datos simples.** Prefiere `struct` para prevenir mutaciones compartidas inesperadas.
- **Agregar un `default` genérico a un `switch` sobre un enum propio.** Oculta la falta de manejo explícito de casos nuevos agregados en el futuro.

---

## Ejercicios de evaluación

### Ejercicio 1: Qué previene el sistema de optionals

**Enunciado:** ¿qué problema de `NullPointerException` (o equivalente) previene el sistema de optionals de Swift?

**Solución esperada:** al incorporar la ausencia de valor en el sistema de tipos (`String?` distinto de `String`), el compilador rechaza código que intente usar un optional sin desenvolverlo primero, detectando el problema en tiempo de compilación en vez de descubrirlo como un crash en tiempo de ejecución en producción.

**Criterios de éxito:**
- Explica correctamente la detección en tiempo de compilación como el mecanismo de prevención.

### Ejercicio 2: Cuándo elegir struct sobre class

**Enunciado:** ¿cuándo elegirías `struct` sobre `class` para un modelo de datos?

**Solución esperada:** cuando se quiere que cada asignación cree una copia independiente, previniendo mutaciones inesperadas compartidas entre distintas partes del código; `class` es apropiada en cambio cuando la identidad compartida y la mutación observable desde múltiples lugares es el comportamiento deseado.

**Criterios de éxito:**
- Explica correctamente la copia independiente de `struct` como razón para preferirlo en modelos de datos.

### Ejercicio 3: Ventaja de la verificación de exhaustividad

**Enunciado:** ¿qué ventaja da que el compilador de Swift verifique la exhaustividad de un `switch` sobre un enum con valores asociados?

**Solución esperada:** obliga a manejar explícitamente todos los casos posibles (o proveer un `default` deliberado), de modo que agregar un nuevo caso al enum en el futuro genera errores de compilación en cada `switch` existente que no lo contemple, forzando una actualización consciente en vez de un comportamiento silenciosamente incorrecto.

**Criterios de éxito:**
- Explica correctamente la detección forzada de casos nuevos no manejados como la ventaja.

---

## Resumen del módulo

**Puntos clave**

- Los optionals incorporan la ausencia de valor al sistema de tipos, previniendo errores de acceso a valores ausentes en tiempo de compilación.
- `struct` (value type, copia independiente) se prefiere para modelos de datos; `class` (reference type, instancia compartida) para identidad y mutación compartida intencional.
- Los protocolos permiten composición de comportamiento entre tipos no relacionados, incluso tipos ya definidos por Swift.
- Los enums con valores asociados modelan estado de forma exhaustiva, verificada por el compilador en cada `switch`.

**Conceptos aprendidos**

- Optionals y unwrapping seguro.
- `struct` vs `class`.
- Protocolos y extensiones.
- Enums con valores asociados.

**Próximos pasos**

En el Módulo 1 aprenderás SwiftUI: describir la UI como una función del estado, con la sintaxis declarativa nativa de Apple.

**Recursos adicionales**

- Documentación oficial de Swift (docs.swift.org/swift-book).
