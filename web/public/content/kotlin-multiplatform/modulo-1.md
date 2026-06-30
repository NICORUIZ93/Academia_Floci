## Funciones de orden superior

```kotlin
fun procesarLista(lista: List<Int>, accion: (Int) -> Unit) {
    lista.forEach { accion(it) }
}

procesarLista(listOf(1, 2, 3)) { numero -> println(numero * 2) }
```

## Scope functions

```kotlin
usuario?.let { u -> println("Hola ${u.nombre}") }  // solo ejecuta si usuario no es null

val config = Config().apply {                        // configura y devuelve el mismo objeto
    timeout = 30
    reintentos = 3
}

val resultado = obtenerDatos().run { procesar(this) } // ejecuta un bloque y devuelve su resultado
```

## Sealed classes para estados

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

## Colecciones funcionales

```kotlin
val nombres = personas.filter { it.edad >= 18 }.map { it.nombre }
val total = pedidos.fold(0.0) { acumulado, pedido -> acumulado + pedido.monto }
```
