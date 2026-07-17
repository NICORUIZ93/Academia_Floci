// Jetpack Compose: UI declarativa (Módulo 2): estado local con remember/mutableStateOf.
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ContadorScreen() {
  // remember conserva el valor entre recomposiciones (redibujados); sin él, cada
  // recomposición reiniciaría el contador a 0. mutableStateOf hace que Compose
  // observe el valor y vuelva a dibujar automáticamente cuando cambia.
  var contador by remember { mutableStateOf(0) }

  Column(
    modifier = Modifier.padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(8.dp)
  ) {
    Text(text = "Contador: $contador")

    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
      Button(onClick = { contador++ }) {
        Text("+1")
      }
      Button(onClick = { contador = 0 }) {
        Text("Reiniciar")
      }
    }
  }
}

// Modifier.padding/fillMaxWidth/etc. se encadenan de izquierda a derecha, y el
// orden importa: Modifier.padding(8.dp).background(Color.Red) pinta el fondo
// DESPUÉS del padding (el padding queda fuera del área coloreada), mientras que
// Modifier.background(Color.Red).padding(8.dp) pinta primero y el padding queda
// dentro del área coloreada.
