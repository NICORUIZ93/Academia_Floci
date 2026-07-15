# Módulo 2: Jetpack Compose: UI declarativa

## Sílabo

**Objetivo general**

Aprender a describir la UI moderna de Android como una función pura del estado, el mismo modelo mental que React (Módulo 2 del track de React) o SwiftUI, dominando composables, recomposición y el patrón de state hoisting.

**Objetivos específicos**

1. Crear un composable que reciba datos como parámetros, sin estado interno propio.
2. Usar `remember { mutableStateOf(...) }` para estado local y observar la recomposición.
3. Elevar ese estado al padre (state hoisting).
4. Construir un layout combinando `Row`, `Column`, `Box` y Modifiers.
5. Usar `rememberSaveable` para sobrevivir a una rotación de pantalla.

**Contenido**

- Composables y recomposición.
- State hoisting.
- Modifiers y layout (`Row`, `Column`, `Box`).
- `remember` y `rememberSaveable`.
- `LazyColumn`, `LazyRow` y `LazyVerticalGrid`.
- `Scaffold`, `TopAppBar` y `FloatingActionButton`.

**Evaluación**

Pantalla Compose con estado elevado (state hoisting) correctamente aplicado, más tres ejercicios de evaluación.

---

## Contenido teórico

### Tema 1: Composables y recomposición

**Conceptos clave:** UI como función pura del estado, re-ejecución automática ante cambios.

```kotlin
@Composable
fun TarjetaTarea(titulo: String, completada: Boolean) {
    Text(text = titulo, textDecoration = if (completada) TextDecoration.LineThrough else null)
}
```

Un composable es una función Kotlin anotada con `@Composable` que describe una porción de la UI en términos declarativos: en vez de indicar imperativamente los pasos para mutar vistas existentes (el modelo del sistema de Views clásico de Android, donde se llama `findViewById` y luego se mutan propiedades directamente), un composable simplemente declara "esta es la UI que corresponde a este estado", y Compose se encarga de calcular qué cambió y actualizar la pantalla de forma eficiente. Cuando cualquiera de los parámetros de entrada del composable cambia (`titulo` o `completada` en el ejemplo), Compose vuelve a ejecutar (recompone) la función, produciendo una nueva descripción de la UI que se reconcilia automáticamente contra la anterior.

Este modelo es conceptualmente idéntico al de React (Módulo 2 del track de React), donde un componente funcional también se re-ejecuta cuando cambian sus props o su estado interno, y el framework reconcilia el resultado contra un DOM virtual anterior; la diferencia principal es que Compose reconcilia directamente contra un árbol de UI nativo de Android (no un DOM), pero el principio subyacente ("la UI es una función pura de datos de entrada, y el framework decide eficientemente qué actualizar") es exactamente el mismo, lo que hace que la transición mental entre ambos ecosistemas sea considerablemente más fluida de lo que sería aprender Compose desde cero sin ese paralelo.

**Analogía:** un composable es como una fórmula matemática que siempre produce el mismo resultado dados los mismos valores de entrada: cambiar un valor de entrada obliga a recalcular la fórmula (recomponer), pero la fórmula en sí nunca "recuerda" un estado anterior por su cuenta — todo su comportamiento depende exclusivamente de lo que recibe como parámetro.

**¿Por qué es importante?** Entender que un composable se recompone en respuesta a cambios en sus parámetros de entrada es la base para razonar sobre cuándo y por qué se actualiza la UI, y para diagnosticar recomposiciones innecesarias más adelante (Módulo 10).

**Diagrama:**

```kotlin
@Composable
fun TarjetaTarea(titulo: String, completada: Boolean) {
    Text(text = titulo, textDecoration = if (completada) TextDecoration.LineThrough else null)
}
// cambio en `titulo` o `completada` → Compose recompone TarjetaTarea automáticamente
```

### Tema 2: State hoisting

**Conceptos clave:** el componente hijo no decide, solo refleja lo que recibe.

```kotlin
@Composable
fun CampoTitulo(valor: String, onValorCambia: (String) -> Unit) {
    TextField(value = valor, onValueChange = onValorCambia) // sin estado propio
}

@Composable
fun PantallaCrearTarea() {
    var titulo by remember { mutableStateOf("") } // el estado vive en el padre
    CampoTitulo(valor = titulo, onValorCambia = { titulo = it })
}
```

State hoisting es el patrón de "elevar" el estado desde un componente hijo hacia su padre, de modo que el hijo (`CampoTitulo`) recibe el valor actual como parámetro (`valor`) y una función de callback (`onValorCambia`) para notificar cambios, sin mantener ningún estado mutable propio internamente. Este patrón resuelve un problema concreto de acoplamiento y reutilización: un `CampoTitulo` sin estado propio puede reutilizarse en cualquier contexto (un formulario de creación, uno de edición, un formulario de prueba en un test) simplemente pasándole distintos valores y callbacks, mientras que un `CampoTitulo` que mantuviera su propio `remember { mutableStateOf(...) }` interno estaría acoplado a esa instancia específica y sería mucho más difícil de testear de forma aislada o de sincronizar con lógica externa (por ejemplo, validación en tiempo real gestionada por un ViewModel).

Este mismo principio de "el estado vive arriba, los hijos son funciones puras que reflejan ese estado" es el corazón de UDF (Unidirectional Data Flow), el patrón arquitectónico completo que se estudiará con `StateFlow` en el Módulo 4: state hoisting es, en esencia, UDF aplicado a nivel de composables individuales dentro de una misma pantalla, antes de extenderlo a la relación completa entre ViewModel y UI.

**Analogía:** state hoisting es como un empleado de mostrador (el composable hijo) que no toma ninguna decisión por su cuenta sobre precios o políticas: simplemente muestra la información que le entrega la gerencia (el estado del padre) y transmite cualquier solicitud del cliente de vuelta a la gerencia (el callback), sin guardar ninguna regla de negocio propia en su cabeza.

**¿Por qué es importante?** Elevar el estado hace que el componente hijo sea reutilizable y testeable de forma aislada, y establece el mismo principio de flujo unidireccional que se generalizará a nivel de pantalla completa en el Módulo 4 con `StateFlow`.

**Diagrama:**

```kotlin
@Composable
fun CampoTitulo(valor: String, onValorCambia: (String) -> Unit) {
    TextField(value = valor, onValueChange = onValorCambia) // sin estado propio
}
```

### Tema 3: remember, rememberSaveable y layout básico

**Conceptos clave:** memoria entre recomposiciones vs supervivencia a rotación.

```kotlin
var contador by remember { mutableStateOf(0) }          // se pierde al rotar
var contador by rememberSaveable { mutableStateOf(0) }    // sobrevive a la rotación
```

`remember` conserva un valor entre recomposiciones sucesivas del mismo composable (sin él, cada recomposición reiniciaría la variable a su valor inicial), pero ese valor vive únicamente en la memoria de la instancia actual de la Activity, por lo que se pierde ante una recreación completa como una rotación de pantalla (Módulo 1, Tema 1); `rememberSaveable` extiende ese mismo comportamiento agregando serialización automática a un `Bundle` de estado que sí sobrevive a la recreación por rotación, ofreciendo un nivel de persistencia comparable (aunque más limitado en tamaño y tipos soportados) al que `SavedStateHandle` ofrece a nivel de `ViewModel` (Módulo 1, Tema 3).

Para el layout, Compose ofrece tres contenedores fundamentales que se combinan para construir cualquier estructura visual: `Column` apila elementos verticalmente, `Row` los apila horizontalmente, y `Box` los superpone unos sobre otros; cada uno acepta un `Modifier` que encadena transformaciones (padding, tamaño, peso relativo con `weight`) de forma similar a como se encadenan clases de utilidad en Tailwind CSS (visto en el track de React) o llamadas fluidas en un builder.

**Analogía:** `remember` es como una nota escrita en una pizarra que se borra si la sala se remodela por completo (rotación); `rememberSaveable` es como esa misma nota fotografiada y guardada aparte, de modo que puede volver a escribirse en la pizarra nueva tras la remodelación.

**¿Por qué es importante?** Elegir entre `remember` y `rememberSaveable` según si el estado debe o no sobrevivir a una rotación es una decisión constante en Compose; los tres contenedores de layout (`Column`, `Row`, `Box`) son la base combinable de prácticamente cualquier estructura visual en la app.

**Diagrama:**

```kotlin
Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
    Row { Text("Izquierda"); Spacer(Modifier.weight(1f)); Text("Derecha") }
}
```

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir una pantalla Compose con estado elevado (state hoisting) correctamente aplicado.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Crear `TarjetaTarea(titulo: String)` sin estado interno | Ver Tema 1 | Recibe datos como parámetros |
| 2 | Usar `remember { mutableStateOf(0) }` para un contador local | Ver Tema 3 | Observa la recomposición en cada click |
| 3 | Elevar ese estado al padre | Ver Tema 2 | `value`/`onValueChange` en el hijo |
| 4 | Combinar `Row`, `Column`, `Box` con Modifiers | Ver Tema 3 | `padding`, `fillMaxWidth`, `weight` |
| 5 | Cambiar `remember` por `rememberSaveable` | Ver Tema 3 | Verifica supervivencia a rotación |

**Verificación:** el laboratorio se considera exitoso si el composable hijo no mantiene ningún estado propio (todo llega vía parámetros/callbacks), y si el valor con `rememberSaveable` sobrevive a una rotación de pantalla mientras uno con `remember` simple no lo hace.

**Errores comunes y soluciones**

- **Mantener estado propio dentro de un composable reutilizable.** Elévalo al padre (state hoisting) para mantenerlo reutilizable y testeable.
- **Usar `remember` cuando el valor debe sobrevivir a rotación.** Cambia a `rememberSaveable`.
- **Anidar `Column`/`Row` innecesariamente en vez de usar `weight` y `Modifier` con más precisión.** Simplifica el árbol de layout cuando sea posible.

---

## Ejercicios de evaluación

### Ejercicio 1: Por qué Compose recompone

**Enunciado:** ¿por qué Compose vuelve a ejecutar (recomponer) una función composable, y qué la dispara?

**Solución esperada:** un composable se recompone cuando cambia cualquiera de los valores de los que depende su salida (parámetros de entrada o estado observado como `remember`/`StateFlow`), dado que un composable describe la UI como una función pura de esos valores; Compose vuelve a ejecutar la función para producir la descripción actualizada correspondiente al nuevo estado.

**Criterios de éxito:**
- Explica correctamente que el cambio en parámetros o estado observado dispara la recomposición.

### Ejercicio 2: Qué problema resuelve state hoisting

**Enunciado:** ¿qué problema resuelve elevar el estado (state hoisting) a un componente padre?

**Solución esperada:** hace que el componente hijo sea reutilizable en cualquier contexto (sin depender de una instancia específica de estado interno) y testeable de forma aislada, dado que su comportamiento depende únicamente de los parámetros y callbacks que recibe, sin ningún estado propio oculto.

**Criterios de éxito:**
- Menciona correctamente reutilización y/o testeo aislado como beneficio.

### Ejercicio 3: remember vs rememberSaveable

**Enunciado:** ¿qué diferencia hay entre `remember` y `rememberSaveable` respecto a una rotación de pantalla?

**Solución esperada:** `remember` conserva el valor solo entre recomposiciones dentro de la misma instancia de Activity, perdiéndose ante una rotación (que destruye y recrea la Activity); `rememberSaveable` serializa el valor a un `Bundle` de estado que sí sobrevive a esa recreación, restaurándolo automáticamente.

**Criterios de éxito:**
- Distingue correctamente la supervivencia a rotación como la diferencia clave entre ambos.

---

## Resumen del módulo

**Puntos clave**

- Un composable describe la UI como función pura de sus parámetros de entrada, recomponiéndose cuando estos cambian.
- State hoisting eleva el estado al componente padre, dejando a los hijos como funciones puras reutilizables y testeables.
- `remember` sobrevive solo entre recomposiciones; `rememberSaveable` sobrevive además a una rotación de pantalla.
- `Column`, `Row` y `Box`, combinados con Modifiers, son la base de cualquier estructura de layout en Compose.

**Conceptos aprendidos**

- Composables y recomposición.
- State hoisting.
- Modifiers y layout.
- `remember` y `rememberSaveable`.

**Próximos pasos**

En el Módulo 3 aprenderás a estructurar una app con múltiples pantallas usando Navigation Compose, argumentos tipados y deep links.

**Recursos adicionales**

- Documentación oficial de Jetpack Compose (developer.android.com/jetpack/compose/mental-model).
