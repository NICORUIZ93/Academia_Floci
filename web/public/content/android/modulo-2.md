## Composables y recomposición

```kotlin
@Composable
fun TarjetaTarea(titulo: String, completada: Boolean) {
    Text(text = titulo, textDecoration = if (completada) TextDecoration.LineThrough else null)
}
```

Compose vuelve a ejecutar (recompone) esta función cada vez que sus parámetros cambian — describe la UI como una función pura del estado, similar al modelo de React.

## State hoisting

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

Elevar el estado hace que `CampoTitulo` sea reutilizable y testeable de forma aislada — no decide nada por sí mismo, solo refleja lo que le pasan.

## remember vs rememberSaveable

```kotlin
var contador by remember { mutableStateOf(0) }          // se pierde al rotar
var contador by rememberSaveable { mutableStateOf(0) }    // sobrevive a la rotación
```

## Layout básico

```kotlin
Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
    Row { Text("Izquierda"); Spacer(Modifier.weight(1f)); Text("Derecha") }
}
```
