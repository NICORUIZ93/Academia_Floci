## Null safety real

```kotlin
var nombre: String = "Ana"     // nunca puede ser null
var apodo: String? = null       // explícitamente nullable

apodo?.length                   // safe call: null si apodo es null, sin crashear
apodo!!.length                  // fuerza el acceso — lanza excepción si es null (úsalo con cuidado)
val largo = apodo?.length ?: 0  // operador Elvis: valor por defecto si es null
```

El compilador distingue `String` de `String?` como tipos distintos — no puedes pasar un nullable donde se espera un no-nullable sin manejarlo explícitamente.

## data class

```kotlin
data class Persona(val nombre: String, val edad: Int)

val ana = Persona("Ana", 28)
val anaCumpleanos = ana.copy(edad = 29) // copia inmutable con un campo cambiado
```

Genera automáticamente `equals`, `hashCode`, `toString` y `copy()`.

## Funciones de extensión

```kotlin
fun String.esEmailValido(): Boolean = this.contains("@") && this.contains(".")

"ana@ejemplo.com".esEmailValido() // true
```

## when como expresión

```kotlin
val descripcion = when (edad) {
    in 0..12 -> "niño"
    in 13..17 -> "adolescente"
    else -> "adulto"
}
```
