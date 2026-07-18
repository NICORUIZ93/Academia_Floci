# Módulo 1: Programación funcional en Kotlin

## Sílabo

**Objetivo general**

Tratar las funciones como ciudadanos de primera clase en Kotlin, dominando lambdas, funciones de orden superior, scope functions, sealed classes para modelar estados, y colecciones funcionales.

**Objetivos específicos**

1. Escribir funciones de orden superior que reciban lambdas como parámetros.
2. Usar `let`, `run`, `apply` y `also` apropiadamente según el caso.
3. Modelar estados de UI con sealed classes y `when` exhaustivo.
4. Encadenar `map`/`filter`/`fold` de forma idiomática.

**Contenido**

- Lambdas y funciones de orden superior.
- Scope functions (`let`, `run`, `apply`, `also`).
- Sealed classes para modelar estados.
- Colecciones: map/filter/fold idiomático.

**Evaluación**

Modelo de estado (loading/success/error) con sealed classes manejado exhaustivamente, más tres ejercicios de evaluación.

---

## Aprende construyendo

### Tema 1: Funciones de orden superior

**Conceptos clave:** funciones como parámetros, sintaxis de lambda al final.

`fun procesarLista(lista: List<Int>, accion: (Int) -> Unit) { lista.forEach { accion(it) } }` declara una función de orden superior que recibe otra función como parámetro (`accion`, de tipo `(Int) -> Unit`, indicando que recibe un `Int` y no devuelve nada relevante), permitiendo que quien invoca `procesarLista` proporcione un comportamiento personalizado para aplicar a cada elemento sin que `procesarLista` en sí necesite conocer de antemano qué acción específica se ejecutará: `procesarLista(listOf(1, 2, 3)) { numero -> println(numero * 2) }` demuestra la sintaxis idiomática de Kotlin donde, si el último parámetro de una función es una lambda, puede escribirse fuera de los paréntesis directamente después de la llamada, produciendo una sintaxis que se lee casi como una construcción de lenguaje nativa en vez de una llamada a función ordinaria.

Esta capacidad de tratar funciones como valores de primera clase (que pueden pasarse como argumentos, devolverse como resultados, o almacenarse en variables) es la misma capacidad estudiada de forma más general para JavaScript en el Módulo 4 del track de JavaScript, aquí combinada con el tipado estático de Kotlin: la firma de tipo `(Int) -> Unit` documenta explícitamente, verificado por el compilador, exactamente qué forma debe tener cualquier función pasada como argumento, detectando en tiempo de compilación un error si se intenta pasar una función con una firma incompatible.

**Analogía:** una función de orden superior es como una máquina de procesamiento genérica que acepta una herramienta intercambiable específica para aplicar a cada pieza que pasa por ella, sin que la máquina misma necesite saber de antemano qué herramienta específica se usará, solo que debe encajar en la ranura de conexión esperada (la firma de tipo de la función).

**¿Por qué es importante?** Las funciones de orden superior permiten personalizar comportamiento sin que la función que las recibe conozca de antemano ese comportamiento específico, con el compilador verificando que la firma de la función pasada sea compatible.

**Casos de uso reales:**
- Callbacks `onClick`/`onValueChange` en Jetpack Compose (Módulo 2 del track Android): la función del framework no conoce de antemano qué hará tu app al pulsar un botón.
- Estrategias de reintento configurables al llamar una API: pasar la lógica de backoff como parámetro en vez de repetirla en cada llamada de red.
- Operaciones de colección personalizadas (`ordenarPor { it.campo }`) reutilizando la misma función base con distintos criterios.

**Código del ejemplo:**

```kotlin
fun procesarLista(lista: List<Int>, accion: (Int) -> Unit) {
    lista.forEach { accion(it) }
}
procesarLista(listOf(1, 2, 3)) { numero -> println(numero * 2) }
```

### Tema 2: Scope functions

**Conceptos clave:** `let`, `run`, `apply`, `also` y su propósito específico distinto.

`usuario?.let { u -> println("Hola ${u.nombre}") }` ejecuta el bloque únicamente si `usuario` no es `null` (Módulo 0), combinando el safe call con una scope function para expresar de forma concisa "si existe, hacer algo con ello", evitando un `if` explícito de verificación de null; `val config = Config().apply { timeout = 30; reintentos = 3 }` configura un objeto recién creado y devuelve ese mismo objeto ya configurado como resultado de la expresión completa, apropiado específicamente para inicialización fluida de un objeto en una única expresión; `val resultado = obtenerDatos().run { procesar(this) }` ejecuta un bloque de código en el contexto del objeto receptor y devuelve el resultado de ese bloque (no el objeto original), apropiado cuando se necesita tanto acceso al receptor como transformarlo en un resultado distinto.

`also` (no mostrado explícitamente en los ejemplos anteriores pero parte del mismo conjunto) es similar a `apply` en que devuelve el objeto receptor original, pero recibe ese receptor como parámetro explícito (`it`) en vez de como receptor implícito (`this`), apropiado para efectos secundarios como logging que no deberían modificar el objeto en sí (`objeto.also { println("Creado: $it") }`). La diferencia práctica entre las cuatro se resume en dos ejes: qué devuelven (el objeto receptor original, en `apply`/`also`; el resultado del bloque, en `let`/`run`) y cómo se referencia el receptor dentro del bloque (`this` implícito en `run`/`apply`; `it` explícito en `let`/`also`).

**Analogía:** las scope functions son como distintas formas de interactuar brevemente con un objeto para un propósito específico: `apply` es como personalizar un producto y quedarte con el mismo producto ya personalizado; `run` es como consultar algo sobre el producto y quedarte con la respuesta de esa consulta, no con el producto en sí; `let` es como decidir hacer algo con un objeto solo si efectivamente existe; `also` es como registrar de paso una nota sobre el objeto sin alterarlo en absoluto.

**¿Por qué es importante?** Cada scope function tiene un propósito específico distinto según qué se necesita devolver (el receptor original o el resultado de un bloque) y cómo se referencia el receptor, eligiendo la apropiada según el caso produce código más idiomático y expresivo.

**Casos de uso reales:**
- `apply` para construir objetos de configuración (clientes HTTP, builders de UI) en una sola expresión fluida.
- `let` para ejecutar lógica solo si un valor nullable proveniente de una API o un formulario efectivamente existe.
- `also` para logging o analítica de paso, sin alterar el objeto ni interrumpir una cadena de llamadas.

**Código del ejemplo:**

```kotlin
usuario?.let { u -> println("Hola ${u.nombre}") }  // solo ejecuta si usuario no es null
val config = Config().apply {                        // configura y devuelve el mismo objeto
    timeout = 30
    reintentos = 3
}
val resultado = obtenerDatos().run { procesar(this) } // ejecuta un bloque y devuelve su resultado
```

### Tema 3: Sealed classes y colecciones funcionales

**Conceptos clave:** modelado exhaustivo de estados, transformaciones encadenadas.

`sealed class EstadoUI { object Cargando : EstadoUI(); data class Exito(val datos: List<Tarea>) : EstadoUI(); data class Error(val mensaje: String) : EstadoUI() }` modela el conjunto completo y cerrado de estados posibles de una pantalla (cargando, éxito con datos, o error con un mensaje), de forma directamente análoga a las sealed interfaces de Java (Módulo 7 del track de Java), permitiendo que un `when (estado) { is EstadoUI.Cargando -> ...; is EstadoUI.Exito -> ...; is EstadoUI.Error -> ... }` sea verificado exhaustivamente por el compilador sin necesidad de una rama `else`, garantizando que agregar un nuevo estado posible en el futuro y olvidar manejarlo en algún `when` existente produzca un error de compilación inmediato, no un bug silencioso descubierto más tarde.

`val nombres = personas.filter { it.edad >= 18 }.map { it.nombre }` encadena transformaciones funcionales sobre una colección de forma declarativa (filtrar primero, transformar después), el mismo estilo de encadenamiento de Streams estudiado en el Módulo 4 del track de Java, aquí con sintaxis nativa de Kotlin sin necesidad de una API de streams separada (las colecciones de Kotlin soportan estas operaciones funcionales directamente); `fold` (`pedidos.fold(0.0) { acumulado, pedido -> acumulado + pedido.monto }`) acumula un resultado combinando cada elemento con un valor inicial explícito, apropiado para agregaciones como sumas o construcciones de resultados complejos a partir de una colección completa.

**Analogía:** una sealed class para modelar estados es como un semáforo con exactamente tres estados posibles conocidos de antemano, donde cualquier sistema que reaccione a ese semáforo puede garantizar que maneja los tres estados sin dejar ninguno sin cubrir; encadenar `filter`+`map` es como una línea de producción donde primero se descartan las piezas que no cumplen cierto criterio, y luego se transforman las restantes, cada estación con una responsabilidad clara y secuencial.

**¿Por qué es importante?** Las sealed classes garantizan, verificado por el compilador, que todos los estados posibles de un modelo se manejen exhaustivamente; encadenar operaciones funcionales sobre colecciones expresa transformaciones de datos de forma declarativa y legible.

**Casos de uso reales:**
- Modelar el estado de una pantalla completa (cargando/éxito/error) en apps Android o Compose Multiplatform (Módulo 7).
- Modelar el resultado de validar un formulario (`Valido`, `ErrorCampo(campo, mensaje)`) manejado exhaustivamente en la UI.
- Filtrar y transformar una respuesta de API antes de mostrarla (`response.filter { it.activo }.map { it.toUiModel() }`).

**Código del ejemplo:**

```kotlin
sealed class EstadoUI {
    object Cargando : EstadoUI()
    data class Exito(val datos: List<Tarea>) : EstadoUI()
    data class Error(val mensaje: String) : EstadoUI()
}
when (estado) {
    is EstadoUI.Cargando -> mostrarSpinner()
    is EstadoUI.Exito -> mostrarLista(estado.datos)
    is EstadoUI.Error -> mostrarError(estado.mensaje)
    // sin else: el compilador exige cubrir todos los casos de la sealed class
}
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

**Objetivo del laboratorio:** modelar un estado de UI (loading/success/error) con sealed classes manejado exhaustivamente.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir una función de orden superior | Ver Tema 1 | Recibe una lambda y la aplica a cada elemento |
| 2 | Usar `let` para una variable nullable | Ver Tema 2 | Sin un `if` explícito |
| 3 | Usar `apply` para configurar un objeto | Ver Tema 2 | En una sola expresión |
| 4 | Modelar `EstadoUI` con sealed class | Ver Tema 3 | Maneja todos los casos con `when` exhaustivo |
| 5 | Encadenar `map`/`filter`/`fold` | Ver Tema 3 | En una sola expresión |

**Verificación:** el laboratorio se considera exitoso si el `when` sobre `EstadoUI` compila sin rama `else` y sigue siendo exhaustivo, y si puedes explicar la diferencia práctica entre las cuatro scope functions con un ejemplo propio de cada una.

**Errores comunes y soluciones**

- **Confundir cuándo usar `apply` frente a `run`.** `apply` devuelve el receptor original; `run` devuelve el resultado del bloque.
- **Agregar una rama `else` innecesaria a un `when` exhaustivo sobre sealed class.** Omítela para que el compilador verifique exhaustividad real.
- **Escribir un bucle manual en vez de `map`/`filter`/`fold`.** Prefiere las operaciones funcionales encadenadas para mayor legibilidad declarativa.

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

- JetBrains, documentación oficial de *Kotlin Multiplatform* y Kotlin Coroutines.
- Google, *Android Developers Documentation*; Apple, *Developer Documentation*.
- Kotlin Foundation, especificación y pautas de compatibilidad de Kotlin.
- ACM/IEEE-CS/AAAI, *Computer Science Curricula 2023*.
- IEEE Computer Society, *SWEBOK Guide V4.0*.

## Resumen del módulo

**Puntos clave**

- Las funciones de orden superior reciben otras funciones como parámetros, con la firma de tipo verificada por el compilador.
- Las scope functions (`let`, `run`, `apply`, `also`) se diferencian por qué devuelven y cómo referencian el receptor.
- Las sealed classes garantizan manejo exhaustivo de estados verificado por el compilador.
- Las colecciones de Kotlin soportan operaciones funcionales encadenadas (`map`/`filter`/`fold`) nativamente.

**Conceptos aprendidos**

- Lambdas y funciones de orden superior.
- Scope functions.
- Sealed classes para modelar estados.
- Colecciones funcionales.

**Próximos pasos**

En el Módulo 2 aprenderás coroutines y Flow: `suspend` functions, concurrencia estructurada, y Flow/StateFlow/SharedFlow.

**Recursos adicionales**

- Documentación oficial de Kotlin (kotlinlang.org/docs): "Higher-Order Functions and Lambdas" y "Scope Functions".
