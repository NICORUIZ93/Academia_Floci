# Módulo 7: Combine y programación reactiva


## Aprende construyendo

### Tema 1: Publishers y Subscribers

**Conceptos clave:** flujo continuo de valores en el tiempo, no una única respuesta puntual.

```swift
class BuscadorViewModel: ObservableObject {
    @Published var texto = ""
    private var cancelables = Set<AnyCancellable>()

    init() {
        $texto
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .sink { [weak self] valor in self?.buscar(valor) }
            .store(in: &cancelables)
    }
}
```

`$texto` (el prefijo `$` sobre una propiedad `@Published`) expone un `Publisher`: un flujo continuo de valores en el tiempo que emite cada vez que la propiedad subyacente cambia, a diferencia de una función `async` que representa una única operación con un resultado final puntual; un `Subscriber` (aquí, el closure dentro de `.sink { }`) se suscribe a ese Publisher para reaccionar a cada emisión, y `.store(in: &cancelables)` retiene esa suscripción activa mientras el `ViewModel` viva, cancelándola automáticamente cuando ese conjunto de cancelables se libera.

Este modelo de "flujo continuo de valores observables" es conceptualmente el mismo que `Flow` en Kotlin (Módulo 2 del track de Kotlin Multiplatform) o los Observables de RxJS/RxJava, todos resolviendo el mismo problema fundamental de modelar secuencias de eventos asíncronos a lo largo del tiempo, con distintas sintaxis y ecosistemas de operadores según el lenguaje.

**Analogía:** un Publisher es como una emisora de radio que transmite continuamente mientras está encendida, y un Subscriber es un receptor sintonizado que reacciona a cada nueva transmisión, en contraste con una llamada telefónica puntual (una función `async`) que produce una única respuesta y luego termina.

**¿Por qué es importante?** Combine modela flujos continuos de valores en el tiempo, un caso de uso distinto al de `async`/`await` (una única operación con resultado final), compartiendo el mismo principio fundamental que `Flow` en Kotlin o RxJS en JavaScript.

**Código del ejemplo:**

```swift
$texto
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .removeDuplicates()
    .sink { valor in buscar(valor) }
```

### Tema 2: Operadores: debounce y combineLatest

**Conceptos clave:** transformación declarativa de un flujo, reacción a múltiples fuentes simultáneas.

`debounce(for:scheduler:)` espera un intervalo de silencio (aquí, 300 milisegundos sin nuevos cambios) antes de emitir el valor más reciente, un patrón extremadamente común para buscadores en tiempo real: evita disparar una búsqueda en cada tecla presionada individualmente, esperando en cambio a que el usuario deje de escribir por un breve instante antes de ejecutar la búsqueda real, el mismo operador `debounceTime` estudiado en RxJS dentro de Angular (Módulo 1 del track de Angular), reflejando que este patrón de "esperar silencio antes de reaccionar" es universal en programación reactiva independientemente del ecosistema.

```swift
Publishers.CombineLatest($filtro, $orden)
    .sink { filtro, orden in actualizarLista(filtro, orden) }
    .store(in: &cancelables)
```

`combineLatest` combina dos (o más) Publishers, re-emitiendo un valor combinado cada vez que **cualquiera** de los Publishers de origen emite un nuevo valor, usando siempre el último valor conocido del otro Publisher que no cambió en ese instante; esto es apropiado cuando una acción depende de múltiples fuentes de estado independientes que pueden cambiar en momentos distintos (un filtro de búsqueda y un criterio de ordenamiento, cada uno modificable independientemente por el usuario), sin necesidad de coordinar manualmente cuál cambió más recientemente.

**Analogía:** `debounce` es como esperar a que alguien termine completamente de hablar antes de responder, en vez de interrumpir después de cada palabra individual; `combineLatest` es como un tablero que se actualiza automáticamente cada vez que cualquiera de dos indicadores independientes cambia, mostrando siempre la combinación más reciente de ambos sin importar cuál se actualizó más recientemente.

**¿Por qué es importante?** `debounce` evita disparar acciones costosas en cada cambio individual, esperando un silencio antes de reaccionar; `combineLatest` reacciona a cambios de múltiples fuentes de estado independientes sin coordinación manual explícita.

**Código del ejemplo:**

```swift
Publishers.CombineLatest($filtro, $orden)
    .sink { filtro, orden in actualizarLista(filtro, orden) }
```

### Tema 3: Combine vs async/await

**Conceptos clave:** una operación puntual frente a un flujo continuo, cada uno con su herramienta apropiada.

Para una secuencia única de pasos asíncronos dependientes entre sí (cargar datos, luego procesar ese resultado, luego mostrar), `async`/`await` (Módulo 4) es considerablemente más simple de leer, dado que se expresa como código lineal secuencial; para streams continuos de valores que ocurren repetidamente a lo largo del tiempo (el texto de un campo cambiando con cada tecla, la ubicación GPS actualizándose periódicamente, notificaciones del sistema), Combine sigue siendo el modelo más natural, dado que estos casos de uso no encajan bien en el modelo de "una única operación con un resultado final" que `async`/`await` representa.

Muchas APIs nativas de Apple (Core Location para actualizaciones de ubicación, `NotificationCenter` para eventos del sistema) todavía exponen Publishers de Combine de forma nativa, por lo que entender Combine sigue siendo necesario incluso en código nuevo que prefiere `async`/`await` para su propia lógica, simplemente para poder integrarse correctamente con esas APIs del sistema que exponen sus eventos de esa forma.

**Analogía:** elegir entre Combine y `async`/`await` es como elegir entre suscribirse a un boletín periódico (Combine, para actualizaciones recurrentes) o hacer un pedido puntual con una fecha de entrega esperada (`async`/`await`, para una operación única con un resultado final): ambos son mecanismos de comunicación asíncrona válidos, apropiados para necesidades distintas.

**¿Por qué es importante?** Muchos equipos prefieren `async`/`await` para código nuevo que representa operaciones puntuales, reservando Combine específicamente para flujos continuos de eventos, y manteniendo el conocimiento de Combine necesario para integrarse con APIs de Apple que todavía exponen Publishers nativamente.

**Diagrama:**

```
async/await  → una operación puntual con resultado final (cargar datos una vez)
Combine      → flujo continuo de valores en el tiempo (texto cambiando, ubicación actualizándose)
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un buscador con debounce implementado con Combine.

**Requisitos previos:** Módulo 6 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Declarar `@Published var texto` y observar con `sink` | Ver Tema 1 | En un `ObservableObject` |
| 2 | Implementar `debounce` sobre los cambios de texto | Ver Tema 2 | Espera silencio antes de buscar |
| 3 | Combinar dos Publishers con `combineLatest` | Ver Tema 2 | Reacciona a cualquiera de los dos |
| 4 | Documentar cuándo seguir usando Combine | Ver Tema 3 | Frente a `async`/`await` |

**Verificación:** el laboratorio se considera exitoso si el buscador no dispara una búsqueda en cada tecla individual (solo tras un breve silencio), y si `combineLatest` reacciona correctamente cuando cualquiera de las dos fuentes combinadas cambia.

**Errores comunes y soluciones**

- **Disparar la búsqueda en cada cambio de texto sin debounce.** Sobrecarga innecesariamente el backend con peticiones excesivas; usa `debounce`.
- **Usar Combine para una secuencia única de pasos asíncronos dependientes.** Prefiere `async`/`await`, más simple de leer para ese caso.
- **Olvidar `.store(in:)` una suscripción de Combine.** La suscripción se cancela inmediatamente al salir de ámbito si no se retiene.

---
